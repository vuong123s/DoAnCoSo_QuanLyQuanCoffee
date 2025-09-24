@echo off
echo ========================================
echo   Coffee Shop Database Setup Script
echo ========================================
echo.

echo Checking MySQL connection...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL and add it to your PATH
    pause
    exit /b 1
)

echo MySQL found. Starting database setup...
echo.

echo Step 1: Creating database and importing schema...
mysql -u root -p < "../QuanLyCaFe.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database schema
    pause
    exit /b 1
)
echo ✓ Database schema created successfully

echo.
echo Step 2: Creating admin user...
mysql -u root -p QuanLyCafe < "../create-admin-user.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)
echo ✓ Admin user created successfully

echo.
echo Step 3: Seeding sample data...
mysql -u root -p QuanLyCafe < "seed-sample-data.sql"
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed sample data
    pause
    exit /b 1
)
echo ✓ Sample data seeded successfully

echo.
echo ========================================
echo   Database Setup Completed Successfully!
echo ========================================
echo.
echo Database: QuanLyCafe
echo Admin User: admin@coffeeshop.com
echo Admin Password: admin123
echo.
echo You can now start the services using:
echo   ./start-all-services.bat
echo.
echo Test the setup using:
echo   node test-new-services.js
echo.
pause
