@echo off
echo Bismillahirrahmanirrahim
setlocal enabledelayedexpansion
echo.
REM Path to your Python script
set PY_SCRIPT=C:\Users\skacar\Documents\horse_race\horse_race_functions\folder_tree.py
REM Folder you want to scan (the target folder)
set TARGET_FOLDER=C:\Users\skacar\Documents\horse_race\horserace_organizes
echo Running folder tree for:
echo "%TARGET_FOLDER%"
echo.
python "%PY_SCRIPT%" %TARGET_FOLDER%
echo.
echo Elhamdulillah ✓ Done.
pause