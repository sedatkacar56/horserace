echo ✓ Bismillahirrahmanirrahim
echo.
@echo off

:: Go to project folder
cd /d "C:\Users\skacar\Documents\horse_race\horserace_organizes" || (
    echo ❌ Folder not found!
    pause
    exit /b
)

echo ✓ Folder OK
echo.

:: Stop any old server on port 8002
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8002 " ^| findstr LISTENING') do (
    if not "%%p"=="0" taskkill /PID %%p /F >nul 2>&1
)

:: Start Python server
if exist "C:\Users\skacar\AppData\Local\Programs\Python\Python313\python.exe" (
    set PY="C:\Users\skacar\AppData\Local\Programs\Python\Python313\python.exe"
) else (
    set PY=python
)

start "" %PY% -m http.server 8002
timeout /t 3 >nul

:: Cache-buster
set VERSION=%RANDOM%
echo Loading fresh copy (v=%VERSION%)

:: Open browser
start "" "http://localhost:8002/index.html?v=%VERSION%"

echo.
echo ✓ Elhamdulillah
pause
