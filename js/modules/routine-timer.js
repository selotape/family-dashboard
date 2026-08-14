// Routines Timer Module
// Full-day timeline: shows every routine at once (morning -> evening), with
// checkable daily chores and a live countdown + audio chime for the next item.
(function() {
    'use strict';

    window.RoutineTimer = {
        // Ordered daily schedule (top -> bottom). This is the single place to
        // edit times / labels / emojis / grouping. `chime` picks which of the
        // existing sounds plays (morning | dinner | shower | bed).
        // type: 'auto' items clear themselves once their time passes (events);
        //       'chore' items stay as the pending action until marked done.
        schedule: [
            { id: 'breakfast', group: 'Morning', hour: 7,  minute: 0,  icon: '🥣', label: 'Breakfast',                chime: 'morning', type: 'chore' },
            { id: 'brush-am',  group: 'Morning', hour: 7,  minute: 10, icon: '🪥', label: 'Brush teeth',              chime: 'morning', type: 'chore' },
            { id: 'shoes',     group: 'Morning', hour: 7,  minute: 15, icon: '👟', label: 'Shoes & Hair',             chime: 'morning', type: 'chore' },
            { id: 'leave',  group: 'Morning',   hour: 7,  minute: 20, icon: '🏫', label: 'Leave for school',          chime: 'morning', type: 'auto'  },
            { id: 'cubby',  group: 'Afternoon', hour: 16, minute: 30, icon: '🎒', label: 'Backpacks into Cubby',       chime: 'morning', type: 'chore' },
            { id: 'dinner', group: 'Afternoon', hour: 18, minute: 0,  icon: '🍽️', label: 'Dinner',                     chime: 'dinner',  type: 'auto'  },
            { id: 'snacks', group: 'Afternoon', hour: 18, minute: 30, icon: '🥨', label: 'Restock snacks (backpack)',   chime: 'dinner',  type: 'chore' },
            { id: 'shower', group: 'Afternoon', hour: 18, minute: 45, icon: '🚿', label: 'Shower',                     chime: 'shower',  type: 'chore' },
            { id: 'brush',  group: 'Afternoon', hour: 19, minute: 20, icon: '🪥', label: 'Brush teeth',                chime: 'bed',     type: 'chore' },
            { id: 'bed',    group: 'Afternoon', hour: 19, minute: 30, icon: '🌙', label: 'Bedtime',                    chime: 'bed',     type: 'auto'  }
        ],

        STORAGE_KEY: 'routineChores',
        GROUP_KEY: 'routineGroupsCollapsed',

        // The three girls. A chore is only "done" when all three are checked.
        // (No dedicated capybara/red-panda emoji exist; these are the closest.)
        girls: [
            { id: 'noga', name: 'Noga', emoji: '🦫' },
            { id: 'dana', name: 'Dana', emoji: '🦊' },
            { id: 'ella', name: 'Ella', emoji: '🐼' }
        ],

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

        // Live wall-clock string, e.g. "7:15:03 PM"
        formatClock: function(d) {
            let h = d.getHours();
            const period = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            if (h === 0) h = 12;
            const m = String(d.getMinutes()).padStart(2, '0');
            const s = String(d.getSeconds()).padStart(2, '0');
            return h + ':' + m + ':' + s + ' ' + period;
        },

        // Minutes until an item's time today. Positive = upcoming, 0 = this minute,
        // negative = already passed.
        getMinutesRemaining: function(item) {
            const now = new Date();
            const target = new Date();
            target.setHours(item.hour, item.minute, 0, 0);
            return Math.ceil((target - now) / (1000 * 60));
        },

        // An item is "cleared" (no longer needs attention) when it's marked done,
        // or when it's an auto/event item whose time has already passed.
        isCleared: function(item, checked) {
            if (this.isItemDone(checked, item.id)) return true;
            if (item.type === 'auto' && this.getMinutesRemaining(item) < 0) return true;
            return false;
        },

        // The single "Next Action" = first item in the day that isn't cleared.
        computeNextAction: function(checked) {
            for (let i = 0; i < this.schedule.length; i++) {
                if (!this.isCleared(this.schedule[i], checked)) return this.schedule[i];
            }
            return null;
        },

        // Human relative time from signed minutes: "in 15 min", "in 1:15h",
        // "5 min ago", "1:15h ago", "Now!".
        formatRelative: function(mins) {
            if (mins === 0) return 'Now!';
            const future = mins > 0;
            let a = Math.abs(mins);
            let text;
            if (a < 60) {
                text = a + ' min';
            } else {
                const h = Math.floor(a / 60);
                const m = a % 60;
                text = h + ':' + String(m).padStart(2, '0') + 'h';
            }
            return future ? ('in ' + text) : (text + ' ago');
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

        // Per-girl completion for an item, normalizing the legacy boolean form.
        getGirlsState: function(checked, id) {
            const v = checked[id];
            if (v === true) return { noga: true, dana: true, ella: true };
            if (v && typeof v === 'object') {
                return { noga: !!v.noga, dana: !!v.dana, ella: !!v.ella };
            }
            return { noga: false, dana: false, ella: false };
        },

        // An item is done only when all three girls are checked.
        isItemDone: function(checked, id) {
            const g = this.getGirlsState(checked, id);
            return g.noga && g.dana && g.ella;
        },

        // Toggle a single girl for an item.
        setGirl: function(id, girlId, val) {
            const checked = this.loadChecks();
            const g = this.getGirlsState(checked, id);
            g[girlId] = val;
            if (!g.noga && !g.dana && !g.ella) {
                delete checked[id];
            } else {
                checked[id] = g;
            }
            this.saveChecks(checked);
        },

        // Mark a whole item done (all girls) or clear it.
        markItemDone: function(id, val) {
            const checked = this.loadChecks();
            if (val) {
                checked[id] = { noga: true, dana: true, ella: true };
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

        // ---- Collapsed-column persistence (per group name) ----
        loadGroupCollapse: function() {
            try {
                const v = JSON.parse(localStorage.getItem(this.GROUP_KEY));
                return (v && typeof v === 'object') ? v : {};
            } catch (e) {
                return {};
            }
        },

        saveGroupCollapse: function(state) {
            localStorage.setItem(this.GROUP_KEY, JSON.stringify(state || {}));
        },

        // ---- Rendering ----
        // Build the timeline once into #routine-timeline. Idempotent: if the
        // rows already exist it does nothing (so navigating away and back is fine).
        renderTimeline: function() {
            const container = document.getElementById('routine-timeline');
            if (!container || container.querySelector('.routine-item')) return;

            const checked = this.loadChecks();
            const collapsed = this.loadGroupCollapse();

            // Group names in order of first appearance (Morning, Afternoon, ...)
            const groups = [];
            this.schedule.forEach(item => {
                if (groups.indexOf(item.group) === -1) groups.push(item.group);
            });

            let html = '';
            groups.forEach(group => {
                const isCollapsed = collapsed[group] ? ' collapsed' : '';
                html +=
                    '<div class="routine-group' + isCollapsed + '" data-group="' + group + '">' +
                        '<button class="routine-group-header" type="button">' +
                            '<span>' + group + '</span>' +
                            '<span class="routine-group-chevron">▾</span>' +
                        '</button>' +
                        '<div class="routine-group-items">';

                this.schedule.filter(it => it.group === group).forEach(item => {
                    const isAuto = item.type === 'auto';
                    // Auto/non-negotiable items get a non-clickable status marker;
                    // chores get a real checkbox.
                    let control;
                    if (isAuto) {
                        control = '<span class="routine-marker" aria-hidden="true"></span>';
                    } else {
                        const isChecked = checked[item.id] ? ' checked' : '';
                        control =
                            '<label class="routine-check">' +
                                '<input type="checkbox"' + isChecked + '>' +
                                '<span class="routine-check-box"></span>' +
                            '</label>';
                    }
                    html +=
                        '<div class="routine-item theme-' + item.chime + (isAuto ? ' is-auto' : '') + '" data-id="' + item.id + '">' +
                            control +
                            '<span class="routine-item-icon">' + item.icon + '</span>' +
                            '<div class="routine-item-body">' +
                                '<span class="routine-item-label">' + item.label + '</span>' +
                                '<span class="routine-item-time">' + this.formatTime(item.hour, item.minute) + '</span>' +
                            '</div>' +
                            '<span class="routine-item-countdown"></span>' +
                        '</div>';
                });

                html += '</div></div>';
            });

            container.innerHTML = html;

            // Checkbox toggling via event delegation (attached once)
            container.addEventListener('change', (e) => {
                const box = e.target;
                if (box && box.matches && box.matches('input[type="checkbox"]')) {
                    const row = box.closest('.routine-item');
                    const id = row && row.getAttribute('data-id');
                    if (id) {
                        this.markItemDone(id, box.checked);
                        this.update();
                    }
                }
            });

            // Collapse/expand a column when its header is clicked (persisted)
            container.addEventListener('click', (e) => {
                const header = e.target.closest && e.target.closest('.routine-group-header');
                if (!header) return;
                const groupEl = header.closest('.routine-group');
                const group = groupEl && groupEl.getAttribute('data-group');
                if (!group) return;
                const nowCollapsed = groupEl.classList.toggle('collapsed');
                const state = this.loadGroupCollapse();
                state[group] = nowCollapsed;
                this.saveGroupCollapse(state);
            });

            // Reset button
            const resetBtn = document.getElementById('routine-reset-btn');
            if (resetBtn && !resetBtn.dataset.bound) {
                resetBtn.dataset.bound = '1';
                resetBtn.addEventListener('click', () => this.resetToday());
            }
        },

        // Build the Next Action widget once; fields are updated each tick.
        renderNextActionSkeleton: function() {
            const el = document.getElementById('next-action');
            if (!el || el.querySelector('.next-action-card')) return;
            let girlsHtml = '';
            this.girls.forEach(function(g) {
                girlsHtml +=
                    '<label class="na-girl">' +
                        '<input type="checkbox" data-girl="' + g.id + '">' +
                        '<span class="na-girl-box"></span>' +
                        '<span class="na-girl-emoji">' + g.emoji + '</span>' +
                        '<span class="na-girl-name">' + g.name + '</span>' +
                    '</label>';
            });

            el.innerHTML =
                '<div class="next-action-card">' +
                    '<div class="next-action-eyebrow" id="na-eyebrow">Next action</div>' +
                    '<div class="next-action-emoji" id="na-emoji">✨</div>' +
                    '<div class="next-action-label" id="na-label">—</div>' +
                    '<div class="next-action-when" id="na-when"></div>' +
                    '<div class="next-action-time" id="na-time"></div>' +
                    '<div class="next-action-girls" id="na-girls">' + girlsHtml + '</div>' +
                    '<button class="next-action-btn" id="na-btn" type="button">✓ Mark done</button>' +
                    '<div class="next-action-note" id="na-note"></div>' +
                '</div>';

            const btn = document.getElementById('na-btn');
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', () => {
                    if (this.nextActionId) {
                        this.markItemDone(this.nextActionId, true);
                        this.update();
                    }
                });
            }

            // Per-girl checkbox toggling (checking all three completes the item)
            const girlsEl = document.getElementById('na-girls');
            if (girlsEl && !girlsEl.dataset.bound) {
                girlsEl.dataset.bound = '1';
                girlsEl.addEventListener('change', (e) => {
                    const box = e.target;
                    if (box && box.matches && box.matches('input[type="checkbox"]')) {
                        const girlId = box.getAttribute('data-girl');
                        if (this.nextActionId && girlId) {
                            this.setGirl(this.nextActionId, girlId, box.checked);
                            this.update();
                        }
                    }
                });
            }
        },

        updateNextActionWidget: function(nextAction) {
            const card = document.querySelector('.next-action-card');
            if (!card) return;
            const eyebrow = document.getElementById('na-eyebrow');
            const emoji = document.getElementById('na-emoji');
            const label = document.getElementById('na-label');
            const when  = document.getElementById('na-when');
            const time  = document.getElementById('na-time');
            const btn   = document.getElementById('na-btn');
            const note  = document.getElementById('na-note');
            const girls = document.getElementById('na-girls');

            if (nextAction) {
                const mins = this.getMinutesRemaining(nextAction);
                const isAuto = nextAction.type === 'auto';
                card.classList.remove('all-done');
                card.classList.toggle('is-auto', isAuto);
                card.classList.toggle('overdue', mins < 0);
                card.classList.toggle('imminent', mins >= 0 && mins <= 5);
                card.setAttribute('data-theme', nextAction.chime);
                eyebrow.textContent = isAuto ? 'Coming up' : 'Next action';
                emoji.textContent = nextAction.icon;
                label.textContent = nextAction.label;
                when.textContent  = this.formatRelative(mins);
                time.textContent  = 'Scheduled ' + this.formatTime(nextAction.hour, nextAction.minute);
                // Auto/non-negotiable items just happen — no girls, no button.
                if (isAuto) {
                    if (girls) girls.style.display = 'none';
                    btn.style.display = 'none';
                    note.style.display = '';
                    note.textContent = '🔒 Happens on its own';
                } else {
                    if (girls) {
                        girls.style.display = '';
                        const gs = this.getGirlsState(this.loadChecks(), nextAction.id);
                        girls.querySelectorAll('input[type="checkbox"]').forEach(function(b) {
                            b.checked = !!gs[b.getAttribute('data-girl')];
                        });
                    }
                    btn.style.display = '';
                    btn.textContent = '✓ Mark done';
                    note.style.display = 'none';
                }
            } else {
                card.classList.add('all-done');
                card.classList.remove('overdue', 'imminent', 'is-auto');
                card.removeAttribute('data-theme');
                eyebrow.textContent = 'All done';
                emoji.textContent = '🌟';
                label.textContent = 'All done for today!';
                when.textContent  = '';
                time.textContent  = 'Sweet dreams';
                if (girls) girls.style.display = 'none';
                btn.style.display = 'none';
                note.style.display = 'none';
            }
        },

        update: function() {
            const container = document.getElementById('routine-timeline');
            if (!container) return; // Routines page not loaded yet

            this.renderTimeline();

            // Live clock in the header
            const clockEl = document.getElementById('routine-clock');
            if (clockEl) clockEl.textContent = this.formatClock(new Date());

            // loadChecks() also performs the midnight reset when the day rolls over
            const checked = this.loadChecks();

            // The single call-to-action: first item that isn't cleared.
            const nextAction = this.computeNextAction(checked);
            this.nextActionId = nextAction ? nextAction.id : null;

            // Update each timeline row
            this.schedule.forEach(item => {
                const row = container.querySelector('.routine-item[data-id="' + item.id + '"]');
                if (!row) return;

                const mins = this.getMinutesRemaining(item);
                const isDone = this.isItemDone(checked, item.id);
                const isNext = !!nextAction && item.id === nextAction.id;
                const clearedByTime = item.type === 'auto' && mins < 0;

                row.classList.toggle('done', isDone);
                row.classList.toggle('active', isNext && !isDone);
                row.classList.toggle('past', !isDone && !isNext && clearedByTime);
                row.classList.toggle('future', !isDone && !isNext && !clearedByTime);
                row.classList.toggle('overdue', isNext && !isDone && mins < 0);
                // Extra urgency pulse when the next action is imminent
                row.classList.toggle('urgent', isNext && !isDone && mins >= 0 && mins <= 5);

                // Keep the checkbox in sync (e.g. after a midnight reset)
                const box = row.querySelector('input[type="checkbox"]');
                if (box && box.checked !== isDone) box.checked = isDone;

                const cd = row.querySelector('.routine-item-countdown');
                if (cd) {
                    if (isNext && !isDone) {
                        cd.textContent = this.formatRelative(mins);
                        cd.style.display = '';
                    } else {
                        cd.textContent = '';
                        cd.style.display = 'none';
                    }
                }
            });

            // Next Action widget
            this.renderNextActionSkeleton();
            this.updateNextActionWidget(nextAction);

            // Status line
            const statusEl = document.getElementById('routine-status');
            if (statusEl) {
                statusEl.textContent = nextAction ? '' : '🌟 All done for today — sweet dreams!';
            }

            // Chimes: only for an upcoming next action, only while the tab is visible
            const routinesPage = document.getElementById('routines');
            const isPageActive = routinesPage && routinesPage.classList.contains('active');
            if (isPageActive && nextAction && !this.isItemDone(checked, nextAction.id)) {
                this.checkChime(nextAction.id, nextAction.chime, this.getMinutesRemaining(nextAction));
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
