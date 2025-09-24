@echo off
echo Installing dependencies for all Coffee Shop services...
echo.

echo Installing API Gateway dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\api-gateway"
call npm install
echo.

echo Installing User Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\user-service"
call npm install
echo.

echo Installing Menu Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\menu-service"
call npm install
echo.

echo Installing Table Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\table-service"
call npm install
echo.

echo Installing Billing Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\billing-service"
call npm install
echo.

echo Installing Online Order Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\online-order-service"
call npm install
echo.

echo Installing Voucher Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\voucher-service"
call npm install
echo.

echo Installing Inventory Service dependencies...
cd /d "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop\services\inventory-service"
call npm install
echo.

echo All dependencies installed successfully!
echo You can now run start-all-services.bat to start all services.
echo.
pause
