(function() {
    'use strict';

    /**
     * Reading Game State Module
     * Manages game state machine, spelling validation, and heart management
     */
    window.ReadingGameState = {
        // Current state
        currentState: 'level-select',  // level-select, story-input, story-loading, reading, spelling, complete, library

        // Current game data
        currentStory: null,
        currentSentenceIndex: 0,
        currentWord: null,
        hearts: 10,
        attemptsLeft: 3,
        failedAttempts: [],
        completedWords: [],
        completedSentences: [],  // Track completed sentences with their text and test words
        skippedWords: [],
        trophyEligible: true,
        spellingInProgress: false,  // Track if user is currently spelling (inline mode)

        // Selected options
        selectedGrade: '1st',
        selectedLength: 'short',

        /**
         * Initialize state
         */
        init: function() {
            // Try to resume from saved game
            var savedGame = window.ReadingGameStorage.getCurrentGame();
            if (savedGame) {
                console.log('Resuming saved game:', savedGame.storyId);
                this.resumeGame(savedGame);
            } else {
                // Load last grade level
                var settings = window.ReadingGameStorage.getSettings();
                if (settings && settings.lastGradeLevel) {
                    this.selectedGrade = settings.lastGradeLevel;
                }
            }
        },

        /**
         * Change state
         */
        setState: function(newState) {
            console.log('State change:', this.currentState, '->', newState);
            this.currentState = newState;

            // Auto-save when entering certain states
            if (newState === 'reading' || newState === 'spelling') {
                this.autoSave();
            }

            // Clear current game when returning to level select
            if (newState === 'level-select') {
                window.ReadingGameStorage.clearCurrentGame();
            }
        },

        /**
         * Start new game with a story
         */
        startNewGame: function(story, gradeLevel, length) {
            this.currentStory = story;
            this.selectedGrade = gradeLevel;
            this.selectedLength = length;
            this.currentSentenceIndex = 0;
            this.hearts = window.ReadingGameData.MAX_HEARTS;
            this.completedWords = [];
            this.completedSentences = [];  // Reset sentence history
            this.skippedWords = [];
            this.trophyEligible = true;
            this.spellingInProgress = false;  // Reset spelling flag
            this.resetWordState();

            // Save grade level preference
            window.ReadingGameStorage.updateSetting('lastGradeLevel', gradeLevel);

            // Add story to library
            window.ReadingGameStorage.addStory(story);

            this.setState('reading');
        },

        /**
         * Resume a saved game
         */
        resumeGame: function(savedGame) {
            var story = window.ReadingGameStorage.getStoryById(savedGame.storyId);
            if (!story) {
                console.error('Saved story not found:', savedGame.storyId);
                window.ReadingGameStorage.clearCurrentGame();
                return;
            }

            this.currentStory = story;
            this.selectedGrade = savedGame.gradeLevel;
            this.currentSentenceIndex = savedGame.currentSentenceIndex;
            this.hearts = savedGame.hearts;
            this.completedWords = savedGame.completedWords || [];
            this.skippedWords = savedGame.skippedWords || [];
            this.trophyEligible = savedGame.trophyEligible;

            this.resetWordState();
            this.setState('reading');
        },

        /**
         * Auto-save current game state
         */
        autoSave: function() {
            if (!this.currentStory) return;

            var gameState = {
                storyId: this.currentStory.id,
                gradeLevel: this.selectedGrade,
                currentSentenceIndex: this.currentSentenceIndex,
                hearts: this.hearts,
                completedWords: this.completedWords,
                skippedWords: this.skippedWords,
                trophyEligible: this.trophyEligible
            };

            window.ReadingGameStorage.saveCurrentGame(gameState);
        },

        /**
         * Get current sentence
         */
        getCurrentSentence: function() {
            if (!this.currentStory || this.currentSentenceIndex >= this.currentStory.sentences.length) {
                return null;
            }
            return this.currentStory.sentences[this.currentSentenceIndex];
        },

        /**
         * Reset word state for new sentence
         */
        resetWordState: function() {
            var sentence = this.getCurrentSentence();
            if (sentence && sentence.testWord) {
                this.currentWord = sentence.testWord;
                this.attemptsLeft = window.ReadingGameData.MAX_ATTEMPTS_PER_WORD;
                this.failedAttempts = [];
            }
        },

        /**
         * Start spelling challenge for current sentence
         */
        startSpelling: function() {
            this.resetWordState();
            this.spellingInProgress = true;  // Set flag instead of changing state
        },

        /**
         * Exit spelling mode
         */
        exitSpelling: function() {
            this.spellingInProgress = false;
        },

        /**
         * Validate a letter guess
         * @param {String} guess - User's attempted spelling
         * @param {Number} position - Letter position (0-indexed)
         * @returns {String} 'correct', 'wrong-position', or 'wrong'
         */
        validateLetter: function(guess, position) {
            if (!this.currentWord) return 'wrong';

            var targetLetter = this.currentWord[position].toLowerCase();
            var guessLetter = guess[position].toLowerCase();

            if (guessLetter === targetLetter) {
                return 'correct';
            }

            // Check if letter exists elsewhere in word (Wordle-style)
            var gradeConfig = window.ReadingGameData.getGradeConfig(this.selectedGrade);
            if (!gradeConfig.simplifiedFeedback) {
                if (this.currentWord.toLowerCase().indexOf(guessLetter) !== -1) {
                    return 'wrong-position';
                }
            }

            return 'wrong';
        },

        /**
         * Check if an attempt is fully correct
         * @param {String} attempt - Full word attempt
         * @returns {Boolean} True if correct
         */
        isAttemptCorrect: function(attempt) {
            if (!this.currentWord) return false;
            return attempt.toLowerCase() === this.currentWord.toLowerCase();
        },

        /**
         * Check spelling (inline mode)
         * @param {String} attempt - User's spelling attempt
         * @returns {Object} Result object { correct, feedback, gameOver }
         */
        checkSpelling: function(attempt) {
            return this.submitAttempt(attempt);
        },

        /**
         * Submit a spelling attempt
         * @param {String} attempt - User's spelling attempt
         * @returns {Object} Result object { correct, feedback, gameOver }
         */
        submitAttempt: function(attempt) {
            if (!this.currentWord || !attempt) {
                return { correct: false, feedback: [], gameOver: false };
            }

            var isCorrect = this.isAttemptCorrect(attempt);

            // Build feedback for each letter
            var feedback = [];
            for (var i = 0; i < attempt.length; i++) {
                feedback.push(this.validateLetter(attempt, i));
            }

            if (isCorrect) {
                // Save completed sentence to history
                var currentSentence = this.currentStory.sentences[this.currentSentenceIndex];
                this.completedSentences.push({
                    text: currentSentence.text,
                    testWord: currentSentence.testWord,
                    index: this.currentSentenceIndex
                });

                // Word completed successfully
                this.completedWords.push(this.currentWord);
                this.currentSentenceIndex++;
                this.autoSave();

                return {
                    correct: true,
                    feedback: feedback,
                    gameOver: false,
                    storyComplete: this.currentSentenceIndex >= this.getTestSentenceCount()
                };
            } else {
                // Wrong attempt
                this.failedAttempts.push({ attempt: attempt, feedback: feedback });
                this.attemptsLeft--;

                // Check if attempts exhausted
                if (this.attemptsLeft <= 0) {
                    return this.loseHeart();
                }

                return {
                    correct: false,
                    feedback: feedback,
                    gameOver: false,
                    attemptsLeft: this.attemptsLeft
                };
            }
        },

        /**
         * Lose a heart
         * @returns {Object} Result object
         */
        loseHeart: function() {
            this.hearts--;
            this.trophyEligible = false;
            this.autoSave();

            var gameOver = this.hearts <= 0;

            if (!gameOver) {
                // Save completed sentence even if failed
                var currentSentence = this.currentStory.sentences[this.currentSentenceIndex];
                this.completedSentences.push({
                    text: currentSentence.text,
                    testWord: currentSentence.testWord,
                    index: this.currentSentenceIndex,
                    failed: true  // Mark as failed
                });

                // Move to next sentence
                this.completedWords.push(this.currentWord);
                this.currentSentenceIndex++;
            }

            return {
                correct: false,
                feedback: [],
                gameOver: gameOver,
                heartLost: true,
                heartsRemaining: this.hearts,
                storyComplete: !gameOver && this.currentSentenceIndex >= this.getTestSentenceCount()
            };
        },

        /**
         * Skip current word (costs 1 heart)
         * @returns {Object} Result object
         */
        skipWord: function() {
            if (!this.currentWord) return { gameOver: false };

            var currentSentence = this.currentStory.sentences[this.currentSentenceIndex];
            var revealedSentence = currentSentence ? currentSentence.text : '';

            this.skippedWords.push(this.currentWord);
            this.hearts -= window.ReadingGameData.SKIP_WORD_HEART_COST;
            this.trophyEligible = false;
            this.autoSave();

            var gameOver = this.hearts <= 0;

            if (!gameOver) {
                // Save skipped sentence
                this.completedSentences.push({
                    text: currentSentence.text,
                    testWord: currentSentence.testWord,
                    index: this.currentSentenceIndex,
                    skipped: true  // Mark as skipped
                });

                this.currentSentenceIndex++;
            }

            return {
                skipped: true,
                gameOver: gameOver,
                heartsRemaining: this.hearts,
                storyComplete: !gameOver && this.currentSentenceIndex >= this.getTestSentenceCount(),
                revealedWord: this.currentWord,
                revealedSentence: revealedSentence
            };
        },

        /**
         * Get number of sentences to test (accounting for 3rd grade rule)
         */
        getTestSentenceCount: function() {
            if (!this.currentStory) return 0;

            var totalSentences = this.currentStory.sentences.length;
            var gradeConfig = window.ReadingGameData.getGradeConfig(this.selectedGrade);

            if (gradeConfig.testEveryOther) {
                // For 3rd grade, test every other sentence
                return Math.ceil(totalSentences / 2);
            }

            return totalSentences;
        },

        /**
         * Complete the story
         * @returns {Object} Completion result with trophy status
         */
        completeStory: function() {
            var won = this.hearts > 0;

            if (won && this.trophyEligible) {
                window.ReadingGameStorage.awardTrophy(this.selectedGrade);
            }

            // Update story as completed
            window.ReadingGameStorage.updateStory(this.currentStory.id, {
                completed: true,
                trophyEarned: won && this.trophyEligible
            });

            // Clear saved game
            window.ReadingGameStorage.clearCurrentGame();

            this.setState('complete');

            return {
                won: won,
                trophyEarned: won && this.trophyEligible,
                hearts: this.hearts,
                completedWords: this.completedWords.length,
                skippedWords: this.skippedWords.length
            };
        },

        /**
         * View library
         */
        viewLibrary: function() {
            this.setState('library');
        },

        /**
         * Read a story from library (no spelling challenges)
         */
        readStoryFromLibrary: function(storyId) {
            var story = window.ReadingGameStorage.getStoryById(storyId);
            if (story) {
                this.currentStory = story;
                this.selectedGrade = story.gradeLevel;
                this.currentSentenceIndex = 0;
                this.setState('reading');
            }
        }
    };
})();
