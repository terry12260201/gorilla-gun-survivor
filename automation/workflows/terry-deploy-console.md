# Terry Deploy Console

Project: Gorilla Gun Survivor Web Edition

## Terminal Policy

- Use project scripts under `automation/scripts` for repeatable work.
- Runtime logs are written to `.ops/logs`.
- Process IDs are written to `.ops/pids`.
- VS Code and Claude terminals can run the same scripts; the durable record is the log file, not the terminal scrollback.

## Commands

```powershell
Set-Location E:\Codex\gorilla-gun-survivor
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\scripts\run-build.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\scripts\start-dev.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\scripts\status-dev.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\automation\scripts\stop-dev.ps1
```

## Agent Split

- Codex: repo edits, scripts, build verification, deterministic deployment steps.
- Claude in VS Code: long-running brainstorming, copywriting, UX notes, or manual terminal observation when needed.
- Do not duplicate the same terminal job in both agents; keep one owner per process.
