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
            // Second wrong: show solution, give fruit anyway
            const correctAnswer = this.currentProblem.choices[this.currentProblem.correctIndex];
            const feedback = document.getElementById('puzzle-feedback');
            feedback.innerHTML = `
                <div class="feedback-solution">
                    <p>The correct answer was: <strong>${correctAnswer}</strong></p>
                    <p>Let's keep going! You'll get the next one!</p>
                </div>
            `;
            AudioManager.playSound('wrong');

            setTimeout(() => {
                GameEngine.collectFruit(this.currentFruit);
                this.close();
            }, 2500);
        }
    },

    close() {
        const dialog = document.getElementById('math-puzzle-dialog');
        dialog.className = 'hidden';
        MathGame.state = 'gameplay';
        GameEngine.gameLoop();
    }
};

