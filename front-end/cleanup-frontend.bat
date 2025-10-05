@echo off
echo ========================================
echo   Frontend Cleanup Script
echo ========================================
echo.

echo Cleaning frontend cache and temporary files...

REM Clean npm cache
echo Cleaning npm cache...
npm cache clean --force 2>nul

REM Clean build outputs
echo Cleaning build outputs...
if exist "dist\" rd /s /q "dist\"
if exist "dist-ssr\" rd /s /q "dist-ssr\"
if exist "build\" rd /s /q "build\"

REM Clean cache directories
echo Cleaning cache directories...
if exist ".cache\" rd /s /q ".cache\"
if exist ".parcel-cache\" rd /s /q ".parcel-cache\"
if exist ".vite\" rd /s /q ".vite\"

REM Clean log files
echo Cleaning log files...
del /s /q "*.log" 2>nul
if exist "logs\" rd /s /q "logs\"

REM Clean temporary files
echo Cleaning temporary files...
del /s /q "*.tmp" 2>nul
del /s /q "*.temp" 2>nul
del /s /q "*.local" 2>nul

REM Clean OS generated files
echo Cleaning OS generated files...
del /s /q "Thumbs.db" 2>nul
del /s /q ".DS_Store" 2>nul

REM Clean ESLint cache
echo Cleaning ESLint cache...
del /s /q ".eslintcache" 2>nul

echo.
echo ========================================
echo   Frontend Cleanup Completed!
echo ========================================
echo.
echo Cleaned items:
echo - Build outputs (dist, build)
echo - Cache directories
echo - Log files
echo - Temporary files
echo - OS generated files
echo - ESLint cache
echo.
echo Note: node_modules was preserved.
echo To reinstall dependencies, run: npm install
echo.
pause
