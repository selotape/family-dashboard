#!/bin/bash
set -e

#############################################################
# Family Dashboard - Linux Deployment Script (User-Level)
# This script:
# 1. Installs Python dependencies into a local virtualenv
# 2. Installs a user-level systemd service (no sudo) that runs forever
# 3. Installs a systemd path unit that auto-restarts the service when
#    server.py or .env change (content files are served live from disk,
#    so they need no restart -- just refresh the browser)
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
# 2. Check for .env file (optional - only story generation needs it)
#############################################################
echo -e "${BLUE}[2/4] Checking environment configuration...${NC}"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found - creating a placeholder.${NC}"
    cat > "$PROJECT_DIR/.env" <<EOF
# Anthropic API Key (optional - only the Reading Game story generator needs it).
# The dashboard runs fine without it; add a real key to enable story generation,
# then the service will auto-restart to pick it up.
ANTHROPIC_API_KEY=

# Server Configuration
PORT=8080
EOF
    echo -e "${YELLOW}   Story generation stays disabled until you add ANTHROPIC_API_KEY to .env${NC}"
else
    echo -e "${GREEN}✓ Environment file exists${NC}"
fi
echo ""

#############################################################
# 3. Install user-level systemd units (service + auto-restart-on-change)
#############################################################
echo -e "${BLUE}[3/4] Installing user-level systemd units...${NC}"

mkdir -p "$SYSTEMD_USER_DIR"

SERVICE_FILE="$SYSTEMD_USER_DIR/${SERVICE_NAME}.service"
PATH_FILE="$SYSTEMD_USER_DIR/${SERVICE_NAME}.path"
RESTART_FILE="$SYSTEMD_USER_DIR/${SERVICE_NAME}-restart.service"

# Stop existing units if running (idempotent re-deploy)
systemctl --user stop "${SERVICE_NAME}.path" 2>/dev/null || true
systemctl --user stop "${SERVICE_NAME}.service" 2>/dev/null || true

# --- Main long-running service ---
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
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=family-dashboard

[Install]
WantedBy=default.target
EOF

# --- Oneshot that restarts the main service (triggered by the path unit) ---
cat > "$RESTART_FILE" <<EOF
[Unit]
Description=Restart Family Dashboard when source changes

[Service]
Type=oneshot
ExecStart=/usr/bin/systemctl --user restart ${SERVICE_NAME}.service
EOF

# --- Path unit: watch the files that actually require a restart ---
# Content files (HTML/CSS/JS/pages) are served live from disk and need NO restart.
# Only server.py and .env require the Python process to be restarted.
cat > "$PATH_FILE" <<EOF
[Unit]
Description=Watch Family Dashboard source for changes

[Path]
PathModified=$PROJECT_DIR/server.py
PathModified=$PROJECT_DIR/.env
Unit=${SERVICE_NAME}-restart.service

[Install]
WantedBy=default.target
EOF

echo "Units created:"
echo "  • $SERVICE_FILE"
echo "  • $PATH_FILE"
echo "  • $RESTART_FILE"

# Reload systemd and enable/start units
systemctl --user daemon-reload
systemctl --user enable --now "${SERVICE_NAME}.service"
systemctl --user enable --now "${SERVICE_NAME}.path"

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
# 4. Verify boot persistence (linger)
#############################################################
echo -e "${BLUE}[4/4] Checking boot persistence...${NC}"

if loginctl show-user "$USER" 2>/dev/null | grep -q "Linger=yes"; then
    echo -e "${GREEN}✓ Lingering is enabled - service starts at boot (before login)${NC}"
else
    echo -e "${YELLOW}⚠️  Lingering not enabled - service starts only after you log in.${NC}"
    echo "   To start it at boot before login, run:"
    echo -e "     ${BLUE}sudo loginctl enable-linger $USER${NC}"
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
echo -e "${BLUE}How updates work (local edits, no git pull):${NC}"
echo "  • Edit HTML/CSS/JS/pages  → just refresh the browser (served live)"
echo "  • Edit server.py or .env  → service auto-restarts within ~1-2s"
echo "  • Edit requirements.txt   → re-run ./deploy-linux.sh to install new deps"
echo ""
echo -e "${BLUE}Useful Commands (no sudo needed):${NC}"
echo "  • View server logs:  journalctl --user -u $SERVICE_NAME -f"
echo "  • Restart service:   systemctl --user restart $SERVICE_NAME"
echo "  • Service status:    systemctl --user status $SERVICE_NAME"
echo "  • Watcher status:    systemctl --user status ${SERVICE_NAME}.path"
echo ""
echo -e "${GREEN}============================================================${NC}"
