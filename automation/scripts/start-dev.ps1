param(
  [int]$Port = 5173,
  [string]$HostName = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$OpsDir = Join-Path $Root ".ops"
$LogDir = Join-Path $OpsDir "logs"
$PidDir = Join-Path $OpsDir "pids"
$PidFile = Join-Path $PidDir "vite-dev.pid"

New-Item -ItemType Directory -Force -Path $LogDir, $PidDir | Out-Null

if (Test-Path $PidFile) {
  $ExistingPid = Get-Content $PidFile -ErrorAction SilentlyContinue
  if ($ExistingPid -and (Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue)) {
    Write-Host "Vite dev server is already running. PID: $ExistingPid"
    Write-Host "Logs: $LogDir"
    exit 0
  }
  Remove-Item $PidFile -Force
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$OutLog = Join-Path $LogDir "vite-dev-$Stamp.out.log"
$ErrLog = Join-Path $LogDir "vite-dev-$Stamp.err.log"
$LatestOut = Join-Path $LogDir "vite-dev.latest.out.log"
$LatestErr = Join-Path $LogDir "vite-dev.latest.err.log"

Set-Content -Path $OutLog -Value "[$(Get-Date -Format o)] Starting Vite dev server on http://$HostName`:$Port/"
Set-Content -Path $ErrLog -Value ""
Copy-Item -Path $OutLog -Destination $LatestOut -Force
Copy-Item -Path $ErrLog -Destination $LatestErr -Force

$Args = @("run", "dev", "--", "--host", $HostName, "--port", "$Port", "--strictPort")
$Process = Start-Process -FilePath "npm.cmd" -ArgumentList $Args -WorkingDirectory $Root -PassThru -WindowStyle Hidden -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog

Set-Content -Path $PidFile -Value $Process.Id
Set-Content -Path (Join-Path $PidDir "vite-dev.port") -Value $Port
Set-Content -Path (Join-Path $PidDir "vite-dev.host") -Value $HostName

Write-Host "Started Vite dev server"
Write-Host "PID: $($Process.Id)"
Write-Host "URL: http://$HostName`:$Port/"
Write-Host "stdout: $OutLog"
Write-Host "stderr: $ErrLog"
