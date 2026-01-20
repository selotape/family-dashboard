// ============================================================================
// LEVEL MANAGER - Load levels and generate problems
// ============================================================================

const LevelManager = {
    currentLevel: null,
    currentProblems: [],

    loadLevel(levelId) {
        this.currentLevel = LEVELS.find(l => l.id === levelId);
        if (!this.currentLevel) return;

        // Load appropriate problems based on grade level
        const gradeLevel = MathGame.activeProfile.gradeLevel;
        const problemSet = this.getProblemsForGrade(gradeLevel);
        this.currentProblems = problemSet.map((p, i) => ({
            ...p,
            id: i,
            collected: false
        }));

        GameEngine.initLevel(this.currentLevel, this.currentProblems);
    },

    getProblemsForGrade(gradeLevel) {
        const theme = this.currentLevel.theme;
        const problemSet = PROBLEMS[theme];

        if (!problemSet) {
            console.error(`No problems found for theme: ${theme}`);
            return [];
        }

        if (gradeLevel === 3) return problemSet.grade3;
        if (gradeLevel === 1) return problemSet.grade1;
        return problemSet.gradePreK;
    },

    getProblem(problemId) {
        return this.currentProblems[problemId];
    }
};

