// ============================================================================
// GAME ENGINE - Core gameplay, physics, collision, rendering
// ============================================================================

const GameEngine = {
    player: null,
    camera: null,
    platforms: [],
    fruits: [],
    decorations: [],
    keys: {},
    animationId: null,
    levelStartTime: 0,
    gameStats: {
        fruitsCollected: 0,
        totalProblems: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        hearts: 5
    },

    initLevel(level, problems) {
        // Initialize player
        this.player = {
            x: 50,
            y: 100,
            width: 40,
            height: 40,
            vx: 0,
            vy: 0,
            speed: 5,
            jumpStrength: level.jumpStrength,
            gravity: level.gravity,
            onGround: false,
            jumpCount: 0,
            facing: 'right'
        };

        // Initialize camera
        this.camera = {
            x: 0,
            y: 0,
            width: MathGame.canvas.width,
            height: MathGame.canvas.height
        };

        // Copy platforms and fruits
        this.platforms = [...level.platforms];
        this.fruits = level.fruits.map((f, i) => ({
            ...f,
            collected: false,
            problem: problems[f.problemId]
        }));
        this.decorations = [...level.decorations];

        // Load images for decorations
        this.loadDecorationImages();

        // Reset stats
        const isElla = MathGame.activeProfile.gradeLevel === 0;
        this.gameStats = {
            fruitsCollected: 0,
            totalProblems: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            hearts: isElla ? 999 : 5 // Ella gets infinite hearts
        };

        this.levelStartTime = Date.now();

        // Clear any existing game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    },

    start() {
        // Set up input handlers
        this.setupInput();

        // Start game loop
        this.gameLoop();
    },

    setupInput() {
        // Remove old listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);

        // Add new listeners
        this.handleKeyDown = (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault();
            }
            // ESC key: Return to world map
            if (e.key === 'Escape') {
                e.preventDefault();
                if (confirm('Exit level and return to world map?')) {
                    this.exitToWorldMap();
                }
            }
        };

        this.handleKeyUp = (e) => {
            this.keys[e.key] = false;
        };

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    },

    update() {
        if (MathGame.state !== 'gameplay') return;

        const player = this.player;

        // Handle input
        player.vx = 0;
        if (this.keys['ArrowLeft']) {
            player.vx = -player.speed;
            player.facing = 'left';
        }
        if (this.keys['ArrowRight']) {
            player.vx = player.speed;
            player.facing = 'right';
        }
        // Double jump: allow jumping if less than 2 jumps used
        if ((this.keys[' '] || this.keys['ArrowUp']) && player.jumpCount < 2) {
            // Only jump on key press, not on hold
            if (!this.jumpKeyPressed) {
                player.vy = player.jumpStrength;
                player.onGround = false;
                player.jumpCount++;
                AudioManager.playSound('jump');
                this.jumpKeyPressed = true;
            }
        }

        // Reset jump key flag when released
        if (!this.keys[' '] && !this.keys['ArrowUp']) {
            this.jumpKeyPressed = false;
        }

        // Apply gravity
        player.vy += player.gravity;

        // Update position
        player.x += player.vx;
        player.y += player.vy;

        // Check platform collisions
        player.onGround = false;
        for (const platform of this.platforms) {
            if (this.checkAABB(player, platform)) {
                // Calculate overlap on each axis
                const overlapX = Math.min(
                    player.x + player.width - platform.x,
                    platform.x + platform.width - player.x
                );
                const overlapY = Math.min(
                    player.y + player.height - platform.y,
                    platform.y + platform.height - player.y
                );

                // Resolve collision on the axis with smallest overlap
                if (overlapX < overlapY) {
                    // Horizontal collision
                    if (player.x < platform.x) {
                        player.x = platform.x - player.width;
                    } else {
                        player.x = platform.x + platform.width;
                    }
                    player.vx = 0;
                } else {
                    // Vertical collision
                    if (player.y < platform.y) {
                        // Landing on top
                        player.y = platform.y - player.height;
                        player.vy = 0;
                        player.onGround = true;
                        player.jumpCount = 0; // Reset double jump on landing
                    } else {
                        // Hitting from below
                        player.y = platform.y + platform.height;
                        player.vy = 0;
                    }
                }
            }
        }

        // Boundary checking
        if (player.x < 0) player.x = 0;
        if (player.x > LevelManager.currentLevel.levelWidth - player.width) {
            player.x = LevelManager.currentLevel.levelWidth - player.width;
        }
        if (player.y > 450) {
            // Player fell off the map - lose a heart (unless Ella)
            const isElla = MathGame.activeProfile.gradeLevel === 0;
            if (!isElla) {
                this.gameStats.hearts--;
                AudioManager.playSound('wrong');
            }
            // Respawn at start
            player.x = 50;
            player.y = 100;
            player.vy = 0;
            player.jumpCount = 0; // Reset double jump on respawn
        }

        // Update camera
        this.updateCamera();

        // Check fruit collisions
        this.checkFruitCollisions();

        // Check level completion
        if (this.gameStats.fruitsCollected === this.fruits.length) {
            this.completeLevel();
        }

        // Check game over
        if (this.gameStats.hearts <= 0) {
            this.gameOver();
        }
    },

    checkAABB(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },

    updateCamera() {
        const targetX = this.player.x - this.camera.width / 2;
        const maxX = LevelManager.currentLevel.levelWidth - this.camera.width;

        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
    },

    checkFruitCollisions() {
        for (const fruit of this.fruits) {
            if (fruit.collected) continue;

            const dx = this.player.x - fruit.x;
            const dy = this.player.y - fruit.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 50) {
                // Show puzzle
                MathGame.showPuzzle(fruit);
                break;
            }
        }
    },

    collectFruit(fruit) {
        fruit.collected = true;
        this.gameStats.fruitsCollected++;
        AudioManager.playSound('collect');

        // Clear scratch pad when collecting fruit
        MathGame.clearScratchPad();
    },

    loadDecorationImages() {
        for (const deco of this.decorations) {
            if (deco.type === 'image' && deco.image) {
                const img = new Image();
                img.onload = () => {
                    deco.loadedImage = img;
                };
                img.onerror = () => {
                    console.warn(`Failed to load decoration image: ${deco.image}`);
                };
                img.src = deco.image;
            }
        }
    },

    draw() {
        const ctx = MathGame.ctx;
        const canvas = MathGame.canvas;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        const level = LevelManager.currentLevel;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, level.background.sky);
        gradient.addColorStop(1, level.background.ground);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context and apply camera transform
        ctx.save();
        ctx.translate(-this.camera.x, 0);

        // Draw decorations
        for (const deco of this.decorations) {
            if (deco.type === 'image' && deco.loadedImage) {
                // Draw image decoration
                ctx.drawImage(deco.loadedImage, deco.x, deco.y, deco.width, deco.height);
            } else if (deco.emoji) {
                // Draw emoji decoration
                ctx.font = `${deco.size}px Arial`;
                ctx.fillText(deco.emoji, deco.x, deco.y);
            }
        }

        // Draw platforms
        ctx.fillStyle = '#8B7355';
        for (const platform of this.platforms) {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Add rock texture
            ctx.fillStyle = '#6B5345';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
            ctx.fillStyle = '#8B7355';
        }

        // Draw fruits
        ctx.font = '30px Arial';
        for (const fruit of this.fruits) {
            if (!fruit.collected) {
                ctx.fillText(fruit.emoji, fruit.x, fruit.y);
            }
        }

        // Draw player (Capy)
        this.drawPlayer(ctx);

        // Restore context
        ctx.restore();

        // Draw UI
        this.drawUI(ctx);
    },

    drawPlayer(ctx) {
        const p = this.player;

        // Draw Capy body
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(p.x, p.y + 10, p.width, p.height - 10);

        // Head
        ctx.fillStyle = '#A0826D';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + 10, 15, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        const eyeOffset = p.facing === 'right' ? 5 : -5;
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2 + eyeOffset, p.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2 + (eyeOffset * 1.5), p.y + 12, 2, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#6B5345';
        ctx.fillRect(p.x + 5, p.y + p.height - 5, 10, 5);
        ctx.fillRect(p.x + p.width - 15, p.y + p.height - 5, 10, 5);
    },

    drawUI(ctx) {
        const canvas = MathGame.canvas;
        const level = LevelManager.currentLevel;

        // Draw level title at top center
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText(level.name, canvas.width / 2, 25);

        // Draw math topic subtitle
        ctx.font = '14px Arial';
        ctx.fillStyle = '#7f8c8d';
        const topicLabels = {
            'addition-subtraction': 'Addition & Subtraction',
            'multiplication-division': 'Multiplication & Division',
            'fractions': 'Fractions',
            'geometry': 'Geometry',
            'measurement': 'Measurement',
            'review-mix': 'Review Mix',
            'ultimate-challenge': 'Ultimate Challenge'
        };
        ctx.fillText(topicLabels[level.mathTopic] || level.mathTopic, canvas.width / 2, 45);
        ctx.textAlign = 'left';

        // Draw hearts (unless Ella)
        if (MathGame.activeProfile.gradeLevel !== 0) {
            ctx.font = '20px Arial';
            ctx.fillStyle = '#FF1493';
            for (let i = 0; i < this.gameStats.hearts; i++) {
                ctx.fillText('❤️', 10 + i * 30, 75);
            }
        }

        // Draw fruit counter
        ctx.font = '18px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(`🍎 ${this.gameStats.fruitsCollected}/${this.fruits.length}`, canvas.width - 100, 75);

        // Draw profile name
        ctx.fillText(`${MathGame.activeProfile.avatar} ${MathGame.activeProfile.name}`, 10, canvas.height - 10);
    },

    gameLoop() {
        if (MathGame.state !== 'gameplay') return;

        this.update();
        this.draw();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },

    completeLevel() {
        cancelAnimationFrame(this.animationId);

        const elapsedTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
        const accuracy = this.gameStats.totalProblems > 0
            ? Math.round((this.gameStats.correctAnswers / this.gameStats.totalProblems) * 100)
            : 100;
        const stars = ProfileSystem.getStars(accuracy);

        const stats = {
            completed: true,
            stars: stars,
            accuracy: accuracy,
            bestTime: elapsedTime,
            fruitsCollected: this.gameStats.fruitsCollected,
            correctAnswers: this.gameStats.correctAnswers,
            totalProblems: this.gameStats.totalProblems
        };

        ProfileSystem.updateStats(LevelManager.currentLevel.id, stats);
        AudioManager.playSound('levelComplete');
        MathGame.showCelebration();
    },

    gameOver() {
        cancelAnimationFrame(this.animationId);

        const ui = document.getElementById('math-game-ui');
        ui.innerHTML = `
            <div class="game-over-screen">
                <h1>Game Over!</h1>
                <p>Don't give up! Try again!</p>
                <button onclick="MathGame.showWorldMap()">Back to World Map</button>
                <button onclick="MathGame.startLevel(${LevelManager.currentLevel.id})">Try Again</button>
            </div>
        `;
    },

    exitToWorldMap() {
        // Stop game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // Return to world map
        MathGame.showWorldMap();
    }
};

