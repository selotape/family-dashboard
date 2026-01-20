// Capy's Math Adventure - Educational Platformer Game
// Educational game where Capy solves math problems to collect fruits

const MathGame = {
    state: 'profile-select', // profile-select | world-map | gameplay | puzzle | celebration
    canvas: null,
    ctx: null,
    activeProfile: null,

    init() {
        this.canvas = document.getElementById('math-game-canvas');
        this.ctx = this.canvas.getContext('2d');

        StorageManager.init();
        ProfileSystem.init();
        AudioManager.init();

        // Show profile selection screen
        this.showProfileSelect();
    },

    showProfileSelect() {
        this.state = 'profile-select';
        UIManager.renderProfileSelect();
    },

    showWorldMap() {
        this.state = 'world-map';
        UIManager.renderWorldMap();
    },

    startLevel(levelId) {
        this.state = 'gameplay';

        // Clear UI and show canvas
        const ui = document.getElementById('math-game-ui');
        ui.innerHTML = '';
        this.canvas.style.display = 'block';

        LevelManager.loadLevel(levelId);
        GameEngine.start();
    },

    showPuzzle(fruit) {
        this.state = 'puzzle';
        PuzzleSystem.show(fruit);
    },

    showCelebration() {
        this.state = 'celebration';
        UIManager.renderCelebration();
    }
};


// ============================================================================
// INITIALIZE GAME WHEN PAGE LOADS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if the math-game tab is active
    const mathGamePage = document.getElementById('math-game');
    if (mathGamePage) {
        const mathGameTab = document.querySelector('[data-page="math-game"]');

        // Check if math-game tab is already active on page load
        if (mathGameTab && mathGameTab.classList.contains('active')) {
            setTimeout(() => MathGame.init(), 100);
        }

        // Also initialize on click for future visits
        if (mathGameTab) {
            mathGameTab.addEventListener('click', () => {
                setTimeout(() => {
                    if (!MathGame.canvas) {
                        MathGame.init();
                    }
                }, 100);
            });
        }
    }
});
