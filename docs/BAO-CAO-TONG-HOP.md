# BÁO CÁO TỔNG HỢP - HỆ THỐNG QUẢN LÝ QUÁN COFFEE

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan)
2. [Công nghệ sử dụng](#2-công-nghệ)
3. [Kiến trúc hệ thống](#3-kiến-trúc)
4. [Chức năng chính](#4-chức-năng)
5. [Database](#5-database)
6. [Kết luận](#6-kết-luận)

---

# 1. TỔNG QUAN

## 1.1. Thông tin dự án

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | Hệ thống Quản lý Quán Coffee Shop |
| **Mô tả** | Ứng dụng web quản lý toàn diện cho quán cà phê |
| **Công nghệ** | React + Node.js + MySQL |
| **Kiến trúc** | Microservices với API Gateway |
| **Phiên bản** | 1.0.0 |

## 1.2. Mục đích

✅ Tự động hóa quy trình bán hàng (POS)  
✅ Mở rộng kênh bán qua đặt hàng online  
✅ Quản lý hiệu quả nhân viên, kho, bàn  
✅ Phân tích doanh thu real-time  
✅ Tăng trải nghiệm khách hàng  

## 1.3. Đối tượng sử dụng

- 👤 **Khách hàng:** Đặt món, đặt bàn, theo dõi đơn
- 👨‍💼 **Nhân viên:** POS, quản lý đơn hàng, đặt bàn
- 👨‍💼 **Quản lý:** Quản lý toàn bộ, xem báo cáo

---

# 2. CÔNG NGHỆ

## 2.1. Tech Stack

### Frontend
- **React 18.3** - UI Framework
- **Vite 5.4** - Build tool
- **TailwindCSS 3.4** - CSS Framework
- **Recharts 2.12** - Biểu đồ
- **Zustand 5.0** - State management
- **Axios 1.7** - HTTP client

### Backend
- **Node.js 20.x** - Runtime
- **Express.js 4.19** - Web framework
- **MySQL 8.0** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Architecture
- **Microservices** - 4 services độc lập
- **API Gateway** - Proxy tập trung (Port 3000) + Inventory

---

## 2.2. Các Services

```
1. API Gateway     (Port 3000) - Routing, Auth, Inventory
2. User Service    (Port 3001) - Users, Auth, Schedules
3. Menu Service    (Port 3002) - Menu, Categories
4. Table Service   (Port 3003) - Tables, Reservations
5. Billing Service (Port 3004) - POS, Online Orders
```

**Lưu ý:** Inventory được tích hợp trực tiếp vào API Gateway thay vì service riêng.

---

# 3. KIẾN TRÚC

## 3.1. Sơ đồ tổng quan

```
Browser (React)
    ↓
API Gateway (Port 3000)
│   └── Inventory Module (tích hợp sẵn)
    ↓
├── User Service
├── Menu Service
├── Table Service
└── Billing Service
    ↓
MySQL Database (QuanLyCafe)
```

## 3.2. Request Flow

```
1. Client → API Gateway
2. Gateway validates JWT
3. Gateway forwards to service
4. Service → Database
5. Response → Gateway → Client
```

---

# 4. CHỨC NĂNG

## 4.1. Khách hàng (7 chức năng)

### 🛒 Đặt món online
- Xem menu → Add to cart
- Nhập thông tin giao hàng
- Áp dụng voucher/điểm
- Thanh toán → Navigate to menu

**Endpoint:** `POST /api/online-orders`

### 📅 Đặt bàn trước
- Chọn ngày, giờ, số người, khu vực
- Ghi chú đặc biệt
- Xác nhận đặt bàn

**Endpoint:** `POST /api/reservations`

### 📦 Theo dõi đơn hàng
- Timeline trạng thái
- Cập nhật real-time

**Endpoint:** `GET /api/online-orders/:id`

### 📜 Xem lịch sử
- Danh sách đơn hàng cũ
- Chi tiết từng đơn

**Endpoint:** `GET /api/online-orders/customer/:customerId`

### 👤 Quản lý hồ sơ
- Thông tin cá nhân
- Điểm tích lũy
- Đổi mật khẩu

**Endpoint:** `GET /api/users/:id`

---

## 4.2. Nhân viên (3 chức năng)

### 💳 Bán hàng POS
**Màn hình:** `/admin/pos-system`

**Workflow:**
1. Chọn bàn
2. Thêm món vào đơn
3. Áp dụng voucher (optional)
4. Thanh toán (Tiền mặt/Chuyển khoản)
5. In hóa đơn

**Endpoint:** `POST /api/billing`

### 📦 Quản lý đơn online
- Xác nhận đơn mới
- Cập nhật trạng thái (Chuẩn bị → Giao → Hoàn thành)
- Hủy đơn

**Endpoint:** `PUT /api/online-orders/:id`

### 📅 Quản lý đặt bàn
- Xem lịch đặt bàn
- Xác nhận/Hủy đặt bàn
- Cập nhật trạng thái bàn

**Endpoint:** `PUT /api/reservations/:id`

---

## 4.3. Quản lý (8 chức năng)

### 📊 Dashboard & Báo cáo ⭐

**Biểu đồ doanh thu:**
- 🔵 Doanh thu tại chỗ
- 🟠 Doanh thu online
- 🟢 Tổng doanh thu

**Lọc theo thời gian:**
- 7 ngày qua
- 30 ngày qua
- Tất cả thời gian
- Tùy chỉnh

**Technical Stack:**
```javascript
// Frontend
<LineChart data={revenueChartData}>
  <Line dataKey="inStoreRevenue" stroke="#3b82f6" />
  <Line dataKey="onlineRevenue" stroke="#f59e0b" />
  <Line dataKey="totalRevenue" stroke="#10b981" strokeWidth={3} />
</LineChart>

// API
GET /api/analytics/bieu-do-doanh-thu?start_date=2025-10-28&end_date=2025-11-04

// Database
CALL SP_DoanhThuTheoNgay('2025-10-28', '2025-11-04');
```

**Stored Procedure:**
```sql
CREATE PROCEDURE SP_DoanhThuTheoNgay(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    WITH RECURSIVE DateRange AS (...),
    DoanhThuTaiCho AS (...),
    DoanhThuOnline AS (...)
    
    SELECT 
        dr.Ngay,
        COALESCE(tc.DoanhThu, 0) AS DoanhThuTaiCho,
        COALESCE(ol.DoanhThu, 0) AS DoanhThuOnline,
        COALESCE(tc.DoanhThu, 0) + COALESCE(ol.DoanhThu, 0) AS TongDoanhThu
    FROM DateRange dr
    LEFT JOIN DoanhThuTaiCho tc ON dr.Ngay = tc.Ngay
    LEFT JOIN DoanhThuOnline ol ON dr.Ngay = ol.Ngay
    ORDER BY dr.Ngay;
END
```

### 🍽️ Quản lý thực đơn
- CRUD món ăn/đồ uống
- Quản lý danh mục
- Upload hình ảnh
- Cập nhật giá, trạng thái

**Endpoint:** `/api/menu`

### 🪑 Quản lý bàn & khu vực
- CRUD bàn
- CRUD khu vực
- Cập nhật trạng thái (Trống/Đã đặt/Đang phục vụ)

**Endpoint:** `/api/tables`, `/api/areas`

### 👥 Quản lý người dùng
- Quản lý nhân viên (CRUD)
- Quản lý khách hàng
- Phân quyền (Admin/Manager/Staff)

**Endpoint:** `/api/users`, `/api/employees`

### 📦 Quản lý kho
- CRUD nguyên liệu
- Nhập/Xuất kho
- Cảnh báo hết hàng

**Endpoint:** `/api/inventory`

### 🗓️ Quản lý lịch làm việc
- Xếp ca làm cho nhân viên
- Duyệt nghỉ phép
- Báo cáo chấm công

**Endpoint:** `/api/schedules`, `/api/requests`

### 🎫 Quản lý voucher
- Tạo mã giảm giá
- Theo dõi sử dụng
- Hết hạn tự động

**Endpoint:** `/api/vouchers`

---

# 5. DATABASE

## 5.1. ERD - 15 bảng chính

### Nhóm User
1. **NhanVien** - Nhân viên
2. **KhachHang** - Khách hàng (có điểm tích lũy)

### Nhóm Menu
3. **LoaiMon** - Danh mục
4. **Mon** - Món ăn/đồ uống

### Nhóm Table
5. **KhuVuc** - Khu vực quán
6. **Ban** - Bàn
7. **DatBan** - Đơn đặt bàn

### Nhóm Order
8. **DonHang** - Đơn hàng tại chỗ
9. **CTDonHang** - Chi tiết đơn hàng
10. **DonHangOnline** - Đơn online
11. **CTDonHangOnline** - Chi tiết online
12. **ThanhToan** - Thanh toán

### Nhóm Others
13. **Kho** - Quản lý kho
14. **Voucher** - Mã giảm giá
15. **LichLamViec** - Lịch làm việc

## 5.2. Stored Procedures

```sql
1. SP_DoanhThuTheoNgay(NgayBatDau, NgayKetThuc)
   → Biểu đồ doanh thu theo ngày

2. TinhTongDoanhThu()
   → Tổng doanh thu toàn hệ thống

3. DoanhThuTheoMon(NgayBatDau, NgayKetThuc)
   → Doanh thu từng món

4. XepHangMonBanChay(NgayBatDau, NgayKetThuc, Limit)
   → Top sản phẩm bán chạy

5. DoanhThuTheoDanhMuc(NgayBatDau, NgayKetThuc)
   → Doanh thu theo loại món
```

---

# 6. KẾT LUẬN

## 6.1. Điểm mạnh

✅ **Kiến trúc Microservices:** Dễ mở rộng, maintain  
✅ **Biểu đồ real-time:** Stored procedure nhanh  
✅ **UI/UX đẹp:** TailwindCSS + Recharts  
✅ **Security:** JWT + Bcrypt + Rate limiting  
✅ **Full-stack:** Frontend + Backend + Database  

## 6.2. Tính năng nổi bật

🌟 **Biểu đồ doanh thu:** Phân tích tại chỗ vs online  
🌟 **POS System:** Bán hàng nhanh, tiện lợi  
🌟 **Đặt hàng online:** Tăng doanh thu  
🌟 **Điểm tích lũy:** Giữ chân khách hàng  

## 6.3. Kết quả đạt được

📊 **18+ Use Cases** triển khai đầy đủ  
🎯 **4 Microservices** + API Gateway tích hợp Inventory  
💾 **15 bảng database** chuẩn hóa  
📈 **4+ Stored Procedures** tối ưu  
🎨 **12+ Trang quản lý** UI đẹp  

---

## 📚 TÀI LIỆU THAM KHẢO

- `use-case-diagram.md` - Sơ đồ Use Case
- `use-case-chi-tiet.md` - UC16 chi tiết
- `QuanLyCaFe.sql` - Database schema
- `README.md` - Hướng dẫn cài đặt

---

**Document version:** 1.0  
**Last updated:** 04/11/2025  
**Status:** ✅ Production Ready
