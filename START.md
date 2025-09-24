# 🚀 HƯỚNG DẪN KHỞI ĐỘNG COFFEE SHOP

## 📋 Yêu cầu
- **Docker Desktop** (đã cài đặt và đang chạy)
- **Git** (để clone project)

## 🎯 CÁCH KHỞI ĐỘNG

### Bước 1: Mở Terminal/Command Prompt
```bash
cd "d:\Vương\Nam 3 Ki 1\Do an co so\Coffee-Shop"
```

### Bước 2: Khởi động project
```bash
docker-compose up --build
```

**Hoặc chạy ngầm:**
```bash
docker-compose up --build -d
```

### Bước 3: Đợi khởi động (2-3 phút)
- Database khởi động trước
- Các microservices khởi động tiếp
- Frontend khởi động cuối

### Bước 4: Truy cập ứng dụng
- **Website**: http://localhost:5173
- **API**: http://localhost:3000

## 🔑 ĐĂNG NHẬP
- **Email**: admin@coffeeshop.com  
- **Password**: admin123

## 🛠️ LỆNH HỮU ÍCH

### Xem trạng thái:
```bash
docker-compose ps
```

### Xem logs:
```bash
docker-compose logs -f
```

### Dừng project:
```bash
docker-compose down
```

### Xóa và khởi động lại:
```bash
docker-compose down
docker-compose up --build
```

## 📊 SERVICES TRONG PROJECT

| Service | Port | Mô tả |
|---------|------|-------|
| Frontend | 5173 | Giao diện website |
| API Gateway | 3000 | Cổng API chính |
| User Service | 3001 | Quản lý người dùng |
| Menu Service | 3002 | Quản lý thực đơn |
| Table Service | 3003 | Quản lý bàn |
| Billing Service | 3004 | Quản lý hóa đơn |
| Online Order | 3005 | Đặt hàng online |
| Voucher Service | 3006 | Quản lý voucher |
| Inventory Service | 3007 | Quản lý kho |
| MySQL Database | 3306 | Cơ sở dữ liệu |

## ❗ TROUBLESHOOTING

### Nếu gặp lỗi:
1. Kiểm tra Docker Desktop đang chạy
2. Chạy: `docker-compose down`
3. Chạy lại: `docker-compose up --build`

### Nếu port bị chiếm:
- Thay đổi port trong `docker-compose.yml`
- Hoặc tắt ứng dụng đang sử dụng port đó

### Xem logs chi tiết:
```bash
docker-compose logs [service-name]
# Ví dụ: docker-compose logs frontend
```

## 🎉 HOÀN THÀNH!
Project đã sẵn sàng sử dụng tại: http://localhost:5173
