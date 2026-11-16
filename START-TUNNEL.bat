@echo off
title Barangay San Jose - HTTPS TUNNEL (para sa PWA install sa phone)
echo ============================================
echo   BARANGAY SAN JOSE - HTTPS TUNNEL
echo ============================================
echo.
echo Ginagawa nito: binubuksan ang HTTPS link para
echo ma-install ang app bilang PWA sa phone mo.
echo.

:: Isara ang lumang tunnel kung mayroon
taskkill /IM cloudflared.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

:: Burahin ang lumang log
del "C:\Users\Mico\Desktop\CaptoneSystem\tools\tunnel.log" >nul 2>&1
del "C:\Users\Mico\Desktop\CaptoneSystem\tools\tunnel-err.log" >nul 2>&1

:: Buksan ang tunnel sa background
start "" /min "C:\Users\Mico\Desktop\CaptoneSystem\tools\cloudflared.exe" tunnel --url http://localhost:5173 --loglevel info > "C:\Users\Mico\Desktop\CaptoneSystem\tools\tunnel.log" 2>&1

echo Hinihintay ang tunnel...
timeout /t 12 /nobreak >nul

echo.
echo ============================================
echo   ITO ANG HTTPS LINK MO (i-type sa phone):
echo ============================================
findstr "trycloudflare.com" "C:\Users\Mico\Desktop\CaptoneSystem\tools\tunnel.log" | findstr /C:"https://"
echo ============================================
echo.
echo PAALALA:
echo  1. I-type ang link sa browser ng phone (Chrome/Safari)
echo  2. Android: menu (⋮) -^> "Add to Home screen" / "Install app"
echo  3. iPhone: Share -^> "Add to Home Screen"
echo  4. HUWAG isara ang cloudflared window habang gumagamit.
echo  5. Kapag nag-restart ang tunnel, MAG-IIBA ang URL -^>
echo     i-run muli ito at kopyahin ang bagong link.
echo.
pause
