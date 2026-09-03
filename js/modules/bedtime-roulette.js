// Bedtime Roulette
// Data + artwork for the bedtime slot machine - the last, calmest stop of the
// day, for all three girls together in the bedroom. Same machine as Game
// Roulette; behaviour lives in roulette-engine.js.
(function() {
    'use strict';

    const GAMES = [
        {
            id: 'daddy-sleepover',
            name: 'Daddy Sleeps Over',
            emoji: '🛌',
            color: '#6366f1',
            tagline: 'Abba brings his pillow and stays all night!',
            time: 'All night',
            players: 'All 3 + Abba',
            steps: [
                'Abba goes and gets his own pillow — this is official, he is moving in tonight.',
                'Everybody picks a spot. Feet stay out of faces. That is the only rule.',
                'Lights off, then three whispered questions each — anything you always wanted to ask.',
                'Last one awake wins nothing at all, because everyone should be asleep. 😴'
            ],
            equipment: [
                { icon: '🛏️', label: 'Extra pillow', query: 'soft bed pillow' },
                { icon: '🌙', label: 'Night light', query: 'kids night light bedroom' }
            ]
        },
        {
            id: 'read-alone',
            name: 'Read A Book By Yourself',
            emoji: '📖',
            color: '#38bdf8',
            tagline: 'Your own book, your own bed, your own quiet.',
            time: '15 min',
            players: 'Each on her own',
            steps: [
                'Everybody picks one book — no swapping halfway, choose carefully!',
                'Get comfy in your own bed. Reading light on, big light off.',
                'Fifteen quiet minutes. No talking, no peeking at anyone else\'s book.',
                'When the timer beeps, everyone says one thing that happened in their story. 📚'
            ],
            equipment: [
                { icon: '🔦', label: 'Clip-on book light', query: 'clip on book light for kids' },
                { icon: '📕', label: 'Bedtime books', query: 'bedtime story books for kids' }
            ]
        },
        {
            id: 'storytime',
            name: 'Storytime',
            emoji: '🪄',
            color: '#a855f7',
            tagline: 'One story, three sisters, all in one bed.',
            time: '15 min',
            players: 'All 3 together',
            steps: [
                'Everybody piles into one bed. Yes, one. Squish!',
                'The reader does ALL the voices — the growly one, the squeaky one, the sleepy one.',
                'At every page turn, someone guesses what happens next.',
                'The very last page is read in a whisper, so the room gets quiet on its own. 🤫'
            ],
            scenarios: [
                {
                    title: '📜 The made-up story',
                    text: 'No book tonight! Someone starts with "Once upon a time there were three sisters…" and each girl adds one sentence, around and around, until the story finds its ending.'
                },
                {
                    title: '👵 A story from when you were little',
                    text: 'Ask for a true story about when YOU were a baby. What did you do that was so funny? What was your first word?'
                },
                {
                    title: '🇮🇱 A story from Israel',
                    text: 'Ask for a story from when Abba and Ima were kids in Israel. Sneak in three Hebrew words and see if everyone can guess what they mean.'
                }
            ],
            equipment: [
                { icon: '📚', label: 'Story collection', query: 'bedtime story collection kids' }
            ]
        },
        {
            id: 'mega-cuddle',
            name: 'Mega Cuddle Hog',
            emoji: '🤗',
            color: '#fb7185',
            tagline: 'One giant sister-pile. Nobody escapes!',
            time: '10 min',
            players: 'All 3 + grown-ups',
            steps: [
                'Everybody climbs onto one bed and hugs whoever is closest. Arms and legs everywhere.',
                'Somebody shouts "MEGA CUDDLE!" and the whole pile squeezes at the same time.',
                'Whoever giggles first is the Cuddle Hog and gets squeezed by all the others. 😆',
                'Then hold very still and breathe together — in, out — until everyone is calm and sleepy. 💤'
            ]
        },
        {
            id: 'go-to-sleep',
            name: 'Go To Sleep',
            emoji: '😴',
            color: '#818cf8',
            tagline: 'That\'s it. That\'s the whole activity. (Somebody voted for this twice!)',
            time: 'Right now',
            players: 'Everybody',
            steps: [
                'Lie down. Blanket up to your chin. Bunny in your arms.',
                'Three big breaths — in through your nose, out through your mouth, slooowly.',
                'Goodnight kisses all around, then eyes closed.',
                'Sweet dreams. Laila tov! 🌙'
            ]
        },
        {
            id: 'quiet-game',
            name: 'The Quiet Game',
            emoji: '🤫',
            color: '#2dd4bf',
            tagline: 'Whoever makes a sound loses. Ready… shhh!',
            time: '5 min',
            players: 'All 3',
            steps: [
                'Everybody gets silent at exactly the same time. Go!',
                'No words, no giggles, no squeaks. Faces are allowed — silly faces are encouraged. 😝',
                'The last sister still silent is the Champion of Quiet.',
                'Play it one more time — but now the champion has to try not to smile. 🏆'
            ],
            scenarios: [
                {
                    title: '👂 Listening round',
                    text: 'Silent AND still. Count how many different sounds you can hear in the house. Hold up fingers for your number, then compare.'
                },
                {
                    title: '🙊 The whisper round',
                    text: 'Only whispering is allowed. Anyone who uses a real voice is out — and whispering is very hard when something is funny.'
                }
            ]
        },
        {
            id: 'shadow-puppets',
            name: 'Make Shadows',
            emoji: '🐇',
            color: '#fbbf24',
            tagline: 'Turn your hands into a whole zoo on the wall!',
            time: '15 min',
            players: 'All 3',
            steps: [
                'Lights off, flashlight on, pointed at the biggest empty wall.',
                'Learn the classics first: bunny ears, a barking dog, a flapping bird, a snapping crocodile.',
                'Take turns making a shadow animal while the others guess what it is.',
                'Finish with a whole shadow play — a story where all your animals meet. 🎭'
            ],
            equipment: [
                { icon: '🔦', label: 'Flashlight', query: 'small led flashlight' },
                { icon: '💡', label: 'Shadow puppet set', query: 'shadow puppet hand set kids' }
            ]
        },
        {
            id: 'learn-by-heart',
            name: 'Learn The Whole Thing',
            emoji: '🎵',
            color: '#c084fc',
            tagline: 'Pick a song or poem and learn every single word.',
            time: '15 min',
            players: 'All 3',
            steps: [
                'Choose one song or poem together — Hebrew or English, but the WHOLE thing.',
                'Learn it one line at a time. Say the line, then say it again with your eyes closed.',
                'Add each new line to the ones you already know and go from the very beginning.',
                'When you can do all of it with no help — perform it! Tomorrow night, see if it stayed in your head. 🌟'
            ]
        },
        {
            id: 'sleepy-yoga',
            name: 'Sleepy Stretch',
            emoji: '🧘‍♀️',
            color: '#34d399',
            tagline: 'Stretch like a cat, melt like ice cream.',
            time: '10 min',
            players: 'All 3',
            steps: [
                'Stand tall and reach for the ceiling — now you are the tallest tree in the world.',
                'Curl up small like a sleeping cat, then stretch out looong like a lazy one.',
                'Lie on your back and go floppy: wiggle your toes, then let them melt. Then your legs. Then your arms.',
                'Last one — hands on your tummy and feel it go up and down five slow breaths. 🫁'
            ]
        },
        {
            id: 'high-low',
            name: 'Best & Worst',
            emoji: '🌹',
            color: '#fb923c',
            tagline: 'The best bit of today, the worst bit, and one hope for tomorrow.',
            time: '10 min',
            players: 'All 3 + grown-ups',
            steps: [
                'Sit in a circle on the bed. One at a time, no interrupting — everyone gets a turn.',
                'Say the BEST thing that happened today. 🌞',
                'Then the worst thing. Nobody fixes it or argues, we just listen.',
                'Finish with one thing you are looking forward to tomorrow. Then everybody says thank you. 💛'
            ]
        },
        {
            id: 'dream-journey',
            name: 'Pick Your Dream',
            emoji: '☁️',
            color: '#60a5fa',
            tagline: 'Choose tonight\'s dream before you fall into it.',
            time: '10 min',
            players: 'All 3',
            steps: [
                'Everybody lies down and closes their eyes. One person is the guide.',
                'The guide describes a place, slowly and quietly: a beach, a snowy forest, Savta\'s balcony.',
                'Add one thing each: what do you hear? what do you smell? who is there with you?',
                'Now stay in that place — and try to keep dreaming it after you fall asleep. 🌈'
            ],
            scenarios: [
                {
                    title: '🏖️ The warm sea',
                    text: 'You are floating on your back in a very warm sea. The sun is on your face, the waves rock you like a bed, and someone you love is floating right next to you.'
                },
                {
                    title: '❄️ The quiet snow',
                    text: 'You are in a wooden cabin. Snow is falling outside with no sound at all, and you are under the heaviest, warmest blanket in the world.'
                },
                {
                    title: '🚀 The sleepy spaceship',
                    text: 'Your bed is a spaceship, floating gently past the moon. Look out the window — which planet do you want to visit first?'
                }
            ]
        },
        {
            id: 'sisters-spa',
            name: 'Sisters\' Bedtime Spa',
            emoji: '💆‍♀️',
            color: '#f472b6',
            tagline: 'Hair brushing, back drawing and very gentle hands.',
            time: '15 min',
            players: 'All 3 (take turns)',
            steps: [
                'Sit in a line, everybody facing the same way. Now you can reach the sister in front of you.',
                'Brush her hair — slow and gentle, one hundred strokes if you can count that high.',
                'Then draw with one finger on her back: a letter, a shape, a picture. She has to guess it.',
                'Ring a little bell and everybody turns around, so every sister gets her turn. 🔔'
            ],
            equipment: [
                { icon: '🪮', label: 'Soft detangling brush', query: 'detangling hair brush for kids' },
                { icon: '🧴', label: 'Kids body lotion', query: 'gentle kids body lotion' }
            ]
        }
    ];

    // Sleepy flat illustrations, one <symbol> per activity.
    const SPRITE =
        '<symbol id="bd-art-daddy-sleepover" viewBox="0 0 120 120">' +
            '<circle cx="40" cy="52" r="13" fill="#e0e7ff" stroke="#6366f1" stroke-width="4"/>' +
            '<circle cx="72" cy="58" r="9" fill="#e0e7ff" stroke="#6366f1" stroke-width="4"/>' +
            '<path d="M14 70h92v22c0 5-4 9-9 9H23c-5 0-9-4-9-9z" fill="#a5b4fc" stroke="#6366f1" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M14 78h92" stroke="#6366f1" stroke-width="4"/>' +
            '<path d="M88 26c0-6 5-11 11-11-3 3-4 6-4 9s2 6 5 8c-6 2-12-1-12-6z" fill="#fde68a"/>' +
        '</symbol>' +

        '<symbol id="bd-art-read-alone" viewBox="0 0 120 120">' +
            '<path d="M60 32c-10-8-24-10-40-8v58c16-2 30 0 40 8z" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M60 32c10-8 24-10 40-8v58c-16-2-30 0-40 8z" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M60 32v58" stroke="#0ea5e9" stroke-width="4"/>' +
            '<path d="M30 44h20M30 56h18M70 44h20M70 56h18" stroke="#7dd3fc" stroke-width="4" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="bd-art-storytime" viewBox="0 0 120 120">' +
            '<path d="M60 54c-10-8-24-10-40-8v46c16-2 30 0 40 8z" fill="#f3e8ff" stroke="#a855f7" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M60 54c10-8 24-10 40-8v46c-16-2-30 0-40 8z" fill="#faf5ff" stroke="#a855f7" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M60 54v46" stroke="#a855f7" stroke-width="4"/>' +
            '<path d="M60 10l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="#d8b4fe"/>' +
            '<circle cx="26" cy="24" r="4" fill="#c084fc"/><circle cx="96" cy="30" r="5" fill="#c084fc"/>' +
        '</symbol>' +

        '<symbol id="bd-art-mega-cuddle" viewBox="0 0 120 120">' +
            '<path d="M36 96c-16-12-26-22-26-36 0-11 8-18 17-18 6 0 11 3 14 8 3-5 8-8 14-8 9 0 17 7 17 18 0 14-10 24-26 36z" fill="#fecdd3" stroke="#fb7185" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M88 70c-10-8-16-14-16-23 0-7 5-11 11-11 4 0 7 2 9 5 2-3 5-5 9-5 5 0 10 4 10 11 0 9-7 15-17 23z" fill="#ffe4e6" stroke="#fb7185" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="24" cy="26" r="5" fill="#fda4af"/>' +
        '</symbol>' +

        '<symbol id="bd-art-go-to-sleep" viewBox="0 0 120 120">' +
            '<path d="M78 20c-22 2-38 20-38 42s16 40 38 42c-26 8-52-12-52-42S52 12 78 20z" fill="#e0e7ff" stroke="#818cf8" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M74 22h20L74 44h20" stroke="#a5b4fc" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M84 62h14L84 78h14" stroke="#c7d2fe" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="30" cy="24" r="4" fill="#c7d2fe"/><circle cx="22" cy="86" r="3.5" fill="#c7d2fe"/>' +
        '</symbol>' +

        '<symbol id="bd-art-quiet-game" viewBox="0 0 120 120">' +
            '<circle cx="60" cy="58" r="42" fill="#ccfbf1" stroke="#14b8a6" stroke-width="4"/>' +
            '<circle cx="44" cy="46" r="4.5" fill="#0f766e"/><circle cx="76" cy="46" r="4.5" fill="#0f766e"/>' +
            '<ellipse cx="60" cy="76" rx="11" ry="8" fill="#0f766e"/>' +
            '<rect x="54" y="56" width="12" height="40" rx="6" fill="#99f6e4" stroke="#0f766e" stroke-width="4"/>' +
            '<path d="M54 66h12" stroke="#0f766e" stroke-width="3"/>' +
        '</symbol>' +

        '<symbol id="bd-art-shadow-puppets" viewBox="0 0 120 120">' +
            '<rect x="30" y="14" width="76" height="76" rx="8" fill="#fef9c3" stroke="#f59e0b" stroke-width="4"/>' +
            '<path d="M56 78c-8-6-12-14-12-22 0-7 4-12 10-13l-4-16c-1-4 4-6 6-2l7 16 3-18c1-4 6-4 6 0l1 20c6 2 9 7 9 14 0 8-4 15-12 21z" fill="#78350f"/>' +
            '<path d="M6 52l18-10v20z" fill="#fbbf24" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M24 46l10-4M24 58l10 4" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="bd-art-learn-by-heart" viewBox="0 0 120 120">' +
            '<path d="M60 100C36 82 18 68 18 48c0-13 10-22 22-22 8 0 15 4 20 11 5-7 12-11 20-11 12 0 22 9 22 22 0 20-18 34-42 52z" fill="#f3e8ff" stroke="#c084fc" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M50 72V40l26-6v32" stroke="#7e22ce" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<circle cx="45" cy="72" r="7" fill="#7e22ce"/><circle cx="71" cy="66" r="7" fill="#7e22ce"/>' +
        '</symbol>' +

        '<symbol id="bd-art-sleepy-yoga" viewBox="0 0 120 120">' +
            '<circle cx="60" cy="30" r="13" fill="#d1fae5" stroke="#10b981" stroke-width="4"/>' +
            '<path d="M60 44v26" stroke="#10b981" stroke-width="7" stroke-linecap="round"/>' +
            '<path d="M60 50L34 62M60 50l26 12" stroke="#34d399" stroke-width="7" fill="none" stroke-linecap="round"/>' +
            '<path d="M60 70c-16 0-26 8-26 18h52c0-10-10-18-26-18z" fill="#a7f3d0" stroke="#10b981" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M20 100h80" stroke="#34d399" stroke-width="5" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="bd-art-high-low" viewBox="0 0 120 120">' +
            '<path d="M60 20c12 0 20 9 20 20s-9 20-20 20-20-8-20-20 8-20 20-20z" fill="#fed7aa" stroke="#fb923c" stroke-width="4"/>' +
            '<path d="M60 26c8 4 10 12 6 18s-12 8-18 4" fill="none" stroke="#fb923c" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M60 60v46" stroke="#22c55e" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M60 76c-10-2-18-10-18-20 12 0 18 8 18 20z" fill="#86efac" stroke="#22c55e" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M60 92c10-2 18-10 18-20-12 0-18 8-18 20z" fill="#86efac" stroke="#22c55e" stroke-width="4" stroke-linejoin="round"/>' +
        '</symbol>' +

        '<symbol id="bd-art-dream-journey" viewBox="0 0 120 120">' +
            '<path d="M38 84c-13 0-22-8-22-19 0-10 8-18 18-18 3-13 14-22 27-22 15 0 27 12 28 27 10 1 17 8 17 17 0 9-8 15-19 15z" fill="#dbeafe" stroke="#60a5fa" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M38 92l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#93c5fd"/>' +
            '<path d="M62 98l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#bfdbfe"/>' +
            '<path d="M86 92l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#93c5fd"/>' +
            '<path d="M96 16l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fde68a"/>' +
        '</symbol>' +

        '<symbol id="bd-art-sisters-spa" viewBox="0 0 120 120">' +
            '<rect x="28" y="16" width="42" height="46" rx="14" fill="#fbcfe8" stroke="#ec4899" stroke-width="4"/>' +
            '<path d="M49 62v34c0 6 5 10 11 10s11-4 11-10" fill="none" stroke="#ec4899" stroke-width="7" stroke-linecap="round"/>' +
            '<path d="M38 30v8M49 28v10M60 30v8" stroke="#ec4899" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M94 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#f9a8d4"/>' +
            '<circle cx="86" cy="76" r="5" fill="#f9a8d4"/>' +
        '</symbol>';

    window.BedtimeRoulette = RouletteEngine.create({
        pageId: 'bedtime-roulette',
        storageKey: 'bedtimeRouletteStats',
        artPrefix: 'bd-art-',
        eyebrow: '🌙 Tonight before sleep…',
        playLabel: '🌙 Let\'s do this one!',
        confettiColors: ['#a5b4fc', '#c4b5fd', '#f9a8d4', '#fde68a', '#67e8f9', '#e0e7ff'],
        games: GAMES,
        sprite: SPRITE
    });
})();
