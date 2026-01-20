(function() {
    'use strict';

    /**
     * Reading Game Data Module
     * Contains word lists, grade configurations, and validation rules
     */
    window.ReadingGameData = {
        // Grade level configurations
        GRADE_LEVELS: {
            'Pre-K': {
                displayName: 'Pre-K',
                emoji: '🐣',
                description: 'Ages 4-5',
                maxWordLength: 6,
                simplifiedFeedback: true,  // Only green/red, no orange
                sentenceCounts: {
                    tiny: 10,
                    short: 20,
                    medium: 40
                }
            },
            '1st': {
                displayName: '1st Grade',
                emoji: '📚',
                description: 'Ages 6-7',
                maxWordLength: 8,
                simplifiedFeedback: false,
                sentenceCounts: {
                    tiny: 10,
                    short: 20,
                    medium: 40
                }
            },
            '3rd': {
                displayName: '3rd Grade',
                emoji: '🎓',
                description: 'Ages 8-9',
                maxWordLength: 12,
                simplifiedFeedback: false,
                sentenceCounts: {
                    tiny: 20,
                    short: 40,
                    medium: 80
                },
                testEveryOther: true  // Only test every other sentence
            }
        },

        // Story length options
        STORY_LENGTHS: {
            tiny: {
                displayName: 'Tiny',
                emoji: '🐁',
                description: '10 sentences'
            },
            short: {
                displayName: 'Short',
                emoji: '🐇',
                description: '20 sentences'
            },
            medium: {
                displayName: 'Medium',
                emoji: '🦊',
                description: '40 sentences'
            }
        },

        // Game constants
        MAX_HEARTS: 10,
        MAX_ATTEMPTS_PER_WORD: 3,
        SKIP_WORD_HEART_COST: 1,
        MAX_STORIES: 50,

        // Pre-K word list (fallback for offline mode or API failures)
        PREK_WORDS: [
            'cat', 'dog', 'sun', 'run', 'jump', 'hop', 'sit', 'hat', 'bat', 'mat',
            'red', 'blue', 'cup', 'bug', 'pig', 'big', 'fun', 'box', 'fox', 'mom',
            'dad', 'bed', 'pen', 'hen', 'ten', 'wet', 'pet', 'net', 'jet', 'van'
        ],

        // 1st grade word list (fallback)
        FIRST_GRADE_WORDS: [
            'happy', 'friend', 'school', 'play', 'read', 'book', 'house', 'water',
            'tree', 'flower', 'animal', 'rabbit', 'turtle', 'garden', 'rain',
            'cloud', 'stars', 'moon', 'morning', 'night', 'dragon', 'castle',
            'magic', 'forest', 'river', 'mountain', 'ocean', 'beach', 'treasure',
            'pirate', 'rocket', 'planet', 'robot', 'dinosaur', 'monster'
        ],

        // 3rd grade word list (fallback)
        THIRD_GRADE_WORDS: [
            'adventure', 'explore', 'discover', 'mysterious', 'incredible',
            'ancient', 'beneath', 'shimmer', 'glimmer', 'whisper', 'journey',
            'challenge', 'creative', 'imaginative', 'wonderful', 'marvelous',
            'magnificent', 'extraordinary', 'fascinating', 'brilliant', 'spectacular',
            'underwater', 'underground', 'astronaut', 'scientist', 'detective',
            'invention', 'experiment', 'telescope', 'submarine', 'helicopter'
        ],

        /**
         * Get configuration for a grade level
         */
        getGradeConfig: function(gradeLevel) {
            return this.GRADE_LEVELS[gradeLevel] || this.GRADE_LEVELS['1st'];
        },

        /**
         * Get sentence count for grade level and length
         */
        getSentenceCount: function(gradeLevel, length) {
            var config = this.getGradeConfig(gradeLevel);
            return config.sentenceCounts[length] || 20;
        },

        /**
         * Get fallback word list for grade level
         */
        getWordList: function(gradeLevel) {
            switch (gradeLevel) {
                case 'Pre-K':
                    return this.PREK_WORDS;
                case '1st':
                    return this.FIRST_GRADE_WORDS;
                case '3rd':
                    return this.THIRD_GRADE_WORDS;
                default:
                    return this.FIRST_GRADE_WORDS;
            }
        },

        /**
         * Validate word selection for grade level
         */
        isWordAppropriate: function(word, gradeLevel) {
            var config = this.getGradeConfig(gradeLevel);
            return word.length >= 3 && word.length <= config.maxWordLength;
        }
    };
})();
