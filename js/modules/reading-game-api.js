(function() {
    'use strict';

    /**
     * Reading Game API Module
     * Handles communication with the backend Flask server
     */
    window.ReadingGameAPI = {
        BASE_URL: 'http://localhost:8080',
        TIMEOUT: 30000,  // 30 seconds

        /**
         * Generate a story using the backend API
         * @param {Object} params - { gradeLevel, length, prompt, random }
         * @returns {Promise} Resolves with story data or rejects with error
         */
        generateStory: function(params) {
            var self = this;

            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                var url = self.BASE_URL + '/api/generate-story';

                // Set timeout
                var timeoutId = setTimeout(function() {
                    xhr.abort();
                    reject(new Error('Request timeout. Please try again.'));
                }, self.TIMEOUT);

                xhr.open('POST', url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onload = function() {
                    clearTimeout(timeoutId);

                    if (xhr.status === 200) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                resolve(response.story);
                            } else {
                                reject(new Error(response.error || 'Unknown error'));
                            }
                        } catch (e) {
                            reject(new Error('Invalid response from server'));
                        }
                    } else {
                        try {
                            var errorResponse = JSON.parse(xhr.responseText);
                            reject(new Error(errorResponse.error || 'Server error'));
                        } catch (e) {
                            reject(new Error('Server error: ' + xhr.status));
                        }
                    }
                };

                xhr.onerror = function() {
                    clearTimeout(timeoutId);
                    reject(new Error('Network error. Make sure the server is running on port 8080.'));
                };

                xhr.onabort = function() {
                    clearTimeout(timeoutId);
                };

                // Send request
                try {
                    var payload = JSON.stringify({
                        gradeLevel: params.gradeLevel,
                        length: params.length,
                        prompt: params.prompt || '',
                        random: params.random || false
                    });
                    xhr.send(payload);
                } catch (e) {
                    clearTimeout(timeoutId);
                    reject(new Error('Failed to send request: ' + e.message));
                }
            });
        },

        /**
         * Check if backend is healthy
         * @returns {Promise} Resolves with health status or rejects with error
         */
        checkHealth: function() {
            var self = this;

            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                var url = self.BASE_URL + '/api/health';

                var timeoutId = setTimeout(function() {
                    xhr.abort();
                    reject(new Error('Health check timeout'));
                }, 5000);

                xhr.open('GET', url, true);

                xhr.onload = function() {
                    clearTimeout(timeoutId);
                    if (xhr.status === 200) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('Invalid health check response'));
                        }
                    } else {
                        reject(new Error('Backend not healthy'));
                    }
                };

                xhr.onerror = function() {
                    clearTimeout(timeoutId);
                    reject(new Error('Backend not available'));
                };

                xhr.onabort = function() {
                    clearTimeout(timeoutId);
                };

                xhr.send();
            });
        },

        /**
         * Validate story structure
         * @param {Object} story - Story object from API
         * @returns {Boolean} True if valid
         */
        validateStory: function(story) {
            if (!story || typeof story !== 'object') {
                return false;
            }

            if (!story.title || typeof story.title !== 'string') {
                return false;
            }

            if (!Array.isArray(story.sentences) || story.sentences.length === 0) {
                return false;
            }

            // Check each sentence has required fields
            for (var i = 0; i < story.sentences.length; i++) {
                var sentence = story.sentences[i];
                if (!sentence.text || typeof sentence.text !== 'string') {
                    return false;
                }
                // testWord can be null for 3rd grade (every other sentence)
            }

            return true;
        },

        /**
         * Create a story object with metadata
         * @param {Object} storyData - Raw story data from API
         * @param {String} gradeLevel - Grade level
         * @param {String} length - Story length
         * @returns {Object} Story object ready for storage
         */
        createStoryObject: function(storyData, gradeLevel, length) {
            return {
                id: 'story_' + Date.now(),
                title: storyData.title,
                gradeLevel: gradeLevel,
                length: length,
                createdAt: new Date().toISOString(),
                completed: false,
                trophyEarned: false,
                sentences: storyData.sentences
            };
        }
    };
})();
