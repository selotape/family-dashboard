// Family Game Roulette
// Data + artwork for the game-night slot machine. All the machine behaviour
// (spinning, odds, audio, confetti, upvotes) lives in roulette-engine.js.
(function() {
    'use strict';

    const GAMES = [
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
    ];

    // Kid-friendly flat illustrations, one <symbol> per game.
    const SPRITE =
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
        '</symbol>';

    window.GameRoulette = RouletteEngine.create({
        pageId: 'game-roulette',
        storageKey: 'gameRouletteStats',
        artPrefix: 'gr-art-',
        eyebrow: '🎉 Tonight you\'re playing…',
        playLabel: '✅ We\'re playing this!',
        games: GAMES,
        sprite: SPRITE
    });
})();
