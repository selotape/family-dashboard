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

            // Only update if elements exist (page is loaded)
            const ayeletEl = document.getElementById('days-ayelet');
            const orlyEl = document.getElementById('days-orly');

            if (!ayeletEl || !orlyEl) return;

            // Grandma Ayelet - January 28, 2026
            const ayeletDate = new Date('2026-01-28T00:00:00');
            const ayeletDiff = ayeletDate - now;
            const ayeletDays = Math.ceil(ayeletDiff / (1000 * 60 * 60 * 24));
            ayeletEl.textContent = ayeletDays > 0 ? ayeletDays : "She's here!";

            // Grandma Orly - April 16, 2026
            const orlyDate = new Date('2026-04-16T00:00:00');
            const orlyDiff = orlyDate - now;
            const orlyDays = Math.ceil(orlyDiff / (1000 * 60 * 60 * 24));
            orlyEl.textContent = orlyDays > 0 ? orlyDays : "She's here!";
        }
    };
})();
