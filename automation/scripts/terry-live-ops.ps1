$ErrorActionPreference = "Continue"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$OpsDir = Join-Path $Root ".ops"
$LogDir = Join-Path $OpsDir "logs"
$Worklog = Join-Path $LogDir "terry-worklog-20260518.md"
$TeamStatus = Join-Path $Root "studio\TEAM-STATUS.md"
$Sprint = Join-Path $Root "studio\SPRINT-2026-05-18.md"
$AgentRuns = Join-Path $Root "studio\AGENT-RUNS.md"
$Testing = Join-Path $Root "studio\TESTING.md"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Transcript = Join-Path $LogDir "terry-live-ops-$Stamp.transcript.log"
Start-Transcript -Path $Transcript -Force | Out-Null

function Show-Section($Title) {
  Write-Host ""
  Write-Host "================ $Title ================"
}

function Show-RecentWorklog {
  if (Test-Path $Worklog) {
    Get-Content -Path $Worklog -Tail 28
  } else {
    Write-Host "No Terry worklog yet: $Worklog"
  }
}

function Show-RecentLogs {
  Get-ChildItem -Path $LogDir -Filter "*.log" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 8 FullName, Length, LastWriteTime |
    Format-Table -AutoSize
}

function Show-FileTail($Path, $Lines = 20) {
  if (Test-Path $Path) {
    Get-Content -Path $Path -Tail $Lines
  } else {
    Write-Host "Missing: $Path"
  }
}

while ($true) {
  npm.cmd --prefix $Root run dashboard:update | Out-Null
  Clear-Host
  Write-Host "Terry Live Ops is running"
  Write-Host "Project: $Root"
  Write-Host "Transcript: $Transcript"
  Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  Write-Host "Refresh: 15 seconds. Close this window only if you want to stop the visible monitor."

  Show-Section "DEV SERVER"
  & (Join-Path $PSScriptRoot "status-dev.ps1")

  Show-Section "GIT STATUS"
  git -C $Root status --short

  Show-Section "TEAM STATUS"
  Show-FileTail $TeamStatus 24

  Show-Section "SPRINT / TESTING"
  Show-FileTail $Sprint 24
  Write-Host ""
  Show-FileTail $Testing 18

  Show-Section "AGENT RUNS"
  Show-FileTail $AgentRuns 32

  Show-Section "LATEST TERRY WORKLOG"
  Show-RecentWorklog

  Show-Section "RECENT LOG FILES"
  Show-RecentLogs

  Start-Sleep -Seconds 15
}
