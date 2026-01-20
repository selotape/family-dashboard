(function() {
    'use strict';

    /**
     * Reading Game UI Module
     * Handles all DOM rendering and animations
     */
    window.ReadingGameUI = {
        container: null,

        /**
         * Initialize UI
         */
        init: function() {
            this.container = document.getElementById('reading-game-container');
            if (!this.container) {
                console.error('Reading game container not found');
                return;
            }
        },

        /**
         * Render current state
         */
        render: function() {
            if (!this.container) return;

            var state = window.ReadingGameState;

            switch (state.currentState) {
                case 'level-select':
                    this.renderLevelSelect();
                    break;
                case 'story-input':
                    this.renderStoryInput();
                    break;
                case 'story-loading':
                    this.renderLoading();
                    break;
                case 'reading':
                    this.renderReading();
                    break;
                case 'spelling':
                    this.renderSpelling();
                    break;
                case 'complete':
                    this.renderComplete();
                    break;
                case 'library':
                    this.renderLibrary();
                    break;
                default:
                    this.renderLevelSelect();
            }
        },

        /**
         * Render level selection screen
         */
        renderLevelSelect: function() {
            var trophies = window.ReadingGameStorage.getTrophies();
            var gradeData = window.ReadingGameData.GRADE_LEVELS;

            var html = '<div class="reading-level-select">';
            html += '<h1>📖 Reading & Spelling</h1>';
            html += '<p class="reading-subtitle">Choose your level</p>';
            html += '<div class="reading-level-cards">';

            for (var grade in gradeData) {
                if (gradeData.hasOwnProperty(grade)) {
                    var config = gradeData[grade];
                    var trophyCount = trophies[grade] || 0;

                    html += '<div class="reading-level-card" data-grade="' + grade + '">';
                    html += '<div class="reading-level-emoji">' + config.emoji + '</div>';
                    html += '<h3>' + config.displayName + '</h3>';
                    html += '<p>' + config.description + '</p>';
                    html += '<div class="reading-trophy-count">🏆 ' + trophyCount + '</div>';
                    html += '</div>';
                }
            }

            html += '</div>';

            // Library button
            html += '<button class="reading-btn reading-btn-secondary" id="reading-view-library">📚 View Library</button>';

            html += '</div>';

            this.container.innerHTML = html;
            this.attachLevelSelectHandlers();
        },

        /**
         * Attach event handlers for level select
         */
        attachLevelSelectHandlers: function() {
            var self = this;
            var cards = this.container.querySelectorAll('.reading-level-card');

            cards.forEach(function(card) {
                card.addEventListener('click', function() {
                    var grade = this.getAttribute('data-grade');
                    window.ReadingGameState.selectedGrade = grade;
                    window.ReadingGameState.setState('story-input');
                    self.render();
                });
            });

            var libraryBtn = document.getElementById('reading-view-library');
            if (libraryBtn) {
                libraryBtn.addEventListener('click', function() {
                    window.ReadingGameState.setState('library');
                    self.render();
                });
            }
        },

        /**
         * Render story input form
         */
        renderStoryInput: function() {
            var state = window.ReadingGameState;
            var gradeConfig = window.ReadingGameData.GRADE_LEVELS[state.selectedGrade];

            var html = '<div class="reading-story-input">';
            html += '<button class="reading-back-btn" id="reading-back-to-levels">← Back</button>';
            html += '<h2>' + gradeConfig.emoji + ' ' + gradeConfig.displayName + '</h2>';
            html += '<p class="reading-subtitle">What should the story be about?</p>';

            html += '<textarea id="reading-prompt" placeholder="Enter a story idea (e.g., \'a brave astronaut exploring Mars\')..." rows="4"></textarea>';

            html += '<div class="reading-or-divider">OR</div>';

            html += '<button class="reading-btn reading-btn-secondary" id="reading-random-story">🎲 Surprise Me!</button>';

            html += '<div class="reading-length-selector">';
            html += '<p>Story length:</p>';
            html += '<div class="reading-length-buttons">';

            var lengths = window.ReadingGameData.STORY_LENGTHS;
            for (var len in lengths) {
                if (lengths.hasOwnProperty(len)) {
                    var lengthConfig = lengths[len];
                    var sentenceCount = window.ReadingGameData.getSentenceCount(state.selectedGrade, len);
                    var selected = len === state.selectedLength ? ' selected' : '';

                    html += '<button class="reading-length-btn' + selected + '" data-length="' + len + '">';
                    html += lengthConfig.emoji + ' ' + lengthConfig.displayName;
                    html += '<br><small>' + sentenceCount + ' sentences</small>';
                    html += '</button>';
                }
            }

            html += '</div></div>';

            html += '<button class="reading-btn reading-btn-primary" id="reading-generate-story">✨ Generate Story</button>';

            html += '</div>';

            this.container.innerHTML = html;
            this.attachStoryInputHandlers();
        },

        /**
         * Attach event handlers for story input
         */
        attachStoryInputHandlers: function() {
            var self = this;
            var state = window.ReadingGameState;

            // Back button
            var backBtn = document.getElementById('reading-back-to-levels');
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    state.setState('level-select');
                    self.render();
                });
            }

            // Length buttons
            var lengthBtns = this.container.querySelectorAll('.reading-length-btn');
            lengthBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    lengthBtns.forEach(function(b) { b.classList.remove('selected'); });
                    this.classList.add('selected');
                    state.selectedLength = this.getAttribute('data-length');
                });
            });

            // Random story button
            var randomBtn = document.getElementById('reading-random-story');
            if (randomBtn) {
                randomBtn.addEventListener('click', function() {
                    self.generateStory(true);
                });
            }

            // Generate button
            var generateBtn = document.getElementById('reading-generate-story');
            if (generateBtn) {
                generateBtn.addEventListener('click', function() {
                    var prompt = document.getElementById('reading-prompt').value.trim();
                    if (!prompt) {
                        alert('Please enter a story idea or click "Surprise Me!"');
                        return;
                    }
                    self.generateStory(false, prompt);
                });
            }
        },

        /**
         * Generate a story
         */
        generateStory: function(random, prompt) {
            var self = this;
            var state = window.ReadingGameState;

            state.setState('story-loading');
            this.render();

            window.ReadingGameAudio.playLoading();

            var params = {
                gradeLevel: state.selectedGrade,
                length: state.selectedLength,
                random: random,
                prompt: prompt || ''
            };

            window.ReadingGameAPI.generateStory(params)
                .then(function(storyData) {
                    // Validate story
                    if (!window.ReadingGameAPI.validateStory(storyData)) {
                        throw new Error('Invalid story format');
                    }

                    // Create story object
                    var story = window.ReadingGameAPI.createStoryObject(
                        storyData,
                        state.selectedGrade,
                        state.selectedLength
                    );

                    // Start game
                    state.startNewGame(story, state.selectedGrade, state.selectedLength);
                    self.render();
                })
                .catch(function(error) {
                    console.error('Story generation error:', error);
                    alert('Failed to generate story: ' + error.message);
                    state.setState('story-input');
                    self.render();
                });
        },

        /**
         * Render loading screen
         */
        renderLoading: function() {
            var html = '<div class="reading-loading">';
            html += '<div class="reading-spinner"></div>';
            html += '<p>Creating your story...</p>';
            html += '<p class="reading-loading-subtitle">This may take a moment</p>';
            html += '</div>';

            this.container.innerHTML = html;
        },

        /**
         * Render reading screen with book layout
         */
        renderReading: function() {
            var state = window.ReadingGameState;
            var sentence = state.getCurrentSentence();

            if (!sentence) {
                // Story complete
                state.completeStory();
                this.render();
                return;
            }

            var html = '<div class="reading-book">';

            // Header with hearts and progress
            html += '<div class="reading-book-header">';
            html += '<button class="reading-back-btn" id="reading-back-to-menu">🏠 Menu</button>';
            html += '<div class="reading-hearts">';
            for (var i = 0; i < window.ReadingGameData.MAX_HEARTS; i++) {
                if (i < state.hearts) {
                    html += '❤️';
                } else {
                    html += '🖤';
                }
            }
            html += '</div>';
            html += '<div class="reading-progress">';
            var progress = Math.floor((state.currentSentenceIndex / state.getTestSentenceCount()) * 100);
            html += 'Progress: ' + state.currentSentenceIndex + '/' + state.getTestSentenceCount();
            html += '</div>';
            html += '</div>';

            // Book pages
            html += '<div class="reading-book-pages">';

            // Left page (decorative)
            html += '<div class="reading-book-page reading-page-left">';
            html += '<div class="reading-page-decoration">✨</div>';
            html += '<h3>' + (state.currentStory ? state.currentStory.title : 'Story') + '</h3>';
            html += '</div>';

            // Right page (current sentence)
            html += '<div class="reading-book-page reading-page-right">';

            // Show completed sentences history
            if (state.completedSentences && state.completedSentences.length > 0) {
                html += '<div class="reading-completed-sentences">';
                for (var i = 0; i < state.completedSentences.length; i++) {
                    var completed = state.completedSentences[i];
                    var highlightedText = this.highlightWord(completed.text, completed.testWord);

                    // Add class based on status
                    var className = 'reading-completed-sentence';
                    if (completed.failed) className += ' reading-failed-sentence';
                    if (completed.skipped) className += ' reading-skipped-sentence';

                    html += '<p class="' + className + '">';
                    html += highlightedText;
                    html += '</p>';
                }
                html += '</div>';
                html += '<div class="reading-sentence-divider"></div>';
            }

            // Show sentence with highlighted OR underscored word
            if (sentence.testWord) {
                var sentenceText;
                if (state.spellingInProgress) {
                    // During spelling, show underscored word
                    sentenceText = this.underscoreWord(sentence.text, sentence.testWord);
                } else {
                    // Before spelling, show highlighted word
                    sentenceText = this.highlightWord(sentence.text, sentence.testWord);
                }
                html += '<p class="reading-sentence reading-current-sentence">' + sentenceText + '</p>';

                // Show either start button or spelling interface
                if (state.spellingInProgress) {
                    // Show inline spelling interface
                    html += this.renderInlineSpelling(sentence, state);
                } else {
                    // Show start spelling button
                    html += '<button class="reading-btn reading-btn-primary" id="reading-start-spelling">✏️ Start Spelling</button>';
                }
            } else {
                // No test word (for 3rd grade non-test sentences)
                html += '<p class="reading-sentence">' + sentence.text + '</p>';
                html += '<button class="reading-btn reading-btn-primary" id="reading-next-sentence">Next →</button>';
            }

            html += '</div>';

            html += '</div>'; // end book-pages
            html += '</div>'; // end book

            this.container.innerHTML = html;
            this.attachReadingHandlers();
        },

        /**
         * Render inline spelling interface (below the sentence)
         */
        renderInlineSpelling: function(sentence, state) {
            var html = '';

            html += '<div class="reading-inline-spelling">';

            // Show attempts counter
            html += '<div class="reading-spelling-hint">';
            html += '❤️ ' + state.attemptsLeft + ' attempt' + (state.attemptsLeft !== 1 ? 's' : '') + ' left';
            html += '</div>';

            // Show letter boxes hint
            html += '<div class="reading-letter-boxes">';
            for (var i = 0; i < state.currentWord.length; i++) {
                html += '<span class="reading-letter-box"></span>';
            }
            html += '</div>';

            // Show failed attempts (if any)
            if (state.failedAttempts && state.failedAttempts.length > 0) {
                html += '<div class="reading-failed-attempts">';
                for (var i = 0; i < state.failedAttempts.length; i++) {
                    var attempt = state.failedAttempts[i];
                    html += '<div class="reading-failed-attempt">';
                    for (var j = 0; j < attempt.feedback.length; j++) {
                        var feedback = attempt.feedback[j];
                        var className = 'reading-letter-feedback';
                        if (feedback === 'correct') className += ' reading-letter-correct';
                        else if (feedback === 'wrong-position') className += ' reading-letter-present';
                        else className += ' reading-letter-incorrect';

                        html += '<span class="' + className + '">' + attempt.attempt[j] + '</span>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            }

            // Input field
            html += '<input type="text" id="reading-spelling-input" class="reading-spelling-input" ';
            html += 'placeholder="Type the word..." maxlength="' + state.currentWord.length + '">';

            // Buttons
            html += '<div class="reading-spelling-actions">';
            html += '<button class="reading-btn reading-btn-primary" id="reading-check-spelling">Check Spelling</button>';
            html += '<button class="reading-btn reading-btn-secondary" id="reading-give-up-word">Give Up (−1 ❤️)</button>';
            html += '</div>';

            html += '</div>'; // end reading-inline-spelling

            return html;
        },

        /**
         * Underscore a word in a sentence
         */
        underscoreWord: function(sentence, word) {
            // Create underscores matching word length
            var underscores = '_'.repeat(word.length);

            // Replace word with underscores (case-insensitive)
            var regex = new RegExp('\\b' + word + '\\b', 'i');
            return sentence.replace(regex, '<span class="reading-underscored">' + underscores + '</span>');
        },

        /**
         * Highlight a word in a sentence (for learning phase)
         */
        highlightWord: function(sentence, word) {
            // Replace word with highlighted version (case-insensitive)
            var regex = new RegExp('\\b' + word + '\\b', 'i');
            return sentence.replace(regex, '<span class="reading-highlighted-word">' + word + '</span>');
        },

        /**
         * Attach reading screen handlers
         */
        attachReadingHandlers: function() {
            var self = this;
            var state = window.ReadingGameState;

            var backBtn = document.getElementById('reading-back-to-menu');
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    if (confirm('Exit this story? Your progress will be saved.')) {
                        state.setState('level-select');
                        self.render();
                    }
                });
            }

            var spellBtn = document.getElementById('reading-start-spelling');
            if (spellBtn) {
                spellBtn.addEventListener('click', function() {
                    window.ReadingGameAudio.playPageTurn();
                    state.startSpelling();
                    self.render();
                });
            }

            var nextBtn = document.getElementById('reading-next-sentence');
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    window.ReadingGameAudio.playPageTurn();
                    state.currentSentenceIndex++;
                    state.setState('reading');
                    self.render();
                });
            }

            // Inline spelling mode handlers
            var checkBtn = document.getElementById('reading-check-spelling');
            if (checkBtn) {
                checkBtn.addEventListener('click', function() {
                    self.handleSpellingSubmit();
                });
            }

            var giveUpBtn = document.getElementById('reading-give-up-word');
            if (giveUpBtn) {
                giveUpBtn.addEventListener('click', function() {
                    self.handleGiveUp();
                });
            }

            // Enter key submits spelling
            var spellingInput = document.getElementById('reading-spelling-input');
            if (spellingInput) {
                spellingInput.focus();
                spellingInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        self.handleSpellingSubmit();
                    }
                });
            }
        },

        /**
         * Handle spelling submission (inline mode)
         */
        handleSpellingSubmit: function() {
            var state = window.ReadingGameState;
            var self = this;
            var input = document.getElementById('reading-spelling-input');
            var attempt = input.value.trim().toLowerCase();

            // Validate
            if (!attempt) {
                this.showInlineError('Please type a word');
                return;
            }

            if (attempt.length !== state.currentWord.length) {
                this.showInlineError('Word must be ' + state.currentWord.length + ' letters');
                return;
            }

            // Submit attempt
            var result = state.checkSpelling(attempt);

            if (result.correct) {
                // Success!
                window.ReadingGameAudio.playWordComplete();
                this.showCorrectFeedback(result, function() {
                    if (result.storyComplete) {
                        state.exitSpelling();
                        var completion = state.completeStory();
                        self.render();
                    } else {
                        state.exitSpelling();
                        state.setState('reading');
                        self.render();
                    }
                });
            } else if (result.gameOver) {
                // Lost all hearts
                state.exitSpelling();
                state.setState('complete');
                self.render();
            } else if (result.heartLost) {
                // Lost a heart, move to next sentence
                window.ReadingGameAudio.playHeartLost();
                this.showHeartLost(result, function() {
                    if (result.gameOver) {
                        state.exitSpelling();
                        state.setState('complete');
                        self.render();
                    } else {
                        state.exitSpelling();
                        state.setState('reading');
                        self.render();
                    }
                });
            } else {
                // Wrong attempt, try again
                window.ReadingGameAudio.playWrongLetter();
                self.render();
            }
        },

        /**
         * Handle give up button (inline mode)
         */
        handleGiveUp: function() {
            var state = window.ReadingGameState;
            var self = this;

            // Show inline confirmation instead of alert
            if (this.confirmGiveUp()) {
                var result = state.skipWord();

                window.ReadingGameAudio.playHeartLost();
                this.showSkipFeedback(result, function() {
                    if (result.gameOver) {
                        state.exitSpelling();
                        state.setState('complete');
                        self.render();
                    } else if (result.storyComplete) {
                        state.exitSpelling();
                        var completion = state.completeStory();
                        self.render();
                    } else {
                        state.exitSpelling();
                        state.setState('reading');
                        self.render();
                    }
                });
            }
        },

        /**
         * Show inline error message (replaces alert)
         */
        showInlineError: function(message) {
            var input = document.getElementById('reading-spelling-input');
            if (input) {
                input.classList.add('reading-input-error');
                input.placeholder = message;
                setTimeout(function() {
                    input.classList.remove('reading-input-error');
                    input.placeholder = 'Type the word...';
                }, 2000);
            }
        },

        /**
         * Confirm give up (inline, not alert)
         */
        confirmGiveUp: function() {
            // For now, just return true
            // Could show inline confirmation UI later
            return true;
        },

        /**
         * Render spelling challenge
         */
        renderSpelling: function() {
            var state = window.ReadingGameState;
            var sentence = state.getCurrentSentence();

            var html = '<div class="reading-spelling">';

            // Header
            html += '<div class="reading-spelling-header">';
            html += '<div class="reading-hearts">';
            for (var i = 0; i < window.ReadingGameData.MAX_HEARTS; i++) {
                if (i < state.hearts) {
                    html += '❤️';
                } else {
                    html += '🖤';
                }
            }
            html += '</div>';
            html += '<div class="reading-attempts">Attempts left: ' + state.attemptsLeft + '</div>';
            html += '</div>';

            // Word length hint
            html += '<div class="reading-word-hint">';
            html += '<p>Spell the word (' + state.currentWord.length + ' letters)</p>';
            html += '<div class="reading-letter-boxes">';
            for (var i = 0; i < state.currentWord.length; i++) {
                html += '<div class="reading-letter-box"></div>';
            }
            html += '</div>';
            html += '</div>';

            // Failed attempts display
            if (state.failedAttempts.length > 0) {
                html += '<div class="reading-failed-attempts" id="reading-failed-attempts">';
                state.failedAttempts.forEach(function(failed, idx) {
                    html += '<div class="reading-attempt reading-attempt-float">';
                    failed.feedback.forEach(function(feedback, i) {
                        var letter = failed.attempt[i];
                        var className = 'reading-letter reading-letter-' + feedback;
                        html += '<span class="' + className + '">' + letter + '</span>';
                    });
                    html += '</div>';
                });
                html += '</div>';
            }

            // Input
            html += '<input type="text" id="reading-spelling-input" class="reading-spelling-input" maxlength="' + state.currentWord.length + '" placeholder="Type here..." autofocus>';

            // Buttons
            html += '<div class="reading-spelling-buttons">';
            html += '<button class="reading-btn reading-btn-primary" id="reading-submit-spelling">Check</button>';
            html += '<button class="reading-btn reading-btn-warning" id="reading-give-up">Give Up (lose 1 ❤️)</button>';
            html += '</div>';

            html += '</div>';

            this.container.innerHTML = html;
            this.attachSpellingHandlers();
        },

        /**
         * Attach spelling screen handlers
         */
        attachSpellingHandlers: function() {
            var self = this;
            var state = window.ReadingGameState;

            var input = document.getElementById('reading-spelling-input');
            var submitBtn = document.getElementById('reading-submit-spelling');
            var giveUpBtn = document.getElementById('reading-give-up');

            if (input) {
                input.focus();

                // Submit on Enter key
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        submitBtn.click();
                    }
                });
            }

            if (submitBtn) {
                submitBtn.addEventListener('click', function() {
                    var attempt = input.value.trim();

                    if (!attempt) {
                        alert('Please type a word');
                        return;
                    }

                    if (attempt.length !== state.currentWord.length) {
                        alert('Word must be ' + state.currentWord.length + ' letters');
                        return;
                    }

                    var result = state.submitAttempt(attempt);

                    if (result.correct) {
                        window.ReadingGameAudio.playWordComplete();
                        self.showCorrectFeedback(result, function() {
                            if (result.storyComplete) {
                                var completion = state.completeStory();
                                self.render();
                            } else {
                                state.setState('reading');
                                self.render();
                            }
                        });
                    } else if (result.heartLost) {
                        window.ReadingGameAudio.playHeartLost();
                        self.showHeartLost(result, function() {
                            if (result.gameOver) {
                                var completion = state.completeStory();
                                self.render();
                            } else if (result.storyComplete) {
                                var completion = state.completeStory();
                                self.render();
                            } else {
                                state.setState('reading');
                                self.render();
                            }
                        });
                    } else {
                        window.ReadingGameAudio.playWrongLetter();
                        self.render();
                    }
                });
            }

            if (giveUpBtn) {
                giveUpBtn.addEventListener('click', function() {
                    if (confirm('Give up and lose 1 heart?')) {
                        var result = state.skipWord();
                        window.ReadingGameAudio.playHeartLost();

                        self.showSkipFeedback(result, function() {
                            if (result.gameOver) {
                                var completion = state.completeStory();
                                self.render();
                            } else if (result.storyComplete) {
                                var completion = state.completeStory();
                                self.render();
                            } else {
                                state.resetWordState();
                                state.setState('reading');
                                self.render();
                            }
                        });
                    }
                });
            }
        },

        /**
         * Show correct spelling feedback
         */
        showCorrectFeedback: function(result, callback) {
            var self = this;

            // Create success overlay
            var overlay = document.createElement('div');
            overlay.className = 'reading-success-overlay';
            overlay.innerHTML = '<div class="reading-success-content">' +
                '<div class="reading-success-checkmark">✓</div>' +
                '<div class="reading-success-text">Correct!</div>' +
                '<div class="reading-success-sparks">' +
                '<span class="reading-spark">✨</span>' +
                '<span class="reading-spark">⭐</span>' +
                '<span class="reading-spark">✨</span>' +
                '<span class="reading-spark">⭐</span>' +
                '</div>' +
                '</div>';

            document.body.appendChild(overlay);

            // Trigger animation
            setTimeout(function() {
                overlay.classList.add('reading-success-show');
            }, 10);

            // Remove and callback after animation
            setTimeout(function() {
                overlay.classList.remove('reading-success-show');
                setTimeout(function() {
                    document.body.removeChild(overlay);
                    callback();
                }, 300);
            }, 1500);
        },

        /**
         * Show heart lost feedback
         */
        showHeartLost: function(result, callback) {
            setTimeout(function() {
                callback();
            }, 1000);
        },

        /**
         * Show skip feedback
         */
        showSkipFeedback: function(result, callback) {
            // Create skip overlay
            var overlay = document.createElement('div');
            overlay.className = 'reading-skip-overlay';
            overlay.innerHTML = '<div class="reading-skip-content">' +
                '<div class="reading-skip-icon">💔</div>' +
                '<div class="reading-skip-text">Skipped!</div>' +
                '<div class="reading-skip-word">The word was: <strong>' + result.revealedWord + '</strong></div>' +
                '</div>';

            document.body.appendChild(overlay);

            setTimeout(function() {
                overlay.classList.add('reading-skip-show');
            }, 10);

            setTimeout(function() {
                overlay.classList.remove('reading-skip-show');
                setTimeout(function() {
                    document.body.removeChild(overlay);
                    callback();
                }, 300);
            }, 2000);
        },

        /**
         * Render completion screen
         */
        renderComplete: function() {
            var state = window.ReadingGameState;
            var won = state.hearts > 0;

            var html = '<div class="reading-complete">';

            if (won) {
                html += '<div class="reading-success">';
                html += '<h1>🎉 Amazing Job!</h1>';

                if (state.trophyEarned) {
                    window.ReadingGameAudio.playTrophyEarned();
                    html += '<div class="reading-trophy-big">🏆</div>';
                    html += '<p>You earned a trophy!</p>';
                } else {
                    html += '<h2>✅ Story Complete!</h2>';
                }

                // Stats
                html += '<div class="reading-stats">';
                html += '<p>❤️ Hearts Remaining: ' + state.hearts + '</p>';
                html += '<p>✅ Words Completed: ' + state.completedWords.length + '</p>';
                if (state.skippedWords.length > 0) {
                    html += '<p>⏭️ Words Skipped: ' + state.skippedWords.length + '</p>';
                }
                html += '</div>';

                // Dana's picture placeholder
                html += '<div class="reading-victory-image">';
                html += '<p>🎨 [Dana\'s Victory Picture]</p>';
                html += '</div>';

                html += '</div>';
            } else {
                html += '<div class="reading-failure">';
                html += '<h1>Nice Try!</h1>';
                html += '<p>You ran out of hearts, but you can try again!</p>';

                // Show full story
                if (state.currentStory) {
                    html += '<div class="reading-story-reveal">';
                    html += '<h3>Here\'s the full story:</h3>';
                    html += '<div class="reading-story-text">';
                    state.currentStory.sentences.forEach(function(s) {
                        html += '<p>' + s.text + '</p>';
                    });
                    html += '</div>';
                    html += '</div>';
                }

                html += '</div>';
            }

            // Buttons
            html += '<div class="reading-complete-buttons">';
            html += '<button class="reading-btn reading-btn-primary" id="reading-play-again">Play Again</button>';
            html += '<button class="reading-btn reading-btn-secondary" id="reading-view-library-complete">📚 Library</button>';
            html += '</div>';

            html += '</div>';

            this.container.innerHTML = html;
            this.attachCompleteHandlers();
        },

        /**
         * Attach completion screen handlers
         */
        attachCompleteHandlers: function() {
            var self = this;
            var state = window.ReadingGameState;

            var playAgainBtn = document.getElementById('reading-play-again');
            if (playAgainBtn) {
                playAgainBtn.addEventListener('click', function() {
                    state.setState('level-select');
                    self.render();
                });
            }

            var libraryBtn = document.getElementById('reading-view-library-complete');
            if (libraryBtn) {
                libraryBtn.addEventListener('click', function() {
                    state.setState('library');
                    self.render();
                });
            }
        },

        /**
         * Render library view
         */
        renderLibrary: function() {
            var stories = window.ReadingGameStorage.getStories();

            var html = '<div class="reading-library">';
            html += '<button class="reading-back-btn" id="reading-back-from-library">← Back</button>';
            html += '<h1>📚 Story Library</h1>';

            if (!stories || stories.length === 0) {
                html += '<p class="reading-empty-library">No stories yet. Generate your first story!</p>';
            } else {
                // Group by grade level
                var grades = ['Pre-K', '1st', '3rd'];

                grades.forEach(function(grade) {
                    var gradeStories = stories.filter(function(s) { return s.gradeLevel === grade; });

                    if (gradeStories.length > 0) {
                        var config = window.ReadingGameData.GRADE_LEVELS[grade];
                        html += '<div class="reading-library-section">';
                        html += '<h2>' + config.emoji + ' ' + config.displayName + '</h2>';
                        html += '<div class="reading-story-list">';

                        gradeStories.forEach(function(story) {
                            html += '<div class="reading-story-card">';
                            html += '<h3>' + story.title + '</h3>';
                            html += '<p class="reading-story-meta">';
                            html += story.length + ' • ' + story.sentences.length + ' sentences';
                            if (story.trophyEarned) {
                                html += ' • 🏆';
                            }
                            html += '</p>';
                            html += '<div class="reading-story-actions">';
                            html += '<button class="reading-btn reading-btn-small reading-read-story" data-story-id="' + story.id + '">Read</button>';
                            html += '<button class="reading-btn reading-btn-small reading-btn-danger reading-delete-story" data-story-id="' + story.id + '">Delete</button>';
                            html += '</div>';
                            html += '</div>';
                        });

                        html += '</div>';
                        html += '</div>';
                    }
                });
            }

            html += '</div>';

            this.container.innerHTML = html;
            this.attachLibraryHandlers();
        },

        /**
         * Attach library screen handlers
         */
        attachLibraryHandlers: function() {
            var self = this;
            var state = window.ReadingGameState;

            var backBtn = document.getElementById('reading-back-from-library');
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    state.setState('level-select');
                    self.render();
                });
            }

            var readBtns = this.container.querySelectorAll('.reading-read-story');
            readBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var storyId = this.getAttribute('data-story-id');
                    state.readStoryFromLibrary(storyId);
                    self.render();
                });
            });

            var deleteBtns = this.container.querySelectorAll('.reading-delete-story');
            deleteBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var storyId = this.getAttribute('data-story-id');
                    if (confirm('Delete this story? This cannot be undone.')) {
                        window.ReadingGameStorage.deleteStory(storyId);
                        self.render();
                    }
                });
            });
        }
    };
})();
