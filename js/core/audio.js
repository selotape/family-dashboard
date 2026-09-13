// Audio Kit — shared Web Audio *setup* plumbing.
// Six modules (routine-timer, capybara-game, prek-math, roulette-engine,
// reading-game-audio, math-game-audio) used to each hand-roll their own copy
// of: "new (window.AudioContext || window.webkitAudioContext)()", the
// unlock-on-first-gesture listener dance, resume-if-suspended, and the
// createOscillator()+createGain()+connect()+connect(destination) preamble.
// AudioKit exists to de-duplicate exactly that plumbing.
//
// It intentionally does NOT know anything about any specific sound. Every
// module keeps its own hand-tuned frequencies, waveforms, gain envelopes and
// timings, in the module that owns them. AudioKit only ever hands back a
// context (or a fresh osc+gain pair wired to one) - callers write their own
// envelope on top.
//
// One shared AudioContext is used for the whole page (browsers cap how many
// concurrent contexts can exist), so every module reuses the same instance
// instead of creating up to 8 separate ones.
(function() {
    'use strict';

    var sharedCtx = null;

    window.AudioKit = {
        // Lazily creates the single shared AudioContext (once) and resumes it
        // if it's suspended (e.g. iOS Safari after a user gesture). Returns
        // null when the Web Audio API isn't available at all, or if
        // construction throws - callers must handle null exactly like
        // today's `if (!this.audioCtx) return;` guards; it never throws.
        context: function() {
            if (!sharedCtx) {
                var Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return null;
                try {
                    sharedCtx = new Ctx();
                } catch (e) {
                    return null;
                }
            }
            if (sharedCtx.state === 'suspended') {
                sharedCtx.resume();
            }
            return sharedCtx;
        },

        // The unlock-on-first-user-gesture dance. Binds `events` (defaults to
        // ['click', 'touchstart', 'keydown']) on document, each { once: true
        // }, and calls onReady exactly once - on whichever gesture fires
        // first - then removes the still-pending listeners for the other
        // event types so it can never fire a second time.
        unlock: function(events, onReady) {
            events = events || ['click', 'touchstart', 'keydown'];
            var fired = false;
            var bound = [];

            function fire() {
                if (fired) return;
                fired = true;
                bound.forEach(function(entry) {
                    document.removeEventListener(entry.evt, entry.fn);
                });
                if (typeof onReady === 'function') onReady();
            }

            events.forEach(function(evt) {
                var fn = function() { fire(); };
                bound.push({ evt: evt, fn: fn });
                document.addEventListener(evt, fn, { once: true });
            });
        },

        // The osc+gain+connect preamble: creates an oscillator and a gain
        // node on the shared context and wires osc -> gain -> destination.
        // Returns { ctx, osc, gain, start } (start is ctx.currentTime at the
        // moment of creation, the value almost every caller needs right
        // away to time its envelope) or null if there's no context. The
        // caller still sets type/frequency/gain ramps and calls
        // osc.start()/stop() itself - AudioKit never touches sound design.
        voice: function() {
            var ctx = this.context();
            if (!ctx) return null;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            return { ctx: ctx, osc: osc, gain: gain, start: ctx.currentTime };
        }
    };
})();
