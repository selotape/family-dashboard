# Family Dashboard Server Setup Guide

This guide will help you set up the Family Dashboard to run automatically when your computer starts.

## Features

- **Auto-reload**: Server detects file changes and notifies you to refresh
- **Auto-start**: Runs automatically when computer restarts
- **Background mode**: Runs silently without console window
- **Easy access**: Opens at http://localhost:8080

---

## Quick Start (Development Mode)

For development/testing, simply double-click:
```
start-server.bat
```

This will:
- Start the server on port 8080
- Open your browser automatically
- Show file change notifications
- Keep console window open

---

## Setup for Auto-Start on Computer Restart

### Method 1: Task Scheduler (Recommended - Most Reliable)

This method uses Windows Task Scheduler to run the server as a background task.

#### Step 1: Open Task Scheduler
1. Press `Win + R`
2. Type `taskschd.msc` and press Enter

#### Step 2: Create New Task
1. Click **"Create Task"** (not "Create Basic Task") in the right panel
2. In the **General** tab:
   - Name: `Family Dashboard Server`
   - Description: `Runs the family dashboard web server on startup`
   - ✅ Check **"Run whether user is logged on or not"**
   - ✅ Check **"Run with highest privileges"**
   - Configure for: `Windows 10` (or your version)

#### Step 3: Configure Triggers
1. Go to the **Triggers** tab
2. Click **"New..."**
3. Begin the task: **"At startup"**
4. Delay task for: **30 seconds** (gives system time to fully boot)
5. ✅ Check **"Enabled"**
6. Click **"OK"**

#### Step 4: Configure Actions
1. Go to the **Actions** tab
2. Click **"New..."**
3. Action: **"Start a program"**
4. Program/script: `wscript.exe`
5. Add arguments: `"C:\Users\Ron\Dropbox\Github\family-dashboard\start-server-hidden.vbs"`
   - **Important**: Use the full path to the VBS file
6. Click **"OK"**

#### Step 5: Configure Conditions
1. Go to the **Conditions** tab
2. **Uncheck** "Start the task only if the computer is on AC power"
   - This ensures it runs even on battery

#### Step 6: Configure Settings
1. Go to the **Settings** tab
2. ✅ Check **"Allow task to be run on demand"**
3. ✅ Check **"Run task as soon as possible after a scheduled start is missed"**
4. If the task fails, restart every: **1 minute**
5. Attempt to restart up to: **3 times**
6. Click **"OK"**

#### Step 7: Test the Task
1. Right-click on your new task in Task Scheduler
2. Click **"Run"**
3. Open browser and go to: http://localhost:8080
4. The dashboard should appear!

---

### Method 2: Startup Folder (Simpler but Shows Console)

This method is simpler but will show a console window.

#### Step 1: Open Startup Folder
1. Press `Win + R`
2. Type: `shell:startup`
3. Press Enter

#### Step 2: Create Shortcut
1. Right-click in the Startup folder
2. Select **New → Shortcut**
3. Browse to: `C:\Users\Ron\Dropbox\Github\family-dashboard\start-server-hidden.vbs`
4. Click **Next**
5. Name it: `Family Dashboard Server`
6. Click **Finish**

#### Step 3: Test
1. Restart your computer
2. After login, wait ~30 seconds
3. Open browser to: http://localhost:8080

---

## Stopping the Server

### If running from bat file:
- Close the console window, or press `Ctrl + C`

### If running as Task Scheduler task:
1. Open Task Scheduler (`Win + R` → `taskschd.msc`)
2. Find "Family Dashboard Server"
3. Right-click → **End**

### If running from Startup folder:
1. Open Task Manager (`Ctrl + Shift + Esc`)
2. Find "Windows Script Host" or "python.exe"
3. Right-click → **End Task**

### Quick way (stops all Python processes):
1. Open Command Prompt as Administrator
2. Run: `taskkill /F /IM python.exe`

---

## Troubleshooting

### Server won't start
**Check if Python is installed:**
```cmd
python --version
```
If you see an error, install Python from: https://www.python.org/downloads/

### Port 8080 is already in use
**Option 1: Find and kill the process using port 8080:**
```cmd
netstat -ano | findstr :8080
taskkill /F /PID <PID_NUMBER>
```

**Option 2: Change the port:**
1. Edit `server.py`
2. Change `PORT = 8080` to another port like `PORT = 8081`
3. Access at: http://localhost:8081

### Browser doesn't open automatically
- Manually open browser and go to: http://localhost:8080

### File changes not detected
- Wait 1-2 seconds after saving
- Check the console for change notifications
- Make sure you're editing HTML, CSS, or JS files

### Task Scheduler task fails to run
1. Check the task history in Task Scheduler
2. Verify the path to start-server-hidden.vbs is correct
3. Make sure "Run with highest privileges" is checked

### Can't see if server is running (hidden mode)
**Check if it's running:**
```cmd
netstat -ano | findstr :8080
```
If you see output, the server is running.

**Or test by opening browser:**
- Go to http://localhost:8080
- If the page loads, server is running!

---

## Accessing the Dashboard

Once the server is running, access the dashboard from any browser on your computer:

- **Main URL**: http://localhost:8080
- **Direct link**: http://localhost:8080/index.html

You can also create a desktop shortcut:
1. Right-click on Desktop → New → Shortcut
2. Enter location: `http://localhost:8080`
3. Name it: `Family Dashboard`
4. Click Finish

---

## Configuration

### Change the port
Edit `server.py` and modify:
```python
PORT = 8080  # Change to your preferred port
```

### Watch additional file types
Edit `server.py` and modify:
```python
self.extensions = ['.html', '.css', '.js']  # Add more extensions like '.json'
```

---

## Uninstalling / Removing Auto-Start

### If using Task Scheduler:
1. Open Task Scheduler
2. Find "Family Dashboard Server"
3. Right-click → **Delete**

### If using Startup folder:
1. Press `Win + R`
2. Type: `shell:startup`
3. Delete the "Family Dashboard Server" shortcut

---

## Notes

- The server runs locally only (not accessible from other devices)
- To access from other devices on your network, you'll need to modify the server binding
- The server automatically watches for changes in HTML, CSS, and JS files
- Logs are only visible when running from the .bat file (not in hidden mode)
