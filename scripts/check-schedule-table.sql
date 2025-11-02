-- Kiểm tra bảng LichLamViec
SHOW TABLES LIKE 'LichLamViec';

-- Kiểm tra cấu trúc bảng
DESCRIBE LichLamViec;

-- Đếm số lượng records
SELECT COUNT(*) as TongSoLich FROM LichLamViec;

-- Xem dữ liệu mẫu
SELECT * FROM LichLamViec LIMIT 10;

-- Kiểm tra bảng YeuCauNhanVien
SHOW TABLES LIKE 'YeuCauNhanVien';
SELECT COUNT(*) as TongSoYeuCau FROM YeuCauNhanVien;
