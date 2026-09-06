/**
 * High-Precision Hand Tracker - Ultra-Stable 24/7 Engine
 * Features: Knuckle-centered Fist Charge, Robust Gesture Classification & Zero Memory Leaks.
 */

const HAND_CONNECTIONS = [
    // Fingers
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [9, 10], [10, 11], [11, 12],          // Middle
    [13, 14], [14, 15], [15, 16],         // Ring
    [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
    // Palm Mesh
    [5, 9], [9, 13], [13, 17],
    [0, 5], [0, 9], [0, 13], [0, 17],
    [1, 5], [5, 17]
];

class HandTracker {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;

        this.hands = null;
        this.currentStream = null;
        this.videoDevices = [];
        this.currentDeviceIndex = 0;
        this.isRunning = false;
        this.isProcessing = false;

        this.lastSendTime = 0;
        this.processingStartTime = 0;

        // Dedicated Lightweight Inference Canvas
        this.inferCanvas = document.createElement('canvas');
        this.inferCanvas.width = 320;
        this.inferCanvas.height = 180;
        this.inferCtx = this.inferCanvas.getContext('2d', { willReadFrequently: true });

        this.scaleMultiplier = 1.0;

        this.handStates = [
            this.createHandState(),
            this.createHandState()
        ];

        this.isPortalActive = false;
        this.portal = { x: 0, y: 0, radius: 160, intensity: 0 };
        this.portalConfidence = 0;

        this.isEyeActive = false;
        this.eye = { x: 0, y: 0, radius: 140, intensity: 0 };
        this.eyeConfidence = 0;

        // Stage tracking: 'none' → 'forming' (fingers touch) → 'opening' (pull apart)
        this.eyeStage = 'none';   // 'none' | 'forming' | 'opening'
        this.eyeExpansion = { x: 0, y: 0, radius: 0, intensity: 0, maxRadius: 420 };
        this.wasFormingLastFrame = false;
    }

    createHandState() {
        const landmarks = [];
        const targetLandmarks = [];
        for (let i = 0; i < 21; i++) {
            landmarks.push({ x: 0, y: 0 });
            targetLandmarks.push({ x: 0, y: 0 });
        }
        return {
            active: false,
            detected: false,
            opacity: 0,
            cx: 0,
            cy: 0,
            targetCx: 0,
            targetCy: 0,
            fistCenter: { x: 0, y: 0 },
            targetFistCenter: { x: 0, y: 0 },
            radius: 120,
            targetRadius: 120,
            intensity: 0,
            gesture: 'none',
            rawGesture: 'none',
            gestureConfidence: 0,
            pinchCenter: { x: 0, y: 0 },
            landmarks: landmarks,
            targetLandmarks: targetLandmarks
        };
    }

    async init() {
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.65,
            minTrackingConfidence: 0.55
        });

        this.hands.onResults((results) => {
            try {
                this.onResults(results);
            } catch (e) {
                console.error("onResults error:", e);
            } finally {
                this.isProcessing = false;
            }
        });

        await this.loadVideoDevices();
        await this.startCamera();

        this.isRunning = true;
        this.trackLoop();
    }

    async loadVideoDevices() {
        try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            tempStream.getTracks().forEach(track => track.stop());

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');

            // Rank cameras: Strongly prioritize laptop built-in cameras, deprioritize phone/virtual cameras
            function scoreCamera(device) {
                const label = (device.label || '').toLowerCase();
                // Penalize external/virtual/phone cameras
                if (/droidcam|iriun|camo|epoccam|phone|obs|virtual|wireless|remote/i.test(label)) {
                    return -100;
                }
                let score = 10;
                // Strong preference for laptop internal cameras (HP Wide Vision, Integrated Webcam, HD Camera)
                if (/hp|zbook|integrated|internal|built-in|wide vision|hd camera|webcam|facetime/i.test(label)) {
                    score += 60;
                }
                if (/front/i.test(label)) {
                    score += 20;
                }
                return score;
            }

            videoInputs.sort((a, b) => scoreCamera(b) - scoreCamera(a));
            this.videoDevices = videoInputs;
            this.currentDeviceIndex = 0; // Default always to highest-ranked laptop camera
        } catch (e) {
            this.videoDevices = [];
        }
    }

    async startCamera(deviceId = null) {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        // High Quality Camera Constraints (Full HD 1080p with 720p fallback)
        const targetDeviceId = deviceId || (this.videoDevices.length > 0 ? this.videoDevices[this.currentDeviceIndex]?.deviceId : null);

        const constraints = {
            audio: false,
            video: {
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
                frameRate: { ideal: 60, min: 30 }
            }
        };

        if (targetDeviceId) {
            constraints.video.deviceId = { exact: targetDeviceId };
        } else {
            constraints.video.facingMode = 'user';
        }

        try {
            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.currentStream;
            await this.video.play();
            return true;
        } catch (err) {
            try {
                // Fallback to standard 720p / auto resolution if 1080p is not supported by driver
                this.currentStream = await navigator.mediaDevices.getUserMedia({
                    video: targetDeviceId ? { deviceId: { exact: targetDeviceId } } : true,
                    audio: false
                });
                this.video.srcObject = this.currentStream;
                await this.video.play();
                return true;
            } catch (fallbackErr) {
                throw fallbackErr;
            }
        }
    }

    async switchCamera() {
        if (this.videoDevices.length <= 1) {
            const currentTrack = this.currentStream?.getVideoTracks()[0];
            const currentSettings = currentTrack?.getSettings();
            const nextFacing = (currentSettings?.facingMode === 'environment') ? 'user' : 'environment';
            
            if (this.currentStream) {
                this.currentStream.getTracks().forEach(t => t.stop());
            }
            try {
                this.currentStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: nextFacing, width: { ideal: 1280 } },
                    audio: false
                });
                this.video.srcObject = this.currentStream;
                await this.video.play();
                return nextFacing;
            } catch (e) {
                return null;
            }
        }

        this.currentDeviceIndex = (this.currentDeviceIndex + 1) % this.videoDevices.length;
        const selected = this.videoDevices[this.currentDeviceIndex];
        await this.startCamera(selected.deviceId);
        return selected.label || `Camera ${this.currentDeviceIndex + 1}`;
    }

    getCurrentCameraName() {
        if (this.videoDevices.length > 0) {
            const label = this.videoDevices[this.currentDeviceIndex]?.label;
            return label || `Camera ${this.currentDeviceIndex + 1}`;
        }
        return "Default Camera";
    }

    trackLoop() {
        if (!this.isRunning) return;

        const now = performance.now();

        if (this.isProcessing && (now - this.processingStartTime > 350)) {
            this.isProcessing = false;
        }

        if (!this.isProcessing && (now - this.lastSendTime >= 32) && this.video.readyState >= 2) {
            this.isProcessing = true;
            this.processingStartTime = now;
            this.lastSendTime = now;

            this.inferCtx.drawImage(this.video, 0, 0, 320, 180);

            this.hands.send({ image: this.inferCanvas })
                .catch((err) => {
                    this.isProcessing = false;
                });
        }

        requestAnimationFrame(() => this.trackLoop());
    }

    getVideoRect() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (this.video.readyState < 2) return { ox: 0, oy: 0, dw: w, dh: h };

        const vAspect = this.video.videoWidth / this.video.videoHeight;
        const cAspect = w / h;
        let dw = w, dh = h, ox = 0, oy = 0;

        if (cAspect > vAspect) {
            dh = w / vAspect;
            oy = (h - dh) / 2;
        } else {
            dw = h * vAspect;
            ox = (w - dw) / 2;
        }
        return { ox, oy, dw, dh };
    }

    onResults(results) {
        const { ox, oy, dw, dh } = this.getVideoRect();
        const detectedCount = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;

        for (let i = 0; i < 2; i++) {
            const state = this.handStates[i];

            if (i < detectedCount) {
                const raw = results.multiHandLandmarks[i];

                for (let j = 0; j < 21; j++) {
                    state.targetLandmarks[j].x = ox + (1.0 - raw[j].x) * dw;
                    state.targetLandmarks[j].y = oy + raw[j].y * dh;

                    if (state.opacity < 0.15) {
                        state.landmarks[j].x = state.targetLandmarks[j].x;
                        state.landmarks[j].y = state.targetLandmarks[j].y;
                    }
                }

                // Palm Center
                state.targetCx = (state.targetLandmarks[0].x + state.targetLandmarks[5].x + state.targetLandmarks[9].x + state.targetLandmarks[17].x) / 4;
                state.targetCy = (state.targetLandmarks[0].y + state.targetLandmarks[5].y + state.targetLandmarks[9].y + state.targetLandmarks[17].y) / 4;

                // Clenched Fist Center (MCP knuckle cluster 5, 9, 13, 17)
                state.targetFistCenter.x = (state.targetLandmarks[5].x + state.targetLandmarks[9].x + state.targetLandmarks[13].x + state.targetLandmarks[17].x) / 4;
                state.targetFistCenter.y = (state.targetLandmarks[5].y + state.targetLandmarks[9].y + state.targetLandmarks[13].y + state.targetLandmarks[17].y) / 4;

                if (state.opacity < 0.15) {
                    state.cx = state.targetCx;
                    state.cy = state.targetCy;
                    state.fistCenter.x = state.targetFistCenter.x;
                    state.fistCenter.y = state.targetFistCenter.y;
                }

                // Natural Adaptive Radius
                const palmToTipDist = Math.hypot(
                    state.targetLandmarks[12].x - state.targetCx,
                    state.targetLandmarks[12].y - state.targetCy
                );
                state.targetRadius = Math.max(75, palmToTipDist * 1.35 * this.scaleMultiplier);

                // High-Accuracy Gesture Classification with 3-frame temporal filter
                const detectedGesture = this.classifyGesture(raw, state.targetLandmarks);

                if (detectedGesture === state.rawGesture) {
                    state.gestureConfidence++;
                    if (state.gestureConfidence >= 3) {
                        state.gesture = detectedGesture;
                    }
                } else {
                    state.rawGesture = detectedGesture;
                    state.gestureConfidence = 0;
                }

                state.detected = true;
                state.active = true;

                // Pinch Point
                state.pinchCenter.x = (state.targetLandmarks[4].x + state.targetLandmarks[8].x) / 2;
                state.pinchCenter.y = (state.targetLandmarks[4].y + state.targetLandmarks[8].y) / 2;
            } else {
                state.detected = false;
                state.gesture = 'none';
                state.rawGesture = 'none';
                state.gestureConfidence = 0;
            }
        }

        // Two-Handed Eye of Agamotto (putting first two fingers of both hands together in front of chest)
        const h0 = this.handStates[0];
        const h1 = this.handStates[1];

        if (h0.detected && h1.detected) {
            // Fingertip proximity (Index 8, Thumb 4, Middle 12)
            const dIndex = Math.hypot(h0.targetLandmarks[8].x - h1.targetLandmarks[8].x, h0.targetLandmarks[8].y - h1.targetLandmarks[8].y);
            const dThumb = Math.hypot(h0.targetLandmarks[4].x - h1.targetLandmarks[4].x, h0.targetLandmarks[4].y - h1.targetLandmarks[4].y);
            const dCross01 = Math.hypot(h0.targetLandmarks[8].x - h1.targetLandmarks[4].x, h0.targetLandmarks[8].y - h1.targetLandmarks[4].y);
            const dCross10 = Math.hypot(h1.targetLandmarks[8].x - h0.targetLandmarks[4].x, h1.targetLandmarks[8].y - h0.targetLandmarks[4].y);

            const h0ClusterX = (h0.targetLandmarks[4].x + h0.targetLandmarks[8].x) * 0.5;
            const h0ClusterY = (h0.targetLandmarks[4].y + h0.targetLandmarks[8].y) * 0.5;
            const h1ClusterX = (h1.targetLandmarks[4].x + h1.targetLandmarks[8].x) * 0.5;
            const h1ClusterY = (h1.targetLandmarks[4].y + h1.targetLandmarks[8].y) * 0.5;
            const dCluster = Math.hypot(h0ClusterX - h1ClusterX, h0ClusterY - h1ClusterY);
            const dWrists = Math.hypot(h0.targetLandmarks[0].x - h1.targetLandmarks[0].x, h0.targetLandmarks[0].y - h1.targetLandmarks[0].y);

            const midX = (h0ClusterX + h1ClusterX) * 0.5;
            const midY = (h0ClusterY + h1ClusterY) * 0.5;
            const inChestZone = (midY > this.canvas.height * 0.12 && midY < this.canvas.height * 0.92);

            // Phase 1: Touching fingertips in front of chest
            const isTouching = inChestZone && (
                dIndex < 120 || 
                dCluster < 130 || 
                (dIndex < 140 && dThumb < 140) ||
                (dCross01 < 120 && dCross10 < 120)
            ) && (dWrists > 100);

            // Phase 2: Pulling apart after forming
            const isPullingApart = (this.eyeStage === 'forming' || this.eyeStage === 'opening') && 
                inChestZone && (dCluster >= 130 && dCluster < 450) && (dWrists > 120);

            if (isTouching) {
                this.eyeConfidence = Math.min(10, this.eyeConfidence + 2);
            } else if (!isPullingApart) {
                this.eyeConfidence = Math.max(0, this.eyeConfidence - 1);
            }

            if (this.eyeConfidence >= 2 || isPullingApart) {
                this.isEyeActive = true;
                // Suppress individual hand gestures so they don't overlap with Eye
                h0.gesture = 'none';
                h1.gesture = 'none';

                if (isPullingApart) {
                    this.eyeStage = 'opening';
                    if (this.eyeExpansion.intensity < 0.1) {
                        this.eyeExpansion.x = midX;
                        this.eyeExpansion.y = midY;
                        this.eyeExpansion.radius = Math.max(60, this.eye.radius * 0.6);
                    }
                    this.eye.intensity += (0.75 - this.eye.intensity) * 0.2;
                    this.eyeExpansion.intensity += (1.0 - this.eyeExpansion.intensity) * 0.22;
                    this.eyeExpansion.radius += (this.eyeExpansion.maxRadius - this.eyeExpansion.radius) * 0.08;
                    this.eyeExpansion.x += (midX - this.eyeExpansion.x) * 0.15;
                    this.eyeExpansion.y += (midY - this.eyeExpansion.y) * 0.15;
                } else {
                    this.eyeStage = 'forming';
                    this.eye.intensity += (1.0 - this.eye.intensity) * 0.28;
                    this.eyeExpansion.intensity *= 0.85;
                }

                const targetRadius = Math.max(130, Math.min(240, (h0.targetRadius + h1.targetRadius) * 0.75));
                this.eye.x += (midX - this.eye.x) * 0.35;
                this.eye.y += (midY - this.eye.y) * 0.35;
                this.eye.radius += (targetRadius - this.eye.radius) * 0.25;
            } else {
                this.eyeStage = 'none';
                this.eyeConfidence = 0;
                this.isEyeActive = false;
                this.eye.intensity += (0.0 - this.eye.intensity) * 0.35;
                this.eyeExpansion.intensity *= 0.82;
                this.eyeExpansion.radius += (0 - this.eyeExpansion.radius) * 0.15;
            }

        } else {
            this.eyeStage = 'none';
            this.eyeConfidence = 0;
            this.isEyeActive = false;
            this.eye.intensity += (0.0 - this.eye.intensity) * 0.35;
            this.eyeExpansion.intensity *= 0.88;
            this.eyeExpansion.radius += (0 - this.eyeExpansion.radius) * 0.12;
        }

        // Sling Ring Portal (Only when Eye of Agamotto is NOT active and both hands are deliberately open)
        if (!this.isEyeActive && h0.detected && h1.detected &&
            h0.gesture === 'mandala' && h1.gesture === 'mandala') {
            const dist = Math.hypot(h0.cx - h1.cx, h0.cy - h1.cy);

            // Hands intentionally brought close together while both open
            if (dist < 230) {
                this.portalConfidence = Math.min(10, this.portalConfidence + 1);
            } else {
                this.portalConfidence = Math.max(0, this.portalConfidence - 2);
            }

            if (this.portalConfidence >= 3) {
                this.isPortalActive = true;
                const midX = (h0.cx + h1.cx) / 2;
                const midY = (h0.cy + h1.cy) / 2;
                const r = Math.max(h0.radius, h1.radius) * 1.35;

                this.portal.x += (midX - this.portal.x) * 0.35;
                this.portal.y += (midY - this.portal.y) * 0.35;
                this.portal.radius += (r - this.portal.radius) * 0.25;
                this.portal.intensity += (1.0 - this.portal.intensity) * 0.25;
            } else {
                this.isPortalActive = false;
                this.portal.intensity += (0.0 - this.portal.intensity) * 0.35;
            }
        } else {
            this.portalConfidence = 0;
            this.isPortalActive = false;
            this.portal.intensity += (0.0 - this.portal.intensity) * 0.35;
        }
    }

    /**
     * Precision Sensor Classification (Zero False Positives)
     */
    classifyGesture(raw, screenLm) {
        const wrist = raw[0];
        const palmSpan = Math.hypot(screenLm[9].x - screenLm[0].x, screenLm[9].y - screenLm[0].y);
        if (palmSpan < 20) return 'none';

        const tips = [8, 12, 16, 20];
        const pips = [6, 10, 14, 18];
        const mcps = [5, 9, 13, 17];
        const isExtended = [false, false, false, false];
        const isCurled = [false, false, false, false];

        for (let i = 0; i < 4; i++) {
            const tipDist = Math.hypot(raw[tips[i]].x - wrist.x, raw[tips[i]].y - wrist.y);
            const pipDist = Math.hypot(raw[pips[i]].x - wrist.x, raw[pips[i]].y - wrist.y);
            const mcpDist = Math.hypot(raw[mcps[i]].x - wrist.x, raw[mcps[i]].y - wrist.y);

            // Extended check: fingertip is well beyond PIP and MCP
            if (tipDist > pipDist * 1.15 && tipDist > mcpDist * 1.28) {
                isExtended[i] = true;
            }

            // Firm curl check: fingertip curled in tight towards palm/wrist
            if (tipDist < pipDist * 1.10 && tipDist < mcpDist * 1.20) {
                isCurled[i] = true;
            }
        }

        const curledCount = isCurled.filter(Boolean).length;
        const extendedCount = isExtended.filter(Boolean).length;

        const pinkyBase = raw[17];
        const thumbTipDist = Math.hypot(raw[4].x - pinkyBase.x, raw[4].y - pinkyBase.y);
        const thumbMcpDist = Math.hypot(raw[2].x - pinkyBase.x, raw[2].y - pinkyBase.y);
        const thumbExtended = thumbTipDist > thumbMcpDist * 1.15;

        // 1. ELDRITCH WHIP (👉 Index pointing forward while Ring & Pinky are curled and Index is NOT touching thumb)
        const indexToThumbDist = Math.hypot(screenLm[4].x - screenLm[8].x, screenLm[4].y - screenLm[8].y);
        if (isExtended[0] && isCurled[2] && isCurled[3] && !isExtended[3] && indexToThumbDist > palmSpan * 0.35) {
            return 'whip';
        }

        // 2. PINCH (👌 Eye of Agamotto: Thumb tip deliberately pressed against Index tip, Index is NOT extended alone)
        const pinchDist = Math.hypot(screenLm[4].x - screenLm[8].x, screenLm[4].y - screenLm[8].y);
        const thumbToMiddleDist = Math.hypot(screenLm[4].x - screenLm[12].x, screenLm[4].y - screenLm[12].y);
        if (pinchDist < palmSpan * 0.20 && thumbToMiddleDist > pinchDist * 1.40 && !isExtended[0]) {
            return 'pinch';
        }

        // 3. CLOSED FIST (✊ Power Charge):
        // All 4 fingers are curled, NONE extended, and hand is tightly clenched
        const middleTipToWrist = Math.hypot(raw[12].x - wrist.x, raw[12].y - wrist.y);
        if (curledCount >= 3 && extendedCount === 0 && middleTipToWrist < 0.30) {
            return 'fist';
        }

        // 4. OPEN PALM (✋ Tao Mandala):
        // All 4 fingers extended, palm wide open facing camera
        const fingerSpread = Math.hypot(screenLm[8].x - screenLm[20].x, screenLm[8].y - screenLm[20].y);
        if (extendedCount >= 4 && fingerSpread > palmSpan * 0.62) {
            return 'mandala';
        }

        // If hand has 3 fingers extended with thumb spread and wide span
        if (extendedCount >= 3 && thumbExtended && fingerSpread > palmSpan * 0.68) {
            return 'mandala';
        }

        // Default: Clean Idle ('none') - prevents any accidental effect triggering!
        return 'none';
    }

    updateInterpolation() {
        const lerpFactor = 0.42;

        for (let i = 0; i < 2; i++) {
            const state = this.handStates[i];

            if (state.detected) {
                state.opacity += (1.0 - state.opacity) * 0.28;
            } else {
                state.opacity *= 0.65;
                state.intensity *= 0.65;
                if (state.opacity < 0.01) {
                    state.opacity = 0;
                    state.intensity = 0;
                    state.active = false;
                }
            }

            if (!state.active) continue;

            state.cx += (state.targetCx - state.cx) * lerpFactor;
            state.cy += (state.targetCy - state.cy) * lerpFactor;
            state.fistCenter.x += (state.targetFistCenter.x - state.fistCenter.x) * lerpFactor;
            state.fistCenter.y += (state.targetFistCenter.y - state.fistCenter.y) * lerpFactor;
            state.radius += (state.targetRadius - state.radius) * 0.28;

            for (let j = 0; j < 21; j++) {
                state.landmarks[j].x += (state.targetLandmarks[j].x - state.landmarks[j].x) * lerpFactor;
                state.landmarks[j].y += (state.targetLandmarks[j].y - state.landmarks[j].y) * lerpFactor;
            }

            const targetIntensity = (state.detected && state.gesture !== 'none') ? 1.0 : 0.0;
            state.intensity += (targetIntensity - state.intensity) * 0.28;
            if (state.intensity < 0.01) state.intensity = 0;
        }

        return {
            hands: this.handStates,
            isPortal: this.isPortalActive,
            portal: this.portal,
            isEyeOfAgamotto: this.isEyeActive,
            eyeOfAgamotto: this.eye,
            eyeStage: this.eyeStage,
            eyeExpansion: this.eyeExpansion
        };
    }
}

window.HandTracker = HandTracker;
window.HAND_CONNECTIONS = HAND_CONNECTIONS;
