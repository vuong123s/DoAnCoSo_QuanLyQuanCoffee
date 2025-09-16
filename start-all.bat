@echo off
echo Starting Coffee Shop Application...

echo.
echo [1/6] Starting User Service...
start "User Service" cmd /k "cd /d services\user-service && npm install && npm run dev"
timeout /t 3

echo [2/6] Starting Menu Service...
start "Menu Service" cmd /k "cd /d services\menu-service && npm install && npm run dev"
timeout /t 3

echo [3/6] Starting Table Service...
start "Table Service" cmd /k "cd /d services\table-service && npm install && npm run dev"
timeout /t 3

echo [4/6] Starting Billing Service...
start "Billing Service" cmd /k "cd /d services\billing-service && npm install && npm run dev"
timeout /t 3

echo [5/6] Starting API Gateway...
start "API Gateway" cmd /k "cd /d api-gateway && npm install && npm run dev"
timeout /t 5

echo [6/6] Starting Frontend...
start "Frontend" cmd /k "cd /d front-end && npm install && npm run dev"

echo.
echo All services are starting...
echo Frontend: http://localhost:5173
echo API Gateway: http://localhost:3000
echo.
pause
