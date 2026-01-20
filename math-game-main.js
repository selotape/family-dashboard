// Capy's Math Adventure - Educational Platformer Game
// Educational game where Capy solves math problems to collect fruits

console.log('Loading math-game-main.js...');

const MathGame = {
    state: 'profile-select', // profile-select | world-map | gameplay | puzzle | celebration
    canvas: null,
    ctx: null,
    activeProfile: null,

    init() {
        console.log('MathGame.init called');
        try {
            this.canvas = document.getElementById('math-game-canvas');
            if (!this.canvas) {
                console.error('Canvas not found!');
                return;
            }
            this.ctx = this.canvas.getContext('2d');

            console.log('Initializing StorageManager...');
            StorageManager.init();
            console.log('Initializing ProfileSystem...');
            ProfileSystem.init();
            console.log('Initializing AudioManager...');
            AudioManager.init();
            console.log('Initializing ScratchPad...');
            this.initScratchPad();

            // Show profile selection screen
            console.log('Showing profile selection...');
            this.showProfileSelect();
            console.log('Init complete');
        } catch (error) {
            console.error('Error during init:', error);
        }
    },

    initScratchPad() {
        console.log('initScratchPad called');
        const scratchPad = document.getElementById('scratch-pad');
        const scratchClear = document.getElementById('scratch-clear');
        const scratchToggle = document.getElementById('scratch-toggle');
        const scratchContainer = document.getElementById('scratch-pad-container');

        console.log('Scratch pad elements:', { scratchPad, scratchClear, scratchToggle, scratchContainer });

        if (!scratchPad || !scratchClear || !scratchToggle) {
            console.error('Missing scratch pad elements!');
            return;
        }

        console.log('Setting up scratch pad event listeners...');

        // Clear button
        scratchClear.addEventListener('click', () => {
            scratchPad.value = '';
            scratchPad.focus();
        });

        // Toggle show/hide
        let isHidden = false;
        scratchToggle.addEventListener('click', () => {
            isHidden = !isHidden;
            if (isHidden) {
                scratchContainer.classList.add('hidden-pad');
                scratchToggle.textContent = 'Show';
            } else {
                scratchContainer.classList.remove('hidden-pad');
                scratchToggle.textContent = 'Hide';
            }
        });

        // Auto-show for Noga (3rd grade), hide for Pre-K by default
        setTimeout(() => {
            if (this.activeProfile) {
                if (this.activeProfile.gradeLevel === 0) {
                    // Pre-K: hide by default
                    scratchContainer.classList.add('hidden-pad');
                    scratchToggle.textContent = 'Show';
                    isHidden = true;
                }
            }
        }, 500);
    },

    clearScratchPad() {
        const scratchPad = document.getElementById('scratch-pad');
        if (scratchPad) {
            scratchPad.value = '';
        }
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
        console.log('MathGame.showCelebration called');
        this.state = 'celebration';
        console.log('Calling UIManager.renderCelebration...');
        UIManager.renderCelebration();
        console.log('Celebration screen rendered');
    }
};

console.log('MathGame object defined successfully');

// Note: MathGame.init() is called by Router.initializePage() in router.js
// when the math-game tab is clicked. No DOMContentLoaded initialization needed.
