# Hướng dẫn chi tiết tạo function TruNguyenLieuTuMoTa

## Vấn đề
Function không tạo được do lỗi syntax trong MySQL Workbench.

## Giải pháp - Cách 1: Chạy từng bước (Khuyến nghị)

### Bước 1: Setup
Chạy các lệnh sau trong MySQL Workbench:
```sql
USE QuanLyCafe;
SET GLOBAL log_bin_trust_function_creators = 1;
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;
```

### Bước 2: Tạo function
1. Mở file `scripts/create-function-from-original.sql`
2. **QUAN TRỌNG**: Chỉ chọn và chạy phần từ `DELIMITER //` đến `DELIMITER ;`
   - Chọn từ dòng có `DELIMITER //`
   - Đến dòng có `DELIMITER ;`
   - Click chuột phải → **Execute (Selected)** hoặc nhấn **Ctrl+Shift+Enter**

### Bước 3: Kiểm tra
```sql
SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';
```

## Giải pháp - Cách 2: Chạy bằng command line

Nếu MySQL Workbench không chạy được, thử chạy bằng command line:

```bash
mysql -u root -p QuanLyCafe < scripts/create-function-from-original.sql
```

## Giải pháp - Cách 3: Chạy trực tiếp từ file gốc

1. Mở file `QuanLyCaFe.sql`
2. Tìm dòng 2396 (có `CREATE FUNCTION TruNguyenLieuTuMoTa`)
3. Tìm dòng trước đó có `DELIMITER //` (khoảng dòng 2273)
4. Copy từ `DELIMITER //` đến `DELIMITER ;` (sau dòng 2510)
5. Paste vào MySQL Workbench và chạy

## Lưu ý quan trọng

1. **Phải chạy DELIMITER // và DELIMITER ; cùng với CREATE FUNCTION**
2. **Không chạy toàn bộ file cùng lúc** - chỉ chạy phần function
3. **Nếu vẫn lỗi**, thử:
   - Đóng và mở lại MySQL Workbench
   - Kiểm tra version MySQL (cần MySQL 5.7+)
   - Thử chạy bằng command line thay vì Workbench

## Kiểm tra sau khi tạo

Sau khi tạo thành công, test function:
```sql
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng', 1) AS TestResult;
```

Kết quả phải là một số (0 hoặc số nguyên dương).

