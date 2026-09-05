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
    ├── routine-timer.js    # Morning/evening routine timer with audio
    ├── lister.js           # Pre-trip packing/prep checklists (templated)
    ├── roulette-engine.js  # Shared slot-machine (spin, odds, audio, upvotes)
    ├── game-roulette.js    # Family game night games + art (uses the engine)
    ├── bathtub-roulette.js # Bath-time games + art (uses the engine)
    ├── bedtime-roulette.js # Bedtime wind-down activities + art (uses the engine)
    ├── disney-watch-data.js # Disney Watch Odyssey — 100-film catalogue + watched seed (data only)
    ├── disney-watch.js     # Disney Watch Odyssey — persistent watch list UI (server-backed)
    └── grandma-chefs.js    # Grandma's Little Chefs — recipe book; recipes are a hardcoded array, one collapsible card each

pages/                      # HTML templates loaded dynamically by router
├── grandma.html
├── routines.html
├── todos.html
├── game.html
├── warmup.html
├── math-game.html
├── lister.html
├── game-roulette.html
├── bathtub-roulette.html
├── bedtime-roulette.html
├── disney-watch.html
└── grandma-chefs.html
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
- `tabsCollapsed` - Whether the top tabs banner is collapsed (`'1'`/`'0'`)
- `routineChores` - Routines daily chores (`{date, checked}`; each entry is per-girl `{noga,dana,ella}`, done when all three; auto-resets each new day)
- `routineGroupsCollapsed` - Which routine columns (Morning/Afternoon) are collapsed (`{group: bool}`)
- `routineExtraTasks` - One-time, per-group tasks added ad hoc under a routine column (e.g. "bedsheets from dryer"); array of `{id, group, text}`. Unlike `routineChores`, these do **not** auto-reset daily - a task lives until checked off, then is removed for good
- `capybaraHighScore` - Capybara game high score
- `gymConfig` - Warm-up calculator plate configuration
- `lastTargetWeight` - Warm-up calculator last input
- `deadliftMode` - Warm-up calculator mode preference
- `mathGameProfiles` - Math game user profiles and progress
- `gameRouletteStats` / `bathtubRouletteStats` / `bedtimeRouletteStats` - Roulette history, one key per tab (`{totalPulls, jackpots, lastJackpotId, played:{gameId:count}}`). `lastJackpotId` is excluded from the next jackpot draw so game night varies. Jackpot odds are rigged per pull (`JACKPOT_ODDS`) to average ~2 pulls and guarantee a win by the 4th. `votes` holds the kids' 👍 upvotes, which mildly weight the jackpot draw (up to 2.5x, capped at `MAX_VOTE_BOOST`). Game artwork is one inline SVG `<symbol>` sprite per tab that every reel cell `<use>`s, so 180 on-screen illustrations cost 10 definitions (no external images).

All three roulette tabs share `roulette-engine.js`: it owns all machine behaviour and
scopes its DOM lookups to the page root (`cfg.pageId`) via **classes**, not ids, so
the pages can use identical markup. A tab is just data + config:
`RouletteEngine.create({pageId, storageKey, artPrefix, eyebrow, playLabel, games, sprite})`.
Adding another roulette = one data module + one page + a tab + a router case;
`roulette-engine.js` must load **before** the tabs that build on it

Lister does **not** use localStorage — its state (active list + saved reusable
lists) is persisted server-side in `lister_data.json` (gitignored, like
`server.log`) via the `/api/lister/*` endpoints in `server.py`, so it's shared
across every device on the LAN instead of being per-browser. Assignee is one
of `parent`/`noga`/`dana`/`ella`. Built-in templates (e.g. "Base Pool") are
defined in code (`LISTER_TEMPLATES` in `server.py`); user-saved reusable lists
live in the data file. `/api/lister/generate` uses the same Anthropic client
as the Reading Game to turn a free-text prompt (optionally referencing a
named list) into a new item list.

**Disney Watch Odyssey** (`disney-watch` tab) follows the same server-backed
pattern. The 98-film *catalogue* (title, year, studio, `wiki` article title,
scare `tier` of `cozy`/`peril`/`preview`, parent note, `pop` popularity score)
lives client-side in `disney-watch-data.js`. Only per-film *state* is persisted,
in `disney_data.json` (gitignored) via `GET`/`POST /api/disney/state` — the
client sends the whole films array (like Lister's `/active`) holding
`{votes:{noga,dana,ella}, watched:{noga,dana,ella}, watchedDate:"YYYY-MM",
poster, custom films}`. `DISNEY_WATCHED_SEED` in `server.py` mirrors
`WATCHED_SEED` in the data module and seeds the file on first run.

**Watchlist order = most 👍 girl-votes first, then `pop` (box office, weighted
toward recent films), then title.** The three girls vote by tapping their animal
(🦫 Noga / 🦊 Dana / 🐼 Ella) on a card; a 1-vote film outranks every 0-vote
film. There is no manual reordering. A film moves to the "Watched" section when
it has a `watchedDate` ("All watched!" ticks all three girls + stamps the
month); attendance stays editable on the Watched card afterward. **Poster art is
fetched live from Wikipedia** at runtime
(`en.wikipedia.org/api/rest_v1/page/summary/<wiki>`, CORS-open; falls back to
the REST title-search), then the resolved `upload.wikimedia.org` URL is cached
back into `disney_data.json`. Offline or on a lookup miss, a coloured title-card
is shown instead — no bundled images.

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
