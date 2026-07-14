@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set PORT=8000

set "CMD="
where python >nul 2>nul
if %errorlevel%==0 set "CMD=python"
if not defined CMD (
    where py >nul 2>nul
    if !errorlevel!==0 set "CMD=py"
)

if defined CMD (
    REM Windows sometimes aliases "python" to a non-functional Microsoft
    REM Store stub - make sure it actually runs before trusting it.
    %CMD% --version >nul 2>nul
    if !errorlevel! neq 0 set "CMD="
)

if defined CMD (
    echo Starting local server with %CMD% on port %PORT%...
    start "Python Quest Server" /min %CMD% -m http.server %PORT%
    goto :launch
)

where npx >nul 2>nul
if %errorlevel%==0 (
    echo Python not found - starting local server with npx serve on port %PORT%...
    start "Python Quest Server" /min npx --yes serve -l %PORT% .
    goto :launch
)

echo No Python or Node.js found - using the built-in Windows fallback server...
start "Python Quest Server" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port %PORT%

:launch
timeout /t 2 /nobreak >nul
start "" http://localhost:%PORT%/
echo.
echo Game running at http://localhost:%PORT%/
echo Close the "Python Quest Server" window (or press any key here) to stop.
pause >nul
taskkill /fi "WindowTitle eq Python Quest Server*" /t /f >nul 2>nul
goto :eof
