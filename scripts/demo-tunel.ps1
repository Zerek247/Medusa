# DEMO DE UN DIA: enciende todo y abre enlaces publicos TEMPORALES.
#
# Uso (en PowerShell, desde la carpeta del repositorio):
#   Solo la tienda:
#     powershell -ExecutionPolicy Bypass -File .\scripts\demo-tunel.ps1
#   Tienda + panel de administracion:
#     powershell -ExecutionPolicy Bypass -File .\scripts\demo-tunel.ps1 -ConPanel
#
# Antes: abre Docker Desktop y espera a que diga "Engine running".
#
# Que hace:
#   1. Verifica que Docker este corriendo y levanta los contenedores.
#   2. Espera a que el backend y la tienda respondan.
#   3. "Calienta" las paginas principales (la primera visita a cada pagina del
#      servidor de desarrollo tarda unos segundos; asi la demo va fluida).
#   4. Con -ConPanel: crea (una sola vez) un usuario admin SOLO para la demo,
#      con contrasena aleatoria fuerte guardada en scripts\demo-admin.local.txt
#      (archivo que git ignora). NO se usa el admin de pruebas del README.
#   5. Abre un tunel de Cloudflare hacia la tienda (puerto 8000) y, con
#      -ConPanel, otro hacia el panel (puerto 9000), e imprime los enlaces.
#   6. Evita que Windows se duerma mientras el script este abierto.
#
# Para terminar: Ctrl+C (o cierra la ventana). Los enlaces dejan de funcionar y
# no queda nada publicado.
#
# IMPORTANTE:
#   - Sin -ConPanel el panel de administracion NO se publica.
#   - Con -ConPanel, quien tenga el enlace del panel Y la contrasena puede
#     editar/borrar datos de la tienda LOCAL de pruebas. Bind no se toca
#     (la escritura hacia Bind esta bloqueada).
#   - La clave de Bind se queda en esta PC; nunca viaja por el tunel.

param([switch]$ConPanel)

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
Write-Host "1/6 Revisando Docker..." -ForegroundColor Cyan
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker no esta corriendo. Abre Docker Desktop, espera a que diga 'Engine running' y vuelve a ejecutar este script." -ForegroundColor Red
    exit 1
}
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Host "No se pudieron levantar los contenedores." -ForegroundColor Red; exit 1 }

# --- Contrasena del admin de pruebas (admin@local.test) ---
# Es la del README (debil a proposito, solo para uso local). Mientras el panel
# esta publicado por el tunel se cambia por una aleatoria y al terminar se
# restaura, para que nadie pueda entrar al panel probando la contrasena del README.
$adminPruebasCorreo = "admin@local.test"
$adminPruebasClaveLocal = "medusa_dev_admin"
$archivoEndurecido = Join-Path $PSScriptRoot "demo-admin-endurecido.local.txt"

function Cambiar-ClaveAdmin($correo, $clave) {
    $previo = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $salida = docker compose exec -T -e "ADMIN_EMAIL=$correo" -e "NUEVA_CLAVE=$clave" backend sh -c "cd apps/backend && npx medusa exec ./src/scripts/admin-clave.ts" 2>&1 | Out-String
    $ErrorActionPreference = $previo
    return ($salida -match "ADMIN_CLAVE_OK")
}

# Si una ejecucion anterior se cerro a la fuerza sin restaurar, se restaura ahora.
if (Test-Path $archivoEndurecido) {
    Write-Host "   Restaurando la contrasena del admin de pruebas (quedo cambiada en una demo anterior)..." -ForegroundColor Yellow
}

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
Write-Host "2/6 Esperando al backend y a la tienda..." -ForegroundColor Cyan
if (-not (Esperar-Url "http://localhost:9000/health" "El backend" 300)) { exit 1 }
if (-not (Esperar-Url "http://localhost:8000/mx" "La tienda" 300)) { exit 1 }
if (Test-Path $archivoEndurecido) {
    if (Cambiar-ClaveAdmin $adminPruebasCorreo $adminPruebasClaveLocal) { Remove-Item $archivoEndurecido -Force; Write-Host "   Contrasena de pruebas restaurada." }
}

# --- 3) Calentar paginas ---
Write-Host "3/6 Calentando paginas (puede tardar un par de minutos)..." -ForegroundColor Cyan
$rutas = @("/mx", "/mx/store", "/mx/promociones", "/mx/sobre-nosotros", "/mx/contacto", "/mx/faq",
           "/mx/rastreo", "/mx/account", "/mx/cart", "/mx/products/maneral-man8000l",
           "/mx/categories/cables-y-sensores", "/mx/categories/equipo-medico", "/mx/store?q=sensor")
foreach ($r in $rutas) {
    try { Invoke-WebRequest "http://localhost:8000$r" -UseBasicParsing -TimeoutSec 180 | Out-Null; Write-Host "   ok  $r" } catch { Write-Host "   (omitida) $r" -ForegroundColor Yellow }
}

# --- 4) Admin de la demo (solo con -ConPanel) ---
$adminCorreo = "demo-admin@biobackup.mx"
$adminClave = $null
$archivoClave = Join-Path $PSScriptRoot "demo-admin.local.txt"
if ($ConPanel) {
    Write-Host "4/6 Preparando el usuario admin de la demo..." -ForegroundColor Cyan
    if (Test-Path $archivoClave) {
        $adminClave = (Get-Content $archivoClave -Raw).Trim()
    } else {
        # Contrasena aleatoria de 24 caracteres (solo letras y numeros, sin simbolos conflictivos)
        $caracteres = (48..57) + (65..90) + (97..122)
        $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
        $bytes = New-Object byte[] 24
        $rng.GetBytes($bytes)
        $adminClave = -join ($bytes | ForEach-Object { [char]$caracteres[$_ % $caracteres.Count] })
        # npm escribe avisos por stderr; con ErrorActionPreference=Stop PowerShell los
        # tomaria como error. Se ejecuta con "Continue" y se mira el codigo de salida.
        $previo = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        docker compose exec -T backend sh -c "cd apps/backend && npx medusa user -e $adminCorreo -p $adminClave" 2>&1 | Out-Null
        $codigoUsuario = $LASTEXITCODE
        $ErrorActionPreference = $previo
        if ($codigoUsuario -ne 0) {
            Write-Host "No se pudo crear el usuario $adminCorreo (quiza ya existia). Borralo desde el panel (Settings > Users) y vuelve a correr el script." -ForegroundColor Red
            exit 1
        }
        Set-Content -Path $archivoClave -Value $adminClave -Encoding ASCII
        Write-Host "   Usuario creado. Contrasena guardada en scripts\demo-admin.local.txt (git la ignora)."
    }
} else {
    Write-Host "4/6 (sin panel: ejecuta con -ConPanel si tambien quieres publicar el panel)" -ForegroundColor DarkGray
}

# --- 6) Que Windows no se duerma mientras corre ---
Add-Type -Namespace Demo -Name Suspension -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("kernel32.dll")]
public static extern uint SetThreadExecutionState(uint esFlags);
'@
# ES_CONTINUOUS | ES_SYSTEM_REQUIRED
[void][Demo.Suspension]::SetThreadExecutionState([uint32]2147483649)

# --- 5) Tuneles ---
function Abrir-Tunel($puerto, $nombre) {
    $log = Join-Path $env:TEMP "demo-tunel-$nombre.log"
    if (Test-Path $log) { Remove-Item $log -Force }
    $p = Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--no-autoupdate", "--url", "http://localhost:$puerto" `
        -RedirectStandardError $log -RedirectStandardOutput "$log.out" -WindowStyle Hidden -PassThru
    $enlace = $null
    for ($i = 0; $i -lt 40 -and -not $enlace; $i++) {
        Start-Sleep -Seconds 2
        if (Test-Path $log) {
            $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
            if ($m) { $enlace = $m.Matches[0].Value }
        }
    }
    return @{ Proceso = $p; Enlace = $enlace }
}

$adminEndurecido = $false
if ($ConPanel) {
    Write-Host "   Protegiendo el admin de pruebas mientras el panel este publico..." -ForegroundColor Cyan
    $caracteres2 = (48..57) + (65..90) + (97..122)
    $rng2 = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $bytes2 = New-Object byte[] 24
    $rng2.GetBytes($bytes2)
    $claveTemporal = -join ($bytes2 | ForEach-Object { [char]$caracteres2[$_ % $caracteres2.Count] })
    # Primero se deja la marca (por si algo falla a medias), luego se cambia.
    Set-Content -Path $archivoEndurecido -Value "restaurar-a-clave-de-pruebas" -Encoding ASCII
    if (Cambiar-ClaveAdmin $adminPruebasCorreo $claveTemporal) {
        $adminEndurecido = $true
    } else {
        Write-Host "No se pudo proteger el admin de pruebas. NO se publica el panel." -ForegroundColor Red
        [void](Cambiar-ClaveAdmin $adminPruebasCorreo $adminPruebasClaveLocal)
        Remove-Item $archivoEndurecido -Force -ErrorAction SilentlyContinue
        exit 1
    }
}

Write-Host "5/6 Abriendo los tuneles..." -ForegroundColor Cyan
$tiendaT = Abrir-Tunel 8000 "tienda"
$panelT = $null
if ($ConPanel) { $panelT = Abrir-Tunel 9000 "panel" }

function Cerrar-Todo {
    foreach ($t in @($tiendaT, $panelT)) {
        if ($t -and $t.Proceso -and -not $t.Proceso.HasExited) { Stop-Process -Id $t.Proceso.Id -Force }
    }
    [void][Demo.Suspension]::SetThreadExecutionState([uint32]2147483648)  # ES_CONTINUOUS: vuelve a permitir dormir
    if ($adminEndurecido) {
        if (Cambiar-ClaveAdmin $adminPruebasCorreo $adminPruebasClaveLocal) {
            Remove-Item $archivoEndurecido -Force -ErrorAction SilentlyContinue
            Write-Host "Contrasena del admin de pruebas restaurada." -ForegroundColor Cyan
        } else {
            Write-Host "OJO: no se pudo restaurar la contrasena de admin@local.test. Entra al panel con demo-admin (ver scripts\demo-admin.local.txt) o vuelve a correr este script." -ForegroundColor Yellow
        }
    }
}

if (-not $tiendaT.Enlace -or ($ConPanel -and -not $panelT.Enlace)) {
    Write-Host "No se pudo obtener el enlace de un tunel. Revisa tu internet." -ForegroundColor Red
    Cerrar-Todo
    exit 1
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  TIENDA (mandalo a quien va a presentar):" -ForegroundColor Green
Write-Host ""
Write-Host "      $($tiendaT.Enlace)/mx" -ForegroundColor Yellow
if ($ConPanel) {
    Write-Host ""
    Write-Host "  PANEL DE ADMINISTRACION:" -ForegroundColor Green
    Write-Host ""
    Write-Host "      $($panelT.Enlace)/panel" -ForegroundColor Yellow
    Write-Host "      Correo:     $adminCorreo" -ForegroundColor Yellow
    Write-Host "      Contrasena: $adminClave" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  (La contrasena tambien esta en scripts\demo-admin.local.txt)" -ForegroundColor Green
    Write-Host "  El panel permite EDITAR y BORRAR datos de la tienda de pruebas." -ForegroundColor Green
}
Write-Host ""
Write-Host "  Mientras esta ventana siga abierta, los enlaces funcionan." -ForegroundColor Green
Write-Host "  Para TERMINAR: presiona Ctrl+C o cierra la ventana." -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "6/6 Listo. Windows no se dormira mientras el script este abierto."

try {
    # Se queda aqui hasta que un tunel se cierre o presiones Ctrl+C.
    while (-not $tiendaT.Proceso.HasExited -and (-not $ConPanel -or -not $panelT.Proceso.HasExited)) { Start-Sleep -Seconds 5 }
    Write-Host "Un tunel se cerro inesperadamente." -ForegroundColor Red
}
finally {
    Cerrar-Todo
    Write-Host "Tuneles cerrados. Los enlaces ya no funcionan." -ForegroundColor Cyan
}
