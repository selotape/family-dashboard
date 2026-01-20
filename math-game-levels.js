// ============================================================================
// LEVEL MANAGER - Load levels and generate problems
// ============================================================================

const LevelManager = {
    currentLevel: null,
    currentProblems: [],

    loadLevel(levelId) {
        this.currentLevel = LEVELS.find(l => l.id === levelId);
        if (!this.currentLevel) return;

        // Load appropriate problems based on grade level and difficulty
        const gradeLevel = MathGame.activeProfile.gradeLevel;
        const difficulty = MathGame.activeProfile.difficulty || 'easy';
        const problemSet = this.getProblemsForGrade(gradeLevel, difficulty);
        this.currentProblems = problemSet.map((p, i) => ({
            ...p,
            id: i,
            collected: false
        }));

        GameEngine.initLevel(this.currentLevel, this.currentProblems);
    },

    loadPracticeLevel() {
        this.currentLevel = PRACTICE_LEVEL;
        this.currentProblems = []; // No problems in practice mode

        GameEngine.initLevel(this.currentLevel, this.currentProblems);
    },

    getProblemsForGrade(gradeLevel, difficulty = 'easy') {
        const theme = this.currentLevel.theme;
        const problemSet = PROBLEMS[theme];

        if (!problemSet) {
            console.error(`No problems found for theme: ${theme}`);
            return [];
        }

        let problems;
        if (gradeLevel === 3) problems = problemSet.grade3;
        else if (gradeLevel === 1) problems = problemSet.grade1;
        else problems = problemSet.gradePreK;

        // Apply difficulty scaling
        if (difficulty !== 'easy' && problems) {
            problems = this.scaleProblemsForDifficulty(problems, difficulty, gradeLevel);
        }

        return problems;
    },

    scaleProblemsForDifficulty(problems, difficulty, gradeLevel) {
        if (gradeLevel === 0) {
            // Pre-K: Don't scale, keep easy
            return problems;
        }

        const scale = difficulty === 'hard' ? 2.5 : 1.75; // medium=1.75x, hard=2.5x

        return problems.map(prob => {
            // Extract numbers from question and choices
            const scaledQuestion = this.scaleNumbersInText(prob.question, scale, gradeLevel);
            const scaledChoices = prob.choices.map(choice => this.scaleNumbersInText(choice, scale, gradeLevel));

            return {
                question: scaledQuestion,
                choices: scaledChoices,
                correctIndex: prob.correctIndex
            };
        });
    },

    scaleNumbersInText(text, scale, gradeLevel) {
        // Replace numbers in text with scaled versions
        return text.replace(/\d+/g, (match) => {
            const num = parseInt(match);
            let scaled = Math.round(num * scale);

            // For grade 1, keep within reasonable bounds (max 999)
            if (gradeLevel === 1) {
                scaled = Math.min(scaled, 999);
            } else if (gradeLevel === 3) {
                // For grade 3, allow larger numbers but cap at 9999
                scaled = Math.min(scaled, 9999);
            }

            return scaled.toString();
        });
    },

    getProblem(problemId) {
        return this.currentProblems[problemId];
    }
};

