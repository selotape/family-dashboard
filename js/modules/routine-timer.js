// Routines Timer Module
// Morning & Evening countdown system with audio chimes
(function() {
    'use strict';

    window.RoutineTimer = {
        // Milestones configuration
        milestones: {
            morning: { hour: 7, minute: 20, icon: '🏫', title: 'Time to Leave for School', target: 'Leave by 7:20 AM' },
            dinner:  { hour: 18, minute: 0, icon: '🍽️', title: 'Dinner Time!', target: 'Dinner at 6:00 PM' },
            shower:  { hour: 18, minute: 45, icon: '🚿', title: 'Shower Time!', target: 'Showers at 6:45 PM' },
            bed:     { hour: 19, minute: 30, icon: '🌙', title: 'Bedtime!', target: 'Bed at 7:30 PM' }
        },

        // Time windows
        morningStart: 6,    // 6:00 AM
        morningEnd: 7,      // 7:20 AM (use milestone time)
        eveningStart: 17.5, // 5:30 PM
        eveningEnd: 19.5,   // 7:30 PM

        // State
        audioCtx: null,
        audioEnabled: false,
        lastChimeMinute: null,
        currentRoutine: null,

        init: function() {
            this.update();
            // Update every second
            setInterval(() => this.update(), 1000);

            // Enable audio on first user interaction
            const enableAudio = () => {
                if (!this.audioEnabled) {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    this.audioEnabled = true;
                    console.log('🔊 Audio enabled!');
                    // Play a tiny test sound to confirm
                    this.playChime('dinner', false);
                }
            };

            document.addEventListener('click', enableAudio, { once: true });
            document.addEventListener('touchstart', enableAudio, { once: true });
            document.addEventListener('keydown', enableAudio, { once: true });
        },

        initAudio: function() {
            // Audio is now initialized on user gesture in init()
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        },

        // Play themed chime based on current routine - plays 3 beeps
        playChime: function(routine, isUrgent = false) {
            if (!this.audioEnabled || !this.audioCtx) return;
            this.initAudio();
            const ctx = this.audioCtx;

            // Different sounds for different routines
            const sounds = {
                morning: { freq: 880, type: 'sine', duration: 0.2 },      // Bright bell
                dinner:  { freq: 660, type: 'triangle', duration: 0.25 }, // Warm dinner bell
                shower:  { freq: 523, type: 'sine', duration: 0.2 },      // Water-like
                bed:     { freq: 392, type: 'sine', duration: 0.3 }       // Soft, low
            };

            const sound = sounds[routine] || sounds.morning;
            const volume = isUrgent ? 0.25 : 0.15;
            const beepGap = 0.3; // Gap between beeps

            // Play 3 consecutive beeps
            for (let i = 0; i < 3; i++) {
                const startTime = ctx.currentTime + (i * (sound.duration + beepGap));

                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = sound.type;

                // For urgent, each beep is higher pitched
                const freqMultiplier = isUrgent ? 1 + (i * 0.15) : 1;
                oscillator.frequency.setValueAtTime(sound.freq * freqMultiplier, startTime);

                gainNode.gain.setValueAtTime(volume, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + sound.duration);
            }

            // Visual flash (animation loops 5x at 0.6s = 3 seconds)
            const container = document.getElementById('routine-container');
            if (container) {
                container.classList.remove('chime-flash'); // Reset if already playing
                void container.offsetWidth; // Force reflow to restart animation
                container.classList.add('chime-flash');
                setTimeout(() => container.classList.remove('chime-flash'), 3000);
            }
        },

        getCurrentRoutineType: function() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeDecimal = hours + minutes / 60;

            // Morning: 6:00 AM - 7:20 AM
            if (timeDecimal >= this.morningStart && timeDecimal < 7 + 20/60) {
                return 'morning';
            }

            // Evening: 5:30 PM - 7:30 PM
            if (timeDecimal >= this.eveningStart && timeDecimal < this.eveningEnd) {
                // Determine which evening milestone
                const dinnerTime = this.milestones.dinner.hour + this.milestones.dinner.minute/60;
                const showerTime = this.milestones.shower.hour + this.milestones.shower.minute/60;
                const bedTime = this.milestones.bed.hour + this.milestones.bed.minute/60;

                if (timeDecimal < dinnerTime) return 'dinner';
                if (timeDecimal < showerTime) return 'shower';
                if (timeDecimal < bedTime) return 'bed';
            }

            return 'off-hours';
        },

        getMinutesRemaining: function(milestone) {
            const now = new Date();
            const target = new Date();
            target.setHours(milestone.hour, milestone.minute, 0, 0);

            // If target is in the past (shouldn't happen during active window), return 0
            if (target <= now) return 0;

            const diffMs = target - now;
            return Math.ceil(diffMs / (1000 * 60));
        },

        getMorningUrgencyClass: function(minutes) {
            if (minutes > 30) return 'morning';
            if (minutes > 15) return 'morning-aware';
            if (minutes > 5) return 'morning-hurry';
            return 'morning-urgent';
        },

        getOffHoursMessage: function() {
            const now = new Date();
            const hours = now.getHours();

            if (hours < this.morningStart) {
                return { icon: '😴', title: 'Still sleeping time...', message: 'Go back to sleep!' };
            }
            if (hours >= 7 && hours < 12) {
                return { icon: '📚', title: 'Have a great day!', message: 'Learning time at school!' };
            }
            if (hours >= 12 && hours < this.eveningStart) {
                return { icon: '☀️', title: 'Enjoy your day!', message: 'See you at dinner time!' };
            }
            // After 7:30 PM
            return { icon: '🌟', title: 'Good night!', message: 'Sweet dreams!' };
        },

        update: function() {
            const routineType = this.getCurrentRoutineType();
            const container = document.getElementById('routine-container');
            const iconEl = document.getElementById('routine-icon');
            const titleEl = document.getElementById('routine-title');
            const minutesEl = document.getElementById('routine-minutes');
            const labelEl = document.getElementById('routine-label');
            const targetEl = document.getElementById('routine-target');
            const messageEl = document.getElementById('routine-message');

            // Only update if elements exist (routines page is loaded)
            if (!container || !iconEl || !titleEl || !minutesEl || !labelEl || !targetEl || !messageEl) {
                return;
            }

            // Check if routines page is actually visible/active
            const routinesPage = document.getElementById('routines');
            const isPageActive = routinesPage && routinesPage.classList.contains('active');

            // Remove all theme classes
            container.className = 'routine-container';

            if (routineType === 'off-hours') {
                const offHours = this.getOffHoursMessage();
                container.classList.add('off-hours');
                iconEl.textContent = offHours.icon;
                titleEl.textContent = offHours.title;
                minutesEl.textContent = offHours.message;
                labelEl.style.display = 'none';
                targetEl.textContent = '';
                messageEl.style.display = 'none';
                this.lastChimeMinute = null;
                return;
            }

            // Active routine
            const milestone = this.milestones[routineType];
            const minutes = this.getMinutesRemaining(milestone);

            // Apply theme class
            if (routineType === 'morning') {
                container.classList.add(this.getMorningUrgencyClass(minutes));
            } else {
                container.classList.add(routineType);
            }

            // Update display
            iconEl.textContent = milestone.icon;
            titleEl.textContent = milestone.title;
            minutesEl.textContent = minutes;
            labelEl.textContent = minutes === 1 ? 'minute' : 'minutes';
            labelEl.style.display = 'block';
            targetEl.textContent = milestone.target;

            // Show message at milestone time (0 minutes)
            if (minutes === 0) {
                messageEl.textContent = routineType === 'morning' ? 'Time to go! 🏃‍♀️' :
                                       routineType === 'dinner' ? 'Food is ready! 🍽️' :
                                       routineType === 'shower' ? 'Get in the shower! 🚿' :
                                       'Time for bed! 🌙';
                messageEl.style.display = 'block';
            } else {
                messageEl.style.display = 'none';
            }

            // Check for 5-minute mark chime (only if page is active)
            if (isPageActive) {
                this.checkChime(routineType, minutes);
            }
        },

        checkChime: function(routineType, minutes) {
            // Chime at 5-minute intervals
            const chimeMinutes = [60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];

            if (chimeMinutes.includes(minutes) && this.lastChimeMinute !== minutes) {
                this.lastChimeMinute = minutes;
                // More urgent chime for lower minutes
                const isUrgent = minutes <= 10;
                this.playChime(routineType, isUrgent);
            }

            // Reset lastChimeMinute when routine changes
            if (this.currentRoutine !== routineType) {
                this.currentRoutine = routineType;
                this.lastChimeMinute = null;
            }
        }
    };
})();
