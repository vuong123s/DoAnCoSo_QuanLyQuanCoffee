# ☕ Coffee Shop Management System

Hệ thống quản lý quán cà phê hoàn chỉnh sử dụng kiến trúc microservices với ReactJS frontend và Express.js backend.

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                 │
│                      Port 5173                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 API Gateway                                 │
│                   Port 3000                                │
│            (Authentication, Rate Limiting)                 │
└─┬─────┬─────┬─────┬─────┬─────┬─────┬─────────────────────┘
  │     │     │     │     │     │     │
  ▼     ▼     ▼     ▼     ▼     ▼     ▼
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ U │ │ M │ │ T │ │ B │ │ O │ │ V │ │ I │
│ s │ │ e │ │ a │ │ i │ │ n │ │ o │ │ n │
│ e │ │ n │ │ b │ │ l │ │ l │ │ u │ │ v │
│ r │ │ u │ │ l │ │ l │ │ i │ │ c │ │ e │
│   │ │   │ │ e │ │ i │ │ n │ │ h │ │ n │
│ 3 │ │ 3 │ │ 3 │ │ 3 │ │ e │ │ e │ │ t │
│ 0 │ │ 0 │ │ 0 │ │ 0 │ │ 3 │ │ 3 │ │ 3 │
│ 0 │ │ 0 │ │ 0 │ │ 0 │ │ 0 │ │ 0 │ │ 0 │
│ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │ 7 │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
```

## 🚀 Tính năng chính

### 👥 Quản lý Khách hàng & Nhân viên
- Đăng ký, đăng nhập với JWT authentication
- Phân quyền theo vai trò (Admin, Manager, Staff, Customer)
- Quản lý thông tin cá nhân và lịch sử

### 🍽️ Quản lý Thực đơn
- CRUD menu items với categories
- Upload hình ảnh món ăn
- Quản lý giá cả và tình trạng món

### 🪑 Quản lý Bàn & Đặt bàn
- Quản lý bàn theo khu vực với media (hình ảnh, video)
- Đặt bàn online với kiểm tra tình trạng real-time
- Theo dõi trạng thái bàn và lịch đặt

### 🛒 Đặt hàng Online
- Giỏ hàng cho khách vãng lai (session-based)
- Đặt hàng online với thông tin giao hàng
- Theo dõi đơn hàng real-time

### 🎫 Hệ thống Voucher
- Tạo và quản lý voucher khuyến mãi
- Giảm giá theo tiền mặt hoặc phần trăm
- Phân loại khách hàng và điều kiện sử dụng

### 📦 Quản lý Kho
- Theo dõi nguyên liệu và tồn kho
- Cảnh báo hết hàng và hết hạn
- Quản lý nhập/xuất kho với audit trail

### 💰 Thanh toán & Hóa đơn
- Tạo hóa đơn cho đơn hàng tại chỗ và online
- Hỗ trợ nhiều phương thức thanh toán
- Báo cáo doanh thu và thống kê

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** với **Vite** - Modern build tool
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management với persistence
- **React Hook Form** - Form handling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client với interceptors

### Backend
- **Node.js** với **Express.js** - Web framework
- **MySQL** với **Sequelize ORM** - Database
- **JWT** - Authentication & authorization
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **PM2** - Process management
- **Morgan** - HTTP request logging
- **Helmet** - Security headers

## 📋 Yêu cầu hệ thống

- **Node.js** >= 16.0.0
- **MySQL** >= 8.0
- **npm** >= 8.0.0
- **Git** >= 2.0

## 🚀 Cài đặt và Chạy

> **⚡ Khởi động nhanh**: Xem [QUICK_START.md](./QUICK_START.md) để setup trong 5 phút!

### 1. Clone Repository
```bash
git clone <repository-url>
cd Coffee-Shop
```

### 2. Cài đặt Dependencies
```bash
# Cài đặt tất cả dependencies cho các services
./scripts/install-all-dependencies.bat

# Hoặc cài đặt thủ công cho từng service
cd api-gateway && npm install
cd services/user-service && npm install
cd services/menu-service && npm install
cd services/table-service && npm install
cd services/billing-service && npm install
cd services/online-order-service && npm install
cd services/voucher-service && npm install
cd services/inventory-service && npm install
cd front-end && npm install
```

### 3. Cấu hình Database
```bash
# Tạo database và import schema
mysql -u root -p < QuanLyCaFe.sql

# Tạo admin user
mysql -u root -p QuanLyCafe < create-admin-user.sql

# Seed sample data (optional)
mysql -u root -p QuanLyCafe < scripts/seed-sample-data.sql
```

### 4. Cấu hình Environment
Tạo file `.env` cho mỗi service dựa trên `.env.example`:
```bash
# API Gateway
cp api-gateway/.env.example api-gateway/.env

# Các services
cp services/user-service/.env.example services/user-service/.env
# ... tương tự cho các services khác
```

### 5. Khởi động Hệ thống
```bash
# Sử dụng script tự động
./scripts/start-all-services.bat

# Hoặc khởi động thủ công từng service
cd api-gateway && npm run dev
cd services/user-service && npm run dev
# ... tương tự cho các services khác
cd front-end && npm run dev
```

### 6. Sử dụng Docker (Alternative)
```bash
# Khởi động tất cả services với Docker
docker-compose up -d

# Dừng services
docker-compose down
```

## 📚 API Documentation

**📖 Chi tiết đầy đủ**: Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Endpoints chính
- **Authentication**: `/api/auth/*` - Đăng nhập, đăng ký, profile
- **Menu**: `/api/menu`, `/api/categories` - Quản lý thực đơn
- **Tables**: `/api/tables`, `/api/reservations` - Quản lý bàn & đặt bàn  
- **Orders**: `/api/cart/*`, `/api/online-orders` - Đặt hàng online
- **Vouchers**: `/api/vouchers/*` - Quản lý voucher
- **Inventory**: `/api/inventory/*` - Quản lý kho (Staff only)
- **Billing**: `/api/billing/*` - Hóa đơn & thanh toán (Staff only)

## 🗄️ Database Schema

### Bảng chính
- **NhanVien** - Thông tin nhân viên
- **KhachHang** - Thông tin khách hàng
- **KhuVuc** - Khu vực trong quán
- **Ban** - Bàn ăn
- **LoaiMon** - Danh mục món ăn
- **Mon** - Món ăn
- **DatBan** - Đặt bàn
- **Orders** - Đơn hàng tại chỗ
- **DonHangOnline** - Đơn hàng online
- **GioHang** - Giỏ hàng
- **Voucher** - Voucher khuyến mãi
- **Kho** - Kho nguyên liệu
- **ThanhToan** - Thanh toán

### Quy ước đặt tên (Vietnamese Schema)
- `Ma[Entity]`: Primary Key (MaNV, MaKH, MaMon...)
- `Ten[Entity]`: Name fields (TenNV, TenKH, TenMon...)
- `TrangThai`: Status fields
- `NgayTao`, `NgayCapNhat`: Timestamp fields

## 🔐 Bảo mật

- **JWT Authentication** với refresh tokens
- **Role-based Access Control** (RBAC)
- **Rate Limiting** (100 requests/15 minutes)
- **Password Hashing** với bcrypt
- **Input Validation** và sanitization
- **CORS Configuration** cho frontend
- **Security Headers** với Helmet.js

## 📊 Monitoring & Health Checks

```bash
# Kiểm tra health tất cả services
curl http://localhost:3000/health

# Kiểm tra từng service
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Menu Service
curl http://localhost:3003/health  # Table Service
curl http://localhost:3004/health  # Billing Service
curl http://localhost:3005/health  # Online Order Service
curl http://localhost:3006/health  # Voucher Service
curl http://localhost:3007/health  # Inventory Service
```

## 🧪 Testing

```bash
# Chạy test suite cho tất cả services
cd scripts
node test-new-services.js

# Test từng service riêng lẻ
cd services/user-service && npm test
```

## 📁 Cấu trúc Project

```
Coffee-Shop/
├── api-gateway/              # API Gateway (Port 3000)
├── services/
│   ├── user-service/         # User & Auth (Port 3001)
│   ├── menu-service/         # Menu & Categories (Port 3002)
│   ├── table-service/        # Tables & Reservations (Port 3003)
│   ├── billing-service/      # Billing & Payments (Port 3004)
│   ├── online-order-service/ # Online Orders (Port 3005)
│   ├── voucher-service/      # Vouchers (Port 3006)
│   └── inventory-service/    # Inventory (Port 3007)
├── front-end/                # React Frontend (Port 5173)
├── scripts/                  # Utility scripts
├── QuanLyCaFe.sql           # Database schema
├── docker-compose.yml        # Docker configuration
└── README.md                # This file
```

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build và deploy với Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Build frontend
cd front-end && npm run build

# Start services với PM2
pm2 start ecosystem.config.js
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Tài liệu khác

- **[📖 API Documentation](./API_DOCUMENTATION.md)** - Chi tiết tất cả API endpoints
- **[📊 Project Summary](./PROJECT_SUMMARY.md)** - Tóm tắt dự án và business value  
- **[⚙️ Setup Guide](./SETUP_GUIDE.md)** - Hướng dẫn setup chi tiết
- **[📁 Documentation Index](./DOCUMENTATION_INDEX.md)** - Chỉ mục tài liệu

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**Phát triển bởi:** Team Coffee Shop Management System  
**Phiên bản:** 2.0.0  
**Cập nhật cuối:** 2025-01-21
