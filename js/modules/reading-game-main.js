(function() {
    'use strict';

    /**
     * Reading Game Main Module
     * Coordinates initialization and handles top-level game flow
     */
    window.ReadingGame = {
        initialized: false,

        /**
         * Initialize the reading game
         */
        init: function() {
            if (this.initialized) {
                console.log('Reading Game already initialized');
                this.render();
                return;
            }

            console.log('Initializing Reading Game...');

            try {
                // Initialize storage
                window.ReadingGameStorage.init();
                console.log('✓ Storage initialized');

                // Initialize audio
                window.ReadingGameAudio.init();
                console.log('✓ Audio initialized');

                // Initialize state
                window.ReadingGameState.init();
                console.log('✓ State initialized');

                // Initialize UI
                window.ReadingGameUI.init();
                console.log('✓ UI initialized');

                // Check backend health (non-blocking)
                this.checkBackendHealth();

                // Render initial screen
                this.render();

                this.initialized = true;
                console.log('Reading Game initialized successfully');

            } catch (error) {
                console.error('Failed to initialize Reading Game:', error);
                this.showError('Failed to initialize game: ' + error.message);
            }
        },

        /**
         * Render current state
         */
        render: function() {
            try {
                window.ReadingGameUI.render();
            } catch (error) {
                console.error('Render error:', error);
                this.showError('Render error: ' + error.message);
            }
        },

        /**
         * Check if backend is available
         */
        checkBackendHealth: function() {
            window.ReadingGameAPI.checkHealth()
                .then(function(health) {
                    console.log('✓ Backend healthy:', health);
                })
                .catch(function(error) {
                    console.warn('Backend not available:', error.message);
                    console.warn('Make sure to start the backend with: python reading-game-backend.py');
                });
        },

        /**
         * Show error message
         */
        showError: function(message) {
            var container = document.getElementById('reading-game-container');
            if (container) {
                container.innerHTML = '<div class="reading-error"><h2>Error</h2><p>' + message + '</p></div>';
            }
        },

        /**
         * Reset game (for debugging)
         */
        reset: function() {
            if (confirm('Reset all game data? This will delete all stories and trophies.')) {
                localStorage.removeItem(window.ReadingGameStorage.KEYS.STORIES);
                localStorage.removeItem(window.ReadingGameStorage.KEYS.TROPHIES);
                localStorage.removeItem(window.ReadingGameStorage.KEYS.CURRENT_GAME);
                localStorage.removeItem(window.ReadingGameStorage.KEYS.SETTINGS);

                window.ReadingGameStorage.init();
                window.ReadingGameState.init();
                this.render();

                console.log('Game reset complete');
            }
        },

        /**
         * Get game stats (for debugging)
         */
        getStats: function() {
            var stories = window.ReadingGameStorage.getStories();
            var trophies = window.ReadingGameStorage.getTrophies();
            var storageSize = window.ReadingGameStorage.getStorageSize();

            var stats = {
                totalStories: stories.length,
                storiesPerGrade: {
                    'Pre-K': stories.filter(function(s) { return s.gradeLevel === 'Pre-K'; }).length,
                    '1st': stories.filter(function(s) { return s.gradeLevel === '1st'; }).length,
                    '3rd': stories.filter(function(s) { return s.gradeLevel === '3rd'; }).length
                },
                trophies: trophies,
                storageSize: Math.round(storageSize / 1024) + ' KB',
                maxStories: window.ReadingGameData.MAX_STORIES
            };

            console.table(stats);
            return stats;
        }
    };

    // Auto-initialize when DOM is ready (if on reading game page)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Will be initialized by router
        });
    }
})();
