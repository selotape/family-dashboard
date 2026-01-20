        // Tab switching
        function switchToTab(pageName) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

            const tab = document.querySelector(`.tab[data-page="${pageName}"]`);
            const page = document.getElementById(pageName);

            if (tab && page) {
                tab.classList.add('active');
                page.classList.add('active');
                localStorage.setItem('lastTab', pageName);

                // Load tasks when switching to TODOs tab
                if (pageName === 'todos') {
                    loadTasks();
                }
            }
        }

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => switchToTab(tab.dataset.page));
        });

        // Restore last visited tab
        const lastTab = localStorage.getItem('lastTab');
        if (lastTab && document.getElementById(lastTab)) {
            switchToTab(lastTab);
        }

        // Countdown calculator
        function updateCountdown() {
            const now = new Date();

            // Grandma Ayelet - January 28, 2026
            const ayeletDate = new Date('2026-01-28T00:00:00');
            const ayeletDiff = ayeletDate - now;
            const ayeletDays = Math.ceil(ayeletDiff / (1000 * 60 * 60 * 24));
            document.getElementById('days-ayelet').textContent = ayeletDays > 0 ? ayeletDays : "She's here!";

            // Grandma Orly - April 16, 2026
            const orlyDate = new Date('2026-04-16T00:00:00');
            const orlyDiff = orlyDate - now;
            const orlyDays = Math.ceil(orlyDiff / (1000 * 60 * 60 * 24));
            document.getElementById('days-orly').textContent = orlyDays > 0 ? orlyDays : "She's here!";
        }

        updateCountdown();
        setInterval(updateCountdown, 60000);

        // Load markdown tasks
        async function loadTasks() {
            const container = document.getElementById('todos-content');
            const lastUpdated = document.getElementById('last-updated');

            try {
                // Add cache-busting to always get fresh content
                const response = await fetch('tasks.md?t=' + Date.now());
                if (!response.ok) throw new Error('Failed to load tasks');

                const markdown = await response.text();
                container.innerHTML = '<div class="markdown-content">' + marked.parse(markdown) + '</div>';
                lastUpdated.textContent = 'Loaded: ' + new Date().toLocaleString();
            } catch (err) {
                container.innerHTML = '<div class="error">❌ Could not load tasks: ' + err.message + '</div>';
            }
        }

        // ========================================
        // CAPYBARA AMAZON RIVER GAME
        // ========================================
        const Game = {
            canvas: null,
            ctx: null,
            audioCtx: null,
            running: false,
            gameOver: false,
            score: 0,
            highScore: parseInt(localStorage.getItem('capybaraHighScore')) || 0,
            speed: 5,
            frameCount: 0,

            // Audio functions
            initAudio() {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                // iOS Safari requires resume after user gesture
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }
            },

            playSound(type) {
                if (!this.audioCtx) return;
                // Ensure audio context is running (iOS fix)
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }
                const ctx = this.audioCtx;
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                if (type === 'jump') {
                    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.1);
                } else if (type === 'gameOver') {
                    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.4);
                } else if (type === 'milestone') {
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(523, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.3);
                }
            },

            // Capybara player
            capybara: {
                x: 80,
                y: 280,
                width: 50,
                height: 40,
                velocityY: 0,
                jumping: false,
                groundY: 280
            },

            // Game objects
            obstacles: [],
            backgroundAnimals: [],
            bubbles: [],
            lilyPads: [],

            // Amazon animals
            dangerousAnimals: [
                { emoji: '🐊', name: 'Caiman', width: 60, height: 35 },
                { emoji: '🐍', name: 'Anaconda', width: 55, height: 30 },
                { emoji: '🦈', name: 'Piranha', width: 40, height: 30 },
                { emoji: '⚡', name: 'Electric Eel', width: 50, height: 25 }
            ],

            friendlyAnimals: [
                { emoji: '🐬', name: 'Pink Dolphin' },
                { emoji: '🐢', name: 'River Turtle' },
                { emoji: '🐟', name: 'Arapaima' },
                { emoji: '🦜', name: 'Macaw' },
                { emoji: '🦩', name: 'Flamingo' },
                { emoji: '🐸', name: 'Poison Frog' },
                { emoji: '🦎', name: 'Iguana' },
                { emoji: '🦦', name: 'Giant Otter' }
            ],

            init() {
                this.canvas = document.getElementById('game-canvas');
                this.ctx = this.canvas.getContext('2d');

                // Set up high score display
                document.getElementById('high-score').textContent = this.highScore;

                // Event listeners
                document.getElementById('start-btn').addEventListener('click', () => this.start());
                this.canvas.addEventListener('click', () => this.handleInput());
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space' && document.getElementById('game').classList.contains('active')) {
                        e.preventDefault();
                        this.handleInput();
                    }
                });
            },

            handleInput() {
                if (!this.running && this.gameOver) {
                    this.start();
                } else if (this.running) {
                    this.jump();
                }
            },

            start() {
                if (!this.audioCtx) this.initAudio();
                this.running = true;
                this.gameOver = false;
                this.score = 0;
                this.speed = 5;
                this.frameCount = 0;
                this.capybara.y = this.capybara.groundY;
                this.capybara.velocityY = 0;
                this.capybara.jumping = false;
                this.obstacles = [];
                this.backgroundAnimals = [];
                this.bubbles = [];
                this.lilyPads = [];

                document.getElementById('score').textContent = '0';
                document.getElementById('game-overlay').classList.add('hidden');

                // Spawn initial decorations
                this.spawnLilyPads();
                this.spawnBackgroundAnimal();

                this.gameLoop();
            },

            jump() {
                if (!this.capybara.jumping) {
                    this.capybara.velocityY = -14;
                    this.capybara.jumping = true;
                    this.playSound('jump');
                }
            },

            spawnObstacle() {
                const animal = this.dangerousAnimals[Math.floor(Math.random() * this.dangerousAnimals.length)];
                this.obstacles.push({
                    x: this.canvas.width + 50,
                    y: this.capybara.groundY + (this.capybara.height - animal.height),
                    width: animal.width,
                    height: animal.height,
                    emoji: animal.emoji,
                    name: animal.name
                });
            },

            spawnBackgroundAnimal() {
                const animal = this.friendlyAnimals[Math.floor(Math.random() * this.friendlyAnimals.length)];
                const isFlying = animal.name === 'Macaw' || animal.name === 'Flamingo';
                this.backgroundAnimals.push({
                    x: this.canvas.width + 30,
                    y: isFlying ? 30 + Math.random() * 60 : 200 + Math.random() * 100,
                    emoji: animal.emoji,
                    speed: 1 + Math.random() * 2,
                    isFlying
                });
            },

            spawnLilyPads() {
                for (let i = 0; i < 5; i++) {
                    this.lilyPads.push({
                        x: Math.random() * this.canvas.width,
                        y: 330 + Math.random() * 50,
                        size: 20 + Math.random() * 15
                    });
                }
            },

            spawnBubble() {
                this.bubbles.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height,
                    size: 3 + Math.random() * 5,
                    speed: 1 + Math.random() * 2
                });
            },

            update() {
                this.frameCount++;

                // Gravity
                this.capybara.velocityY += 0.7;
                this.capybara.y += this.capybara.velocityY;

                // Ground collision
                if (this.capybara.y >= this.capybara.groundY) {
                    this.capybara.y = this.capybara.groundY;
                    this.capybara.velocityY = 0;
                    this.capybara.jumping = false;
                }

                // Spawn obstacles
                if (this.frameCount % Math.max(60, 120 - Math.floor(this.score / 10)) === 0) {
                    this.spawnObstacle();
                }

                // Spawn background animals
                if (this.frameCount % 150 === 0) {
                    this.spawnBackgroundAnimal();
                }

                // Spawn bubbles
                if (this.frameCount % 30 === 0) {
                    this.spawnBubble();
                }

                // Update obstacles
                this.obstacles.forEach((obs, i) => {
                    obs.x -= this.speed;
                    if (obs.x + obs.width < 0) {
                        this.obstacles.splice(i, 1);
                    }
                });

                // Update background animals
                this.backgroundAnimals.forEach((animal, i) => {
                    animal.x -= animal.speed;
                    if (animal.x < -50) {
                        this.backgroundAnimals.splice(i, 1);
                    }
                });

                // Update bubbles
                this.bubbles.forEach((bubble, i) => {
                    bubble.y -= bubble.speed;
                    bubble.x += Math.sin(this.frameCount * 0.1) * 0.3;
                    if (bubble.y < 0) {
                        this.bubbles.splice(i, 1);
                    }
                });

                // Update lily pads
                this.lilyPads.forEach(pad => {
                    pad.x -= this.speed * 0.3;
                    if (pad.x < -30) {
                        pad.x = this.canvas.width + 30;
                        pad.y = 330 + Math.random() * 50;
                    }
                });

                // Collision detection
                const capy = this.capybara;
                for (const obs of this.obstacles) {
                    if (
                        capy.x < obs.x + obs.width - 15 &&
                        capy.x + capy.width - 10 > obs.x &&
                        capy.y < obs.y + obs.height - 10 &&
                        capy.y + capy.height > obs.y + 5
                    ) {
                        this.endGame();
                        return;
                    }
                }

                // Update score
                this.score++;
                if (this.score % 10 === 0) {
                    document.getElementById('score').textContent = Math.floor(this.score / 10);
                }

                // Increase speed over time and play milestone sound
                if (this.score % 500 === 0 && this.score > 0) {
                    this.speed = Math.min(12, this.speed + 0.5);
                    this.playSound('milestone');
                }
            },

            draw() {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Draw river gradient background
                const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#0f766e');
                gradient.addColorStop(0.4, '#134e4a');
                gradient.addColorStop(1, '#164e63');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Draw jungle silhouette at top
                ctx.fillStyle = '#052e16';
                for (let i = 0; i < this.canvas.width; i += 40) {
                    const height = 30 + Math.sin(i * 0.05) * 20;
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + 20, height);
                    ctx.lineTo(i + 40, 0);
                    ctx.fill();
                }

                // Draw bubbles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.bubbles.forEach(bubble => {
                    ctx.beginPath();
                    ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Draw lily pads
                ctx.fillStyle = '#166534';
                this.lilyPads.forEach(pad => {
                    ctx.beginPath();
                    ctx.ellipse(pad.x, pad.y, pad.size, pad.size * 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Add flower
                    ctx.font = `${pad.size * 0.8}px Arial`;
                    ctx.fillText('🪷', pad.x - pad.size * 0.4, pad.y + pad.size * 0.3);
                });

                // Draw background animals
                ctx.font = '30px Arial';
                this.backgroundAnimals.forEach(animal => {
                    ctx.globalAlpha = 0.6;
                    ctx.fillText(animal.emoji, animal.x, animal.y);
                    ctx.globalAlpha = 1;
                });

                // Draw water surface line
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 320);
                for (let i = 0; i < this.canvas.width; i += 20) {
                    ctx.lineTo(i, 320 + Math.sin((i + this.frameCount * 2) * 0.05) * 5);
                }
                ctx.stroke();

                // Draw ground/riverbed
                ctx.fillStyle = '#1e3a5f';
                ctx.fillRect(0, 350, this.canvas.width, 50);

                // Draw obstacles (dangerous animals)
                ctx.font = '40px Arial';
                this.obstacles.forEach(obs => {
                    ctx.fillText(obs.emoji, obs.x, obs.y + obs.height);
                });

                // Draw capybara
                this.drawCapybara();

                // Draw score in game
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, 20, 30);
            },

            drawCapybara() {
                const ctx = this.ctx;
                const c = this.capybara;

                // Body
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.ellipse(c.x + 25, c.y + 25, 25, 18, 0, 0, Math.PI * 2);
                ctx.fill();

                // Head
                ctx.fillStyle = '#A0522D';
                ctx.beginPath();
                ctx.ellipse(c.x + 45, c.y + 15, 15, 12, 0.3, 0, Math.PI * 2);
                ctx.fill();

                // Ears
                ctx.fillStyle = '#6B3710';
                ctx.beginPath();
                ctx.ellipse(c.x + 38, c.y + 5, 5, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(c.x + 48, c.y + 3, 5, 4, 0, 0, Math.PI * 2);
                ctx.fill();

                // Eye
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(c.x + 50, c.y + 12, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(c.x + 51, c.y + 11, 1, 0, Math.PI * 2);
                ctx.fill();

                // Nose
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(c.x + 58, c.y + 18, 4, 3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Legs (if not jumping, show swimming motion)
                ctx.fillStyle = '#8B4513';
                if (this.capybara.jumping) {
                    // Tucked legs while jumping
                    ctx.beginPath();
                    ctx.ellipse(c.x + 15, c.y + 35, 6, 4, 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(c.x + 35, c.y + 35, 6, 4, -0.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Swimming legs
                    const legOffset = Math.sin(this.frameCount * 0.3) * 3;
                    ctx.beginPath();
                    ctx.ellipse(c.x + 15, c.y + 38 + legOffset, 7, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(c.x + 35, c.y + 38 - legOffset, 7, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Splash effect when moving
                if (!this.capybara.jumping) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.font = '12px Arial';
                    ctx.fillText('💦', c.x - 5, c.y + 30 + Math.sin(this.frameCount * 0.5) * 3);
                }
            },

            endGame() {
                this.running = false;
                this.gameOver = true;
                this.playSound('gameOver');

                // Update high score
                const finalScore = Math.floor(this.score / 10);
                if (finalScore > this.highScore) {
                    this.highScore = finalScore;
                    localStorage.setItem('capybaraHighScore', this.highScore);
                    document.getElementById('high-score').textContent = this.highScore;
                }

                // Show overlay
                document.getElementById('overlay-text').innerHTML =
                    `Game Over!<br>Score: ${finalScore}<br>Best: ${this.highScore}`;
                document.getElementById('start-btn').textContent = 'Play Again';
                document.getElementById('game-overlay').classList.remove('hidden');
            },

            gameLoop() {
                if (!this.running) return;

                this.update();
                this.draw();
                requestAnimationFrame(() => this.gameLoop());
            }
        };

        // Initialize game when DOM is ready
        Game.init();

        // ========================================
        // WARM-UP CALCULATOR
        // Starting Strength methodology
        // ========================================
        const WarmUp = {
            // Default gym configuration
            config: {
                barWeight: 35,
                plates: {
                    45: 2, 35: 0, 25: 2, 15: 2, 10: 4, 5: 2, 2.5: 2,
                    1: 2, 0.75: 2, 0.5: 2, 0.25: 2
                }
            },

            standardPlates: [45, 35, 25, 15, 10, 5, 2.5],
            microPlates: [1, 0.75, 0.5, 0.25],

            init() {
                this.loadConfig();
                this.renderPlateConfig();
                this.bindEvents();

                // Load last target weight
                const lastWeight = localStorage.getItem('lastTargetWeight');
                if (lastWeight) {
                    document.getElementById('target-weight').value = lastWeight;
                }

                // Load deadlift mode state
                const deadliftMode = localStorage.getItem('deadliftMode');
                if (deadliftMode === 'true') {
                    document.getElementById('deadlift-mode').checked = true;
                }
            },

            loadConfig() {
                const saved = localStorage.getItem('gymConfig');
                if (saved) {
                    this.config = JSON.parse(saved);
                }
                document.getElementById('bar-weight-display').textContent = this.config.barWeight;
            },

            saveConfig() {
                localStorage.setItem('gymConfig', JSON.stringify(this.config));
                const btn = document.getElementById('save-config');
                btn.textContent = 'Saved!';
                btn.classList.add('saved');
                setTimeout(() => {
                    btn.textContent = 'Save Configuration';
                    btn.classList.remove('saved');
                }, 2000);
            },

            renderPlateConfig() {
                const standardContainer = document.getElementById('standard-plates');
                const microContainer = document.getElementById('micro-plates');

                standardContainer.innerHTML = this.standardPlates.map(weight =>
                    this.createPlateRow(weight)
                ).join('');

                microContainer.innerHTML = this.microPlates.map(weight =>
                    this.createPlateRow(weight)
                ).join('');
            },

            createPlateRow(weight) {
                const count = this.config.plates[weight] || 0;
                return `
                    <div class="plate-row">
                        <span class="plate-label">${weight}</span>
                        <div class="plate-controls">
                            <button class="plate-adjust" data-plate="${weight}" data-action="dec">−</button>
                            <span class="plate-count" id="plate-${weight}">${count}</span>
                            <button class="plate-adjust" data-plate="${weight}" data-action="inc">+</button>
                        </div>
                    </div>
                `;
            },

            bindEvents() {
                // Calculate button
                document.getElementById('calculate-warmup').addEventListener('click', () => this.calculate());

                // Weight adjustment buttons
                document.getElementById('weight-up').addEventListener('click', () => {
                    const input = document.getElementById('target-weight');
                    input.value = parseFloat(input.value) + 5;
                });
                document.getElementById('weight-down').addEventListener('click', () => {
                    const input = document.getElementById('target-weight');
                    input.value = Math.max(this.config.barWeight, parseFloat(input.value) - 5);
                });

                // Enter key to calculate
                document.getElementById('target-weight').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.calculate();
                });

                // Save deadlift mode preference
                document.getElementById('deadlift-mode').addEventListener('change', (e) => {
                    localStorage.setItem('deadliftMode', e.target.checked);
                });

                // Config toggle
                document.getElementById('config-toggle').addEventListener('click', () => {
                    document.getElementById('config-toggle').classList.toggle('open');
                    document.getElementById('plate-config').classList.toggle('open');
                });

                // Plate adjustments
                document.addEventListener('click', (e) => {
                    if (e.target.classList.contains('plate-adjust')) {
                        const plate = parseFloat(e.target.dataset.plate);
                        const action = e.target.dataset.action;
                        const bar = e.target.dataset.bar;

                        if (bar) {
                            this.config.barWeight = Math.max(15, Math.min(55, this.config.barWeight + parseInt(bar)));
                            document.getElementById('bar-weight-display').textContent = this.config.barWeight;
                        } else if (plate) {
                            if (action === 'inc') {
                                this.config.plates[plate] = (this.config.plates[plate] || 0) + 1;
                            } else {
                                this.config.plates[plate] = Math.max(0, (this.config.plates[plate] || 0) - 1);
                            }
                            document.getElementById(`plate-${plate}`).textContent = this.config.plates[plate];
                        }
                    }
                });

                // Save config
                document.getElementById('save-config').addEventListener('click', () => this.saveConfig());
            },

            // Calculate plate combination for a given weight
            // useMicros: true for work sets, false for warm-ups
            calculatePlates(targetWeight, useMicros = true) {
                const perSide = (targetWeight - this.config.barWeight) / 2;
                if (perSide <= 0) return { plates: [], total: this.config.barWeight };

                // For warm-ups, only use standard plates; for work sets, use all
                const platesToUse = useMicros
                    ? [...this.standardPlates, ...this.microPlates]
                    : [...this.standardPlates];
                const allPlates = platesToUse.sort((a, b) => b - a);

                const result = [];
                let remaining = perSide;
                const available = { ...this.config.plates };

                for (const plate of allPlates) {
                    while (remaining >= plate && (available[plate] || 0) > 0) {
                        result.push(plate);
                        remaining -= plate;
                        available[plate]--;
                    }
                }

                const actualPerSide = result.reduce((a, b) => a + b, 0);
                return {
                    plates: result,
                    total: this.config.barWeight + actualPerSide * 2
                };
            },

            // Generate all subset combinations of work plates
            // Returns array of {plates: [...], weight: number}
            generatePlateSubsets(workPlates) {
                const bar = this.config.barWeight;
                const subsets = [{ plates: [], weight: bar }];

                // Generate power set
                for (const plate of workPlates) {
                    const newSubsets = subsets.map(s => ({
                        plates: [...s.plates, plate],
                        weight: s.weight + plate * 2
                    }));
                    subsets.push(...newSubsets);
                }

                // Remove duplicates and sort by weight
                const seen = new Set();
                return subsets
                    .filter(s => {
                        const key = s.weight;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    })
                    .sort((a, b) => a.weight - b.weight);
            },

            // Find best subset weight for target percentage
            findBestSubset(subsets, targetWeight, actualWork, prevWeight) {
                let best = null;
                let bestDiff = Infinity;

                for (const subset of subsets) {
                    // Skip if too close to previous or work weight
                    if (subset.weight <= prevWeight + 5) continue;
                    if (subset.weight >= actualWork - 5) continue;

                    const diff = Math.abs(subset.weight - targetWeight);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        best = subset;
                    }
                }
                return best;
            },

            // Helper to add a warm-up set with proper reps
            addWarmupSet(warmupSets, weight, plates, actualWork) {
                const pct = Math.round((weight / actualWork) * 100);

                // Determine reps: 5, 3, or 1 only
                let reps;
                if (pct <= 55) reps = 5;
                else if (pct <= 75) reps = 3;
                else reps = 1;

                warmupSets.push({
                    weight: weight,
                    percentage: pct,
                    sets: 1,
                    reps: reps,
                    plates: plates
                });
            },

            // Calculate warm-up sets using subset-first approach (minimize plate removal)
            calculate() {
                const targetInput = document.getElementById('target-weight');
                const targetWeight = parseFloat(targetInput.value);

                if (isNaN(targetWeight) || targetWeight < this.config.barWeight) {
                    alert(`Please enter a weight of at least ${this.config.barWeight} lbs (bar weight)`);
                    return;
                }

                localStorage.setItem('lastTargetWeight', targetWeight);

                // Calculate work set plates first (with micros)
                const workSet = this.calculatePlates(targetWeight, true);
                const actualWork = workSet.total;

                // Generate all possible subset weights from work plates (no plate removal needed)
                // Use only standard plates for warm-up subsets
                const workPlatesStandard = workSet.plates.filter(p => this.standardPlates.includes(p));
                const subsets = this.generatePlateSubsets(workPlatesStandard);

                const warmupSets = [];

                // Check if deadlift mode is enabled
                const isDeadlift = document.getElementById('deadlift-mode').checked;

                // Determine starting warm-up
                if (isDeadlift) {
                    // Deadlift mode: start with higher weight based on work weight
                    const startWeight = actualWork <= 250 ? 85 : 125;
                    const startPlates = this.calculatePlates(startWeight, false);
                    warmupSets.push({
                        weight: startPlates.total,
                        percentage: Math.round((startPlates.total / actualWork) * 100),
                        sets: 1,
                        reps: 5,
                        plates: startPlates.plates,
                        isBar: false
                    });
                } else {
                    // Normal mode: start with empty bar
                    warmupSets.push({
                        weight: this.config.barWeight,
                        percentage: Math.round((this.config.barWeight / actualWork) * 100),
                        sets: 2,
                        reps: 5,
                        plates: [],
                        isBar: true
                    });
                }

                // Warm-up constraints:
                // - 3-4 warm-up sets (including bar)
                // - Last warm-up must be 80-89% of target
                // - First jump (from bar) can be up to 40%, others max 25%
                // - Earlier jumps should be larger than later jumps
                const maxWarmups = 4;
                const minWarmups = 3;
                const minLastPct = 0.80;  // Last warm-up must be at least 80%
                const maxLastPct = 0.89;  // Last warm-up must be BELOW 90%
                const maxFirstJumpPct = 0.40;  // First jump (from bar) can be larger
                const maxJumpPct = 0.25;  // Max 25% jump for other sets

                // Target percentages: evenly spread up to ~85%
                const targetPercentages = [0.4, 0.55, 0.7, 0.85];

                // First pass: try subset-only (no plate removal)
                for (const pct of targetPercentages) {
                    if (warmupSets.length >= maxWarmups) break;

                    const targetWarmup = Math.round(actualWork * pct);
                    const subset = this.findBestSubset(subsets, targetWarmup, actualWork,
                        warmupSets[warmupSets.length - 1].weight);

                    // Only use if within 15% of target AND below 90% threshold
                    if (subset &&
                        Math.abs(subset.weight - targetWarmup) <= actualWork * 0.15 &&
                        subset.weight < actualWork * maxLastPct) {
                        this.addWarmupSet(warmupSets, subset.weight, subset.plates, actualWork);
                    }
                }

                // Second pass: fill with non-subset weights until we have 4
                const fillPercentages = [0.45, 0.55, 0.65, 0.75, 0.85];
                for (const pct of fillPercentages) {
                    if (warmupSets.length >= minWarmups) break;

                    const targetWarmup = Math.round(actualWork * pct);

                    // Skip if we already have something within 10% of this target
                    const exists = warmupSets.some(s =>
                        Math.abs(s.percentage - pct * 100) <= 10
                    );
                    if (exists) continue;

                    const plateResult = this.calculatePlates(targetWarmup, false);

                    // Must be below 90%, not too close to existing, and valid range
                    const tooClose = warmupSets.some(s =>
                        Math.abs(s.weight - plateResult.total) <= 10
                    );

                    if (!tooClose &&
                        plateResult.total > this.config.barWeight + 5 &&
                        plateResult.total < actualWork * maxLastPct) {
                        this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);
                    }
                }

                // Sort warm-ups by weight
                const barSet = warmupSets.shift();
                warmupSets.sort((a, b) => a.weight - b.weight);
                warmupSets.unshift(barSet);

                // Third pass: check for large gaps and fill them
                let hasLargeGap = true;
                while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                    hasLargeGap = false;

                    for (let i = 0; i < warmupSets.length - 1; i++) {
                        const current = warmupSets[i];
                        const next = warmupSets[i + 1];
                        const gapPct = (next.weight - current.weight) / actualWork;
                        // First jump (from bar) can be larger
                        const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;

                        if (gapPct > maxAllowedGap) {
                            // Found a large gap, try to fill it
                            const midWeight = Math.round((current.weight + next.weight) / 2);
                            const plateResult = this.calculatePlates(midWeight, false);

                            if (plateResult.total > current.weight + 10 &&
                                plateResult.total < next.weight - 10 &&
                                plateResult.total < actualWork * maxLastPct) {
                                this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);
                                hasLargeGap = true;

                                // Re-sort after adding
                                const bar = warmupSets.shift();
                                warmupSets.sort((a, b) => a.weight - b.weight);
                                warmupSets.unshift(bar);
                                break;
                            }
                        }
                    }
                }

                // Trim to max 4 warm-ups (keep bar + highest 3)
                while (warmupSets.length > maxWarmups) {
                    warmupSets.splice(1, 1);  // Remove lowest non-bar
                }

                // Ensure last warm-up is in 80%-90% range
                const lastNonBar = warmupSets.filter(s => !s.isBar).pop();
                if (lastNonBar) {
                    const lastPct = lastNonBar.weight / actualWork;

                    // If last warm-up is below 80%, add one in range (don't remove yet)
                    if (lastPct < minLastPct) {
                        for (const targetPct of [0.85, 0.82]) {
                            const targetWeight = Math.round(actualWork * targetPct);
                            const plateResult = this.calculatePlates(targetWeight, false);
                            const pct = plateResult.total / actualWork;

                            if (pct >= minLastPct && pct < maxLastPct &&
                                plateResult.total > lastNonBar.weight) {
                                // Add without removing - let gap detection and trim handle it
                                this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);

                                // Re-sort
                                const bar = warmupSets.shift();
                                warmupSets.sort((a, b) => a.weight - b.weight);
                                warmupSets.unshift(bar);
                                break;
                            }
                        }
                    }
                }

                // Re-run gap detection after adding 80-90% warm-up
                hasLargeGap = true;
                while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                    hasLargeGap = false;
                    for (let i = 0; i < warmupSets.length - 1; i++) {
                        const current = warmupSets[i];
                        const next = warmupSets[i + 1];
                        const gapPct = (next.weight - current.weight) / actualWork;
                        const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;

                        if (gapPct > maxAllowedGap) {
                            const midWeight = Math.round((current.weight + next.weight) / 2);
                            const plateResult = this.calculatePlates(midWeight, false);

                            if (plateResult.total > current.weight + 10 &&
                                plateResult.total < next.weight - 10 &&
                                plateResult.total < actualWork * maxLastPct) {
                                this.addWarmupSet(warmupSets, plateResult.total, plateResult.plates, actualWork);
                                hasLargeGap = true;
                                const bar = warmupSets.shift();
                                warmupSets.sort((a, b) => a.weight - b.weight);
                                warmupSets.unshift(bar);
                                break;
                            }
                        }
                    }
                }

                // Trim to max 4 warm-ups (keep bar and highest, remove from middle)
                while (warmupSets.length > maxWarmups) {
                    // Find the warm-up whose removal causes least jump disruption
                    // Remove the one that creates the smallest resulting gap
                    let bestRemoveIdx = 1;
                    let smallestResultingJump = Infinity;

                    for (let i = 1; i < warmupSets.length - 1; i++) {
                        const before = warmupSets[i - 1].weight;
                        const after = warmupSets[i + 1].weight;
                        const resultingJump = after - before;
                        if (resultingJump < smallestResultingJump) {
                            smallestResultingJump = resultingJump;
                            bestRemoveIdx = i;
                        }
                    }
                    warmupSets.splice(bestRemoveIdx, 1);
                }

                // Ensure earlier jumps are larger than later jumps
                // Remove warm-ups that break this pattern (keep bar and last)
                let jumpsValid = false;
                while (!jumpsValid && warmupSets.length > minWarmups) {
                    jumpsValid = true;
                    const jumps = [];

                    // Calculate all jumps
                    for (let i = 0; i < warmupSets.length - 1; i++) {
                        jumps.push(warmupSets[i + 1].weight - warmupSets[i].weight);
                    }

                    // Check if jumps are decreasing (earlier >= later)
                    for (let i = 0; i < jumps.length - 1; i++) {
                        if (jumps[i] < jumps[i + 1]) {
                            // Later jump is larger than earlier jump
                            // Remove the START of the small jump to merge with previous jump
                            // e.g., [35,60,85,115] with jumps [25,25,30]:
                            //   jumps[1]=25 < jumps[2]=30, so i=1
                            //   Remove index i+1=2? No, that gives [35,60,115]=[25,55], worse!
                            //   Remove index i=1? Yes! That gives [35,85,115]=[50,30], valid!
                            let removeIdx = i;

                            // But don't remove bar (index 0) or last warm-up
                            if (removeIdx === 0) removeIdx = 1;
                            if (removeIdx >= warmupSets.length - 1) removeIdx = warmupSets.length - 2;

                            if (removeIdx > 0 && removeIdx < warmupSets.length - 1) {
                                warmupSets.splice(removeIdx, 1);
                                jumpsValid = false;
                                break;
                            }
                        }
                    }
                }

                // Force last warm-up to 1 rep
                if (warmupSets.length > 1) {
                    const lastWarmup = warmupSets[warmupSets.length - 1];
                    if (!lastWarmup.isBar) {
                        lastWarmup.reps = 1;
                    }
                }

                // Add work set
                warmupSets.push({
                    weight: targetWeight,  // Show target weight, not calculated weight
                    actualWeight: actualWork,  // Store actual achievable weight
                    percentage: 100,
                    sets: 3,
                    reps: 5,
                    plates: workSet.plates,
                    isWork: true
                });

                this.renderSets(warmupSets, targetWeight);
            },

            // Calculate plate changes between sets
            getPlateChanges(prevPlates, currentPlates) {
                const prevCount = {};
                const currCount = {};

                prevPlates.forEach(p => prevCount[p] = (prevCount[p] || 0) + 1);
                currentPlates.forEach(p => currCount[p] = (currCount[p] || 0) + 1);

                const allPlates = [...new Set([...prevPlates, ...currentPlates])].sort((a, b) => b - a);
                const add = [];
                const remove = [];

                for (const plate of allPlates) {
                    const diff = (currCount[plate] || 0) - (prevCount[plate] || 0);
                    if (diff > 0) {
                        for (let i = 0; i < diff; i++) add.push(plate);
                    } else if (diff < 0) {
                        for (let i = 0; i < -diff; i++) remove.push(plate);
                    }
                }

                return { add, remove };
            },

            renderSets(sets, targetWeight) {
                const container = document.getElementById('warmup-sets');
                let html = '';

                for (let i = 0; i < sets.length; i++) {
                    const set = sets[i];
                    const prevPlates = i > 0 ? sets[i - 1].plates : [];
                    const changes = this.getPlateChanges(prevPlates, set.plates);

                    const label = set.isWork ? 'WORK SET' : set.isBar ? 'WARM-UP 1' : `WARM-UP ${i + 1}`;
                    const cardClass = set.isWork ? 'warmup-set-card work-set' : 'warmup-set-card';

                    // Show note if actual weight differs from target (for work set)
                    let weightNote = '';
                    if (set.isWork && set.actualWeight && set.actualWeight !== set.weight) {
                        weightNote = `<div class="weight-note">Actual with plates: ${set.actualWeight} lbs</div>`;
                    }

                    html += `
                        <div class="${cardClass}">
                            <div class="set-header">
                                <span class="set-label">${label}</span>
                                <span class="set-percentage">${set.percentage}%</span>
                            </div>
                            <div class="set-weight">${set.weight} <span class="unit">lbs</span></div>
                            ${weightNote}
                            <div class="set-progress">
                                <div class="set-progress-fill" style="width: ${set.percentage}%"></div>
                            </div>
                            <div class="set-details">
                                <span class="set-reps">${set.sets} × ${set.reps} <span>reps</span></span>
                            </div>
                            ${this.renderPlateChanges(set, changes, i === 0)}
                        </div>
                    `;
                }

                container.innerHTML = html;
            },

            renderPlateChanges(set, changes, isFirst) {
                if (isFirst) {
                    return `
                        <div class="plate-changes">
                            <div class="plate-change none">Empty bar</div>
                        </div>
                    `;
                }

                let html = '<div class="plate-changes">';

                if (changes.add.length > 0) {
                    const grouped = this.groupPlates(changes.add);
                    html += `<div class="plate-change add">➕ Add: ${grouped} each side</div>`;
                }

                if (changes.remove.length > 0) {
                    const grouped = this.groupPlates(changes.remove);
                    html += `<div class="plate-change remove">➖ Remove: ${grouped} each side</div>`;
                }

                if (changes.add.length === 0 && changes.remove.length === 0) {
                    html += `<div class="plate-change none">No plate changes</div>`;
                }

                html += '</div>';
                return html;
            },

            groupPlates(plates) {
                const counts = {};
                plates.forEach(p => counts[p] = (counts[p] || 0) + 1);
                return Object.entries(counts)
                    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
                    .map(([plate, count]) => count > 1 ? `${count}×${plate}` : plate)
                    .join(' + ');
            },

            // Test function to verify all rules
            runTests() {
                const testWeights = [95, 115, 135, 155, 185, 205, 225, 275, 315];
                const results = [];

                console.log('=== WARM-UP CALCULATOR TESTS ===\n');

                for (const target of testWeights) {
                    const workSet = this.calculatePlates(target, true);
                    const actualWork = workSet.total;
                    const bar = this.config.barWeight;

                    // Simulate calculation (simplified)
                    const workPlatesStandard = workSet.plates.filter(p => this.standardPlates.includes(p));
                    const subsets = this.generatePlateSubsets(workPlatesStandard);

                    // Run the same algorithm as calculate()
                    const warmupSets = [{ weight: bar, isBar: true }];
                    const maxWarmups = 4, minWarmups = 3;
                    const minLastPct = 0.80, maxLastPct = 0.89;
                    const maxFirstJumpPct = 0.40, maxJumpPct = 0.25;
                    const targetPercentages = [0.4, 0.55, 0.7, 0.85];

                    // First pass
                    for (const pct of targetPercentages) {
                        if (warmupSets.length >= maxWarmups) break;
                        const targetWarmup = Math.round(actualWork * pct);
                        const subset = this.findBestSubset(subsets, targetWarmup, actualWork, warmupSets[warmupSets.length - 1].weight);
                        if (subset && Math.abs(subset.weight - targetWarmup) <= actualWork * 0.15 && subset.weight < actualWork * maxLastPct) {
                            warmupSets.push({ weight: subset.weight, plates: subset.plates });
                        }
                    }

                    // Second pass
                    const fillPercentages = [0.45, 0.55, 0.65, 0.75, 0.85];
                    for (const pct of fillPercentages) {
                        if (warmupSets.length >= minWarmups) break;
                        const targetWarmup = Math.round(actualWork * pct);
                        const exists = warmupSets.some(s => Math.abs((s.weight / actualWork) * 100 - pct * 100) <= 10);
                        if (exists) continue;
                        const plateResult = this.calculatePlates(targetWarmup, false);
                        const tooClose = warmupSets.some(s => Math.abs(s.weight - plateResult.total) <= 10);
                        if (!tooClose && plateResult.total > bar + 5 && plateResult.total < actualWork * maxLastPct) {
                            warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                        }
                    }

                    // Sort
                    const barSet = warmupSets.shift();
                    warmupSets.sort((a, b) => a.weight - b.weight);
                    warmupSets.unshift(barSet);

                    // Third pass - gap fill
                    let hasLargeGap = true;
                    while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                        hasLargeGap = false;
                        for (let i = 0; i < warmupSets.length - 1; i++) {
                            const gapPct = (warmupSets[i + 1].weight - warmupSets[i].weight) / actualWork;
                            const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;
                            if (gapPct > maxAllowedGap) {
                                const midWeight = Math.round((warmupSets[i].weight + warmupSets[i + 1].weight) / 2);
                                const plateResult = this.calculatePlates(midWeight, false);
                                if (plateResult.total > warmupSets[i].weight + 10 && plateResult.total < warmupSets[i + 1].weight - 10 && plateResult.total < actualWork * maxLastPct) {
                                    warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                                    hasLargeGap = true;
                                    const b = warmupSets.shift();
                                    warmupSets.sort((a, b) => a.weight - b.weight);
                                    warmupSets.unshift(b);
                                    break;
                                }
                            }
                        }
                    }

                    // First trim
                    while (warmupSets.length > maxWarmups) warmupSets.splice(1, 1);

                    // Ensure last 80-90% (add without removing)
                    const lastNonBar = warmupSets.filter(s => !s.isBar).pop();
                    if (lastNonBar && lastNonBar.weight / actualWork < minLastPct) {
                        for (const targetPct of [0.85, 0.82]) {
                            const targetWeight = Math.round(actualWork * targetPct);
                            const plateResult = this.calculatePlates(targetWeight, false);
                            const pct = plateResult.total / actualWork;
                            if (pct >= minLastPct && pct < maxLastPct && plateResult.total > lastNonBar.weight) {
                                warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                                const b = warmupSets.shift();
                                warmupSets.sort((a, b) => a.weight - b.weight);
                                warmupSets.unshift(b);
                                break;
                            }
                        }
                    }

                    // Re-run gap detection after 80-90%
                    hasLargeGap = true;
                    while (hasLargeGap && warmupSets.length < maxWarmups + 2) {
                        hasLargeGap = false;
                        for (let i = 0; i < warmupSets.length - 1; i++) {
                            const gapPct = (warmupSets[i + 1].weight - warmupSets[i].weight) / actualWork;
                            const maxAllowedGap = (i === 0) ? maxFirstJumpPct : maxJumpPct;
                            if (gapPct > maxAllowedGap) {
                                const midWeight = Math.round((warmupSets[i].weight + warmupSets[i + 1].weight) / 2);
                                const plateResult = this.calculatePlates(midWeight, false);
                                if (plateResult.total > warmupSets[i].weight + 10 && plateResult.total < warmupSets[i + 1].weight - 10 && plateResult.total < actualWork * maxLastPct) {
                                    warmupSets.push({ weight: plateResult.total, plates: plateResult.plates });
                                    hasLargeGap = true;
                                    const b = warmupSets.shift();
                                    warmupSets.sort((a, b) => a.weight - b.weight);
                                    warmupSets.unshift(b);
                                    break;
                                }
                            }
                        }
                    }

                    // Smart trim to max 4
                    while (warmupSets.length > maxWarmups) {
                        let bestIdx = 1, smallestGap = Infinity;
                        for (let i = 1; i < warmupSets.length - 1; i++) {
                            const gap = warmupSets[i + 1].weight - warmupSets[i - 1].weight;
                            if (gap < smallestGap) { smallestGap = gap; bestIdx = i; }
                        }
                        warmupSets.splice(bestIdx, 1);
                    }

                    // Ensure decreasing jumps (use removeIdx = i, not i+1)
                    let jumpsValid = false;
                    while (!jumpsValid && warmupSets.length > minWarmups) {
                        jumpsValid = true;
                        const jumps = [];
                        for (let i = 0; i < warmupSets.length - 1; i++) {
                            jumps.push(warmupSets[i + 1].weight - warmupSets[i].weight);
                        }
                        for (let i = 0; i < jumps.length - 1; i++) {
                            if (jumps[i] < jumps[i + 1]) {
                                let removeIdx = i;  // Changed from i+1
                                if (removeIdx === 0) removeIdx = 1;
                                if (removeIdx >= warmupSets.length - 1) removeIdx = warmupSets.length - 2;
                                if (removeIdx > 0 && removeIdx < warmupSets.length - 1) {
                                    warmupSets.splice(removeIdx, 1);
                                    jumpsValid = false;
                                    break;
                                }
                            }
                        }
                    }

                    // Verify rules
                    const weights = warmupSets.map(s => s.weight);
                    const jumps = [];
                    for (let i = 0; i < weights.length - 1; i++) {
                        jumps.push(weights[i + 1] - weights[i]);
                    }
                    const jumpPcts = jumps.map(j => (j / actualWork * 100).toFixed(1) + '%');
                    const lastWarmup = weights[weights.length - 1];
                    const lastPct = lastWarmup / actualWork;

                    const errors = [];
                    // Rule 1: 3-4 warm-ups
                    if (warmupSets.length < 3 || warmupSets.length > 4) errors.push(`Count: ${warmupSets.length} (expected 3-4)`);
                    // Rule 2: Last warm-up 80-89%
                    if (lastPct < 0.80 || lastPct >= 0.90) errors.push(`Last: ${(lastPct * 100).toFixed(1)}% (expected 80-89%)`);
                    // Rule 3: First jump ≤40%, others ≤25%
                    for (let i = 0; i < jumps.length; i++) {
                        const pct = jumps[i] / actualWork;
                        const max = i === 0 ? 0.40 : 0.25;
                        if (pct > max) errors.push(`Jump ${i + 1}: ${(pct * 100).toFixed(1)}% > ${max * 100}%`);
                    }
                    // Rule 4: Earlier jumps >= later jumps
                    for (let i = 0; i < jumps.length - 1; i++) {
                        if (jumps[i] < jumps[i + 1]) errors.push(`Jump ${i + 1} (${jumps[i]}) < Jump ${i + 2} (${jumps[i + 1]})`);
                    }

                    const status = errors.length === 0 ? '✓ PASS' : '✗ FAIL';
                    console.log(`Target: ${target} lbs (actual: ${actualWork} lbs)`);
                    console.log(`  Warm-ups: ${weights.join(' → ')} → ${actualWork} (work)`);
                    console.log(`  Jumps: ${jumpPcts.join(', ')}`);
                    console.log(`  Last warm-up: ${(lastPct * 100).toFixed(1)}%`);
                    console.log(`  ${status}${errors.length ? ': ' + errors.join(', ') : ''}`);
                    console.log('');

                    results.push({ target, actual: actualWork, pass: errors.length === 0, errors });
                }

                const passed = results.filter(r => r.pass).length;
                console.log(`=== RESULTS: ${passed}/${results.length} passed ===`);
                return results;
            }
        };

        // Initialize warm-up calculator
        WarmUp.init();

        // Run tests in console: WarmUp.runTests()

        // ========================================
        // ROUTINES TIMER
        // Morning & Evening countdown system
        // ========================================
        const RoutineTimer = {
            // Milestones configuration
            milestones: {
                morning: { hour: 7, minute: 20, icon: '🏫', title: 'Time to Leave for School', target: 'Leave by 7:20 AM' },
                dinner:  { hour: 18, minute: 0, icon: '🍽️', title: 'Dinner Time!', target: 'Dinner at 6:00 PM' },
                shower:  { hour: 18, minute: 45, icon: '🚿', title: 'Shower Time!', target: 'Showers at 6:45 PM' },
                bed:     { hour: 19, minute: 30, icon: '🌙', title: 'Bedtime!', target: 'Bed at 7:30 PM' }
            },

            // Time windows
            morningStart: 6,    // 6:00 AM
            morningEnd: 7,      // 7:20 AM (use milestone time)
            eveningStart: 17.5, // 5:30 PM
            eveningEnd: 19.5,   // 7:30 PM

            // State
            audioCtx: null,
            audioEnabled: false,
            lastChimeMinute: null,
            currentRoutine: null,

            init() {
                this.update();
                // Update every second
                setInterval(() => this.update(), 1000);

                // Enable audio on first user interaction
                const enableAudio = () => {
                    if (!this.audioEnabled) {
                        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        this.audioEnabled = true;
                        console.log('🔊 Audio enabled!');
                        // Play a tiny test sound to confirm
                        this.playChime('dinner', false);
                    }
                };

                document.addEventListener('click', enableAudio, { once: true });
                document.addEventListener('touchstart', enableAudio, { once: true });
                document.addEventListener('keydown', enableAudio, { once: true });
            },

            initAudio() {
                // Audio is now initialized on user gesture in init()
                if (this.audioCtx && this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }
            },

            // Play themed chime based on current routine - plays 3 beeps
            playChime(routine, isUrgent = false) {
                if (!this.audioEnabled || !this.audioCtx) return;
                this.initAudio();
                const ctx = this.audioCtx;

                // Different sounds for different routines
                const sounds = {
                    morning: { freq: 880, type: 'sine', duration: 0.2 },      // Bright bell
                    dinner:  { freq: 660, type: 'triangle', duration: 0.25 }, // Warm dinner bell
                    shower:  { freq: 523, type: 'sine', duration: 0.2 },      // Water-like
                    bed:     { freq: 392, type: 'sine', duration: 0.3 }       // Soft, low
                };

                const sound = sounds[routine] || sounds.morning;
                const volume = isUrgent ? 0.25 : 0.15;
                const beepGap = 0.3; // Gap between beeps

                // Play 3 consecutive beeps
                for (let i = 0; i < 3; i++) {
                    const startTime = ctx.currentTime + (i * (sound.duration + beepGap));

                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    oscillator.type = sound.type;

                    // For urgent, each beep is higher pitched
                    const freqMultiplier = isUrgent ? 1 + (i * 0.15) : 1;
                    oscillator.frequency.setValueAtTime(sound.freq * freqMultiplier, startTime);

                    gainNode.gain.setValueAtTime(volume, startTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + sound.duration);

                    oscillator.start(startTime);
                    oscillator.stop(startTime + sound.duration);
                }

                // Visual flash (animation loops 5x at 0.6s = 3 seconds)
                const container = document.getElementById('routine-container');
                container.classList.remove('chime-flash'); // Reset if already playing
                void container.offsetWidth; // Force reflow to restart animation
                container.classList.add('chime-flash');
                setTimeout(() => container.classList.remove('chime-flash'), 3000);
            },

            getCurrentRoutineType() {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const timeDecimal = hours + minutes / 60;

                // Morning: 6:00 AM - 7:20 AM
                if (timeDecimal >= this.morningStart && timeDecimal < 7 + 20/60) {
                    return 'morning';
                }

                // Evening: 5:30 PM - 7:30 PM
                if (timeDecimal >= this.eveningStart && timeDecimal < this.eveningEnd) {
                    // Determine which evening milestone
                    const dinnerTime = this.milestones.dinner.hour + this.milestones.dinner.minute/60;
                    const showerTime = this.milestones.shower.hour + this.milestones.shower.minute/60;
                    const bedTime = this.milestones.bed.hour + this.milestones.bed.minute/60;

                    if (timeDecimal < dinnerTime) return 'dinner';
                    if (timeDecimal < showerTime) return 'shower';
                    if (timeDecimal < bedTime) return 'bed';
                }

                return 'off-hours';
            },

            getMinutesRemaining(milestone) {
                const now = new Date();
                const target = new Date();
                target.setHours(milestone.hour, milestone.minute, 0, 0);

                // If target is in the past (shouldn't happen during active window), return 0
                if (target <= now) return 0;

                const diffMs = target - now;
                return Math.ceil(diffMs / (1000 * 60));
            },

            getMorningUrgencyClass(minutes) {
                if (minutes > 30) return 'morning';
                if (minutes > 15) return 'morning-aware';
                if (minutes > 5) return 'morning-hurry';
                return 'morning-urgent';
            },

            getOffHoursMessage() {
                const now = new Date();
                const hours = now.getHours();

                if (hours < this.morningStart) {
                    return { icon: '😴', title: 'Still sleeping time...', message: 'Go back to sleep!' };
                }
                if (hours >= 7 && hours < 12) {
                    return { icon: '📚', title: 'Have a great day!', message: 'Learning time at school!' };
                }
                if (hours >= 12 && hours < this.eveningStart) {
                    return { icon: '☀️', title: 'Enjoy your day!', message: 'See you at dinner time!' };
                }
                // After 7:30 PM
                return { icon: '🌟', title: 'Good night!', message: 'Sweet dreams!' };
            },

            update() {
                const routineType = this.getCurrentRoutineType();
                const container = document.getElementById('routine-container');
                const iconEl = document.getElementById('routine-icon');
                const titleEl = document.getElementById('routine-title');
                const minutesEl = document.getElementById('routine-minutes');
                const labelEl = document.getElementById('routine-label');
                const targetEl = document.getElementById('routine-target');
                const messageEl = document.getElementById('routine-message');

                // Remove all theme classes
                container.className = 'routine-container';

                if (routineType === 'off-hours') {
                    const offHours = this.getOffHoursMessage();
                    container.classList.add('off-hours');
                    iconEl.textContent = offHours.icon;
                    titleEl.textContent = offHours.title;
                    minutesEl.textContent = offHours.message;
                    labelEl.style.display = 'none';
                    targetEl.textContent = '';
                    messageEl.style.display = 'none';
                    this.lastChimeMinute = null;
                    return;
                }

                // Active routine
                const milestone = this.milestones[routineType];
                const minutes = this.getMinutesRemaining(milestone);

                // Apply theme class
                if (routineType === 'morning') {
                    container.classList.add(this.getMorningUrgencyClass(minutes));
                } else {
                    container.classList.add(routineType);
                }

                // Update display
                iconEl.textContent = milestone.icon;
                titleEl.textContent = milestone.title;
                minutesEl.textContent = minutes;
                labelEl.textContent = minutes === 1 ? 'minute' : 'minutes';
                labelEl.style.display = 'block';
                targetEl.textContent = milestone.target;

                // Show message at milestone time (0 minutes)
                if (minutes === 0) {
                    messageEl.textContent = routineType === 'morning' ? 'Time to go! 🏃‍♀️' :
                                           routineType === 'dinner' ? 'Food is ready! 🍽️' :
                                           routineType === 'shower' ? 'Get in the shower! 🚿' :
                                           'Time for bed! 🌙';
                    messageEl.style.display = 'block';
                } else {
                    messageEl.style.display = 'none';
                }

                // Check for 5-minute mark chime
                this.checkChime(routineType, minutes);
            },

            checkChime(routineType, minutes) {
                // Chime at 5-minute intervals
                const chimeMinutes = [60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];

                if (chimeMinutes.includes(minutes) && this.lastChimeMinute !== minutes) {
                    this.lastChimeMinute = minutes;
                    // More urgent chime for lower minutes
                    const isUrgent = minutes <= 10;
                    this.playChime(routineType, isUrgent);
                }

                // Reset lastChimeMinute when routine changes
                if (this.currentRoutine !== routineType) {
                    this.currentRoutine = routineType;
                    this.lastChimeMinute = null;
                }
            }
        };

        // Initialize routines timer
        RoutineTimer.init();
