@echo off
echo ========================================
echo   Coffee Shop Project Cleanup Script
echo ========================================
echo.

echo Cleaning up temporary files and caches...

REM Clean node_modules (optional - uncomment if needed)
REM echo Removing node_modules directories...
REM for /d /r . %%d in (node_modules) do @if exist "%%d" rd /s /q "%%d"

echo Cleaning npm cache...
npm cache clean --force 2>nul

echo Cleaning temporary files...
if exist "tmp\" rd /s /q "tmp\"
if exist "temp\" rd /s /q "temp\"
if exist ".temp\" rd /s /q ".temp\"

echo Cleaning log files...
del /s /q "*.log" 2>nul
if exist "logs\" rd /s /q "logs\"

echo Cleaning cache directories...
if exist ".cache\" rd /s /q ".cache\"
if exist ".parcel-cache\" rd /s /q ".parcel-cache\"
if exist ".npm\" rd /s /q ".npm\"

echo Cleaning build outputs...
if exist "dist\" rd /s /q "dist\"
if exist "build\" rd /s /q "build\"

echo Cleaning backup files...
del /s /q "*.bak" 2>nul
del /s /q "*.backup" 2>nul
del /s /q "*.old" 2>nul
del /s /q "*.tmp" 2>nul

echo Cleaning OS generated files...
del /s /q "Thumbs.db" 2>nul
del /s /q ".DS_Store" 2>nul

echo Cleaning frontend specific files...
cd front-end
if exist "dist\" rd /s /q "dist\"
if exist ".vite\" rd /s /q ".vite\"
cd ..

echo.
echo ========================================
echo   Project Cleanup Completed!
echo ========================================
echo.
echo The following items have been cleaned:
echo - Temporary files and directories
echo - Log files
echo - Cache directories  
echo - Build outputs
echo - Backup files
echo - OS generated files
echo.
echo Note: node_modules directories were preserved.
echo To remove them, uncomment the relevant lines in this script.
echo.
pause
