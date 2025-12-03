# Hướng dẫn sửa lỗi FUNCTION quanlycafe.TruNguyenLieuTuMoTa does not exist

## Vấn đề
MySQL đang tìm function với database name `quanlycafe` (chữ thường) nhưng function có thể được tạo trong database `QuanLyCafe` (có chữ hoa).

## Giải pháp

### Bước 1: Kiểm tra database name thực tế
Chạy lệnh sau trong MySQL:
```sql
SHOW DATABASES LIKE '%cafe%';
```

### Bước 2: Chạy script sửa lỗi
Chạy một trong các script sau:

**Option 1: Sử dụng MySQL Workbench**
1. Mở MySQL Workbench
2. Kết nối đến database
3. Mở file `scripts/fix-function-case-sensitivity.sql`
4. Chạy toàn bộ script (Ctrl+Shift+Enter)

**Option 2: Sử dụng command line**
```bash
mysql -u root -p QuanLyCafe < scripts\fix-function-case-sensitivity.sql
```

### Bước 3: Kiểm tra function đã được tạo
Chạy lệnh sau:
```sql
SELECT 
    ROUTINE_SCHEMA,
    ROUTINE_NAME,
    ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';
```

Kết quả phải hiển thị function trong database `QuanLyCafe` hoặc `quanlycafe`.

### Bước 4: Test function
```sql
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng', 1) AS TestResult;
```

### Bước 5: Khởi động lại billing service
Sau khi chạy script, khởi động lại billing service:
```bash
# Nếu chạy bằng npm/node, dừng và chạy lại
# Nếu dùng Docker:
docker-compose restart billing-service
```

## Lưu ý
- Đảm bảo đang kết nối đến đúng database
- Nếu vẫn lỗi, có thể cần kiểm tra xem có database nào tên `quanlycafe` (chữ thường) không
- Nếu có 2 database (QuanLyCafe và quanlycafe), cần tạo function trong cả 2 database

