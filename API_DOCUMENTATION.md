# ☕ Coffee Shop Management System - API Documentation

Tài liệu API đầy đủ cho hệ thống quản lý quán cà phê với 7 microservices.

## 🌐 Base URL
```
API Gateway: http://localhost:3000
```

## 🔐 Authentication

### JWT Token Authentication
Hầu hết các endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

### Role-based Access Control
- **Public**: Không cần authentication
- **Customer**: Khách hàng đã đăng nhập
- **Staff**: Nhân viên (Staff, Manager, Admin)
- **Manager**: Quản lý trở lên
- **Admin**: Chỉ Admin

---

## 👥 User Service (Port 3001)

### Authentication Endpoints

#### POST /api/auth/register
Đăng ký tài khoản mới
- **Access**: Public
- **Body**:
```json
{
  "HoTen": "Nguyễn Văn A",
  "Email": "user@example.com",
  "MatKhau": "password123",
  "SDT": "0123456789",
  "GioiTinh": "Nam",
  "NgaySinh": "1990-01-01",
  "DiaChi": "123 Đường ABC, TP.HCM"
}
```
- **Response**:
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "MaKH": 1,
    "HoTen": "Nguyễn Văn A",
    "Email": "user@example.com"
  }
}
```

#### POST /api/auth/login
Đăng nhập
- **Access**: Public
- **Body**:
```json
{
  "Email": "user@example.com",
  "MatKhau": "password123"
}
```
- **Response**:
```json
{
  "message": "Đăng nhập thành công",
  "token": "jwt_token_here",
  "user": {
    "MaKH": 1,
    "HoTen": "Nguyễn Văn A",
    "Email": "user@example.com",
    "ChucVu": "Khách hàng"
  }
}
```

#### POST /api/auth/refresh
Làm mới token
- **Access**: Customer+
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response**:
```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

#### GET /api/auth/profile
Lấy thông tin profile
- **Access**: Customer+
- **Response**:
```json
{
  "MaKH": 1,
  "HoTen": "Nguyễn Văn A",
  "Email": "user@example.com",
  "SDT": "0123456789",
  "DiaChi": "123 Đường ABC, TP.HCM"
}
```

### User Management

#### GET /api/users
Danh sách người dùng
- **Access**: Staff+
- **Query Parameters**:
  - `page`: Trang (default: 1)
  - `limit`: Số lượng (default: 10)
  - `search`: Tìm kiếm theo tên/email
  - `role`: Lọc theo vai trò

#### PUT /api/users/:id
Cập nhật thông tin người dùng
- **Access**: Staff+ hoặc chính user đó
- **Body**: Các trường cần cập nhật

#### DELETE /api/users/:id
Xóa người dùng
- **Access**: Admin

---

## 🍽️ Menu Service (Port 3002)

### Menu Items

#### GET /api/menu
Danh sách món ăn
- **Access**: Public
- **Query Parameters**:
  - `category`: Lọc theo danh mục
  - `available`: Chỉ món có sẵn (true/false)
  - `search`: Tìm kiếm theo tên
- **Response**:
```json
[
  {
    "MaMon": 1,
    "TenMon": "Cà phê đen",
    "MoTa": "Cà phê đen truyền thống",
    "DonGia": 25000,
    "HinhAnh": "/images/ca-phe-den.jpg",
    "TrangThai": "Có sẵn",
    "LoaiMon": {
      "MaLoai": 1,
      "TenLoai": "Cà phê"
    }
  }
]
```

#### POST /api/menu
Tạo món mới
- **Access**: Staff+
- **Body**:
```json
{
  "TenMon": "Cà phê sữa",
  "MoTa": "Cà phê sữa đá",
  "DonGia": 30000,
  "MaLoai": 1,
  "HinhAnh": "/images/ca-phe-sua.jpg"
}
```

#### PUT /api/menu/:id
Cập nhật món
- **Access**: Staff+

#### DELETE /api/menu/:id
Xóa món
- **Access**: Manager+

### Categories

#### GET /api/categories
Danh sách danh mục
- **Access**: Public
- **Response**:
```json
[
  {
    "MaLoai": 1,
    "TenLoai": "Cà phê",
    "MoTa": "Các loại cà phê",
    "HinhAnh": "/images/category-coffee.jpg"
  }
]
```

#### POST /api/categories
Tạo danh mục mới
- **Access**: Manager+

---

## 🪑 Table Service (Port 3003)

### Tables

#### GET /api/tables
Danh sách bàn
- **Access**: Public
- **Query Parameters**:
  - `area`: Lọc theo khu vực
  - `status`: Lọc theo trạng thái
- **Response**:
```json
[
  {
    "MaBan": 1,
    "TenBan": "Bàn 01",
    "SoCho": 4,
    "ViTri": "Gần cửa sổ",
    "TrangThai": "Trống",
    "KhuVuc": {
      "MaKhuVuc": 1,
      "TenKhuVuc": "Tầng 1",
      "HinhAnh": "/images/area1.jpg"
    }
  }
]
```

#### POST /api/tables
Tạo bàn mới
- **Access**: Manager+

#### PUT /api/tables/:id
Cập nhật bàn
- **Access**: Staff+

### Reservations

#### GET /api/reservations
Danh sách đặt bàn
- **Access**: Staff+ (hoặc Customer cho đặt bàn của mình)
- **Query Parameters**:
  - `date`: Lọc theo ngày
  - `status`: Lọc theo trạng thái
  - `customer`: ID khách hàng

#### POST /api/reservations
Đặt bàn mới
- **Access**: Public
- **Body**:
```json
{
  "TenKhach": "Nguyễn Văn A",
  "SoDienThoai": "0123456789",
  "EmailKhach": "user@example.com",
  "MaBan": 1,
  "NgayDat": "2025-01-22",
  "GioDat": "19:00",
  "SoNguoi": 4,
  "GhiChu": "Gần cửa sổ"
}
```

#### PUT /api/reservations/:id
Cập nhật đặt bàn
- **Access**: Staff+ hoặc khách hàng đặt bàn

#### GET /api/reservations/available-tables
Bàn có sẵn
- **Access**: Public
- **Query Parameters**:
  - `date`: Ngày đặt (required)
  - `time`: Giờ đặt (required)
  - `partySize`: Số người

---

## 💰 Billing Service (Port 3004)

### Bills

#### GET /api/billing
Danh sách hóa đơn
- **Access**: Staff+
- **Query Parameters**:
  - `date`: Lọc theo ngày
  - `status`: Lọc theo trạng thái
  - `customer`: ID khách hàng

#### POST /api/billing
Tạo hóa đơn mới
- **Access**: Staff+
- **Body**:
```json
{
  "MaKH": 1,
  "MaBan": 1,
  "items": [
    {
      "MaMon": 1,
      "SoLuong": 2,
      "DonGia": 25000,
      "GhiChu": "Ít đường"
    }
  ],
  "GhiChu": "Khách VIP"
}
```

#### PUT /api/billing/:id
Cập nhật hóa đơn
- **Access**: Staff+

#### GET /api/billing/stats
Thống kê doanh thu
- **Access**: Manager+
- **Query Parameters**:
  - `startDate`: Từ ngày
  - `endDate`: Đến ngày
  - `period`: daily/weekly/monthly

---

## 🛒 Online Order Service (Port 3005)

### Shopping Cart

#### GET /api/cart
Xem giỏ hàng
- **Access**: Public
- **Query Parameters**:
  - `sessionId`: ID session (cho khách vãng lai)
  - `customerId`: ID khách hàng (cho khách đã đăng nhập)

#### POST /api/cart/add
Thêm vào giỏ hàng
- **Access**: Public
- **Body**:
```json
{
  "sessionId": "session_id_here",
  "menuItemId": 1,
  "quantity": 2,
  "unitPrice": 25000,
  "notes": "Ít đường"
}
```

#### PUT /api/cart/update
Cập nhật giỏ hàng
- **Access**: Public
- **Body**:
```json
{
  "cartItemId": 1,
  "quantity": 3,
  "notes": "Nhiều đá"
}
```

#### DELETE /api/cart/remove
Xóa khỏi giỏ hàng
- **Access**: Public
- **Body**:
```json
{
  "cartItemId": 1
}
```

### Online Orders

#### GET /api/online-orders
Danh sách đơn hàng online
- **Access**: Staff+ (hoặc Customer cho đơn của mình)

#### POST /api/online-orders
Tạo đơn hàng online
- **Access**: Public
- **Body**:
```json
{
  "sessionId": "session_id_here",
  "customerInfo": {
    "TenKhach": "Nguyễn Văn A",
    "SDT": "0123456789",
    "Email": "user@example.com",
    "DiaChi": "123 Đường ABC, TP.HCM"
  },
  "deliveryInfo": {
    "LoaiGiao": "Giao hàng",
    "DiaChiGiao": "123 Đường ABC, TP.HCM",
    "ThoiGianGiao": "2025-01-22 19:00"
  },
  "voucherCode": "WELCOME10",
  "ghiChu": "Giao nhanh"
}
```

#### PUT /api/online-orders/:id/status
Cập nhật trạng thái đơn hàng
- **Access**: Staff+
- **Body**:
```json
{
  "status": "Đang chuẩn bị",
  "note": "Đang pha chế"
}
```

### Order Tracking

#### GET /api/order-tracking/:orderId
Theo dõi đơn hàng
- **Access**: Public
- **Response**:
```json
{
  "MaDonHang": 1,
  "TrangThai": "Đang giao",
  "ThoiGianCapNhat": "2025-01-22T10:30:00Z",
  "ViTriHienTai": "Đang trên đường giao",
  "ThoiGianDuKien": "2025-01-22T11:00:00Z",
  "history": [
    {
      "TrangThai": "Đã xác nhận",
      "ThoiGian": "2025-01-22T10:00:00Z"
    }
  ]
}
```

---

## 🎫 Voucher Service (Port 3006)

### Vouchers

#### GET /api/vouchers
Danh sách voucher
- **Access**: Staff+ (hoặc Public cho available vouchers)

#### GET /api/vouchers/available
Voucher có sẵn
- **Access**: Public
- **Query Parameters**:
  - `customerType`: Loại khách hàng
- **Response**:
```json
[
  {
    "MaVC": "WELCOME10",
    "TenVC": "Chào mừng khách mới",
    "LoaiGiamGia": "Phần trăm",
    "GiaTriGiam": 10,
    "GiaTriToiDa": 50000,
    "DonHangToiThieu": 100000,
    "NgayBatDau": "2025-01-01",
    "NgayKetThuc": "2025-12-31",
    "MoTa": "Giảm 10% cho đơn hàng đầu tiên"
  }
]
```

#### POST /api/vouchers
Tạo voucher mới
- **Access**: Manager+
- **Body**:
```json
{
  "MaVC": "SUMMER2025",
  "TenVC": "Khuyến mãi hè",
  "LoaiGiamGia": "Tiền",
  "GiaTriGiam": 20000,
  "DonHangToiThieu": 150000,
  "NgayBatDau": "2025-06-01",
  "NgayKetThuc": "2025-08-31",
  "SoLuongToiDa": 100,
  "DoiTuongKH": "Tất cả",
  "MoTa": "Giảm 20k cho đơn hàng từ 150k"
}
```

#### POST /api/vouchers/:code/validate
Kiểm tra voucher
- **Access**: Public
- **Body**:
```json
{
  "orderValue": 200000,
  "customerType": "Thành viên"
}
```
- **Response**:
```json
{
  "valid": true,
  "discount": 20000,
  "message": "Voucher hợp lệ"
}
```

#### POST /api/vouchers/:code/use
Sử dụng voucher
- **Access**: Public
- **Body**:
```json
{
  "orderId": 1,
  "orderValue": 200000,
  "customerId": 1
}
```

---

## 📦 Inventory Service (Port 3007)

### Inventory Management

#### GET /api/inventory
Danh sách kho
- **Access**: Staff+
- **Query Parameters**:
  - `status`: Lọc theo trạng thái
  - `lowStock`: Chỉ hàng sắp hết (true/false)
  - `expiring`: Sắp hết hạn (true/false)
- **Response**:
```json
[
  {
    "MaKho": 1,
    "TenNguyenLieu": "Cà phê Robusta",
    "SoLuongTon": 50,
    "DonVi": "kg",
    "DonGiaNhap": 150000,
    "NgayNhap": "2025-01-15",
    "NgayHetHan": "2025-06-15",
    "TrangThai": "Còn hàng",
    "NhaCungCap": "Công ty ABC"
  }
]
```

#### POST /api/inventory
Thêm nguyên liệu mới
- **Access**: Staff+
- **Body**:
```json
{
  "TenNguyenLieu": "Sữa tươi",
  "SoLuongTon": 100,
  "DonVi": "lít",
  "DonGiaNhap": 25000,
  "NgayHetHan": "2025-02-01",
  "NhaCungCap": "Vinamilk"
}
```

#### PUT /api/inventory/:id
Cập nhật kho
- **Access**: Staff+

### Import/Export Operations

#### POST /api/inventory/import
Nhập kho
- **Access**: Staff+
- **Body**:
```json
{
  "MaKho": 1,
  "SoLuongNhap": 20,
  "DonGiaNhap": 150000,
  "NgayNhap": "2025-01-22",
  "NhaCungCap": "Công ty ABC",
  "GhiChu": "Lô hàng tháng 1"
}
```

#### POST /api/inventory/export
Xuất kho
- **Access**: Staff+
- **Body**:
```json
{
  "MaKho": 1,
  "SoLuongXuat": 5,
  "LyDoXuat": "Sản xuất",
  "GhiChu": "Pha chế cà phê"
}
```

#### GET /api/inventory/alerts
Cảnh báo kho
- **Access**: Staff+
- **Response**:
```json
{
  "lowStock": [
    {
      "MaKho": 1,
      "TenNguyenLieu": "Cà phê Robusta",
      "SoLuongTon": 5,
      "NgưỡngCảnhBáo": 10
    }
  ],
  "expiring": [
    {
      "MaKho": 2,
      "TenNguyenLieu": "Sữa tươi",
      "NgayHetHan": "2025-01-25",
      "SoNgayConLai": 3
    }
  ]
}
```

---

## 📊 Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Thành công"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Lỗi xảy ra",
  "details": "Chi tiết lỗi"
}
```

### Pagination Response
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔧 Status Codes

- **200**: OK - Thành công
- **201**: Created - Tạo mới thành công
- **400**: Bad Request - Dữ liệu không hợp lệ
- **401**: Unauthorized - Chưa xác thực
- **403**: Forbidden - Không có quyền truy cập
- **404**: Not Found - Không tìm thấy
- **409**: Conflict - Dữ liệu bị trung lặp
- **500**: Internal Server Error - Lỗi server

---

## 🧪 Testing

### Sử dụng Test Script
```bash
cd scripts
node test-new-services.js
```

### Manual Testing với cURL
```bash
# Health check
curl http://localhost:3000/health

# Get menu
curl http://localhost:3000/api/menu

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"Email":"admin@coffeeshop.com","MatKhau":"admin123"}'
```

### Postman Collection
Import file `Coffee-Shop-API.postman_collection.json` vào Postman để test đầy đủ các endpoints.

---

## 📝 Notes

1. **Authentication**: Hầu hết endpoints yêu cầu JWT token
2. **Rate Limiting**: 100 requests/15 minutes per IP
3. **CORS**: Configured cho frontend domain
4. **File Upload**: Sử dụng multipart/form-data cho upload hình ảnh
5. **Database**: Sử dụng Vietnamese schema với utf8mb4_unicode_ci
6. **Timestamps**: Tự động quản lý NgayTao, NgayCapNhat

---

**Cập nhật cuối:** 2025-01-21  
**Phiên bản API:** 2.0.0
