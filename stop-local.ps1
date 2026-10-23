param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listener) { Write-Host 'Server is not running.'; exit 0 }
$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener[0].OwningProcess)"
if ($processInfo.CommandLine -notlike '*http.server*' -or $processInfo.CommandLine -notlike "*$PSScriptRoot*") {
    throw 'This port belongs to another application; it will not be stopped.'
}
Stop-Process -Id $processInfo.ProcessId
Write-Host 'Local game server stopped.'
