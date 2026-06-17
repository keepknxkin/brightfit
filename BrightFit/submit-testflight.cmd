@echo off
cd /d "%~dp0"
set EAS_NO_VCS=1
echo Submitting latest iOS build to TestFlight...
echo Use Apple ID: nathanowojori@gmail.com when prompted.
echo.
call npx eas-cli submit --platform ios --latest --wait
echo.
echo Done. Check App Store Connect ^> BrightFit ^> TestFlight.
pause
