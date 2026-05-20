$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$LogDir = Join-Path $Root ".ops\logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "build-$Stamp.log"
$LatestLog = Join-Path $LogDir "build.latest.log"
$StdoutFile = Join-Path $LogDir "build-$Stamp.stdout.tmp"
$StderrFile = Join-Path $LogDir "build-$Stamp.stderr.tmp"

Push-Location $Root
try {
  "[$(Get-Date -Format o)] npm run build" | Tee-Object -FilePath $LogFile
  $Process = Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "build") -WorkingDirectory $Root -Wait -PassThru -NoNewWindow -RedirectStandardOutput $StdoutFile -RedirectStandardError $StderrFile
  $ExitCode = $Process.ExitCode
  Get-Content -Path $StdoutFile -ErrorAction SilentlyContinue | Tee-Object -FilePath $LogFile -Append
  Get-Content -Path $StderrFile -ErrorAction SilentlyContinue | Tee-Object -FilePath $LogFile -Append
  Copy-Item -Path $LogFile -Destination $LatestLog -Force
  Remove-Item -Path $StdoutFile, $StderrFile -Force -ErrorAction SilentlyContinue
  if ($ExitCode -ne 0) {
    throw "Build failed with exit code $ExitCode. See $LogFile"
  }
  Write-Host "Build succeeded. Log: $LogFile"
} finally {
  Pop-Location
}
