-- Tạo database
CREATE DATABASE QuanLyCafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyCafe;

-- ======================
-- BẢNG NHÂN VIÊN
-- ======================
CREATE TABLE NhanVien (
    MaNV INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    GioiTinh VARCHAR(10),
    NgaySinh DATE,
    SDT VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    ChucVu VARCHAR(50),          -- Quản lý, nhân viên
    MatKhau VARCHAR(255) NOT NULL,
    Luong DECIMAL(12,2),
    NgayVaoLam DATE
);

-- ======================
-- BẢNG BÀN
-- ======================
CREATE TABLE Ban (
    MaBan INT AUTO_INCREMENT PRIMARY KEY,
    TenBan VARCHAR(50) NOT NULL,
    SoCho INT,
    TrangThai VARCHAR(20)        -- Trống, Đã đặt, Đang phục vụ
);

-- ======================
-- BẢNG LOẠI MÓN
-- ======================
CREATE TABLE LoaiMon (
    MaLoai INT AUTO_INCREMENT PRIMARY KEY,
    TenLoai VARCHAR(100) NOT NULL
);

-- ======================
-- BẢNG MÓN
-- ======================
CREATE TABLE Mon (
    MaMon INT AUTO_INCREMENT PRIMARY KEY,
    TenMon VARCHAR(100) NOT NULL,
    DonGia DECIMAL(12,2) NOT NULL,
    HinhAnh VARCHAR(255),
    MoTa VARCHAR(255),
    MaLoai INT,
    TrangThai VARCHAR(20),       -- Còn bán, Hết hàng
    FOREIGN KEY (MaLoai) REFERENCES LoaiMon(MaLoai)
);

-- ======================
-- BẢNG ĐƠN HÀNG
-- ======================
CREATE TABLE DonHang (
    MaDH INT AUTO_INCREMENT PRIMARY KEY,
    MaBan INT,
    MaNV INT,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(12,2),
    TrangThai VARCHAR(20),       -- Đang xử lý, Hoàn thành, Đã hủy
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- ======================
-- BẢNG CHI TIẾT ĐƠN HÀNG
-- ======================
CREATE TABLE CTDonHang (
    MaDH INT,
    MaMon INT,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(12,2) NOT NULL,
    ThanhTien DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (MaDH, MaMon),
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH),
    FOREIGN KEY (MaMon) REFERENCES Mon(MaMon)
);

-- ======================
-- BẢNG KHO (NGUYÊN LIỆU)
-- ======================
CREATE TABLE Kho (
    MaNL INT AUTO_INCREMENT PRIMARY KEY,
    TenNL VARCHAR(100) NOT NULL,
    DonVi VARCHAR(20),
    SoLuong DECIMAL(10,2) DEFAULT 0,
    MucCanhBao DECIMAL(10,2)     -- Ngưỡng cảnh báo
);

-- ======================
-- BẢNG KHÁCH HÀNG
-- ======================
CREATE TABLE KhachHang (
    MaKH INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100),
    SDT VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    MatKhau VARCHAR(255),
    DiemTichLuy INT DEFAULT 0
);

-- ======================
-- BẢNG ĐẶT BÀN ONLINE
-- ======================
CREATE TABLE DatBan (
    MaDat INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT,
    MaBan INT,
    NgayDat DATE,
    GioDat TIME,
    SoNguoi INT,
    TrangThai VARCHAR(20),       -- Đã đặt, Đã xác nhận, Đã hủy, Hoàn thành
    TenKhach VARCHAR(100),       -- Tên khách hàng đặt bàn
    SoDienThoai VARCHAR(15),     -- Số điện thoại khách hàng
    GhiChu TEXT,                 -- Ghi chú đặt bàn
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan)
);

-- ======================
-- BẢNG VOUCHER / KHUYẾN MÃI
-- ======================
CREATE TABLE Voucher (
    MaVC INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT NULL,               -- Có thể gắn cho KH cụ thể
    MaCode VARCHAR(50) UNIQUE,
    GiaTri DECIMAL(12,2),
    NgayBD DATE,
    NgayKT DATE,
    TrangThai VARCHAR(20),       -- Còn hạn, Hết hạn, Đã dùng
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);

CREATE TABLE Orders (
    MaOrder INT AUTO_INCREMENT PRIMARY KEY,
    MaBan INT,
    MaNV INT,                             -- Nhân viên phục vụ tạo order
    NgayOrder DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrangThai VARCHAR(20),                -- Đang phục vụ, Đã hoàn thành, Đã hủy
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

CREATE TABLE CTOrder (
    MaOrder INT,
    MaMon INT,
    SoLuong INT NOT NULL,
    GhiChu VARCHAR(255),                  -- VD: ít đá, thêm đường
    PRIMARY KEY (MaOrder, MaMon),
    FOREIGN KEY (MaOrder) REFERENCES Orders(MaOrder),
    FOREIGN KEY (MaMon) REFERENCES Mon(MaMon)
);

-- ======================
-- BẢNG THANH TOÁN
-- ======================
CREATE TABLE ThanhToan (
    MaTT INT AUTO_INCREMENT PRIMARY KEY,
    MaDH INT,
    HinhThuc VARCHAR(50),        -- Tiền mặt, Thẻ, Ví điện tử
    SoTien DECIMAL(12,2),
    NgayTT DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH)
);

-- ======================
-- DỮ LIỆU MẪU
-- ======================

-- Thêm nhân viên mẫu
INSERT INTO NhanVien (HoTen, GioiTinh, NgaySinh, SDT, Email, ChucVu, MatKhau, Luong, NgayVaoLam) VALUES
('Nguyễn Văn Admin', 'Nam', '1990-01-01', '0123456789', 'admin@coffeeshop.com', 'Quản lý', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 15000000, '2023-01-01'),
('Trần Thị Manager', 'Nữ', '1992-05-15', '0987654321', 'manager@coffeeshop.com', 'Quản lý', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 12000000, '2023-02-01'),
('Lê Văn Staff', 'Nam', '1995-08-20', '0111222333', 'staff@coffeeshop.com', 'Nhân viên', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 8000000, '2023-03-01'),
('Phạm Thị Thu', 'Nữ', '1997-12-10', '0444555666', 'thu@coffeeshop.com', 'Nhân viên', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 7500000, '2023-04-15'),
('Hoàng Văn Nam', 'Nam', '1994-06-25', '0777888999', 'nam@coffeeshop.com', 'Nhân viên', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 8200000, '2023-05-20');

-- Thêm bàn
INSERT INTO Ban (TenBan, SoCho, TrangThai) VALUES
('Bàn 01', 2, 'Trống'),
('Bàn 02', 4, 'Trống'),
('Bàn 03', 6, 'Trống'),
('Bàn 04', 2, 'Trống'),
('Bàn 05', 4, 'Trống'),
('Bàn 06', 8, 'Trống'),
('Bàn 07', 2, 'Trống'),
('Bàn 08', 4, 'Trống'),
('Bàn 09', 6, 'Trống'),
('Bàn 10', 2, 'Trống');

-- Thêm loại món
INSERT INTO LoaiMon (TenLoai) VALUES
('Cà phê'),
('Trà'),
('Nước ép'),
('Bánh ngọt'),
('Bánh mặn'),
('Đồ uống đá xay'),
('Món nóng'),
('Salad');

-- Thêm món ăn/uống
INSERT INTO Mon (TenMon, DonGia, HinhAnh, MoTa, MaLoai, TrangThai) VALUES
('Cà phê đen', 25000, 'ca-phe-den.jpg', 'Cà phê đen truyền thống Việt Nam', 1, 'Còn bán'),
('Cà phê sữa', 30000, 'ca-phe-sua.jpg', 'Cà phê sữa đá thơm ngon', 1, 'Còn bán'),
('Cappuccino', 45000, 'cappuccino.jpg', 'Cà phê Cappuccino Ý nguyên chất', 1, 'Còn bán'),
('Americano', 35000, 'americano.jpg', 'Cà phê Americano đậm đà', 1, 'Còn bán'),
('Latte', 40000, 'latte.jpg', 'Cà phê Latte với bọt sữa mịn', 1, 'Còn bán'),
('Trà đào', 35000, 'tra-dao.jpg', 'Trà đào cam sả thơm mát', 2, 'Còn bán'),
('Trà sữa trân châu', 40000, 'tra-sua-tran-chau.jpg', 'Trà sữa trân châu đen ngọt ngào', 2, 'Còn bán'),
('Trà xanh', 25000, 'tra-xanh.jpg', 'Trà xanh thanh mát', 2, 'Còn bán'),
('Nước cam', 25000, 'nuoc-cam.jpg', 'Nước cam tươi nguyên chất', 3, 'Còn bán'),
('Sinh tố bơ', 35000, 'sinh-to-bo.jpg', 'Sinh tố bơ béo ngậy', 3, 'Còn bán'),
('Bánh croissant', 40000, 'banh-croissant.jpg', 'Bánh croissant bơ thơm giòn', 4, 'Còn bán'),
('Bánh tiramisu', 55000, 'banh-tiramisu.jpg', 'Bánh tiramisu Ý chính hiệu', 4, 'Còn bán'),
('Bánh mì thịt nướng', 35000, 'banh-mi-thit-nuong.jpg', 'Bánh mì thịt nướng đặc biệt', 5, 'Còn bán'),
('Sandwich gà', 45000, 'sandwich-ga.jpg', 'Sandwich gà phô mai', 5, 'Còn bán'),
('Frappuccino', 50000, 'frappuccino.jpg', 'Đồ uống đá xay cà phê', 6, 'Còn bán'),
('Chocolate đá xay', 45000, 'chocolate-da-xay.jpg', 'Chocolate đá xay thơm ngon', 6, 'Còn bán'),
('Mì Ý sốt kem', 65000, 'mi-y-sot-kem.jpg', 'Mì Ý sốt kem nấm', 7, 'Còn bán'),
('Cơm chiên hải sản', 70000, 'com-chien-hai-san.jpg', 'Cơm chiên hải sản đặc biệt', 7, 'Còn bán'),
('Salad Caesar', 55000, 'salad-caesar.jpg', 'Salad Caesar với gà nướng', 8, 'Còn bán'),
('Salad trái cây', 45000, 'salad-trai-cay.jpg', 'Salad trái cây tươi mát', 8, 'Còn bán');

-- Thêm nguyên liệu kho
INSERT INTO Kho (TenNL, DonVi, SoLuong, MucCanhBao) VALUES
('Cà phê hạt Arabica', 'kg', 50.00, 10.00),
('Cà phê hạt Robusta', 'kg', 30.00, 8.00),
('Sữa tươi', 'lít', 100.00, 20.00),
('Đường trắng', 'kg', 25.00, 5.00),
('Trà xanh', 'kg', 15.00, 3.00),
('Trà đen', 'kg', 12.00, 3.00),
('Trân châu', 'kg', 8.00, 2.00),
('Bơ', 'kg', 20.00, 5.00),
('Cam tươi', 'kg', 30.00, 10.00),
('Bánh mì', 'ổ', 50, 15),
('Thịt gà', 'kg', 15.00, 5.00),
('Phô mai', 'kg', 8.00, 2.00),
('Chocolate', 'kg', 10.00, 3.00),
('Kem tươi', 'lít', 25.00, 8.00),
('Mì Ý', 'kg', 12.00, 4.00);

-- Thêm khách hàng mẫu
INSERT INTO KhachHang (HoTen, SDT, Email, DiemTichLuy) VALUES
('Phạm Văn Khách', '0999888777', 'khach1@email.com', 150),
('Hoàng Thị Lan', '0888777666', 'khach2@email.com', 230),
('Nguyễn Minh Tuấn', '0777666555', 'khach3@email.com', 80),
('Lê Thị Hoa', '0666555444', 'khach4@email.com', 320),
('Trần Văn Đức', '0555444333', 'khach5@email.com', 95);

-- Thêm đặt bàn mẫu
INSERT INTO DatBan (MaKH, MaBan, NgayDat, GioDat, SoNguoi, TrangThai) VALUES
(1, 2, '2024-01-15', '19:00:00', 4, 'Đã đặt'),
(2, 5, '2024-01-16', '18:30:00', 2, 'Đã đặt'),
(3, 3, '2024-01-17', '20:00:00', 6, 'Hoàn thành'),
(4, 1, '2024-01-18', '12:00:00', 2, 'Hoàn thành'),
(5, 4, '2024-01-19', '14:30:00', 4, 'Đã đặt');

-- Thêm voucher mẫu
INSERT INTO Voucher (MaKH, MaCode, GiaTri, NgayBD, NgayKT, TrangThai) VALUES
(1, 'WELCOME10', 50000, '2024-01-01', '2024-12-31', 'Còn hạn'),
(2, 'BIRTHDAY20', 100000, '2024-01-01', '2024-06-30', 'Còn hạn'),
(NULL, 'NEWCUSTOMER', 30000, '2024-01-01', '2024-12-31', 'Còn hạn'),
(3, 'LOYAL50', 150000, '2024-01-01', '2024-12-31', 'Đã dùng'),
(NULL, 'WEEKEND15', 75000, '2024-01-01', '2024-12-31', 'Còn hạn');

-- Thêm đơn hàng mẫu
INSERT INTO DonHang (MaBan, MaNV, NgayLap, TongTien, TrangThai) VALUES
(1, 3, '2024-01-15 10:30:00', 125000, 'Hoàn thành'),
(2, 4, '2024-01-15 14:15:00', 85000, 'Hoàn thành'),
(3, 3, '2024-01-16 09:45:00', 200000, 'Hoàn thành'),
(4, 5, '2024-01-16 16:20:00', 65000, 'Đang xử lý'),
(5, 4, '2024-01-17 11:10:00', 150000, 'Hoàn thành');

-- Thêm chi tiết đơn hàng
INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien) VALUES
(1, 1, 2, 25000, 50000),
(1, 11, 1, 40000, 40000),
(1, 9, 1, 25000, 25000),
(2, 3, 1, 45000, 45000),
(2, 12, 1, 55000, 55000),
(3, 5, 2, 40000, 80000),
(3, 7, 2, 40000, 80000),
(3, 13, 1, 35000, 35000),
(4, 2, 1, 30000, 30000),
(4, 6, 1, 35000, 35000),
(5, 15, 2, 50000, 100000),
(5, 14, 1, 45000, 45000);

-- Thêm orders mẫu (cho hệ thống order riêng)
INSERT INTO Orders (MaBan, MaNV, NgayOrder, TrangThai) VALUES
(6, 3, '2024-01-18 10:00:00', 'Đang phục vụ'),
(7, 4, '2024-01-18 11:30:00', 'Đã hoàn thành'),
(8, 5, '2024-01-18 14:45:00', 'Đang phục vụ');

-- Thêm chi tiết orders
INSERT INTO CTOrder (MaOrder, MaMon, SoLuong, GhiChu) VALUES
(1, 1, 2, 'Ít đường'),
(1, 4, 1, 'Nóng'),
(2, 7, 1, 'Ít đá'),
(2, 11, 2, 'Thêm bơ'),
(3, 17, 1, 'Không cay'),
(3, 19, 1, 'Thêm sốt');

-- Thêm thanh toán mẫu
INSERT INTO ThanhToan (MaDH, HinhThuc, SoTien, NgayTT) VALUES
(1, 'Tiền mặt', 125000, '2024-01-15 10:45:00'),
(2, 'Thẻ', 85000, '2024-01-15 14:30:00'),
(3, 'Ví điện tử', 200000, '2024-01-16 10:00:00'),
(5, 'Tiền mặt', 150000, '2024-01-17 11:25:00');
