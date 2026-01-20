// ============================================================================
// AUDIO MANAGER - Sound effects and music
// ============================================================================

const AudioManager = {
    ctx: null,
    muted: false,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    },

    playSound(type) {
        if (!this.ctx || this.muted) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        switch (type) {
            case 'jump':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.1);
                break;

            case 'collect':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.2);
                break;

            case 'correct':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
                oscillator.start(this.ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                oscillator.stop(this.ctx.currentTime + 0.3);
                break;

            case 'wrong':
                oscillator.frequency.value = 200;
                gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.3);
                break;

            case 'levelComplete':
                // Play a happy melody
                const notes = [523, 659, 784, 1047];
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.15 + 0.3);
                    osc.start(this.ctx.currentTime + i * 0.15);
                    osc.stop(this.ctx.currentTime + i * 0.15 + 0.3);
                });
                break;
        }
    },

    toggleMute() {
        this.muted = !this.muted;
    }
};

