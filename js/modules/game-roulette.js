// Family Game Roulette Module
// A kid-friendly slot machine: pull the lever until three reels land on the
// same game (jackpot), then that's tonight's family game. Odds are rigged so
// the jackpot arrives in ~2 pulls (guaranteed by the 4th), with dramatic
// near-misses in between so it still feels earned.
(function() {
    'use strict';

    const AMAZON = 'https://www.amazon.com/s?k=';

    window.GameRoulette = {
        STORAGE_KEY: 'gameRouletteStats',

        // Chance of a jackpot per pull, by how many pulls have already been
        // spent hunting for this one. Averages ~1.9 pulls, never more than 4.
        JACKPOT_ODDS: [0.35, 0.6, 0.85, 1],

        REPEATS: 6,           // copies of the game list in each reel strip
        FALLBACK_ITEM_H: 132, // px, if the live measurement fails

        games: [
            {
                id: 'hangman',
                name: 'Hangman',
                emoji: '✏️',
                color: '#f59e0b',
                tagline: 'Guess the secret word, one letter at a time!',
                time: '10 min',
                players: '2+ players',
                steps: [
                    'One player thinks of a secret word and draws a blank line for each letter.',
                    'Everyone else calls out letters. A right letter goes into the blanks!',
                    'A wrong letter draws one more part of the stick figure.',
                    'Guess the whole word before the drawing is finished to win! 🎉'
                ],
                equipment: [
                    { icon: '📄', label: 'Paper', query: 'printer paper' },
                    { icon: '✏️', label: 'Pencils', query: 'pencils' },
                    { icon: '🖍️', label: 'Whiteboard (optional)', query: 'small dry erase whiteboard' }
                ]
            },
            {
                id: 'charades',
                name: 'Charades',
                emoji: '🎭',
                color: '#ec4899',
                tagline: 'Act it out — no talking allowed!',
                time: '20 min',
                players: '3+ players',
                steps: [
                    'Write silly things on paper slips: animals, jobs, movies. Fold them into a bowl.',
                    'Pick a slip and act it out with NO words and NO sounds!',
                    'Everyone shouts guesses — you get 2 minutes on the clock.',
                    'Whoever guesses right gets to act next.'
                ],
                equipment: [
                    { icon: '🗂️', label: 'Index cards', query: 'index cards' },
                    { icon: '✏️', label: 'Pencils', query: 'pencils' },
                    { icon: '🥣', label: 'A bowl', query: 'mixing bowl' },
                    { icon: '⏲️', label: 'Timer', query: 'kitchen timer' }
                ]
            },
            {
                id: 'freeze-dance',
                name: 'Freeze Dance',
                emoji: '🕺',
                color: '#38bdf8',
                tagline: 'Dance like crazy — freeze like a statue!',
                time: '15 min',
                players: '2+ players',
                steps: [
                    'Put on the loudest, silliest song you own.',
                    'Everybody dances! Wiggle, jump, spin, be ridiculous.',
                    'One person pauses the music — FREEZE! Do not move a muscle.',
                    'Anyone who wiggles is out. The last statue standing wins!'
                ],
                equipment: [
                    { icon: '🔊', label: 'Speaker', query: 'bluetooth speaker' }
                ]
            },
            {
                id: 'balloon',
                name: 'Balloon Keep-Up',
                emoji: '🎈',
                color: '#ef4444',
                tagline: "Don't let the balloon touch the floor!",
                time: '10 min',
                players: '1+ players',
                steps: [
                    'Blow up one balloon — or two, for extra chaos.',
                    'Tap it in the air. The balloon must NEVER touch the floor.',
                    'Count every tap out loud and try to beat your family record.',
                    'Level up: no hands! Heads, elbows and knees only. 🤪'
                ],
                equipment: [
                    { icon: '🎈', label: 'Balloons', query: 'party balloons' }
                ]
            },
            {
                id: 'sock-hoops',
                name: 'Sock Basketball',
                emoji: '🧦',
                color: '#f97316',
                tagline: 'Roll up socks and shoot some hoops!',
                time: '15 min',
                players: '2+ players',
                steps: [
                    'Roll socks into balls — one per player.',
                    'Put a laundry basket at the far end of the room.',
                    'Take turns shooting. After every score, take one big step back!',
                    'First to 5 baskets wins the sock championship 🏆'
                ],
                equipment: [
                    { icon: '🧦', label: 'Socks', query: 'kids socks' },
                    { icon: '🧺', label: 'Laundry basket', query: 'laundry basket' }
                ]
            },
            {
                id: 'pictionary',
                name: 'Pictionary',
                emoji: '🎨',
                color: '#a855f7',
                tagline: 'Draw it fast — no letters, no numbers!',
                time: '20 min',
                players: '3+ players',
                steps: [
                    'Think of a word (or steal one from the charades bowl).',
                    'Draw it in 60 seconds. No words, letters or numbers allowed!',
                    'Everyone shouts guesses while you scribble.',
                    'A correct guess scores a point for BOTH of you. Race to 10!'
                ],
                equipment: [
                    { icon: '📓', label: 'Drawing pad', query: 'drawing pad kids' },
                    { icon: '🖍️', label: 'Markers', query: 'washable markers kids' },
                    { icon: '⏲️', label: 'Timer', query: 'kitchen timer' }
                ]
            },
            {
                id: 'memory-tray',
                name: 'Memory Tray',
                emoji: '🔍',
                color: '#14b8a6',
                tagline: 'Look, remember… and no peeking!',
                time: '15 min',
                players: '2+ players',
                steps: [
                    'Put 10 random objects on a tray — a spoon, a toy, a sock, an apple…',
                    'Everyone stares at it for 30 seconds, then cover it with a towel!',
                    'Secretly take ONE object away, then uncover the tray.',
                    'Whoever spots what is missing first gets to hide the next one.'
                ],
                equipment: [
                    { icon: '🍽️', label: 'A tray', query: 'serving tray' },
                    { icon: '🧻', label: 'Kitchen towel', query: 'kitchen towels' }
                ]
            },
            {
                id: 'simon-says',
                name: 'Simon Says',
                emoji: '🙌',
                color: '#22c55e',
                tagline: 'Only obey when Simon says!',
                time: '10 min',
                players: '3+ players',
                steps: [
                    'One player is Simon. Everybody else lines up facing them.',
                    '"Simon says touch your nose!" → do it.',
                    'Just "Touch your nose!" with no Simon → do NOT do it. Tricked = you are out!',
                    'The last player standing becomes the next Simon.'
                ],
                equipment: []
            },
            {
                id: 'paper-planes',
                name: 'Paper Plane Derby',
                emoji: '✈️',
                color: '#60a5fa',
                tagline: 'Fold, throw, and fly the farthest!',
                time: '20 min',
                players: '2+ players',
                steps: [
                    'Everyone folds their own paper airplane — decorating is encouraged!',
                    'Mark a launch line on the floor with a strip of tape.',
                    'Three throws each. Measure everybody\'s best flight.',
                    'Hand out prizes for Farthest, Loopiest and Slowest flight 🏅'
                ],
                equipment: [
                    { icon: '📄', label: 'Paper', query: 'printer paper' },
                    { icon: '🩹', label: 'Masking tape', query: 'masking tape' },
                    { icon: '🖍️', label: 'Markers', query: 'washable markers kids' }
                ]
            },
            {
                id: 'bowling',
                name: 'Indoor Bowling',
                emoji: '🎳',
                color: '#eab308',
                tagline: 'Knock down all the pins — strike!',
                time: '20 min',
                players: '2+ players',
                steps: [
                    'Line up 6 empty bottles in a triangle at the end of the hallway.',
                    'Pour a splash of water into each so they do not topple too easily.',
                    'Roll a soft ball at them — two tries per turn.',
                    'Count your knocked-down pins. Highest score after 5 rounds wins!'
                ],
                equipment: [
                    { icon: '🍾', label: 'Plastic bottles', query: 'plastic water bottles' },
                    { icon: '⚽', label: 'Soft foam ball', query: 'foam ball kids' }
                ]
            }
        ],

        // ---- State ----
        built: false,
        spinning: false,
        pullsThisRound: 0,
        strips: [],
        itemHeight: 0,
        audioCtx: null,
        tickTimer: null,

        nearMissLines: [
            'Sooo close! 😮',
            'Ooooh! One more pull! 🙈',
            'Almost had it! 🫣',
            'The machine is warming up… 🔥',
            'Nearly! Pull again! 💪'
        ],

        init: function() {
            const page = document.getElementById('game-roulette');
            if (!page) return;
            if (!this.built) {
                this.buildSprite();
                this.buildReels();
                this.buildGallery();
                this.bindEvents();
                this.built = true;
            }
            this.updateStatsLine();
        },

        // ---- Storage ----
        loadStats: function() {
            let stats = null;
            try {
                stats = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            } catch (e) {
                stats = null;
            }
            if (!stats || typeof stats !== 'object') {
                stats = { totalPulls: 0, jackpots: 0, lastJackpotId: null, played: {} };
            }
            if (!stats.played || typeof stats.played !== 'object') stats.played = {};
            return stats;
        },

        saveStats: function(stats) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
        },

        updateStatsLine: function() {
            const el = document.getElementById('gr-stats');
            if (!el) return;
            const stats = this.loadStats();
            const playedCount = Object.keys(stats.played).length;
            el.textContent = stats.jackpots
                ? '🎰 ' + stats.jackpots + (stats.jackpots === 1 ? ' jackpot' : ' jackpots') + ' so far · 🎮 ' +
                  playedCount + ' of ' + this.games.length + ' games played'
                : '';
        },

        getGame: function(id) {
            return this.games.filter(function(g) { return g.id === id; })[0];
        },

        // ---- Spin logic ----
        // Rigged: the longer the hunt, the likelier the jackpot (never > 4 pulls).
        rollIsJackpot: function() {
            const odds = this.JACKPOT_ODDS[Math.min(this.pullsThisRound, this.JACKPOT_ODDS.length - 1)];
            return Math.random() < odds;
        },

        // Prefer a game they haven't just played, so game night stays varied.
        pickJackpotGame: function() {
            const stats = this.loadStats();
            let pool = this.games.filter(function(g) { return g.id !== stats.lastJackpotId; });
            if (!pool.length) pool = this.games.slice();
            return pool[Math.floor(Math.random() * pool.length)];
        },

        // A losing spin: usually a two-of-three near miss, because that's the
        // fun part - occasionally three different games so it stays honest.
        pickLosingTargets: function() {
            const n = this.games.length;
            const a = Math.floor(Math.random() * n);
            let b = Math.floor(Math.random() * n);
            while (b === a) b = Math.floor(Math.random() * n);

            if (Math.random() < 0.7) {
                return Math.random() < 0.75 ? [a, a, b] : [a, b, a];
            }
            let c = Math.floor(Math.random() * n);
            while (c === a || c === b) c = Math.floor(Math.random() * n);
            return [a, b, c];
        },

        pull: function() {
            if (this.spinning) return;
            this.spinning = true;

            const stats = this.loadStats();
            stats.totalPulls++;
            this.saveStats(stats);

            const isJackpot = this.rollIsJackpot();
            let targets;
            if (isJackpot) {
                const game = this.pickJackpotGame();
                const idx = this.games.indexOf(game);
                targets = [idx, idx, idx];
            } else {
                targets = this.pickLosingTargets();
            }
            this.pullsThisRound++;

            this.enableAudio();
            this.animateLever();
            this.setMessage('Spinning… 🎡');
            this.hideResult();
            this.setMachineState('spinning', true);
            this.startTicking();

            // Reels stop one by one; when the first two match we stretch the
            // last one out for a proper drum-roll moment.
            const suspense = targets[0] === targets[1];
            const durations = [1500, 2100, suspense ? 3700 : 2800];

            const self = this;
            targets.forEach(function(target, i) {
                self.spinReel(i, target, durations[i]);
                setTimeout(function() {
                    self.blip(420 - i * 40, 0.12, 'square', 0.14);
                    self.bounceReel(i);
                }, durations[i]);
            });

            if (suspense) {
                setTimeout(function() {
                    self.setMachineState('suspense', true);
                    self.setMessage('Ooooh… two matching! 😱');
                    self.stopTicking();
                    self.heartbeat();
                }, durations[1] + 120);
            }

            setTimeout(function() {
                self.stopTicking();
                self.setMachineState('spinning', false);
                self.setMachineState('suspense', false);
                self.spinning = false;
                if (isJackpot) {
                    self.onJackpot(self.games[targets[0]]);
                } else {
                    self.onNearMiss(targets);
                }
            }, durations[2] + 260);
        },

        spinReel: function(idx, targetIndex, duration) {
            const strip = this.strips[idx];
            if (!strip) return;
            const h = this.measureItemHeight();
            const n = this.games.length;
            const loops = 3 + idx; // later reels travel further, so they land later
            const offset = (loops * n + targetIndex) * h;

            strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.16, 0.85, 0.22, 1)';
            strip.style.transform = 'translateY(-' + offset + 'px)';

            // Snap back to the equivalent position in the first copy so the
            // next pull always has room to travel.
            setTimeout(function() {
                strip.style.transition = 'none';
                strip.style.transform = 'translateY(-' + (targetIndex * h) + 'px)';
            }, duration + 40);
        },

        bounceReel: function(idx) {
            const reel = document.querySelectorAll('.gr-reel')[idx];
            if (!reel) return;
            reel.classList.remove('landed');
            void reel.offsetWidth; // restart the animation
            reel.classList.add('landed');
        },

        onNearMiss: function(targets) {
            const twoMatch = targets[0] === targets[1] || targets[1] === targets[2] || targets[0] === targets[2];
            const line = twoMatch
                ? this.nearMissLines[Math.floor(Math.random() * this.nearMissLines.length)]
                : 'No match yet — pull again! 🎯';
            this.setMessage(line + '  (pull #' + (this.pullsThisRound + 1) + ' next)');
            this.sadTrombone();
            this.setLeverHint(true);
        },

        onJackpot: function(game) {
            const stats = this.loadStats();
            stats.jackpots++;
            stats.lastJackpotId = game.id;
            this.saveStats(stats);
            this.pullsThisRound = 0;

            this.setMessage('🎉 JACKPOT! 🎉');
            this.setMachineState('jackpot', true);
            this.fanfare();
            this.burstConfetti();
            this.renderResult(game);
            this.updateStatsLine();

            const self = this;
            setTimeout(function() {
                self.setMachineState('jackpot', false);
                const result = document.getElementById('gr-result');
                if (result) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1800);
        },

        // ---- Rendering ----
        measureItemHeight: function() {
            const cell = document.querySelector('.gr-reel-item');
            const h = cell ? Math.round(cell.getBoundingClientRect().height) : 0;
            this.itemHeight = h || this.itemHeight || this.FALLBACK_ITEM_H;
            return this.itemHeight;
        },

        cellHtml: function(game) {
            return '<div class="gr-reel-item" data-game="' + game.id + '">' +
                '<svg class="gr-art" viewBox="0 0 120 120" aria-hidden="true"><use href="#gr-art-' + game.id + '"></use></svg>' +
                '<span class="gr-reel-name">' + game.name + '</span>' +
            '</div>';
        },

        buildReels: function() {
            const wrap = document.getElementById('gr-reels');
            if (!wrap) return;
            const self = this;

            let cells = '';
            for (let copy = 0; copy < this.REPEATS; copy++) {
                this.games.forEach(function(game) { cells += self.cellHtml(game); });
            }

            let html = '';
            for (let r = 0; r < 3; r++) {
                html += '<div class="gr-reel"><div class="gr-reel-strip">' + cells + '</div></div>';
            }
            wrap.innerHTML = html;

            this.strips = [].slice.call(wrap.querySelectorAll('.gr-reel-strip'));

            // Start each reel on a different game so it looks alive from the off.
            const h = this.measureItemHeight();
            this.strips.forEach(function(strip, i) {
                const start = (i * 3 + 1) % self.games.length;
                strip.style.transform = 'translateY(-' + (start * h) + 'px)';
            });
        },

        equipmentHtml: function(game) {
            if (!game.equipment.length) {
                return '<div class="gr-equip"><span class="gr-equip-none">✨ Nothing needed — just you!</span></div>';
            }
            let html = '<div class="gr-equip">';
            game.equipment.forEach(function(item) {
                html += '<a class="gr-equip-chip" href="' + AMAZON + encodeURIComponent(item.query) + '"' +
                    ' target="_blank" rel="noopener noreferrer">' +
                    '<span class="gr-equip-icon">' + item.icon + '</span>' + item.label +
                    '<span class="gr-equip-cart">🛒</span></a>';
            });
            return html + '</div>';
        },

        stepsHtml: function(game) {
            let html = '<ol class="gr-steps">';
            game.steps.forEach(function(step) { html += '<li>' + step + '</li>'; });
            return html + '</ol>';
        },

        renderResult: function(game) {
            const el = document.getElementById('gr-result');
            if (!el) return;
            const stats = this.loadStats();
            const timesPlayed = stats.played[game.id] || 0;

            el.innerHTML =
                '<div class="gr-card" style="--gr-c:' + game.color + '">' +
                    '<div class="gr-card-art">' +
                        '<svg class="gr-art gr-art-big" viewBox="0 0 120 120" aria-hidden="true"><use href="#gr-art-' + game.id + '"></use></svg>' +
                    '</div>' +
                    '<div class="gr-card-body">' +
                        '<div class="gr-card-eyebrow">🎉 Tonight you\'re playing…</div>' +
                        '<h3 class="gr-card-title">' + game.emoji + ' ' + game.name + '</h3>' +
                        '<p class="gr-card-tagline">' + game.tagline + '</p>' +
                        '<div class="gr-card-meta">' +
                            '<span>⏱️ ' + game.time + '</span>' +
                            '<span>👨‍👩‍👧‍👧 ' + game.players + '</span>' +
                            (timesPlayed ? '<span>⭐ played ' + timesPlayed + '×</span>' : '') +
                        '</div>' +
                        '<h4 class="gr-card-h4">How to play</h4>' +
                        this.stepsHtml(game) +
                        '<h4 class="gr-card-h4">What you need</h4>' +
                        this.equipmentHtml(game) +
                        '<div class="gr-card-actions">' +
                            '<button type="button" class="gr-btn gr-btn-play" data-game="' + game.id + '">✅ We\'re playing this!</button>' +
                            '<button type="button" class="gr-btn gr-btn-again">🎲 Spin again</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            el.classList.add('show');
        },

        hideResult: function() {
            const el = document.getElementById('gr-result');
            if (el) el.classList.remove('show');
        },

        markPlayed: function(gameId) {
            const stats = this.loadStats();
            stats.played[gameId] = (stats.played[gameId] || 0) + 1;
            this.saveStats(stats);
            this.updateStatsLine();

            const card = document.querySelector('.gr-card');
            if (card) card.classList.add('playing');
            const btn = document.querySelector('.gr-btn-play');
            if (btn) {
                btn.textContent = '🥳 Have fun!';
                btn.disabled = true;
            }
            this.fanfare();
        },

        buildGallery: function() {
            const el = document.getElementById('gr-gallery');
            if (!el) return;
            const self = this;
            let html = '';
            this.games.forEach(function(game) {
                html +=
                    '<details class="gr-gallery-item" style="--gr-c:' + game.color + '">' +
                        '<summary>' +
                            '<svg class="gr-art gr-art-mini" viewBox="0 0 120 120" aria-hidden="true"><use href="#gr-art-' + game.id + '"></use></svg>' +
                            '<span class="gr-gallery-name">' + game.name + '</span>' +
                            '<span class="gr-gallery-time">' + game.time + '</span>' +
                        '</summary>' +
                        '<div class="gr-gallery-body">' +
                            '<p class="gr-card-tagline">' + game.tagline + '</p>' +
                            self.stepsHtml(game) +
                            self.equipmentHtml(game) +
                        '</div>' +
                    '</details>';
            });
            el.innerHTML = html;
        },

        setMessage: function(text) {
            const el = document.getElementById('gr-message');
            if (!el) return;
            el.textContent = text;
            el.classList.remove('pop');
            void el.offsetWidth;
            el.classList.add('pop');
        },

        setMachineState: function(cls, on) {
            const machine = document.getElementById('gr-machine');
            if (machine) machine.classList.toggle(cls, !!on);
        },

        setLeverHint: function(on) {
            const hint = document.getElementById('gr-lever-hint');
            if (hint) hint.style.visibility = on ? 'visible' : 'hidden';
        },

        animateLever: function() {
            const lever = document.getElementById('gr-lever');
            if (!lever) return;
            this.setLeverHint(false);
            lever.classList.add('pulled');
            setTimeout(function() { lever.classList.remove('pulled'); }, 520);
        },

        burstConfetti: function() {
            const wrap = document.getElementById('gr-confetti');
            if (!wrap) return;
            const colors = ['#f59e0b', '#ef4444', '#22c55e', '#38bdf8', '#a855f7', '#ec4899', '#eab308'];
            let html = '';
            for (let i = 0; i < 80; i++) {
                const size = 6 + Math.random() * 9;
                html += '<span class="gr-confetti-bit" style="' +
                    'left:' + (Math.random() * 100) + '%;' +
                    'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
                    'width:' + size + 'px;height:' + (size * 0.6) + 'px;' +
                    'animation-delay:' + (Math.random() * 0.7) + 's;' +
                    'animation-duration:' + (2 + Math.random() * 1.8) + 's;' +
                '"></span>';
            }
            wrap.innerHTML = html;
            setTimeout(function() { wrap.innerHTML = ''; }, 4500);
        },

        // ---- Audio (Web Audio API, unlocked by the first pull) ----
        enableAudio: function() {
            if (!this.audioCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                this.audioCtx = new Ctx();
            }
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        },

        blip: function(freq, duration, type, volume, delay) {
            if (!this.audioCtx) return;
            const ctx = this.audioCtx;
            const start = ctx.currentTime + (delay || 0);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(volume || 0.12, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
            osc.start(start);
            osc.stop(start + duration);
        },

        startTicking: function() {
            const self = this;
            this.stopTicking();
            this.tickTimer = setInterval(function() {
                self.blip(880 + Math.random() * 120, 0.03, 'square', 0.05);
            }, 90);
        },

        stopTicking: function() {
            if (this.tickTimer) {
                clearInterval(this.tickTimer);
                this.tickTimer = null;
            }
        },

        heartbeat: function() {
            this.blip(160, 0.16, 'sine', 0.16, 0);
            this.blip(160, 0.16, 'sine', 0.16, 0.42);
            this.blip(160, 0.16, 'sine', 0.16, 0.9);
        },

        sadTrombone: function() {
            this.blip(320, 0.22, 'triangle', 0.13, 0);
            this.blip(260, 0.34, 'triangle', 0.13, 0.2);
        },

        fanfare: function() {
            const notes = [523, 659, 784, 1047, 1319];
            const self = this;
            notes.forEach(function(freq, i) {
                self.blip(freq, 0.26, 'triangle', 0.16, i * 0.11);
            });
            this.blip(1568, 0.5, 'sine', 0.1, 0.62);
        },

        // ---- Events ----
        bindEvents: function() {
            const self = this;

            const machine = document.getElementById('gr-machine');
            if (machine && !machine.dataset.bound) {
                machine.dataset.bound = '1';
                machine.addEventListener('click', function(e) {
                    if (e.target.closest('#gr-lever') || e.target.closest('#gr-pull-btn')) {
                        self.pull();
                    }
                });
            }

            const result = document.getElementById('gr-result');
            if (result && !result.dataset.bound) {
                result.dataset.bound = '1';
                result.addEventListener('click', function(e) {
                    const again = e.target.closest('.gr-btn-again');
                    if (again) {
                        self.hideResult();
                        self.setMessage('Here we go again! 🎡');
                        self.pull();
                        return;
                    }
                    const play = e.target.closest('.gr-btn-play');
                    if (play) self.markPlayed(play.getAttribute('data-game'));
                });
            }
        },

        // ---- Artwork ----
        // One hidden SVG sprite; every reel cell and card just <use>s a symbol,
        // so 180+ on-screen illustrations cost only 10 definitions.
        buildSprite: function() {
            const host = document.getElementById('gr-sprite');
            if (!host || host.dataset.built) return;
            host.dataset.built = '1';
            host.innerHTML =
            '<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs>' +

            '<symbol id="gr-art-hangman" viewBox="0 0 120 120">' +
                '<rect x="22" y="14" width="76" height="92" rx="9" fill="#fffbeb" stroke="#f59e0b" stroke-width="4"/>' +
                '<circle cx="60" cy="42" r="11" fill="none" stroke="#78350f" stroke-width="4"/>' +
                '<path d="M60 53v22M60 59l-11 8M60 59l11 8M60 75l-9 13M60 75l9 13" stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none"/>' +
                '<path d="M34 98h13M53 98h13M72 98h13" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>' +
            '</symbol>' +

            '<symbol id="gr-art-charades" viewBox="0 0 120 120">' +
                '<path d="M30 24h60v42c0 20-13 34-30 34S30 86 30 66z" fill="#fce7f3" stroke="#ec4899" stroke-width="4" stroke-linejoin="round"/>' +
                '<circle cx="47" cy="56" r="5.5" fill="#9d174d"/><circle cx="73" cy="56" r="5.5" fill="#9d174d"/>' +
                '<path d="M46 76c6 9 22 9 28 0" stroke="#9d174d" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                '<path d="M16 44c4-6 4-12 0-18M104 44c-4-6-4-12 0-18" stroke="#f9a8d4" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '</symbol>' +

            '<symbol id="gr-art-freeze-dance" viewBox="0 0 120 120">' +
                '<path d="M44 88V34l34-9v54" fill="none" stroke="#0ea5e9" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<circle cx="36" cy="88" r="11" fill="#0ea5e9"/><circle cx="70" cy="79" r="11" fill="#0ea5e9"/>' +
                '<g stroke="#7dd3fc" stroke-width="4" stroke-linecap="round">' +
                    '<path d="M96 14v28M82 28h28M86 18l20 20M106 18l-20 20"/>' +
                '</g>' +
            '</symbol>' +

            '<symbol id="gr-art-balloon" viewBox="0 0 120 120">' +
                '<ellipse cx="60" cy="46" rx="27" ry="33" fill="#ef4444"/>' +
                '<ellipse cx="50" cy="36" rx="7" ry="11" fill="#fca5a5" opacity=".75"/>' +
                '<path d="M55 78h10l-5 8z" fill="#b91c1c"/>' +
                '<path d="M60 86c9 8-9 15 0 24" stroke="#b91c1c" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
            '</symbol>' +

            '<symbol id="gr-art-sock-hoops" viewBox="0 0 120 120">' +
                '<path d="M26 62c-12 8-14 26-2 34" stroke="#fdba74" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-dasharray="5 7"/>' +
                '<path d="M30 58h60l-7 46H37z" fill="#fed7aa" stroke="#f97316" stroke-width="4" stroke-linejoin="round"/>' +
                '<path d="M26 58h68" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>' +
                '<path d="M44 76h32M48 90h24" stroke="#f97316" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
                '<circle cx="84" cy="24" r="15" fill="#f8fafc" stroke="#f97316" stroke-width="4"/>' +
                '<path d="M75 18c6-4 13-3 17 2M76 30c6 3 13 2 17-3" stroke="#fdba74" stroke-width="3" fill="none" stroke-linecap="round"/>' +
            '</symbol>' +

            '<symbol id="gr-art-pictionary" viewBox="0 0 120 120">' +
                '<rect x="20" y="16" width="80" height="62" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="4"/>' +
                '<path d="M32 60c9-20 17 6 26-11s13 9 26-7" stroke="#a855f7" stroke-width="5" fill="none" stroke-linecap="round"/>' +
                '<path d="M40 78l20 26M80 78l-20 26" stroke="#7e22ce" stroke-width="5" stroke-linecap="round"/>' +
                '<circle cx="86" cy="30" r="7" fill="#c084fc"/>' +
            '</symbol>' +

            '<symbol id="gr-art-memory-tray" viewBox="0 0 120 120">' +
                '<rect x="16" y="62" width="88" height="16" rx="8" fill="#99f6e4" stroke="#14b8a6" stroke-width="4"/>' +
                '<circle cx="38" cy="50" r="11" fill="#14b8a6"/>' +
                '<rect x="54" y="38" width="19" height="24" rx="4" fill="#0d9488"/>' +
                '<path d="M82 62l9-22 9 22z" fill="#2dd4bf"/>' +
                '<circle cx="56" cy="94" r="13" fill="none" stroke="#0f766e" stroke-width="4"/>' +
                '<path d="M66 104l12 12" stroke="#0f766e" stroke-width="5" stroke-linecap="round"/>' +
            '</symbol>' +

            '<symbol id="gr-art-simon-says" viewBox="0 0 120 120">' +
                '<rect x="14" y="20" width="92" height="56" rx="16" fill="#dcfce7" stroke="#22c55e" stroke-width="4"/>' +
                '<path d="M40 76l-4 18 22-18z" fill="#dcfce7" stroke="#22c55e" stroke-width="4" stroke-linejoin="round"/>' +
                '<circle cx="46" cy="44" r="5.5" fill="#15803d"/><circle cx="74" cy="44" r="5.5" fill="#15803d"/>' +
                '<path d="M44 58c7 7 25 7 32 0" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                '<path d="M92 88v16" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>' +
                '<circle cx="92" cy="112" r="4" fill="#22c55e"/>' +
            '</symbol>' +

            '<symbol id="gr-art-paper-planes" viewBox="0 0 120 120">' +
                '<path d="M16 56L104 20 74 98 56 70z" fill="#dbeafe" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round"/>' +
                '<path d="M104 20L56 70" fill="none" stroke="#3b82f6" stroke-width="4"/>' +
                '<path d="M56 70l-3 24 21-20" fill="#93c5fd" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round"/>' +
                '<path d="M10 86h22M20 100h20" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>' +
            '</symbol>' +

            '<symbol id="gr-art-bowling" viewBox="0 0 120 120">' +
                '<g fill="#fffbeb" stroke="#eab308" stroke-width="4" stroke-linejoin="round">' +
                    '<path d="M30 14c6 0 9 6 7 13-1 3-4 4-4 7 0 6 10 10 10 25 0 14-6 21-13 21s-13-7-13-21c0-15 10-19 10-25 0-3-3-4-4-7-2-7 1-13 7-13z"/>' +
                    '<path d="M60 22c6 0 9 6 7 13-1 3-4 4-4 7 0 6 10 10 10 25 0 14-6 21-13 21s-13-7-13-21c0-15 10-19 10-25 0-3-3-4-4-7-2-7 1-13 7-13z"/>' +
                '</g>' +
                '<path d="M24 32h12M54 40h12" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>' +
                '<circle cx="94" cy="90" r="18" fill="#eab308"/>' +
                '<circle cx="89" cy="84" r="3.2" fill="#854d0e"/><circle cx="99" cy="86" r="3.2" fill="#854d0e"/><circle cx="93" cy="94" r="3.2" fill="#854d0e"/>' +
            '</symbol>' +

            '</defs></svg>';
        }
    };
})();
