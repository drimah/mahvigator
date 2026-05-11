#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo ""
echo "========================================="
echo "       GERAR APP LINUX - MAHVEGATOR"
echo "========================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "ERRO: Node.js não foi encontrado."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Instalando dependências..."
  npm install
fi

npm run build:linux

echo ""
echo "Finalizado. Veja a pasta dist."
