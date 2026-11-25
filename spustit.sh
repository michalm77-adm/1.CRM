#!/usr/bin/env bash
# Spuštění CRM na macOS / Linuxu
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Nainstalujte Node.js (LTS) z https://nodejs.org"; exit 1; }
[ -f .env ] || { cp .env.example .env; echo "Vytvořen .env – změňte v něm hesla a spusťte znovu."; exit 0; }
[ -d node_modules ] || npm install
[ -f prisma/crm.db ] || npm run setup
echo "CRM běží na http://localhost:3000 (ukončení Ctrl+C)"
npm run dev
