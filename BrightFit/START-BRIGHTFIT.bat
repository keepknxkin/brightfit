@echo off
cd /d "c:\Users\881de\Downloads\BrightFit\BrightFit"
echo.
echo  ========================================
echo   BrightFit - Expo Go
echo  ========================================
echo.
echo  IMPORTANT - DO NOT use iPhone Camera / Photos!
echo  1. Open the EXPO GO app on your phone
echo  2. Tap "Scan QR code" INSIDE Expo Go
echo  3. Scan the QR code shown below
echo.
echo  Phone + PC must be on the SAME Wi-Fi.
echo.
"C:\Program Files\nodejs\npx.cmd" expo start --go --lan --clear
pause
