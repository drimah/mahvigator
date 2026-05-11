#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo ""
echo "========================================="
echo "              MAHVEGATOR V6 LINUX"
echo "========================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "ERRO: Node.js não foi encontrado."
  echo "Instale com:"
  echo "Ubuntu/Debian: sudo apt install nodejs npm"
  echo "Fedora: sudo dnf install nodejs npm"
  echo "Arch: sudo pacman -S nodejs npm"
  read -p "Pressione Enter para sair..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERRO: npm não foi encontrado."
  read -p "Pressione Enter para sair..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Primeira execução: instalando dependências..."
  npm install
fi

echo "Abrindo MAHVEGATOR..."
npm start
