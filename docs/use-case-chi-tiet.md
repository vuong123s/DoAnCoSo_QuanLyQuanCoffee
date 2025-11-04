# USE CASE CHI TIẾT - HỆ THỐNG QUẢN LÝ QUÁN COFFEE

## USE CASE 1: XEM BÁO CÁO & PHÂN TÍCH DOANH THU

### 📋 Thông tin cơ bản
- **Use Case ID:** UC16
- **Use Case Name:** Xem báo cáo & phân tích doanh thu
- **Actor:** Quản lý (Admin/Manager)
- **Mức độ ưu tiên:** 🔴 Critical
- **Trạng thái:** ✅ Đã triển khai

---

### 🎯 Mục đích
Cho phép quản lý xem biểu đồ doanh thu theo thời gian, phân tích xu hướng kinh doanh để đưa ra quyết định quản lý phù hợp.

---

### 📝 Mô tả ngắn gọn
Quản lý đăng nhập vào hệ thống, truy cập trang Dashboard, chọn khoảng thời gian (7 ngày, 30 ngày, tùy chỉnh) để xem biểu đồ doanh thu chi tiết, bao gồm doanh thu tại chỗ và doanh thu online.

---

### 🎬 Preconditions (Điều kiện tiên quyết)
1. Quản lý đã đăng nhập vào hệ thống
2. Quản lý có quyền Admin hoặc Manager
3. Hệ thống có dữ liệu đơn hàng trong database
4. Stored procedure `SP_DoanhThuTheoNgay` đã được tạo trong database

---

### ✅ Postconditions (Điều kiện hậu kỳ)
1. Biểu đồ doanh thu được hiển thị trên màn hình
2. Dữ liệu được tổng hợp theo từng ngày
3. Quản lý có thể phân tích xu hướng kinh doanh

---

### 📊 Main Flow (Luồng chính)

**Bước 1: Truy cập Dashboard**
- Quản lý click vào menu "Dashboard" trên sidebar
- Hệ thống chuyển đến trang `/admin/dashboard`
- Component `Dashboard.jsx` được load

**Bước 2: Chọn khoảng thời gian**
- Hệ thống mặc định hiển thị **7 ngày qua**
- Quản lý có thể chọn:
  - ⏰ **7 ngày qua** (dateRange = 'week')
  - 📅 **30 ngày qua** (dateRange = 'month')
  - 🗓️ **Tất cả thời gian** (dateRange = 'all')
  - 🎯 **Tùy chỉnh** (chọn ngày bắt đầu & kết thúc)

**Bước 3: Hệ thống xử lý**
```javascript
// Frontend: Dashboard.jsx
useEffect(() => {
  fetchAnalytics(); // Tự động gọi khi dateRange thay đổi
}, [dateRange, customStartDate, customEndDate]);

// API Call
const chartDataRes = await analyticsAPI.getRevenueChartData({ 
  start_date: startDateStr, 
  end_date: endDateStr 
});
```

**Bước 4: Backend xử lý**
```javascript
// API Gateway: analyticsController.js
exports.getRevenueChartData = async (req, res) => {
  const [results] = await db.query(
    'CALL SP_DoanhThuTheoNgay(?, ?)',
    [start_date, end_date]
  );
  
  // Format dữ liệu
  const chartData = results[0].map(row => ({
    date: formatDate(row.Ngay),
    inStoreRevenue: parseFloat(row.DoanhThuTaiCho || 0),
    onlineRevenue: parseFloat(row.DoanhThuOnline || 0),
    totalRevenue: parseFloat(row.TongDoanhThu || 0),
    inStoreOrders: parseInt(row.SoDonTaiCho || 0),
    onlineOrders: parseInt(row.SoDonOnline || 0),
    totalOrders: parseInt(row.TongSoDon || 0)
  }));
  
  res.json({ success: true, data: chartData });
};
```

**Bước 5: Database xử lý**
```sql
-- Stored Procedure: SP_DoanhThuTheoNgay
-- 1. Tạo tất cả các ngày trong khoảng thời gian
WITH RECURSIVE DateRange AS (...)

-- 2. Tính doanh thu tại chỗ từ bảng DonHang
DoanhThuTaiCho AS (
  SELECT DATE(NgayLap) AS Ngay,
         SUM(TongTien) AS DoanhThu,
         COUNT(*) AS SoDon
  FROM DonHang
  WHERE DATE(NgayLap) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    AND TrangThai != 'Đã hủy'
  GROUP BY DATE(NgayLap)
)

-- 3. Tính doanh thu online từ bảng DonHangOnline
DoanhThuOnline AS (
  SELECT DATE(NgayDat) AS Ngay,
         SUM(TongTien) AS DoanhThu,
         COUNT(*) AS SoDon
  FROM DonHangOnline
  WHERE DATE(NgayDat) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    AND TrangThai NOT IN ('Đã hủy', 'Chờ xác nhận')
  GROUP BY DATE(NgayDat)
)

-- 4. Kết hợp tất cả
SELECT dr.Ngay,
       COALESCE(tc.DoanhThu, 0) AS DoanhThuTaiCho,
       COALESCE(ol.DoanhThu, 0) AS DoanhThuOnline,
       COALESCE(tc.DoanhThu, 0) + COALESCE(ol.DoanhThu, 0) AS TongDoanhThu
FROM DateRange dr
LEFT JOIN DoanhThuTaiCho tc ON dr.Ngay = tc.Ngay
LEFT JOIN DoanhThuOnline ol ON dr.Ngay = ol.Ngay
ORDER BY dr.Ngay
```

**Bước 6: Hiển thị biểu đồ**
```jsx
// Frontend: Recharts LineChart
<LineChart data={revenueChartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip formatter={(value) => format(value) + 'đ'} />
  <Legend />
  
  <Line dataKey="inStoreRevenue" stroke="#3b82f6" name="Tại chỗ" />
  <Line dataKey="onlineRevenue" stroke="#f59e0b" name="Online" />
  <Line dataKey="totalRevenue" stroke="#10b981" name="Tổng" strokeWidth={3} />
</LineChart>
```

**Bước 7: Hiển thị thông tin bổ sung**
- 📅 **Khoảng thời gian:** "7 ngày qua" / "30 ngày qua" / "Tất cả thời gian"
- 💰 **Tổng doanh thu:** Tính tổng của tất cả các điểm dữ liệu
- 📊 **Số điểm dữ liệu:** Số ngày có trong biểu đồ

---

### 🔄 Alternative Flows (Luồng thay thế)

#### Alt 1: Không có dữ liệu
**Điều kiện:** Database không có đơn hàng nào trong khoảng thời gian đã chọn
```
1. Stored procedure trả về các ngày với doanh thu = 0
2. Frontend hiển thị biểu đồ với đường thẳng tại y = 0
3. Message: "Chưa có dữ liệu"
```

#### Alt 2: Lỗi kết nối database
**Điều kiện:** Database không phản hồi
```
1. Backend catch error và trả về { success: false, error: '...' }
2. Frontend hiển thị empty state với icon
3. Message: "Không thể tải dữ liệu. Vui lòng thử lại"
```

#### Alt 3: Chọn khoảng thời gian không hợp lệ
**Điều kiện:** Ngày bắt đầu > Ngày kết thúc
```
1. Frontend validate trước khi gọi API
2. Hiển thị toast error
3. Message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
```

---

### 🎨 UI/UX Design

#### Giao diện Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  ☰ Coffee Shop Dashboard                          [User] ▼  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 Phân tích & Báo cáo                                       │
│                                                               │
│  Chọn khoảng thời gian:                                      │
│  ⭕ 7 ngày qua  ⭕ 30 ngày qua  ⭕ Tất cả  ⭕ Tùy chỉnh       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📈 Biểu đồ doanh thu theo thời gian     💰 2,500,000đ       │
│     7 ngày qua                              Tổng doanh thu   │
│                                                               │
│      ^                                                        │
│  1M  │                    ●                                   │
│      │               ●         ●                              │
│      │          ●                  ●                          │
│ 500K │     ●                           ●                      │
│      │●                                    ●                  │
│      └────────────────────────────────────────>              │
│       1/11  2/11  3/11  4/11  5/11  6/11  7/11               │
│                                                               │
│   ── Doanh thu tại chỗ   ── Doanh thu online   ── Tổng      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Màu sắc
- 🔵 **Xanh dương (#3b82f6):** Doanh thu tại chỗ
- 🟠 **Cam (#f59e0b):** Doanh thu online
- 🟢 **Xanh lá (#10b981):** Tổng doanh thu (line đậm hơn)

---

### 📱 Technical Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │      │  API Gateway │      │   Database   │
└──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        │ GET /admin/dashboard│                     │
        │────────────────────>│                     │
        │                     │                     │
        │    Dashboard.jsx    │                     │
        │<────────────────────│                     │
        │                     │                     │
        │ useEffect triggers  │                     │
        │ fetchAnalytics()    │                     │
        │                     │                     │
        │ GET /api/analytics/ │                     │
        │     bieu-do-doanh-thu                     │
        │────────────────────>│                     │
        │                     │ CALL SP_DoanhThu    │
        │                     │     TheoNgay(...)   │
        │                     │────────────────────>│
        │                     │                     │
        │                     │  Query DonHang +    │
        │                     │  DonHangOnline      │
        │                     │<────────────────────│
        │                     │                     │
        │  JSON chartData     │                     │
        │<────────────────────│                     │
        │                     │                     │
        │ Render LineChart    │                     │
        │ with Recharts       │                     │
        │                     │                     │
```

---

### 🧪 Test Cases

#### TC1: Xem biểu đồ 7 ngày qua (Happy Path)
```
Precondition: Database có ít nhất 7 đơn hàng trong 7 ngày qua
Steps:
  1. Đăng nhập với tài khoản Admin
  2. Click vào menu "Dashboard"
  3. Chọn "7 ngày qua"
Expected Result:
  - Biểu đồ hiển thị 7 điểm dữ liệu
  - Mỗi điểm tương ứng với 1 ngày
  - Tổng doanh thu được tính đúng
  - 3 đường: Tại chỗ, Online, Tổng
Status: ✅ PASS
```

#### TC2: Xem biểu đồ khoảng thời gian không có dữ liệu
```
Precondition: Database không có đơn hàng trong khoảng thời gian
Steps:
  1. Đăng nhập với tài khoản Admin
  2. Click vào menu "Dashboard"
  3. Chọn "Tùy chỉnh" → Chọn khoảng thời gian không có đơn
Expected Result:
  - Biểu đồ hiển thị các điểm với giá trị 0
  - Message: "Chưa có dữ liệu"
Status: ✅ PASS
```

#### TC3: Chọn ngày không hợp lệ
```
Steps:
  1. Đăng nhập với tài khoản Admin
  2. Click vào menu "Dashboard"
  3. Chọn "Tùy chỉnh"
  4. Chọn ngày bắt đầu > ngày kết thúc
  5. Click "Áp dụng"
Expected Result:
  - Toast error hiển thị
  - Biểu đồ không thay đổi
Status: ⚠️ CẦN IMPLEMENT VALIDATION
```

---

### 🔐 Security & Performance

#### Security
- ✅ Yêu cầu authentication (JWT token)
- ✅ Phân quyền: Chỉ Admin/Manager mới truy cập
- ✅ SQL Injection prevention: Sử dụng prepared statements
- ✅ Rate limiting: Giới hạn số request/phút

#### Performance
- ✅ **Database indexing:**
  ```sql
  CREATE INDEX idx_donhang_ngaylap ON DonHang(NgayLap, TrangThai);
  CREATE INDEX idx_donhangonline_ngaydat ON DonHangOnline(NgayDat, TrangThai);
  ```
- ✅ **Caching:** Cache kết quả trong 5 phút
- ✅ **Lazy loading:** Chỉ load biểu đồ khi vào tab Dashboard
- ✅ **Debouncing:** Không gọi API liên tục khi chọn ngày

---

### 📈 Business Value

#### KPIs được theo dõi
1. **Doanh thu tổng:** Tổng tiền từ tất cả đơn hàng
2. **Doanh thu tại chỗ:** Doanh thu từ POS
3. **Doanh thu online:** Doanh thu từ đặt hàng online
4. **Tỷ lệ online/offline:** So sánh 2 kênh bán hàng

#### Insights (Thông tin chi tiết)
- 📊 **Xu hướng:** Doanh thu tăng/giảm theo thời gian
- 📅 **Ngày cao điểm:** Xác định ngày bán chạy nhất
- 🎯 **Kênh hiệu quả:** Online hay tại chỗ tốt hơn
- 💡 **Quyết định:** Tăng nhân viên vào ngày cao điểm

---

## TỔNG KẾT USE CASE

### ✅ Đã triển khai
- [x] Frontend: Dashboard.jsx với LineChart
- [x] API: `/api/analytics/bieu-do-doanh-thu`
- [x] Database: Stored Procedure `SP_DoanhThuTheoNgay`
- [x] Auto-refresh khi thay đổi khoảng thời gian

### 🎯 Điểm mạnh
- Dữ liệu real-time từ database
- UI/UX đẹp với Recharts
- Phân tích chi tiết tại chỗ vs online
- Performance tốt với stored procedure

### 🔧 Cần cải thiện
- [ ] Thêm validation cho custom date range
- [ ] Export biểu đồ ra PDF/Excel
- [ ] So sánh với tháng trước
- [ ] Thêm filter theo nhân viên/khu vực

---

**Document version:** 1.0  
**Last updated:** 2025-11-04  
**Status:** ✅ Production Ready
