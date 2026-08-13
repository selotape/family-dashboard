// Routines Timer Module
// Full-day timeline: shows every routine at once (morning -> evening), with
// checkable daily chores and a live countdown + audio chime for the next item.
(function() {
    'use strict';

    window.RoutineTimer = {
        // Ordered daily schedule (top -> bottom). This is the single place to
        // edit times / labels / emojis / grouping. `chime` picks which of the
        // existing sounds plays (morning | dinner | shower | bed).
        schedule: [
            { id: 'leave',  group: 'Morning',   hour: 7,  minute: 20, icon: '🏫', label: 'Leave for school',          chime: 'morning' },
            { id: 'cubby',  group: 'Afternoon', hour: 16, minute: 30, icon: '🎒', label: 'Backpacks into Cubby',       chime: 'morning' },
            { id: 'dinner', group: 'Evening',   hour: 18, minute: 0,  icon: '🍽️', label: 'Dinner',                     chime: 'dinner' },
            { id: 'snacks', group: 'Evening',   hour: 18, minute: 30, icon: '🥨', label: 'Restock snacks (backpack)',   chime: 'dinner' },
            { id: 'shower', group: 'Evening',   hour: 18, minute: 45, icon: '🚿', label: 'Shower',                     chime: 'shower' },
            { id: 'bed',    group: 'Evening',   hour: 19, minute: 30, icon: '🌙', label: 'Bedtime',                    chime: 'bed' }
        ],

        STORAGE_KEY: 'routineChores',

        // State
        audioCtx: null,
        audioEnabled: false,
        lastChimeMinute: null,
        activeId: null,

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
                }
            };

            document.addEventListener('click', enableAudio, { once: true });
            document.addEventListener('touchstart', enableAudio, { once: true });
            document.addEventListener('keydown', enableAudio, { once: true });
        },

        initAudio: function() {
            // Audio is initialized on user gesture in init()
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        },

        // Play themed chime for a routine - plays 3 beeps + flashes the active row
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

            // Visual flash on the active row (animation runs ~3 seconds)
            const activeRow = document.querySelector('.routine-item.active');
            if (activeRow) {
                activeRow.classList.remove('chime-flash'); // Reset if already playing
                void activeRow.offsetWidth; // Force reflow to restart animation
                activeRow.classList.add('chime-flash');
                setTimeout(() => activeRow.classList.remove('chime-flash'), 3000);
            }
        },

        // ---- Time helpers ----
        formatTime: function(hour, minute) {
            const period = hour >= 12 ? 'PM' : 'AM';
            let h = hour % 12;
            if (h === 0) h = 12;
            return h + ':' + String(minute).padStart(2, '0') + ' ' + period;
        },

        // Minutes until an item's time today. Positive = upcoming, 0 = this minute,
        // negative = already passed.
        getMinutesRemaining: function(item) {
            const now = new Date();
            const target = new Date();
            target.setHours(item.hour, item.minute, 0, 0);
            return Math.ceil((target - now) / (1000 * 60));
        },

        // ---- Chore persistence (per-calendar-day, auto-resets at midnight) ----
        todayKey: function() {
            const d = new Date();
            return d.getFullYear() + '-' +
                   String(d.getMonth() + 1).padStart(2, '0') + '-' +
                   String(d.getDate()).padStart(2, '0');
        },

        loadChecks: function() {
            let record = null;
            try {
                record = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            } catch (e) {
                record = null;
            }
            const today = this.todayKey();
            // New day (or missing/corrupt) -> reset to a fresh empty record
            if (!record || record.date !== today || typeof record.checked !== 'object' || record.checked === null) {
                record = { date: today, checked: {} };
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(record));
            }
            return record.checked;
        },

        saveChecks: function(checked) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                date: this.todayKey(),
                checked: checked
            }));
        },

        toggleCheck: function(id, isChecked) {
            const checked = this.loadChecks();
            if (isChecked) {
                checked[id] = true;
            } else {
                delete checked[id];
            }
            this.saveChecks(checked);
        },

        resetToday: function() {
            this.saveChecks({});
            const boxes = document.querySelectorAll('#routine-timeline input[type="checkbox"]');
            boxes.forEach(b => { b.checked = false; });
            this.update();
        },

        // ---- Rendering ----
        // Build the timeline once into #routine-timeline. Idempotent: if the
        // rows already exist it does nothing (so navigating away and back is fine).
        renderTimeline: function() {
            const container = document.getElementById('routine-timeline');
            if (!container || container.querySelector('.routine-item')) return;

            const checked = this.loadChecks();
            let html = '';
            let lastGroup = null;

            this.schedule.forEach(item => {
                if (item.group !== lastGroup) {
                    html += '<div class="routine-group-header">' + item.group + '</div>';
                    lastGroup = item.group;
                }
                const isChecked = checked[item.id] ? ' checked' : '';
                html +=
                    '<div class="routine-item theme-' + item.chime + '" data-id="' + item.id + '">' +
                        '<label class="routine-check">' +
                            '<input type="checkbox"' + isChecked + '>' +
                            '<span class="routine-check-box"></span>' +
                        '</label>' +
                        '<span class="routine-item-icon">' + item.icon + '</span>' +
                        '<div class="routine-item-body">' +
                            '<span class="routine-item-label">' + item.label + '</span>' +
                            '<span class="routine-item-time">' + this.formatTime(item.hour, item.minute) + '</span>' +
                        '</div>' +
                        '<span class="routine-item-countdown"></span>' +
                    '</div>';
            });

            container.innerHTML = html;

            // Checkbox toggling via event delegation (attached once)
            container.addEventListener('change', (e) => {
                const box = e.target;
                if (box && box.matches && box.matches('input[type="checkbox"]')) {
                    const row = box.closest('.routine-item');
                    const id = row && row.getAttribute('data-id');
                    if (id) {
                        this.toggleCheck(id, box.checked);
                        row.classList.toggle('done', box.checked);
                    }
                }
            });

            // Reset button
            const resetBtn = document.getElementById('routine-reset-btn');
            if (resetBtn && !resetBtn.dataset.bound) {
                resetBtn.dataset.bound = '1';
                resetBtn.addEventListener('click', () => this.resetToday());
            }
        },

        update: function() {
            const container = document.getElementById('routine-timeline');
            if (!container) return; // Routines page not loaded yet

            this.renderTimeline();

            // loadChecks() also performs the midnight reset when the day rolls over
            const checked = this.loadChecks();

            // Active item = the next item today whose time hasn't fully passed
            // (smallest non-negative minutes remaining).
            let activeItem = null;
            let activeMinutes = null;
            this.schedule.forEach(item => {
                const mins = this.getMinutesRemaining(item);
                if (mins >= 0 && (activeMinutes === null || mins < activeMinutes)) {
                    activeMinutes = mins;
                    activeItem = item;
                }
            });

            // Update each row's state
            this.schedule.forEach(item => {
                const row = container.querySelector('.routine-item[data-id="' + item.id + '"]');
                if (!row) return;

                const mins = this.getMinutesRemaining(item);
                const isDone = !!checked[item.id];
                const isActive = !!activeItem && item.id === activeItem.id;
                const isPast = mins < 0;

                row.classList.toggle('done', isDone);
                row.classList.toggle('active', isActive && !isDone);
                row.classList.toggle('past', isPast && !isActive && !isDone);
                row.classList.toggle('future', !isPast && !isActive && !isDone);
                // Extra urgency pulse when the active item is imminent
                row.classList.toggle('urgent', isActive && !isDone && mins <= 5);

                // Keep the checkbox in sync (e.g. after a midnight reset)
                const box = row.querySelector('input[type="checkbox"]');
                if (box && box.checked !== isDone) box.checked = isDone;

                const cd = row.querySelector('.routine-item-countdown');
                if (cd) {
                    if (isActive && !isDone) {
                        cd.textContent = mins === 0 ? 'Now!' : ('in ' + mins + ' min');
                        cd.style.display = '';
                    } else {
                        cd.textContent = '';
                        cd.style.display = 'none';
                    }
                }
            });

            // Status line
            const statusEl = document.getElementById('routine-status');
            if (statusEl) {
                statusEl.textContent = activeItem ? '' : '🌟 All done for today — sweet dreams!';
            }

            // Chimes: only for the active item, only while the Routines tab is visible
            const routinesPage = document.getElementById('routines');
            const isPageActive = routinesPage && routinesPage.classList.contains('active');
            if (isPageActive && activeItem && !checked[activeItem.id]) {
                this.checkChime(activeItem.id, activeItem.chime, activeMinutes);
            }
        },

        checkChime: function(activeId, chimeKey, minutes) {
            // Reset the chime tracker when the active item changes
            if (this.activeId !== activeId) {
                this.activeId = activeId;
                this.lastChimeMinute = null;
            }

            // Chime at 5-minute intervals leading up to the item
            const chimeMinutes = [60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];
            if (chimeMinutes.includes(minutes) && this.lastChimeMinute !== minutes) {
                this.lastChimeMinute = minutes;
                this.playChime(chimeKey, minutes <= 10);
            }
        }
    };
})();
