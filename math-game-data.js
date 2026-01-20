// ============================================================================
// LEVEL DATA - 7 Worlds + Practice Level
// ============================================================================

// Practice Level - No pressure, just platforming!
const PRACTICE_LEVEL = {
    id: 'practice',
    name: 'Practice Playground',
    theme: 'practice',
    mathTopic: 'none',
    playerMode: 'walking',
    gravity: 0.7,
    jumpStrength: -14,
    levelWidth: 2400,

    platforms: [
        // Starting area - easy jumps
        { x: 0, y: 360, width: 200, height: 20, type: 'rock' },
        { x: 250, y: 360, width: 150, height: 20, type: 'rock' },
        { x: 450, y: 360, width: 150, height: 20, type: 'rock' },

        // Low jumps - practice timing
        { x: 650, y: 330, width: 120, height: 20, type: 'rock' },
        { x: 820, y: 300, width: 120, height: 20, type: 'rock' },
        { x: 990, y: 330, width: 120, height: 20, type: 'rock' },

        // Medium height platforms
        { x: 200, y: 260, width: 140, height: 20, type: 'rock' },
        { x: 400, y: 240, width: 130, height: 20, type: 'rock' },
        { x: 600, y: 260, width: 140, height: 20, type: 'rock' },

        // Higher platforms - more challenging
        { x: 100, y: 180, width: 120, height: 20, type: 'rock' },
        { x: 300, y: 160, width: 120, height: 20, type: 'rock' },
        { x: 500, y: 180, width: 120, height: 20, type: 'rock' },

        // Tall stack - practice precision
        { x: 800, y: 240, width: 100, height: 20, type: 'rock' },
        { x: 820, y: 200, width: 80, height: 20, type: 'rock' },
        { x: 840, y: 160, width: 60, height: 20, type: 'rock' },
        { x: 860, y: 120, width: 40, height: 20, type: 'rock' },

        // Long jump section
        { x: 1200, y: 300, width: 100, height: 20, type: 'rock' },
        { x: 1450, y: 300, width: 100, height: 20, type: 'rock' },
        { x: 1700, y: 300, width: 100, height: 20, type: 'rock' },

        // Stairs up
        { x: 1900, y: 330, width: 100, height: 20, type: 'rock' },
        { x: 2000, y: 290, width: 100, height: 20, type: 'rock' },
        { x: 2100, y: 250, width: 100, height: 20, type: 'rock' },
        { x: 2200, y: 210, width: 100, height: 20, type: 'rock' },

        // Victory platform
        { x: 2100, y: 360, width: 300, height: 20, type: 'rock' }
    ],

    fruits: [], // No fruits in practice mode!

    decorations: [
        { x: 150, y: 280, emoji: '🎯', size: 30 },
        { x: 450, y: 200, emoji: '🎨', size: 30 },
        { x: 750, y: 250, emoji: '⚡', size: 30 },
        { x: 1000, y: 260, emoji: '🌟', size: 30 },
        { x: 1300, y: 260, emoji: '🎪', size: 30 },
        { x: 1600, y: 260, emoji: '🎭', size: 30 },
        { x: 2000, y: 180, emoji: '🏆', size: 35 },
        { x: 2250, y: 310, emoji: '🎉', size: 35 }
    ],

    background: {
        sky: '#B8E6F5',
        ground: '#98D8C8',
        image: 'images/bg-practice.jpg'
    }
};

const LEVELS = [
    {
        id: 1,
        name: 'Safari Adventure',
        theme: 'safari',
        mathTopic: 'addition-subtraction',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 200, height: 20, type: 'rock' },
            { x: 400, y: 360, width: 180, height: 20, type: 'rock' },
            { x: 800, y: 360, width: 160, height: 20, type: 'rock' },
            { x: 1400, y: 360, width: 180, height: 20, type: 'rock' },
            { x: 2200, y: 360, width: 200, height: 20, type: 'rock' },

            // Mid-low level (y=280-290)
            { x: 250, y: 285, width: 140, height: 20, type: 'rock' },
            { x: 630, y: 290, width: 160, height: 20, type: 'rock' },
            { x: 1050, y: 280, width: 150, height: 20, type: 'rock' },
            { x: 1650, y: 285, width: 170, height: 20, type: 'rock' },
            { x: 2450, y: 290, width: 160, height: 20, type: 'rock' },

            // Mid-high level (y=205-215)
            { x: 100, y: 210, width: 130, height: 20, type: 'rock' },
            { x: 500, y: 205, width: 140, height: 20, type: 'rock' },
            { x: 900, y: 215, width: 150, height: 20, type: 'rock' },
            { x: 1300, y: 210, width: 160, height: 20, type: 'rock' },
            { x: 1900, y: 205, width: 140, height: 20, type: 'rock' },
            { x: 2650, y: 210, width: 150, height: 20, type: 'rock' },

            // High level (y=130-140)
            { x: 350, y: 135, width: 120, height: 20, type: 'rock' },
            { x: 750, y: 140, width: 130, height: 20, type: 'rock' },
            { x: 1550, y: 135, width: 140, height: 20, type: 'rock' },
            { x: 2100, y: 130, width: 120, height: 20, type: 'rock' },

            // Final platform
            { x: 2900, y: 360, width: 300, height: 20, type: 'rock' }
        ],

        fruits: [
            { x: 100, y: 320, emoji: '🍎', problemId: 0 },          // Ground level
            { x: 320, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 420, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 490, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 700, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 820, y: 100, emoji: '🍓', problemId: 5 },          // High
            { x: 970, y: 175, emoji: '🍒', problemId: 6 },          // Mid-high
            { x: 1130, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1380, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1970, y: 165, emoji: '🍍', problemId: 9 },         // Mid-high
            { x: 2280, y: 320, emoji: '🥭', problemId: 10 },        // Ground
            { x: 3000, y: 320, emoji: '🍉', problemId: 11 }         // Final platform
        ],

        decorations: [
            { x: 200, y: 270, emoji: '🦁', size: 40 },
            { x: 600, y: 200, emoji: '🦒', size: 45 },
            { x: 900, y: 220, emoji: '🐘', size: 45 },
            { x: 1300, y: 240, emoji: '🦓', size: 40 },
            { x: 1800, y: 230, emoji: '🌴', size: 35 },
            { x: 2400, y: 220, emoji: '🦁', size: 40 },
            { x: 2900, y: 260, emoji: '🌴', size: 35 }
        ],

        background: {
            sky: '#87CEEB',
            ground: '#DEB887',
            image: 'images/bg-level-1-safari.jpg'
        }
    },
    {
        id: 2,
        name: 'Ocean Adventure',
        theme: 'ocean',
        mathTopic: 'multiplication-division',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 220, height: 20, type: 'dock' },
            { x: 450, y: 360, width: 180, height: 20, type: 'dock' },
            { x: 900, y: 360, width: 170, height: 20, type: 'dock' },
            { x: 1350, y: 360, width: 190, height: 20, type: 'dock' },
            { x: 2100, y: 360, width: 200, height: 20, type: 'dock' },

            // Mid-low level (y=280-290)
            { x: 280, y: 285, width: 150, height: 20, type: 'dock' },
            { x: 680, y: 290, width: 160, height: 20, type: 'dock' },
            { x: 1120, y: 280, width: 170, height: 20, type: 'dock' },
            { x: 1600, y: 285, width: 160, height: 20, type: 'dock' },
            { x: 2380, y: 290, width: 180, height: 20, type: 'dock' },

            // Mid-high level (y=205-215)
            { x: 150, y: 210, width: 120, height: 20, type: 'dock' },
            { x: 550, y: 205, width: 130, height: 20, type: 'dock' },
            { x: 1000, y: 215, width: 140, height: 20, type: 'dock' },
            { x: 1480, y: 210, width: 150, height: 20, type: 'dock' },
            { x: 1900, y: 205, width: 130, height: 20, type: 'dock' },
            { x: 2600, y: 210, width: 140, height: 20, type: 'dock' },

            // High level (y=130-140)
            { x: 400, y: 135, width: 110, height: 20, type: 'dock' },
            { x: 800, y: 140, width: 120, height: 20, type: 'dock' },
            { x: 1750, y: 135, width: 130, height: 20, type: 'dock' },
            { x: 2240, y: 130, width: 120, height: 20, type: 'dock' },

            // Final platform
            { x: 2850, y: 360, width: 350, height: 20, type: 'dock' }
        ],

        fruits: [
            { x: 110, y: 320, emoji: '🍎', problemId: 0 },          // Ground
            { x: 350, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 470, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 540, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 600, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 750, y: 245, emoji: '🍓', problemId: 5 },          // Mid-low
            { x: 870, y: 100, emoji: '🍒', problemId: 6 },          // High
            { x: 1200, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1560, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1820, y: 95, emoji: '🍍', problemId: 9 },          // High
            { x: 2190, y: 320, emoji: '🥭', problemId: 10 },        // Ground
            { x: 3000, y: 320, emoji: '🍉', problemId: 11 }         // Final
        ],

        decorations: [
            { x: 180, y: 260, emoji: '🌊', size: 40 },
            { x: 450, y: 200, emoji: '⛵', size: 35 },
            { x: 850, y: 240, emoji: '🐬', size: 40 },
            { x: 1300, y: 220, emoji: '🌊', size: 40 },
            { x: 1700, y: 200, emoji: '⛴️', size: 45 },
            { x: 2100, y: 190, emoji: '🐋', size: 50 },
            { x: 2600, y: 200, emoji: '🌊', size: 40 }
        ],

        background: {
            sky: '#4A9FD8',
            ground: '#1E5A8E',
            image: 'images/bg-level-2-ocean.jpg'
        }
    },
    {
        id: 3,
        name: 'Underwater World',
        theme: 'underwater',
        mathTopic: 'fractions',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 240, height: 20, type: 'coral' },
            { x: 480, y: 360, width: 170, height: 20, type: 'coral' },
            { x: 920, y: 360, width: 180, height: 20, type: 'coral' },
            { x: 1450, y: 360, width: 190, height: 20, type: 'coral' },
            { x: 2250, y: 360, width: 180, height: 20, type: 'coral' },

            // Mid-low level (y=280-290)
            { x: 290, y: 285, width: 160, height: 20, type: 'coral' },
            { x: 700, y: 290, width: 150, height: 20, type: 'coral' },
            { x: 1150, y: 280, width: 180, height: 20, type: 'coral' },
            { x: 1690, y: 285, width: 170, height: 20, type: 'coral' },
            { x: 2480, y: 290, width: 160, height: 20, type: 'coral' },

            // Mid-high level (y=205-215)
            { x: 120, y: 210, width: 140, height: 20, type: 'coral' },
            { x: 570, y: 205, width: 120, height: 20, type: 'coral' },
            { x: 1020, y: 215, width: 150, height: 20, type: 'coral' },
            { x: 1380, y: 210, width: 140, height: 20, type: 'coral' },
            { x: 1950, y: 205, width: 160, height: 20, type: 'coral' },
            { x: 2700, y: 210, width: 140, height: 20, type: 'coral' },

            // High level (y=130-140)
            { x: 380, y: 135, width: 120, height: 20, type: 'coral' },
            { x: 830, y: 140, width: 110, height: 20, type: 'coral' },
            { x: 1580, y: 135, width: 130, height: 20, type: 'coral' },
            { x: 2120, y: 130, width: 120, height: 20, type: 'coral' },

            // Final platform
            { x: 2920, y: 360, width: 280, height: 20, type: 'coral' }
        ],

        fruits: [
            { x: 120, y: 320, emoji: '🍎', problemId: 0 },          // Ground
            { x: 360, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 450, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 560, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 630, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 770, y: 245, emoji: '🍓', problemId: 5 },          // Mid-low
            { x: 890, y: 100, emoji: '🍒', problemId: 6 },          // High
            { x: 1230, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1450, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1650, y: 95, emoji: '🍍', problemId: 9 },          // High
            { x: 2020, y: 165, emoji: '🥭', problemId: 10 },        // Mid-high
            { x: 3050, y: 320, emoji: '🍉', problemId: 11 }         // Final
        ],

        decorations: [
            { x: 200, y: 250, emoji: '🐠', size: 35 },
            { x: 500, y: 190, emoji: '🐟', size: 30 },
            { x: 900, y: 210, emoji: '🐡', size: 35 },
            { x: 1350, y: 200, emoji: '🦈', size: 45 },
            { x: 1800, y: 180, emoji: '🐙', size: 40 },
            { x: 2200, y: 170, emoji: '🦑', size: 40 },
            { x: 2650, y: 200, emoji: '🪼', size: 35 }
        ],

        background: {
            sky: '#1A4D6D',
            ground: '#0A2540',
            image: 'images/bg-level-3-underwater.jpg'
        }
    },
    {
        id: 4,
        name: 'Atlanta Adventure',
        theme: 'atlanta',
        mathTopic: 'geometry',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 230, height: 20, type: 'building' },
            { x: 430, y: 360, width: 190, height: 20, type: 'building' },
            { x: 850, y: 360, width: 170, height: 20, type: 'building' },
            { x: 1380, y: 360, width: 180, height: 20, type: 'building' },
            { x: 2180, y: 360, width: 190, height: 20, type: 'building' },

            // Mid-low level (y=280-290)
            { x: 270, y: 285, width: 140, height: 20, type: 'building' },
            { x: 670, y: 290, width: 160, height: 20, type: 'building' },
            { x: 1070, y: 280, width: 170, height: 20, type: 'building' },
            { x: 1610, y: 285, width: 160, height: 20, type: 'building' },
            { x: 2420, y: 290, width: 170, height: 20, type: 'building' },

            // Mid-high level (y=205-215)
            { x: 140, y: 210, width: 130, height: 20, type: 'building' },
            { x: 530, y: 205, width: 140, height: 20, type: 'building' },
            { x: 960, y: 215, width: 150, height: 20, type: 'building' },
            { x: 1280, y: 210, width: 140, height: 20, type: 'building' },
            { x: 1880, y: 205, width: 150, height: 20, type: 'building' },
            { x: 2640, y: 210, width: 140, height: 20, type: 'building' },

            // High level (y=130-140)
            { x: 360, y: 135, width: 120, height: 20, type: 'building' },
            { x: 760, y: 140, width: 130, height: 20, type: 'building' },
            { x: 1500, y: 135, width: 120, height: 20, type: 'building' },
            { x: 2070, y: 130, width: 130, height: 20, type: 'building' },

            // Final platform
            { x: 2870, y: 360, width: 330, height: 20, type: 'building' }
        ],

        fruits: [
            { x: 115, y: 320, emoji: '🍎', problemId: 0 },          // Ground
            { x: 340, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 430, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 510, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 590, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 740, y: 245, emoji: '🍓', problemId: 5 },          // Mid-low
            { x: 830, y: 100, emoji: '🍒', problemId: 6 },          // High
            { x: 1150, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1350, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1570, y: 95, emoji: '🍍', problemId: 9 },          // High
            { x: 1950, y: 165, emoji: '🥭', problemId: 10 },        // Mid-high
            { x: 3000, y: 320, emoji: '🍉', problemId: 11 }         // Final
        ],

        decorations: [
            { x: 200, y: 240, emoji: '🏙️', size: 45 },
            { x: 600, y: 200, emoji: '🎡', size: 40 },
            { x: 1000, y: 180, emoji: '🍑', size: 35 },
            { x: 1450, y: 250, emoji: '🏢', size: 40 },
            { x: 1900, y: 240, emoji: '🚡', size: 35 },
            { x: 2350, y: 200, emoji: '🏛️', size: 45 },
            { x: 2700, y: 240, emoji: '🌆', size: 40 }
        ],

        background: {
            sky: '#87A2C4',
            ground: '#5A6D7E',
            image: 'images/bg-level-4-atlanta.jpg'
        }
    },
    {
        id: 5,
        name: 'Israel Journey',
        theme: 'israel',
        mathTopic: 'measurement',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 240, height: 20, type: 'stone' },
            { x: 460, y: 360, width: 180, height: 20, type: 'stone' },
            { x: 880, y: 360, width: 190, height: 20, type: 'stone' },
            { x: 1420, y: 360, width: 170, height: 20, type: 'stone' },
            { x: 2170, y: 360, width: 200, height: 20, type: 'stone' },

            // Mid-low level (y=280-290)
            { x: 300, y: 285, width: 150, height: 20, type: 'stone' },
            { x: 690, y: 290, width: 160, height: 20, type: 'stone' },
            { x: 1120, y: 280, width: 170, height: 20, type: 'stone' },
            { x: 1640, y: 285, width: 180, height: 20, type: 'stone' },
            { x: 2420, y: 290, width: 160, height: 20, type: 'stone' },

            // Mid-high level (y=205-215)
            { x: 130, y: 210, width: 130, height: 20, type: 'stone' },
            { x: 550, y: 205, width: 140, height: 20, type: 'stone' },
            { x: 1000, y: 215, width: 140, height: 20, type: 'stone' },
            { x: 1330, y: 210, width: 150, height: 20, type: 'stone' },
            { x: 1930, y: 205, width: 140, height: 20, type: 'stone' },
            { x: 2670, y: 210, width: 150, height: 20, type: 'stone' },

            // High level (y=130-140)
            { x: 370, y: 135, width: 120, height: 20, type: 'stone' },
            { x: 780, y: 140, width: 110, height: 20, type: 'stone' },
            { x: 1540, y: 135, width: 130, height: 20, type: 'stone' },
            { x: 2080, y: 130, width: 120, height: 20, type: 'stone' },

            // Final platform
            { x: 2900, y: 360, width: 300, height: 20, type: 'stone' }
        ],

        fruits: [
            { x: 120, y: 320, emoji: '🍎', problemId: 0 },          // Ground
            { x: 370, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 440, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 550, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 610, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 760, y: 245, emoji: '🍓', problemId: 5 },          // Mid-low
            { x: 850, y: 100, emoji: '🍒', problemId: 6 },          // High
            { x: 1200, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1400, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1610, y: 95, emoji: '🍍', problemId: 9 },          // High
            { x: 2000, y: 165, emoji: '🥭', problemId: 10 },        // Mid-high
            { x: 3030, y: 320, emoji: '🍉', problemId: 11 }         // Final
        ],

        decorations: [
            { x: 190, y: 240, emoji: '🕌', size: 45 },
            { x: 550, y: 200, emoji: '🏖️', size: 35 },
            { x: 950, y: 180, emoji: '🐪', size: 40 },
            { x: 1400, y: 250, emoji: '🕍', size: 45 },
            { x: 1850, y: 240, emoji: '🥙', size: 30 },
            { x: 2300, y: 200, emoji: '🏛️', size: 40 },
            { x: 2680, y: 240, emoji: '🌊', size: 35 }
        ],

        background: {
            sky: '#F4D06F',
            ground: '#D4A74F',
            image: 'images/bg-level-5-israel.jpg'
        }
    },
    {
        id: 6,
        name: 'Sky High',
        theme: 'sky',
        mathTopic: 'review-mix',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 210, height: 20, type: 'cloud' },
            { x: 420, y: 360, width: 180, height: 20, type: 'cloud' },
            { x: 830, y: 360, width: 170, height: 20, type: 'cloud' },
            { x: 1360, y: 360, width: 190, height: 20, type: 'cloud' },
            { x: 2200, y: 360, width: 180, height: 20, type: 'cloud' },

            // Mid-low level (y=280-290)
            { x: 260, y: 285, width: 140, height: 20, type: 'cloud' },
            { x: 650, y: 290, width: 160, height: 20, type: 'cloud' },
            { x: 1050, y: 280, width: 170, height: 20, type: 'cloud' },
            { x: 1600, y: 285, width: 180, height: 20, type: 'cloud' },
            { x: 2430, y: 290, width: 170, height: 20, type: 'cloud' },

            // Mid-high level (y=205-215)
            { x: 110, y: 210, width: 130, height: 20, type: 'cloud' },
            { x: 520, y: 205, width: 140, height: 20, type: 'cloud' },
            { x: 940, y: 215, width: 150, height: 20, type: 'cloud' },
            { x: 1270, y: 210, width: 140, height: 20, type: 'cloud' },
            { x: 1890, y: 205, width: 160, height: 20, type: 'cloud' },
            { x: 2660, y: 210, width: 150, height: 20, type: 'cloud' },

            // High level (y=130-140)
            { x: 340, y: 135, width: 120, height: 20, type: 'cloud' },
            { x: 740, y: 140, width: 130, height: 20, type: 'cloud' },
            { x: 1510, y: 135, width: 120, height: 20, type: 'cloud' },
            { x: 2100, y: 130, width: 130, height: 20, type: 'cloud' },

            // Final platform
            { x: 2880, y: 360, width: 320, height: 20, type: 'cloud' }
        ],

        fruits: [
            { x: 105, y: 320, emoji: '🍎', problemId: 0 },          // Ground
            { x: 330, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 410, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 510, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 580, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 720, y: 245, emoji: '🍓', problemId: 5 },          // Mid-low
            { x: 810, y: 100, emoji: '🍒', problemId: 6 },          // High
            { x: 1130, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1340, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1580, y: 95, emoji: '🍍', problemId: 9 },          // High
            { x: 1960, y: 165, emoji: '🥭', problemId: 10 },        // Mid-high
            { x: 3010, y: 320, emoji: '🍉', problemId: 11 }         // Final
        ],

        decorations: [
            { x: 200, y: 230, emoji: '☁️', size: 50 },
            { x: 500, y: 180, emoji: '🦅', size: 40 },
            { x: 900, y: 170, emoji: '✈️', size: 35 },
            { x: 1350, y: 240, emoji: '🌈', size: 45 },
            { x: 1800, y: 220, emoji: '☁️', size: 50 },
            { x: 2200, y: 180, emoji: '🦜', size: 35 },
            { x: 2650, y: 190, emoji: '⭐', size: 40 }
        ],

        background: {
            sky: '#87CEEB',
            ground: '#B0E2FF',
            image: 'images/bg-level-6-sky.jpg'
        }
    },
    {
        id: 7,
        name: 'Noga Reunion',
        theme: 'noga',
        mathTopic: 'ultimate-challenge',
        playerMode: 'walking',
        gravity: 0.7,
        jumpStrength: -14,
        levelWidth: 3200,

        platforms: [
            // Ground level (y=360)
            { x: 0, y: 360, width: 250, height: 20, type: 'rainbow' },
            { x: 470, y: 360, width: 180, height: 20, type: 'rainbow' },
            { x: 890, y: 360, width: 190, height: 20, type: 'rainbow' },
            { x: 1430, y: 360, width: 180, height: 20, type: 'rainbow' },
            { x: 2190, y: 360, width: 200, height: 20, type: 'rainbow' },

            // Mid-low level (y=280-290)
            { x: 310, y: 285, width: 150, height: 20, type: 'rainbow' },
            { x: 700, y: 290, width: 160, height: 20, type: 'rainbow' },
            { x: 1130, y: 280, width: 180, height: 20, type: 'rainbow' },
            { x: 1660, y: 285, width: 170, height: 20, type: 'rainbow' },
            { x: 2440, y: 290, width: 170, height: 20, type: 'rainbow' },

            // Mid-high level (y=205-215)
            { x: 140, y: 210, width: 140, height: 20, type: 'rainbow' },
            { x: 560, y: 205, width: 140, height: 20, type: 'rainbow' },
            { x: 1010, y: 215, width: 150, height: 20, type: 'rainbow' },
            { x: 1340, y: 210, width: 150, height: 20, type: 'rainbow' },
            { x: 1940, y: 205, width: 150, height: 20, type: 'rainbow' },
            { x: 2680, y: 210, width: 160, height: 20, type: 'rainbow' },

            // High level (y=130-140)
            { x: 380, y: 135, width: 130, height: 20, type: 'rainbow' },
            { x: 790, y: 140, width: 120, height: 20, type: 'rainbow' },
            { x: 1570, y: 135, width: 130, height: 20, type: 'rainbow' },
            { x: 2100, y: 130, width: 120, height: 20, type: 'rainbow' },

            // Final platform
            { x: 2910, y: 360, width: 290, height: 20, type: 'rainbow' }
        ],

        fruits: [
            { x: 125, y: 320, emoji: '🍎', problemId: 0 },          // Ground
            { x: 380, y: 245, emoji: '🍊', problemId: 1 },          // Mid-low
            { x: 450, y: 95, emoji: '🍋', problemId: 2 },           // High
            { x: 560, y: 320, emoji: '🍌', problemId: 3 },          // Ground
            { x: 620, y: 165, emoji: '🍇', problemId: 4 },          // Mid-high
            { x: 770, y: 245, emoji: '🍓', problemId: 5 },          // Mid-low
            { x: 860, y: 100, emoji: '🍒', problemId: 6 },          // High
            { x: 1210, y: 240, emoji: '🍑', problemId: 7 },         // Mid-low
            { x: 1420, y: 170, emoji: '🥝', problemId: 8 },         // Mid-high
            { x: 1640, y: 95, emoji: '🍍', problemId: 9 },          // High
            { x: 2010, y: 165, emoji: '🥭', problemId: 10 },        // Mid-high
            { x: 3040, y: 320, emoji: '🍉', problemId: 11 }         // Final
        ],

        decorations: [
            { x: 200, y: 240, emoji: '🎨', size: 40 },
            { x: 560, y: 200, emoji: '🌟', size: 35 },
            { x: 960, y: 180, emoji: '🎪', size: 45 },
            { x: 1410, y: 250, emoji: '🎭', size: 40 },
            { x: 1860, y: 240, emoji: '🎨', size: 40 },
            { x: 2310, y: 200, emoji: '🎉', size: 45 },
            { x: 2900, y: 200, type: 'image', image: 'images/noga_photo.jpg', width: 120, height: 120 }
        ],

        background: {
            sky: '#FFB6D9',
            ground: '#FFC8DD',
            image: 'images/bg-level-7-celebration.jpg'
        }
    }
];

// ============================================================================
// PROBLEM DATA - Math problems for all 3 grade levels
// ============================================================================

const PROBLEMS = {
    // Level 1: Safari
    safari: {
        // 3rd Grade (Noga) - Addition/Subtraction within 1000
        grade3: [
            {
                question: '🦁 A lion has 124 cubs. 87 more cubs are born. How many cubs now?',
                choices: ['201', '211', '221', '231'],
                correctIndex: 1
            },
            {
                question: '🐘 An elephant walks 456 meters. Then walks 278 more meters. Total distance?',
                choices: ['734', '724', '744', '714'],
                correctIndex: 0
            },
            {
                question: '🦓 A zebra herd has 315 members. 142 leave for water. How many remain?',
                choices: ['173', '183', '163', '193'],
                correctIndex: 0
            },
            {
                question: '🦒 A giraffe is 523 cm tall. A baby giraffe is 189 cm shorter. Baby\'s height?',
                choices: ['334', '344', '324', '354'],
                correctIndex: 0
            },
            {
                question: '🌴 Safari has 682 trees. They plant 159 more. How many trees total?',
                choices: ['831', '841', '851', '821'],
                correctIndex: 1
            },
            {
                question: '🚙 A safari truck drives 547 km one day and 286 km the next. Total distance?',
                choices: ['833', '823', '843', '813'],
                correctIndex: 0
            },
            {
                question: '🦁 There are 725 animals. 368 are sleeping. How many are awake?',
                choices: ['357', '367', '347', '377'],
                correctIndex: 0
            },
            {
                question: '💧 A waterhole has 891 liters. Animals drink 457 liters. How much remains?',
                choices: ['434', '444', '424', '454'],
                correctIndex: 0
            },
            {
                question: '🦜 Park rangers count 638 birds in the morning and 275 in the evening. Total?',
                choices: ['903', '913', '923', '893'],
                correctIndex: 1
            },
            {
                question: '🐆 A cheetah runs 952 meters. Then runs 387 meters back. Net distance?',
                choices: ['565', '575', '555', '585'],
                correctIndex: 0
            },
            {
                question: '🎁 Safari gift shop has 476 souvenirs. Sells 198. How many left?',
                choices: ['278', '288', '268', '298'],
                correctIndex: 0
            },
            {
                question: '🏕️ Two safari camps have 423 and 389 visitors. Total visitors?',
                choices: ['812', '822', '802', '832'],
                correctIndex: 0
            }
        ],

        // 1st Grade (Dana) - Addition/Subtraction within 20
        grade1: [
            { question: '🦁 A lion has 7 cubs. 5 more are born. How many cubs?', choices: ['11', '12', '13', '14'], correctIndex: 1 },
            { question: '🐘 You see 8 elephants. 4 walk away. How many left?', choices: ['4', '5', '3', '6'], correctIndex: 0 },
            { question: '🦒 There are 6 giraffes and 7 zebras. How many animals?', choices: ['12', '13', '14', '15'], correctIndex: 1 },
            { question: '🦜 A tree has 15 birds. 8 fly away. How many remain?', choices: ['7', '8', '6', '9'], correctIndex: 0 },
            { question: '🐒 9 monkeys play. 6 more join. How many monkeys total?', choices: ['14', '15', '16', '17'], correctIndex: 1 },
            { question: '🦁 You count 12 lions. 5 are sleeping. How many are awake?', choices: ['7', '8', '6', '9'], correctIndex: 0 },
            { question: '🚙 Safari has 10 trucks. Gets 8 more. How many trucks?', choices: ['17', '18', '19', '20'], correctIndex: 1 },
            { question: '💧 14 animals drink water. 6 leave. How many still drinking?', choices: ['8', '9', '7', '10'], correctIndex: 0 },
            { question: '🐆 You see 5 cheetahs and 9 gazelles. How many animals?', choices: ['13', '14', '15', '16'], correctIndex: 1 },
            { question: '🦜 18 birds sit in a tree. 9 fly away. How many left?', choices: ['9', '10', '8', '11'], correctIndex: 0 },
            { question: '🦛 7 hippos in water. 6 more jump in. How many hippos?', choices: ['12', '13', '14', '15'], correctIndex: 1 },
            { question: '🪑 Park has 16 benches. 7 break. How many good benches?', choices: ['9', '10', '8', '11'], correctIndex: 0 }
        ],

        // Pre-K (Ella) - Simple counting 1-10
        gradePreK: [
            { question: 'Count the lions! 🦁🦁🦁', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many elephants? 🐘🐘🐘🐘🐘', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'Count the trees! 🌴🌴', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'How many zebras? 🦓🦓🦓🦓🦓🦓🦓', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'Count the birds! 🦜', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'How many giraffes? 🦒🦒🦒🦒', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the monkeys! 🐒🐒🐒🐒🐒🐒', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many hippos? 🦛🦛🦛🦛🦛🦛🦛🦛', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the rocks! 🪨🪨🪨🪨🪨', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many palm trees? 🌴🌴🌴', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'Count the cheetahs! 🐆🐆🐆🐆🐆🐆🐆🐆🐆', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'How many butterflies? 🦋🦋🦋🦋🦋🦋🦋🦋🦋🦋', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    },

    // Level 2: Ocean
    ocean: {
        grade3: [
            { question: '8 boats × 7 sailors each. How many sailors total?', choices: ['54', '56', '58', '60'], correctIndex: 1 },
            { question: '72 fish ÷ 9 aquariums. How many fish per aquarium?', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: '6 × 9 = ?', choices: ['52', '54', '56', '58'], correctIndex: 1 },
            { question: '81 ÷ 9 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2 },
            { question: 'A ship carries 7 crates. Each has 8 boxes. Total boxes?', choices: ['54', '56', '58', '60'], correctIndex: 1 },
            { question: '63 dolphins in 7 equal groups. How many per group?', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: '9 × 8 = ?', choices: ['70', '72', '74', '76'], correctIndex: 1 },
            { question: '48 ÷ 6 = ?', choices: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: '5 whales, each eats 9 fish. How many fish total?', choices: ['43', '45', '47', '49'], correctIndex: 1 },
            { question: '56 ÷ 8 = ?', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: '7 × 6 = ?', choices: ['40', '42', '44', '46'], correctIndex: 1 },
            { question: '36 ÷ 4 = ?', choices: ['8', '9', '10', '11'], correctIndex: 1 }
        ],
        grade1: [
            { question: 'Count by 2s: 2, 4, 6, 8, __?', choices: ['9', '10', '11', '12'], correctIndex: 1 },
            { question: 'Count by 5s: 5, 10, 15, __?', choices: ['18', '20', '22', '25'], correctIndex: 1 },
            { question: '3 boats with 2 sails each. How many sails?', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'Count by 10s: 10, 20, 30, __?', choices: ['35', '40', '45', '50'], correctIndex: 1 },
            { question: '2 + 2 + 2 = ?', choices: ['4', '5', '6', '7'], correctIndex: 2 },
            { question: 'Count by 2s: 2, 4, 6, 8, 10, __?', choices: ['11', '12', '13', '14'], correctIndex: 1 },
            { question: '5 + 5 = ?', choices: ['8', '9', '10', '11'], correctIndex: 2 },
            { question: 'Count by 5s: 5, 10, __?', choices: ['12', '15', '18', '20'], correctIndex: 1 },
            { question: '4 fish + 4 fish = ?', choices: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: 'Count by 10s: 10, 20, __?', choices: ['25', '30', '35', '40'], correctIndex: 1 },
            { question: '3 + 3 + 3 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2 },
            { question: 'Count by 2s: 2, 4, __?', choices: ['5', '6', '7', '8'], correctIndex: 1 }
        ],
        gradePreK: [
            { question: 'Count the boats! ⛵⛵⛵⛵', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'How many fish? 🐟🐟🐟🐟🐟🐟', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'Count the waves! 🌊🌊', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'How many dolphins? 🐬🐬🐬🐬🐬🐬🐬🐬', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the whales! 🐋🐋🐋', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many starfish? ⭐⭐⭐⭐⭐', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'Count the crabs! 🦀🦀🦀🦀🦀🦀🦀', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'How many shells? 🐚🐚🐚🐚🐚🐚🐚🐚🐚', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'Count the anchors! ⚓', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'How many ships? 🚢🚢🚢🚢', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the octopus! 🐙🐙🐙🐙🐙🐙', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many seahorses? 🐴🐴🐴🐴🐴🐴🐴🐴🐴🐴', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    },

    // Level 3: Underwater
    underwater: {
        grade3: [
            { question: 'What is 1/2 of 16?', choices: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: 'What is 1/4 of 20?', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'Which is bigger: 1/2 or 1/4?', choices: ['1/4', '1/2', 'Same', 'Neither'], correctIndex: 1 },
            { question: '1/3 of 12 = ?', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'What is 2/3 of 9?', choices: ['4', '5', '6', '7'], correctIndex: 2 },
            { question: '1/2 of 24 = ?', choices: ['10', '11', '12', '13'], correctIndex: 2 },
            { question: 'Which is smaller: 1/3 or 1/2?', choices: ['1/2', '1/3', 'Same', 'Neither'], correctIndex: 1 },
            { question: '1/4 of 28 = ?', choices: ['5', '6', '7', '8'], correctIndex: 2 },
            { question: 'What is 3/4 of 8?', choices: ['4', '5', '6', '7'], correctIndex: 2 },
            { question: '1/2 of 18 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2 },
            { question: '1/3 of 15 = ?', choices: ['3', '4', '5', '6'], correctIndex: 2 },
            { question: 'Which is bigger: 1/3 or 1/4?', choices: ['1/4', '1/3', 'Same', 'Neither'], correctIndex: 1 }
        ],
        grade1: [
            { question: 'What shape is this? ⭕', choices: ['Square', 'Circle', 'Triangle', 'Star'], correctIndex: 1 },
            { question: 'What shape is this? ⬛', choices: ['Circle', 'Square', 'Triangle', 'Star'], correctIndex: 1 },
            { question: 'What shape is this? 🔺', choices: ['Circle', 'Square', 'Triangle', 'Star'], correctIndex: 2 },
            { question: 'How many sides does a triangle have?', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many corners does a square have?', choices: ['2', '3', '4', '5'], correctIndex: 2 },
            { question: 'What comes next? ⭕⬛⭕⬛⭕__?', choices: ['⭕', '⬛', '🔺', '⭐'], correctIndex: 1 },
            { question: 'What shape has no corners?', choices: ['Square', 'Circle', 'Triangle', 'Rectangle'], correctIndex: 1 },
            { question: 'What comes next? 🔺🔺⭕🔺🔺__?', choices: ['🔺', '⭕', '⬛', '⭐'], correctIndex: 1 },
            { question: 'How many sides does a square have?', choices: ['2', '3', '4', '5'], correctIndex: 2 },
            { question: 'What comes next? ⬛⬛⭕⬛⬛__?', choices: ['⬛', '⭕', '🔺', '⭐'], correctIndex: 1 },
            { question: 'Which shape rolls? ⭕ or ⬛?', choices: ['⬛', '⭕', 'Both', 'Neither'], correctIndex: 1 },
            { question: 'What comes next? ⭕⭕⬛⭕⭕__?', choices: ['⭕', '⬛', '🔺', '⭐'], correctIndex: 1 }
        ],
        gradePreK: [
            { question: 'Count the fish! 🐠🐠🐠🐠🐠', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many jellyfish? 🪼🪼🪼🪼', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the sharks! 🦈🦈🦈🦈🦈🦈🦈', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'How many coral? 🪸🪸', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'Count the seahorses! 🐴🐴🐴🐴🐴🐴', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many turtles? 🐢🐢🐢🐢🐢🐢🐢🐢', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the squid! 🦑🦑🦑', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many clownfish? 🐠🐠🐠🐠🐠🐠🐠🐠🐠', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'Count the crabs! 🦀🦀🦀🦀', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'How many octopus? 🐙', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'Count the starfish! ⭐⭐⭐⭐⭐⭐', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many fish? 🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    },

    // Level 4: Atlanta
    atlanta: {
        grade3: [
            { question: 'A square has sides of 5 cm. What is its perimeter?', choices: ['15 cm', '20 cm', '25 cm', '30 cm'], correctIndex: 1 },
            { question: 'A rectangle is 6 cm × 4 cm. What is its area?', choices: ['20 cm²', '24 cm²', '28 cm²', '32 cm²'], correctIndex: 1 },
            { question: 'How many sides does a hexagon have?', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'A triangle has sides 3, 4, 5. What is its perimeter?', choices: ['10', '11', '12', '13'], correctIndex: 2 },
            { question: 'A square has an area of 16 cm². What is one side?', choices: ['3 cm', '4 cm', '5 cm', '6 cm'], correctIndex: 1 },
            { question: 'How many corners does a pentagon have?', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'A rectangle has perimeter 20. Length is 6. Width is?', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'A square has perimeter 24 cm. What is one side?', choices: ['4 cm', '5 cm', '6 cm', '7 cm'], correctIndex: 2 },
            { question: 'Rectangle area: 5 cm × 7 cm = ?', choices: ['30 cm²', '32 cm²', '35 cm²', '40 cm²'], correctIndex: 2 },
            { question: 'How many sides does an octagon have?', choices: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: 'A square garden is 7m on each side. Perimeter?', choices: ['21 m', '24 m', '28 m', '32 m'], correctIndex: 2 },
            { question: 'Rectangle 8 × 3. What is the area?', choices: ['20', '22', '24', '26'], correctIndex: 2 }
        ],
        grade1: [
            { question: '14 is greater than or less than 11?', choices: ['Less', 'Greater', 'Equal', 'Same'], correctIndex: 1 },
            { question: 'Which is bigger: 17 or 15?', choices: ['15', '17', 'Same', 'Equal'], correctIndex: 1 },
            { question: '23 has 2 tens and __ ones', choices: ['1', '2', '3', '4'], correctIndex: 2 },
            { question: 'Which is smaller: 19 or 16?', choices: ['19', '16', 'Same', 'Equal'], correctIndex: 1 },
            { question: '35 has __ tens and 5 ones', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: '12 < __ (which is bigger than 12?)', choices: ['10', '11', '12', '14'], correctIndex: 3 },
            { question: 'Which number is between 15 and 17?', choices: ['14', '15', '16', '18'], correctIndex: 2 },
            { question: '47 has 4 tens and __ ones', choices: ['5', '6', '7', '8'], correctIndex: 2 },
            { question: 'Which is bigger: 20 or 18?', choices: ['18', '20', 'Same', 'Equal'], correctIndex: 1 },
            { question: '__ > 13 (which is bigger than 13?)', choices: ['11', '12', '13', '15'], correctIndex: 3 },
            { question: '56 has __ tens and 6 ones', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'Which is smaller: 14 or 17?', choices: ['17', '14', 'Same', 'Equal'], correctIndex: 1 }
        ],
        gradePreK: [
            { question: 'Count the buildings! 🏢🏢🏢🏢🏢', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many peaches? 🍑🍑🍑🍑', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the Ferris wheels! 🎡🎡🎡🎡🎡🎡🎡', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'How many cars? 🚗🚗', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'Count the street lights! 💡💡💡💡💡💡', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many trees? 🌳🌳🌳🌳🌳🌳🌳🌳', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the buses! 🚌🚌🚌', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many traffic lights? 🚦🚦🚦🚦🚦🚦🚦🚦🚦', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'Count the parks! 🏞️🏞️🏞️🏞️', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'How many skyscrapers? 🏙️', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'Count the bridges! 🌉🌉🌉🌉🌉🌉', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many fountains? ⛲⛲⛲⛲⛲⛲⛲⛲⛲⛲', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    },

    // Level 5: Israel
    israel: {
        grade3: [
            { question: 'It is 3:30 PM. What time was it 2 hours ago?', choices: ['1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM'], correctIndex: 1 },
            { question: 'A pencil is 15 cm. A pen is 12 cm. How much longer?', choices: ['2 cm', '3 cm', '4 cm', '5 cm'], correctIndex: 1 },
            { question: 'A book weighs 500 grams. 3 books weigh?', choices: ['1000 g', '1200 g', '1500 g', '1800 g'], correctIndex: 2 },
            { question: 'It takes 45 minutes to walk. Started at 2:15. Finish?', choices: ['2:45', '3:00', '3:15', '3:30'], correctIndex: 1 },
            { question: 'A rope is 8 meters. Cut into 4 equal parts. Each part?', choices: ['1 m', '2 m', '3 m', '4 m'], correctIndex: 1 },
            { question: 'Water bottle holds 750 mL. 2 bottles hold?', choices: ['1250 mL', '1500 mL', '1750 mL', '2000 mL'], correctIndex: 1 },
            { question: 'School starts 8:00 AM. Ends 3:00 PM. How many hours?', choices: ['5', '6', '7', '8'], correctIndex: 2 },
            { question: 'A desk is 120 cm long. A table is 95 cm. Difference?', choices: ['20 cm', '25 cm', '30 cm', '35 cm'], correctIndex: 1 },
            { question: 'An apple weighs 150 g. 4 apples weigh?', choices: ['500 g', '550 g', '600 g', '650 g'], correctIndex: 2 },
            { question: 'Movie starts 6:30 PM, lasts 90 min. When does it end?', choices: ['7:30 PM', '7:45 PM', '8:00 PM', '8:15 PM'], correctIndex: 2 },
            { question: 'A ribbon is 60 cm. Cut into 5 equal pieces. Each?', choices: ['10 cm', '12 cm', '14 cm', '16 cm'], correctIndex: 1 },
            { question: 'Bag weighs 2 kg. How many grams?', choices: ['200 g', '500 g', '1000 g', '2000 g'], correctIndex: 3 }
        ],
        grade1: [
            { question: 'Which is longer: a pencil or a bus?', choices: ['Pencil', 'Bus', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'Which is shorter: a book or a building?', choices: ['Building', 'Book', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'What time is it? 🕐 (clock shows 1)', choices: ['12:00', '1:00', '2:00', '3:00'], correctIndex: 1 },
            { question: 'Which is heavier: a car or a feather?', choices: ['Feather', 'Car', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'What time is it? 🕒 (clock shows 2)', choices: ['1:00', '2:00', '3:00', '4:00'], correctIndex: 1 },
            { question: 'Which is taller: a tree or a flower?', choices: ['Flower', 'Tree', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'Which holds more: a cup or a bucket?', choices: ['Cup', 'Bucket', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'What time is it? 🕐🕐🕐 (3 o\'clock)', choices: ['1:00', '2:00', '3:00', '4:00'], correctIndex: 2 },
            { question: 'Which is lighter: a balloon or a rock?', choices: ['Rock', 'Balloon', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'Which is wider: a door or a pencil?', choices: ['Pencil', 'Door', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'Which holds less: a spoon or a bowl?', choices: ['Bowl', 'Spoon', 'Same', 'Neither'], correctIndex: 1 },
            { question: 'Which is longer: a day or an hour?', choices: ['Hour', 'Day', 'Same', 'Neither'], correctIndex: 1 }
        ],
        gradePreK: [
            { question: 'Count the camels! 🐪🐪🐪🐪🐪', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many mosques? 🕌🕌🕌🕌', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the beaches! 🏖️🏖️🏖️🏖️🏖️🏖️🏖️', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'How many hummus bowls? 🥙🥙', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'Count the palm trees! 🌴🌴🌴🌴🌴🌴', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many boats? ⛵⛵⛵⛵⛵⛵⛵⛵', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the stars! ⭐⭐⭐', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many temples? 🕍🕍🕍🕍🕍🕍🕍🕍🕍', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'Count the waves! 🌊🌊🌊🌊', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'How many donkeys? 🫏', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'Count the olives! 🫒🫒🫒🫒🫒🫒', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many dates? 🌴🌴🌴🌴🌴🌴🌴🌴🌴🌴', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    },

    // Level 6: Sky (Review - Mix of all topics)
    sky: {
        grade3: [
            { question: '456 + 287 = ?', choices: ['733', '743', '753', '763'], correctIndex: 1 },
            { question: '7 × 8 = ?', choices: ['54', '56', '58', '60'], correctIndex: 1 },
            { question: 'What is 1/2 of 18?', choices: ['7', '8', '9', '10'], correctIndex: 2 },
            { question: 'Square perimeter: 6 cm sides. Total?', choices: ['18 cm', '20 cm', '22 cm', '24 cm'], correctIndex: 3 },
            { question: '3:45 + 30 minutes = ?', choices: ['4:00', '4:15', '4:30', '4:45'], correctIndex: 1 },
            { question: '825 - 368 = ?', choices: ['447', '457', '467', '477'], correctIndex: 1 },
            { question: '72 ÷ 8 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2 },
            { question: '2/3 of 12 = ?', choices: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: 'Rectangle 5 × 9. Area?', choices: ['40', '42', '45', '48'], correctIndex: 2 },
            { question: '4 books weigh 200g each. Total?', choices: ['600 g', '700 g', '800 g', '900 g'], correctIndex: 2 },
            { question: '9 × 6 = ?', choices: ['52', '54', '56', '58'], correctIndex: 1 },
            { question: '547 + 186 = ?', choices: ['723', '733', '743', '753'], correctIndex: 1 }
        ],
        grade1: [
            { question: '7 + 8 = ?', choices: ['13', '14', '15', '16'], correctIndex: 2 },
            { question: 'Count by 5s: 5, 10, 15, __?', choices: ['18', '20', '22', '25'], correctIndex: 1 },
            { question: 'What shape? ⭕', choices: ['Square', 'Circle', 'Triangle', 'Star'], correctIndex: 1 },
            { question: '16 > 14? True or false?', choices: ['False', 'True', 'Same', 'Maybe'], correctIndex: 1 },
            { question: 'Which is longer: a car or a bike?', choices: ['Bike', 'Car', 'Same', 'Neither'], correctIndex: 1 },
            { question: '12 - 5 = ?', choices: ['5', '6', '7', '8'], correctIndex: 2 },
            { question: 'Count by 2s: 2, 4, 6, __?', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'How many sides? ⬛', choices: ['2', '3', '4', '5'], correctIndex: 2 },
            { question: '25 has __ tens and 5 ones', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'What time? 🕐🕐 (2:00)', choices: ['1:00', '2:00', '3:00', '4:00'], correctIndex: 1 },
            { question: '9 + 6 = ?', choices: ['13', '14', '15', '16'], correctIndex: 2 },
            { question: '18 - 9 = ?', choices: ['7', '8', '9', '10'], correctIndex: 2 }
        ],
        gradePreK: [
            { question: 'Count the clouds! ☁️☁️☁️☁️☁️', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many birds? 🦅🦅🦅🦅', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the airplanes! ✈️✈️✈️✈️✈️✈️✈️', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'How many stars? ⭐⭐', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'Count the rainbows! 🌈🌈🌈🌈🌈🌈', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many hot air balloons? 🎈🎈🎈🎈🎈🎈🎈🎈', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the helicopters! 🚁🚁🚁', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many kites? 🪁🪁🪁🪁🪁🪁🪁🪁🪁', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'Count the parachutes! 🪂🪂🪂🪂', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'How many rockets? 🚀', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'Count the UFOs! 🛸🛸🛸🛸🛸🛸', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many shooting stars? ✨✨✨✨✨✨✨✨✨✨', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    },

    // Level 7: Noga Reunion (Ultimate Challenge - Mix of hardest)
    noga: {
        grade3: [
            { question: '847 + 596 = ?', choices: ['1433', '1443', '1453', '1463'], correctIndex: 1 },
            { question: '12 × 9 = ?', choices: ['106', '107', '108', '109'], correctIndex: 2 },
            { question: 'What is 3/4 of 16?', choices: ['10', '11', '12', '13'], correctIndex: 2 },
            { question: 'Square area 49 cm². One side = ?', choices: ['6 cm', '7 cm', '8 cm', '9 cm'], correctIndex: 1 },
            { question: '5:45 PM + 2 hours 30 min = ?', choices: ['7:45 PM', '8:00 PM', '8:15 PM', '8:30 PM'], correctIndex: 2 },
            { question: '1000 - 647 = ?', choices: ['343', '353', '363', '373'], correctIndex: 1 },
            { question: '144 ÷ 12 = ?', choices: ['10', '11', '12', '13'], correctIndex: 2 },
            { question: '5/6 of 18 = ?', choices: ['13', '14', '15', '16'], correctIndex: 2 },
            { question: 'Rectangle 12 cm × 8 cm. Perimeter?', choices: ['36 cm', '38 cm', '40 cm', '42 cm'], correctIndex: 2 },
            { question: '6 boxes, 125g each. Total weight?', choices: ['700 g', '725 g', '750 g', '775 g'], correctIndex: 2 },
            { question: '11 × 11 = ?', choices: ['119', '120', '121', '122'], correctIndex: 2 },
            { question: '756 + 488 = ?', choices: ['1234', '1244', '1254', '1264'], correctIndex: 1 }
        ],
        grade1: [
            { question: '14 + 6 = ?', choices: ['18', '19', '20', '21'], correctIndex: 2 },
            { question: 'Count by 10s: 10, 20, 30, 40, __?', choices: ['45', '50', '55', '60'], correctIndex: 1 },
            { question: 'How many corners? 🔺', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'Which is bigger: 19 or 16?', choices: ['16', '19', 'Same', 'Equal'], correctIndex: 1 },
            { question: 'Which is heavier: elephant or mouse?', choices: ['Mouse', 'Elephant', 'Same', 'Neither'], correctIndex: 1 },
            { question: '17 - 9 = ?', choices: ['6', '7', '8', '9'], correctIndex: 2 },
            { question: 'Count by 5s: 15, 20, 25, __?', choices: ['28', '30', '32', '35'], correctIndex: 1 },
            { question: 'What comes next? ⭕⬛⭕⬛__?', choices: ['⬛', '⭕', '🔺', '⭐'], correctIndex: 1 },
            { question: '43 has __ tens and 3 ones', choices: ['2', '3', '4', '5'], correctIndex: 2 },
            { question: 'What time? 🕐🕐🕐🕐🕐 (5:00)', choices: ['3:00', '4:00', '5:00', '6:00'], correctIndex: 2 },
            { question: '11 + 9 = ?', choices: ['18', '19', '20', '21'], correctIndex: 2 },
            { question: '20 - 8 = ?', choices: ['10', '11', '12', '13'], correctIndex: 2 }
        ],
        gradePreK: [
            { question: 'Count the party hats! 🎉🎉🎉🎉🎉', choices: ['4', '5', '6', '7'], correctIndex: 1 },
            { question: 'How many presents? 🎁🎁🎁🎁', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'Count the balloons! 🎈🎈🎈🎈🎈🎈🎈', choices: ['6', '7', '8', '9'], correctIndex: 1 },
            { question: 'How many cakes? 🎂🎂', choices: ['1', '2', '3', '4'], correctIndex: 1 },
            { question: 'Count the candles! 🕯️🕯️🕯️🕯️🕯️🕯️', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many confetti? 🎊🎊🎊🎊🎊🎊🎊🎊', choices: ['7', '8', '9', '10'], correctIndex: 1 },
            { question: 'Count the streamers! 🎀🎀🎀', choices: ['2', '3', '4', '5'], correctIndex: 1 },
            { question: 'How many fireworks? 🎆🎆🎆🎆🎆🎆🎆🎆🎆', choices: ['8', '9', '10', '11'], correctIndex: 1 },
            { question: 'Count the party poppers! 🎉🎉🎉🎉', choices: ['3', '4', '5', '6'], correctIndex: 1 },
            { question: 'How many stars? ⭐', choices: ['1', '2', '3', '4'], correctIndex: 0 },
            { question: 'Count the ribbons! 🎀🎀🎀🎀🎀🎀', choices: ['5', '6', '7', '8'], correctIndex: 1 },
            { question: 'How many friends? 👧👧👧👧👧👧👧👧👧👧', choices: ['9', '10', '11', '12'], correctIndex: 1 }
        ]
    }
};

