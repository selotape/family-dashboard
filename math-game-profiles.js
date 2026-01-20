// ============================================================================
// PROFILE SYSTEM - Manage 3 fixed profiles
// ============================================================================

const ProfileSystem = {
    profiles: [],

    init() {
        const data = StorageManager.getProfiles();

        // Safety check - if data is null or malformed, reinitialize
        if (!data || !data.profiles) {
            console.warn('Profile data is missing or malformed. Reinitializing...');
            StorageManager.initializeProfiles();
            const newData = StorageManager.getProfiles();
            this.profiles = newData.profiles;
        } else {
            this.profiles = data.profiles;
        }

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

            // Initialize difficulty if missing (for existing profiles)
            if (!profile.difficulty) {
                profile.difficulty = 'easy';
                needsSave = true;
            }

            // Initialize difficultyLevelStats if missing
            if (!profile.difficultyLevelStats) {
                profile.difficultyLevelStats = { easy: {}, medium: {}, hard: {} };
                needsSave = true;
            }

            // Check if player completed all levels before difficulty system was added
            // If they have old levelStats with all 7 levels complete, migrate to difficulty system
            if (profile.levelStats && Object.keys(profile.levelStats).length >= 7) {
                const hasAllLevelsComplete = [1, 2, 3, 4, 5, 6, 7].every(lvl =>
                    profile.levelStats[lvl] && profile.levelStats[lvl].completed
                );

                if (hasAllLevelsComplete && profile.difficulty === 'easy') {
                    // Copy existing stats to easy difficulty
                    profile.difficultyLevelStats.easy = { ...profile.levelStats };

                    // Advance to medium and reset to level 1
                    profile.difficulty = 'medium';
                    profile.currentLevel = 1;
                    needsSave = true;

                    console.log(`${profile.name} had all levels complete! Advanced to MEDIUM difficulty.`);
                }
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
        const difficulty = profile.difficulty || 'easy';

        // Update level stats (current view)
        profile.levelStats[levelId] = stats;

        // Also save to difficulty-specific stats
        if (!profile.difficultyLevelStats[difficulty]) {
            profile.difficultyLevelStats[difficulty] = {};
        }
        profile.difficultyLevelStats[difficulty][levelId] = stats;

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

        // Check if all 7 levels completed at current difficulty
        if (this.hasCompletedAllLevels(profile, difficulty)) {
            this.advanceDifficulty(profile);
        }

        StorageManager.updateProfile(profile.id, profile);
    },

    hasCompletedAllLevels(profile, difficulty) {
        const diffStats = profile.difficultyLevelStats[difficulty];
        if (!diffStats) return false;

        // Check if levels 1-7 are all completed
        for (let i = 1; i <= 7; i++) {
            if (!diffStats[i] || !diffStats[i].completed) {
                return false;
            }
        }
        return true;
    },

    advanceDifficulty(profile) {
        const currentDiff = profile.difficulty;
        let newDiff = null;

        if (currentDiff === 'easy') {
            newDiff = 'medium';
        } else if (currentDiff === 'medium') {
            newDiff = 'hard';
        }

        if (newDiff) {
            console.log(`${profile.name} completed all levels on ${currentDiff}! Advancing to ${newDiff}`);
            profile.difficulty = newDiff;
            profile.currentLevel = 1; // Start over at level 1 with new difficulty

            // Show congratulations message
            setTimeout(() => {
                alert(`🎉 Congratulations ${profile.name}! You completed all levels on ${currentDiff.toUpperCase()} difficulty!\n\nYou're now on ${newDiff.toUpperCase()} difficulty. Get ready for a challenge!`);
            }, 1000);
        }
    },

    getStars(accuracy) {
        if (accuracy >= 100) return 3;
        if (accuracy >= 80) return 2;
        if (accuracy >= 60) return 1;
        return 0;
    }
};

