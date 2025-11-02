USE QuanLyCafe;

-- Kiểm tra bảng LichLamViec có tồn tại không
SHOW TABLES LIKE 'LichLamViec';

-- Kiểm tra cấu trúc bảng
DESCRIBE LichLamViec;

-- Đếm số lượng records
SELECT COUNT(*) as TongSoLich FROM LichLamViec;

-- Xem dữ liệu mẫu với thông tin nhân viên
SELECT 
    l.MaLich,
    l.MaNV,
    nv.HoTen,
    nv.ChucVu,
    l.NgayLam,
    l.CaLam,
    l.GioBatDau,
    l.GioKetThuc,
    l.TrangThai,
    MONTH(l.NgayLam) as Thang,
    YEAR(l.NgayLam) as Nam
FROM LichLamViec l
LEFT JOIN NhanVien nv ON l.MaNV = nv.MaNV
ORDER BY l.NgayLam DESC
LIMIT 20;

-- Kiểm tra data theo tháng 11/2025
SELECT 
    l.*,
    nv.HoTen,
    nv.ChucVu
FROM LichLamViec l
INNER JOIN NhanVien nv ON l.MaNV = nv.MaNV
WHERE MONTH(l.NgayLam) = 11 AND YEAR(l.NgayLam) = 2025
ORDER BY l.NgayLam DESC, l.GioBatDau ASC;
