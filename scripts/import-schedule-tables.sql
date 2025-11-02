USE QuanLyCafe;

-- ======================
-- BẢNG LỊCH LÀM VIỆC & CHẤM CÔNG
-- ======================
CREATE TABLE IF NOT EXISTS LichLamViec (
    MaLich INT AUTO_INCREMENT PRIMARY KEY,
    MaNV INT NOT NULL,
    NgayLam DATE NOT NULL,
    CaLam VARCHAR(20) NOT NULL,
    GioBatDau TIME NOT NULL,
    GioKetThuc TIME NOT NULL,
    GioVao TIME,
    GioRa TIME,
    SoGioLam DECIMAL(5,2),
    TrangThai VARCHAR(30) DEFAULT 'Đã xếp lịch',
    GhiChu TEXT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    UNIQUE KEY unique_schedule (MaNV, NgayLam, CaLam)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ======================
-- BẢNG YÊU CẦU NHÂN VIÊN
-- ======================
CREATE TABLE IF NOT EXISTS YeuCauNhanVien (
    MaYeuCau INT AUTO_INCREMENT PRIMARY KEY,
    MaNV INT NOT NULL,
    LoaiYeuCau VARCHAR(30) NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE,
    GioBatDau TIME,
    GioKetThuc TIME,
    LyDo TEXT NOT NULL,
    TrangThai VARCHAR(30) DEFAULT 'Chờ duyệt',
    NguoiDuyet INT,
    NgayDuyet DATETIME,
    GhiChuDuyet TEXT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (NguoiDuyet) REFERENCES NhanVien(MaNV)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ======================
-- DỮ LIỆU MẪU
-- ======================

-- Xóa dữ liệu cũ nếu có
DELETE FROM YeuCauNhanVien;
DELETE FROM LichLamViec;

-- Lịch làm việc mẫu cho tháng 11/2025
INSERT INTO LichLamViec (MaNV, NgayLam, CaLam, GioBatDau, GioKetThuc, TrangThai, GioVao, GioRa, SoGioLam, GhiChu) VALUES
-- Nhân viên 1 - Nguyễn Văn Admin
(1, '2025-11-01', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '05:55:00', '14:05:00', 8.17, 'Đã xong'),
(1, '2025-11-02', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '13:50:00', '22:10:00', 8.33, 'Hoàn thành'),
(1, '2025-11-03', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '06:00:00', '14:00:00', 8.00, NULL),
(1, '2025-11-04', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '14:05:00', '22:00:00', 7.92, NULL),

-- Tuần 2
(1, '2025-10-12', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '05:55:00', '14:05:00', 8.17, 'Hoàn thành'),
(1, '2025-10-13', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '13:50:00', '22:10:00', 8.33, 'Hoàn thành'),
(1, '2025-10-14', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '06:00:00', '14:00:00', 8.00, 'Hoàn thành'),
(1, '2025-10-15', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '14:05:00', '22:00:00', 7.92, 'Hoàn thành'),

-- Tuần 3
(1, '2025-10-19', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '06:10:00', '14:00:00', 7.83, 'Hoàn thành'),
(1, '2025-10-20', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '14:00:00', '22:15:00', 8.25, 'Hoàn thành'),
(1, '2025-10-21', 'Ca sáng', '06:00:00', '14:00:00', 'Vắng mặt', NULL, NULL, 0, 'Nghỉ phép'),
(1, '2025-10-22', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '14:00:00', '22:00:00', 8.00, 'Hoàn thành'),

-- Nhân viên 2 - Trần Thị Manager
(2, '2025-11-01', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '13:55:00', '22:00:00', 8.08, NULL),
(2, '2025-11-02', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '06:00:00', '14:00:00', 8.00, NULL),
(2, '2025-11-03', 'Ca chiều', '14:00:00', '22:00:00', 'Hoàn thành', '14:00:00', '22:05:00', 8.08, NULL),
(2, '2025-11-04', 'Ca sáng', '06:00:00', '14:00:00', 'Hoàn thành', '06:05:00', '14:00:00', 7.92, NULL);

-- Yêu cầu nghỉ phép / tăng ca mẫu
INSERT INTO YeuCauNhanVien (MaNV, LoaiYeuCau, NgayBatDau, NgayKetThuc, GioBatDau, GioKetThuc, LyDo, TrangThai, NguoiDuyet, NgayDuyet, GhiChuDuyet) VALUES
(1, 'Nghỉ phép', '2025-10-21', '2025-10-21', NULL, NULL, 'Nghỉ phép có việc gia đình', 'Đã duyệt', 2, '2025-10-20 10:00:00', 'Đồng ý cho nghỉ'),
(2, 'Tăng ca', '2025-10-15', '2025-10-15', '22:00:00', '24:00:00', 'Tăng ca hoàn thành dự án', 'Đã duyệt', 1, '2025-10-14 15:00:00', 'Đồng ý tăng ca'),
(3, 'Nghỉ ốm', '2025-11-05', '2025-11-06', NULL, NULL, 'Nghỉ ốm', 'Chờ duyệt', NULL, NULL, NULL),
(4, 'Nghỉ phép', '2025-11-10', '2025-11-12', NULL, NULL, 'Du lịch', 'Chờ duyệt', NULL, NULL, NULL);

-- Kiểm tra kết quả
SELECT 'Đã tạo bảng và import dữ liệu thành công!' as Status;
SELECT COUNT(*) as TongSoLichLamViec FROM LichLamViec;
SELECT COUNT(*) as TongSoYeuCau FROM YeuCauNhanVien;
