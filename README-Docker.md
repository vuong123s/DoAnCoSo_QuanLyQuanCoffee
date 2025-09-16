# Coffee Shop - Docker Setup

Hướng dẫn chạy ứng dụng Coffee Shop với Docker.

## Yêu cầu hệ thống

- Docker Desktop đã cài đặt và đang chạy
- Git (để clone repository)

## Khởi chạy nhanh

### Cách 1: Sử dụng script tự động
```bash
# Khởi động hệ thống
docker-start.bat

# Dừng hệ thống
docker-stop.bat
```

### Cách 2: Chạy thủ công
```bash
# Khởi động tất cả services
docker-compose up --build -d

# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f
```

## Cấu trúc hệ thống

Ứng dụng bao gồm các services sau:

- **MySQL Database** (Port 3306) - Database chính với schema Vietnamese
- **User Service** (Port 3001) - Quản lý nhân viên và khách hàng
- **Menu Service** (Port 3002) - Quản lý thực đơn và loại món
- **Table Service** (Port 3003) - Quản lý bàn và đặt bàn
- **Billing Service** (Port 3004) - Quản lý đơn hàng và thanh toán
- **API Gateway** (Port 3000) - Gateway chính với authentication
- **Frontend** (Port 5173) - Giao diện React

## URLs truy cập

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001/health
- **Menu Service**: http://localhost:3002/health
- **Table Service**: http://localhost:3003/health
- **Billing Service**: http://localhost:3004/health

## Cấu hình Database

- **Database**: QuanLyCafe
- **MySQL User**: coffee_user
- **MySQL Password**: coffee_pass
- **MySQL Root Password**: root123
- **Character Set**: utf8mb4_unicode_ci (hỗ trợ tiếng Việt)

## Dữ liệu mẫu

Database sẽ được tự động khởi tạo với:
- 3 nhân viên mẫu (admin, manager, staff)
- 5 loại món (cà phê, trà, nước ép, bánh ngọt, bánh mặn)
- 6 món ăn/uống mẫu
- 5 bàn
- 2 khách hàng mẫu

### Tài khoản đăng nhập mẫu:
- **Admin**: admin@coffeeshop.com / password
- **Manager**: manager@coffeeshop.com / password  
- **Staff**: staff@coffeeshop.com / password

## Dừng ứng dụng

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa tất cả dữ liệu
docker-compose down --volumes --remove-orphans
```

## Troubleshooting

### 1. Lỗi port đã được sử dụng
```bash
# Kiểm tra port đang sử dụng
netstat -an | findstr :3000
netstat -an | findstr :3306

# Dừng process đang sử dụng port
taskkill /PID <process_id> /F
```

### 2. MySQL không khởi động được
```bash
# Xem logs MySQL
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### 3. Services không kết nối được database
```bash
# Kiểm tra MySQL health
docker-compose ps

# Chờ MySQL khởi động hoàn tất
docker-compose logs -f mysql
```

### 4. Frontend không load được
```bash
# Kiểm tra API Gateway
curl http://localhost:3000/health

# Rebuild frontend
docker-compose up --build frontend
```

## Development

### Chạy từng service riêng lẻ:
```bash
# Chỉ chạy database và user service
docker-compose up mysql user-service

# Chạy tất cả backend services
docker-compose up mysql user-service menu-service table-service billing-service api-gateway
```

### Xem logs chi tiết:
```bash
# Logs tất cả services
docker-compose logs -f

# Logs service cụ thể
docker-compose logs -f user-service
docker-compose logs -f mysql
```

### Truy cập MySQL:
```bash
# Kết nối MySQL từ container
docker-compose exec mysql mysql -u coffee_user -p QuanLyCafe

# Hoặc từ host
mysql -h localhost -P 3306 -u coffee_user -p QuanLyCafe
```

## Cấu trúc thư mục

```
Coffee-Shop/
├── docker-compose.yml          # Cấu hình Docker Compose
├── docker-init.sql            # Script khởi tạo database
├── docker-start.bat           # Script khởi động
├── docker-stop.bat            # Script dừng
├── api-gateway/               # API Gateway service
├── services/                  # Các microservices
│   ├── user-service/
│   ├── menu-service/
│   ├── table-service/
│   └── billing-service/
└── front-end/                 # React frontend
```

## Monitoring

### Health Checks
Tất cả services đều có health check endpoints:
- http://localhost:3000/health (API Gateway)
- http://localhost:3001/health (User Service)
- http://localhost:3002/health (Menu Service)
- http://localhost:3003/health (Table Service)
- http://localhost:3004/health (Billing Service)

### Docker Commands hữu ích
```bash
# Xem resource usage
docker stats

# Xem images
docker images

# Cleanup
docker system prune -a

# Rebuild specific service
docker-compose up --build user-service
```

### Cấu trúc Services

| Service | Port | Mô tả |
|---------|------|-------|
| mysql | 3306 | MySQL Database |
| user-service | 3001 | Quản lý người dùng |
| menu-service | 3002 | Quản lý menu |
| table-service | 3003 | Quản lý bàn |
| billing-service | 3004 | Quản lý hóa đơn |
| api-gateway | 3000 | API Gateway |
| frontend | 5173 | React Frontend |

### Troubleshooting

**Nếu gặp lỗi port đã được sử dụng:**
```bash
docker-compose down
# Đợi vài giây
docker-compose up --build
```

**Nếu cần reset database:**
```bash
docker-compose down -v
docker-compose up --build
```

**Xem logs lỗi:**
```bash
docker-compose logs --tail=50
```
