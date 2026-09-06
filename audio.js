/**
 * Doctor Strange Spell Sound Synthesizer (Web Audio API)
 * Generates procedural mystical hums, spark sizzles, and portal sounds without external assets.
 */

class MagicAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.humOsc = null;
        this.humGain = null;
        this.noiseNode = null;
        this.noiseFilter = null;
        this.noiseGain = null;
        this.isInitialized = false;
        this.enabled = true;
        this.targetIntensity = 0;
        this.currentIntensity = 0;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master Volume
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            // 1. Mystical Low Hum (Oscillator with FM-like vibrato)
            this.humOsc = this.ctx.createOscillator();
            this.humOsc.type = 'sawtooth';
            this.humOsc.frequency.setValueAtTime(65.4, this.ctx.currentTime); // C2 low drone

            // Sub harmonic
            this.subOsc = this.ctx.createOscillator();
            this.subOsc.type = 'sine';
            this.subOsc.frequency.setValueAtTime(130.8, this.ctx.currentTime); // C3

            this.humFilter = this.ctx.createBiquadFilter();
            this.humFilter.type = 'lowpass';
            this.humFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
            this.humFilter.Q.setValueAtTime(5, this.ctx.currentTime);

            this.humGain = this.ctx.createGain();
            this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

            this.humOsc.connect(this.humFilter);
            this.subOsc.connect(this.humFilter);
            this.humFilter.connect(this.humGain);
            this.humGain.connect(this.masterGain);

            this.humOsc.start();
            this.subOsc.start();

            // 2. Fiery Sizzle / Sparks (Bandpass filtered white noise)
            const bufferSize = 2 * this.ctx.sampleRate;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            this.noiseNode = this.ctx.createBufferSource();
            this.noiseNode.buffer = noiseBuffer;
            this.noiseNode.loop = true;

            this.noiseFilter = this.ctx.createBiquadFilter();
            this.noiseFilter.type = 'bandpass';
            this.noiseFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
            this.noiseFilter.Q.setValueAtTime(3, this.ctx.currentTime);

            this.noiseGain = this.ctx.createGain();
            this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

            this.noiseNode.connect(this.noiseFilter);
            this.noiseFilter.connect(this.noiseGain);
            this.noiseGain.connect(this.masterGain);

            this.noiseNode.start();

            this.isInitialized = true;
        } catch (e) {
            console.warn("Web Audio initialization failed or was blocked:", e);
        }
    }

    setIntensity(intensity, spellColor = 'orange') {
        if (!this.isInitialized || !this.enabled) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.targetIntensity = Math.max(0, Math.min(1, intensity));

        // Smoothly interpolate intensity
        this.currentIntensity += (this.targetIntensity - this.currentIntensity) * 0.15;
        const now = this.ctx.currentTime;

        // Modulate hum frequency based on spell
        let baseFreq = 65.4;
        if (spellColor === 'green') baseFreq = 73.4; // D2
        if (spellColor === 'purple') baseFreq = 55.0; // A1
        if (spellColor === 'cyan') baseFreq = 82.4; // E2

        this.humOsc.frequency.setTargetAtTime(baseFreq + (this.currentIntensity * 20), now, 0.05);
        this.humFilter.frequency.setTargetAtTime(200 + (this.currentIntensity * 600), now, 0.05);
        this.humGain.gain.setTargetAtTime(this.currentIntensity * 0.25, now, 0.05);

        // Noise sparks gain and modulation
        this.noiseFilter.frequency.setTargetAtTime(1200 + (this.currentIntensity * 2200), now, 0.05);
        this.noiseGain.gain.setTargetAtTime(this.currentIntensity * 0.35, now, 0.05);
    }

    playCastSwoosh() {
        if (!this.isInitialized || !this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const now = this.ctx.currentTime;
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    toggleMute() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.isInitialized) {
            this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        return this.enabled;
    }
}

window.magicAudio = new MagicAudioEngine();
