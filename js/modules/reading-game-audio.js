(function() {
    'use strict';

    /**
     * Reading Game Audio Module
     * Web Audio API sound effects
     */
    window.ReadingGameAudio = {
        audioCtx: null,
        audioEnabled: false,

        /**
         * Initialize audio context on first user interaction
         */
        init: function() {
            var self = this;
            var enableAudio = function() {
                if (!self.audioEnabled) {
                    self.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    self.audioEnabled = true;
                    console.log('Reading Game Audio initialized');
                }
            };

            // Enable audio on first click
            document.addEventListener('click', enableAudio, { once: true });
        },

        /**
         * Check if sound is enabled in settings
         */
        isSoundEnabled: function() {
            var settings = window.ReadingGameStorage.getSettings();
            return settings && settings.soundEnabled;
        },

        /**
         * Play a tone with specified frequency and duration
         */
        playTone: function(frequency, duration, type) {
            if (!this.audioEnabled || !this.isSoundEnabled()) return;

            try {
                var oscillator = this.audioCtx.createOscillator();
                var gainNode = this.audioCtx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioCtx.destination);

                oscillator.type = type || 'sine';
                oscillator.frequency.value = frequency;

                // Envelope for smoother sound
                gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

                oscillator.start(this.audioCtx.currentTime);
                oscillator.stop(this.audioCtx.currentTime + duration);
            } catch (e) {
                console.error('Error playing tone:', e);
            }
        },

        /**
         * Play multiple tones in sequence (melody)
         */
        playMelody: function(notes) {
            if (!this.audioEnabled || !this.isSoundEnabled()) return;

            var self = this;
            var currentTime = this.audioCtx.currentTime;

            notes.forEach(function(note) {
                setTimeout(function() {
                    self.playTone(note.freq, note.duration, note.type);
                }, (note.delay || 0) * 1000);
            });
        },

        /**
         * Page turn sound (swoosh)
         */
        playPageTurn: function() {
            this.playMelody([
                { freq: 200, duration: 0.1, type: 'sine', delay: 0 },
                { freq: 150, duration: 0.15, type: 'sine', delay: 0.05 }
            ]);
        },

        /**
         * Correct letter sound (ding)
         */
        playCorrectLetter: function() {
            this.playTone(800, 0.1, 'sine');
        },

        /**
         * Wrong letter sound (buzz)
         */
        playWrongLetter: function() {
            this.playTone(150, 0.2, 'sawtooth');
        },

        /**
         * Word complete sound (chime)
         */
        playWordComplete: function() {
            this.playMelody([
                { freq: 523, duration: 0.15, type: 'sine', delay: 0 },
                { freq: 659, duration: 0.15, type: 'sine', delay: 0.1 },
                { freq: 784, duration: 0.3, type: 'sine', delay: 0.2 }
            ]);
        },

        /**
         * Heart lost sound (sad tone)
         */
        playHeartLost: function() {
            this.playMelody([
                { freq: 400, duration: 0.2, type: 'triangle', delay: 0 },
                { freq: 300, duration: 0.3, type: 'triangle', delay: 0.15 }
            ]);
        },

        /**
         * Trophy earned sound (fanfare)
         */
        playTrophyEarned: function() {
            this.playMelody([
                { freq: 523, duration: 0.2, type: 'sine', delay: 0 },
                { freq: 659, duration: 0.2, type: 'sine', delay: 0.15 },
                { freq: 784, duration: 0.2, type: 'sine', delay: 0.3 },
                { freq: 1047, duration: 0.5, type: 'sine', delay: 0.45 }
            ]);
        },

        /**
         * Story loading sound (gentle notification)
         */
        playLoading: function() {
            this.playMelody([
                { freq: 440, duration: 0.1, type: 'sine', delay: 0 },
                { freq: 550, duration: 0.1, type: 'sine', delay: 0.1 }
            ]);
        },

        /**
         * Toggle sound on/off
         */
        toggleSound: function() {
            var settings = window.ReadingGameStorage.getSettings();
            settings.soundEnabled = !settings.soundEnabled;
            window.ReadingGameStorage.saveSettings(settings);
            return settings.soundEnabled;
        }
    };
})();
