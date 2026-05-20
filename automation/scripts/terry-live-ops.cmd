@echo off
setlocal
cd /d "%~dp0..\.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -File "%~dp0terry-live-ops.ps1"
