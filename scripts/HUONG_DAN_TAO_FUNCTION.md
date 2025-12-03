# Hướng dẫn tạo function TruNguyenLieuTuMoTa

## Vấn đề
Function không được tạo thành công, MySQL đang tìm function với database name `quanlycafe` (chữ thường).

## Giải pháp

### Cách 1: Chạy script đơn giản (Khuyến nghị)

1. Mở MySQL Workbench
2. Kết nối đến database `QuanLyCafe`
3. Mở file `scripts/create-function-simple.sql`
4. **QUAN TRỌNG**: Chạy từng phần một, không chạy toàn bộ script cùng lúc!

**Bước 1**: Chạy phần setup (dòng 1-10)
```sql
USE QuanLyCafe;
SELECT DATABASE() AS CurrentDatabase;
SET GLOBAL log_bin_trust_function_creators = 1;
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;
```

**Bước 2**: Chạy phần tạo function (từ DELIMITER // đến DELIMITER ;)
- Chọn từ dòng `DELIMITER //` đến dòng `DELIMITER ;`
- Chạy phần này (Ctrl+Enter)

**Bước 3**: Chạy phần kiểm tra (phần cuối)
```sql
SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';
```

### Cách 2: Tạo function thủ công

Nếu script không chạy được, tạo function thủ công:

1. Mở MySQL Workbench
2. Kết nối đến database `QuanLyCafe`
3. Chạy lệnh sau:

```sql
SET GLOBAL log_bin_trust_function_creators = 1;
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;
```

4. Sau đó chạy phần tạo function (copy toàn bộ từ DELIMITER // đến DELIMITER ;)

### Kiểm tra function đã được tạo

Sau khi tạo, chạy lệnh sau để kiểm tra:
```sql
SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';
```

Kết quả phải hiển thị 1 row với:
- ROUTINE_SCHEMA: `QuanLyCafe` hoặc `quanlycafe`
- ROUTINE_NAME: `TruNguyenLieuTuMoTa`
- ROUTINE_TYPE: `FUNCTION`

### Test function

```sql
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng', 1) AS TestResult;
```

Kết quả phải là một số (0 hoặc số nguyên dương).

### Nếu vẫn lỗi

Nếu MySQL vẫn tìm function với database name `quanlycafe` (chữ thường), có thể cần:
1. Kiểm tra xem có database nào tên `quanlycafe` (chữ thường) không
2. Tạo function trong cả 2 database nếu có

```sql
-- Kiểm tra databases
SHOW DATABASES LIKE '%cafe%';

-- Nếu có database quanlycafe (chữ thường), tạo function trong đó
USE quanlycafe;
-- Sau đó chạy lại phần tạo function
```

