@echo off
echo ==========================================
echo      SpeseCasa Deployment Helper
echo ==========================================

:: Prompt for commit message
set /p msg="Enter commit message (Press Enter for 'Update'): "
if "%msg%"=="" set msg="Update"

echo.
echo [1/3] Adding files...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "%msg%"

echo.
echo [3/3] Pushing to GitHub...
git push

echo.
echo ==========================================
echo      Deployment Pushed Successfully!
echo ==========================================
pause
