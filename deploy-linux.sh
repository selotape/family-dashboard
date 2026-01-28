#!/bin/bash
set -e

#############################################################
# Family Dashboard - Linux Deployment Script (User-Level)
# This script:
# 1. Installs/updates a user-level systemd service (no sudo)
# 2. Sets up a cron job for auto git-pull every 10 minutes
#############################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="family-dashboard"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="python3"
USER=$(whoami)
VENV_DIR="$PROJECT_DIR/venv"
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}🏠 Family Dashboard - Linux Deployment (User-Level)${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${GREEN}Project Directory: ${NC}$PROJECT_DIR"
echo -e "${GREEN}User: ${NC}$USER"
echo -e "${GREEN}Service Location: ${NC}$SYSTEMD_USER_DIR/${SERVICE_NAME}.service"
echo ""

#############################################################
# 1. Install Python dependencies
#############################################################
echo -e "${BLUE}[1/4] Installing Python dependencies...${NC}"

# Check if Python3 is installed
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo -e "${RED}✗ Python3 is not installed. Please install it first.${NC}"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    $PYTHON_BIN -m venv "$VENV_DIR"
fi

# Install/upgrade pip and dependencies
echo "Installing dependencies from requirements.txt..."
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install -r "$PROJECT_DIR/requirements.txt"

echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

#############################################################
# 2. Check for .env file
#############################################################
echo -e "${BLUE}[2/4] Checking environment configuration...${NC}"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found!${NC}"
    echo "Creating .env template..."
    cat > "$PROJECT_DIR/.env" <<EOF
# Anthropic API Key (required for story generation)
ANTHROPIC_API_KEY=your_api_key_here

# Server Configuration
PORT=8080
EOF
    echo -e "${YELLOW}⚠️  Please edit $PROJECT_DIR/.env and add your ANTHROPIC_API_KEY${NC}"
    echo -e "${YELLOW}Then re-run this script.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment file exists${NC}"
echo ""

#############################################################
# 3. Create/Update user-level systemd service
#############################################################
echo -e "${BLUE}[3/4] Installing user-level systemd service...${NC}"

# Create systemd user directory if it doesn't exist
mkdir -p "$SYSTEMD_USER_DIR"

SERVICE_FILE="$SYSTEMD_USER_DIR/${SERVICE_NAME}.service"

# Stop existing service if running
if systemctl --user is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo "Stopping existing service..."
    systemctl --user stop "$SERVICE_NAME"
fi

# Create systemd service file
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Family Dashboard Web Server
After=network.target

[Service]
Type=simple
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_DIR/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=$VENV_DIR/bin/python $PROJECT_DIR/server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=family-dashboard

[Install]
WantedBy=default.target
EOF

echo "Service file created at: $SERVICE_FILE"

# Reload systemd daemon
systemctl --user daemon-reload

# Enable service to start on login
systemctl --user enable "$SERVICE_NAME"

# Start the service
systemctl --user start "$SERVICE_NAME"

# Check status
if systemctl --user is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✓ Service installed and started successfully${NC}"
    echo ""
    echo -e "${GREEN}Service Commands (no sudo needed):${NC}"
    echo "  • Start:   systemctl --user start $SERVICE_NAME"
    echo "  • Stop:    systemctl --user stop $SERVICE_NAME"
    echo "  • Restart: systemctl --user restart $SERVICE_NAME"
    echo "  • Status:  systemctl --user status $SERVICE_NAME"
    echo "  • Logs:    journalctl --user -u $SERVICE_NAME -f"
else
    echo -e "${RED}✗ Failed to start service${NC}"
    echo "Check logs with: journalctl --user -u $SERVICE_NAME -n 50"
    exit 1
fi

echo ""

#############################################################
# 4. Setup cron job for git pull
#############################################################
echo -e "${BLUE}[4/4] Setting up auto-update cron job...${NC}"

CRON_SCRIPT="$PROJECT_DIR/auto-update.sh"

# Create git pull script (uses user-level systemctl)
cat > "$CRON_SCRIPT" <<'EOF'
#!/bin/bash
# Auto-update script for Family Dashboard

# Change to project directory
cd "$(dirname "$0")"

# Log file
LOG_FILE="$HOME/.family-dashboard-updates.log"

# Timestamp
echo "==================================================" >> "$LOG_FILE"
echo "[$(date)] Checking for updates..." >> "$LOG_FILE"

# Fetch latest changes
git fetch origin main >> "$LOG_FILE" 2>&1

# Check if there are updates
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "Already up to date." >> "$LOG_FILE"
else
    echo "Updates found. Pulling changes..." >> "$LOG_FILE"

    # Stash any local changes (just in case)
    git stash >> "$LOG_FILE" 2>&1

    # Pull latest changes
    git pull origin main >> "$LOG_FILE" 2>&1

    # Install any new dependencies
    if [ -f "requirements.txt" ]; then
        if [ -d "venv" ]; then
            venv/bin/pip install -r requirements.txt >> "$LOG_FILE" 2>&1
        fi
    fi

    # Restart service (user-level, no sudo needed)
    echo "Restarting service..." >> "$LOG_FILE"
    systemctl --user restart family-dashboard >> "$LOG_FILE" 2>&1

    echo "✓ Update completed successfully" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
EOF

chmod +x "$CRON_SCRIPT"

echo "Created auto-update script at: $CRON_SCRIPT"

# Add to user's crontab (run every 10 minutes)
CRON_JOB="*/10 * * * * $CRON_SCRIPT"
CRON_COMMENT="# Family Dashboard auto-update (every 10 minutes)"

# Get existing crontab, remove old entry if exists, add new one
(crontab -l 2>/dev/null | grep -v "$CRON_SCRIPT" | grep -v "Family Dashboard auto-update"; echo "$CRON_COMMENT"; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}✓ Cron job installed (runs every 10 minutes)${NC}"
echo ""

#############################################################
# Enable lingering for service to run at boot (optional)
#############################################################
echo -e "${BLUE}Checking boot persistence...${NC}"

if loginctl show-user "$USER" 2>/dev/null | grep -q "Linger=yes"; then
    echo -e "${GREEN}✓ Lingering already enabled - service will start at boot${NC}"
else
    echo -e "${YELLOW}⚠️  Lingering not enabled${NC}"
    echo ""
    echo "To have the service start at boot (before you log in), run:"
    echo -e "  ${BLUE}sudo loginctl enable-linger $USER${NC}"
    echo ""
    echo "This is optional - the service will still start when you log in."
    echo ""
    read -p "Enable lingering now? (requires sudo) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo loginctl enable-linger "$USER"
        echo -e "${GREEN}✓ Lingering enabled - service will start at boot${NC}"
    fi
fi

echo ""

#############################################################
# Summary
#############################################################
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${GREEN}Server is running at:${NC} http://localhost:8080"
echo ""
echo -e "${BLUE}What was installed:${NC}"
echo "  ✓ Python virtual environment with dependencies"
echo "  ✓ User-level systemd service (no sudo needed)"
echo "  ✓ Auto-update cron job (every 10 minutes)"
echo ""
echo -e "${BLUE}Useful Commands (no sudo needed):${NC}"
echo "  • View server logs:    journalctl --user -u $SERVICE_NAME -f"
echo "  • View update logs:    tail -f ~/.family-dashboard-updates.log"
echo "  • Restart service:     systemctl --user restart $SERVICE_NAME"
echo "  • Check cron job:      crontab -l"
echo "  • Manual update:       $CRON_SCRIPT"
echo ""
echo -e "${YELLOW}Note:${NC} The server will automatically pull updates from GitHub every 10 minutes"
echo "and restart if changes are detected."
echo ""
echo -e "${GREEN}============================================================${NC}"
