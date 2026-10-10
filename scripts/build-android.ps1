# Build the Android release APK locally and (optionally) install it on a connected phone.
# Usage (from the repo root, in PowerShell):
#   .\scripts\build-android.ps1            # prebuild if needed, build, install, launch
#   .\scripts\build-android.ps1 -Prebuild  # regenerate android/ from app.config.ts first
#   .\scripts\build-android.ps1 -NoInstall # build only
param(
  [switch]$Prebuild,
  [switch]$NoInstall
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

# React Native 0.85's Gradle tooling needs JDK 17 (jvmToolchain(17)). Prefer a JDK 17 in ~/.jdks;
# with only Android Studio's JDK 25, Gradle tries to auto-download 17 via an old plugin that
# crashes on Gradle 9 ("JvmVendorSpec ... IBM_SEMERU").
$jdk17 = Get-ChildItem (Join-Path $env:USERPROFILE '.jdks') -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
if ($jdk17) { $env:JAVA_HOME = $jdk17.FullName }
elseif (-not $env:JAVA_HOME) { $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr' }
Write-Host "==> Using JDK at $env:JAVA_HOME" -ForegroundColor Cyan
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
$adb = Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe'

if ($Prebuild -or -not (Test-Path 'android\gradlew.bat')) {
  Write-Host '==> Generating android/ from app.config.ts' -ForegroundColor Cyan
  npx expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) { throw 'expo prebuild failed' }
}
# Gradle needs to know where the SDK is.
"sdk.dir=$($env:ANDROID_HOME -replace '\\','/')" | Set-Content -Encoding ascii 'android\local.properties'

Write-Host '==> Building release APK (first run downloads dependencies, ~10 min)' -ForegroundColor Cyan
Push-Location android
try {
  .\gradlew.bat assembleRelease --console=plain
  if ($LASTEXITCODE -ne 0) { throw 'Gradle build failed' }
} finally { Pop-Location }

$apk = Resolve-Path 'android\app\build\outputs\apk\release\app-release.apk'
$sizeMb = [math]::Round((Get-Item $apk).Length / 1MB, 1)
Write-Host "==> Built $apk ($sizeMb MB)" -ForegroundColor Green

if ($NoInstall) { return }
$devices = & $adb devices | Select-String -Pattern "`tdevice$"
if (-not $devices) { Write-Host 'No phone connected (adb devices). Skipping install.' -ForegroundColor Yellow; return }
Write-Host '==> Installing on the connected phone' -ForegroundColor Cyan
& $adb install -r $apk
if ($LASTEXITCODE -ne 0) { throw 'adb install failed' }
& $adb shell monkey -p app.halalhabits.mobile -c android.intent.category.LAUNCHER 1 | Out-Null
Write-Host '==> Halal Habit installed and launched' -ForegroundColor Green
