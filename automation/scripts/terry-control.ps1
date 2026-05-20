$ErrorActionPreference = "Continue"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$OpsDir = Join-Path $Root ".ops"
$LogDir = Join-Path $OpsDir "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Transcript = Join-Path $LogDir "terry-terminal-$Stamp.transcript.log"
$LatestTranscript = Join-Path $LogDir "terry-terminal.latest.transcript.log"

Start-Transcript -Path $Transcript -Force | Out-Null

function Write-TerryHeader {
  Clear-Host
  Write-Host "============================================================"
  Write-Host " Terry Control Terminal"
  Write-Host " Project: $Root"
  Write-Host " Transcript: $Transcript"
  Write-Host "============================================================"
  Write-Host ""
}

function Invoke-TerryStatus {
  & (Join-Path $PSScriptRoot "status-dev.ps1")
}

function Invoke-TerryBuild {
  & (Join-Path $PSScriptRoot "run-build.ps1")
}

function Invoke-TerryRestart {
  & (Join-Path $PSScriptRoot "stop-dev.ps1")
  & (Join-Path $PSScriptRoot "start-dev.ps1") -Port 5174
  & (Join-Path $PSScriptRoot "status-dev.ps1")
}

function Show-TerryLogs {
  Write-Host ""
  Write-Host "Latest logs:"
  Get-ChildItem -Path $LogDir -Filter "*.log" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 12 FullName, Length, LastWriteTime |
    Format-Table -AutoSize
  Write-Host ""
}

function Show-TerryGit {
  git -C $Root status --short
}

Write-TerryHeader
Write-Host "Boot check:"
Invoke-TerryStatus
Write-Host ""
Show-TerryLogs

while ($true) {
  Write-Host ""
  Write-Host "Commands: status | build | restart | stop | logs | git | clear | exit"
  $Command = Read-Host "Terry"
  switch ($Command.Trim().ToLowerInvariant()) {
    "status" { Invoke-TerryStatus }
    "build" { Invoke-TerryBuild }
    "restart" { Invoke-TerryRestart }
    "stop" { & (Join-Path $PSScriptRoot "stop-dev.ps1") }
    "logs" { Show-TerryLogs }
    "git" { Show-TerryGit }
    "clear" { Write-TerryHeader }
    "exit" { break }
    default { Write-Host "Unknown command: $Command" }
  }
}

Copy-Item -Path $Transcript -Destination $LatestTranscript -Force -ErrorAction SilentlyContinue
Stop-Transcript | Out-Null
