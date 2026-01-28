// Countdown Timer Module
// Displays countdown to grandma visits
(function() {
    'use strict';

    window.CountdownTimer = {
        init: function() {
            this.update();
            // Update every 60 seconds
            setInterval(() => this.update(), 60000);
        },

        update: function() {
            const now = new Date();

            // Grandma Ayelet - January 28, 2026
            const ayeletEl = document.getElementById('days-ayelet');
            if (ayeletEl) {
                const ayeletDate = new Date('2026-01-28T00:00:00');
                const ayeletDiff = ayeletDate - now;
                const ayeletDays = Math.ceil(ayeletDiff / (1000 * 60 * 60 * 24));
                ayeletEl.textContent = ayeletDays > 0 ? ayeletDays : "She's here!";
            }

            // Grandma Orly - April 16, 2026
            const orlyEl = document.getElementById('days-orly');
            if (orlyEl) {
                const orlyDate = new Date('2026-04-16T00:00:00');
                const orlyDiff = orlyDate - now;
                const orlyDays = Math.ceil(orlyDiff / (1000 * 60 * 60 * 24));
                orlyEl.textContent = orlyDays > 0 ? orlyDays : "She's here!";
            }

            // Israel Flight - July 12, 2026
            const israelEl = document.getElementById('days-israel');
            if (israelEl) {
                const israelDate = new Date('2026-07-12T00:00:00');
                const israelDiff = israelDate - now;
                const israelDays = Math.ceil(israelDiff / (1000 * 60 * 60 * 24));
                israelEl.textContent = israelDays > 0 ? israelDays : "We're flying!";
            }
        }
    };
})();
