@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Калькулятор Daogreen — локальный сервер
echo  Откройте в браузере:
echo.
echo    http://localhost:8080/
echo    http://localhost:8080/calculator-110x55_12.html
echo.
echo  В правом нижнем углу должна быть зелёная плашка: Сборка 2026-06-06-econ-area-mode
echo  Сборка/проверка: npm run build
echo  PWA: установка из браузера (Chrome) после открытия по http://localhost:8080
echo  Хостинг: см. HOSTING.md
echo  На вкладке ПОДДОНЫ при движении ползунка число растений на плашке меняется.
echo.
npx --yes serve -p 8080
pause
