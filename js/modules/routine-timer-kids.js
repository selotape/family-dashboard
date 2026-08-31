// Routines (By Kid) Module
// Side-by-side variant of the Routines tab: one column per girl, all showing
// the same schedule/time-slots as RoutineTimer.schedule, but each column's
// checkboxes only affect that one girl - so they can check off their own
// tasks independently, at their own pace.
//
// This reuses RoutineTimer's schedule, girls list and per-girl storage
// (setGirl/getGirlsState/loadChecks) so both views always agree on the same
// day's data - a task only shows "done" on the original timeline once every
// girl has checked it here (or there).
//
// Columns currently share one schedule; the per-item structure already
// supports giving a specific girl her own task list later (e.g. by adding an
// optional `only: ['dana']` filter here) without changing storage.
(function() {
    'use strict';

    window.RoutineTimerKids = {
        tickTimer: null,

        init: function() {
            const grid = document.getElementById('routine-kids-grid');
            if (!grid) return; // Page not loaded yet

            this.renderGrid();
            this.update();

            // Live tick, same cadence as the main timeline. Guard against
            // stacking intervals if the tab is revisited.
            if (!this.tickTimer) {
                this.tickTimer = setInterval(() => this.update(), 1000);
            }

            const resetBtn = document.getElementById('routine-kids-reset-btn');
            if (resetBtn && !resetBtn.dataset.bound) {
                resetBtn.dataset.bound = '1';
                resetBtn.addEventListener('click', () => this.resetToday());
            }
        },

        // Build the 3 columns once. Idempotent so revisiting the tab is safe.
        renderGrid: function() {
            const grid = document.getElementById('routine-kids-grid');
            if (!grid || grid.querySelector('.routine-kid-col')) return;
            const RT = window.RoutineTimer;
            if (!RT) return;

            const groups = [];
            RT.schedule.forEach(item => {
                if (groups.indexOf(item.group) === -1) groups.push(item.group);
            });

            let html = '';
            RT.girls.forEach(girl => {
                html += '<div class="routine-kid-col" data-girl="' + girl.id + '">' +
                    '<div class="routine-kid-col-header">' +
                        '<span class="routine-kid-emoji">' + girl.emoji + '</span>' +
                        '<span class="routine-kid-name">' + girl.name + '</span>' +
                        '<span class="routine-kid-next" id="routine-kid-next-' + girl.id + '"></span>' +
                    '</div>' +
                    '<div class="routine-timeline routine-kid-timeline">';

                groups.forEach(group => {
                    html += '<div class="routine-group" data-group="' + group + '">' +
                            '<div class="routine-group-header routine-kid-group-header"><span>' + group + '</span></div>' +
                            '<div class="routine-group-items">';

                    RT.schedule.filter(it => it.group === group).forEach(item => {
                        const isAuto = item.type === 'auto';
                        let control;
                        if (isAuto) {
                            control = '<span class="routine-marker" aria-hidden="true"></span>';
                        } else {
                            control =
                                '<label class="routine-check">' +
                                    '<input type="checkbox" data-girl="' + girl.id + '">' +
                                    '<span class="routine-check-box"></span>' +
                                '</label>';
                        }
                        html +=
                            '<div class="routine-item theme-' + item.chime + (isAuto ? ' is-auto' : '') + '" data-id="' + item.id + '">' +
                                control +
                                '<span class="routine-item-icon">' + item.icon + '</span>' +
                                '<div class="routine-item-body">' +
                                    '<span class="routine-item-label">' + item.label + '</span>' +
                                    '<span class="routine-item-time">' + RT.formatTime(item.hour, item.minute) + '</span>' +
                                '</div>' +
                                '<span class="routine-item-countdown"></span>' +
                            '</div>';
                    });

                    html += '</div></div>';
                });

                html += '</div></div>';
            });

            grid.innerHTML = html;

            // Checkbox toggling only affects the one girl whose column it's in.
            grid.addEventListener('change', (e) => {
                const box = e.target;
                if (!box || !box.matches || !box.matches('input[type="checkbox"]')) return;
                const row = box.closest('.routine-item');
                const girlId = box.getAttribute('data-girl');
                if (row && girlId) {
                    const id = row.getAttribute('data-id');
                    RT.setGirl(id, girlId, box.checked);
                    this.update();
                    // Keep the original Routines tab's timeline in sync if it's
                    // already been loaded (it checks for its own container).
                    if (RT.update) RT.update();
                }
            });
        },

        resetToday: function() {
            const RT = window.RoutineTimer;
            if (!RT) return;
            RT.saveChecks({});
            this.update();
            if (RT.update) RT.update();
        },

        update: function() {
            const grid = document.getElementById('routine-kids-grid');
            const RT = window.RoutineTimer;
            if (!grid || !RT) return;

            const clockEl = document.getElementById('routine-kids-clock');
            if (clockEl) clockEl.textContent = RT.formatClock(new Date());

            // loadChecks() also performs the shared midnight reset.
            const checked = RT.loadChecks();

            RT.girls.forEach(girl => {
                const col = grid.querySelector('.routine-kid-col[data-girl="' + girl.id + '"]');
                if (!col) return;

                // First item not yet cleared *for this girl*.
                let nextItem = null;
                for (let i = 0; i < RT.schedule.length; i++) {
                    const item = RT.schedule[i];
                    const doneForGirl = RT.getGirlsState(checked, item.id)[girl.id];
                    const clearedByTime = item.type === 'auto' && RT.getMinutesRemaining(item) < 0;
                    if (!doneForGirl && !clearedByTime) { nextItem = item; break; }
                }

                RT.schedule.forEach(item => {
                    const row = col.querySelector('.routine-item[data-id="' + item.id + '"]');
                    if (!row) return;

                    const mins = RT.getMinutesRemaining(item);
                    const doneForGirl = RT.getGirlsState(checked, item.id)[girl.id];
                    const isNext = !!nextItem && item.id === nextItem.id;
                    const clearedByTime = item.type === 'auto' && mins < 0;

                    row.classList.toggle('done', doneForGirl);
                    row.classList.toggle('active', isNext && !doneForGirl);
                    row.classList.toggle('past', !doneForGirl && !isNext && clearedByTime);
                    row.classList.toggle('future', !doneForGirl && !isNext && !clearedByTime);
                    row.classList.toggle('overdue', isNext && !doneForGirl && mins < 0);
                    row.classList.toggle('urgent', isNext && !doneForGirl && mins >= 0 && mins <= 5);

                    const box = row.querySelector('input[type="checkbox"]');
                    if (box && box.checked !== !!doneForGirl) box.checked = !!doneForGirl;

                    const cd = row.querySelector('.routine-item-countdown');
                    if (cd) {
                        if (isNext && !doneForGirl) {
                            cd.textContent = RT.formatRelative(mins);
                            cd.style.display = '';
                        } else {
                            cd.textContent = '';
                            cd.style.display = 'none';
                        }
                    }
                });

                const nextEl = document.getElementById('routine-kid-next-' + girl.id);
                if (nextEl) {
                    if (nextItem) {
                        nextEl.textContent = nextItem.icon + ' ' + nextItem.label;
                    } else {
                        nextEl.textContent = '🌟 All done!';
                    }
                }
            });
        }
    };
})();
