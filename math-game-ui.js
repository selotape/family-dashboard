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
                    ${profiles.map(p => {
                        const diff = (p.difficulty || 'easy').toUpperCase();
                        const diffEmoji = p.difficulty === 'hard' ? '🔥' : p.difficulty === 'medium' ? '⭐' : '🌱';
                        return `
                        <div class="profile-card" onclick="ProfileSystem.selectProfile('${p.id}')">
                            <div class="profile-avatar">${p.avatar}</div>
                            <div class="profile-name">${p.name}</div>
                            <div class="profile-grade">${this.getGradeLabel(p.gradeLevel)}</div>
                            <div class="profile-difficulty">${diffEmoji} ${diff}</div>
                            <div class="profile-stats">
                                <div>Level ${p.currentLevel}/7</div>
                                <div>🍎 ${p.totalFruits}</div>
                            </div>
                        </div>
                    `}).join('')}
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
                    <div class="difficulty-badge ${profile.difficulty || 'easy'}">
                        ${profile.difficulty === 'hard' ? '🔥 HARD' : profile.difficulty === 'medium' ? '⭐ MEDIUM' : '🌱 EASY'}
                    </div>
                    <div class="world-map-stats">
                        <div>Level ${currentLevel}/7</div>
                        <div>🍎 ${profile.totalFruits}</div>
                        <div>${profile.lifetimeAccuracy}% accuracy</div>
                    </div>
                </div>

                <button class="continue-btn" onclick="MathGame.startLevel(${currentLevel})">
                    Continue Adventure →
                </button>

                <button class="practice-btn" onclick="MathGame.startPracticeLevel()">
                    🎯 Practice Playground (No Pressure!)
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
                    <button class="debug-fruits-btn" onclick="UIManager.toggleAddFruits()">
                        🍎 Add Fruits
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

                <div id="add-fruits-container" class="add-fruits-container hidden">
                    <label for="fruits-amount">Number of Fruits:</label>
                    <input type="number" id="fruits-amount" min="1" max="1000" value="10">
                    <button onclick="UIManager.addFruits()">Add Fruits</button>
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
        console.log('UIManager.renderCelebration called');
        const ui = document.getElementById('math-game-ui');
        const profile = MathGame.activeProfile;
        const stats = GameEngine.gameStats;
        const levelId = LevelManager.currentLevel.id;

        console.log('Level ID:', levelId);
        console.log('Profile levelStats:', profile.levelStats);
        console.log('Stats for this level:', profile.levelStats[levelId]);

        // Ensure levelStats exists (should have been set by updateStats)
        const levelStats = profile.levelStats[levelId] || {
            stars: 0,
            accuracy: 0,
            bestTime: 0
        };

        console.log('Using levelStats:', levelStats);

        // Determine background image based on level
        const bgImage = levelId === 0 ? 'bg-practice.jpg' : `bg-level-${levelId}-${['safari', 'ocean', 'underwater', 'atlanta', 'israel', 'sky', 'celebration'][levelId - 1]}.jpg`;

        ui.innerHTML = `
            <div class="celebration-screen" style="background-image: url('images/${bgImage}')">
                <div class="celebration-overlay">
                    <h1>🎉 Level Complete! 🎉</h1>

                    <div class="capybara-celebration">
                        <img src="images/capybara-dancing.gif" alt="Dancing Capybara" class="capy-dance">
                    </div>

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

    debugUnlocked: false,

    toggleSkipLevels() {
        if (!this.debugUnlocked) {
            // Show password modal
            this.showPasswordModal();
        } else {
            const container = document.getElementById('skip-levels-container');
            if (container) {
                container.classList.toggle('hidden');
            }
        }
    },

    toggleAddFruits() {
        if (!this.debugUnlocked) {
            // Show password modal
            this.showPasswordModal();
        } else {
            const container = document.getElementById('add-fruits-container');
            if (container) {
                container.classList.toggle('hidden');
            }
        }
    },

    addFruits() {
        const input = document.getElementById('fruits-amount');
        const amount = parseInt(input.value);

        if (isNaN(amount) || amount < 1) {
            alert('❌ Please enter a valid number of fruits!');
            return;
        }

        const profile = MathGame.activeProfile;
        profile.totalFruits += amount;

        // Save to localStorage
        const profiles = ProfileSystem.profiles;
        const profileIndex = profiles.findIndex(p => p.id === profile.id);
        if (profileIndex !== -1) {
            profiles[profileIndex] = profile;
            localStorage.setItem('mathGame_profiles', JSON.stringify(profiles));
        }

        alert(`✅ Added ${amount} fruits to ${profile.name}!\n\nTotal fruits: ${profile.totalFruits} 🍎`);

        // Reload the world map to show updated fruit count
        MathGame.showWorldMap();
    },

    showPasswordModal() {
        const modal = document.getElementById('password-modal');
        const input = document.getElementById('password-input');
        const submitBtn = document.getElementById('password-submit');
        const cancelBtn = document.getElementById('password-cancel');

        if (!modal || !input || !submitBtn || !cancelBtn) return;

        // Show modal
        modal.classList.remove('hidden');
        input.value = '';
        input.focus();

        // Handle submit
        const handleSubmit = () => {
            if (input.value === 'Limonit2017') {
                this.debugUnlocked = true;
                modal.classList.add('hidden');
                alert('✅ Debug features unlocked!\n\nYou can now use Skip Levels and Add Fruits.');
            } else {
                alert('❌ Incorrect password!');
                input.value = '';
                input.focus();
            }
        };

        // Handle cancel
        const handleCancel = () => {
            modal.classList.add('hidden');
            input.value = '';
        };

        // Add event listeners
        submitBtn.onclick = handleSubmit;
        cancelBtn.onclick = handleCancel;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') handleSubmit();
        };
    },

    skipToLevel(level) {
        const levelNum = parseInt(level);
        if (levelNum >= 1 && levelNum <= 7) {
            if (confirm(`Skip to Level ${levelNum}?\n\nThis will update ${MathGame.activeProfile.name}'s progress.`)) {
                // Update the profile's current level
                const profile = MathGame.activeProfile;
                profile.currentLevel = levelNum;

                // Save to localStorage
                const profiles = ProfileSystem.profiles;
                const profileIndex = profiles.findIndex(p => p.id === profile.id);
                if (profileIndex !== -1) {
                    profiles[profileIndex] = profile;
                    localStorage.setItem('mathGame_profiles', JSON.stringify(profiles));
                }

                // Reload the world map to show the new level
                MathGame.showWorldMap();
            }
        }
    }
};

