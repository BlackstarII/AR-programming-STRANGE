/**
 * Doctor Strange Spell Arts Engine - Master Sorcery Edition
 * Features:
 * - Sacred Geometric Triangles & Mandalas
 * - The Eye of Agamotto (Time Stone Eye)
 * - The Mirror Dimension (Fractured Crystalline Reality Shatter)
 * - Eldritch Energy Whip & Power Fist Charge
 * - 800+ Sizzling Spark Particles & Volumetric Bloom
 */

const SPELL_THEMES = {
    orange: {
        name: "Eldritch Flame",
        core: "#ffffff",
        bright: "#fff2d6",
        mid: "#ff9900",
        dark: "#ff4400",
        halo: "rgba(255, 90, 0, 0.35)",
        glow: "rgba(255, 130, 20, 0.85)",
        lineGlow: "rgba(255, 140, 20, 0.8)",
        spark: ["#ffffff", "#ffffff", "#fff0a0", "#ffbb33", "#ff7700", "#ff3300"]
    },
    green: {
        name: "Time Stone",
        core: "#ffffff",
        bright: "#e8f5e9",
        mid: "#00e676",
        dark: "#00b248",
        halo: "rgba(0, 230, 118, 0.35)",
        glow: "rgba(0, 230, 118, 0.85)",
        lineGlow: "rgba(0, 230, 118, 0.8)",
        spark: ["#ffffff", "#ffffff", "#b9f6ca", "#69f0ae", "#00e676", "#00b248"]
    },
    purple: {
        name: "Dark Dimension",
        core: "#ffffff",
        bright: "#f3e5f5",
        mid: "#d500f9",
        dark: "#7c4dff",
        halo: "rgba(213, 0, 249, 0.35)",
        glow: "rgba(213, 0, 249, 0.85)",
        lineGlow: "rgba(213, 0, 249, 0.8)",
        spark: ["#ffffff", "#ffffff", "#ea80fc", "#e040fb", "#aa00ff", "#651fff"]
    },
    cyan: {
        name: "Mirror Dimension",
        core: "#ffffff",
        bright: "#e0f7fa",
        mid: "#00e5ff",
        dark: "#0091ea",
        halo: "rgba(0, 229, 255, 0.35)",
        glow: "rgba(0, 229, 255, 0.85)",
        lineGlow: "rgba(0, 229, 255, 0.8)",
        spark: ["#ffffff", "#ffffff", "#84ffff", "#18ffff", "#00b0ff", "#0091ea"]
    }
};

class SparkParticle {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 2.0;
        this.alpha = 1;
        this.decay = 0.018;
        this.color = "#ffaa00";
    }

    spawn(x, y, vx, vy, size, decay, color) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.alpha = 1.0;
        this.decay = decay;
        this.color = color;
    }

    update() {
        if (!this.active) return;
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.965;
        this.vy += 0.09;
        this.alpha -= this.decay;
        this.size *= 0.975;
        if (this.alpha <= 0 || this.size <= 0.25) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.globalAlpha = Math.max(0, this.alpha);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size * 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
}

class MandalaRenderer {
    constructor() {
        this.sparks = [];
        this.maxSparks = 800;
        for (let i = 0; i < this.maxSparks; i++) {
            this.sparks.push(new SparkParticle());
        }
    }

    spawnSpark(x, y, angle, speed, theme) {
        const p = this.sparks.find(pt => !pt.active);
        if (!p) return;

        const spread = (Math.random() - 0.5) * 0.8;
        const finalAngle = angle + spread;
        const spd = speed * (0.6 + Math.random() * 0.9);
        const vx = Math.cos(finalAngle) * spd;
        const vy = Math.sin(finalAngle) * spd;
        const size = 1.8 + Math.random() * 3.2;
        const decay = 0.014 + Math.random() * 0.024;
        const color = theme.spark[Math.floor(Math.random() * theme.spark.length)];

        p.spawn(x, y, vx, vy, size, decay, color);
    }

    drawHandSkeleton(ctx, landmarks, spellKey = 'orange', opacity = 1.0, gesture = 'none', time = 0) {
        if (!landmarks || landmarks.length < 21 || opacity <= 0.01) return;

        const theme = SPELL_THEMES[spellKey] || SPELL_THEMES.orange;
        const connections = window.HAND_CONNECTIONS || [];
        const isOpen = (gesture === 'mandala' || gesture === 'open');

        // Palm Landmarks & Center Point
        const p0 = landmarks[0];   // Wrist
        const p2 = landmarks[2];   // Thumb MCP
        const p5 = landmarks[5];   // Index MCP
        const p9 = landmarks[9];   // Middle MCP
        const p13 = landmarks[13]; // Ring MCP
        const p17 = landmarks[17]; // Pinky MCP

        const pcX = (p0.x + p5.x + p9.x + p13.x + p17.x) * 0.2;
        const pcY = (p0.y + p5.y + p9.y + p13.y + p17.y) * 0.2;
        const palmRadius = Math.hypot(p9.x - p0.x, p9.y - p0.y) * 0.28;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = opacity;

        // --- 1. Draw Mystic Doctor Strange Palm Lines (خطوط الكف السحرية) ---
        ctx.save();
        ctx.beginPath();
        // Palmar sacred triangulation
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(pcX, pcY);
        ctx.lineTo(p5.x, p5.y);
        ctx.moveTo(pcX, pcY);
        ctx.lineTo(p9.x, p9.y);
        ctx.moveTo(pcX, pcY);
        ctx.lineTo(p13.x, p13.y);
        ctx.moveTo(pcX, pcY);
        ctx.lineTo(p17.x, p17.y);

        // Life Line: Arcing smoothly around the thenar eminence from index base toward wrist
        ctx.moveTo(p2.x, p2.y);
        ctx.quadraticCurveTo(pcX * 0.9, (pcY + p0.y) * 0.52, p0.x, p0.y);

        // Head Line: Crossing diagonally through the middle of the palm
        ctx.moveTo(p5.x, p5.y);
        ctx.quadraticCurveTo(pcX, pcY, (p17.x + p0.x) * 0.5, (p17.y + p0.y) * 0.5);

        // Heart Line: Across the upper palm under knuckle mounts
        ctx.moveTo(p5.x, (p5.y + p9.y) * 0.5);
        ctx.quadraticCurveTo((pcX + p9.x) * 0.5, (p9.y + p13.y) * 0.5, p17.x, p17.y);

        // Halo layer for palm lines
        ctx.strokeStyle = theme.halo;
        ctx.lineWidth = 6.0;
        ctx.lineCap = "round";
        ctx.stroke();

        // Neon Glow layer for palm lines
        ctx.strokeStyle = theme.lineGlow;
        ctx.lineWidth = 3.2;
        ctx.stroke();

        // Hot Core line
        ctx.strokeStyle = theme.bright || "#ffffff";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Mystic Palm Sigil Circle at Palm Center (rotating arcane seal)
        if (palmRadius > 6) {
            const rot = (time * 0.002) % (Math.PI * 2);
            ctx.save();
            ctx.translate(pcX, pcY);
            ctx.rotate(rot);

            // Outer mystic ring
            ctx.beginPath();
            ctx.arc(0, 0, palmRadius, 0, Math.PI * 2);
            ctx.strokeStyle = theme.glow;
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // Inner sacred diamond
            const dSize = palmRadius * 0.65;
            ctx.beginPath();
            ctx.moveTo(0, -dSize);
            ctx.lineTo(dSize, 0);
            ctx.lineTo(0, dSize);
            ctx.lineTo(-dSize, 0);
            ctx.closePath();
            ctx.strokeStyle = theme.bright;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Center glowing focus node
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, 3.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
        ctx.restore();

        // --- 2. Finger Bone Connections ---
        ctx.strokeStyle = theme.halo;
        ctx.lineWidth = isOpen ? 12.0 : 8.0;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let i = 0; i < connections.length; i++) {
            const p1 = landmarks[connections[i][0]];
            const p2 = landmarks[connections[i][1]];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();

        // Saturated Glow Line
        ctx.strokeStyle = theme.lineGlow;
        ctx.lineWidth = isOpen ? 6.5 : 4.5;
        ctx.stroke();

        // Crisp Core Line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = isOpen ? 2.8 : 1.8;
        ctx.stroke();

        // --- 3. Glowing Joint Nodes & Sizzling Sparks ---
        for (let i = 0; i < 21; i++) {
            const lm = landmarks[i];
            const isTip = (i === 4 || i === 8 || i === 12 || i === 16 || i === 20);
            const isPalmBase = (i === 0 || i === 5 || i === 9 || i === 13 || i === 17);

            ctx.fillStyle = theme.glow;
            ctx.beginPath();
            ctx.arc(lm.x, lm.y, isTip ? 8.5 : (isPalmBase ? 6.5 : 4.8), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(lm.x, lm.y, isTip ? 3.8 : (isPalmBase ? 2.8 : 1.8), 0, Math.PI * 2);
            ctx.fill();

            // Sizzling sparks from fingertips when active
            if (isTip && (isOpen || gesture === 'whip' || gesture === 'fist') && Math.random() < 0.35) {
                this.spawnSpark(lm.x, lm.y, -Math.PI / 2 + (Math.random() - 0.5) * 1.5, 3.0 + Math.random() * 4.0, theme);
            }
        }

        ctx.restore();
    }

    /**
     * 1. TAO MANDALA WITH REALISTIC SACRED TRIANGLES
     */
    drawTaoMandala(ctx, cx, cy, radius, intensity, spellKey = 'orange', time = 0) {
        if (intensity <= 0.01 || radius <= 5) return;

        const theme = SPELL_THEMES[spellKey] || SPELL_THEMES.orange;
        const r = radius * intensity;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        const mainAngle = (time * 0.0016) % (Math.PI * 2);

        // Volumetric Bloom Halo
        const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
        haloGrad.addColorStop(0, theme.halo);
        haloGrad.addColorStop(0.5, theme.halo);
        haloGrad.addColorStop(1, "transparent");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // White-Hot Center Bloom
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.25);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.18, theme.bright);
        coreGrad.addColorStop(0.5, theme.glow);
        coreGrad.addColorStop(0.85, theme.dark);
        coreGrad.addColorStop(1, "transparent");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
        ctx.fill();

        // Outer Ring
        this.drawOuterRing(ctx, r, mainAngle, theme);

        // REALISTIC SACRED INTERLOCKING TRIANGLES (Authentic Sacred Geometry)
        this.drawSacredTriangles(ctx, r * 0.72, -mainAngle * 1.3, theme);

        // Inner Concentric Runes Ring
        this.drawInnerRunes(ctx, r * 0.46, mainAngle * 1.8, theme);

        // Central Core
        this.drawCenterCore(ctx, r * 0.22, -mainAngle * 2.2, theme);

        ctx.restore();

        // Heavy Spark Shower
        const count = Math.floor(14 * intensity);
        for (let i = 0; i < count; i++) {
            const randAngle = Math.random() * Math.PI * 2;
            const spawnDist = r * (0.86 + Math.random() * 0.22);
            const sx = cx + Math.cos(randAngle) * spawnDist;
            const sy = cy + Math.sin(randAngle) * spawnDist;
            const sparkAngle = randAngle + (Math.PI / 2) + (Math.random() - 0.5) * 0.45;
            this.spawnSpark(sx, sy, sparkAngle, 4.0 + Math.random() * 6.5, theme);
        }
    }

    /**
     * AUTHENTIC MCU SACRED INTERLACED TRIANGLES (Sri Yantra / Metatron's Geometry)
     */
    drawSacredTriangles(ctx, r, angle, theme) {
        ctx.save();
        ctx.rotate(angle);

        // Triangle 1 (Upward Pointing)
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 6.5;
        this.drawRegularPolygon(ctx, 0, 0, r, 3);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.4;
        this.drawRegularPolygon(ctx, 0, 0, r, 3);

        // Triangle 2 (Downward Pointing - Interlocked Star of David)
        ctx.save();
        ctx.rotate(Math.PI);
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 6.5;
        this.drawRegularPolygon(ctx, 0, 0, r, 3);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.4;
        this.drawRegularPolygon(ctx, 0, 0, r, 3);
        ctx.restore();

        // Secondary Nested Concentric Triangles (Counter-Rotated at 30 deg)
        ctx.save();
        ctx.rotate(Math.PI / 6);
        ctx.strokeStyle = theme.bright;
        ctx.lineWidth = 1.6;
        this.drawRegularPolygon(ctx, 0, 0, r * 0.82, 3);
        ctx.rotate(Math.PI);
        this.drawRegularPolygon(ctx, 0, 0, r * 0.82, 3);
        ctx.restore();

        // Circular Vertex Node Capacitors on Triangle Tips
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const vx = Math.cos(a) * r;
            const vy = Math.sin(a) * r;

            // Vertex Node Ring
            ctx.strokeStyle = theme.bright;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(vx, vy, r * 0.1, 0, Math.PI * 2);
            ctx.stroke();

            // Vertex Core
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Radial Ray to Center
            ctx.strokeStyle = theme.lineGlow;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(vx, vy);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 2. THE EYE OF AGAMOTTO (العين بتاع الزمن - Time Stone Artifact)
     * Features opening eyelid contour, intense emerald Infinity Stone, and chronal cosmic gears
     */
    drawEyeOfAgamotto(ctx, cx, cy, intensity, time = 0) {
        if (intensity <= 0.02) return;

        const theme = SPELL_THEMES.green;
        const r = 110 * intensity;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        const timeAngle = (time * 0.0025) % (Math.PI * 2);
        const counterAngle = (-time * 0.0035) % (Math.PI * 2);

        // 1. Intense Emerald Atmospheric Bloom
        const eyeBloom = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.5);
        eyeBloom.addColorStop(0, '#ffffff');
        eyeBloom.addColorStop(0.25, theme.bright);
        eyeBloom.addColorStop(0.6, theme.glow);
        eyeBloom.addColorStop(1, 'transparent');
        ctx.fillStyle = eyeBloom;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. The Almond-Shaped Eye Frame (Eyelid Geometry)
        const eyeWidth = r * 1.4;
        const eyeHeight = r * 0.75 + Math.sin(time * 0.01) * 6;

        // Outer Glow Eyelids
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 8.0;
        this.drawAlmondEye(ctx, eyeWidth, eyeHeight);
        ctx.stroke();

        // Core Golden-White Eyelids
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.0;
        this.drawAlmondEye(ctx, eyeWidth, eyeHeight);
        ctx.stroke();

        // 3. Outer Chronal Dial Ring with Rune Ticks
        ctx.save();
        ctx.rotate(timeAngle);
        ctx.strokeStyle = theme.bright;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([10, 8, 20, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 4. Counter-Rotating Inner Time Gear (Triangular Chrono Sigil)
        ctx.save();
        ctx.rotate(counterAngle);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.0;
        this.drawRegularPolygon(ctx, 0, 0, r * 0.55, 3);
        ctx.rotate(Math.PI);
        this.drawRegularPolygon(ctx, 0, 0, r * 0.55, 3);
        ctx.restore();

        // 5. Central TIME STONE (Infinity Stone Core)
        const stonePulse = Math.sin(time * 0.03) * 4;
        const stoneGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.28 + stonePulse);
        stoneGrad.addColorStop(0, '#ffffff');
        stoneGrad.addColorStop(0.35, '#b9f6ca');
        stoneGrad.addColorStop(0.7, '#00e676');
        stoneGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.28 + stonePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Spiral Chrono-Sparks (Time Reversal Particles)
        const chronoCount = Math.floor(8 * intensity);
        for (let i = 0; i < chronoCount; i++) {
            const a = Math.random() * Math.PI * 2;
            const dist = r * (0.4 + Math.random() * 0.7);
            this.spawnSpark(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, a - Math.PI / 2, 3.5, theme);
        }
    }

    drawAlmondEye(ctx, w, h) {
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.quadraticCurveTo(0, -h, w, 0);
        ctx.quadraticCurveTo(0, h, -w, 0);
        ctx.closePath();
    }

    /**
     * TIME EXPANSION SHOCKWAVE — Phase 2 of Eye of Agamotto ritual
     * Triggered when the user pulls their hands apart after forming the Eye.
     * Big cinematic emerald green expanding ring, time rays, and chrono sparks.
     */
    drawTimeExpansion(ctx, cx, cy, radius, intensity, time = 0) {
        if (intensity <= 0.01 || radius <= 5) return;

        const theme = SPELL_THEMES.green;
        const r = radius;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = intensity;
        ctx.translate(cx, cy);

        const spin = (time * 0.0018) % (Math.PI * 2);

        // 1. Massive outer atmospheric emerald bloom
        const bloom = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r * 1.5);
        bloom.addColorStop(0, 'rgba(0,230,118,0.55)');
        bloom.addColorStop(0.5, 'rgba(0,178,72,0.22)');
        bloom.addColorStop(1, 'transparent');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Main expanding ring (thick glowing band)
        const ringAlpha = Math.max(0, 1.0 - (r / 420) * 0.6);
        ctx.globalAlpha = intensity * ringAlpha;

        // Outer halo ring
        ctx.strokeStyle = 'rgba(0,230,118,0.45)';
        ctx.lineWidth = 28;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        // Mid bright ring
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 14;
        ctx.stroke();

        // Hot white core ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 3. Rotating sacred geometry on the ring edge
        ctx.globalAlpha = intensity * ringAlpha * 0.9;
        ctx.save();
        ctx.rotate(spin);
        const segCount = 12;
        for (let i = 0; i < segCount; i++) {
            const a = (i / segCount) * Math.PI * 2;
            const nx = Math.cos(a) * r;
            const ny = Math.sin(a) * r;

            // Tick marks on ring
            const tx1 = Math.cos(a) * (r - 18);
            const ty1 = Math.sin(a) * (r - 18);
            ctx.beginPath();
            ctx.moveTo(tx1, ty1);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = (i % 3 === 0) ? '#ffffff' : theme.bright;
            ctx.lineWidth = (i % 3 === 0) ? 4 : 2;
            ctx.stroke();

            // Diamond nodes at evenly spaced intervals
            if (i % 3 === 0) {
                ctx.save();
                ctx.translate(nx, ny);
                ctx.rotate(a + Math.PI / 4);
                const ds = 10;
                ctx.beginPath();
                ctx.moveTo(0, -ds); ctx.lineTo(ds, 0);
                ctx.lineTo(0, ds); ctx.lineTo(-ds, 0);
                ctx.closePath();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        }
        ctx.restore();

        // 4. Counter-rotating inner rune ring
        ctx.globalAlpha = intensity * ringAlpha * 0.7;
        ctx.save();
        ctx.rotate(-spin * 1.4);
        ctx.strokeStyle = theme.mid;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([12, 8, 24, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 5. Time rays shooting outward from center
        ctx.globalAlpha = intensity * ringAlpha * 0.65;
        ctx.save();
        ctx.rotate(spin * 0.5);
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
            const a = (i / rayCount) * Math.PI * 2;
            const inner = r * 0.15;
            const outer = r * 0.92;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
            ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
            ctx.strokeStyle = (i % 2 === 0) ? 'rgba(0,230,118,0.55)' : 'rgba(255,255,255,0.30)';
            ctx.lineWidth = (i % 4 === 0) ? 3.0 : 1.5;
            ctx.stroke();
        }
        ctx.restore();

        ctx.restore();

        // 6. Burst sparks flying outward on the ring edge
        const sparkCount = Math.floor(18 * intensity * ringAlpha);
        for (let i = 0; i < sparkCount; i++) {
            const a = Math.random() * Math.PI * 2;
            const px = cx + Math.cos(a) * r;
            const py = cy + Math.sin(a) * r;
            this.spawnSpark(px, py, a, 6 + Math.random() * 7, theme);
        }
    }

    /**
     * CINEMATIC CHEST EYE OF AGAMOTTO (TIME STONE MANIPULATION)
     * Triggered when the first two fingers of both hands are brought together in front of the chest.
     * Features: Mechanical opening of the Relic, blazing Time Stone, rotating chrono-dials,
     * mystical runic tendrils tethered to both hands' fingers & wrists, and emerald time sparks.
     */
    drawChestEyeOfAgamotto(ctx, cx, cy, radius, intensity, hand0, hand1, time = 0) {
        if (intensity <= 0.02) return;

        const theme = SPELL_THEMES.green;
        const r = Math.max(120, radius * 1.1) * intensity;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        // 1. Runic Time Tendrils connecting Eye to Hand Fingertips & Wrists
        if (hand0 && hand1 && hand0.landmarks && hand1.landmarks) {
            const connectPoints = [
                hand0.landmarks[8], hand0.landmarks[4], hand0.landmarks[0],
                hand1.landmarks[8], hand1.landmarks[4], hand1.landmarks[0]
            ];

            for (let i = 0; i < connectPoints.length; i++) {
                const pt = connectPoints[i];
                if (!pt) continue;

                const waveOffset = Math.sin(time * 0.006 + i * 1.2) * 12;
                const midPtX = (cx + pt.x) * 0.5 + Math.cos(time * 0.005 + i) * 15;
                const midPtY = (cy + pt.y) * 0.5 + waveOffset;

                // Outer Emerald Glow
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.quadraticCurveTo(midPtX, midPtY, pt.x, pt.y);
                ctx.strokeStyle = theme.halo;
                ctx.lineWidth = 7.0;
                ctx.stroke();

                // Inner Bright Line
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.quadraticCurveTo(midPtX, midPtY, pt.x, pt.y);
                ctx.strokeStyle = theme.lineGlow;
                ctx.lineWidth = 3.5;
                ctx.stroke();

                // Hot Core
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.quadraticCurveTo(midPtX, midPtY, pt.x, pt.y);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.4;
                ctx.stroke();

                // Spark flowing along tendril
                if (Math.random() < 0.25) {
                    this.spawnSpark(midPtX, midPtY, Math.atan2(cy - pt.y, cx - pt.x) + Math.PI, 2.5, theme);
                }
            }
        }

        // Translate to Center of Chest for the Eye and Dials
        ctx.save();
        ctx.translate(cx, cy);

        const timeAngle = (time * 0.002) % (Math.PI * 2);
        const counterAngle = (-time * 0.0028) % (Math.PI * 2);

        // 2. Volumetric Emerald Atmospheric Bloom
        const eyeBloom = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.0);
        eyeBloom.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        eyeBloom.addColorStop(0.2, 'rgba(0, 230, 118, 0.85)');
        eyeBloom.addColorStop(0.55, 'rgba(0, 178, 72, 0.35)');
        eyeBloom.addColorStop(1, 'transparent');
        ctx.fillStyle = eyeBloom;
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Grand Concentric Chrono-Rings (Time Manipulation Dials)
        ctx.save();
        ctx.rotate(timeAngle);
        ctx.strokeStyle = theme.bright;
        ctx.lineWidth = 2.4;
        ctx.setLineDash([14, 10, 28, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const tickCount = 16;
        for (let i = 0; i < tickCount; i++) {
            const ta = (i / tickCount) * Math.PI * 2;
            const x1 = Math.cos(ta) * (r * 1.35);
            const y1 = Math.sin(ta) * (r * 1.35);
            const x2 = Math.cos(ta) * (r * 1.45);
            const y2 = Math.sin(ta) * (r * 1.45);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = (i % 4 === 0) ? '#ffffff' : theme.glow;
            ctx.lineWidth = (i % 4 === 0) ? 3.0 : 1.5;
            ctx.stroke();
        }
        ctx.restore();

        // Middle Counter-Rotating Sacred Geometry (Double Hexagram)
        ctx.save();
        ctx.rotate(counterAngle);
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 2.2;
        this.drawRegularPolygon(ctx, 0, 0, r * 0.95, 3);
        ctx.rotate(Math.PI);
        this.drawRegularPolygon(ctx, 0, 0, r * 0.95, 3);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Inner Chrono Dial with Sacred Inscriptions
        ctx.save();
        ctx.rotate(timeAngle * 1.5);
        ctx.strokeStyle = theme.bright;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 4. Mechanical Eye of Agamotto Amulet & Parting Eyelids
        const eyeW = r * 1.1;
        const eyeH = r * 0.62 + Math.sin(time * 0.008) * 4;

        // Outer Bronze/Gold Amulet Frame
        ctx.strokeStyle = "rgba(255, 215, 0, 0.75)";
        ctx.lineWidth = 9.0;
        this.drawAlmondEye(ctx, eyeW * 1.08, eyeH * 1.08);
        ctx.stroke();

        // Glowing Emerald Eyelid Border
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 6.0;
        this.drawAlmondEye(ctx, eyeW, eyeH);
        ctx.stroke();

        // Pure White Hot Eyelid Rim
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.4;
        this.drawAlmondEye(ctx, eyeW, eyeH);
        ctx.stroke();

        // 5. The Heart of Time: The TIME STONE (Infinity Stone)
        const stonePulse = Math.sin(time * 0.025) * 5;
        const stoneR = r * 0.32 + stonePulse;

        // Radiant Time Stone Beams
        const rayCount = 8;
        ctx.save();
        ctx.rotate(timeAngle * 0.8);
        for (let i = 0; i < rayCount; i++) {
            const ra = (i / rayCount) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ra) * stoneR * 2.2, Math.sin(ra) * stoneR * 2.2);
            ctx.strokeStyle = (i % 2 === 0) ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 230, 118, 0.6)";
            ctx.lineWidth = 2.0;
            ctx.stroke();
        }
        ctx.restore();

        // Time Stone Core Gradient
        const stoneGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, stoneR);
        stoneGrad.addColorStop(0, '#ffffff');
        stoneGrad.addColorStop(0.3, '#b9f6ca');
        stoneGrad.addColorStop(0.65, '#00e676');
        stoneGrad.addColorStop(0.9, '#00b248');
        stoneGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.arc(0, 0, stoneR, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // restore cx, cy

        // 6. Chrono-Sparks & Swirling Time Particles
        const sparkCount = Math.floor(12 * intensity);
        for (let i = 0; i < sparkCount; i++) {
            const a = Math.random() * Math.PI * 2;
            const dist = r * (0.3 + Math.random() * 0.9);
            this.spawnSpark(
                cx + Math.cos(a) * dist,
                cy + Math.sin(a) * dist,
                a - Math.PI / 2 + (Math.random() - 0.5),
                3.5 + Math.random() * 3.0,
                theme
            );
        }

        ctx.restore(); // restore global
    }

    /**
     * 3. THE MIRROR DIMENSION SHATTER (بعد المرآة - Reality Folding Glass Prisms)
     * Crystalline kaleidoscope glass shards, refractive prisms & cyan reality fracture lines
     */
    drawMirrorDimension(ctx, cx, cy, radius, intensity, time = 0) {
        if (intensity <= 0.02) return;

        const theme = SPELL_THEMES.cyan;
        const r = radius * 1.5 * intensity;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        // 1. Reality Fracture Glow
        const fractureAura = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.5);
        fractureAura.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
        fractureAura.addColorStop(0.6, 'rgba(0, 145, 234, 0.25)');
        fractureAura.addColorStop(1, 'transparent');
        ctx.fillStyle = fractureAura;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Kaleidoscopic Folding Mirror Shards (Crystalline Facets)
        const shardCount = 8;
        const spin = (time * 0.0018) % (Math.PI * 2);

        ctx.save();
        ctx.rotate(spin);

        for (let i = 0; i < shardCount; i++) {
            const a = (i / shardCount) * Math.PI * 2;
            const wobble = Math.sin(time * 0.003 + i) * 12;
            const dist1 = r * 0.35 + wobble;
            const dist2 = r * 1.1 + wobble;

            const p1x = Math.cos(a) * dist1;
            const p1y = Math.sin(a) * dist1;
            const p2x = Math.cos(a + 0.35) * dist2;
            const p2y = Math.sin(a + 0.35) * dist2;
            const p3x = Math.cos(a - 0.35) * dist2;
            const p3y = Math.sin(a - 0.35) * dist2;

            // Semi-transparent glass facet
            ctx.fillStyle = (i % 2 === 0) ? 'rgba(0, 229, 255, 0.12)' : 'rgba(128, 222, 234, 0.18)';
            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.lineTo(p3x, p3y);
            ctx.closePath();
            ctx.fill();

            // Glass Prism Glowing Borders
            ctx.strokeStyle = theme.glow;
            ctx.lineWidth = 4.0;
            ctx.stroke();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.6;
            ctx.stroke();
        }

        ctx.restore();

        // 3. Expanding Concentric Geometric Prism Web
        const rings = [r * 0.45, r * 0.85, r * 1.25];
        for (let j = 0; j < rings.length; j++) {
            ctx.save();
            ctx.rotate(j % 2 === 0 ? spin : -spin * 1.2);
            ctx.strokeStyle = (j === 1) ? '#ffffff' : theme.bright;
            ctx.lineWidth = 2.0;
            this.drawRegularPolygon(ctx, 0, 0, rings[j], 6);
            ctx.restore();
        }

        ctx.restore();

        // Prismatic Floating Shards & Cyan Sparks
        const shardSparks = Math.floor(12 * intensity);
        for (let i = 0; i < shardSparks; i++) {
            const a = Math.random() * Math.PI * 2;
            const dist = r * (0.4 + Math.random() * 0.8);
            this.spawnSpark(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, a + Math.PI / 2, 4.0 + Math.random() * 4.0, theme);
        }
    }

    /**
     * 4. ELDRITCH ENERGY WHIP
     */
    drawEldritchWhip(ctx, tipLm, wristLm, intensity, spellKey = 'orange', time = 0) {
        if (intensity <= 0.02 || !tipLm || !wristLm) return;

        const theme = SPELL_THEMES[spellKey] || SPELL_THEMES.orange;
        const dx = tipLm.x - wristLm.x;
        const dy = tipLm.y - wristLm.y;
        const baseAngle = Math.atan2(dy, dx);
        const whipLength = 360 * intensity;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        const tipGlow = ctx.createRadialGradient(tipLm.x, tipLm.y, 0, tipLm.x, tipLm.y, 38);
        tipGlow.addColorStop(0, '#ffffff');
        tipGlow.addColorStop(0.3, theme.bright);
        tipGlow.addColorStop(0.65, theme.glow);
        tipGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = tipGlow;
        ctx.beginPath();
        ctx.arc(tipLm.x, tipLm.y, 38, 0, Math.PI * 2);
        ctx.fill();

        const points = 22;
        const pathPoints = [];
        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const dist = t * whipLength;
            const wave = Math.sin(t * 11 - time * 0.02) * (24 * t) +
                         Math.sin(t * 26 + time * 0.03) * (10 * t);
            const normalAngle = baseAngle + Math.PI / 2;
            const px = tipLm.x + Math.cos(baseAngle) * dist + Math.cos(normalAngle) * wave;
            const py = tipLm.y + Math.sin(baseAngle) * dist + Math.sin(normalAngle) * wave;
            pathPoints.push({ x: px, y: py });
        }

        ctx.strokeStyle = theme.halo;
        ctx.lineWidth = 16.0;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 9.0;
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.2;
        ctx.stroke();

        ctx.restore();

        const sparksCount = Math.floor(6 * intensity);
        for (let i = 0; i < sparksCount; i++) {
            const randomPoint = pathPoints[Math.floor(Math.random() * pathPoints.length)];
            const sparkAngle = baseAngle + (Math.random() - 0.5) * 1.8;
            this.spawnSpark(randomPoint.x, randomPoint.y, sparkAngle, 5 + Math.random() * 6, theme);
        }
    }

    /**
     * 5. CINEMATIC POWER FIST CHARGE
     */
    drawFistCharge(ctx, knuckleCenter, wristPoint, radius, intensity, spellKey = 'orange', time = 0) {
        if (intensity <= 0.02 || !knuckleCenter) return;

        const theme = SPELL_THEMES[spellKey] || SPELL_THEMES.orange;
        const cx = knuckleCenter.x;
        const cy = knuckleCenter.y;
        const r = Math.max(60, radius * 0.9) * intensity;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
        halo.addColorStop(0, theme.halo);
        halo.addColorStop(0.7, theme.halo);
        halo.addColorStop(1, 'transparent');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        const pulse = Math.sin(time * 0.04) * 8;
        const aura = ctx.createRadialGradient(cx, cy, 5, cx, cy, r + pulse);
        aura.addColorStop(0, '#ffffff');
        aura.addColorStop(0.3, theme.bright);
        aura.addColorStop(0.7, theme.glow);
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.0;
        ctx.lineCap = "round";

        const arcCount = 5;
        for (let i = 0; i < arcCount; i++) {
            const baseA = (time * 0.008 + (i * Math.PI * 2 / arcCount)) % (Math.PI * 2);
            const arcR = (r * 0.8) + Math.sin(time * 0.035 + i * 2) * 10;
            ctx.beginPath();
            ctx.arc(cx, cy, arcR, baseA, baseA + 1.0);
            ctx.stroke();
        }

        if (wristPoint) {
            const wx = wristPoint.x;
            const wy = wristPoint.y;
            const bracerR = r * 0.7;
            const rot = (time * 0.005) % (Math.PI * 2);

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(rot);

            ctx.strokeStyle = theme.glow;
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(0, 0, bracerR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.0;
            ctx.stroke();

            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = theme.bright;
            ctx.beginPath();
            ctx.arc(0, 0, bracerR * 1.25, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();

        const sparkCount = Math.floor(8 * intensity);
        for (let i = 0; i < sparkCount; i++) {
            const a = Math.random() * Math.PI * 2;
            const dist = r * (0.8 + Math.random() * 0.6);
            this.spawnSpark(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, a + Math.PI, 4.8, theme);
        }
    }

    /**
     * 6. SLING RING PORTAL
     */
    drawSlingRingPortal(ctx, cx, cy, radius, intensity, spellKey = 'orange', time = 0) {
        if (intensity <= 0.02) return;

        const theme = SPELL_THEMES[spellKey] || SPELL_THEMES.orange;
        const r = radius * 1.45 * intensity;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = intensity;

        const angle = (time * 0.0035) % (Math.PI * 2);

        const vortexHalo = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.4);
        vortexHalo.addColorStop(0, theme.halo);
        vortexHalo.addColorStop(1, 'transparent');
        ctx.fillStyle = vortexHalo;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(angle);
        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 9.0;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.setLineDash([20, 14, 40, 14]);
        ctx.lineWidth = 4.0;
        ctx.strokeStyle = theme.bright;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const innerVoid = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.95);
        innerVoid.addColorStop(0, 'rgba(8, 12, 22, 0.9)');
        innerVoid.addColorStop(0.8, 'rgba(15, 23, 42, 0.75)');
        innerVoid.addColorStop(1, 'transparent');
        ctx.fillStyle = innerVoid;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        const sparks = Math.floor(16 * intensity);
        for (let i = 0; i < sparks; i++) {
            const a = Math.random() * Math.PI * 2;
            const sx = cx + Math.cos(a) * r;
            const sy = cy + Math.sin(a) * r;
            const vAngle = a + (Math.PI / 2) + (Math.random() - 0.5) * 0.5;
            this.spawnSpark(sx, sy, vAngle, 5.0 + Math.random() * 6.5, theme);
        }
    }

    drawOuterRing(ctx, r, angle, theme) {
        ctx.save();
        ctx.rotate(angle);

        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 8.0;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.8;
        ctx.stroke();

        ctx.lineWidth = 1.6;
        ctx.strokeStyle = theme.bright;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.93, 0, Math.PI * 2);
        ctx.stroke();

        const tickCount = 40;
        for (let i = 0; i < tickCount; i++) {
            const a = (i / tickCount) * Math.PI * 2;
            const isMajor = i % 4 === 0;
            const tLen = isMajor ? r * 0.08 : r * 0.04;

            const x1 = Math.cos(a) * (r - tLen);
            const y1 = Math.sin(a) * (r - tLen);
            const x2 = Math.cos(a) * r;
            const y2 = Math.sin(a) * r;

            ctx.lineWidth = isMajor ? 2.6 : 1.4;
            ctx.strokeStyle = isMajor ? "#ffffff" : theme.bright;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawInnerRunes(ctx, r, angle, theme) {
        ctx.save();
        ctx.rotate(angle);

        ctx.strokeStyle = theme.glow;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        const nodes = 10;
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < nodes; i++) {
            const a = (i / nodes) * Math.PI * 2;
            const nx = Math.cos(a) * r;
            const ny = Math.sin(a) * r;

            ctx.beginPath();
            ctx.arc(nx, ny, 3.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawCenterCore(ctx, r, angle, theme) {
        ctx.save();
        ctx.rotate(angle);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = theme.bright;
        ctx.lineWidth = 2.2;
        this.drawRegularPolygon(ctx, 0, 0, r, 6);

        ctx.restore();
    }

    drawRegularPolygon(ctx, x, y, radius, sides) {
        if (sides < 3) return;
        ctx.beginPath();
        const step = (Math.PI * 2) / sides;
        for (let i = 0; i <= sides; i++) {
            const a = i * step;
            const px = x + Math.cos(a) * radius;
            const py = y + Math.sin(a) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    updateAndDrawParticles(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        for (let i = 0; i < this.sparks.length; i++) {
            const p = this.sparks[i];
            if (!p.active) continue;

            p.update();
            if (!p.active) continue;

            p.draw(ctx);
        }
        ctx.restore();
    }
}

window.MandalaRenderer = MandalaRenderer;
window.SPELL_THEMES = SPELL_THEMES;
