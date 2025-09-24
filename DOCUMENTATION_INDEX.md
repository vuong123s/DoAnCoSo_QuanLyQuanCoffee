# 📚 Coffee Shop - Documentation Index

Chỉ mục tài liệu cho hệ thống quản lý quán cà phê.

## 📖 Tài liệu chính

| File | Mục đích | Nội dung |
|------|----------|----------|
| **[README.md](./README.md)** | 🏠 **Tổng quan project** | Giới thiệu, cài đặt, cấu trúc |
| **[QUICK_START.md](./QUICK_START.md)** | ⚡ **Khởi động nhanh** | Setup trong 5 phút |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | 🔌 **API Reference** | Chi tiết tất cả endpoints |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | 📊 **Tóm tắt dự án** | Metrics, achievements, business value |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | ⚙️ **Hướng dẫn setup** | Chi tiết cài đặt từng bước |

## 📁 Tài liệu theo thư mục

### `/services/`
- **[services/README.md](./services/README.md)** - Tổng quan microservices

### `/scripts/`
- **setup-database.bat** - Tự động setup database
- **start-all-services.bat** - Khởi động tất cả services
- **test-new-services.js** - Test suite toàn diện
- **cleanup-project.bat** - Dọn dẹp project
- **install-all-dependencies.bat** - Cài đặt dependencies

### `/front-end/`
- **README.md** - Hướng dẫn frontend development

## 🎯 Hướng dẫn sử dụng

### Cho Developer mới
1. Đọc [README.md](./README.md) để hiểu tổng quan
2. Theo [SETUP_GUIDE.md](./SETUP_GUIDE.md) để cài đặt
3. Tham khảo [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) khi develop

### Cho Product Manager
1. Xem [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) để hiểu business value
2. Đọc [README.md](./README.md) phần tính năng
3. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) cho requirements

### Cho DevOps/Deployment
1. Theo [SETUP_GUIDE.md](./SETUP_GUIDE.md) cho production setup
2. Sử dụng scripts trong `/scripts/` cho automation
3. Tham khảo Docker configuration trong project root

## 🔍 Quick Reference

### Khởi động nhanh
```bash
# Setup database
./scripts/setup-database.bat

# Start all services
./scripts/start-all-services.bat

# Test system
cd scripts && node test-new-services.js
```

### URLs quan trọng
- **API Gateway**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:3000/health

### Services Ports
- API Gateway: 3000
- User Service: 3001
- Menu Service: 3002
- Table Service: 3003
- Billing Service: 3004
- Online Order Service: 3005
- Voucher Service: 3006
- Inventory Service: 3007

---

**Lưu ý**: Tài liệu này giúp tránh trùng lặp thông tin giữa các file documentation khác nhau.
