# Visbord Family Dashboard 🏠

A family dashboard web application for tracking countdowns, routines, and family information.

## Features

- Grandma visit countdowns
- Morning and evening routine timers
- Family information tabs
- Responsive design with a beautiful dark theme

## How to Run

This is a static HTML website that doesn't require any build tools or dependencies. You can run it in several ways:

### Option 1: Development Server with Auto-Reload (Recommended for Development)

The project includes a custom Python development server with automatic file change detection.

**Quick Start:**
```bash
# Simply double-click (Windows):
start-server.bat

# Or run from command line:
python server.py
```

**Features:**
- ✅ Auto-detects file changes (HTML, CSS, JS)
- ✅ Automatically opens browser
- ✅ Runs on http://localhost:8080
- ✅ Can run as a service on startup

**For Auto-Start on Computer Restart:**
See the detailed guide in **[SERVER-SETUP.md](SERVER-SETUP.md)** for instructions on setting up the server to start automatically when your computer boots.

### Option 2: Open Directly in Browser (Simplest)

#### Windows
1. Navigate to the project folder in File Explorer
2. Double-click `index.html`
3. The dashboard will open in your default web browser

#### Linux
1. Navigate to the project folder in your file manager
2. Double-click `index.html` (or right-click → Open With → Web Browser)
3. Alternatively, from terminal:
   ```bash
   xdg-open index.html
   ```

### Option 3: Use a Local Web Server (Manual)

Using a local web server is recommended if you plan to develop or test features that require HTTP protocol.

#### Using Python (Works on both Windows and Linux)

**Python 3:**
```bash
# Navigate to the project directory
cd family-dashboard

# Start the server
python -m http.server 8000

# Or on some systems:
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

Then open your browser and visit: `http://localhost:8000`

#### Using Node.js (if installed)

```bash
# Install http-server globally (one-time setup)
npm install -g http-server

# Navigate to the project directory
cd family-dashboard

# Start the server
http-server -p 8000
```

Then open your browser and visit: `http://localhost:8000`

#### Using PHP (if installed)

```bash
# Navigate to the project directory
cd family-dashboard

# Start the server
php -S localhost:8000
```

Then open your browser and visit: `http://localhost:8000`

## Project Structure

```
family-dashboard/
├── index.html                # Main HTML structure (148 lines)
├── styles.css                # All CSS styling (1,048 lines)
├── app.js                    # All JavaScript functionality (1,559 lines)
├── server.py                 # Development server with auto-reload
├── start-server.bat          # Quick launch script (Windows)
├── start-server-hidden.vbs   # Silent startup script (Windows)
├── SERVER-SETUP.md           # Server setup and auto-start guide
├── whatsapp-qr.html          # WhatsApp QR code page (separate utility)
└── README.md                 # This file
```

The project has been refactored from a single large HTML file into separate, maintainable files:
- **index.html**: Clean HTML structure with semantic markup
- **styles.css**: All styling including responsive designs for mobile
- **app.js**: All JavaScript logic for countdowns, games, and calculators

## Browser Compatibility

This dashboard works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Development

To make changes:
1. **For styling**: Edit `styles.css`
2. **For functionality**: Edit `app.js`
3. **For content/structure**: Edit `index.html`
4. Refresh the browser to see updates
5. No build process required!

## License

Family project - All rights reserved.
