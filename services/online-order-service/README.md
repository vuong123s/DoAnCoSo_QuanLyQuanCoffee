# Online Order Service

Microservice quản lý đơn hàng online cho hệ thống Coffee Shop.

## Chức năng chính

### 1. Quản lý Giỏ hàng (GioHang)
- Thêm/xóa/cập nhật món trong giỏ hàng
- Hỗ trợ cả khách hàng đã đăng ký và khách vãng lai (session)
- Lưu trữ ghi chú đặc biệt cho từng món

### 2. Quản lý Đơn hàng Online (DonHangOnline)
- Tạo đơn hàng từ giỏ hàng
- Quản lý thông tin giao hàng
- Tích hợp voucher và phí giao hàng
- Hỗ trợ nhiều phương thức thanh toán
- Theo dõi trạng thái đơn hàng và thanh toán

### 3. Chi tiết Đơn hàng (CTDonHangOnline)
- Lưu trữ chi tiết từng món trong đơn hàng
- Theo dõi trạng thái từng món riêng biệt
- Ghi chú đặc biệt cho từng món

### 4. Theo dõi Đơn hàng (TheoDoiDonHang)
- Lịch sử thay đổi trạng thái đơn hàng
- Theo dõi vị trí giao hàng real-time
- Ước tính thời gian giao hàng
- Ghi chú từ nhân viên xử lý

## API Endpoints

### Giỏ hàng (/api/cart)
- `GET /` - Lấy giỏ hàng
- `POST /add` - Thêm món vào giỏ
- `PUT /item/:id` - Cập nhật món trong giỏ
- `DELETE /item/:id` - Xóa món khỏi giỏ
- `DELETE /clear` - Xóa toàn bộ giỏ hàng

### Đơn hàng Online (/api/online-orders)
- `POST /` - Tạo đơn hàng mới
- `GET /` - Lấy danh sách đơn hàng (có phân trang, lọc)
- `GET /:id` - Lấy chi tiết đơn hàng
- `PUT /:id/status` - Cập nhật trạng thái đơn hàng
- `PUT /:id/payment-status` - Cập nhật trạng thái thanh toán
- `PATCH /:id/cancel` - Hủy đơn hàng
- `GET /stats/overview` - Thống kê đơn hàng

### Theo dõi Đơn hàng (/api/order-tracking)
- `GET /:orderId` - Lấy lịch sử theo dõi
- `POST /:orderId` - Thêm cập nhật theo dõi
- `GET /:orderId/location` - Lấy vị trí hiện tại
- `PUT /:orderId/location` - Cập nhật vị trí giao hàng
- `GET /status/:status` - Lấy đơn hàng theo trạng thái
- `GET /stats/overview` - Thống kê theo dõi

## Trạng thái Đơn hàng
- **Chờ xác nhận**: Đơn hàng mới được tạo
- **Đã xác nhận**: Nhân viên đã xác nhận đơn hàng
- **Đang chuẩn bị**: Đang chuẩn bị món ăn
- **Đang giao hàng**: Đơn hàng đang được giao
- **Đã giao hàng**: Giao hàng thành công
- **Đã hủy**: Đơn hàng bị hủy

## Trạng thái Thanh toán
- **Chưa thanh toán**: Chưa thanh toán
- **Đã thanh toán**: Đã thanh toán thành công
- **Đã hoàn tiền**: Đã hoàn tiền (trường hợp hủy đơn)

## Cấu hình

### Environment Variables
```
DB_NAME=QuanLyCafe
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
PORT=3005
NODE_ENV=development
```

### Cài đặt và Chạy
```bash
# Cài đặt dependencies
npm install

# Chạy development mode
npm run dev

# Chạy production mode
npm start
```

## Tích hợp với các Service khác

### User Service
- Lấy thông tin khách hàng đã đăng ký
- Xác thực người dùng

### Menu Service  
- Lấy thông tin món ăn và giá cả
- Kiểm tra tình trạng còn hàng

### Voucher Service
- Áp dụng và kiểm tra voucher
- Tính toán giảm giá

### Inventory Service
- Kiểm tra tồn kho nguyên liệu
- Cập nhật số lượng sau khi đặt hàng

## Database Schema

Service này sử dụng 4 bảng chính:
- `GioHang`: Quản lý giỏ hàng
- `DonHangOnline`: Thông tin đơn hàng online
- `CTDonHangOnline`: Chi tiết đơn hàng
- `TheoDoiDonHang`: Lịch sử theo dõi đơn hàng

Tất cả đều sử dụng schema tiếng Việt với charset utf8mb4_unicode_ci.
