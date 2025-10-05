@echo off
echo Creating .env files for all services...

REM User Service (Port 3001)
echo PORT=3001 > services\user-service\.env
echo # Database Configuration >> services\user-service\.env
echo DB_HOST=localhost >> services\user-service\.env
echo DB_PORT=3306 >> services\user-service\.env
echo DB_NAME=QuanLyCafe >> services\user-service\.env
echo DB_USER=root >> services\user-service\.env
echo DB_PASSWORD= >> services\user-service\.env
echo. >> services\user-service\.env
echo # Server Configuration >> services\user-service\.env
echo NODE_ENV=development >> services\user-service\.env
echo. >> services\user-service\.env
echo # JWT Configuration >> services\user-service\.env
echo JWT_SECRET=your-jwt-secret-key >> services\user-service\.env
echo. >> services\user-service\.env
echo # CORS Configuration >> services\user-service\.env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173 >> services\user-service\.env

REM Menu Service (Port 3002)
echo PORT=3002 > services\menu-service\.env
echo # Database Configuration >> services\menu-service\.env
echo DB_HOST=localhost >> services\menu-service\.env
echo DB_PORT=3306 >> services\menu-service\.env
echo DB_NAME=QuanLyCafe >> services\menu-service\.env
echo DB_USER=root >> services\menu-service\.env
echo DB_PASSWORD= >> services\menu-service\.env
echo. >> services\menu-service\.env
echo # Server Configuration >> services\menu-service\.env
echo NODE_ENV=development >> services\menu-service\.env
echo. >> services\menu-service\.env
echo # JWT Configuration >> services\menu-service\.env
echo JWT_SECRET=your-jwt-secret-key >> services\menu-service\.env
echo. >> services\menu-service\.env
echo # CORS Configuration >> services\menu-service\.env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173 >> services\menu-service\.env

REM Table Service (Port 3003)
echo PORT=3003 > services\table-service\.env
echo # Database Configuration >> services\table-service\.env
echo DB_HOST=localhost >> services\table-service\.env
echo DB_PORT=3306 >> services\table-service\.env
echo DB_NAME=QuanLyCafe >> services\table-service\.env
echo DB_USER=root >> services\table-service\.env
echo DB_PASSWORD= >> services\table-service\.env
echo. >> services\table-service\.env
echo # Server Configuration >> services\table-service\.env
echo NODE_ENV=development >> services\table-service\.env
echo. >> services\table-service\.env
echo # JWT Configuration >> services\table-service\.env
echo JWT_SECRET=your-jwt-secret-key >> services\table-service\.env
echo. >> services\table-service\.env
echo # CORS Configuration >> services\table-service\.env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173 >> services\table-service\.env

REM Billing Service (Port 3004)
echo PORT=3004 > services\billing-service\.env
echo # Database Configuration >> services\billing-service\.env
echo DB_HOST=localhost >> services\billing-service\.env
echo DB_PORT=3306 >> services\billing-service\.env
echo DB_NAME=QuanLyCafe >> services\billing-service\.env
echo DB_USER=root >> services\billing-service\.env
echo DB_PASSWORD= >> services\billing-service\.env
echo. >> services\billing-service\.env
echo # Server Configuration >> services\billing-service\.env
echo NODE_ENV=development >> services\billing-service\.env
echo. >> services\billing-service\.env
echo # JWT Configuration >> services\billing-service\.env
echo JWT_SECRET=your-jwt-secret-key >> services\billing-service\.env
echo. >> services\billing-service\.env
echo # CORS Configuration >> services\billing-service\.env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173 >> services\billing-service\.env

REM Inventory Service (Port 3007)
echo PORT=3007 > services\inventory-service\.env
echo # Database Configuration >> services\inventory-service\.env
echo DB_HOST=localhost >> services\inventory-service\.env
echo DB_PORT=3306 >> services\inventory-service\.env
echo DB_NAME=QuanLyCafe >> services\inventory-service\.env
echo DB_USER=root >> services\inventory-service\.env
echo DB_PASSWORD= >> services\inventory-service\.env
echo. >> services\inventory-service\.env
echo # Server Configuration >> services\inventory-service\.env
echo NODE_ENV=development >> services\inventory-service\.env
echo. >> services\inventory-service\.env
echo # JWT Configuration >> services\inventory-service\.env
echo JWT_SECRET=your-jwt-secret-key >> services\inventory-service\.env
echo. >> services\inventory-service\.env
echo # CORS Configuration >> services\inventory-service\.env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173 >> services\inventory-service\.env

REM API Gateway (Port 3000)
echo PORT=3000 > api-gateway\.env
echo # Database Configuration >> api-gateway\.env
echo DB_HOST=localhost >> api-gateway\.env
echo DB_PORT=3306 >> api-gateway\.env
echo DB_NAME=QuanLyCafe >> api-gateway\.env
echo DB_USER=root >> api-gateway\.env
echo DB_PASSWORD= >> api-gateway\.env
echo. >> api-gateway\.env
echo # Server Configuration >> api-gateway\.env
echo NODE_ENV=development >> api-gateway\.env
echo. >> api-gateway\.env
echo # JWT Configuration >> api-gateway\.env
echo JWT_SECRET=your-jwt-secret-key >> api-gateway\.env
echo. >> api-gateway\.env
echo # CORS Configuration >> api-gateway\.env
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173 >> api-gateway\.env

echo.
echo ✅ All .env files created successfully!
echo.
echo Services configuration:
echo - User Service: Port 3001
echo - Menu Service: Port 3002  
echo - Table Service: Port 3003
echo - Billing Service: Port 3004
echo - Inventory Service: Port 3007
echo - API Gateway: Port 3000
echo.
echo Database: QuanLyCafe (root user, no password)
echo.
pause
