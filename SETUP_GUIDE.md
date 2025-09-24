# Coffee Shop Microservices - Setup Guide

Hướng dẫn chi tiết để thiết lập và chạy hệ thống Coffee Shop với 3 microservices mới.

## 📋 Yêu cầu hệ thống

- **Node.js**: v16.0.0 trở lên
- **MySQL**: v8.0 trở lên
- **npm**: v7.0.0 trở lên
- **Windows**: Hỗ trợ batch scripts

## 🗄️ Bước 1: Thiết lập Database

### 1.1 Tạo Database
```sql
CREATE DATABASE QuanLyCafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 Import Schema
```bash
mysql -u root -p QuanLyCafe < QuanLyCaFe.sql
```

### 1.3 Import Sample Data (Tùy chọn)
```bash
mysql -u root -p QuanLyCafe < scripts/seed-sample-data.sql
```

## 🔧 Bước 2: Cài đặt Dependencies

### Tự động (Khuyến nghị)
```bash
cd scripts
npm install
npm run install-all
```

### Thủ công
```bash
# API Gateway
cd api-gateway
npm install

# Các services
cd services/user-service && npm install
cd services/menu-service && npm install
cd services/table-service && npm install
cd services/billing-service && npm install
cd services/online-order-service && npm install
cd services/voucher-service && npm install
cd services/inventory-service && npm install
```

## ⚙️ Bước 3: Cấu hình Environment

### 3.1 Tạo file .env cho mỗi service

**API Gateway (.env):**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
```

**Services (.env):**
```env
DB_NAME=QuanLyCafe
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306
PORT=300X  # X = 1,2,3,4,5,6,7 tùy service
NODE_ENV=development
SERVICE_NAME=service-name
```

### 3.2 Cấu hình cụ thể cho từng service

**Online Order Service (Port 3005):**
```env
PORT=3005
SERVICE_NAME=online-order-service
```

**Voucher Service (Port 3006):**
```env
PORT=3006
SERVICE_NAME=voucher-service
```

**Inventory Service (Port 3007):**
```env
PORT=3007
SERVICE_NAME=inventory-service
LOW_STOCK_THRESHOLD=10
EXPIRY_WARNING_DAYS=7
```

## 🚀 Bước 4: Khởi động Services

### Tự động (Khuyến nghị)
```bash
cd scripts
start-all-services.bat
```

### Thủ công (từng service)
```bash
# Terminal 1: API Gateway
cd api-gateway
npm run dev

# Terminal 2: User Service
cd services/user-service
npm run dev

# Terminal 3: Menu Service
cd services/menu-service
npm run dev

# Terminal 4: Table Service
cd services/table-service
npm run dev

# Terminal 5: Billing Service
cd services/billing-service
npm run dev

# Terminal 6: Online Order Service
cd services/online-order-service
npm run dev

# Terminal 7: Voucher Service
cd services/voucher-service
npm run dev

# Terminal 8: Inventory Service
cd services/inventory-service
npm run dev
```

## 🧪 Bước 5: Kiểm tra hệ thống

### 5.1 Health Check
```bash
# Kiểm tra tất cả services
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

### 5.2 Chạy Test Suite
```bash
cd scripts
npm test
```

### 5.3 Kiểm tra API Documentation
Truy cập: http://localhost:3000/api

## 📱 Bước 6: Khởi động Frontend (Tùy chọn)

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy trên: http://localhost:5173

## 🔍 API Endpoints Mới

### Online Order Service
```
GET    /api/cart?sessionId=xxx          # Lấy giỏ hàng
POST   /api/cart/add                    # Thêm vào giỏ hàng
PUT    /api/cart/item/:id               # Cập nhật item
DELETE /api/cart/item/:id               # Xóa item
DELETE /api/cart/clear                  # Xóa giỏ hàng

POST   /api/online-orders               # Tạo đơn hàng
GET    /api/online-orders               # Lấy danh sách đơn hàng
GET    /api/online-orders/:id           # Chi tiết đơn hàng
PUT    /api/online-orders/:id/status    # Cập nhật trạng thái

GET    /api/order-tracking/:orderId     # Theo dõi đơn hàng
POST   /api/order-tracking/:orderId     # Cập nhật tracking
```

### Voucher Service
```
GET    /api/vouchers                    # Danh sách voucher
GET    /api/vouchers/available          # Voucher khả dụng
POST   /api/vouchers/:code/validate     # Kiểm tra voucher
POST   /api/vouchers/:code/use          # Sử dụng voucher
POST   /api/vouchers                    # Tạo voucher (staff)
PUT    /api/vouchers/:code              # Cập nhật voucher (staff)
```

### Inventory Service (Staff only)
```
GET    /api/inventory                   # Danh sách kho
GET    /api/inventory/alerts            # Cảnh báo kho
GET    /api/inventory/stats             # Thống kê kho
POST   /api/inventory                   # Thêm nguyên liệu
POST   /api/inventory/import            # Nhập kho
POST   /api/inventory/export            # Xuất kho
```

## 🛠️ Troubleshooting

### Lỗi thường gặp

**1. Port đã được sử dụng**
```bash
# Kiểm tra port đang sử dụng
netstat -an | findstr :3000

# Tắt process sử dụng port
taskkill /PID <process-id> /F
```

**2. Lỗi kết nối Database**
- Kiểm tra MySQL server đã chạy
- Kiểm tra thông tin kết nối trong .env
- Kiểm tra database QuanLyCafe đã tồn tại

**3. Service không khởi động**
- Kiểm tra dependencies đã cài đặt: `npm install`
- Kiểm tra file .env đã tồn tại
- Kiểm tra logs trong terminal

**4. API Gateway không proxy được**
- Kiểm tra tất cả services đã chạy
- Kiểm tra health check của từng service
- Kiểm tra logs API Gateway

### Debug Commands

```bash
# Kiểm tra services đang chạy
tasklist | findstr node

# Kiểm tra kết nối database
mysql -u root -p -e "SHOW DATABASES;"

# Test API endpoints
curl -X GET http://localhost:3000/test
curl -X GET http://localhost:3000/health
```

## 📊 Monitoring

### Service Health
- API Gateway: http://localhost:3000/health
- Individual services: http://localhost:300X/health

### Logs
- Mỗi service có logs riêng trong terminal
- API Gateway logs tất cả requests
- Structured logging với colors

### Performance
- Response time tracking
- Error rate monitoring
- Service availability

## 🔐 Security

### Authentication
- JWT-based authentication
- Role-based access control
- Protected routes for staff functions

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to authentication endpoints

### CORS
- Configured for frontend integration
- Multiple origin support

## 📈 Next Steps

1. **Frontend Integration**: Cập nhật frontend để sử dụng API mới
2. **Testing**: Viết unit tests và integration tests
3. **Deployment**: Cấu hình cho production environment
4. **Monitoring**: Setup logging và monitoring tools
5. **Documentation**: API documentation với Swagger/OpenAPI

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Chạy health checks
3. Kiểm tra troubleshooting section
4. Chạy test suite để xác định vấn đề

---

**🎉 Chúc mừng! Hệ thống Coffee Shop với 7 microservices đã sẵn sàng hoạt động!**
