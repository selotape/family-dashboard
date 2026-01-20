// ============================================================================
// STORAGE MANAGER - LocalStorage wrapper
// ============================================================================

const StorageManager = {
    PROFILES_KEY: 'mathGame_profiles',

    init() {
        // Initialize profiles if they don't exist
        if (!localStorage.getItem(this.PROFILES_KEY)) {
            this.initializeProfiles();
        }
    },

    initializeProfiles() {
        const defaultData = {
            profiles: [
                {
                    id: 'noga',
                    name: 'Noga',
                    gradeLevel: 3,
                    avatar: '🎨',
                    currentLevel: 1,
                    levelStats: {},
                    totalFruits: 0,
                    totalProblemsCorrect: 0,
                    totalProblemsAttempted: 0,
                    lifetimeAccuracy: 0
                },
                {
                    id: 'dana',
                    name: 'Dana',
                    gradeLevel: 1,
                    avatar: '🌟',
                    currentLevel: 1,
                    levelStats: {},
                    totalFruits: 0,
                    totalProblemsCorrect: 0,
                    totalProblemsAttempted: 0,
                    lifetimeAccuracy: 0
                },
                {
                    id: 'ella',
                    name: 'Ella',
                    gradeLevel: 0,
                    avatar: '🌈',
                    currentLevel: 1,
                    levelStats: {},
                    totalFruits: 0,
                    totalProblemsCorrect: 0,
                    totalProblemsAttempted: 0,
                    lifetimeAccuracy: 0
                }
            ],
            activeProfileId: null
        };
        localStorage.setItem(this.PROFILES_KEY, JSON.stringify(defaultData));
    },

    getProfiles() {
        const data = localStorage.getItem(this.PROFILES_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveProfiles(data) {
        localStorage.setItem(this.PROFILES_KEY, JSON.stringify(data));
    },

    getProfile(profileId) {
        const data = this.getProfiles();
        return data.profiles.find(p => p.id === profileId);
    },

    updateProfile(profileId, updates) {
        const data = this.getProfiles();
        const profile = data.profiles.find(p => p.id === profileId);
        if (profile) {
            Object.assign(profile, updates);
            this.saveProfiles(data);
        }
    },

    setActiveProfile(profileId) {
        const data = this.getProfiles();
        data.activeProfileId = profileId;
        this.saveProfiles(data);
    }
};

