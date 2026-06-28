@echo off
title Neri Shoes — Dev Server (localhost:3000)
cd /d "%~dp0"
echo.
echo  Starting Neri Shoes dev server...
echo  Open browser: http://localhost:3000
echo  Close this window to stop the server.
echo.
npm run dev
pause
