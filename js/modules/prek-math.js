// Pre-K Math
// Trivial, no-pressure math mini-games for a pre-k kid: counting small groups,
// naming basic shapes, spotting "more", and matching a numeral to a quantity.
// Numbers stay in 1-5. Wrong answers never advance or penalize - the child
// just tries again on the same question until they get it. Fully client-side
// (no server), only a running star count is remembered in localStorage.
(function() {
    'use strict';

    const OBJECTS = ['🍎', '🍓', '🐶', '🐱', '🚗', '⭐', '🦋', '🐳', '🎈', '🍌', '🐸', '🌸'];
    const SHAPES = [
        { id: 'circle', name: 'Circle' },
        { id: 'square', name: 'Square' },
        { id: 'triangle', name: 'Triangle' },
        { id: 'star', name: 'Star' }
    ];
    const SHAPE_COLORS = ['#38bdf8', '#fb923c', '#e94560', '#4ade80', '#fbbf24', '#c084fc'];

    const MODES = [
        { id: 'count', emoji: '🔢', label: 'Count!' },
        { id: 'shapes', emoji: '🔺', label: 'Shapes' },
        { id: 'more', emoji: '⚖️', label: 'More or Fewer' },
        { id: 'match', emoji: '🎯', label: 'Match the Number' }
    ];

    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function pick(arr) { return arr[rand(0, arr.length - 1)]; }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = rand(0, i);
            const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    // n distinct ints in [lo,hi], excluding `correct`
    function distractors(correct, n, lo, hi) {
        const out = [];
        let guard = 0;
        while (out.length < n && guard++ < 200) {
            const v = rand(lo, hi);
            if (v !== correct && out.indexOf(v) === -1) out.push(v);
        }
        return out;
    }

    function shapeSvg(shapeId, color, size) {
        size = size || 100;
        let inner;
        switch (shapeId) {
            case 'circle':
                inner = '<circle cx="50" cy="50" r="42" fill="' + color + '"/>';
                break;
            case 'square':
                inner = '<rect x="10" y="10" width="80" height="80" rx="12" fill="' + color + '"/>';
                break;
            case 'triangle':
                inner = '<polygon points="50,8 92,88 8,88" fill="' + color + '"/>';
                break;
            case 'star':
                inner = '<polygon points="50,5 61,37 95,37 68,57 78,90 50,70 22,90 32,57 5,37 39,37" fill="' + color + '"/>';
                break;
        }
        return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' + inner + '</svg>';
    }

    function emojiRow(emoji, n, className) {
        let html = '';
        for (let i = 0; i < n; i++) {
            html += '<span class="' + className + '" style="animation-delay:' + (i * 0.06) + 's">' + emoji + '</span>';
        }
        return html;
    }

    window.PreKMath = {
        _initialized: false,
        stars: 0,
        mode: null,
        current: null,
        audioCtx: null,
        audioEnabled: false,

        init: function() {
            if (this._initialized) {
                this.renderStars();
                return;
            }
            this._initialized = true;
            this.stars = parseInt(localStorage.getItem('prekMathStars') || '0', 10) || 0;
            this.renderStars();
            this.renderModes();
            this.enableAudioOnClick();

            const back = document.getElementById('prek-back');
            if (back) back.addEventListener('click', this.showModes.bind(this));

            this.showModes();
        },

        // ---- Audio (Web Audio API, matches the app's routine-timer pattern) ----
        enableAudioOnClick: function() {
            const self = this;
            const enable = function() {
                if (!self.audioEnabled) {
                    self.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    self.audioEnabled = true;
                }
            };
            document.addEventListener('click', enable, { once: true });
        },

        playTone: function(freq, dur, type) {
            if (!this.audioCtx) return;
            const ctx = this.audioCtx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.16, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + dur);
        },

        playCorrect: function() {
            const self = this;
            [523.25, 659.25, 783.99].forEach(function(f, i) {
                setTimeout(function() { self.playTone(f, 0.28, 'sine'); }, i * 90);
            });
        },

        playTryAgain: function() {
            this.playTone(220, 0.2, 'sine');
        },

        // ---- Stars ----
        renderStars: function() {
            const span = document.getElementById('prek-star-count');
            if (span) span.textContent = String(this.stars);
        },

        addStar: function() {
            this.stars++;
            localStorage.setItem('prekMathStars', String(this.stars));
            this.renderStars();
        },

        // ---- Mode picker ----
        renderModes: function() {
            const wrap = document.getElementById('prek-modes');
            if (!wrap) return;
            wrap.innerHTML = '';
            MODES.forEach(function(mode) {
                const btn = document.createElement('button');
                btn.className = 'prek-mode-btn prek-mode-' + mode.id;
                btn.innerHTML = '<span class="prek-mode-emoji">' + mode.emoji + '</span>' +
                    '<span class="prek-mode-label">' + mode.label + '</span>';
                btn.addEventListener('click', this.startMode.bind(this, mode.id));
                wrap.appendChild(btn);
            }, this);
        },

        showModes: function() {
            this.mode = null;
            const modes = document.getElementById('prek-modes');
            const game = document.getElementById('prek-game');
            if (modes) modes.hidden = false;
            if (game) game.hidden = true;
        },

        startMode: function(modeId) {
            this.mode = modeId;
            const modes = document.getElementById('prek-modes');
            const game = document.getElementById('prek-game');
            if (modes) modes.hidden = true;
            if (game) game.hidden = false;
            this.nextQuestion();
        },

        // ---- Question generation ----
        nextQuestion: function() {
            const feedback = document.getElementById('prek-feedback');
            if (feedback) feedback.textContent = '';

            let q;
            switch (this.mode) {
                case 'count': q = this.buildCount(); break;
                case 'shapes': q = this.buildShapes(); break;
                case 'more': q = this.buildMore(); break;
                case 'match': q = this.buildMatch(); break;
            }
            this.current = q;
            this.renderQuestion(q);
        },

        buildCount: function() {
            const n = rand(1, 5);
            const obj = pick(OBJECTS);
            const choices = shuffle([n].concat(distractors(n, 2, 1, 5)));
            return { type: 'count', obj: obj, n: n, choices: choices, correct: n };
        },

        buildShapes: function() {
            const shape = pick(SHAPES);
            const color = pick(SHAPE_COLORS);
            const wrong = shuffle(SHAPES.filter(function(s) { return s.id !== shape.id; })).slice(0, 2);
            const choices = shuffle([shape].concat(wrong));
            return { type: 'shapes', shape: shape, color: color, choices: choices, correct: shape.id };
        },

        buildMore: function() {
            const obj = pick(OBJECTS);
            const a = rand(1, 5);
            let b;
            do { b = rand(1, 5); } while (b === a);
            const correctKey = a > b ? 'a' : 'b';
            return { type: 'more', obj: obj, a: a, b: b, correct: correctKey };
        },

        buildMatch: function() {
            const n = rand(1, 5);
            const obj = pick(OBJECTS);
            const choices = shuffle([n].concat(distractors(n, 2, 1, 5)));
            return { type: 'match', obj: obj, numeral: n, choices: choices, correct: n };
        },

        // ---- Rendering ----
        renderQuestion: function(q) {
            const prompt = document.getElementById('prek-prompt');
            const question = document.getElementById('prek-question');
            const answers = document.getElementById('prek-answers');
            if (!prompt || !question || !answers) return;
            answers.innerHTML = '';
            question.innerHTML = '';

            if (q.type === 'count') {
                prompt.textContent = 'How many are there?';
                question.innerHTML = '<div class="prek-row">' + emojiRow(q.obj, q.n, 'prek-item') + '</div>';
                answers.className = 'prek-answers prek-answers-numbers';
                q.choices.forEach(function(num) {
                    const btn = document.createElement('button');
                    btn.className = 'prek-answer-btn prek-answer-number';
                    btn.textContent = String(num);
                    btn.addEventListener('click', this.onAnswer.bind(this, num === q.correct, btn));
                    answers.appendChild(btn);
                }, this);
            } else if (q.type === 'shapes') {
                prompt.textContent = 'What shape is this?';
                question.innerHTML = '<div class="prek-shape-display">' + shapeSvg(q.shape.id, q.color, 150) + '</div>';
                answers.className = 'prek-answers prek-answers-shapes';
                q.choices.forEach(function(s) {
                    const btn = document.createElement('button');
                    btn.className = 'prek-answer-btn prek-answer-shape';
                    btn.innerHTML = shapeSvg(s.id, '#cbd5e1', 56) + '<span>' + s.name + '</span>';
                    btn.addEventListener('click', this.onAnswer.bind(this, s.id === q.correct, btn));
                    answers.appendChild(btn);
                }, this);
            } else if (q.type === 'more') {
                prompt.textContent = 'Which group has MORE?';
                answers.className = 'prek-answers prek-answers-groups';
                [['a', q.a], ['b', q.b]].forEach(function(pair) {
                    const key = pair[0], n = pair[1];
                    const btn = document.createElement('button');
                    btn.className = 'prek-answer-btn prek-group-btn';
                    btn.innerHTML = '<div class="prek-row prek-row-small">' + emojiRow(q.obj, n, 'prek-item-small') + '</div>';
                    btn.addEventListener('click', this.onAnswer.bind(this, key === q.correct, btn));
                    answers.appendChild(btn);
                }, this);
            } else if (q.type === 'match') {
                prompt.textContent = 'Tap the group with this many:';
                question.innerHTML = '<div class="prek-numeral">' + q.numeral + '</div>';
                answers.className = 'prek-answers prek-answers-groups';
                q.choices.forEach(function(n) {
                    const btn = document.createElement('button');
                    btn.className = 'prek-answer-btn prek-group-btn';
                    btn.innerHTML = '<div class="prek-row prek-row-small">' + emojiRow(q.obj, n, 'prek-item-small') + '</div>';
                    btn.addEventListener('click', this.onAnswer.bind(this, n === q.correct, btn));
                    answers.appendChild(btn);
                }, this);
            }
        },

        onAnswer: function(isCorrect, btnEl) {
            const feedback = document.getElementById('prek-feedback');
            const answers = document.getElementById('prek-answers');
            if (isCorrect) {
                this.addStar();
                this.playCorrect();
                if (feedback) feedback.textContent = '🎉 Great job!';
                if (answers) answers.querySelectorAll('.prek-answer-btn').forEach(function(b) { b.disabled = true; });
                btnEl.classList.add('prek-correct');
                setTimeout(this.nextQuestion.bind(this), 1100);
            } else {
                this.playTryAgain();
                if (feedback) feedback.textContent = 'Try again! 💪';
                btnEl.classList.add('prek-shake');
                setTimeout(function() { btnEl.classList.remove('prek-shake'); }, 400);
            }
        }
    };
})();
