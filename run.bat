@echo off
title DigitPro Time Management App
echo ==============================================
echo    DigitPro Time Management App - PWA         
echo ==============================================
echo.
echo Starting the application...
echo.
echo Once the server starts, it will open in your default browser.
echo You can then use it on your mobile phone by finding your PC's IP address.
echo.

start http://localhost:5173
npm run dev

pause
