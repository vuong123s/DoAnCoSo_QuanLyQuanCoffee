# Hướng dẫn triển khai hệ thống phân tích doanh thu

## Tổng quan
Đã tạo stored procedures trong database và API endpoints trong api-gateway để phân tích doanh thu từ đơn hàng đã thanh toán.

## 1. Database - Stored Procedures

### Đã thêm vào file `QuanLyCaFe.sql`:

#### 1.1. TinhTongDoanhThu()
- Tính tổng doanh thu từ tất cả đơn hàng đã thanh toán
- Trả về: TongDoanhThu, TongDonHang, SoNhanVienPhucVu, DoanhThuTrungBinh

#### 1.2. DoanhThuTheoKhoangThoiGian(startDate, endDate)
- Doanh thu theo từng ngày trong khoảng thời gian
- Trả về: Ngay, DoanhThu, SoDonHang, DoanhThuTrungBinh, SoBanPhucVu

#### 1.3. DoanhThuTheoMon(startDate, endDate)
- Doanh thu chi tiết theo từng món
- Trả về: MaMon, TenMon, LoaiMon, TongSoLuongBan, TongDoanhThu, GiaBanTrungBinh

#### 1.4. XepHangMonBanChay(startDate, endDate, soLuong)
- Top món bán chạy nhất
- Trả về: MaMon, TenMon, HinhAnh, LoaiMon, TongSoLuongBan, TongDoanhThu

#### 1.5. DoanhThuTheoDanhMuc(startDate, endDate)
- Doanh thu theo danh mục món
- Trả về: MaLoai, TenLoai, HinhAnh, TongSoLuongBan, TongDoanhThu, SoMonKhacNhau

#### 1.6. DoanhThuTheoGio(startDate, endDate)
- Thống kê doanh thu theo giờ trong ngày
- Trả về: Gio, DoanhThu, SoDonHang, DoanhThuTrungBinh

#### 1.7. DoanhThuTheoNhanVien(startDate, endDate)
- Doanh thu theo nhân viên phục vụ
- Trả về: MaNV, HoTen, ChucVu, TongDoanhThu, SoDonHang

#### 1.8. DoanhThuTheoHinhThucThanhToan(startDate, endDate)
- Phân tích theo hình thức thanh toán
- Trả về: HinhThuc, TongDoanhThu, SoGiaoDich, GiaTriTrungBinh, TyLePhanTram

## 2. API Gateway - Backend

### 2.1. Cài đặt dependencies
```bash
cd api-gateway
npm install mysql2
```

### 2.2. Files đã tạo:

#### `config/database.js`
- Kết nối MySQL pool
- Hỗ trợ gọi stored procedures

#### `controllers/analyticsController.js`
- 8 controller functions tương ứng với 8 stored procedures
- Hỗ trợ query parameters: period, startDate, endDate, limit
- Helper functions: formatDate(), getDateRange()

#### `routes/analytics.js`
- GET `/api/analytics/tong-doanh-thu`
- GET `/api/analytics/doanh-thu-theo-ngay`
- GET `/api/analytics/doanh-thu-theo-mon`
- GET `/api/analytics/mon-ban-chay`
- GET `/api/analytics/doanh-thu-theo-danh-muc`
- GET `/api/analytics/doanh-thu-theo-gio`
- GET `/api/analytics/doanh-thu-theo-nhan-vien`
- GET `/api/analytics/doanh-thu-theo-hinh-thuc`

### 2.3. Đã cập nhật `index.js`:
```javascript
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
```

## 3. Frontend - Analytics Page

### 3.1. Cần cập nhật file `Analytics.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDollarSign, FiShoppingBag, FiPieChart, FiBarChart2, FiUsers, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_URL = 'http://localhost:3000/api/analytics';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');
  const [data, setData] = useState({
    tongDoanhThu: null,
    doanhThuTheoNgay: [],
    monBanChay: [],
    doanhThuTheoDanhMuc: [],
    doanhThuTheoGio: [],
    doanhThuTheoNhanVien: [],
    doanhThuTheoHinhThuc: []
  });

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        tongDoanhThuRes,
        doanhThuTheoNgayRes,
        monBanChayRes,
        doanhThuTheoDanhMucRes,
        doanhThuTheoGioRes,
        doanhThuTheoNhanVienRes,
        doanhThuTheoHinhThucRes
      ] = await Promise.all([
        axios.get(`${API_URL}/tong-doanh-thu`),
        axios.get(`${API_URL}/doanh-thu-theo-ngay`, { params: { period } }),
        axios.get(`${API_URL}/mon-ban-chay`, { params: { period, limit: 10 } }),
        axios.get(`${API_URL}/doanh-thu-theo-danh-muc`, { params: { period } }),
        axios.get(`${API_URL}/doanh-thu-theo-gio`, { params: { period } }),
        axios.get(`${API_URL}/doanh-thu-theo-nhan-vien`, { params: { period } }),
        axios.get(`${API_URL}/doanh-thu-theo-hinh-thuc`, { params: { period } })
      ]);

      setData({
        tongDoanhThu: tongDoanhThuRes.data.data,
        doanhThuTheoNgay: doanhThuTheoNgayRes.data.data,
        monBanChay: monBanChayRes.data.data,
        doanhThuTheoDanhMuc: doanhThuTheoDanhMucRes.data.data,
        doanhThuTheoGio: doanhThuTheoGioRes.data.data,
        doanhThuTheoNhanVien: doanhThuTheoNhanVienRes.data.data,
        doanhThuTheoHinhThuc: doanhThuTheoHinhThucRes.data.data
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Lỗi khi tải dữ liệu phân tích');
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // ... rest of component
};
```

## 4. Các bước triển khai

### Bước 1: Chạy SQL Script
```sql
-- Chạy file QuanLyCaFe.sql để tạo stored procedures
mysql -u root -p QuanLyCafe < QuanLyCaFe.sql
```

### Bước 2: Cài đặt dependencies
```bash
cd api-gateway
npm install mysql2
```

### Bước 3: Cấu hình database trong api-gateway
Kiểm tra file `.env` có các biến:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=QuanLyCafe
```

### Bước 4: Khởi động api-gateway
```bash
cd api-gateway
npm run dev
```

### Bước 5: Test API endpoints
```bash
# Test tổng doanh thu
curl http://localhost:3000/api/analytics/tong-doanh-thu

# Test doanh thu 7 ngày qua
curl "http://localhost:3000/api/analytics/doanh-thu-theo-ngay?period=7days"

# Test top 10 món bán chạy
curl "http://localhost:3000/api/analytics/mon-ban-chay?period=thisMonth&limit=10"
```

### Bước 6: Cập nhật Frontend
- Thay thế nội dung file `front-end/src/pages/admin/Analytics.jsx`
- Sử dụng code mẫu ở trên
- Tạo các charts với recharts

## 5. Query Parameters

### period (cho tất cả endpoints trừ tổng doanh thu):
- `today` - Hôm nay
- `yesterday` - Hôm qua
- `7days` - 7 ngày qua
- `30days` - 30 ngày qua
- `thisMonth` - Tháng này
- `lastMonth` - Tháng trước

### Hoặc sử dụng custom dates:
- `startDate` - Ngày bắt đầu (YYYY-MM-DD)
- `endDate` - Ngày kết thúc (YYYY-MM-DD)

### limit (cho món bán chạy):
- Số lượng món muốn lấy (mặc định: 10)

## 6. Response Format

### Tổng doanh thu:
```json
{
  "success": true,
  "data": {
    "TongDoanhThu": 15750000,
    "TongDonHang": 125,
    "SoNhanVienPhucVu": 5,
    "DoanhThuTrungBinh": 126000
  }
}
```

### Doanh thu theo ngày:
```json
{
  "success": true,
  "period": "7days",
  "startDate": "2024-01-20",
  "endDate": "2024-01-27",
  "data": [
    {
      "Ngay": "2024-01-20",
      "DoanhThu": 2500000,
      "SoDonHang": 18,
      "DoanhThuTrungBinh": 138888.89,
      "SoBanPhucVu": 12
    }
  ]
}
```

### Món bán chạy:
```json
{
  "success": true,
  "period": "thisMonth",
  "limit": 10,
  "data": [
    {
      "MaMon": 1,
      "TenMon": "Cà phê đen",
      "HinhAnh": "...",
      "LoaiMon": "Cà phê",
      "TongSoLuongBan": 456,
      "TongDoanhThu": 11400000,
      "SoDonHang": 234,
      "GiaBanTrungBinh": 25000
    }
  ]
}
```

## 7. Thiết kế UI Components

### 7.1. Summary Cards (4 cards)
- Tổng doanh thu
- Tổng đơn hàng
- Số nhân viên phục vụ
- Doanh thu trung bình

### 7.2. Line Chart - Doanh thu theo ngày
- Trục X: Ngày
- Trục Y: Doanh thu (VND)
- Tooltip: Hiển thị chi tiết ngày, doanh thu, số đơn hàng

### 7.3. Bar Chart - Đơn hàng theo ngày
- Trục X: Ngày
- Trục Y: Số đơn hàng
- Màu sắc: Gradient xanh dương

### 7.4. Top 10 Món bán chạy (Table/List)
- STT, Tên món, Hình ảnh
- Số lượng bán, Doanh thu
- Sắp xếp theo số lượng bán giảm dần

### 7.5. Pie Chart - Doanh thu theo danh mục
- Mỗi danh mục một màu
- Hiển thị % và giá trị
- Legend bên cạnh

### 7.6. Bar Chart - Doanh thu theo giờ
- Trục X: Giờ (6:00 - 22:00)
- Trục Y: Doanh thu
- Màu sắc: Gradient cam

### 7.7. Table - Doanh thu theo nhân viên
- Tên nhân viên, Chức vụ
- Tổng doanh thu, Số đơn hàng
- Doanh thu trung bình/đơn

### 7.8. Pie Chart - Hình thức thanh toán
- Tiền mặt, Thẻ, Ví điện tử, Chuyển khoản
- Hiển thị % và số tiền

## 8. Lưu ý quan trọng

### 8.1. Dữ liệu mẫu
- Cần có dữ liệu trong bảng DonHang và ThanhToan
- Đơn hàng phải có TrangThai = 'Hoàn thành'
- Thanh toán phải có TrangThai = 'Thành công'

### 8.2. Performance
- Stored procedures đã được tối ưu với INNER JOIN
- Sử dụng COALESCE để tránh NULL
- Index trên các cột NgayLap, TrangThai

### 8.3. Error Handling
- Tất cả endpoints đều có try-catch
- Trả về error message tiếng Việt
- Frontend hiển thị toast notification khi lỗi

## 9. Testing Checklist

- [ ] Stored procedures chạy thành công trong MySQL
- [ ] API endpoints trả về dữ liệu đúng format
- [ ] Frontend hiển thị charts chính xác
- [ ] Period selector hoạt động
- [ ] Loading states hiển thị
- [ ] Error handling hoạt động
- [ ] Responsive design trên mobile
- [ ] Currency format đúng (VND)
- [ ] Date format đúng (dd/mm/yyyy)

## 10. Mở rộng trong tương lai

### 10.1. Export Reports
- Export PDF
- Export Excel
- Email reports tự động

### 10.2. Real-time Updates
- WebSocket cho real-time analytics
- Auto-refresh mỗi 5 phút

### 10.3. Advanced Filters
- Filter theo khu vực bàn
- Filter theo loại khách hàng
- Filter theo voucher/khuyến mãi

### 10.4. Predictive Analytics
- Dự đoán doanh thu tháng sau
- Gợi ý món nên nhập thêm
- Phân tích xu hướng khách hàng
