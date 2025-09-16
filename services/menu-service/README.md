# Menu Service

Dịch vụ quản lý thực đơn cho hệ thống quán cà phê với kiến trúc microservices.

## Tính năng

### Quản lý danh mục (Categories)
- Tạo, sửa, xóa danh mục món ăn
- Bật/tắt trạng thái danh mục
- Sắp xếp danh mục theo thứ tự
- Tìm kiếm danh mục

### Quản lý món ăn (Menu Items)
- Tạo, sửa, xóa món ăn
- Quản lý giá cả và mô tả
- Bật/tắt tình trạng có sẵn
- Đánh dấu món nổi bật
- Quản lý thông tin dinh dưỡng và allergens
- Tùy chọn kích thước và giá
- Thời gian chuẩn bị
- Mức độ cay

## Cấu trúc Database

### Bảng `categories`
- `id`: ID danh mục (Primary Key)
- `name`: Tên danh mục (unique)
- `description`: Mô tả danh mục
- `image_url`: URL hình ảnh
- `is_active`: Trạng thái hoạt động
- `sort_order`: Thứ tự sắp xếp
- `created_at`, `updated_at`: Timestamps

### Bảng `menu_items`
- `id`: ID món ăn (Primary Key)
- `category_id`: ID danh mục (Foreign Key)
- `name`: Tên món ăn
- `description`: Mô tả món ăn
- `price`: Giá cơ bản
- `image_url`: URL hình ảnh
- `is_available`: Tình trạng có sẵn
- `is_featured`: Món nổi bật
- `preparation_time`: Thời gian chuẩn bị (phút)
- `ingredients`: Thành phần (JSON)
- `allergens`: Chất gây dị ứng
- `calories`: Lượng calo
- `spice_level`: Mức độ cay (none, mild, medium, hot, very_hot)
- `size_options`: Tùy chọn kích thước (JSON)
- `sort_order`: Thứ tự sắp xếp
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Categories API (`/api/categories`)

#### GET /api/categories
Lấy danh sách danh mục
- Query params: `page`, `limit`, `is_active`, `include_items`, `search`

#### GET /api/categories/:id
Lấy chi tiết danh mục
- Query params: `include_items` (true/false)

#### POST /api/categories
Tạo danh mục mới
```json
{
  "name": "Cà phê",
  "description": "Các loại cà phê truyền thống và hiện đại",
  "image_url": "https://example.com/coffee.jpg",
  "is_active": true,
  "sort_order": 1
}
```

#### PUT /api/categories/:id
Cập nhật danh mục

#### PATCH /api/categories/:id/toggle-status
Bật/tắt trạng thái danh mục

#### DELETE /api/categories/:id
Xóa danh mục (chỉ khi không có món ăn)

#### GET /api/categories/:id/menu-items
Lấy món ăn theo danh mục
- Query params: `page`, `limit`, `is_available`, `sort_by`, `sort_order`

### Menu Items API (`/api/menu`)

#### GET /api/menu
Lấy danh sách món ăn
- Query params: `page`, `limit`, `category_id`, `is_available`, `is_featured`, `search`, `sort_by`, `sort_order`

#### GET /api/menu/featured
Lấy món ăn nổi bật

#### GET /api/menu/:id
Lấy chi tiết món ăn

#### POST /api/menu
Tạo món ăn mới
```json
{
  "category_id": 1,
  "name": "Cà phê đen đá",
  "description": "Cà phê đen truyền thống với đá",
  "price": 25000,
  "image_url": "https://example.com/black-coffee.jpg",
  "is_available": true,
  "is_featured": false,
  "preparation_time": 5,
  "ingredients": ["cà phê robusta", "đường", "đá"],
  "allergens": "không",
  "calories": 50,
  "spice_level": "none",
  "size_options": {
    "small": { "price": 25000, "volume": "200ml" },
    "medium": { "price": 30000, "volume": "300ml" },
    "large": { "price": 35000, "volume": "400ml" }
  },
  "sort_order": 1
}
```

#### PUT /api/menu/:id
Cập nhật món ăn

#### PATCH /api/menu/:id/toggle-availability
Bật/tắt tình trạng có sẵn

#### DELETE /api/menu/:id
Xóa món ăn

## Ví dụ sử dụng

### Tạo danh mục cà phê
```bash
curl -X POST http://localhost:3002/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cà phê",
    "description": "Các loại cà phê đặc sản",
    "sort_order": 1
  }'
```

### Tạo món cà phê sữa đá
```bash
curl -X POST http://localhost:3002/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "name": "Cà phê sữa đá",
    "description": "Cà phê đen pha với sữa đặc và đá",
    "price": 30000,
    "preparation_time": 3,
    "is_featured": true
  }'
```

### Lấy menu theo danh mục
```bash
curl "http://localhost:3002/api/categories/1/menu-items?is_available=true"
```

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

Service sẽ chạy trên port 3002 (hoặc theo PORT trong .env)

## Health Check

GET /health - Kiểm tra trạng thái service

## Lưu ý

- Khi tắt danh mục, tất cả món ăn trong danh mục đó cũng sẽ bị tắt
- Không thể xóa danh mục khi còn có món ăn
- Trường `ingredients` và `size_options` lưu dưới dạng JSON string
- Giá cả được lưu dưới dạng DECIMAL(10,2) để đảm bảo độ chính xác
