@echo off
setlocal
pushd "%~dp0"
title GERAR EXE - MAHVEGATOR
color 0B

echo.
echo =========================================
echo       GERAR INSTALADOR MAHVEGATOR
echo =========================================
echo.
echo [1] Windows (EXE)
echo [2] Linux (AppImage)
echo.
set /p opcao="Digite 1 ou 2: "

if "%opcao%"=="1" goto windows
if "%opcao%"=="2" goto linux
echo Opcao invalida!
pause
exit /b 1

:windows
echo.
echo Gerando instalador para WINDOWS...
call :build
npm run build:win
goto fim

:linux
echo.
echo Gerando instalador para LINUX...
call :build
npm run build:linux
goto fim

:build
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
exit /b 0

:fim
if errorlevel 1 (
  echo.
  echo ERRO ao gerar o executavel.
  pause
  exit /b 1
)

echo.
echo =========================================
echo       SUCESSO!
if "%opcao%"=="1" echo       Executavel em: dist\*.exe
if "%opcao%"=="2" echo       Executavel em: dist\*.AppImage
echo =========================================
echo.
explorer dist

pause
popd
endlocal