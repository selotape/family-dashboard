// ============================================================================
// UI MANAGER - Render screens (profile select, world map, celebration)
// ============================================================================

const UIManager = {
    renderProfileSelect() {
        const ui = document.getElementById('math-game-ui');
        const profiles = ProfileSystem.profiles;

        ui.innerHTML = `
            <div class="profile-select-screen">
                <h1>🎓 Capy's Math Adventure</h1>
                <h2>Select Your Profile</h2>
                <div class="profile-cards">
                    ${profiles.map(p => `
                        <div class="profile-card" onclick="ProfileSystem.selectProfile('${p.id}')">
                            <div class="profile-avatar">${p.avatar}</div>
                            <div class="profile-name">${p.name}</div>
                            <div class="profile-grade">${this.getGradeLabel(p.gradeLevel)}</div>
                            <div class="profile-stats">
                                <div>Level ${p.currentLevel}/7</div>
                                <div>🍎 ${p.totalFruits}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Hide canvas
        MathGame.canvas.style.display = 'none';
    },

    renderWorldMap() {
        const ui = document.getElementById('math-game-ui');
        const profile = MathGame.activeProfile;
        const currentLevel = profile.currentLevel;

        ui.innerHTML = `
            <div class="world-map-screen">
                <div class="world-map-header">
                    <button class="back-btn" onclick="MathGame.showProfileSelect()">← Back</button>
                    <h1>${profile.avatar} ${profile.name}'s Adventure</h1>
                    <div class="world-map-stats">
                        <div>Level ${currentLevel}/7</div>
                        <div>🍎 ${profile.totalFruits}</div>
                        <div>${profile.lifetimeAccuracy}% accuracy</div>
                    </div>
                </div>

                <button class="continue-btn" onclick="MathGame.startLevel(${currentLevel})">
                    Continue Adventure →
                </button>

                <div class="world-map-levels">
                    ${this.renderLevelPath()}
                </div>

                <div class="debug-controls">
                    <button class="debug-reset-btn" onclick="UIManager.resetProgress()">
                        🔧 Debug: Reset All Progress
                    </button>
                    <button class="debug-skip-btn" onclick="UIManager.toggleSkipLevels()">
                        🔓 Skip Levels
                    </button>
                </div>

                <div id="skip-levels-container" class="skip-levels-container hidden">
                    <label for="skip-level-select">Jump to Level:</label>
                    <select id="skip-level-select" onchange="UIManager.skipToLevel(this.value)">
                        ${[1,2,3,4,5,6,7].map(level => `
                            <option value="${level}" ${level === currentLevel ? 'selected' : ''}>
                                Level ${level}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;

        // Hide canvas
        MathGame.canvas.style.display = 'none';
    },

    renderLevelPath() {
        const profile = MathGame.activeProfile;
        const levelNames = [
            '🦁 Safari',
            '🌊 Ocean',
            '🐠 Underwater',
            '🏙️ Atlanta',
            '🕌 Israel',
            '☁️ Sky',
            '👧 Noga Reunion'
        ];

        return levelNames.map((name, i) => {
            const levelNum = i + 1;
            const isCompleted = profile.levelStats[levelNum]?.completed;
            const isCurrent = profile.currentLevel === levelNum;
            const isLocked = levelNum > profile.currentLevel;
            const stars = profile.levelStats[levelNum]?.stars || 0;

            let className = 'level-node';
            if (isCurrent) className += ' current';
            if (isCompleted) className += ' completed';
            if (isLocked) className += ' locked';

            return `
                <div class="${className}">
                    <div class="level-icon">${name}</div>
                    <div class="level-number">Level ${levelNum}</div>
                    ${isCompleted ? `<div class="level-stars">${'⭐'.repeat(stars)}</div>` : ''}
                    ${isCurrent ? '<div class="capy-marker">🐾</div>' : ''}
                    ${isLocked ? '<div class="lock-icon">🔒</div>' : ''}
                </div>
            `;
        }).join('');
    },

    renderCelebration() {
        const ui = document.getElementById('math-game-ui');
        const profile = MathGame.activeProfile;
        const stats = GameEngine.gameStats;
        const levelId = LevelManager.currentLevel.id;
        const levelStats = profile.levelStats[levelId];

        ui.innerHTML = `
            <div class="celebration-screen">
                <h1>🎉 Level Complete! 🎉</h1>

                <div class="fruit-party">
                    <div class="fruit-cake">🎂</div>
                    <div class="dancing-fruits">
                        <span class="dancing">🍎</span>
                        <span class="dancing">🍊</span>
                        <span class="dancing">🍋</span>
                        <span class="dancing">🍌</span>
                        <span class="dancing">🍇</span>
                    </div>
                </div>

                <div class="celebration-stats">
                    <h2>${'⭐'.repeat(levelStats.stars)} ${levelStats.stars} Stars!</h2>
                    <div class="stat-row">
                        <span>Fruits Collected:</span>
                        <span>${stats.fruitsCollected}/${LevelManager.currentLevel.fruits.length}</span>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span>
                        <span>${levelStats.accuracy}%</span>
                    </div>
                    <div class="stat-row">
                        <span>Time:</span>
                        <span>${levelStats.bestTime} seconds</span>
                    </div>
                </div>

                <div class="next-level-preview">
                    ${levelId < 7 ? `
                        <p>Next up: Level ${levelId + 1}</p>
                        <p class="next-level-hint">Get ready for new adventures!</p>
                    ` : `
                        <p>You've completed all levels!</p>
                        <p class="next-level-hint">Amazing work! 🏆</p>
                    `}
                </div>

                <button class="continue-btn" onclick="MathGame.showWorldMap()">
                    Continue →
                </button>
            </div>
        `;

        // Hide canvas
        MathGame.canvas.style.display = 'none';
    },

    getGradeLabel(gradeLevel) {
        if (gradeLevel === 0) return 'Pre-K';
        if (gradeLevel === 1) return '1st Grade';
        if (gradeLevel === 3) return '3rd Grade';
        return `Grade ${gradeLevel}`;
    },

    resetProgress() {
        if (confirm('🔧 DEBUG MODE\n\nThis will reset ALL progress for ALL profiles.\n\nAre you sure?')) {
            localStorage.removeItem('mathGame_profiles');
            StorageManager.init();
            ProfileSystem.init();
            alert('✅ Progress reset! Returning to profile selection...');
            MathGame.showProfileSelect();
        }
    },

    skipLevelsUnlocked: false,

    toggleSkipLevels() {
        if (!this.skipLevelsUnlocked) {
            const password = prompt('🔒 Enter password to unlock Skip Levels:');
            if (password === 'Limonit2017') {
                this.skipLevelsUnlocked = true;
                alert('✅ Skip Levels unlocked!');
                const container = document.getElementById('skip-levels-container');
                if (container) {
                    container.classList.remove('hidden');
                }
            } else if (password !== null) {
                alert('❌ Incorrect password!');
            }
        } else {
            const container = document.getElementById('skip-levels-container');
            if (container) {
                container.classList.toggle('hidden');
            }
        }
    },

    skipToLevel(level) {
        const levelNum = parseInt(level);
        if (levelNum >= 1 && levelNum <= 7) {
            if (confirm(`Skip to Level ${levelNum}?\n\nThis will update ${MathGame.activeProfile.name}'s progress.`)) {
                MathGame.activeProfile.currentLevel = levelNum;
                ProfileSystem.saveProfiles();
                alert(`✅ Jumped to Level ${levelNum}!`);
                MathGame.showWorldMap();
            }
        }
    }
};

