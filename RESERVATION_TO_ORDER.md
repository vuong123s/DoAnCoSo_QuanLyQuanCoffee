# Hệ Thống Chuyển Đổi Đặt Bàn Thành Đơn Hàng

## Tổng Quan

Hệ thống cho phép chuyển đổi đơn đặt bàn thành đơn hàng bán tại chỗ khi khách đến. Khi nhấn nút "Chuyển sang bán hàng", hệ thống sẽ tự động:
- ✅ Tạo đơn hàng mới (DonHang) liên kết với đặt bàn (MaDat)
- ✅ Cập nhật trạng thái đặt bàn thành "Hoàn thành"
- ✅ Chuyển đến trang bán hàng để tiếp tục phục vụ

---

## 🎯 Tính Năng Chính

### 1. Liên kết Database
- Bảng `DonHang` có cột `MaDat` để liên kết với bảng `DatBan`
- Foreign key constraint đảm bảo tính toàn vẹn dữ liệu

### 2. Chuyển đổi tự động
- ✅ Tạo đơn hàng với thông tin từ đặt bàn
- ✅ Kế thừa: MaBan, MaKH (nếu có)
- ✅ Gán nhân viên hiện tại (MaNV)
- ✅ Khởi tạo với trạng thái "Đang xử lý"

### 3. UI/UX
- ✅ Nút "Chuyển sang bán hàng" (icon shopping cart) ở quản lý đặt bàn
- ✅ Chỉ hiện với đặt bàn trạng thái "Đã đặt" hoặc "Đã xác nhận"
- ✅ Loading toast khi đang xử lý
- ✅ Tự động chuyển trang sau khi thành công

---

## 📊 Database Schema

### Bảng DonHang
```sql
CREATE TABLE DonHang (
    MaDH INT AUTO_INCREMENT PRIMARY KEY,
    MaDat INT,                    -- Liên kết với đơn đặt bàn
    MaKH INT,                     -- Mã khách hàng (để cộng điểm)
    MaBan INT,
    MaNV INT,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(12,2),
    TrangThai VARCHAR(20) DEFAULT 'Chờ thanh toán',
    FOREIGN KEY (MaDat) REFERENCES DatBan(MaDat),
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);
```

### Quan hệ
```
DatBan (1) -----> (0..1) DonHang
  |
  |-- MaDat (PK) = MaDat (FK) trong DonHang
  |-- MaBan được copy sang DonHang
  |-- MaKH được copy sang DonHang (nếu có)
```

---

## 🔧 Implementation

### Backend Components

#### 1. Billing Service

**Controller:** `reservationOrderController.js`
```javascript
// Chuyển đổi đặt bàn thành đơn hàng
convertReservationToOrder(req, res)
  - Input: { MaDat, MaNV, items[] }
  - Logic:
    1. Lấy thông tin đặt bàn từ table-service
    2. Kiểm tra trạng thái (không chuyển đổi nếu đã hủy)
    3. Kiểm tra đã có đơn hàng chưa (tránh duplicate)
    4. Tạo DonHang mới với MaDat, MaKH, MaBan
    5. Thêm món ăn đã đặt trước (nếu có)
    6. Cập nhật trạng thái đặt bàn thành "Hoàn thành"
  - Output: { success, order, reservation }

// Lấy đơn hàng từ mã đặt bàn
getOrderByReservation(req, res)
  - Input: MaDat (params)
  - Output: { success, order }
```

**Routes:** `reservationOrderRoutes.js`
```javascript
POST   /api/reservation-orders/convert
GET    /api/reservation-orders/by-reservation/:id
```

#### 2. API Gateway

**Added Route:**
```javascript
app.use('/api/reservation-orders', createServiceProxy('Billing Service', 3004));
```

### Frontend Components

#### 1. ReservationManagement.jsx

**New Function:**
```javascript
const handleConvertToOrder = async (reservation) => {
  // 1. Hiển thị loading
  const loadingToast = toast.loading('Đang tạo đơn hàng...');
  
  // 2. Gọi API chuyển đổi
  const response = await billingAPI.convertReservationToOrder({
    MaDat: reservation.MaDat,
    MaNV: user.id,
    items: []
  });
  
  // 3. Chuyển đến trang Sales với order ID
  navigate('/admin/sales', { 
    state: { 
      orderId: response.data.order.MaDH,
      fromReservation: true,
      reservationInfo: {...}
    } 
  });
}
```

**UI Button:**
```jsx
{(reservation.TrangThai === 'Đã đặt' || 
  reservation.TrangThai === 'Đã xác nhận') && (
  <button
    onClick={() => handleConvertToOrder(reservation)}
    className="text-green-600 hover:text-green-800"
    title="Chuyển sang bán hàng"
  >
    <FiShoppingCart className="w-4 h-4" />
  </button>
)}
```

#### 2. API Service

**Added to billingAPI:**
```javascript
export const billingAPI = {
  convertReservationToOrder: (data) => 
    api.post('/api/reservation-orders/convert', data),
  getOrderByReservation: (reservationId) => 
    api.get(`/api/reservation-orders/by-reservation/${reservationId}`)
}
```

---

## 🚀 Workflow Sử Dụng

### Kịch bản 1: Khách đến theo đặt bàn

1. **Nhân viên vào trang Quản lý đặt bàn**
   - Xem danh sách đặt bàn hôm nay
   - Tìm đặt bàn của khách

2. **Nhấn nút "Chuyển sang bán hàng" (icon giỏ hàng)**
   - Hệ thống tạo đơn hàng tự động
   - Loading toast hiển thị "Đang tạo đơn hàng..."

3. **Tự động chuyển sang trang Bán hàng**
   - Đơn hàng đã được tạo với bàn từ đặt bàn
   - Nhân viên thêm món ăn theo yêu cầu khách
   - Xử lý thanh toán bình thường

### Kịch bản 2: Đặt bàn có đặt món trước

```javascript
// Trong tương lai có thể mở rộng
const response = await billingAPI.convertReservationToOrder({
  MaDat: reservation.MaDat,
  MaNV: user.id,
  items: [
    { MaMon: 1, SoLuong: 2, DonGia: 35000, GhiChu: "Ít đá" },
    { MaMon: 5, SoLuong: 1, DonGia: 45000 }
  ]
});
```

---

## 📝 API Examples

### 1. Convert Reservation to Order

**Request:**
```http
POST http://localhost:3000/api/reservation-orders/convert
Content-Type: application/json
Authorization: Bearer {token}

{
  "MaDat": 5,
  "MaNV": 2,
  "items": []
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Chuyển đổi đặt bàn thành đơn hàng thành công",
  "order": {
    "MaDH": 10,
    "MaDat": 5,
    "MaKH": 3,
    "MaBan": 8,
    "MaNV": 2,
    "TongTien": 0,
    "TrangThai": "Đang xử lý",
    "NgayLap": "2024-02-02T10:30:00.000Z"
  },
  "reservation": {
    "MaDat": 5,
    "MaBan": 8,
    "TenKhach": "Nguyễn Văn A"
  }
}
```

**Already Exists Response:**
```json
{
  "success": true,
  "message": "Đơn hàng đã tồn tại cho đặt bàn này",
  "order": { ... },
  "alreadyExists": true
}
```

### 2. Get Order by Reservation

**Request:**
```http
GET http://localhost:3000/api/reservation-orders/by-reservation/5
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "MaDH": 10,
    "MaDat": 5,
    "MaKH": 3,
    "MaBan": 8,
    "TongTien": 150000,
    "TrangThai": "Đang xử lý",
    "chitiet": [
      {
        "MaMon": 1,
        "SoLuong": 2,
        "DonGia": 35000,
        "ThanhTien": 70000
      }
    ]
  }
}
```

---

## 🔍 Business Logic

### Kiểm tra trạng thái
```javascript
// Chỉ chuyển đổi nếu:
- TrangThai === 'Đã đặt' HOẶC
- TrangThai === 'Đã xác nhận'

// Không chuyển đổi nếu:
- TrangThai === 'Đã hủy'
- TrangThai === 'Hoàn thành' (đã chuyển rồi)
```

### Tránh duplicate
```javascript
// Kiểm tra xem đã có đơn hàng chưa
const existingOrder = await DonHang.findOne({
  where: { MaDat: parseInt(MaDat) }
});

if (existingOrder) {
  return { success: true, alreadyExists: true, order: existingOrder };
}
```

### Cập nhật trạng thái đặt bàn
```javascript
// Sau khi tạo đơn hàng, đánh dấu đặt bàn là "Hoàn thành"
await axios.patch(
  `http://localhost:3003/api/reservations/${MaDat}/status`,
  { TrangThai: 'Hoàn thành' }
);
```

---

## 🎨 UI/UX Design

### Button States

**Hiển thị button khi:**
- Trạng thái = "Đã đặt" HOẶC "Đã xác nhận"
- Màu xanh lá (green-600)
- Icon: FiShoppingCart

**Ẩn button khi:**
- Trạng thái = "Đã hủy"
- Trạng thái = "Hoàn thành"

### User Feedback

```javascript
// Loading
toast.loading('Đang tạo đơn hàng...');

// Success
toast.success('Đã tạo đơn hàng thành công!');
// + Auto navigate to sales page

// Error
toast.error('Có lỗi khi tạo đơn hàng');
```

---

## 🔐 Security & Validation

### Backend Validation
- ✅ Kiểm tra MaDat có tồn tại
- ✅ Kiểm tra trạng thái đặt bàn hợp lệ
- ✅ Kiểm tra không duplicate đơn hàng
- ✅ Validate MaNV (nhân viên hiện tại)

### Frontend Validation
- ✅ Kiểm tra user đã login
- ✅ Chỉ hiện button cho trạng thái phù hợp
- ✅ Loading state khi đang xử lý

---

## 📈 Future Enhancements

### 1. Đặt món trước khi đặt bàn
```javascript
// Trong form đặt bàn, thêm section chọn món
const [preOrderItems, setPreOrderItems] = useState([]);

// Khi tạo đặt bàn, lưu món vào bảng riêng
// Khi chuyển đổi, tự động thêm món đã đặt
```

### 2. Thông báo cho kitchen
```javascript
// Sau khi chuyển đổi, gửi notification
await notifyKitchen({
  orderId: newOrder.MaDH,
  items: preOrderItems,
  priority: 'high' // Khách đã đến
});
```

### 3. Tích hợp với check-in
```javascript
// QR code check-in cho khách đặt bàn
// Tự động chuyển đổi khi khách scan
```

### 4. History & Analytics
```javascript
// Thống kê:
// - Tỷ lệ khách đến theo đặt bàn
// - Thời gian trung bình từ đặt bàn đến thanh toán
// - Revenue từ đặt bàn vs walk-in
```

---

## 🐛 Troubleshooting

### Vấn đề: Không tạo được đơn hàng

**Kiểm tra:**
1. ✅ Đặt bàn có tồn tại không? (MaDat)
2. ✅ Trạng thái đặt bàn hợp lệ? (Đã đặt/Đã xác nhận)
3. ✅ Đã có đơn hàng cho đặt bàn này chưa?
4. ✅ Billing service đang chạy? (port 3004)
5. ✅ Table service đang chạy? (port 3003)

**Logs:**
```bash
# Billing Service
🔄 Converting reservation to order: { MaDat: 5, MaNV: 2 }
✅ Found reservation: { MaDat: 5, MaBan: 8 }
✅ Created order: 10
✅ Updated reservation status to Hoàn thành
```

### Vấn đề: Không chuyển trang sau khi tạo

**Kiểm tra:**
1. ✅ Response có chứa `order.MaDH`?
2. ✅ `navigate` function hoạt động?
3. ✅ Route `/admin/sales` có tồn tại?

---

## 📞 Testing

### Manual Testing Steps

1. **Tạo đặt bàn:**
```http
POST /api/reservations
{
  "MaBan": 5,
  "NgayDat": "2024-02-03",
  "GioDat": "18:00",
  "GioKetThuc": "20:00",
  "SoNguoi": 4,
  "TenKhach": "Test Customer",
  "SoDienThoai": "0901234567"
}
```

2. **Chuyển đổi thành đơn hàng:**
```http
POST /api/reservation-orders/convert
{
  "MaDat": 1,
  "MaNV": 1
}
```

3. **Kiểm tra đơn hàng:**
```http
GET /api/billing/10
```

4. **Verify trong database:**
```sql
SELECT * FROM DonHang WHERE MaDat = 1;
SELECT * FROM DatBan WHERE MaDat = 1;
-- TrangThai của DatBan phải là "Hoàn thành"
```

---

## 📊 Integration Flow

```
[ReservationManagement]
         |
         | 1. User clicks "Chuyển sang bán hàng"
         v
[handleConvertToOrder()]
         |
         | 2. POST /api/reservation-orders/convert
         v
[API Gateway:3000]
         |
         | 3. Proxy to Billing Service
         v
[Billing Service:3004]
         |
         | 4. GET reservation from Table Service
         v
[Table Service:3003]
         |
         | 5. Return reservation data
         v
[Billing Service]
         |
         | 6. Create DonHang with MaDat
         | 7. Update DatBan status to "Hoàn thành"
         v
[Database: DonHang, DatBan]
         |
         | 8. Return order data
         v
[Frontend]
         |
         | 9. Navigate to /admin/sales with orderId
         v
[SalesManagement Page]
```

---

## ✅ Checklist Implementation

- [x] Database có cột MaDat trong DonHang
- [x] Foreign key constraint DonHang.MaDat -> DatBan.MaDat
- [x] Backend: reservationOrderController.js
- [x] Backend: reservationOrderRoutes.js
- [x] Billing Service: Register routes
- [x] API Gateway: Add proxy route
- [x] Frontend: billingAPI methods
- [x] Frontend: handleConvertToOrder function
- [x] Frontend: UI button với icon
- [x] Testing: API endpoints
- [x] Documentation: This file

---

**Created:** 2025-02-02  
**Version:** 1.0.0  
**Author:** Coffee Shop Dev Team
