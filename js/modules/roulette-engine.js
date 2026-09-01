// Roulette Engine
// The shared slot-machine used by the Game Roulette and Bathtub Roulette tabs:
// pull the lever until three reels land on the same card (jackpot), then that's
// what you're doing. Odds are rigged so the jackpot arrives in ~2 pulls.
//
// Each tab supplies its own games, artwork sprite and copy via create():
//   window.MyRoulette = RouletteEngine.create({
//       pageId, storageKey, artPrefix, eyebrow, games, sprite
//   });
// and the router just calls MyRoulette.init().
(function() {
    'use strict';

    const AMAZON = 'https://www.amazon.com/s?k=';

    const proto = {
        // Chance of a jackpot per pull, by how many pulls have already been
        // spent hunting for this one. Averages ~1.9 pulls, never more than 4.
        JACKPOT_ODDS: [0.35, 0.6, 0.85, 1],

        REPEATS: 6,           // copies of the game list in each reel strip
        FALLBACK_ITEM_H: 132, // px, if the live measurement fails
        MAX_VOTE_BOOST: 6,    // votes beyond this stop increasing the odds

        nearMissLines: [
            'Sooo close! 😮',
            'Ooooh! One more pull! 🙈',
            'Almost had it! 🫣',
            'The machine is warming up… 🔥',
            'Nearly! Pull again! 💪'
        ],

        init: function() {
            this.root = document.getElementById(this.cfg.pageId);
            if (!this.root) return;
            if (!this.built) {
                this.buildSprite();
                this.buildReels();
                this.buildGallery();
                this.bindEvents();
                this.built = true;
            }
            this.updateStatsLine();
        },

        $: function(selector) {
            return this.root ? this.root.querySelector(selector) : null;
        },

        artId: function(game) {
            return this.cfg.artPrefix + game.id;
        },

        // ---- Storage ----
        loadStats: function() {
            let stats = null;
            try {
                stats = JSON.parse(localStorage.getItem(this.cfg.storageKey));
            } catch (e) {
                stats = null;
            }
            if (!stats || typeof stats !== 'object') stats = {};
            if (typeof stats.totalPulls !== 'number') stats.totalPulls = 0;
            if (typeof stats.jackpots !== 'number') stats.jackpots = 0;
            if (!stats.played || typeof stats.played !== 'object') stats.played = {};
            if (!stats.votes || typeof stats.votes !== 'object') stats.votes = {};
            return stats;
        },

        saveStats: function(stats) {
            localStorage.setItem(this.cfg.storageKey, JSON.stringify(stats));
        },

        votesFor: function(gameId) {
            const v = this.loadStats().votes[gameId];
            return typeof v === 'number' && v > 0 ? v : 0;
        },

        upvote: function(gameId) {
            const stats = this.loadStats();
            stats.votes[gameId] = (stats.votes[gameId] || 0) + 1;
            this.saveStats(stats);
            this.refreshVoteCounts(gameId);
            this.cheer();
        },

        // Update every 👍 counter for this game (winner card and gallery).
        refreshVoteCounts: function(gameId) {
            const count = this.votesFor(gameId);
            const nodes = this.root.querySelectorAll('.gr-vote-count[data-game="' + gameId + '"]');
            [].slice.call(nodes).forEach(function(node) {
                node.textContent = count;
                node.classList.remove('bump');
                void node.offsetWidth;
                node.classList.add('bump');
            });
        },

        updateStatsLine: function() {
            const el = this.$('.gr-stats');
            if (!el) return;
            const stats = this.loadStats();
            const playedCount = Object.keys(stats.played).length;
            el.textContent = stats.jackpots
                ? '🎰 ' + stats.jackpots + (stats.jackpots === 1 ? ' jackpot' : ' jackpots') + ' so far · 🎮 ' +
                  playedCount + ' of ' + this.games.length + ' tried'
                : '';
        },

        // ---- Spin logic ----
        rollIsJackpot: function() {
            const odds = this.JACKPOT_ODDS[Math.min(this.pullsThisRound, this.JACKPOT_ODDS.length - 1)];
            return Math.random() < odds;
        },

        // Games the kids upvoted come up a little more often (up to 2.5x), and
        // the previous winner sits this one out so game night keeps changing.
        pickJackpotGame: function() {
            const stats = this.loadStats();
            const self = this;
            let pool = this.games.filter(function(g) { return g.id !== stats.lastJackpotId; });
            if (!pool.length) pool = this.games.slice();

            const weights = pool.map(function(g) {
                const votes = Math.min(stats.votes[g.id] || 0, self.MAX_VOTE_BOOST);
                return 1 + votes * 0.25;
            });
            const total = weights.reduce(function(a, b) { return a + b; }, 0);

            let roll = Math.random() * total;
            for (let i = 0; i < pool.length; i++) {
                roll -= weights[i];
                if (roll <= 0) return pool[i];
            }
            return pool[pool.length - 1];
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
                targets = [];
                const idx = this.games.indexOf(this.pickJackpotGame());
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
            const reel = this.root.querySelectorAll('.gr-reel')[idx];
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
                const result = self.$('.gr-result');
                if (result) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1800);
        },

        // ---- Rendering ----
        measureItemHeight: function() {
            const cell = this.$('.gr-reel-item');
            const h = cell ? Math.round(cell.getBoundingClientRect().height) : 0;
            this.itemHeight = h || this.itemHeight || this.FALLBACK_ITEM_H;
            return this.itemHeight;
        },

        artHtml: function(game, extraClass) {
            return '<svg class="gr-art' + (extraClass ? ' ' + extraClass : '') + '" viewBox="0 0 120 120" aria-hidden="true">' +
                '<use href="#' + this.artId(game) + '"></use></svg>';
        },

        buildReels: function() {
            const wrap = this.$('.gr-reels');
            if (!wrap) return;
            const self = this;

            let cells = '';
            for (let copy = 0; copy < this.REPEATS; copy++) {
                this.games.forEach(function(game) {
                    cells += '<div class="gr-reel-item" data-game="' + game.id + '">' +
                        self.artHtml(game) +
                        '<span class="gr-reel-name">' + game.name + '</span>' +
                    '</div>';
                });
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
            if (!game.equipment || !game.equipment.length) {
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

        // Optional "story starters" for the make-believe games, so nobody has
        // to invent the first move on the spot.
        scenariosHtml: function(game) {
            if (!game.scenarios || !game.scenarios.length) return '';
            let html = '<h4 class="gr-card-h4">✨ Story starters</h4><div class="gr-scenarios">';
            game.scenarios.forEach(function(s) {
                html += '<div class="gr-scenario">' +
                    '<span class="gr-scenario-title">' + s.title + '</span>' +
                    '<span class="gr-scenario-text">' + s.text + '</span>' +
                '</div>';
            });
            return html + '</div>';
        },

        voteButtonHtml: function(game) {
            return '<button type="button" class="gr-vote-btn" data-game="' + game.id + '">' +
                '👍 <span class="gr-vote-label">Loved it!</span> ' +
                '<span class="gr-vote-count" data-game="' + game.id + '">' + this.votesFor(game.id) + '</span>' +
            '</button>';
        },

        renderResult: function(game) {
            const el = this.$('.gr-result');
            if (!el) return;
            const stats = this.loadStats();
            const timesPlayed = stats.played[game.id] || 0;

            el.innerHTML =
                '<div class="gr-card" style="--gr-c:' + game.color + '">' +
                    '<div class="gr-card-art">' + this.artHtml(game, 'gr-art-big') + '</div>' +
                    '<div class="gr-card-body">' +
                        '<div class="gr-card-eyebrow">' + this.cfg.eyebrow + '</div>' +
                        '<h3 class="gr-card-title">' + game.emoji + ' ' + game.name + '</h3>' +
                        '<p class="gr-card-tagline">' + game.tagline + '</p>' +
                        '<div class="gr-card-meta">' +
                            '<span>⏱️ ' + game.time + '</span>' +
                            '<span>👨‍👩‍👧‍👧 ' + game.players + '</span>' +
                            (timesPlayed ? '<span>⭐ played ' + timesPlayed + '×</span>' : '') +
                        '</div>' +
                        '<h4 class="gr-card-h4">How to play</h4>' +
                        this.stepsHtml(game) +
                        this.scenariosHtml(game) +
                        '<h4 class="gr-card-h4">What you need</h4>' +
                        this.equipmentHtml(game) +
                        '<div class="gr-card-actions">' +
                            '<button type="button" class="gr-btn gr-btn-play" data-game="' + game.id + '">' + this.cfg.playLabel + '</button>' +
                            this.voteButtonHtml(game) +
                            '<button type="button" class="gr-btn gr-btn-again">🎲 Spin again</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            el.classList.add('show');
        },

        hideResult: function() {
            const el = this.$('.gr-result');
            if (el) el.classList.remove('show');
        },

        markPlayed: function(gameId) {
            const stats = this.loadStats();
            stats.played[gameId] = (stats.played[gameId] || 0) + 1;
            this.saveStats(stats);
            this.updateStatsLine();

            const card = this.$('.gr-card');
            if (card) card.classList.add('playing');
            const btn = this.$('.gr-btn-play');
            if (btn) {
                btn.textContent = '🥳 Have fun!';
                btn.disabled = true;
            }
            this.fanfare();
        },

        buildGallery: function() {
            const el = this.$('.gr-gallery');
            if (!el) return;
            const self = this;
            let html = '';
            this.games.forEach(function(game) {
                html +=
                    '<details class="gr-gallery-item" style="--gr-c:' + game.color + '">' +
                        '<summary>' +
                            self.artHtml(game, 'gr-art-mini') +
                            '<span class="gr-gallery-name">' + game.name + '</span>' +
                            '<span class="gr-gallery-votes">👍 <span class="gr-vote-count" data-game="' + game.id + '">' +
                                self.votesFor(game.id) + '</span></span>' +
                            '<span class="gr-gallery-time">' + game.time + '</span>' +
                        '</summary>' +
                        '<div class="gr-gallery-body">' +
                            '<p class="gr-card-tagline">' + game.tagline + '</p>' +
                            self.stepsHtml(game) +
                            self.scenariosHtml(game) +
                            self.equipmentHtml(game) +
                            '<div class="gr-gallery-actions">' + self.voteButtonHtml(game) + '</div>' +
                        '</div>' +
                    '</details>';
            });
            el.innerHTML = html;
        },

        setMessage: function(text) {
            const el = this.$('.gr-message');
            if (!el) return;
            el.textContent = text;
            el.classList.remove('pop');
            void el.offsetWidth;
            el.classList.add('pop');
        },

        setMachineState: function(cls, on) {
            const machine = this.$('.gr-machine');
            if (machine) machine.classList.toggle(cls, !!on);
        },

        setLeverHint: function(on) {
            const hint = this.$('.gr-lever-hint');
            if (hint) hint.style.visibility = on ? 'visible' : 'hidden';
        },

        animateLever: function() {
            const lever = this.$('.gr-lever');
            if (!lever) return;
            this.setLeverHint(false);
            lever.classList.add('pulled');
            setTimeout(function() { lever.classList.remove('pulled'); }, 520);
        },

        burstConfetti: function() {
            const wrap = this.$('.gr-confetti');
            if (!wrap) return;
            const colors = this.cfg.confettiColors ||
                ['#f59e0b', '#ef4444', '#22c55e', '#38bdf8', '#a855f7', '#ec4899', '#eab308'];
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

        cheer: function() {
            this.enableAudio();
            this.blip(784, 0.12, 'triangle', 0.13, 0);
            this.blip(1047, 0.18, 'triangle', 0.13, 0.09);
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

            const machine = this.$('.gr-machine');
            if (machine && !machine.dataset.bound) {
                machine.dataset.bound = '1';
                machine.addEventListener('click', function(e) {
                    if (e.target.closest('.gr-lever') || e.target.closest('.gr-pull-btn')) {
                        self.pull();
                    }
                });
            }

            const result = this.$('.gr-result');
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
                    const vote = e.target.closest('.gr-vote-btn');
                    if (vote) {
                        self.upvote(vote.getAttribute('data-game'));
                        return;
                    }
                    const play = e.target.closest('.gr-btn-play');
                    if (play) self.markPlayed(play.getAttribute('data-game'));
                });
            }

            const gallery = this.$('.gr-gallery');
            if (gallery && !gallery.dataset.bound) {
                gallery.dataset.bound = '1';
                gallery.addEventListener('click', function(e) {
                    const vote = e.target.closest('.gr-vote-btn');
                    if (vote) self.upvote(vote.getAttribute('data-game'));
                });
            }
        },

        // One hidden SVG sprite per tab; every reel cell and card just <use>s a
        // symbol, so 180+ on-screen illustrations cost only 10 definitions.
        buildSprite: function() {
            const host = this.$('.gr-sprite');
            if (!host || host.dataset.built) return;
            host.dataset.built = '1';
            host.innerHTML = '<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">' +
                '<defs>' + this.cfg.sprite + '</defs></svg>';
        }
    };

    window.RouletteEngine = {
        create: function(config) {
            const instance = Object.create(proto);
            instance.cfg = config;
            instance.games = config.games;
            instance.playLabel = config.playLabel;
            if (config.jackpotOdds) instance.JACKPOT_ODDS = config.jackpotOdds;
            // per-instance state
            instance.root = null;
            instance.built = false;
            instance.spinning = false;
            instance.pullsThisRound = 0;
            instance.strips = [];
            instance.itemHeight = 0;
            instance.audioCtx = null;
            instance.tickTimer = null;
            return instance;
        }
    };
})();
