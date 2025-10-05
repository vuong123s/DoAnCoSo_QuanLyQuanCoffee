# User Service

Dịch vụ quản lý người dùng và xác thực cho hệ thống quán cà phê với kiến trúc microservices.

## Tính năng

### Xác thực và Ủy quyền
- Đăng ký và đăng nhập người dùng
- JWT Authentication với Access Token và Refresh Token
- Phân quyền theo vai trò (admin, manager, staff, customer)
- Bảo mật tài khoản với khóa tạm thời sau nhiều lần đăng nhập sai
- Đổi mật khẩu và cập nhật thông tin cá nhân

### Quản lý Người dùng
- CRUD operations cho người dùng (Admin/Manager)
- Kích hoạt/vô hiệu hóa tài khoản
- Reset mật khẩu và mở khóa tài khoản
- Thống kê người dùng và báo cáo
- Tìm kiếm và lọc người dùng

## Cấu trúc Database

### Bảng `users`
- `id`: ID người dùng (Primary Key)
- `username`: Tên đăng nhập (unique)
- `email`: Email (unique)
- `password`: Mật khẩu đã hash
- `full_name`: Họ tên đầy đủ
- `phone`: Số điện thoại
- `date_of_birth`: Ngày sinh
- `gender`: Giới tính (male, female, other)
- `address`: Địa chỉ
- `role`: Vai trò (admin, manager, staff, customer)
- `is_active`: Trạng thái hoạt động
- `is_verified`: Trạng thái xác minh
- `avatar_url`: URL ảnh đại diện
- `last_login`: Lần đăng nhập cuối
- `login_attempts`: Số lần đăng nhập sai
- `locked_until`: Thời gian khóa tài khoản
- `preferences`: Tùy chọn cá nhân (JSON)
- `created_at`, `updated_at`: Timestamps

## Phân quyền

### Vai trò hệ thống
- **Admin**: Toàn quyền quản lý hệ thống
- **Manager**: Quản lý nhân viên và khách hàng
- **Staff**: Nhân viên phục vụ
- **Customer**: Khách hàng

### Ma trận phân quyền
| Chức năng | Admin | Manager | Staff | Customer |
|-----------|-------|---------|-------|----------|
| Tạo Admin/Manager/Staff | ✅ | ❌ | ❌ | ❌ |
| Xem danh sách người dùng | ✅ | ✅ | ❌ | ❌ |
| Sửa thông tin người khác | ✅ | ✅* | ❌ | ❌ |
| Xóa người dùng | ✅ | ❌ | ❌ | ❌ |
| Reset mật khẩu | ✅ | ❌ | ❌ | ❌ |
| Sửa thông tin cá nhân | ✅ | ✅ | ✅ | ✅ |

*Manager chỉ có thể sửa thông tin Staff và Customer

## API Endpoints

### Authentication API (`/api/auth`)

#### POST /api/auth/register
Đăng ký người dùng mới
```json
{
  "username": "nguyenvana",
  "email": "nguyenvana@email.com",
  "password": "123456",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": "123 Đường ABC, TP.HCM",
  "role": "customer"
}
```

#### POST /api/auth/login
Đăng nhập
```json
{
  "login": "nguyenvana", // username hoặc email
  "password": "123456"
}
```

#### POST /api/auth/refresh-token
Làm mới token
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### GET /api/auth/profile
Lấy thông tin profile (yêu cầu token)

#### PUT /api/auth/profile
Cập nhật profile (yêu cầu token)
```json
{
  "full_name": "Nguyễn Văn A Updated",
  "phone": "0901234568",
  "address": "456 Đường XYZ, TP.HCM",
  "preferences": {
    "language": "vi",
    "notifications": true
  }
}
```

#### POST /api/auth/change-password
Đổi mật khẩu (yêu cầu token)
```json
{
  "current_password": "123456",
  "new_password": "newpassword123"
}
```

#### POST /api/auth/logout
Đăng xuất (yêu cầu token)

### User Management API (`/api/users`)

#### GET /api/users
Lấy danh sách người dùng (Admin/Manager)
- Query params: `page`, `limit`, `role`, `is_active`, `is_verified`, `search`

#### GET /api/users/stats
Lấy thống kê người dùng (Admin/Manager)

#### GET /api/users/:id
Lấy thông tin người dùng theo ID (Admin/Manager)

#### POST /api/users
Tạo người dùng mới (Admin)
```json
{
  "username": "nhanvien01",
  "email": "nhanvien01@coffee.com",
  "password": "123456",
  "full_name": "Nhân Viên 01",
  "role": "staff",
  "is_verified": true
}
```

#### PUT /api/users/:id
Cập nhật thông tin người dùng

#### PATCH /api/users/:id/toggle-status
Kích hoạt/vô hiệu hóa tài khoản (Admin/Manager)

#### PATCH /api/users/:id/reset-password
Reset mật khẩu (Admin)
```json
{
  "new_password": "newpassword123"
}
```

#### PATCH /api/users/:id/unlock
Mở khóa tài khoản (Admin/Manager)

#### DELETE /api/users/:id
Xóa người dùng (Admin)

## Bảo mật

### Mã hóa mật khẩu
- Sử dụng bcryptjs với salt rounds = 10
- Mật khẩu được hash trước khi lưu database

### JWT Token
- Access Token: Thời hạn 24 giờ (có thể cấu hình)
- Refresh Token: Thời hạn 7 ngày (có thể cấu hình)
- Secret key cần được thay đổi trong production

### Bảo vệ chống brute force
- Khóa tài khoản sau 5 lần đăng nhập sai
- Thời gian khóa: 30 phút
- Tự động reset sau khi đăng nhập thành công

### Validation
- Email format validation
- Số điện thoại Vietnam format
- Password minimum 6 characters
- Username unique và minimum 3 characters

## Ví dụ sử dụng

### Đăng ký khách hàng
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer01",
    "email": "customer01@email.com",
    "password": "123456",
    "full_name": "Khách Hàng 01",
    "phone": "0901234567"
  }'
```

### Đăng nhập
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "customer01",
    "password": "123456"
  }'
```

### Lấy profile (với token)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer your-access-token"
```

### Tạo nhân viên (Admin)
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-access-token" \
  -d '{
    "username": "staff01",
    "email": "staff01@coffee.com",
    "password": "123456",
    "full_name": "Nhân Viên 01",
    "role": "staff"
  }'
```

### Lấy danh sách người dùng (Manager)
```bash
curl "http://localhost:3001/api/users?role=customer&page=1&limit=10" \
  -H "Authorization: Bearer manager-access-token"
```

## Luồng xác thực

### Đăng ký → Đăng nhập
1. **Đăng ký**: POST `/api/auth/register` → Tạo tài khoản + trả về tokens
2. **Đăng nhập**: POST `/api/auth/login` → Xác thực + trả về tokens
3. **Sử dụng API**: Gửi `Authorization: Bearer {accessToken}` trong header

### Làm mới token
1. **Access token hết hạn** → Client nhận 401 error
2. **Gửi refresh token**: POST `/api/auth/refresh-token`
3. **Nhận token mới** → Tiếp tục sử dụng API

### Quên mật khẩu (Admin reset)
1. **Liên hệ Admin** → Admin sử dụng PATCH `/api/users/:id/reset-password`
2. **Nhận mật khẩu mới** → Đăng nhập với mật khẩu mới
3. **Đổi mật khẩu**: POST `/api/auth/change-password`

## Cài đặt và Chạy

1. Cài đặt dependencies bổ sung:
```bash
npm install bcryptjs jsonwebtoken validator
```

2. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

3. Cấu hình JWT secret trong `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. Chạy service:
```bash
# Development
npm run dev

# Production
npm start
```

Service sẽ chạy trên port 3001 (hoặc theo PORT trong .env)

## Health Check

GET /health - Kiểm tra trạng thái service

## Tích hợp với các service khác

### Billing Service
- Sử dụng `user_id` khi tạo hóa đơn
- Xác thực nhân viên khi thao tác hóa đơn

### Table Service  
- Sử dụng `user_id` khi tạo đặt chỗ
- Phân quyền quản lý bàn theo vai trò

### Menu Service
- Phân quyền chỉnh sửa menu (Admin/Manager/Staff)
- Theo dõi người tạo/sửa menu items

## Lưu ý quan trọng

- **JWT Secret**: Phải thay đổi trong production
- **HTTPS**: Bắt buộc trong production để bảo vệ tokens
- **Rate limiting**: Nên thêm để chống brute force
- **Email verification**: Có thể mở rộng thêm tính năng xác minh email
- **Password policy**: Có thể thêm yêu cầu mật khẩu phức tạp hơn
- **Audit log**: Nên ghi log các thao tác quan trọng
