# Hệ Thống Điểm Tích Lũy (Loyalty Points System)

## Tổng Quan

Hệ thống tự động cộng điểm tích lũy cho khách hàng khi đơn hàng hoàn thành (cả đơn hàng tại quán và đơn hàng online).

**Quy tắc tính điểm:** 1 điểm = 10,000 VNĐ

---

## 🎯 Tính Năng Chính

### 1. Tự động cộng điểm
- ✅ Khi đơn hàng tại quán (DonHang) chuyển sang "Hoàn thành"
- ✅ Khi đơn hàng online (DonHangOnline) chuyển sang "Hoàn thành"
- ✅ Chỉ cộng điểm 1 lần (kiểm tra trạng thái trước đó)
- ✅ Chỉ cộng điểm nếu có MaKH (khách hàng đã đăng ký)

### 2. Quản lý điểm
- ✅ API cộng điểm
- ✅ API trừ điểm (khi khách dùng điểm)
- ✅ Xem điểm hiện tại

---

## 📊 Database Changes

### Bảng DonHang (Đơn Hàng Tại Quán)

**Thêm cột mới:**
```sql
ALTER TABLE DonHang 
ADD COLUMN MaKH INT AFTER MaDat,
ADD CONSTRAINT fk_donhang_khachhang 
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH);
```

**Script migration:** `scripts/add-customer-to-donhang.sql`

### Bảng DonHangOnline

Đã có sẵn cột `MaKH` - không cần thay đổi.

---

## 🔧 Implementation Details

### 1. Backend Components

#### User Service (Port 3001)

**Files Created:**
- `controllers/customerController.js` - Controller quản lý điểm
- `routes/customerRoutes.js` - Routes cho API điểm

**API Endpoints:**
```javascript
POST   /api/customers/:id/add-points      // Cộng điểm
POST   /api/customers/:id/deduct-points   // Trừ điểm
GET    /api/customers/:id/points-history  // Xem lịch sử điểm
```

**Example Request:**
```json
POST http://localhost:3001/api/customers/1/add-points
Content-Type: application/json

{
  "points": 5
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Cộng điểm thành công",
  "customer": {
    "MaKH": 1,
    "HoTen": "Nguyễn Văn A",
    "DiemTichLuy": 105,
    "pointsAdded": 5
  }
}
```

#### Billing Service (Port 3004)

**Files Created:**
- `utils/loyaltyPoints.js` - Utility functions cho loyalty points

**Files Updated:**
- `controllers/billingController.js` - Thêm logic cộng điểm khi DonHang hoàn thành
- `controllers/onlineOrderController.js` - Thêm logic cộng điểm khi DonHangOnline hoàn thành
- `models/Bill.js` - Thêm cột MaKH vào model DonHang

**Key Functions:**
```javascript
// Tính số điểm từ tổng tiền
calculatePoints(amount) 
// => Math.floor(amount / 10000)

// Cộng điểm cho khách hàng
addPointsToCustomer(customerId, points)

// Xử lý cộng điểm khi đơn hoàn thành
processOrderPoints(customerId, totalAmount, orderType, orderId)
```

#### API Gateway (Port 3000)

**Routes Added:**
```javascript
app.use('/api/customers', createServiceProxy('User Service', 3001));
```

---

## 🚀 Cách Sử Dụng

### 1. Chạy Migration Database

```bash
# Chạy script SQL để thêm cột MaKH vào bảng DonHang
mysql -u root -p QuanLyCaFe < scripts/add-customer-to-donhang.sql
```

### 2. Restart Services

```bash
# Terminal 1 - User Service
cd services/user-service
npm start

# Terminal 2 - Billing Service  
cd services/billing-service
npm start

# Terminal 3 - API Gateway
cd api-gateway
npm start
```

### 3. Tạo Đơn Hàng Với Khách Hàng

**Đơn Hàng Tại Quán:**
```javascript
POST /api/billing
{
  "MaKH": 1,          // Mã khách hàng
  "MaBan": 5,
  "MaNV": 1,
  "items": [
    { "MaMon": 1, "SoLuong": 2, "DonGia": 35000 }
  ]
}
```

**Đơn Hàng Online:**
```javascript
POST /api/online-orders
{
  "MaKH": 1,          // Mã khách hàng
  "TenKhach": "Nguyễn Văn A",
  "SDTKhach": "0901234567",
  "DiaChiGiaoHang": "123 Đường ABC",
  "items": [...]
}
```

### 4. Hoàn Thành Đơn Hàng

**Cập nhật trạng thái:**
```javascript
PATCH /api/billing/:id/status
{
  "TrangThai": "Hoàn thành"
}

// hoặc

PATCH /api/online-orders/:id/status
{
  "TrangThai": "Hoàn thành"
}
```

**Hệ thống sẽ tự động:**
1. ✅ Kiểm tra có MaKH không
2. ✅ Tính số điểm: `Math.floor(TongTien / 10000)`
3. ✅ Gọi API `POST /api/customers/:id/add-points`
4. ✅ Cộng điểm vào `KhachHang.DiemTichLuy`
5. ✅ Log kết quả

---

## 📝 Logging Examples

**Khi đơn hàng hoàn thành:**
```
🎁 Processing loyalty points for order #5, customer #1
✅ Added 7 points to customer 1 (70000 VNĐ / 10000 = 7 points)
✅ Successfully added 7 points to customer 1
```

**Khi cộng điểm thành công:**
```
✅ Added 7 points to customer 1 (100 → 107)
```

**Khi không có khách hàng:**
```
⚠️ Failed to add points to customer undefined: No customer ID provided
```

---

## 🔍 Testing

### 1. Test Database Migration

```sql
-- Kiểm tra cột MaKH đã được thêm
DESCRIBE DonHang;

-- Kết quả mong đợi:
-- MaKH | int | YES | MUL | NULL | 
```

### 2. Test API Cộng Điểm

```bash
# Test trực tiếp user-service
curl -X POST http://localhost:3001/api/customers/1/add-points \
  -H "Content-Type: application/json" \
  -d '{"points": 10}'
```

### 3. Test End-to-End

```bash
# 1. Tạo đơn hàng với khách hàng
POST /api/billing
{
  "MaKH": 1,
  "MaBan": 5,
  "MaNV": 1,
  "items": [{"MaMon": 1, "SoLuong": 2, "DonGia": 50000}]
}

# 2. Hoàn thành đơn hàng
PATCH /api/billing/1/status
{
  "TrangThai": "Hoàn thành"
}

# 3. Kiểm tra điểm khách hàng
GET /api/auth/profile  (với token của khách hàng)

# Kết quả: DiemTichLuy tăng lên 10 điểm (100000 / 10000)
```

---

## ⚙️ Configuration

### Thay đổi quy tắc tính điểm

**File:** `services/billing-service/utils/loyaltyPoints.js`

```javascript
// Hiện tại: 1 điểm = 10,000 VNĐ
const POINTS_PER_AMOUNT = 10000;

// Muốn thay đổi thành 1 điểm = 20,000 VNĐ:
const POINTS_PER_AMOUNT = 20000;
```

---

## 🐛 Troubleshooting

### Vấn đề: Không cộng điểm sau khi hoàn thành

**Kiểm tra:**
1. ✅ Đơn hàng có `MaKH` không?
2. ✅ User-service đang chạy không?
3. ✅ API Gateway có route `/api/customers` không?
4. ✅ Xem logs của billing-service

**Solution:**
```bash
# Kiểm tra logs
docker logs billing-service -f
# hoặc
tail -f services/billing-service/logs/app.log
```

### Vấn đề: Foreign Key Constraint Fails

**Error:** `Cannot add or update a child row: a foreign key constraint fails`

**Solution:**
```sql
-- Kiểm tra MaKH có tồn tại trong bảng KhachHang
SELECT * FROM KhachHang WHERE MaKH = 1;

-- Nếu không tồn tại, tạo khách hàng trước
INSERT INTO KhachHang (HoTen, Email, SDT, MatKhau) 
VALUES ('Test User', 'test@test.com', '0901234567', 'password');
```

---

## 📱 Frontend Integration

### Hiển thị điểm tích lũy

**Profile Component:**
```jsx
<div className="points-display">
  <label>Điểm tích lũy</label>
  <input 
    type="text" 
    value={profile.DiemTichLuy || 0} 
    disabled 
  />
</div>
```

### Thêm khách hàng vào đơn hàng

**Order Form:**
```jsx
<select name="MaKH" onChange={handleCustomerChange}>
  <option value="">Khách vãng lai</option>
  {customers.map(c => (
    <option key={c.MaKH} value={c.MaKH}>
      {c.HoTen} - {c.SDT}
    </option>
  ))}
</select>
```

---

## 🔐 Security Notes

- ✅ API `/api/customers` không yêu cầu authentication (internal calls only)
- ⚠️ Production: Nên thêm internal API key hoặc IP whitelist
- ✅ Profile API có authentication để xem điểm của mình
- ✅ Chỉ staff mới có thể tạo đơn với MaKH

---

## 📈 Future Enhancements

### Có thể thêm:
1. **Lịch sử điểm** - Bảng tracking mỗi lần cộng/trừ điểm
2. **Quy đổi điểm** - Dùng điểm để giảm giá đơn hàng
3. **Tầng membership** - VIP, Gold, Silver dựa trên điểm
4. **Điểm hết hạn** - Điểm chỉ có hiệu lực 1 năm
5. **Điểm thưởng đặc biệt** - X2 điểm vào cuối tuần
6. **Notification** - Thông báo khi được cộng điểm

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue hoặc liên hệ dev team.

**Created:** 2025-02-02  
**Version:** 1.0.0  
**Author:** Coffee Shop Dev Team
