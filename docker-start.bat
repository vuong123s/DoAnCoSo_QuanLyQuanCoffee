@echo off
echo ========================================
echo    COFFEE SHOP - DOCKER STARTUP
echo ========================================
echo.

echo 🔄 Dang dung cac container cu...
docker-compose down

echo.
echo 🧹 Xoa cac image cu (neu can)...
docker system prune -f

echo.
echo 🚀 Khoi dong tat ca services...
docker-compose up --build -d

echo.
echo ⏳ Cho MySQL khoi dong hoan tat...
timeout /t 30 /nobreak

echo.
echo 📊 Kiem tra trang thai cac services...
docker-compose ps

echo.
echo 🌐 Cac URL truy cap:
echo    - Frontend:    http://localhost:5173
echo    - API Gateway: http://localhost:3000
echo    - User Service: http://localhost:3001
echo    - Menu Service: http://localhost:3002
echo    - Table Service: http://localhost:3003
echo    - Billing Service: http://localhost:3004
echo    - MySQL: localhost:3306

echo.
echo ✅ He thong da khoi dong xong!
echo    Nhan phim bat ky de xem logs...
pause

echo.
echo 📋 Xem logs cua tat ca services:
docker-compose logs -f
