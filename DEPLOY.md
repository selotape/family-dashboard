# Linux Deployment Guide

This guide explains how to run the Family Dashboard as a persistent, always-on
service on a Linux machine that also serves your latest **local** edits.

## Quick Start

From the project directory:

```bash
chmod +x deploy-linux.sh
./deploy-linux.sh
```

The script (no sudo required) will:
- Install Python dependencies into a local `venv/`
- Create a placeholder `.env` if one doesn't exist (story generation is optional)
- Install a **user-level systemd service** that runs forever and restarts on crash
- Install a **systemd path unit** that auto-restarts the service when `server.py`
  or `.env` change

Then open the dashboard at: **http://localhost:8080**

## How Updates Work (local edits, no git pull)

This deployment serves your **local working tree directly** — there is no build
step and no `git pull`. What you edit is what gets served:

| You edit…                         | What happens                                            |
| --------------------------------- | ------------------------------------------------------- |
| `index.html`, `styles.css`, `js/*`, `pages/*` | Served **live** from disk — just **refresh the browser**. No restart. |
| `server.py` or `.env`             | The service **auto-restarts within ~1–2 s** to pick it up. |
| `requirements.txt`                | Re-run `./deploy-linux.sh` to install the new dependencies. |

Content files are read from disk on every request, so they never need a restart.
Only the Python process (`server.py`) and its startup config (`.env`) do — and the
path unit handles that automatically.

## What Gets Installed

### Systemd units (user-level, in `~/.config/systemd/user/`)
- `family-dashboard.service` — the long-running web server (`Restart=always`)
- `family-dashboard.path` — watches `server.py` and `.env` for changes
- `family-dashboard-restart.service` — oneshot that restarts the server, triggered
  by the path unit

### Python virtual environment
- Location: `./venv/`
- Dependencies: from `requirements.txt`

## Boot Persistence

The service is user-level. If **lingering** is enabled for your user it starts at
boot, before you log in. The deploy script reports whether it's on. To enable it:

```bash
sudo loginctl enable-linger "$USER"
```

(On this machine lingering is already enabled.)

## Managing the Service

```bash
# Status / logs
systemctl --user status family-dashboard
journalctl --user -u family-dashboard -f

# Start / stop / restart
systemctl --user start family-dashboard
systemctl --user stop family-dashboard
systemctl --user restart family-dashboard

# The auto-restart watcher
systemctl --user status family-dashboard.path
```

## Configuration

### Environment variables (`.env`)
```bash
# Optional: enables the Reading Game story generator
ANTHROPIC_API_KEY=your_api_key_here

# Optional: server port (default 8080)
PORT=8080
```

After editing `.env`, the service auto-restarts to apply the change (or run
`systemctl --user restart family-dashboard`).

## Re-deploying

`./deploy-linux.sh` is idempotent — safe to run again. It reinstalls the units,
reinstalls dependencies, and restarts the service.

## Troubleshooting

### Service won't start
```bash
systemctl --user status family-dashboard
journalctl --user -u family-dashboard -n 100
# Common causes: port 8080 already in use, missing dependencies.
```

### Auto-restart on server.py/.env not happening
```bash
systemctl --user status family-dashboard.path   # should be "active (waiting)"
journalctl --user -u family-dashboard-restart -n 20
```

## Uninstalling

```bash
systemctl --user disable --now family-dashboard.service family-dashboard.path
rm ~/.config/systemd/user/family-dashboard.service \
   ~/.config/systemd/user/family-dashboard.path \
   ~/.config/systemd/user/family-dashboard-restart.service
systemctl --user daemon-reload
```

## Accessing From Other Devices

The server binds `0.0.0.0`, so other devices on your network can reach it:

```bash
hostname -I                 # find this machine's IP
# then browse to  http://YOUR_SERVER_IP:8080
sudo ufw allow 8080/tcp     # only if a firewall is blocking it
```
