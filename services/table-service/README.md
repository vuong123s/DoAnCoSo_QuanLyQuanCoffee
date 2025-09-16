# Table Service

Dịch vụ quản lý bàn và đặt chỗ cho hệ thống quán cà phê với kiến trúc microservices.

## Tính năng

### Quản lý bàn (Tables)
- Tạo, sửa, xóa bàn
- Quản lý trạng thái bàn (available, occupied, reserved, maintenance)
- Phân loại theo vị trí (indoor, outdoor, private_room, bar_counter)
- Quản lý sức chứa và đặc điểm bàn
- Tìm bàn trống theo thời gian và yêu cầu
- Thống kê sử dụng bàn

### Quản lý đặt chỗ (Reservations)
- Tạo, sửa, hủy đặt chỗ
- Quản lý trạng thái đặt chỗ (pending, confirmed, checked_in, completed, cancelled, no_show)
- Kiểm tra xung đột thời gian
- Tự động cập nhật trạng thái bàn
- Thống kê đặt chỗ

## Cấu trúc Database

### Bảng `tables`
- `id`: ID bàn (Primary Key)
- `table_number`: Số bàn (unique)
- `capacity`: Sức chứa (1-20 người)
- `location`: Vị trí (indoor, outdoor, private_room, bar_counter)
- `status`: Trạng thái (available, occupied, reserved, maintenance)
- `is_active`: Trạng thái hoạt động
- `description`: Mô tả
- `features`: Đặc điểm (JSON) - wifi, power outlet, etc.
- `position_x`, `position_y`: Tọa độ trên sơ đồ
- `qr_code`: Mã QR cho menu điện tử
- `last_cleaned`: Lần dọn dẹp cuối
- `created_at`, `updated_at`: Timestamps

### Bảng `table_reservations`
- `id`: ID đặt chỗ (Primary Key)
- `table_id`: ID bàn (Foreign Key)
- `user_id`: ID khách hàng (Foreign Key, nullable)
- `customer_name`: Tên khách hàng
- `customer_phone`: Số điện thoại
- `customer_email`: Email (nullable)
- `party_size`: Số người
- `reservation_date`: Ngày đặt
- `reservation_time`: Giờ đặt
- `duration_minutes`: Thời gian (phút, mặc định 120)
- `status`: Trạng thái đặt chỗ
- `special_requests`: Yêu cầu đặc biệt
- `notes`: Ghi chú
- Các timestamp: `confirmed_at`, `checked_in_at`, `completed_at`, `cancelled_at`
- `cancellation_reason`: Lý do hủy
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Tables API (`/api/tables`)

#### GET /api/tables
Lấy danh sách bàn
- Query params: `page`, `limit`, `status`, `location`, `is_active`, `capacity_min`, `capacity_max`, `include_reservations`

#### GET /api/tables/stats
Lấy thống kê bàn

#### GET /api/tables/available
Tìm bàn trống
- Query params: `date`, `time`, `duration`, `party_size`, `location`

#### GET /api/tables/:id
Lấy chi tiết bàn
- Query params: `include_reservations` (true/false)

#### POST /api/tables
Tạo bàn mới
```json
{
  "table_number": "A01",
  "capacity": 4,
  "location": "indoor",
  "description": "Bàn gần cửa sổ",
  "features": {
    "wifi": true,
    "power_outlet": true,
    "window_view": true
  },
  "position_x": 100.5,
  "position_y": 200.3
}
```

#### PUT /api/tables/:id
Cập nhật bàn

#### PATCH /api/tables/:id/status
Cập nhật trạng thái bàn
```json
{
  "status": "maintenance",
  "notes": "Cần sửa ghế"
}
```

#### DELETE /api/tables/:id
Xóa bàn (chỉ khi không có đặt chỗ hoạt động)

### Reservations API (`/api/reservations`)

#### GET /api/reservations
Lấy danh sách đặt chỗ
- Query params: `page`, `limit`, `table_id`, `status`, `date`, `start_date`, `end_date`, `customer_phone`, `customer_name`

#### GET /api/reservations/stats
Lấy thống kê đặt chỗ
- Query params: `start_date`, `end_date`

#### GET /api/reservations/today
Lấy đặt chỗ hôm nay
- Query params: `status`

#### GET /api/reservations/:id
Lấy chi tiết đặt chỗ

#### POST /api/reservations
Tạo đặt chỗ mới
```json
{
  "table_id": 1,
  "user_id": 123,
  "customer_name": "Nguyễn Văn A",
  "customer_phone": "0901234567",
  "customer_email": "nguyenvana@email.com",
  "party_size": 4,
  "reservation_date": "2024-01-15",
  "reservation_time": "19:00:00",
  "duration_minutes": 120,
  "special_requests": "Bàn gần cửa sổ",
  "notes": "Khách VIP"
}
```

#### PUT /api/reservations/:id
Cập nhật đặt chỗ

#### PATCH /api/reservations/:id/status
Cập nhật trạng thái đặt chỗ
```json
{
  "status": "confirmed",
  "notes": "Đã xác nhận qua điện thoại"
}
```

#### PATCH /api/reservations/:id/cancel
Hủy đặt chỗ
```json
{
  "cancellation_reason": "Khách hàng thay đổi kế hoạch",
  "notes": "Hủy 2 giờ trước"
}
```

## Ví dụ sử dụng

### Tạo bàn mới
```bash
curl -X POST http://localhost:3003/api/tables \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": "A01",
    "capacity": 4,
    "location": "indoor",
    "features": {"wifi": true, "power_outlet": true}
  }'
```

### Tìm bàn trống
```bash
curl "http://localhost:3003/api/tables/available?date=2024-01-15&time=19:00:00&party_size=4&location=indoor"
```

### Tạo đặt chỗ
```bash
curl -X POST http://localhost:3003/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0901234567",
    "party_size": 4,
    "reservation_date": "2024-01-15",
    "reservation_time": "19:00:00"
  }'
```

### Xác nhận đặt chỗ
```bash
curl -X PATCH http://localhost:3003/api/reservations/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### Check-in khách hàng
```bash
curl -X PATCH http://localhost:3003/api/reservations/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "checked_in"
  }'
```

## Luồng hoạt động

### Quy trình đặt chỗ
1. **Tạo đặt chỗ** (`pending`) → Hệ thống kiểm tra xung đột thời gian
2. **Xác nhận** (`confirmed`) → Cập nhật trạng thái bàn thành `reserved` (nếu là hôm nay)
3. **Check-in** (`checked_in`) → Cập nhật trạng thái bàn thành `occupied`
4. **Hoàn thành** (`completed`) → Cập nhật trạng thái bàn thành `available`

### Xử lý hủy/không đến
- **Hủy** (`cancelled`) → Trả bàn về `available`
- **Không đến** (`no_show`) → Trả bàn về `available`

## Tính năng đặc biệt

### Kiểm tra xung đột thời gian
- Tự động kiểm tra khi tạo/sửa đặt chỗ
- Tính toán thời gian bắt đầu và kết thúc
- Ngăn chặn đặt chỗ trùng lặp

### Tự động cập nhật trạng thái bàn
- Đồng bộ trạng thái bàn với đặt chỗ
- Chỉ cập nhật bàn cho đặt chỗ trong ngày

### Tìm kiếm bàn thông minh
- Lọc theo sức chứa, vị trí
- Loại trừ bàn có xung đột thời gian
- Sắp xếp theo sức chứa tối ưu

## Cài đặt và Chạy

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy service:
```bash
# Development
npm run dev

# Production
npm start
```

Service sẽ chạy trên port 3003 (hoặc theo PORT trong .env)

## Health Check

GET /health - Kiểm tra trạng thái service

## Lưu ý quan trọng

- Không thể xóa bàn khi có đặt chỗ hoạt động
- Không thể cập nhật đặt chỗ đã hoàn thành/hủy
- Thời gian đặt chỗ mặc định là 120 phút
- Hệ thống tự động cập nhật trạng thái bàn theo đặt chỗ
- Kiểm tra sức chứa bàn khi tạo đặt chỗ
