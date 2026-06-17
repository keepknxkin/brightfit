@echo off
cd /d "%~dp0"
set EAS_NO_VCS=1
echo Building iOS production app (includes sign-in + splash fix)...
echo.
call npx eas-cli build --platform ios --profile production --non-interactive
if errorlevel 1 (
  echo.
  echo Build failed. Fix the error above and try again.
  pause
  exit /b 1
)
echo.
echo Submitting latest build to TestFlight...
echo Use Apple ID: nathanowojori@gmail.com when prompted.
echo.
call npx eas-cli submit --platform ios --latest --wait
echo.
echo Done. Check App Store Connect ^> BrightFit ^> TestFlight.
pause
