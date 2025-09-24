# Coffee Shop Microservices

Hệ thống microservices hoàn chỉnh cho quản lý quán cà phê với 7 services chính.

## Kiến trúc Hệ thống

```
API Gateway (Port 3000)
├── user-service (Port 3001) - Quản lý người dùng & xác thực
├── menu-service (Port 3002) - Quản lý thực đơn & danh mục
├── table-service (Port 3003) - Quản lý bàn & đặt bàn
├── billing-service (Port 3004) - Quản lý hóa đơn & thanh toán
├── online-order-service (Port 3005) - Quản lý đơn hàng online
├── voucher-service (Port 3006) - Quản lý voucher & khuyến mãi
└── inventory-service (Port 3007) - Quản lý kho nguyên liệu
```

## Services Mới Được Tạo

### 1. Online Order Service (Port 3005)
**Chức năng:** Quản lý đơn hàng online và giỏ hàng
- **Models:** GioHang, DonHangOnline, CTDonHangOnline, TheoDoiDonHang
- **Routes:** `/api/cart`, `/api/online-orders`, `/api/order-tracking`
- **Features:** Giỏ hàng cho khách vãng lai, theo dõi đơn hàng real-time, tích hợp voucher

### 2. Voucher Service (Port 3006)
**Chức năng:** Quản lý voucher và chương trình khuyến mãi
- **Models:** Voucher, VoucherUsage
- **Routes:** `/api/vouchers`
- **Features:** Giảm giá theo tiền/phần trăm, phân loại khách hàng, theo dõi sử dụng

### 3. Inventory Service (Port 3007)
**Chức năng:** Quản lý kho nguyên liệu
- **Models:** Kho, NhapKho, XuatKho
- **Routes:** `/api/inventory`
- **Features:** Cảnh báo hết hàng/hết hạn, xuất nhập kho tự động, theo dõi nhà cung cấp

## Cài đặt và Chạy

### 1. Cài đặt Dependencies
```bash
# Cho mỗi service
cd services/[service-name]
npm install
```

### 2. Cấu hình Environment
Tạo file `.env` cho mỗi service dựa trên `.env.example`:
```bash
# Copy example files
cp .env.example .env
```

### 3. Khởi động Services
```bash
# API Gateway
cd api-gateway
npm run dev

# Các services (mở terminal riêng cho mỗi service)
cd services/user-service && npm run dev
cd services/menu-service && npm run dev
cd services/table-service && npm run dev
cd services/billing-service && npm run dev
cd services/online-order-service && npm run dev
cd services/voucher-service && npm run dev
cd services/inventory-service && npm run dev
```

### 4. Kiểm tra Health
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

## API Endpoints

**📖 Chi tiết đầy đủ**: Xem [../API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

Tất cả API endpoints được truy cập qua API Gateway tại `http://localhost:3000`

## Database Schema

### Vietnamese Field Naming Convention
- `Ma[Entity]`: Primary Key (MaKH, MaMon, MaVC, etc.)
- `Ten[Entity]`: Name fields (TenKhach, TenMon, etc.)
- `TrangThai`: Status fields
- `NgayTao`, `NgayCapNhat`: Timestamp fields

### Key Tables Added
- **GioHang**: Shopping cart items
- **DonHangOnline**: Online orders
- **CTDonHangOnline**: Online order details
- **TheoDoiDonHang**: Order tracking history
- **Voucher**: Voucher definitions
- **VoucherUsage**: Voucher usage tracking
- **Kho**: Inventory items
- **NhapKho**: Import transactions
- **XuatKho**: Export transactions

## Security & Access Control

### Public Access
- Menu browsing
- Cart management
- Order placement
- Voucher validation
- Order tracking

### Authenticated Access
- User profile management
- Order history

### Staff Access Required
- Inventory management
- Billing operations
- Order status updates
- Voucher creation/management

## Integration Points

### Cross-Service Communication
1. **Order → Inventory**: Auto stock deduction
2. **Order → Voucher**: Discount application
3. **Order → User**: Customer validation
4. **Inventory → Menu**: Stock availability

### Event Flow Examples
1. **Online Order Creation:**
   - Validate customer & cart items
   - Apply voucher if provided
   - Create order & order details
   - Deduct inventory stock
   - Create tracking record

2. **Inventory Alert:**
   - Check stock levels on update
   - Generate low stock alerts
   - Check expiry dates
   - Notify relevant services

## Monitoring & Health Checks

### Service Health
- Each service has `/health` endpoint
- API Gateway aggregates health status
- Automatic service discovery

### Logging
- Structured logging across all services
- Request/response tracking
- Error monitoring

## Next Steps

1. **Database Setup**: Ensure QuanLyCafe database exists with all tables
2. **Environment Configuration**: Set up `.env` files for all services
3. **Service Startup**: Start all services in correct order
4. **Frontend Integration**: Update frontend to use new API endpoints
5. **Testing**: Test cross-service integrations
6. **Production Deployment**: Configure for production environment

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure all ports (3000-3007) are available
2. **Database Connection**: Check MySQL server and credentials
3. **Service Dependencies**: Start services in order (database → services → gateway)
4. **CORS Issues**: Verify frontend URL in API Gateway CORS config

### Debug Commands
```bash
# Check port usage
netstat -an | findstr :3000

# Test database connection
mysql -u root -p QuanLyCafe

# Check service logs
npm run dev  # In each service directory
```

Hệ thống hiện đã sẵn sàng cho việc phát triển và triển khai với đầy đủ chức năng quản lý quán cà phê hiện đại!
