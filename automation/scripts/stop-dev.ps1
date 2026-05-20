$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$PidFile = Join-Path $Root ".ops\pids\vite-dev.pid"
$PortFile = Join-Path $Root ".ops\pids\vite-dev.port"

$PidValue = if (Test-Path $PidFile) { Get-Content $PidFile -ErrorAction SilentlyContinue } else { $null }
$Port = if (Test-Path $PortFile) { Get-Content $PortFile -ErrorAction SilentlyContinue } else { $null }
$Process = if ($PidValue) { Get-Process -Id $PidValue -ErrorAction SilentlyContinue } else { $null }
$Listener = if ($Port) { Get-NetTCPConnection -State Listen -LocalPort ([int]$Port) -ErrorAction SilentlyContinue | Select-Object -First 1 } else { $null }
$ListenerProcess = if ($Listener) { Get-Process -Id $Listener.OwningProcess -ErrorAction SilentlyContinue } else { $null }

if (-not $Process -and -not $ListenerProcess) {
  Write-Host "No Vite dev server process found."
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  exit 0
}

if ($Process) {
  Stop-Process -Id $Process.Id -Force
  Write-Host "Stopped Vite launcher. PID: $($Process.Id)"
}

if ($ListenerProcess -and (!$Process -or $ListenerProcess.Id -ne $Process.Id)) {
  Stop-Process -Id $ListenerProcess.Id -Force
  Write-Host "Stopped Vite listener. PID: $($ListenerProcess.Id)"
}

Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
