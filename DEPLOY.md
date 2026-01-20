# Linux Deployment Guide

This guide explains how to deploy the Family Dashboard as a persistent service on a Linux machine.

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/selotape/family-dashboard.git
cd family-dashboard
```

2. Run the deployment script:
```bash
chmod +x deploy-linux.sh
./deploy-linux.sh
```

The script will ask for sudo password and automatically:
- Install Python dependencies in a virtual environment
- Create/update the systemd service
- Set up auto-update cron job (every 10 minutes)
- Start the server

3. Access the dashboard at: **http://localhost:8080**

## What Gets Installed

### 1. Systemd Service
- **Service Name**: `family-dashboard`
- **Auto-starts on boot**: Yes
- **User**: Your current user (not root)
- **Working Directory**: Project directory
- **Logs**: Via systemd journal

### 2. Auto-Update Cron Job
- **Schedule**: Every 10 minutes
- **Action**: `git pull` from main branch
- **Auto-restart**: Service restarts if updates are found
- **Update Log**: `~/.family-dashboard-updates.log`

### 3. Python Virtual Environment
- **Location**: `./venv/`
- **Dependencies**: Installed from `requirements.txt`

## Managing the Service

### Service Commands
```bash
# Start the service
sudo systemctl start family-dashboard

# Stop the service
sudo systemctl stop family-dashboard

# Restart the service
sudo systemctl restart family-dashboard

# Check status
sudo systemctl status family-dashboard

# View live logs
sudo journalctl -u family-dashboard -f

# View recent logs (last 50 lines)
sudo journalctl -u family-dashboard -n 50
```

### Cron Job Management
```bash
# View cron jobs
crontab -l

# View update logs
tail -f ~/.family-dashboard-updates.log

# Manually trigger update
./auto-update.sh

# Remove cron job
crontab -e  # Then delete the family-dashboard lines
```

## Configuration

### Environment Variables
Edit `.env` file in the project directory:

```bash
# Required: Anthropic API Key for story generation
ANTHROPIC_API_KEY=your_api_key_here

# Optional: Server port (default: 8080)
PORT=8080
```

After editing `.env`, restart the service:
```bash
sudo systemctl restart family-dashboard
```

## Re-deploying / Updating

To update the service configuration or re-deploy:

```bash
./deploy-linux.sh
```

The script is idempotent - it can be run multiple times safely. It will:
- Update the systemd service file
- Reinstall dependencies if needed
- Replace the cron job with the latest version
- Restart the service

## Troubleshooting

### Service won't start
```bash
# Check service status
sudo systemctl status family-dashboard

# View detailed logs
sudo journalctl -u family-dashboard -n 100

# Common issues:
# 1. Missing .env file or invalid API key
# 2. Port 8080 already in use
# 3. Missing Python dependencies
```

### Auto-updates not working
```bash
# Check cron job is installed
crontab -l | grep family-dashboard

# Check update logs
tail -20 ~/.family-dashboard-updates.log

# Test manual update
./auto-update.sh
```

### Permission issues
```bash
# The service runs as your user, not root
# Check file ownership
ls -la

# Fix ownership if needed
sudo chown -R $USER:$USER .
```

## Uninstalling

To completely remove the installation:

```bash
# Stop and disable service
sudo systemctl stop family-dashboard
sudo systemctl disable family-dashboard

# Remove service file
sudo rm /etc/systemd/system/family-dashboard.service

# Remove sudoers file
sudo rm /etc/sudoers.d/family-dashboard

# Reload systemd
sudo systemctl daemon-reload

# Remove cron job
crontab -e  # Delete family-dashboard lines

# Remove project directory (optional)
cd ..
rm -rf family-dashboard
```

## Security Notes

- The service runs as your user (not root) for security
- Sudo permissions are granted only for service management commands
- The `.env` file contains sensitive API keys - keep it secure
- Auto-update uses SSH/HTTPS authentication (configure GitHub credentials)

## Port Configuration

The default port is **8080**. To use a different port:

1. Edit `.env`:
   ```bash
   PORT=3000
   ```

2. Restart service:
   ```bash
   sudo systemctl restart family-dashboard
   ```

## Accessing from Other Devices

To access the dashboard from other devices on your network:

1. Find your server's IP address:
   ```bash
   hostname -I
   ```

2. Open firewall port (if needed):
   ```bash
   sudo ufw allow 8080/tcp
   ```

3. Access from other devices:
   ```
   http://YOUR_SERVER_IP:8080
   ```

## Running on Raspberry Pi

This script works perfectly on Raspberry Pi OS (Debian-based):

```bash
# Install Python3 if not present
sudo apt update
sudo apt install python3 python3-venv python3-pip git

# Clone and deploy
git clone https://github.com/selotape/family-dashboard.git
cd family-dashboard
./deploy-linux.sh
```

The dashboard will start automatically on boot and keep itself updated!
