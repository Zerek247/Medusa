# DEMO DE UN DIA: enciende todo y abre un enlace publico TEMPORAL a la tienda.
#
# Uso (en PowerShell, desde la carpeta del repositorio):
#     .\scripts\demo-tunel.ps1
#
# Antes: abre Docker Desktop y espera a que diga "Engine running".
#
# Que hace:
#   1. Verifica que Docker este corriendo y levanta los contenedores.
#   2. Espera a que el backend y la tienda respondan.
#   3. "Calienta" las paginas principales (la primera visita a cada pagina del
#      servidor de desarrollo tarda unos segundos; asi la demo va fluida).
#   4. Abre un tunel de Cloudflare SOLO hacia la tienda (puerto 8000) e imprime
#      el enlace https://....trycloudflare.com para mandarselo a los demas.
#   5. Evita que Windows se duerma mientras el script este abierto.
#
# Para terminar: Ctrl+C (o cierra la ventana). El enlace deja de funcionar y no
# queda nada publicado.
#
# IMPORTANTE:
#   - El panel de administracion (puerto 9000) NO se publica.
#   - La clave de Bind se queda en esta PC; nunca viaja por el tunel.
#   - Mientras el script este abierto, cualquiera con el enlace ve la tienda.

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

# --- Docker en el PATH (no siempre esta) ---
$dockerBin = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\resources\bin"
if (Test-Path $dockerBin) { $env:Path = "$dockerBin;$env:Path" }

# --- cloudflared ---
$cloudflared = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $cloudflared) { $cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe" }
if (-not (Test-Path $cloudflared)) {
    Write-Host "No encuentro cloudflared. Instalalo con:  winget install Cloudflare.cloudflared" -ForegroundColor Red
    exit 1
}

# --- 1) Docker ---
Write-Host "1/5 Revisando Docker..." -ForegroundColor Cyan
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker no esta corriendo. Abre Docker Desktop, espera a que diga 'Engine running' y vuelve a ejecutar este script." -ForegroundColor Red
    exit 1
}
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Host "No se pudieron levantar los contenedores." -ForegroundColor Red; exit 1 }

# --- 2) Esperar a que respondan ---
function Esperar-Url($url, $nombre, $maxSegundos) {
    $limite = (Get-Date).AddSeconds($maxSegundos)
    while ((Get-Date) -lt $limite) {
        try { if ((Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 8).StatusCode -eq 200) { return $true } } catch { }
        Start-Sleep -Seconds 4
    }
    Write-Host "$nombre no respondio a tiempo ($url)." -ForegroundColor Red
    return $false
}
Write-Host "2/5 Esperando al backend y a la tienda..." -ForegroundColor Cyan
if (-not (Esperar-Url "http://localhost:9000/health" "El backend" 300)) { exit 1 }
if (-not (Esperar-Url "http://localhost:8000/mx" "La tienda" 300)) { exit 1 }

# --- 3) Calentar paginas ---
Write-Host "3/5 Calentando paginas (puede tardar un par de minutos)..." -ForegroundColor Cyan
$rutas = @("/mx", "/mx/store", "/mx/promociones", "/mx/sobre-nosotros", "/mx/contacto", "/mx/faq",
           "/mx/rastreo", "/mx/account", "/mx/cart", "/mx/products/maneral-man8000l",
           "/mx/categories/cables-y-sensores", "/mx/categories/equipo-medico", "/mx/store?q=sensor")
foreach ($r in $rutas) {
    try { Invoke-WebRequest "http://localhost:8000$r" -UseBasicParsing -TimeoutSec 180 | Out-Null; Write-Host "   ok  $r" } catch { Write-Host "   (omitida) $r" -ForegroundColor Yellow }
}

# --- 5) Que Windows no se duerma mientras corre ---
Add-Type -Namespace Demo -Name Suspension -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("kernel32.dll")]
public static extern uint SetThreadExecutionState(uint esFlags);
'@
# ES_CONTINUOUS | ES_SYSTEM_REQUIRED
[void][Demo.Suspension]::SetThreadExecutionState([uint32]2147483649)

# --- 4) Tunel ---
Write-Host "4/5 Abriendo el tunel..." -ForegroundColor Cyan
$log = Join-Path $env:TEMP "demo-tunel.log"
if (Test-Path $log) { Remove-Item $log -Force }
$proc = Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--no-autoupdate", "--url", "http://localhost:8000" `
    -RedirectStandardError $log -RedirectStandardOutput "$log.out" -WindowStyle Hidden -PassThru

$enlace = $null
for ($i = 0; $i -lt 40 -and -not $enlace; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Path $log) {
        $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
        if ($m) { $enlace = $m.Matches[0].Value }
    }
}
if (-not $enlace) {
    Write-Host "No se pudo obtener el enlace del tunel. Revisa tu internet." -ForegroundColor Red
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
    exit 1
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  ENLACE PUBLICO (mandalo a quien va a presentar):" -ForegroundColor Green
Write-Host ""
Write-Host "      $enlace/mx" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Mientras esta ventana siga abierta, el enlace funciona." -ForegroundColor Green
Write-Host "  Para TERMINAR: presiona Ctrl+C o cierra la ventana." -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "5/5 Listo. Windows no se dormira mientras el script este abierto."

try {
    # Se queda aqui hasta que el tunel se cierre o presiones Ctrl+C.
    while (-not $proc.HasExited) { Start-Sleep -Seconds 5 }
    Write-Host "El tunel se cerro inesperadamente." -ForegroundColor Red
}
finally {
    if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
    [void][Demo.Suspension]::SetThreadExecutionState([uint32]2147483648)  # ES_CONTINUOUS: vuelve a permitir dormir
    Write-Host "Tunel cerrado. El enlace ya no funciona." -ForegroundColor Cyan
}
