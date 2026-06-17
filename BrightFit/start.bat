@echo off

cd /d "%~dp0"

echo.

echo  Starting BrightFit for Expo Go...

echo.

echo  If you see "problem opening the requested app":

echo    1. Phone and PC must be on the SAME Wi-Fi, OR

echo    2. Run: npm run start:tunnel   (works on any network)

echo    3. Right-click ALLOW-FIREWALL.bat ^> Run as administrator

echo    4. Open the link inside the Expo Go app (not only Camera)

echo.

"C:\Program Files\nodejs\npm.cmd" run start:clear

pause

