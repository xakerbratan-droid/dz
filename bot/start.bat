@echo off
echo ========================================
echo   Запуск бота ДЗ и ГДЗ
echo ========================================
echo.

REM Проверяем, установлены ли зависимости
if not exist "node_modules" (
    echo Устанавливаем зависимости...
    npm install
    echo.
)

echo Запускаем бота...
node server.js

pause
