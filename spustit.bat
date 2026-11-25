@echo off
cd /d "%~dp0"
title CRM 2M elektro

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js neni nainstalovany. Stahnete verzi LTS z https://nodejs.org, nainstalujte ji a spustte tento soubor znovu.
  start "" https://nodejs.org
  pause
  exit /b 1
)

if not exist .env (
  copy .env.example .env >nul
  echo Vytvoril jsem soubor .env s nastavenim. Prihlaseni: admin / admin. Soubor muzete jen zavrit.
  notepad .env
)

if not exist node_modules (
  echo Instaluji knihovny, prvni spusteni muze trvat nekolik minut...
  call npm install
  if errorlevel 1 goto chyba
)

if not exist prisma\crm.db (
  echo Zakladam databazi a uzivatele...
  call npm run setup
  if errorlevel 1 goto chyba
)

echo.
echo CRM bezi na http://localhost:3000  (okno nezavirejte, ukonceni: Ctrl+C)
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
goto :eof

:chyba
echo.
echo Neco se nepovedlo, zkopirujte prosim text vyse a poslete ho.
pause
