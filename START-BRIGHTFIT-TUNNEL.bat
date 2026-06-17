@echo off

cd /d "%~dp0BrightFit"

echo.

echo  Starting BrightFit with TUNNEL (works when LAN / QR fails)...

echo  Scan the QR code from inside the Expo Go app.

echo.

call npm run start:tunnel

pause

