// Family Dashboard - Main Entry Point
// Coordinates initialization of all modules
(function() {
    'use strict';

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🏠 Family Dashboard starting...');

        // PHASE 1: Initialize router (must be first - handles tab navigation)
        if (typeof Router !== 'undefined') {
            Router.init();
        } else {
            console.error('❌ Router module not loaded!');
        }

        // PHASE 2: Initialize background timers (run continuously)
        if (typeof CountdownTimer !== 'undefined') {
            CountdownTimer.init();
        } else {
            console.warn('⚠️ CountdownTimer module not loaded');
        }

        if (typeof RoutineTimer !== 'undefined') {
            RoutineTimer.init();
        } else {
            console.warn('⚠️ RoutineTimer module not loaded');
        }

        // PHASE 3: Lazy-loaded modules initialize on-demand
        // Router handles calling:
        // - Game.init() when game page loads
        // - WarmUp.init() when warmup page loads
        // - TodoLoader.load() when todos page loads
        // - MathGame.init() when math-game page loads

        console.log('✅ Family Dashboard ready!');
    }
})();
