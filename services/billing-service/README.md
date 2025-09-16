# Billing Service

Dịch vụ quản lý hóa đơn cho hệ thống quán cà phê với kiến trúc microservices.

## Tính năng

- Tạo hóa đơn mới với các món đã đặt
- Quản lý trạng thái thanh toán (pending, paid, cancelled, refunded)
- Tính toán tự động thuế và giảm giá
- Thống kê doanh thu và báo cáo
- API RESTful đầy đủ

## Cấu trúc Database

### Bảng `bills`
- `id`: ID hóa đơn (Primary Key)
- `table_id`: ID bàn (Foreign Key)
- `user_id`: ID khách hàng (Foreign Key, nullable)
- `total_amount`: Tổng tiền trước thuế
- `tax_amount`: Tiền thuế
- `discount_amount`: Tiền giảm giá
- `final_amount`: Tổng tiền cuối cùng
- `payment_status`: Trạng thái thanh toán
- `payment_method`: Phương thức thanh toán
- `payment_date`: Ngày thanh toán
- `notes`: Ghi chú
- `created_at`, `updated_at`: Timestamps

### Bảng `bill_items`
- `id`: ID item (Primary Key)
- `bill_id`: ID hóa đơn (Foreign Key)
- `menu_item_id`: ID món ăn (Foreign Key)
- `quantity`: Số lượng
- `unit_price`: Giá đơn vị
- `total_price`: Tổng giá
- `notes`: Ghi chú
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### POST /api/billing
Tạo hóa đơn mới
```json
{
  "table_id": 1,
  "user_id": 123,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "unit_price": 25000,
      "notes": "Không đường"
    }
  ],
  "tax_rate": 0.1,
  "discount_amount": 5000,
  "notes": "Khách VIP"
}
```

### GET /api/billing
Lấy danh sách hóa đơn với filter
- Query params: `page`, `limit`, `table_id`, `user_id`, `payment_status`, `start_date`, `end_date`

### GET /api/billing/:id
Lấy chi tiết hóa đơn theo ID

### PATCH /api/billing/:id/payment
Cập nhật trạng thái thanh toán
```json
{
  "payment_status": "paid",
  "payment_method": "cash",
  "notes": "Thanh toán tiền mặt"
}
```

### GET /api/billing/stats
Lấy thống kê doanh thu
- Query params: `start_date`, `end_date`

### DELETE /api/billing/:id
Hủy hóa đơn (chuyển status thành cancelled)

## Cài đặt và Chạy

1. Copy file `.env.example` thành `.env` và cấu hình database:
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

Service sẽ chạy trên port 3004 (hoặc theo PORT trong .env)

## Health Check

GET /health - Kiểm tra trạng thái service
