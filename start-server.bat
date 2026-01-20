@echo off
REM Family Dashboard Server Launcher
REM This starts the development server with auto-reload

cd /d "%~dp0"
python server.py
pause
