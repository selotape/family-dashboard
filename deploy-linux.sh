#!/bin/bash
set -e

#############################################################
# Family Dashboard - Linux Deployment Script
# This script:
# 1. Installs/updates the systemd service
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

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}🏠 Family Dashboard - Linux Deployment${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${GREEN}Project Directory: ${NC}$PROJECT_DIR"
echo -e "${GREEN}User: ${NC}$USER"
echo ""

#############################################################
# Check if running with sudo privileges
#############################################################
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  This script needs sudo privileges to install systemd service.${NC}"
    echo -e "${YELLOW}Re-running with sudo...${NC}"
    exec sudo -E bash "$0" "$@"
fi

# Get the actual user (not root) if running via sudo
ACTUAL_USER="${SUDO_USER:-$USER}"
ACTUAL_HOME=$(eval echo ~$ACTUAL_USER)

echo -e "${GREEN}✓ Running with sudo privileges${NC}"
echo -e "${GREEN}Deploying for user: ${NC}$ACTUAL_USER"
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
    sudo -u $ACTUAL_USER $PYTHON_BIN -m venv "$VENV_DIR"
fi

# Install/upgrade pip and dependencies
echo "Installing dependencies from requirements.txt..."
sudo -u $ACTUAL_USER "$VENV_DIR/bin/pip" install --upgrade pip
sudo -u $ACTUAL_USER "$VENV_DIR/bin/pip" install -r "$PROJECT_DIR/requirements.txt"

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
    chown $ACTUAL_USER:$ACTUAL_USER "$PROJECT_DIR/.env"
    echo -e "${YELLOW}⚠️  Please edit $PROJECT_DIR/.env and add your ANTHROPIC_API_KEY${NC}"
    echo -e "${YELLOW}Then re-run this script.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment file exists${NC}"
echo ""

#############################################################
# 3. Create/Update systemd service
#############################################################
echo -e "${BLUE}[3/4] Installing systemd service...${NC}"

SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# Stop existing service if running
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "Stopping existing service..."
    systemctl stop "$SERVICE_NAME"
fi

# Create systemd service file
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Family Dashboard Web Server
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_DIR/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=$VENV_DIR/bin/python $PROJECT_DIR/server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=family-dashboard

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created at: $SERVICE_FILE"

# Reload systemd daemon
systemctl daemon-reload

# Enable service to start on boot
systemctl enable "$SERVICE_NAME"

# Start the service
systemctl start "$SERVICE_NAME"

# Check status
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✓ Service installed and started successfully${NC}"
    echo ""
    echo -e "${GREEN}Service Commands:${NC}"
    echo "  • Start:   sudo systemctl start $SERVICE_NAME"
    echo "  • Stop:    sudo systemctl stop $SERVICE_NAME"
    echo "  • Restart: sudo systemctl restart $SERVICE_NAME"
    echo "  • Status:  sudo systemctl status $SERVICE_NAME"
    echo "  • Logs:    sudo journalctl -u $SERVICE_NAME -f"
else
    echo -e "${RED}✗ Failed to start service${NC}"
    echo "Check logs with: sudo journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi

echo ""

#############################################################
# 4. Setup cron job for git pull
#############################################################
echo -e "${BLUE}[4/4] Setting up auto-update cron job...${NC}"

CRON_SCRIPT="$PROJECT_DIR/auto-update.sh"

# Create git pull script
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

    # Restart service
    echo "Restarting service..." >> "$LOG_FILE"
    sudo systemctl restart family-dashboard >> "$LOG_FILE" 2>&1

    echo "✓ Update completed successfully" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
EOF

chmod +x "$CRON_SCRIPT"
chown $ACTUAL_USER:$ACTUAL_USER "$CRON_SCRIPT"

echo "Created auto-update script at: $CRON_SCRIPT"

# Add to user's crontab (run every 10 minutes)
CRON_JOB="*/10 * * * * $CRON_SCRIPT"
CRON_COMMENT="# Family Dashboard auto-update (every 10 minutes)"

# Get existing crontab, remove old entry if exists, add new one
(sudo -u $ACTUAL_USER crontab -l 2>/dev/null | grep -v "$CRON_SCRIPT" | grep -v "Family Dashboard auto-update"; echo "$CRON_COMMENT"; echo "$CRON_JOB") | sudo -u $ACTUAL_USER crontab -

echo -e "${GREEN}✓ Cron job installed (runs every 10 minutes)${NC}"
echo ""
echo -e "${GREEN}Cron Configuration:${NC}"
echo "  • Script: $CRON_SCRIPT"
echo "  • Schedule: Every 10 minutes"
echo "  • Log: $ACTUAL_HOME/.family-dashboard-updates.log"
echo "  • View cron: crontab -l"
echo ""

#############################################################
# Setup sudo permissions for service restart
#############################################################
echo -e "${BLUE}Setting up sudo permissions for service restart...${NC}"

SUDOERS_FILE="/etc/sudoers.d/family-dashboard"

cat > "$SUDOERS_FILE" <<EOF
# Allow $ACTUAL_USER to restart family-dashboard service without password
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart family-dashboard
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl start family-dashboard
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl stop family-dashboard
$ACTUAL_USER ALL=(ALL) NOPASSWD: /bin/systemctl status family-dashboard
EOF

chmod 0440 "$SUDOERS_FILE"

echo -e "${GREEN}✓ Sudo permissions configured${NC}"
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
echo "  ✓ Systemd service (starts on boot)"
echo "  ✓ Auto-update cron job (every 10 minutes)"
echo "  ✓ Sudo permissions for service management"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  • View server logs:    sudo journalctl -u $SERVICE_NAME -f"
echo "  • View update logs:    tail -f $ACTUAL_HOME/.family-dashboard-updates.log"
echo "  • Restart service:     sudo systemctl restart $SERVICE_NAME"
echo "  • Check cron job:      crontab -l"
echo "  • Manual update:       $CRON_SCRIPT"
echo ""
echo -e "${YELLOW}Note:${NC} The server will automatically pull updates from GitHub every 10 minutes"
echo "and restart if changes are detected."
echo ""
echo -e "${GREEN}============================================================${NC}"
