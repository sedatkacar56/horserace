@echo off
echo Bismillahirrahmanirrahim
echo.

:: OPTIONAL: always go to your project folder
cd /d "C:\Users\skacar\Documents\horse_race\horserace_organizes"

:LOOP
echo --------------------------------------------
echo Enter keyword to search (or type EXIT to quit):
set /p KEYWORD=Search: 

if /I "%KEYWORD%"=="EXIT" goto END
if "%KEYWORD%"=="" goto LOOP

echo.
echo Searching for "%KEYWORD%" in JS and HTML files...
echo --------------------------------------------

findstr /S /I /N /C:"%KEYWORD%" *.js *.html

echo.
echo --------------------------------------------
echo Search finished. Type another word.
echo --------------------------------------------
echo.

goto LOOP

:END
echo Elhamdulillah. Exiting...
pause
