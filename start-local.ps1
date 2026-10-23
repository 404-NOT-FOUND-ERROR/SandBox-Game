param([int]$Port = 8080, [switch]$OpenBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$url = "http://127.0.0.1:$Port/"
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener[0].OwningProcess)"
    if ($processInfo.CommandLine -notlike "*http.server*" -or $processInfo.CommandLine -notlike "*$projectRoot*") {
        throw "Port $Port is occupied by another application. Choose another -Port."
    }
    Write-Host "Already running: $url"
} else {
    $python = (Get-Command python -ErrorAction Stop).Source
    $logDir = Join-Path $projectRoot '.local'
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    $arguments = @('-m', 'http.server', "$Port", '--bind', '127.0.0.1', '--directory', ('"' + $projectRoot + '"'))
    $server = Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDir 'server.out.log') -RedirectStandardError (Join-Path $logDir 'server.err.log')
    $ready = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 250
        if ($server.HasExited) { throw 'Server exited. See .local/server.err.log.' }
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
    }
    if (-not $ready) { throw 'Server did not become ready. See .local/server.err.log.' }
    Write-Host "Running: $url (PID $($server.Id))"
}
if ($OpenBrowser) { Start-Process $url }
