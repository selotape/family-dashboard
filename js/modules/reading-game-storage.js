(function() {
    'use strict';

    /**
     * Reading Game Storage Module
     * Manages localStorage for stories, trophies, and game state
     */
    window.ReadingGameStorage = {
        // Storage keys
        KEYS: {
            STORIES: 'readingGame_stories',
            TROPHIES: 'readingGame_trophies',
            CURRENT_GAME: 'readingGame_currentGame',
            SETTINGS: 'readingGame_settings'
        },

        /**
         * Initialize storage with default values if needed
         */
        init: function() {
            // Initialize stories if not exists
            if (!this.getStories()) {
                this.saveStories([]);
            }

            // Initialize trophies if not exists
            if (!this.getTrophies()) {
                this.saveTrophies({
                    'Pre-K': 0,
                    '1st': 0,
                    '3rd': 0
                });
            }

            // Initialize settings if not exists
            if (!this.getSettings()) {
                this.saveSettings({
                    soundEnabled: true,
                    lastGradeLevel: '1st'
                });
            }
        },

        /**
         * Get all stories
         */
        getStories: function() {
            try {
                var data = localStorage.getItem(this.KEYS.STORIES);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error reading stories from localStorage:', e);
                return [];
            }
        },

        /**
         * Save stories array
         */
        saveStories: function(stories) {
            try {
                localStorage.setItem(this.KEYS.STORIES, JSON.stringify(stories));
                return true;
            } catch (e) {
                console.error('Error saving stories to localStorage:', e);
                return false;
            }
        },

        /**
         * Add a new story
         */
        addStory: function(story) {
            var stories = this.getStories() || [];

            // Check if we've reached the limit
            if (stories.length >= window.ReadingGameData.MAX_STORIES) {
                // Remove oldest story (FIFO)
                stories.shift();
            }

            stories.push(story);
            this.saveStories(stories);
        },

        /**
         * Get a story by ID
         */
        getStoryById: function(storyId) {
            var stories = this.getStories() || [];
            for (var i = 0; i < stories.length; i++) {
                if (stories[i].id === storyId) {
                    return stories[i];
                }
            }
            return null;
        },

        /**
         * Update a story
         */
        updateStory: function(storyId, updates) {
            var stories = this.getStories() || [];
            for (var i = 0; i < stories.length; i++) {
                if (stories[i].id === storyId) {
                    // Merge updates
                    for (var key in updates) {
                        if (updates.hasOwnProperty(key)) {
                            stories[i][key] = updates[key];
                        }
                    }
                    this.saveStories(stories);
                    return true;
                }
            }
            return false;
        },

        /**
         * Delete a story by ID
         */
        deleteStory: function(storyId) {
            var stories = this.getStories() || [];
            var filtered = stories.filter(function(story) {
                return story.id !== storyId;
            });

            if (filtered.length < stories.length) {
                this.saveStories(filtered);
                return true;
            }
            return false;
        },

        /**
         * Get stories by grade level
         */
        getStoriesByGrade: function(gradeLevel) {
            var stories = this.getStories() || [];
            return stories.filter(function(story) {
                return story.gradeLevel === gradeLevel;
            });
        },

        /**
         * Get trophy counts
         */
        getTrophies: function() {
            try {
                var data = localStorage.getItem(this.KEYS.TROPHIES);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error reading trophies from localStorage:', e);
                return { 'Pre-K': 0, '1st': 0, '3rd': 0 };
            }
        },

        /**
         * Save trophy counts
         */
        saveTrophies: function(trophies) {
            try {
                localStorage.setItem(this.KEYS.TROPHIES, JSON.stringify(trophies));
                return true;
            } catch (e) {
                console.error('Error saving trophies to localStorage:', e);
                return false;
            }
        },

        /**
         * Award a trophy for a grade level
         */
        awardTrophy: function(gradeLevel) {
            var trophies = this.getTrophies();
            if (trophies[gradeLevel] !== undefined) {
                trophies[gradeLevel]++;
                this.saveTrophies(trophies);
            }
        },

        /**
         * Get current game state
         */
        getCurrentGame: function() {
            try {
                var data = localStorage.getItem(this.KEYS.CURRENT_GAME);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error reading current game from localStorage:', e);
                return null;
            }
        },

        /**
         * Save current game state (auto-save)
         */
        saveCurrentGame: function(gameState) {
            try {
                localStorage.setItem(this.KEYS.CURRENT_GAME, JSON.stringify(gameState));
                return true;
            } catch (e) {
                console.error('Error saving current game to localStorage:', e);
                return false;
            }
        },

        /**
         * Clear current game state
         */
        clearCurrentGame: function() {
            try {
                localStorage.removeItem(this.KEYS.CURRENT_GAME);
                return true;
            } catch (e) {
                console.error('Error clearing current game from localStorage:', e);
                return false;
            }
        },

        /**
         * Get settings
         */
        getSettings: function() {
            try {
                var data = localStorage.getItem(this.KEYS.SETTINGS);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Error reading settings from localStorage:', e);
                return { soundEnabled: true, lastGradeLevel: '1st' };
            }
        },

        /**
         * Save settings
         */
        saveSettings: function(settings) {
            try {
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
                return true;
            } catch (e) {
                console.error('Error saving settings to localStorage:', e);
                return false;
            }
        },

        /**
         * Update a setting
         */
        updateSetting: function(key, value) {
            var settings = this.getSettings();
            settings[key] = value;
            this.saveSettings(settings);
        },

        /**
         * Get storage usage estimate (in bytes)
         */
        getStorageSize: function() {
            var total = 0;
            for (var key in this.KEYS) {
                if (this.KEYS.hasOwnProperty(key)) {
                    var data = localStorage.getItem(this.KEYS[key]);
                    if (data) {
                        total += data.length;
                    }
                }
            }
            return total;
        }
    };
})();
