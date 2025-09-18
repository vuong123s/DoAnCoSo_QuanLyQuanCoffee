-- Tạo database và admin user
CREATE DATABASE IF NOT EXISTS QuanLyCafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyCafe;

-- Tạo bảng NhanVien nếu chưa có
CREATE TABLE IF NOT EXISTS NhanVien (
    MaNV INT PRIMARY KEY AUTO_INCREMENT,
    HoTen VARCHAR(100) NOT NULL,
    GioiTinh ENUM('Nam', 'Nữ') NOT NULL,
    NgaySinh DATE,
    SDT VARCHAR(15),
    Email VARCHAR(100) UNIQUE,
    ChucVu VARCHAR(50),
    MatKhau VARCHAR(255),
    Luong DECIMAL(10,2),
    NgayVaoLam DATE
);

-- Xóa admin cũ nếu có
DELETE FROM NhanVien WHERE Email = 'admin@coffeeshop.com';

-- Thêm admin user với mật khẩu đã hash sẵn
INSERT INTO NhanVien (HoTen, GioiTinh, NgaySinh, SDT, Email, ChucVu, MatKhau, Luong, NgayVaoLam) VALUES
('Admin Coffee Shop', 'Nam', '1990-01-01', '0123456789', 'admin@coffeeshop.com', 'Quản lý', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 15000000, '2023-01-01');

-- Kiểm tra kết quả
SELECT MaNV, Email, HoTen, ChucVu, LENGTH(MatKhau) as PasswordLength FROM NhanVien WHERE Email = 'admin@coffeeshop.com';
