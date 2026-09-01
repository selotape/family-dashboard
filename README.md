# Visbord Family Dashboard 🏠

A family dashboard web application for tracking countdowns, routines, and family information.

## Features

- Grandma visit countdowns
- Morning and evening routine timers
- Family information tabs
- Responsive design with a beautiful dark theme

## How to Run

Vanilla JS, no build step. A small Python dev server (`server.py`) serves the
files from disk and watches `.html`/`.css`/`.js` for changes — refresh the
browser to see edits (no hot reload).

### Local development

```bash
python server.py        # http://localhost:8080, opens the browser
```

On Windows you can double-click `start-server.bat` instead.

### Always-on deployment (Linux, systemd)

This machine runs the dashboard as a user-level systemd service that serves the
local working tree live and auto-restarts on crash or on `server.py` changes.

**See [DEPLOY.md](DEPLOY.md) for the full guide** — install, manage, redeploy,
and how to reach the dashboard from a phone/tablet on the same Wi-Fi
(`http://<server-ip>:8080`).

## Project Structure

```
family-dashboard/
├── index.html          # Shell: nav tabs + script load order
├── styles.css          # All styling (dark theme, responsive)
├── app.js              # 3-phase init: router, background timers, lazy modules
├── server.py           # Dev/prod server: static files + /api/* + file watch
├── js/
│   ├── core/router.js  # Tab navigation & lazy page loading
│   └── modules/        # One file per feature (countdown, routines, lister, …)
├── pages/              # HTML templates loaded on demand by the router
├── math-game-*.js      # Math Adventure subsystem (load order matters)
├── DEPLOY.md           # Linux systemd deployment + LAN access
└── CLAUDE.md           # Architecture notes for contributors
```

## Browser Compatibility

This dashboard works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Development

To make changes:
1. **For a feature's behavior**: edit its module in `js/modules/`
2. **For a feature's markup**: edit its template in `pages/`
3. **For styling**: edit `styles.css`
4. **For nav tabs / script load order**: edit `index.html`
5. Refresh the browser to see updates — no build process required

See [CLAUDE.md](CLAUDE.md) for the module system, init flow, and storage keys.

## License

Family project - All rights reserved.
