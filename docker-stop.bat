@echo off
echo ========================================
echo    COFFEE SHOP - DOCKER SHUTDOWN
echo ========================================
echo.

echo 🔄 Dang dung tat ca services...
docker-compose down

echo.
echo 🧹 Xoa cac container va network...
docker-compose down --volumes --remove-orphans

echo.
echo ✅ Da dung tat ca services!
pause
