@echo off
title Barangay San Jose System - Launcher
echo ============================================
echo   BARANGAY SAN JOSE SYSTEM - LAUNCHER
echo ============================================
echo.
echo Bubuksan ang 3 window:
echo   1. BACKEND  (port 3001)
echo   2. WEB APP  (port 5173)
echo   3. PROMO    (port 5174)
echo.
echo Huwag isara ang mga window habang gumagamit.
echo.

cd /d "C:\Users\Mico\Desktop\CaptoneSystem\backend"
start "BACKEND (huwag isara)" cmd /k "npm start"

cd /d "C:\Users\Mico\Desktop\CaptoneSystem\barangay-web"
start "WEB APP (huwag isara)" cmd /k "npm run dev"

cd /d "C:\Users\Mico\Desktop\CaptoneSystem\barangay-promo"
start "PROMO (huwag isara)" cmd /k "npm run dev"

timeout /t 7 /nobreak >nul

start http://localhost:5174
start http://localhost:5173

echo.
echo Bumukas na ang browser:
echo   PROMO SITE : http://localhost:5174
echo   WEB APP    : http://localhost:5173
echo.
echo I-click ang window na ito at pindutin ang kahit anong key para isara.
pause >nul
