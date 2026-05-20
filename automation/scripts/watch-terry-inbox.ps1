param(
  [string]$ProjectRoot = "E:\Project\2026\Gorilla Gun Survivor — Web Edition",
  [int]$IntervalSeconds = 20,
  [switch]$Telegram
)

$ErrorActionPreference = "Stop"

$project = Get-Item -LiteralPath $ProjectRoot -ErrorAction SilentlyContinue
if (-not $project) {
  $project = Get-ChildItem -LiteralPath "E:\Project\2026" -Directory -Filter "Gorilla Gun Survivor*" | Select-Object -First 1
}

if (-not $project) {
  throw "Project root not found. Pass -ProjectRoot explicitly."
}

$inbox = Join-Path $project.FullName "studio\mailbox\terry-inbox"
$seenFile = Join-Path $project.FullName "studio\mailbox\.terry-watch-seen.txt"
New-Item -ItemType Directory -Force -Path $inbox | Out-Null

$seen = @{}
if (Test-Path -LiteralPath $seenFile) {
  Get-Content -LiteralPath $seenFile | ForEach-Object { if ($_){ $seen[$_] = $true } }
}

function Send-TelegramMessage {
  param([string]$Text)

  $token = $env:TELEGRAM_BOT_TOKEN
  $chatId = $env:TELEGRAM_CHAT_ID
  if (-not $token -or -not $chatId) {
    Write-Host "Telegram env vars missing: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID"
    return
  }

  $uri = "https://api.telegram.org/bot$token/sendMessage"
  Invoke-RestMethod -Method Post -Uri $uri -Body @{
    chat_id = $chatId
    text = $Text
  } | Out-Null
}

Write-Host "Watching Terry inbox:"
Write-Host $inbox
Write-Host "Press Ctrl+C to stop."

while ($true) {
  $files = Get-ChildItem -LiteralPath $inbox -File -Filter "*.md" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime
  foreach ($file in $files) {
    if (-not $seen.ContainsKey($file.FullName)) {
      $seen[$file.FullName] = $true
      Add-Content -LiteralPath $seenFile -Value $file.FullName

      $title = Get-Content -LiteralPath $file.FullName -TotalCount 1
      $message = "Terry inbox new request:`n$title`n$file"
      Write-Host ""
      Write-Host "NEW TERRY REQUEST" -ForegroundColor Yellow
      Write-Host $message

      if ($Telegram) {
        Send-TelegramMessage -Text $message
      }
    }
  }

  Start-Sleep -Seconds $IntervalSeconds
}

