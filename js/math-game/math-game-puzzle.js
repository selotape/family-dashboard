// ============================================================================
// PUZZLE SYSTEM - Show puzzles, validate answers, two-chance logic
// ============================================================================

const PuzzleSystem = {
    currentFruit: null,
    currentProblem: null,
    attempts: 0,
    keyboardHandler: null,

    show(fruit) {
        this.currentFruit = fruit;
        this.currentProblem = this.shuffleProblem(fruit.problem);
        this.attempts = 0;

        const dialog = document.getElementById('math-puzzle-dialog');
        dialog.className = 'puzzle-dialog';
        const formattedQuestion = this.formatQuestionWithLargeClocks(this.currentProblem.question);
        dialog.innerHTML = `
            <div class="puzzle-content">
                <h2>Math Challenge!</h2>
                <p class="puzzle-question">${formattedQuestion}</p>
                <div class="puzzle-choices">
                    ${this.currentProblem.choices.map((choice, i) => `
                        <button class="puzzle-choice" data-choice-index="${i}">${choice}</button>
                    `).join('')}
                </div>
                <div class="puzzle-hint">Press 1-4 or click to answer</div>
                <div class="puzzle-feedback" id="puzzle-feedback"></div>
            </div>
        `;

        // Add click listeners to buttons
        document.querySelectorAll('.puzzle-choice').forEach((btn, i) => {
            btn.addEventListener('click', () => this.checkAnswer(i));
        });

        // Add keyboard support
        this.setupKeyboardHandlers();
    },

    setupKeyboardHandlers() {
        // Remove old handler if exists
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }

        // Create new handler
        this.keyboardHandler = (e) => {
            if (MathGame.state !== 'puzzle') return;

            // ESC key to exit
            if (e.key === 'Escape') {
                e.preventDefault();
                if (confirm('Exit puzzle without answering?')) {
                    this.close();
                }
                return;
            }

            // Number keys 1-4 to select answer
            const key = e.key;
            if (key >= '1' && key <= '4') {
                e.preventDefault();
                const choiceIndex = parseInt(key) - 1;
                if (choiceIndex < this.currentProblem.choices.length) {
                    this.checkAnswer(choiceIndex);
                }
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
    },

    checkAnswer(choiceIndex) {
        const isElla = MathGame.activeProfile.gradeLevel === 0;
        const correct = choiceIndex === this.currentProblem.correctIndex;

        GameEngine.gameStats.totalProblems++;

        if (correct) {
            GameEngine.gameStats.correctAnswers++;
            this.handleCorrect();
        } else {
            GameEngine.gameStats.wrongAnswers++;

            if (isElla) {
                // Ella mode: always encouraging, show answer and continue
                this.handleEllaWrong();
            } else {
                this.handleWrong();
            }
        }
    },

    handleCorrect() {
        const feedback = document.getElementById('puzzle-feedback');
        feedback.innerHTML = '<div class="feedback-correct">✅ Correct! Great job!</div>';
        AudioManager.playSound('correct');

        setTimeout(() => {
            GameEngine.collectFruit(this.currentFruit);
            this.close();
        }, 1000);
    },

    handleEllaWrong() {
        const correctAnswer = this.currentProblem.choices[this.currentProblem.correctIndex];
        const feedback = document.getElementById('puzzle-feedback');
        feedback.innerHTML = `
            <div class="feedback-ella">
                <p>Good try! The answer is <strong>${correctAnswer}</strong></p>
                <p>You're doing great! Let's collect the fruit! 🎉</p>
            </div>
        `;

        setTimeout(() => {
            GameEngine.collectFruit(this.currentFruit);
            this.close();
        }, 3500);
    },

    handleWrong() {
        this.attempts++;

        if (this.attempts === 1) {
            // First wrong: lose 1 heart, try again
            GameEngine.gameStats.hearts--;
            const feedback = document.getElementById('puzzle-feedback');
            feedback.innerHTML = '<div class="feedback-wrong">❌ Try again! (-1 heart)</div>';
            AudioManager.playSound('wrong');
        } else {
            // Second wrong: show solution, then give similar problem
            const correctAnswer = this.currentProblem.choices[this.currentProblem.correctIndex];
            const feedback = document.getElementById('puzzle-feedback');
            feedback.innerHTML = `
                <div class="feedback-solution">
                    <p>The correct answer was: <strong>${correctAnswer}</strong></p>
                    <p>Now try a similar problem!</p>
                </div>
            `;
            AudioManager.playSound('wrong');

            // Generate similar problem after showing solution
            setTimeout(() => {
                this.attempts = 0; // Reset attempts for similar problem
                this.currentProblem = this.generateSimilarProblem(this.currentProblem);
                this.renderProblem(); // Show new problem
                feedback.innerHTML = '<div class="feedback-info">💡 You can do this!</div>';
            }, 4000);
        }
    },

    shuffleProblem(problem) {
        // Create a copy of the problem to avoid mutating the original
        const correctAnswer = problem.choices[problem.correctIndex];

        // Create array of choice-index pairs for shuffling
        const choicesWithIndices = problem.choices.map((choice, i) => ({ choice, originalIndex: i }));

        // Shuffle using Fisher-Yates algorithm (better than sort with random)
        for (let i = choicesWithIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choicesWithIndices[i], choicesWithIndices[j]] = [choicesWithIndices[j], choicesWithIndices[i]];
        }

        // Extract shuffled choices and find new correct index
        const shuffledChoices = choicesWithIndices.map(item => item.choice);
        const newCorrectIndex = shuffledChoices.indexOf(correctAnswer);

        return {
            question: problem.question,
            choices: shuffledChoices,
            correctIndex: newCorrectIndex
        };
    },

    formatQuestionWithLargeClocks(question) {
        // Clock emojis: 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚 🕛
        // and half-hour versions: 🕜 🕝 🕞 🕟 🕠 🕡 🕢 🕣 🕤 🕥 🕦 🕧
        const clockEmojis = /[\u{1F550}-\u{1F567}]/gu;
        return question.replace(clockEmojis, '<span class="large-clock">$&</span>');
    },

    renderProblem() {
        const questionEl = document.querySelector('.puzzle-question');
        const choicesEl = document.querySelector('.puzzle-choices');

        questionEl.innerHTML = this.formatQuestionWithLargeClocks(this.currentProblem.question);
        choicesEl.innerHTML = this.currentProblem.choices.map((choice, i) => `
            <button class="puzzle-choice" data-choice-index="${i}">${choice}</button>
        `).join('');

        // Re-add click listeners to new buttons
        document.querySelectorAll('.puzzle-choice').forEach((btn, i) => {
            btn.addEventListener('click', () => this.checkAnswer(i));
        });
    },

    generateSimilarProblem(originalProblem) {
        const gradeLevel = MathGame.activeProfile.gradeLevel;

        // For 3rd grade (Noga)
        if (gradeLevel === 3) {
            const num1 = Math.floor(Math.random() * 300) + 100; // 100-400
            const num2 = Math.floor(Math.random() * 200) + 50;  // 50-250
            const operation = Math.random() > 0.5 ? 'add' : 'subtract';

            if (operation === 'add') {
                const answer = num1 + num2;
                const { choices, correctIndex } = this.generateChoices(answer, 2000);
                return {
                    question: `🦁 A lion has ${num1} cubs. ${num2} more are born. How many cubs?`,
                    choices: choices,
                    correctIndex: correctIndex
                };
            } else {
                const answer = num1 - num2;
                const { choices, correctIndex } = this.generateChoices(answer, 2000);
                return {
                    question: `🦒 A giraffe herd has ${num1} members. ${num2} leave. How many remain?`,
                    choices: choices,
                    correctIndex: correctIndex
                };
            }
        }

        // For 1st grade (Dana)
        else if (gradeLevel === 1) {
            const num1 = Math.floor(Math.random() * 10) + 5;  // 5-15
            const num2 = Math.floor(Math.random() * 8) + 2;   // 2-10
            const operation = Math.random() > 0.5 ? 'add' : 'subtract';

            if (operation === 'add' && num1 + num2 <= 20) {
                const answer = num1 + num2;
                const { choices, correctIndex } = this.generateChoices(answer, 20);
                return {
                    question: `🦁 ${num1} lions play. ${num2} more join. How many?`,
                    choices: choices,
                    correctIndex: correctIndex
                };
            } else {
                const answer = Math.max(num1 - num2, 0);
                const { choices, correctIndex } = this.generateChoices(answer, 20);
                return {
                    question: `🐘 ${num1} elephants drink water. ${num2} leave. How many left?`,
                    choices: choices,
                    correctIndex: correctIndex
                };
            }
        }

        // For Pre-K (Ella) - Note: Ella mode auto-collects, but this is for consistency
        else {
            const count = Math.floor(Math.random() * 5) + 3; // 3-8
            const emojis = ['🦁', '🐘', '🦒', '🦓'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const { choices, correctIndex } = this.generateChoices(count, 10);
            return {
                question: `Count! ${emoji.repeat(count)}`,
                choices: choices,
                correctIndex: correctIndex
            };
        }
    },

    generateChoices(correctAnswer, max = 1000) {
        const choices = [correctAnswer];

        // Generate 3 wrong answers within reasonable range
        while (choices.length < 4) {
            const offset = Math.floor(Math.random() * 20) - 10; // ±10
            const wrong = correctAnswer + offset;
            if (wrong !== correctAnswer && wrong > 0 && wrong <= max && !choices.includes(wrong)) {
                choices.push(wrong);
            }
        }

        // Shuffle and find new correct index
        const shuffled = choices.sort(() => Math.random() - 0.5);
        const correctIndex = shuffled.indexOf(correctAnswer);

        return {
            choices: shuffled.map(String),
            correctIndex: correctIndex
        };
    },

    close() {
        // Clean up keyboard handler
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }

        const dialog = document.getElementById('math-puzzle-dialog');
        dialog.className = 'hidden';
        MathGame.state = 'gameplay';
        GameEngine.gameLoop();
    }
};

