@echo off
cd /d "%~dp0\.."
echo ========================================
echo   Coffee Shop Microservices Launcher
echo ========================================
echo.
echo Starting all services automatically...
echo.

echo [1/6] Starting API Gateway (Port 3000)...
start "API Gateway - Port 3000" cmd /c "cd api-gateway && npm run dev"
timeout /t 3 >nul

echo [2/6] Starting User Service (Port 3001)...
start "User Service - Port 3001" cmd /c "cd services\user-service && npm run dev"
timeout /t 2 >nul

echo [3/6] Starting Menu Service (Port 3002)...
start "Menu Service - Port 3002" cmd /c "cd services\menu-service && npm run dev"
timeout /t 2 >nul

echo [4/6] Starting Table Service (Port 3003)...
start "Table Service - Port 3003" cmd /c "cd services\table-service && npm run dev"
timeout /t 2 >nul

echo [5/6] Starting Billing Service (Port 3004)...
start "Billing Service - Port 3004" cmd /c "cd services\billing-service && npm run dev"
timeout /t 2 >nul
 


echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo Services are running on:
echo   API Gateway:        http://localhost:3000
echo   User Service:       http://localhost:3001
echo   Menu Service:       http://localhost:3002
echo   Table Service:      http://localhost:3003
echo   Billing Service:    http://localhost:3004
echo   Online Order:       http://localhost:3005
echo   Voucher Service:    http://localhost:3006
echo   Inventory Service:  http://localhost:3007
echo.
echo Health Check: http://localhost:3000/health
echo.
echo Starting Frontend in 5 seconds...
timeout /t 5 >nul

echo Starting Frontend (Port 5173)...
start "Frontend - Port 5173" cmd /c "cd front-end && npm run dev"

echo.
echo ========================================
echo   Coffee Shop System Ready!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo API:      http://localhost:3000
echo.
echo All services are running in separate windows.
echo Close this window when you're done.
echo.
