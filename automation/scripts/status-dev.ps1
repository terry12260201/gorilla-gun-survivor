$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$OpsDir = Join-Path $Root ".ops"
$LogDir = Join-Path $OpsDir "logs"
$PidFile = Join-Path $OpsDir "pids\vite-dev.pid"
$PortFile = Join-Path $OpsDir "pids\vite-dev.port"
$HostFile = Join-Path $OpsDir "pids\vite-dev.host"

$PidValue = if (Test-Path $PidFile) { Get-Content $PidFile -ErrorAction SilentlyContinue } else { $null }
$Port = if (Test-Path $PortFile) { Get-Content $PortFile -ErrorAction SilentlyContinue } else { "5173" }
$HostName = if (Test-Path $HostFile) { Get-Content $HostFile -ErrorAction SilentlyContinue } else { "127.0.0.1" }
$Process = if ($PidValue) { Get-Process -Id $PidValue -ErrorAction SilentlyContinue } else { $null }
$Listener = Get-NetTCPConnection -State Listen -LocalPort ([int]$Port) -ErrorAction SilentlyContinue | Select-Object -First 1
$ListenerProcess = if ($Listener) { Get-Process -Id $Listener.OwningProcess -ErrorAction SilentlyContinue } else { $null }

if ($ListenerProcess) {
  Write-Host "Status: running"
  Write-Host "URL: http://$HostName`:$Port/"
  Write-Host "Listener PID: $($ListenerProcess.Id) ($($ListenerProcess.ProcessName))"
  if ($Process) {
    Write-Host "Launcher PID: $($Process.Id) ($($Process.ProcessName))"
  } elseif ($PidValue) {
    Write-Host "Stale launcher PID: $PidValue"
  }
} elseif ($Process) {
  Write-Host "Status: launcher alive, but no listener found"
  Write-Host "Launcher PID: $($Process.Id) ($($Process.ProcessName))"
  Write-Host "URL: http://$HostName`:$Port/"
} else {
  Write-Host "Status: stopped"
  if ($PidValue) { Write-Host "Stale PID: $PidValue" }
}

Write-Host "Logs: $LogDir"
Get-ChildItem -Path $LogDir -Filter "vite-dev-*.log" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 6 FullName, Length, LastWriteTime
