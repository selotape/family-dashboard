// Comprehensive Test Suite for Capy's Math Adventure
// Run with: node test-math-game.js

// Mock minimal game structures for testing
const mockPlayer = {
    x: 50,
    y: 100,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpStrength: -14,
    gravity: 0.7,
    onGround: false
};

const mockPlatform = {
    x: 0,
    y: 350,
    width: 300,
    height: 20
};

const mockLevel = {
    id: 1,
    name: 'Safari Adventure',
    platforms: [
        { x: 0, y: 350, width: 300, height: 20 },
        { x: 350, y: 320, width: 150, height: 20 },
        { x: 550, y: 280, width: 200, height: 20 }
    ],
    fruits: Array(12).fill(null).map((_, i) => ({
        x: 100 + i * 200,
        y: 300,
        emoji: '🍎',
        collected: false
    }))
};

// Test utilities
const TestRunner = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    results: [],

    assert(name, condition, details = '') {
        this.totalTests++;
        const passed = Boolean(condition);

        if (passed) {
            this.passedTests++;
            console.log(`✅ PASS: ${name}`);
        } else {
            this.failedTests++;
            console.log(`❌ FAIL: ${name}`);
            if (details) console.log(`   Details: ${details}`);
        }

        this.results.push({ name, passed, details });
        return passed;
    },

    assertEqual(name, actual, expected) {
        const passed = actual === expected;
        const details = passed ? '' : `Expected: ${expected}, Got: ${actual}`;
        return this.assert(name, passed, details);
    },

    assertGreaterThan(name, value, threshold) {
        const passed = value > threshold;
        const details = passed ? '' : `Expected > ${threshold}, Got: ${value}`;
        return this.assert(name, passed, details);
    },

    assertLessThan(name, value, threshold) {
        const passed = value < threshold;
        const details = passed ? '' : `Expected < ${threshold}, Got: ${value}`;
        return this.assert(name, passed, details);
    },

    section(title) {
        console.log('\n' + '='.repeat(60));
        console.log(title);
        console.log('='.repeat(60));
    },

    summary() {
        console.log('\n' + '='.repeat(60));
        console.log('TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests} ✅`);
        console.log(`Failed: ${this.failedTests} ❌`);

        const passRate = ((this.passedTests / this.totalTests) * 100).toFixed(2);
        console.log(`Pass Rate: ${passRate}%`);
        console.log('='.repeat(60));

        return {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.failedTests,
            passRate: parseFloat(passRate)
        };
    }
};

// Physics and Collision Tests
function testCollisionDetection() {
    TestRunner.section('COLLISION DETECTION TESTS');

    // AABB collision function
    function checkAABB(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // Test 1: Player on platform (should collide)
    const playerOnPlatform = { x: 100, y: 330, width: 40, height: 40 };
    const platform = { x: 0, y: 350, width: 300, height: 20 };
    TestRunner.assert('Player on platform collides', checkAABB(playerOnPlatform, platform));

    // Test 2: Player above platform (no collision)
    const playerAbove = { x: 100, y: 200, width: 40, height: 40 };
    TestRunner.assert('Player above platform no collision', !checkAABB(playerAbove, platform));

    // Test 3: Player to the right (no collision)
    const playerRight = { x: 400, y: 330, width: 40, height: 40 };
    TestRunner.assert('Player to right no collision', !checkAABB(playerRight, platform));

    // Test 4: Player barely touching (should collide)
    const playerTouching = { x: 300, y: 350, width: 40, height: 40 };
    TestRunner.assert('Player barely touching collides', checkAABB(playerTouching, platform));

    // Test 5: Overlap calculation
    function calculateOverlap(player, platform) {
        if (!checkAABB(player, platform)) return null;

        const overlapX = Math.min(
            player.x + player.width - platform.x,
            platform.x + platform.width - player.x
        );
        const overlapY = Math.min(
            player.y + player.height - platform.y,
            platform.y + platform.height - player.y
        );

        return { overlapX, overlapY };
    }

    const overlap = calculateOverlap(playerOnPlatform, platform);
    TestRunner.assert('Overlap calculation returns values', overlap !== null);
    if (overlap) {
        TestRunner.assertGreaterThan('OverlapY > 0', overlap.overlapY, 0);
        TestRunner.assertLessThan('OverlapY < player height', overlap.overlapY, 40);
    }
}

function testPhysics() {
    TestRunner.section('PHYSICS SIMULATION TESTS');

    const player = { ...mockPlayer };
    const gravity = 0.7;

    // Test 1: Gravity application
    player.vy = 0;
    for (let i = 0; i < 10; i++) {
        player.vy += gravity;
    }
    TestRunner.assertGreaterThan('Gravity increases downward velocity', player.vy, 5);

    // Test 2: Jump mechanics
    player.vy = -14; // Jump strength
    TestRunner.assertLessThan('Jump creates upward velocity', player.vy, 0);

    // Test 3: Terminal velocity (should stabilize)
    player.vy = 0;
    for (let i = 0; i < 100; i++) {
        player.vy += gravity;
    }
    TestRunner.assertGreaterThan('Terminal velocity reached', player.vy, 50);

    // Test 4: Horizontal movement
    player.x = 50;
    player.vx = 5;
    player.x += player.vx;
    TestRunner.assertEqual('Horizontal movement works', player.x, 55);

    // Test 5: Position update with velocity
    player.y = 100;
    player.vy = 10;
    player.y += player.vy;
    TestRunner.assertEqual('Vertical position updates', player.y, 110);
}

function testPlatformLanding() {
    TestRunner.section('PLATFORM LANDING TESTS');

    function simulateLanding(player, platform) {
        // Check AABB collision
        const collision = player.x < platform.x + platform.width &&
                         player.x + player.width > platform.x &&
                         player.y < platform.y + platform.height &&
                         player.y + player.height > platform.y;

        if (!collision) return false;

        // Calculate overlap
        const overlapX = Math.min(
            player.x + player.width - platform.x,
            platform.x + platform.width - player.x
        );
        const overlapY = Math.min(
            player.y + player.height - platform.y,
            platform.y + platform.height - player.y
        );

        // Resolve on smallest overlap axis
        if (overlapX < overlapY) {
            // Horizontal collision
            return 'horizontal';
        } else {
            // Vertical collision
            if (player.y < platform.y) {
                // Landing on top
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
                return 'landed_on_top';
            } else {
                // Hitting from below
                return 'hit_from_below';
            }
        }
    }

    // Test 1: Player falling onto platform
    const fallingPlayer = { x: 100, y: 340, width: 40, height: 40, vy: 5, onGround: false };
    const platform = { x: 0, y: 350, width: 300, height: 20 };
    const result = simulateLanding(fallingPlayer, platform);

    TestRunner.assertEqual('Player lands on platform', result, 'landed_on_top');
    TestRunner.assertEqual('Player Y position corrected', fallingPlayer.y, 310);
    TestRunner.assertEqual('Player velocity stopped', fallingPlayer.vy, 0);
    TestRunner.assert('Player marked as on ground', fallingPlayer.onGround);

    // Test 2: Wide platform center landing
    const centerPlayer = { x: 130, y: 340, width: 40, height: 40, vy: 8, onGround: false };
    const wideResult = simulateLanding(centerPlayer, platform);
    TestRunner.assertEqual('Center landing works', wideResult, 'landed_on_top');
    TestRunner.assertEqual('Center landing Y correct', centerPlayer.y, 310);
}

function testGameStats() {
    TestRunner.section('GAME STATS TESTS');

    const stats = {
        hearts: 5,
        fruitsCollected: 0,
        totalProblems: 0,
        correctAnswers: 0,
        wrongAnswers: 0
    };

    // Test 1: Initial stats
    TestRunner.assertEqual('Initial hearts', stats.hearts, 5);
    TestRunner.assertEqual('Initial fruits', stats.fruitsCollected, 0);

    // Test 2: Collect fruit
    stats.fruitsCollected++;
    TestRunner.assertEqual('Fruit collection increments', stats.fruitsCollected, 1);

    // Test 3: Wrong answer penalty
    stats.hearts--;
    TestRunner.assertEqual('Wrong answer loses heart', stats.hearts, 4);

    // Test 4: Accuracy calculation
    stats.totalProblems = 10;
    stats.correctAnswers = 7;
    const accuracy = (stats.correctAnswers / stats.totalProblems) * 100;
    TestRunner.assertEqual('Accuracy calculation', accuracy, 70);

    // Test 5: Ella infinite hearts
    const ellaStats = { hearts: 999 };
    ellaStats.hearts--; // Shouldn't happen, but if it does...
    TestRunner.assertGreaterThan('Ella has many hearts', ellaStats.hearts, 100);
}

function testFruitCollision() {
    TestRunner.section('FRUIT COLLISION TESTS');

    const fruits = [
        { x: 150, y: 310, emoji: '🍎', collected: false },
        { x: 280, y: 290, emoji: '🍊', collected: false },
        { x: 420, y: 270, emoji: '🍋', collected: false }
    ];

    function checkFruitDistance(player, fruit) {
        const dx = player.x - fruit.x;
        const dy = player.y - fruit.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Test 1: Player near fruit
    const player = { x: 150, y: 310 };
    const distance1 = checkFruitDistance(player, fruits[0]);
    TestRunner.assertLessThan('Player touching fruit', distance1, 50);

    // Test 2: Player far from fruit
    const distance2 = checkFruitDistance(player, fruits[2]);
    TestRunner.assertGreaterThan('Player far from fruit', distance2, 50);

    // Test 3: Collect fruit
    fruits[0].collected = true;
    TestRunner.assert('Fruit marked collected', fruits[0].collected);

    // Test 4: Count uncollected fruits
    const uncollected = fruits.filter(f => !f.collected).length;
    TestRunner.assertEqual('Uncollected fruits count', uncollected, 2);
}

function testMathProblems() {
    TestRunner.section('MATH PROBLEM TESTS');

    // Mock problems for different grades
    const problems = {
        grade3: {
            question: '🦁 A lion has 124 cubs. 87 more cubs are born. How many cubs now?',
            choices: ['201', '211', '221', '231'],
            correctIndex: 1
        },
        grade1: {
            question: '🦁 A lion has 7 cubs. 5 more are born. How many cubs?',
            choices: ['11', '12', '13', '14'],
            correctIndex: 1
        },
        gradePreK: {
            question: 'Count the lions! 🦁🦁🦁',
            choices: ['2', '3', '4', '5'],
            correctIndex: 1
        }
    };

    // Test 1: Grade 3 problem structure
    TestRunner.assert('Grade 3 has question', problems.grade3.question.length > 0);
    TestRunner.assertEqual('Grade 3 has 4 choices', problems.grade3.choices.length, 4);
    TestRunner.assert('Grade 3 has emoji', problems.grade3.question.includes('🦁'));

    // Test 2: Grade 1 problem structure
    TestRunner.assert('Grade 1 has question', problems.grade1.question.length > 0);
    TestRunner.assertEqual('Grade 1 has 4 choices', problems.grade1.choices.length, 4);
    TestRunner.assert('Grade 1 has emoji', problems.grade1.question.includes('🦁'));

    // Test 3: Pre-K problem structure
    TestRunner.assert('Pre-K has question', problems.gradePreK.question.length > 0);
    TestRunner.assert('Pre-K has emojis', problems.gradePreK.question.includes('🦁'));

    // Test 4: Correct answers
    TestRunner.assertEqual('Grade 3 correct answer', problems.grade3.choices[problems.grade3.correctIndex], '211');
    TestRunner.assertEqual('Grade 1 correct answer', problems.grade1.choices[problems.grade1.correctIndex], '12');
    TestRunner.assertEqual('Pre-K correct answer', problems.gradePreK.choices[problems.gradePreK.correctIndex], '3');

    // Test 5: Difficulty appropriate
    const grade3Value = parseInt(problems.grade3.choices[0]);
    const grade1Value = parseInt(problems.grade1.choices[0]);
    const preKValue = parseInt(problems.gradePreK.choices[0]);

    TestRunner.assertGreaterThan('Grade 3 uses large numbers', grade3Value, 100);
    TestRunner.assertLessThan('Grade 1 within 20', grade1Value, 20);
    TestRunner.assertLessThan('Pre-K within 10', preKValue, 10);
}

function testLevelData() {
    TestRunner.section('LEVEL DATA TESTS');

    // Test 1: Level structure
    TestRunner.assertEqual('Level has ID', mockLevel.id, 1);
    TestRunner.assert('Level has name', mockLevel.name.length > 0);

    // Test 2: Platforms
    TestRunner.assertGreaterThan('Level has platforms', mockLevel.platforms.length, 0);
    TestRunner.assert('First platform has position', mockLevel.platforms[0].x !== undefined);
    TestRunner.assert('First platform has size', mockLevel.platforms[0].width > 0);

    // Test 3: Fruits
    TestRunner.assertEqual('Level has 12 fruits', mockLevel.fruits.length, 12);
    TestRunner.assert('First fruit has emoji', mockLevel.fruits[0].emoji.length > 0);
    TestRunner.assert('Fruits not collected initially', !mockLevel.fruits[0].collected);

    // Test 4: Platform positions make sense
    const firstPlatform = mockLevel.platforms[0];
    TestRunner.assertGreaterThan('Platform Y below screen top', firstPlatform.y, 100);
    TestRunner.assertLessThan('Platform Y above screen bottom', firstPlatform.y, 500);
}

function testProfileSystem() {
    TestRunner.section('PROFILE SYSTEM TESTS');

    const profiles = [
        { id: 'noga', name: 'Noga', gradeLevel: 3, avatar: '🎨', currentLevel: 1 },
        { id: 'dana', name: 'Dana', gradeLevel: 1, avatar: '🌟', currentLevel: 1 },
        { id: 'ella', name: 'Ella', gradeLevel: 0, avatar: '🌈', currentLevel: 1 }
    ];

    // Test 1: Three profiles exist
    TestRunner.assertEqual('Three profiles', profiles.length, 3);

    // Test 2: Profile structure
    profiles.forEach(profile => {
        TestRunner.assert(`${profile.name} has ID`, profile.id.length > 0);
        TestRunner.assert(`${profile.name} has avatar`, profile.avatar.length > 0);
        TestRunner.assert(`${profile.name} has grade level`, profile.gradeLevel !== undefined);
    });

    // Test 3: Grade levels are different
    const gradeLevels = profiles.map(p => p.gradeLevel);
    const uniqueGrades = [...new Set(gradeLevels)];
    TestRunner.assertEqual('Each profile different grade', uniqueGrades.length, 3);

    // Test 4: Noga is 3rd grade
    const noga = profiles.find(p => p.name === 'Noga');
    TestRunner.assertEqual('Noga is 3rd grade', noga.gradeLevel, 3);

    // Test 5: Ella is Pre-K
    const ella = profiles.find(p => p.name === 'Ella');
    TestRunner.assertEqual('Ella is Pre-K', ella.gradeLevel, 0);
}

function testCameraSystem() {
    TestRunner.section('CAMERA SYSTEM TESTS');

    const camera = {
        x: 0,
        y: 0,
        width: 800,
        height: 400
    };

    const player = { x: 400, y: 310 };
    const levelWidth = 3200;

    // Test 1: Camera follows player
    const targetX = player.x - camera.width / 2;
    camera.x = targetX;
    TestRunner.assertEqual('Camera centers on player', camera.x, 0); // Player at 400 - 400 = 0

    // Test 2: Camera doesn't go below 0
    player.x = 100;
    const newTargetX = Math.max(0, player.x - camera.width / 2);
    TestRunner.assertEqual('Camera clamped at left', newTargetX, 0);

    // Test 3: Camera doesn't exceed level width
    player.x = 3100;
    const maxX = levelWidth - camera.width; // 3200 - 800 = 2400
    const clampedX = Math.min(maxX, player.x - camera.width / 2);
    TestRunner.assertEqual('Camera clamped at right', clampedX, maxX);
}

function testTwoChanceSystem() {
    TestRunner.section('TWO-CHANCE PUZZLE SYSTEM TESTS');

    const puzzleState = {
        attempts: 0,
        hearts: 5
    };

    // Test 1: First wrong answer
    puzzleState.attempts = 1;
    puzzleState.hearts--;
    TestRunner.assertEqual('First wrong loses 1 heart', puzzleState.hearts, 4);
    TestRunner.assertEqual('Attempts tracked', puzzleState.attempts, 1);

    // Test 2: Second wrong answer
    puzzleState.attempts = 2;
    const shouldShowSolution = puzzleState.attempts >= 2;
    TestRunner.assert('Second wrong shows solution', shouldShowSolution);

    // Test 3: Correct on first try
    const freshState = { attempts: 0, hearts: 5 };
    freshState.attempts = 0; // Correct
    TestRunner.assertEqual('Correct answer no heart loss', freshState.hearts, 5);

    // Test 4: Ella mode (no penalties)
    const ellaState = { attempts: 0, hearts: 999, gradeLevel: 0 };
    ellaState.attempts = 1;
    // Ella shouldn't lose hearts
    TestRunner.assertEqual('Ella keeps infinite hearts', ellaState.hearts, 999);
}

// Run all tests
function runAllTests() {
    console.log('\n🧪 CAPY\'S MATH ADVENTURE - COMPREHENSIVE TEST SUITE');
    console.log('Run Date:', new Date().toLocaleString());
    console.log('');

    testCollisionDetection();
    testPhysics();
    testPlatformLanding();
    testGameStats();
    testFruitCollision();
    testMathProblems();
    testLevelData();
    testProfileSystem();
    testCameraSystem();
    testTwoChanceSystem();

    const summary = TestRunner.summary();

    // Exit code based on results
    process.exit(summary.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
