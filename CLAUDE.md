# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Dashboard is a vanilla JavaScript web application with no build step. It serves as a household dashboard with multiple features including grandma visit countdowns, routine timers, games, and calculators. The project uses a modular architecture with lazy-loaded page templates.

## Development Server

**Start the development server:**
```bash
python server.py
# Opens browser automatically at http://localhost:8080
# Watches for changes in .html, .css, and .js files
```

**Quick start (Windows):**
```bash
start-server.bat
```

**No build step required** - refresh browser to see changes.

## Architecture

### Module System

The application uses a **script tag + IIFE pattern** (not ES6 modules) for browser compatibility without transpilation. All modules expose themselves on `window` object.

**Critical loading order in index.html:**
1. **External dependencies** - marked.js (for markdown parsing)
2. **Core infrastructure** - `js/core/router.js` (MUST load first)
3. **Feature modules** - `js/modules/*.js` (order independent)
4. **App entry point** - `app.js` (coordinates initialization)
5. **Math game modules** - `math-game-*.js` (dependency order matters)

### Module Structure

```
js/
├── core/
│   └── router.js           # Tab navigation & lazy page loading
└── modules/
    ├── countdown.js        # Grandma visit countdown timer
    ├── todos.js            # Markdown todo loader (uses marked.js)
    ├── capybara-game.js    # Canvas-based platformer game
    ├── warmup-calculator.js # Starting Strength warm-up calculator
    └── routine-timer.js    # Morning/evening routine timer with audio

pages/                      # HTML templates loaded dynamically by router
├── grandma.html
├── routines.html
├── todos.html
├── game.html
├── warmup.html
└── math-game.html
```

### Initialization Flow

**app.js orchestrates a 3-phase initialization:**

1. **Phase 1**: Router.init() - Must run first, sets up tab navigation
2. **Phase 2**: Background timers (CountdownTimer, RoutineTimer) - Run continuously
3. **Phase 3**: Lazy-loaded modules - Router calls their init() when page loads

**Example:** When user clicks warmup tab → Router loads `pages/warmup.html` → Router calls `WarmUp.init()`

### Page Visibility Pattern

Modules that run background timers (RoutineTimer) must check if their page is active before triggering UI effects or audio:

```javascript
const routinesPage = document.getElementById('routines');
const isPageActive = routinesPage && routinesPage.classList.contains('active');

// Only play audio/show effects when page is visible
if (isPageActive) {
    this.playChime(routineType, isUrgent);
}
```

This prevents audio/animations from playing when user is on different tabs.

### Math Game Architecture

The Math Game is a separate subsystem with its own module structure:
- `math-game-data.js` - Question database (~300 questions across 20 levels)
- `math-game-storage.js` - localStorage persistence
- `math-game-audio.js` - Web Audio API sound effects
- `math-game-profiles.js` - Multi-user profile management
- `math-game-levels.js` - Level progression logic
- `math-game-engine.js` - Game loop and state management
- `math-game-puzzle.js` - Platformer puzzle generation
- `math-game-ui.js` - Canvas rendering and animations
- `math-game-main.js` - Initialization and coordination

**Load order matters** - these files have dependencies and must load in the sequence shown in index.html.

## Common Patterns

### Adding a New Module

1. Create `js/modules/feature-name.js` with IIFE pattern:
```javascript
(function() {
    'use strict';

    window.FeatureName = {
        init: function() {
            // Initialize when page loads
        }
    };
})();
```

2. Add script tag to index.html (in feature modules section)
3. Add lazy-load call in `js/core/router.js` initializePage() switch statement
4. Create page template in `pages/feature-name.html`
5. Add tab button in index.html nav section

### Storage Patterns

**localStorage keys used:**
- `lastTab` - Last visited tab for restoration on refresh
- `capybaraHighScore` - Capybara game high score
- `gymConfig` - Warm-up calculator plate configuration
- `lastTargetWeight` - Warm-up calculator last input
- `deadliftMode` - Warm-up calculator mode preference
- `mathGameProfiles` - Math game user profiles and progress

### Audio Patterns

All audio uses Web Audio API (not `<audio>` tags). Initialize audio context on first user interaction:

```javascript
const enableAudio = () => {
    if (!this.audioEnabled) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.audioEnabled = true;
    }
};
document.addEventListener('click', enableAudio, { once: true });
```

## Testing

**Manual testing checklist:**
1. Start server and verify all 6 tabs load
2. Test tab navigation and localStorage persistence (refresh browser)
3. Test each feature's core functionality
4. Verify audio only plays when respective tab is active
5. Test on mobile viewport (responsive design)

**Math game testing:**
- Run `WarmUp.runTests()` in console to validate warm-up calculator
- Test math game level progression and profile switching
- Verify localStorage persistence across refreshes

## Git Commit Style

Based on recent commits, use descriptive commit messages with:
- Clear subject line describing the change
- Bullet points for multi-part changes
- "Fix", "Add", "Refactor" prefixes
- Co-Authored-By for AI assistance

## File Watching & Auto-Reload

The server.py watches `.html`, `.css`, and `.js` files. When changes are detected, you'll see a notification in the console. **Manually refresh the browser** to see updates (no hot module replacement).

## Important Constraints

- **No build tools** - Must work directly in browser
- **No npm/package.json** - All dependencies via CDN (only marked.js currently)
- **Windows compatibility** - Server uses UTF-8 encoding fixes for emoji support
- **Backward compatibility** - Changes should not break existing localStorage data
- **ES5 syntax** - Uses function() not arrow functions for older browser support in some modules
