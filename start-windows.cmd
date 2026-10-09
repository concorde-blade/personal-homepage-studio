@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing_node
where npm >nul 2>nul
if errorlevel 1 goto missing_node
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 goto missing_node
if exist "node_modules\next\dist\bin\next" goto launch
echo Installing dependencies for the first launch. Please wait...
call npm ci
if errorlevel 1 goto failed
:launch
node scripts\start-studio.mjs
if errorlevel 1 goto failed
exit /b 0
:missing_node
echo Install Node.js 22 or 24 LTS from https://nodejs.org/ and reopen this file.
pause
exit /b 1
:failed
echo Startup failed. Keep the error above and see docs\WINDOWS.md.
pause
exit /b 1
