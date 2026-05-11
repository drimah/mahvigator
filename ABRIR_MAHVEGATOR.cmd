@echo off
setlocal
pushd "%~dp0"
title MAHVEGATOR V6
color 0D
echo.
echo =========================================
echo              MAHVEGATOR V6
echo =========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado.
  echo Baixe e instale em: https://nodejs.org
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: npm nao foi encontrado.
  echo Reinstale o Node.js.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Primeira execucao: instalando dependencias...
  echo Aguarde alguns minutos...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO durante npm install.
    pause
    exit /b 1
  )
)

echo Abrindo MAHVEGATOR...
call npm start

echo.
echo MAHVEGATOR fechado.
pause
popd
endlocal
