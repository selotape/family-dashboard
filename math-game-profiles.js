// ============================================================================
// PROFILE SYSTEM - Manage 3 fixed profiles
// ============================================================================

const ProfileSystem = {
    profiles: [],

    init() {
        const data = StorageManager.getProfiles();
        this.profiles = data.profiles;

        // Validate and fix grade levels (in case localStorage has wrong values)
        const correctGradeLevels = { 'noga': 3, 'dana': 1, 'ella': 0 };
        let needsSave = false;

        this.profiles.forEach(profile => {
            const correctGrade = correctGradeLevels[profile.id];
            if (correctGrade !== undefined && profile.gradeLevel !== correctGrade) {
                console.log(`Fixing ${profile.name}'s grade level from ${profile.gradeLevel} to ${correctGrade}`);
                profile.gradeLevel = correctGrade;
                needsSave = true;
            }
        });

        if (needsSave) {
            StorageManager.saveProfiles(data);
        }
    },

    selectProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (profile) {
            MathGame.activeProfile = profile;
            StorageManager.setActiveProfile(profileId);
            MathGame.showWorldMap();
        }
    },

    updateStats(levelId, stats) {
        const profile = MathGame.activeProfile;

        // Update level stats
        profile.levelStats[levelId] = stats;

        // Update lifetime stats
        profile.totalFruits += stats.fruitsCollected;
        profile.totalProblemsCorrect += stats.correctAnswers;
        profile.totalProblemsAttempted += stats.totalProblems;

        if (profile.totalProblemsAttempted > 0) {
            profile.lifetimeAccuracy = Math.round(
                (profile.totalProblemsCorrect / profile.totalProblemsAttempted) * 100
            );
        }

        // Advance to next level if completed
        if (stats.completed && profile.currentLevel === levelId) {
            profile.currentLevel = Math.min(7, levelId + 1);
        }

        StorageManager.updateProfile(profile.id, profile);
    },

    getStars(accuracy) {
        if (accuracy >= 100) return 3;
        if (accuracy >= 80) return 2;
        if (accuracy >= 60) return 1;
        return 0;
    }
};

