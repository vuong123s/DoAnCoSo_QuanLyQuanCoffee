# ⚡ Coffee Shop - Quick Start Guide

Hướng dẫn khởi động nhanh hệ thống Coffee Shop Management System.

## 🚀 Khởi động nhanh (5 phút)

### Bước 1: Setup Database
```bash
cd scripts
./setup-database.bat
```

### Bước 2: Cài đặt Dependencies
```bash
./install-all-dependencies.bat
```

### Bước 3: Khởi động Services
```bash
./start-all-services.bat
```

### Bước 4: Test System
```bash
node test-new-services.js
```

## 🌐 URLs quan trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:5173 | Giao diện người dùng |
| **API Gateway** | http://localhost:3000 | API chính |
| **Health Check** | http://localhost:3000/health | Kiểm tra tình trạng |

## 🔧 Scripts hữu ích

| Script | Chức năng |
|--------|-----------|
| `setup-database.bat` | Tự động setup database |
| `install-all-dependencies.bat` | Cài đặt tất cả dependencies |
| `start-all-services.bat` | Khởi động tất cả services |
| `test-new-services.js` | Test toàn bộ hệ thống |
| `cleanup-project.bat` | Dọn dẹp project |

## 🐳 Docker (Alternative)

```bash
# Khởi động với Docker
docker-compose up -d

# Kiểm tra status
docker-compose ps

# Dừng services
docker-compose down
```

## 🧪 Testing

```bash
# Test tất cả services
cd scripts
node test-new-services.js

# Test health check
curl http://localhost:3000/health
```

## 🔐 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@coffeeshop.com | admin123 |

## 📱 Features Ready

- ✅ **User Management** - Đăng ký, đăng nhập, phân quyền
- ✅ **Menu Management** - CRUD menu items và categories  
- ✅ **Table Booking** - Đặt bàn online với real-time checking
- ✅ **Online Ordering** - Giỏ hàng và đặt hàng online
- ✅ **Voucher System** - Tạo và sử dụng voucher
- ✅ **Inventory Management** - Quản lý kho nguyên liệu
- ✅ **Billing System** - Hóa đơn và thanh toán

## 🆘 Troubleshooting

### Services không start được
```bash
# Kiểm tra port đã được sử dụng chưa
netstat -an | findstr :3000

# Restart MySQL service
net stop mysql80
net start mysql80
```

### Database connection error
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Re-run database setup
cd scripts
./setup-database.bat
```

### Frontend không load được
```bash
# Clear cache và reinstall
cd front-end
npm cache clean --force
npm install
npm run dev
```

## 📚 Documentation

- **[📖 Full Documentation](./README.md)** - Tài liệu đầy đủ
- **[🔌 API Reference](./API_DOCUMENTATION.md)** - Chi tiết API
- **[📊 Project Summary](./PROJECT_SUMMARY.md)** - Tóm tắt dự án

---

**🎯 Mục tiêu**: Có hệ thống chạy trong 5 phút!  
**💡 Tip**: Chạy `cleanup-project.bat` nếu gặp vấn đề với cache
