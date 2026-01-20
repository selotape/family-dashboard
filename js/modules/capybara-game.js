// Capybara Amazon River Game Module
// Platformer game where capybara swims through the Amazon River
(function() {
    'use strict';

    window.Game = {
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
        initAudio: function() {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // iOS Safari requires resume after user gesture
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        },

        playSound: function(type) {
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

        init: function() {
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

        handleInput: function() {
            if (!this.running && this.gameOver) {
                this.start();
            } else if (this.running) {
                this.jump();
            }
        },

        start: function() {
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

        jump: function() {
            if (!this.capybara.jumping) {
                this.capybara.velocityY = -14;
                this.capybara.jumping = true;
                this.playSound('jump');
            }
        },

        spawnObstacle: function() {
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

        spawnBackgroundAnimal: function() {
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

        spawnLilyPads: function() {
            for (let i = 0; i < 5; i++) {
                this.lilyPads.push({
                    x: Math.random() * this.canvas.width,
                    y: 330 + Math.random() * 50,
                    size: 20 + Math.random() * 15
                });
            }
        },

        spawnBubble: function() {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height,
                size: 3 + Math.random() * 5,
                speed: 1 + Math.random() * 2
            });
        },

        update: function() {
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

        draw: function() {
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

        drawCapybara: function() {
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

        endGame: function() {
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

        gameLoop: function() {
            if (!this.running) return;

            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    };
})();
