// ============================================================================
// PUZZLE SYSTEM - Show puzzles, validate answers, two-chance logic
// ============================================================================

const PuzzleSystem = {
    currentFruit: null,
    currentProblem: null,
    attempts: 0,

    show(fruit) {
        this.currentFruit = fruit;
        this.currentProblem = fruit.problem;
        this.attempts = 0;

        const dialog = document.getElementById('math-puzzle-dialog');
        dialog.className = 'puzzle-dialog';
        dialog.innerHTML = `
            <div class="puzzle-content">
                <h2>Math Challenge!</h2>
                <p class="puzzle-question">${this.currentProblem.question}</p>
                <div class="puzzle-choices">
                    ${this.currentProblem.choices.map((choice, i) => `
                        <button class="puzzle-choice" onclick="PuzzleSystem.checkAnswer(${i})">${choice}</button>
                    `).join('')}
                </div>
                <div class="puzzle-feedback" id="puzzle-feedback"></div>
            </div>
        `;
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
        }, 2000);
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
            }, 2500);
        }
    },

    renderProblem() {
        const questionEl = document.querySelector('.puzzle-question');
        const choicesEl = document.querySelector('.puzzle-choices');

        questionEl.textContent = this.currentProblem.question;
        choicesEl.innerHTML = this.currentProblem.choices.map((choice, i) => `
            <button class="puzzle-choice" onclick="PuzzleSystem.checkAnswer(${i})">${choice}</button>
        `).join('');
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
        const dialog = document.getElementById('math-puzzle-dialog');
        dialog.className = 'hidden';
        MathGame.state = 'gameplay';
        GameEngine.gameLoop();
    }
};

