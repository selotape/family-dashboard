// Bathtub Roulette
// Data + artwork for the bath-time slot machine - the lure that gets kids
// INTO the tub. Same machine as Game Roulette; behaviour lives in
// roulette-engine.js.
(function() {
    'use strict';

    const GAMES = [
        {
            id: 'paw-patrol',
            name: 'Paw Patrol Rescue Bay',
            emoji: '🐾',
            color: '#38bdf8',
            tagline: 'Adventure Bay needs you — no job is too big!',
            time: '15 min',
            players: '1-3 pups',
            steps: [
                'Pick your pup: Skye flies, Chase is police, Marshall is fire, Zuma dives, Everest digs snow.',
                'The tub is Adventure Bay. The faucet is the tallest cliff, the bubbles are the ocean.',
                'Ryder (that\'s the grown-up!) calls out a rescue mission.',
                'Save the day, then bark "PAW Patrol is on a roll!" and pick the next mission. 🎉'
            ],
            scenarios: [
                {
                    title: '🚁 Skye\'s cliff rescue',
                    text: 'A tiny kitten is stuck at the very top of the cliff (the faucet!) and the water is rising. Fly up, scoop the kitten and glide it safely to the bubble beach.'
                },
                {
                    title: '🚒 Marshall\'s bubble volcano',
                    text: 'The bubble volcano is erupting and foam is everywhere! Use your water cannon to wash the bubbles down before they cover all of Adventure Bay.'
                },
                {
                    title: '🌊 Zuma\'s sunken treasure',
                    text: 'A treasure chest sank to the bottom of the bay. Dive down, count the treasures you find, and bring them up before the big wave comes!'
                }
            ],
            equipment: [
                { icon: '🐶', label: 'Paw Patrol bath toys', query: 'paw patrol bath toys' },
                { icon: '💦', label: 'Squirt toys', query: 'bath squirt toys kids' }
            ]
        },
        {
            id: 'crayon-gallery',
            name: 'Tub Crayon Art Show',
            emoji: '🖍️',
            color: '#ec4899',
            tagline: 'The bathtub wall is your giant canvas!',
            time: '15 min',
            players: '1-3 artists',
            steps: [
                'Everyone gets a wall (or a corner of one) — that\'s your canvas.',
                'Draw a secret picture while the others cover their eyes. No peeking!',
                'Put on an art show: point at your masterpiece and tell its story.',
                'Then the best part — wash it all off with a sponge and start again! 🧽'
            ],
            equipment: [
                { icon: '🖍️', label: 'Bathtub crayons', query: 'bathtub crayons for kids' },
                { icon: '🧽', label: 'Eraser sponge', query: 'magic eraser sponge' }
            ]
        },
        {
            id: 'bubble-salon',
            name: 'Bubble Beard Salon',
            emoji: '🫧',
            color: '#a855f7',
            tagline: 'Foam beards, bubble crowns and silly hairdos!',
            time: '10 min',
            players: '1-3 clients',
            steps: [
                'Scoop up a big pile of foam — that\'s your styling gel.',
                'Give each other bubble beards, bubble crowns, unicorn horns and giant swirly hairdos.',
                'Look in the mirror and give your look a fancy name ("The Bubble Princess"!).',
                'Take a bow, then rinse and invent a whole new style. 💇‍♀️'
            ],
            equipment: [
                { icon: '🛁', label: 'Bubble bath', query: 'kids bubble bath tear free' },
                { icon: '🪞', label: 'Suction bath mirror', query: 'bath mirror suction kids' }
            ]
        },
        {
            id: 'flight-to-savta',
            name: 'Flight to Savta',
            emoji: '✈️',
            color: '#0ea5e9',
            tagline: 'Fly from Morningside all the way to Israel!',
            time: '20 min',
            players: '1-3 travellers',
            steps: [
                'Pack your suitcase (a cup!) and drive from Morningside to the airport.',
                'Buckle up — the tub is the airplane. Count down in Hebrew: shalosh, shtayim, echad… liftoff! 🛫',
                'Fly all night over the big ocean. Look out the window at the clouds (the bubbles!).',
                'Land in Tel Aviv, run to the yam (sea), and give Savta the biggest hug. ❤️'
            ],
            scenarios: [
                {
                    title: '🛫 Take-off from Atlanta',
                    text: 'You are the pilot! Announce over the speaker: "Shalom passengers, next stop Tel Aviv!" Then make the engine roar as the plane climbs over the Morningside trees.'
                },
                {
                    title: '🏖️ Beach day in Tel Aviv',
                    text: 'You made it to the yam! The water is warm. Play matkot (beach paddle) with your hands, dig for shells and eat pretend falafel on the sand.'
                },
                {
                    title: '🏠 Savta\'s kitchen',
                    text: 'Savta is making you a snack and wants to hear EVERYTHING about America. Tell her three things in Hebrew — mayim (water), toda (thank you), ani ohevet otach (I love you).'
                }
            ],
            equipment: [
                { icon: '🥤', label: 'Stacking cups', query: 'stacking cups bath toy' },
                { icon: '⛵', label: 'Bath boats', query: 'bath boat toys for kids' }
            ]
        },
        {
            id: 'mermaid-academy',
            name: 'Mermaid Academy',
            emoji: '🧜‍♀️',
            color: '#14b8a6',
            tagline: 'Pass the tests and earn your mermaid tail!',
            time: '15 min',
            players: '1-3 mermaids',
            steps: [
                'Choose your secret mermaid name — Coral? Pearl? Bubbles?',
                'Test 1: the Tail Flip. Kick your legs together like one big tail.',
                'Test 2: the Deep Dive. Put just your ears under and listen to the ocean.',
                'Test 3: Treasure Hunt. Find 5 sunken treasures with your eyes closed. Then you graduate! 👑'
            ],
            scenarios: [
                {
                    title: '🐠 The lost baby fish',
                    text: 'A baby fish lost its family in the deep water. Swim it home while singing your mermaid song.'
                },
                {
                    title: '👑 The queen\'s missing crown',
                    text: 'The sea queen\'s crown fell off the reef! Dive down and rescue it before the crab steals it.'
                },
                {
                    title: '🐚 The talking shell',
                    text: 'You found a magic shell that whispers secrets. Hold it to your ear — what does it tell you to do next?'
                }
            ],
            equipment: [
                { icon: '🧜‍♀️', label: 'Mermaid bath toys', query: 'mermaid bath toys for girls' },
                { icon: '💎', label: 'Diving treasure toys', query: 'diving gems pool toys' }
            ]
        },
        {
            id: 'potion-shop',
            name: 'Potion Shop',
            emoji: '🧪',
            color: '#8b5cf6',
            tagline: 'Mix magic colors and invent a spell!',
            time: '15 min',
            players: '1-3 wizards',
            steps: [
                'Drop a color tablet in and watch the water change — abracadabra! 🪄',
                'Mix two colors in a cup and guess what new color appears.',
                'Name your potion ("Giggle Juice!") and say what magic it does.',
                'Pour it slowly from cup to cup while chanting your spell.'
            ],
            equipment: [
                { icon: '🎨', label: 'Bath color tablets', query: 'bath color tablets for kids' },
                { icon: '🥛', label: 'Measuring cups', query: 'plastic measuring cups kids' },
                { icon: '💧', label: 'Droppers', query: 'kids science pipettes droppers' }
            ]
        },
        {
            id: 'sink-or-float',
            name: 'Sink or Float Lab',
            emoji: '🔬',
            color: '#22c55e',
            tagline: 'Be a scientist — guess before you drop!',
            time: '10 min',
            players: '1-3 scientists',
            steps: [
                'Collect a few safe things: a sponge, a spoon, a cup, a toy, a ping pong ball.',
                'Before each one, everybody shouts their guess: SINK or FLOAT?',
                'Drop it in. Were you right? Cheer for correct guesses!',
                'Bonus: can you make a floating thing sink by filling it with water? 🤔'
            ],
            equipment: [
                { icon: '🏓', label: 'Ping pong balls', query: 'ping pong balls' },
                { icon: '🥛', label: 'Measuring cups', query: 'plastic measuring cups kids' }
            ]
        },
        {
            id: 'toy-olympics',
            name: 'Bath Toy Olympics',
            emoji: '🏆',
            color: '#f59e0b',
            tagline: 'Duck races, diving contests and gold medals!',
            time: '15 min',
            players: '1-3 coaches',
            steps: [
                'Each player picks a toy athlete and gives it a champion name.',
                'Event 1 — the Splash Dive: drop your toy from up high, biggest splash wins!',
                'Event 2 — the Duck Race: blow your toy across the tub. No hands!',
                'Event 3 — the Deep Dive: push your toy under and see whose pops up highest. Medals for everyone! 🥇'
            ],
            equipment: [
                { icon: '🦆', label: 'Rubber ducks', query: 'rubber duck bath toys' },
                { icon: '⛵', label: 'Bath boats', query: 'bath boat toys for kids' }
            ]
        },
        {
            id: 'doll-bath',
            name: 'Baby Doll Bath Time',
            emoji: '🧸',
            color: '#f472b6',
            tagline: 'You be the mommy — the babies need a bath!',
            time: '15 min',
            players: '1-3 mommies',
            steps: [
                'Bring in the babies (dolls or bath toys) — they are very muddy today!',
                'Wash them gently: hair first, then toes. Do not forget behind the ears!',
                'Sing them the bath song and tell them not to be scared of the water.',
                'Wrap each baby in a towel and tuck it in. Sweet dreams! 😴'
            ],
            equipment: [
                { icon: '👶', label: 'Bath baby doll', query: 'bath time baby doll' },
                { icon: '🧼', label: 'Baby washcloths', query: 'baby washcloths soft' }
            ]
        },
        {
            id: 'rainbow-waterfall',
            name: 'Rainbow Waterfall',
            emoji: '🌈',
            color: '#06b6d4',
            tagline: 'Build a tower and pour the perfect waterfall!',
            time: '10 min',
            players: '1-3 builders',
            steps: [
                'Stack your cups into the tallest rainbow tower you can build.',
                'Pour water in the top cup and watch it waterfall all the way down.',
                'Try it with holes: which cup makes rain, and which makes a river?',
                'Finish with the best part — knock the whole tower down! 💥'
            ],
            equipment: [
                { icon: '🥤', label: 'Stacking cups', query: 'stacking cups bath toy' },
                { icon: '💧', label: 'Waterfall bath toy', query: 'bath waterfall cups toy' }
            ]
        }
    ];

    // Bath-themed flat illustrations, one <symbol> per game.
    const SPRITE =
        '<symbol id="br-art-paw-patrol" viewBox="0 0 120 120">' +
            '<circle cx="60" cy="70" r="24" fill="#38bdf8"/>' +
            '<ellipse cx="38" cy="42" rx="10" ry="13" fill="#38bdf8"/>' +
            '<ellipse cx="60" cy="34" rx="10" ry="13" fill="#38bdf8"/>' +
            '<ellipse cx="82" cy="42" rx="10" ry="13" fill="#38bdf8"/>' +
            '<path d="M10 100c8-6 16-6 24 0s16 6 24 0 16-6 24 0 16 6 24 0" stroke="#0ea5e9" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="br-art-crayon-gallery" viewBox="0 0 120 120">' +
            '<path d="M46 20h30v58H46z" fill="#f9a8d4" stroke="#ec4899" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M46 20l15-14 15 14z" fill="#fbcfe8" stroke="#ec4899" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M46 34h30" stroke="#ec4899" stroke-width="4"/>' +
            '<path d="M22 96c8-14 18 6 28-8s16 10 26-4" stroke="#f472b6" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="br-art-bubble-salon" viewBox="0 0 120 120">' +
            '<circle cx="44" cy="46" r="20" fill="#ddd6fe" stroke="#a855f7" stroke-width="4"/>' +
            '<circle cx="76" cy="34" r="13" fill="#ede9fe" stroke="#a855f7" stroke-width="4"/>' +
            '<circle cx="80" cy="64" r="17" fill="#ddd6fe" stroke="#a855f7" stroke-width="4"/>' +
            '<circle cx="38" cy="30" r="6" fill="#f5f3ff" stroke="#a855f7" stroke-width="3"/>' +
            '<path d="M24 96c10-8 20-8 30 0s22 8 32 0" stroke="#a855f7" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '</symbol>' +

        '<symbol id="br-art-flight-to-savta" viewBox="0 0 120 120">' +
            '<path d="M14 48L102 14 74 88 56 62z" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M102 14L56 62" fill="none" stroke="#0ea5e9" stroke-width="4"/>' +
            '<path d="M56 62l-3 22 20-18" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M10 104c8-6 16-6 24 0s16 6 24 0 16-6 24 0 16 6 24 0" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round"/>' +
            '<path d="M92 96l-5-5c-3-3 1-8 5-5 4-3 8 2 5 5z" fill="#ef4444"/>' +
        '</symbol>' +

        '<symbol id="br-art-mermaid-academy" viewBox="0 0 120 120">' +
            '<path d="M58 14c12 12 4 26-2 34s-8 20-2 30" fill="none" stroke="#14b8a6" stroke-width="17" stroke-linecap="round"/>' +
            '<path d="M56 80c-18 6-30 18-32 34 20 2 36-8 42-20z" fill="#5eead4" stroke="#0f766e" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M56 80c18 6 30 18 32 34-20 2-36-8-42-20z" fill="#5eead4" stroke="#0f766e" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M52 40c4 3 8 3 12 0M50 58c4 3 8 3 12 0" stroke="#0f766e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>' +
            '<circle cx="26" cy="30" r="7" fill="none" stroke="#5eead4" stroke-width="3.5"/>' +
            '<circle cx="94" cy="44" r="5" fill="none" stroke="#5eead4" stroke-width="3.5"/>' +
        '</symbol>' +

        '<symbol id="br-art-potion-shop" viewBox="0 0 120 120">' +
            '<path d="M50 14h20v22l20 44c4 10-2 20-13 20H43c-11 0-17-10-13-20l20-44z" fill="#ede9fe" stroke="#8b5cf6" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M39 68h42l9 20c4 10-2 12-13 12H43c-11 0-17-2-13-12z" fill="#a78bfa"/>' +
            '<path d="M46 10h28" stroke="#8b5cf6" stroke-width="6" stroke-linecap="round"/>' +
            '<circle cx="52" cy="82" r="4" fill="#ede9fe"/><circle cx="68" cy="90" r="5" fill="#ede9fe"/>' +
            '<path d="M96 26l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#c4b5fd"/>' +
        '</symbol>' +

        '<symbol id="br-art-sink-or-float" viewBox="0 0 120 120">' +
            '<circle cx="34" cy="42" r="16" fill="#dcfce7" stroke="#16a34a" stroke-width="4"/>' +
            '<path d="M30 30c3-3 7-3 10 0" stroke="#86efac" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
            '<path d="M6 58c9-7 18-7 27 0s18 7 27 0 18-7 27 0 18 7 27 0" stroke="#22c55e" stroke-width="6" fill="none" stroke-linecap="round"/>' +
            '<rect x="70" y="78" width="30" height="26" rx="6" fill="#86efac" stroke="#16a34a" stroke-width="4"/>' +
            '<path d="M85 62v10M79 66l6 8 6-8" stroke="#16a34a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</symbol>' +

        '<symbol id="br-art-toy-olympics" viewBox="0 0 120 120">' +
            '<path d="M28 22h64v18c0 18-14 30-32 30S28 58 28 40z" fill="#fef3c7" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M28 28H16c0 14 6 20 14 21M92 28h12c0 14-6 20-14 21" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M52 70h16v14H52z" fill="#fbbf24"/>' +
            '<path d="M38 84h44v10H38z" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M46 40l5 10 11 2-8 8 2 11-10-6-10 6 2-11-8-8 11-2z" fill="#f59e0b" opacity=".55"/>' +
        '</symbol>' +

        '<symbol id="br-art-doll-bath" viewBox="0 0 120 120">' +
            '<circle cx="60" cy="40" r="22" fill="#fce7f3" stroke="#f472b6" stroke-width="4"/>' +
            '<circle cx="52" cy="38" r="3.5" fill="#9d174d"/><circle cx="68" cy="38" r="3.5" fill="#9d174d"/>' +
            '<path d="M53 48c4 4 10 4 14 0" stroke="#9d174d" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
            '<path d="M20 72h80v14c0 12-8 20-20 20H40c-12 0-20-8-20-20z" fill="#fbcfe8" stroke="#f472b6" stroke-width="4" stroke-linejoin="round"/>' +
            '<circle cx="36" cy="64" r="7" fill="#fff" stroke="#f472b6" stroke-width="3"/>' +
            '<circle cx="84" cy="62" r="5" fill="#fff" stroke="#f472b6" stroke-width="3"/>' +
        '</symbol>' +

        '<symbol id="br-art-rainbow-waterfall" viewBox="0 0 120 120">' +
            '<path d="M34 16h40l-5 22H39z" fill="#fecaca" stroke="#06b6d4" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M30 46h48l-6 24H36z" fill="#fde68a" stroke="#06b6d4" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M26 78h56l-7 26H33z" fill="#a5f3fc" stroke="#06b6d4" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M60 38v8M60 70v8" stroke="#0891b2" stroke-width="5" stroke-linecap="round"/>' +
        '</symbol>';

    window.BathtubRoulette = RouletteEngine.create({
        pageId: 'bathtub-roulette',
        storageKey: 'bathtubRouletteStats',
        artPrefix: 'br-art-',
        eyebrow: '🛁 Bath time adventure…',
        playLabel: '🛁 Into the tub!',
        confettiColors: ['#38bdf8', '#a855f7', '#f472b6', '#5eead4', '#fde047', '#818cf8'],
        games: GAMES,
        sprite: SPRITE
    });
})();
