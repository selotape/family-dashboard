// Family Game Roulette
// Data + artwork for the game-night slot machine. All the machine behaviour
// (spinning, odds, audio, confetti, upvotes) lives in roulette-engine.js.
//
// Games flagged `retired: true` drop out of the machine but stay in the
// "all games" gallery, crossed out, in case the family wants one back.
(function() {
    'use strict';

    const GAMES = [
        {
            id: 'blanket-fort',
            name: 'Blanket Fort Challenge',
            emoji: '🏰',
            color: '#8b5cf6',
            tagline: 'Ten minutes, every cushion in the house — build!',
            time: '25 min',
            players: '2+ players',
            steps: [
                'Raid the house for blankets, cushions, chairs and clothes pegs.',
                'Set a 10-minute timer and build the biggest fort you can.',
                'When the timer beeps everyone squeezes inside — it only counts if you ALL fit!',
                'Eat a snack in there. Bonus points for a secret doorbell 🔔'
            ],
            equipment: [
                { icon: '🛏️', label: 'Big blankets', query: 'large fleece throw blanket' },
                { icon: '📎', label: 'Clothes pegs', query: 'clothespins' },
                { icon: '✨', label: 'Fairy lights', query: 'battery fairy lights' },
                { icon: '⏲️', label: 'Timer', query: 'kitchen timer' }
            ]
        },
        {
            id: 'who-am-i',
            name: 'Who Am I?',
            emoji: '🤔',
            color: '#f43f5e',
            tagline: 'A sticky note on your head — guess who you are!',
            time: '15 min',
            players: '3+ players',
            steps: [
                'Everyone writes a character on a sticky note — Elsa, a shark, Savta, anyone!',
                'Stick it on somebody else\'s forehead. No peeking at your own.',
                'Take turns asking yes-or-no questions: "Am I an animal?" "Do I have fur?"',
                'First to guess themselves wins — then swap notes and go again.'
            ],
            equipment: [
                { icon: '🗒️', label: 'Sticky notes', query: 'sticky notes' },
                { icon: '🖍️', label: 'Markers', query: 'washable markers kids' }
            ]
        },
        {
            id: 'flashlight-hunt',
            name: 'Flashlight Treasure Hunt',
            emoji: '🔦',
            color: '#facc15',
            tagline: 'Lights out! Hunt the hidden treasure in the dark.',
            time: '20 min',
            players: '2+ players',
            steps: [
                'One player hides a small shiny toy somewhere in the room.',
                'Turn off every single light and hand out the flashlights.',
                'Hunt! The hider calls out "warmer" and "colder" while you creep around.',
                'Whoever finds it gets to hide it next 🔦'
            ],
            equipment: [
                { icon: '🔦', label: 'Flashlights', query: 'kids flashlight' },
                { icon: '💚', label: 'Glow sticks', query: 'glow sticks' }
            ]
        },
        {
            id: 'pillow-course',
            name: 'Pillow Obstacle Course',
            emoji: '🛋️',
            color: '#fb923c',
            tagline: 'Hop, crawl, spin — and beat the clock!',
            time: '20 min',
            players: '2+ players',
            steps: [
                'Build a course down the hallway: pillows to hop, a chair to crawl under, a cushion to spin on.',
                'Add one silly rule at each station — "bark like a dog here!"',
                'Time every runner while the rest of the family cheers.',
                'Two tries each. The fastest run wins the Golden Pillow 🏆'
            ],
            equipment: [
                { icon: '🛏️', label: 'Throw pillows', query: 'throw pillows' },
                { icon: '🩹', label: 'Masking tape', query: 'masking tape' },
                { icon: '⏲️', label: 'Timer', query: 'kitchen timer' }
            ]
        },
        {
            id: 'story-chain',
            name: 'One-Word Story',
            emoji: '📖',
            color: '#22d3ee',
            tagline: 'Build a wild story one single word at a time.',
            time: '10 min',
            players: '2+ players',
            steps: [
                'Sit in a circle. The first person says ONE word: "Once…"',
                'Go around the circle, each person adding exactly one more word.',
                'No thinking for longer than three seconds — whatever pops out, stays!',
                'Keep going until somebody says "end", then try to retell the whole thing 😂'
            ],
            equipment: []
        },
        {
            id: 'taste-test',
            name: 'Blindfold Taste Test',
            emoji: '👅',
            color: '#84cc16',
            tagline: 'Can you name it with your eyes shut?',
            time: '15 min',
            players: '2+ players',
            steps: [
                'A grown-up lines up six snacks in little bowls — fruit, cracker, cheese, yogurt.',
                'Blindfold the taster and hand them one spoonful at a time.',
                'Guess what it is! One point for every right answer.',
                'Swap places. Sneaky trick: put the SAME thing in two bowls 🤫'
            ],
            equipment: [
                { icon: '😴', label: 'Blindfold', query: 'kids sleep mask' },
                { icon: '🥣', label: 'Little bowls', query: 'small prep bowls set' },
                { icon: '🥄', label: 'Spoons', query: 'small tasting spoons' }
            ]
        },
        {
            id: 'sock-match',
            name: 'Sock Match Race',
            emoji: '🧺',
            color: '#f472b6',
            tagline: 'Tip out the laundry and match the pairs fastest!',
            time: '10 min',
            players: '2+ players',
            steps: [
                'Dump a whole basket of clean socks into one big mountain on the floor.',
                'Ready, set, GO — everybody grabs socks and finds matching pairs.',
                'Roll each pair into a ball and stack it in your own pile.',
                'When the mountain is gone, most pairs wins. (Ima wins either way 😄)'
            ],
            equipment: [
                { icon: '🧺', label: 'Laundry basket', query: 'laundry basket' },
                { icon: '🧦', label: 'Lots of socks', query: 'kids socks multipack' }
            ]
        },
        {
            id: 'shadow-puppets',
            name: 'Shadow Puppet Theatre',
            emoji: '🐇',
            color: '#6366f1',
            tagline: 'Two hands, one lamp, a blank wall — showtime!',
            time: '20 min',
            players: '2+ players',
            steps: [
                'Point a lamp at a blank wall and switch off all the other lights.',
                'Practise your creatures: a rabbit, a bird, a snapping crocodile.',
                'Put on a two-minute show while everyone else guesses the animals.',
                'Level up: cut paper puppets, tape them to sticks and give them voices 🎭'
            ],
            equipment: [
                { icon: '🔦', label: 'Flashlight', query: 'kids flashlight' },
                { icon: '📇', label: 'Card stock', query: 'black card stock paper' },
                { icon: '🥢', label: 'Craft sticks', query: 'wooden craft sticks' }
            ]
        },
        {
            id: 'cookie-face',
            name: 'Cookie Face',
            emoji: '🍪',
            color: '#d97706',
            tagline: 'Forehead to mouth — and absolutely no hands!',
            time: '10 min',
            players: '1+ players',
            steps: [
                'Lean your head back and let a grown-up balance a cookie on your forehead.',
                'GO! Wiggle it down to your mouth using only your face muscles.',
                'No hands allowed. If it falls off, start again with the same cookie.',
                'Fastest cookie-eater wins — although really everybody wins 🍪'
            ],
            equipment: [
                { icon: '🍪', label: 'Round cookies', query: 'oreo cookies' },
                { icon: '⏲️', label: 'Timer', query: 'kitchen timer' }
            ]
        },
        {
            id: 'treasure-map',
            name: 'Treasure Map Hunt',
            emoji: '🗺️',
            color: '#0ea5e9',
            tagline: 'Draw the map, hide the loot, send them hunting!',
            time: '25 min',
            players: '2+ players',
            steps: [
                'One player hides a "treasure" — a toy, a sweet, a secret note — somewhere in the house.',
                'Draw a map of the rooms with a big red ✗ on the spot. Crumple it for pirate vibes!',
                'Hand the map over and say nothing at all. The map has to do the work.',
                'Found it? Then the finder hides the next treasure 🏴‍☠️'
            ],
            equipment: [
                { icon: '📄', label: 'Paper', query: 'printer paper' },
                { icon: '🖍️', label: 'Markers', query: 'washable markers kids' },
                { icon: '🧰', label: 'Treasure box', query: 'small treasure chest box' }
            ]
        },
        {
            id: 'animal-orchestra',
            name: 'Animal Orchestra',
            emoji: '🐸',
            color: '#10b981',
            tagline: 'Moo, ribbit, meow — the conductor decides!',
            time: '10 min',
            players: '3+ players',
            steps: [
                'Everyone picks an animal noise. No two players may pick the same one!',
                'One player is the conductor and holds a wooden spoon as a baton.',
                'Baton pointed at you = make your noise. Baton swept across everyone = full orchestra!',
                'Baton held high means LOUD, held low means tiny whispers. Then swap conductors 🎼'
            ],
            equipment: [
                { icon: '🥄', label: 'Wooden spoon', query: 'wooden spoon' },
                { icon: '🎺', label: 'Kazoos (optional)', query: 'kazoos for kids' }
            ]
        },
        {
            id: 'cup-tower',
            name: 'Cup Tower Showdown',
            emoji: '🥤',
            color: '#ef4444',
            tagline: 'Stack the pyramid, unstack it, do it faster!',
            time: '15 min',
            players: '2+ players',
            steps: [
                'Give every player ten plastic cups.',
                'On "go", stack a pyramid: four cups, then three, then two, then one on top.',
                'Now take it back down into one neat tower — that half counts too!',
                'Fastest stacker takes the round. Best of five wins the crown 👑'
            ],
            equipment: [
                { icon: '🥤', label: 'Plastic cups', query: 'plastic stacking cups kids' }
            ]
        },
        {
            id: 'mirror-me',
            name: 'Mirror Me',
            emoji: '🪞',
            color: '#a3e635',
            tagline: 'Copy every move — can anyone tell who is leading?',
            time: '10 min',
            players: '3+ players',
            steps: [
                'Two players stand facing each other. One leads, the other is the mirror.',
                'Move slooowly — brush your hair, pull a face — and the mirror copies exactly.',
                'A third player watches and tries to guess who is really leading.',
                'Swap roles. Bonus round: the whole family in one long mirror line!'
            ],
            equipment: []
        },
        {
            id: 'shrinking-island',
            name: 'Shrinking Island',
            emoji: '📰',
            color: '#e879f9',
            tagline: 'The music stops — get on your island, quick!',
            time: '15 min',
            players: '2+ players',
            steps: [
                'Spread one big sheet of newspaper on the floor per player — those are the islands.',
                'Music on: dance around the room. Music off: jump onto your island!',
                'After every round fold your island in half. It gets tiny very fast.',
                'Last player still balancing on their island wins 🏝️'
            ],
            equipment: [
                { icon: '📰', label: 'Newspaper', query: 'newsprint paper sheets' },
                { icon: '🔊', label: 'Speaker', query: 'bluetooth speaker' }
            ]
        },
        {
            id: 'laser-maze',
            name: 'Laser Maze',
            emoji: '🕸️',
            color: '#c026d3',
            tagline: 'Crawl through the spy web — touch nothing!',
            time: '25 min',
            players: '2+ players',
            steps: [
                'Tape yarn across a hallway — high, low and criss-cross, like spy lasers.',
                'Take turns crawling, rolling and stepping through without touching a strand.',
                'One touch and the audience sounds the alarm. BZZZT! 🚨',
                'Cleared it? Add three more strings and run the maze again.'
            ],
            equipment: [
                { icon: '🧶', label: 'Yarn', query: 'red yarn ball' },
                { icon: '🩹', label: 'Masking tape', query: 'masking tape' },
                { icon: '🔔', label: 'Alarm bell', query: 'desk call bell' }
            ]
        },
        {
            id: 'hangman',
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
            retired: true,
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
        },
        {
            id: 'duck-balance',
            retired: true,
            name: 'Duck Balance Balloon',
            emoji: '🦆',
            color: '#06b6d4',
            tagline: 'Balance the balloon on the duck — longest wins!',
            time: '10 min',
            players: '2+ players',
            steps: [
                'Blow up a balloon and grab a rubber duck — one of each per player.',
                'Hold the duck flat on your palm and rest the balloon on its head or back.',
                'Hands off the balloon! Everyone counts out loud together: one… two… three…',
                'Whoever balances longest wins. Level up: stand on one leg! 🦩'
            ],
            equipment: [
                { icon: '🦆', label: 'Rubber ducks', query: 'rubber duck bath toys' },
                { icon: '🎈', label: 'Balloons', query: 'party balloons' },
                { icon: '⏲️', label: 'Timer (optional)', query: 'kitchen timer' }
            ]
        }
    ];

    // Kid-friendly flat illustrations, one <symbol> per game.
    const SPRITE =
        '<symbol id="gr-art-blanket-fort" viewBox="0 0 120 120">' +
            '<path d="M60 18v-12h18l-5 6 5 6z" fill="#f59e0b"/>' +
            '<path d="M60 18 14 92c8 6 15 6 23 0s15-6 23 0 15 6 23 0 15-6 23 0z" fill="#ede9fe" stroke="#8b5cf6" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M46 92V76a14 14 0 0 1 28 0v16z" fill="#7c3aed"/>' +
            '<circle cx="44" cy="58" r="3.5" fill="#c4b5fd"/><circle cx="76" cy="58" r="3.5" fill="#c4b5fd"/>' +
            '<circle cx="60" cy="44" r="3.5" fill="#c4b5fd"/>' +
        '</symbol>' +

        '<symbol id="gr-art-who-am-i" viewBox="0 0 120 120">' +
            '<circle cx="60" cy="72" r="32" fill="#ffe4e6" stroke="#f43f5e" stroke-width="4"/>' +
            '<circle cx="49" cy="70" r="4.5" fill="#9f1239"/><circle cx="71" cy="70" r="4.5" fill="#9f1239"/>' +
            '<path d="M48 86c7 7 17 7 24 0" stroke="#9f1239" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<g transform="rotate(-7 60 32)">' +
                '<rect x="34" y="14" width="52" height="36" rx="4" fill="#fef08a" stroke="#eab308" stroke-width="4"/>' +
                '<path d="M53 27c0-5 4-8 8-8s8 3 8 8c0 5-7 5-7 10" stroke="#a16207" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                '<circle cx="62" cy="43" r="2.8" fill="#a16207"/>' +
            '</g>' +
        '</symbol>' +

        '<symbol id="gr-art-flashlight-hunt" viewBox="0 0 120 120">' +
            '<path d="M82 42 114 26v68L82 78z" fill="#fef9c3" opacity=".8"/>' +
            '<path d="M98 48l4 10 11 4-11 4-4 10-4-10-11-4 11-4z" fill="#fde047"/>' +
            '<rect x="26" y="46" width="50" height="28" rx="8" fill="#94a3b8" stroke="#334155" stroke-width="4"/>' +
            '<rect x="12" y="52" width="16" height="16" rx="4" fill="#64748b" stroke="#334155" stroke-width="4"/>' +
            '<path d="M74 38h10v44H74z" fill="#facc15" stroke="#ca8a04" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M38 54h18" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="gr-art-pillow-course" viewBox="0 0 120 120">' +
            '<path d="M18 100c14-6 22-16 34-22s22-18 40-26" stroke="#fdba74" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="7 9"/>' +
            '<rect x="10" y="70" width="44" height="30" rx="13" fill="#ffedd5" stroke="#fb923c" stroke-width="4"/>' +
            '<g transform="rotate(-12 72 60)">' +
                '<rect x="50" y="45" width="44" height="30" rx="13" fill="#fed7aa" stroke="#fb923c" stroke-width="4"/>' +
            '</g>' +
            '<path d="M96 22v56" stroke="#ea580c" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M96 22h22l-7 9 7 9H96z" fill="#f97316"/>' +
        '</symbol>' +

        '<symbol id="gr-art-story-chain" viewBox="0 0 120 120">' +
            '<path d="M12 42c16-8 32-8 48 2v56c-16-10-32-10-48-2z" fill="#cffafe" stroke="#06b6d4" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M108 42c-16-8-32-8-48 2v56c16-10 32-10 48-2z" fill="#ecfeff" stroke="#06b6d4" stroke-width="4" stroke-linejoin="round"/>' +
            '<g stroke="#67e8f9" stroke-width="4" stroke-linecap="round">' +
                '<path d="M22 58h26M22 70h22M72 58h26M72 70h22"/>' +
            '</g>' +
            '<circle cx="34" cy="24" r="4" fill="#67e8f9"/>' +
            '<circle cx="54" cy="16" r="6" fill="#22d3ee"/>' +
            '<circle cx="78" cy="22" r="4.5" fill="#06b6d4"/>' +
        '</symbol>' +

        '<symbol id="gr-art-taste-test" viewBox="0 0 120 120">' +
            '<circle cx="50" cy="52" r="30" fill="#ecfccb" stroke="#84cc16" stroke-width="4"/>' +
            '<rect x="24" y="42" width="52" height="16" rx="8" fill="#4d7c0f"/>' +
            '<path d="M40 70c6 7 14 7 20 0" stroke="#3f6212" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<ellipse cx="84" cy="88" rx="14" ry="10" fill="#a3e635" stroke="#4d7c0f" stroke-width="4"/>' +
            '<path d="M96 95l14 12" stroke="#4d7c0f" stroke-width="6" stroke-linecap="round"/>' +
            '<circle cx="82" cy="86" r="4" fill="#4d7c0f" opacity=".5"/>' +
        '</symbol>' +

        '<symbol id="gr-art-sock-match" viewBox="0 0 120 120">' +
            '<g stroke="#db2777" stroke-width="4" stroke-linejoin="round">' +
                '<path d="M24 10h15v21c0 6 11 7 11 17s-7 13-13 13-13-5-13-13z" fill="#f9a8d4"/>' +
                '<path d="M66 10h15v21c0 6 11 7 11 17s-7 13-13 13-13-5-13-13z" fill="#fbcfe8"/>' +
            '</g>' +
            '<path d="M30 74h60l-8 32H38z" fill="#fdf2f8" stroke="#f472b6" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M26 74h68" stroke="#f472b6" stroke-width="6" stroke-linecap="round"/>' +
            '<path d="M46 84v16M60 84v16M74 84v16" stroke="#f9a8d4" stroke-width="3.5" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="gr-art-shadow-puppets" viewBox="0 0 120 120">' +
            '<rect x="14" y="12" width="92" height="80" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="4"/>' +
            '<path d="M52 52c-7-14-5-25 1-27 6-2 10 9 11 21z" fill="#312e81"/>' +
            '<path d="M66 46c-3-17 1-25 7-25 6 1 7 13 3 25z" fill="#312e81"/>' +
            '<ellipse cx="66" cy="68" rx="23" ry="18" fill="#312e81"/>' +
            '<circle cx="78" cy="64" r="3.5" fill="#eef2ff"/>' +
            '<circle cx="26" cy="104" r="9" fill="#facc15" stroke="#6366f1" stroke-width="3"/>' +
            '<path d="M38 100l12-6M38 108h14" stroke="#a5b4fc" stroke-width="3.5" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="gr-art-cookie-face" viewBox="0 0 120 120">' +
            '<circle cx="56" cy="70" r="32" fill="#fef3c7" stroke="#d97706" stroke-width="4"/>' +
            '<circle cx="45" cy="68" r="4.5" fill="#92400e"/><circle cx="67" cy="68" r="4.5" fill="#92400e"/>' +
            '<ellipse cx="56" cy="86" rx="10" ry="7.5" fill="#92400e"/>' +
            '<circle cx="56" cy="21" r="15" fill="#c2842a" stroke="#78350f" stroke-width="4"/>' +
            '<circle cx="50" cy="17" r="3.4" fill="#431407"/><circle cx="62" cy="20" r="3.4" fill="#431407"/>' +
            '<circle cx="55" cy="28" r="3.4" fill="#431407"/>' +
            '<path d="M44 40l-6 6M68 40l6 6" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round"/>' +
            '<path d="M94 56c7 6 7 16 0 22" stroke="#fbbf24" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="gr-art-treasure-map" viewBox="0 0 120 120">' +
            '<rect x="12" y="20" width="96" height="80" rx="8" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="4"/>' +
            '<path d="M28 88c13-6 4-25 17-31s22 8 35-7" stroke="#0284c7" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="6 8"/>' +
            '<path d="M70 40l18 18M88 40l-18 18" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>' +
            '<circle cx="90" cy="84" r="9" fill="none" stroke="#0284c7" stroke-width="3"/>' +
            '<path d="M90 73v22M79 84h22" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>' +
            '<path d="M22 46l8-12 8 12z" fill="#7dd3fc"/>' +
        '</symbol>' +

        '<symbol id="gr-art-animal-orchestra" viewBox="0 0 120 120">' +
            '<ellipse cx="50" cy="76" rx="34" ry="26" fill="#d1fae5" stroke="#10b981" stroke-width="4"/>' +
            '<circle cx="34" cy="46" r="13" fill="#d1fae5" stroke="#10b981" stroke-width="4"/>' +
            '<circle cx="66" cy="46" r="13" fill="#d1fae5" stroke="#10b981" stroke-width="4"/>' +
            '<circle cx="34" cy="46" r="5" fill="#065f46"/><circle cx="66" cy="46" r="5" fill="#065f46"/>' +
            '<path d="M36 82c8 8 20 8 28 0" stroke="#065f46" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<path d="M96 22v36" stroke="#047857" stroke-width="4" stroke-linecap="round"/>' +
            '<ellipse cx="90" cy="60" rx="8" ry="6" fill="#047857"/>' +
            '<path d="M96 22c8 2 12 5 13 10" stroke="#047857" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="gr-art-cup-tower" viewBox="0 0 120 120">' +
            '<g fill="#fee2e2" stroke="#ef4444" stroke-width="4" stroke-linejoin="round">' +
                '<path d="M16 74h24l-3 26H19z"/><path d="M48 74h24l-3 26H51z"/><path d="M80 74h24l-3 26H83z"/>' +
                '<path d="M32 42h24l-3 26H35z"/><path d="M64 42h24l-3 26H67z"/>' +
                '<path d="M48 10h24l-3 26H51z"/>' +
            '</g>' +
            '<g stroke="#fca5a5" stroke-width="3" stroke-linecap="round">' +
                '<path d="M22 84h14M54 84h14M86 84h14M38 52h14M70 52h14M54 20h14"/>' +
            '</g>' +
        '</symbol>' +

        '<symbol id="gr-art-mirror-me" viewBox="0 0 120 120">' +
            '<path d="M60 10v100" stroke="#65a30d" stroke-width="4" stroke-dasharray="7 9" stroke-linecap="round"/>' +
            '<circle cx="30" cy="48" r="18" fill="#ecfccb" stroke="#84cc16" stroke-width="4"/>' +
            '<path d="M8 106V94c0-13 10-22 22-22s22 9 22 22v12z" fill="#ecfccb" stroke="#84cc16" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="90" cy="48" r="18" fill="#f7fee7" stroke="#84cc16" stroke-width="4"/>' +
            '<path d="M112 106V94c0-13-10-22-22-22s-22 9-22 22v12z" fill="#f7fee7" stroke="#84cc16" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="25" cy="46" r="3.5" fill="#4d7c0f"/><circle cx="36" cy="46" r="3.5" fill="#4d7c0f"/>' +
            '<circle cx="84" cy="46" r="3.5" fill="#4d7c0f"/><circle cx="95" cy="46" r="3.5" fill="#4d7c0f"/>' +
        '</symbol>' +

        '<symbol id="gr-art-shrinking-island" viewBox="0 0 120 120">' +
            '<g transform="rotate(-5 60 82)">' +
                '<rect x="22" y="54" width="76" height="56" rx="5" fill="#fae8ff" stroke="#e879f9" stroke-width="4"/>' +
                '<path d="M60 56v52" stroke="#f0abfc" stroke-width="3" stroke-dasharray="6 7"/>' +
                '<g fill="#c026d3">' +
                    '<ellipse cx="43" cy="88" rx="8" ry="12"/>' +
                    '<circle cx="37" cy="74" r="2.6"/><circle cx="43" cy="72" r="2.6"/><circle cx="49" cy="74" r="2.6"/>' +
                    '<ellipse cx="77" cy="88" rx="8" ry="12"/>' +
                    '<circle cx="71" cy="74" r="2.6"/><circle cx="77" cy="72" r="2.6"/><circle cx="83" cy="74" r="2.6"/>' +
                '</g>' +
            '</g>' +
            '<path d="M92 12v28" stroke="#c026d3" stroke-width="4" stroke-linecap="round"/>' +
            '<ellipse cx="86" cy="42" rx="8" ry="6" fill="#c026d3"/>' +
            '<path d="M92 12c8 2 12 5 13 10" stroke="#c026d3" stroke-width="4" fill="none" stroke-linecap="round"/>' +
            '<path d="M22 34c5-6 5-13 0-19M38 40c7-10 7-22 0-32" stroke="#f0abfc" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="gr-art-laser-maze" viewBox="0 0 120 120">' +
            '<rect x="12" y="12" width="96" height="96" rx="12" fill="#fdf4ff" stroke="#c026d3" stroke-width="4"/>' +
            '<g stroke="#f472b6" stroke-width="4" stroke-linecap="round">' +
                '<path d="M14 34l92 26M106 28L14 60M14 90h92M38 14v92M84 14v92"/>' +
            '</g>' +
            '<circle cx="60" cy="72" r="11" fill="#a21caf"/>' +
            '<path d="M42 100c2-13 12-19 20-19s16 6 18 19z" fill="#a21caf"/>' +
            '<circle cx="56" cy="70" r="2.6" fill="#fdf4ff"/><circle cx="65" cy="70" r="2.6" fill="#fdf4ff"/>' +
        '</symbol>' +

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

        '<symbol id="gr-art-duck-balance" viewBox="0 0 120 120">' +
            '<ellipse cx="48" cy="34" rx="18" ry="22" fill="#ef4444"/>' +
            '<ellipse cx="41" cy="26" rx="5" ry="8" fill="#fca5a5" opacity=".75"/>' +
            '<path d="M44 55h8l-4 7z" fill="#b91c1c"/>' +
            '<path d="M20 30c-3-4-3-9 0-13M76 30c3-4 3-9 0-13" stroke="#06b6d4" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
            '<ellipse cx="54" cy="92" rx="32" ry="17" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>' +
            '<path d="M26 84c-8-4-14-2-16 4 6 5 12 5 17 2z" fill="#facc15" stroke="#ca8a04" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="76" cy="70" r="14" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>' +
            '<path d="M88 66h16l-6 7-10 1z" fill="#f97316" stroke="#ea580c" stroke-width="3" stroke-linejoin="round"/>' +
            '<circle cx="79" cy="65" r="3" fill="#422006"/>' +
        '</symbol>';

    window.GameRoulette = RouletteEngine.create({
        pageId: 'game-roulette',
        storageKey: 'gameRouletteStats',
        artPrefix: 'gr-art-',
        eyebrow: '🎉 Tonight you\'re playing…',
        playLabel: '✅ We\'re playing this!',
        galleryNoun: 'games',
        games: GAMES,
        sprite: SPRITE
    });
})();
