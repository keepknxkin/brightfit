@echo off
:: Right-click this file and choose "Run as administrator"
echo Adding Windows Firewall rule for Expo (port 8081)...
netsh advfirewall firewall delete rule name="BrightFit Expo 8081" >nul 2>&1
netsh advfirewall firewall add rule name="BrightFit Expo 8081" dir=in action=allow protocol=TCP localport=8081
netsh advfirewall firewall add rule name="BrightFit Expo Node" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
echo.
echo Done. Now double-click START-BRIGHTFIT.bat and scan the QR code again.
echo.
pause
