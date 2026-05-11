@echo off
setlocal
pushd "%~dp0"
title GERAR EXE - MAHVEGATOR V7
color 0B

echo.
echo =========================================
echo       GERAR INSTALADOR MAHVEGATOR
echo =========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado.
  echo Instale o Node.js LTS em: https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo ERRO durante npm install.
    pause
    exit /b 1
  )
)

call npm run build:win

echo.
echo Finalizado. Veja a pasta DIST.
pause
popd
endlocal
