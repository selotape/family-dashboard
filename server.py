#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Family Dashboard Development Server
Serves the website and auto-reloads the browser when files change.
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import threading
import time
from pathlib import Path

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve files from the project directory."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        """Custom logging format."""
        print(f"[{self.log_date_time_string()}] {format % args}")

class FileWatcher:
    """Simple file watcher that checks for changes."""

    def __init__(self, directory, extensions=None):
        self.directory = Path(directory)
        self.extensions = extensions or ['.html', '.css', '.js']
        self.last_modified = {}
        self._scan_files()

    def _scan_files(self):
        """Scan all files and store their modification times."""
        for ext in self.extensions:
            for file_path in self.directory.glob(f"*{ext}"):
                self.last_modified[file_path] = file_path.stat().st_mtime

    def check_changes(self):
        """Check if any files have been modified."""
        changed_files = []
        for ext in self.extensions:
            for file_path in self.directory.glob(f"*{ext}"):
                current_mtime = file_path.stat().st_mtime
                if file_path not in self.last_modified or self.last_modified[file_path] != current_mtime:
                    changed_files.append(file_path.name)
                    self.last_modified[file_path] = current_mtime
        return changed_files

def watch_files(watcher):
    """Background thread to watch for file changes."""
    print("\n👀 Watching for file changes...")
    print("   Monitoring: HTML, CSS, and JS files")
    print("   (Changes will be detected automatically)\n")

    while True:
        time.sleep(1)  # Check every second
        changed = watcher.check_changes()
        if changed:
            print(f"\n🔄 File(s) changed: {', '.join(changed)}")
            print("   → Refresh your browser to see updates\n")

def start_server():
    """Start the HTTP server."""

    # Change to the project directory
    os.chdir(DIRECTORY)

    # Create file watcher
    watcher = FileWatcher(DIRECTORY)

    # Start file watching in background thread
    watch_thread = threading.Thread(target=watch_files, args=(watcher,), daemon=True)
    watch_thread.start()

    # Create and start server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🏠 Family Dashboard Server")
        print("=" * 60)
        print(f"📂 Serving files from: {DIRECTORY}")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"🔗 Direct link: http://localhost:{PORT}/index.html")
        print("=" * 60)
        print("\n💡 Tips:")
        print("   • Server will stay running until you close this window")
        print("   • File changes are monitored automatically")
        print("   • Press Ctrl+C to stop the server")
        print("=" * 60)

        # Open browser after a short delay
        def open_browser():
            time.sleep(1.5)
            print(f"\n🚀 Opening browser at http://localhost:{PORT}\n")
            webbrowser.open(f"http://localhost:{PORT}")

        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()

        # Start serving
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped. Goodbye!")
            sys.exit(0)

if __name__ == "__main__":
    start_server()
