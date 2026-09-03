// Countdown Timer Module
// Displays countdown to grandma visits
(function() {
    'use strict';

    window.CountdownTimer = {
        init: function() {
            this.update();
            // Tick every second so the minute rolls over on time
            setInterval(() => this.update(), 1000);
        },

        // Renders an exact days / hours / minutes countdown into a card.
        // target must carry an explicit UTC offset so the count is the same
        // on every device, whatever timezone its clock is set to.
        renderCard: function(prefix, target, arrivedText) {
            const numberEl = document.getElementById('days-' + prefix);
            if (!numberEl) return;

            const labelEl = document.getElementById('label-' + prefix);
            const timeEl = document.getElementById('time-' + prefix);
            const diff = target - new Date();

            if (diff <= 0) {
                numberEl.textContent = arrivedText;
                if (labelEl) labelEl.textContent = '';
                if (timeEl) timeEl.textContent = '';
                return;
            }

            const totalMinutes = Math.floor(diff / 60000);
            const days = Math.floor(totalMinutes / (60 * 24));
            const hours = Math.floor(totalMinutes / 60) % 24;
            const minutes = totalMinutes % 60;

            numberEl.textContent = days;
            if (labelEl) labelEl.textContent = days === 1 ? 'day to go' : 'days to go';
            if (timeEl) {
                timeEl.textContent = hours + (hours === 1 ? ' hour ' : ' hours ') +
                    minutes + (minutes === 1 ? ' minute' : ' minutes');
            }
        },

        update: function() {
            /* Grandma Ayelet - January 28, 2026 (commented out)
            this.renderCard('ayelet', new Date('2026-01-28T00:00:00-05:00'), "She's here!");
            */

            // Grandma Orly - lands in Atlanta September 15, 2026 at 9:41 AM
            // local time (EDT, UTC-4 - daylight time is still in effect).
            this.renderCard('orly', new Date('2026-09-15T09:41:00-04:00'), "She's here!");

            /* Israel Flight - July 12, 2026 (commented out)
            this.renderCard('israel', new Date('2026-07-12T00:00:00-04:00'), "We're flying!");
            */
        }
    };
})();
