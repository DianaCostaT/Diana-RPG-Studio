@echo off
setlocal
cd /d "%~dp0"
call npm run prepare:editor
if errorlevel 1 (
    echo Falha ao preparar o Diana. Consulte a mensagem acima.
    pause
    exit /b 1
)
call npm start
if errorlevel 1 (
    echo Falha ao iniciar o Diana. Consulte a mensagem acima.
    pause
    exit /b 1
)
