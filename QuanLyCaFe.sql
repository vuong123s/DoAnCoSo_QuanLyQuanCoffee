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
-- BẢNG KHU VỰC
-- ======================
CREATE TABLE KhuVuc (
    MaKhuVuc INT AUTO_INCREMENT PRIMARY KEY,
    TenKhuVuc VARCHAR(100) NOT NULL,
    MoTa VARCHAR(255),
    HinhAnh VARCHAR(500),        -- Đường dẫn hình ảnh minh họa khu vực
    Video VARCHAR(500),          -- Đường dẫn video giới thiệu khu vực
    TrangThai VARCHAR(20) DEFAULT 'Hoạt động'  -- Hoạt động, Tạm đóng
);

-- ======================
-- BẢNG BÀN
-- ======================
CREATE TABLE Ban (
    MaBan INT AUTO_INCREMENT PRIMARY KEY,
    TenBan VARCHAR(50) NOT NULL,
    SoCho INT,
    MaKhuVuc INT,
    ViTri VARCHAR(100),          -- Vị trí cụ thể trong khu vực
    TrangThai VARCHAR(20),       -- Trống, Đã đặt, Đang phục vụ, Bảo trì
    FOREIGN KEY (MaKhuVuc) REFERENCES KhuVuc(MaKhuVuc)
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
    DonVi VARCHAR(20) NOT NULL,
    SoLuong DECIMAL(10,2) DEFAULT 0,
    MucCanhBao DECIMAL(10,2) NOT NULL,     -- Ngưỡng cảnh báo
    DonGiaNhap DECIMAL(12,2),              -- Đơn giá nhập kho
    NgayNhap DATE,                         -- Ngày nhập gần nhất
    NgayHetHan DATE,                       -- Ngày hết hạn (nếu có)
    TrangThai VARCHAR(20) DEFAULT 'Còn hàng'  -- Còn hàng, Hết hàng, Gần hết
);

-- ======================
-- BẢNG KHÁCH HÀNG
-- ======================
CREATE TABLE KhachHang (
    MaKH INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    GioiTinh VARCHAR(10),
    NgaySinh DATE,
    SDT VARCHAR(20) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    DiaChi TEXT,
    DiemTichLuy INT DEFAULT 0,
    NgayDangKy DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrangThai VARCHAR(20) DEFAULT 'Hoạt động'  -- Hoạt động, Tạm khóa
);

-- ======================
-- BẢNG ĐẶT BÀN
-- ======================
CREATE TABLE DatBan (
    MaDat INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT,
    MaBan INT NOT NULL,
    NgayDat DATE NOT NULL,
    GioDat TIME NOT NULL,                    -- Giờ bắt đầu đặt bàn
    GioKetThuc TIME NOT NULL,                -- Giờ kết thúc đặt bàn
    SoNguoi INT NOT NULL,
    TrangThai VARCHAR(20) DEFAULT 'Đã đặt',  -- Đã đặt, Đã xác nhận, Đã hủy, Hoàn thành
    TenKhach VARCHAR(100) NOT NULL,          -- Tên khách hàng đặt bàn
    SoDienThoai VARCHAR(15) NOT NULL,        -- Số điện thoại khách hàng
    EmailKhach VARCHAR(100),                 -- Email khách hàng
    GhiChu TEXT,                             -- Ghi chú đặt bàn
    NgayTaoDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNVXuLy INT,                            -- Nhân viên xử lý đặt bàn
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan),
    FOREIGN KEY (MaNVXuLy) REFERENCES NhanVien(MaNV)
);

-- ======================
-- BẢNG VOUCHER / KHUYẾN MÃI
-- ======================
CREATE TABLE Voucher (
    MaVC INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT NULL,                           -- Có thể gắn cho KH cụ thể
    TenVC VARCHAR(100) NOT NULL,             -- Tên voucher
    MaCode VARCHAR(50) UNIQUE NOT NULL,
    LoaiGiamGia VARCHAR(20) DEFAULT 'Tiền', -- Tiền, Phần trăm
    GiaTri DECIMAL(12,2) NOT NULL,
    GiaTriToiDa DECIMAL(12,2),               -- Giá trị giảm tối đa (cho % discount)
    DonHangToiThieu DECIMAL(12,2) DEFAULT 0, -- Đơn hàng tối thiểu để áp dụng
    SoLuongToiDa INT DEFAULT 1,              -- Số lượng voucher có thể sử dụng
    SoLuongDaSuDung INT DEFAULT 0,           -- Số lượng đã sử dụng
    NgayBD DATE NOT NULL,
    NgayKT DATE NOT NULL,
    TrangThai VARCHAR(20) DEFAULT 'Còn hạn', -- Còn hạn, Hết hạn, Tạm dừng
    MoTa TEXT,                               -- Mô tả voucher
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
);

-- ======================
-- BẢNG GIỎ HÀNG ONLINE
-- ======================
CREATE TABLE GioHang (
    MaGH INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT,
    MaMon INT,
    SoLuong INT NOT NULL DEFAULT 1,
    GhiChu VARCHAR(255),         -- Ghi chú đặc biệt cho món
    NgayThem DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaMon) REFERENCES Mon(MaMon),
    UNIQUE KEY unique_cart_item (MaKH, MaMon)
);

-- ======================
-- BẢNG ĐƠN HÀNG ONLINE
-- ======================
CREATE TABLE DonHangOnline (
    MaDHOnline INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT,
    TenKhach VARCHAR(100) NOT NULL,
    SDTKhach VARCHAR(20) NOT NULL,
    EmailKhach VARCHAR(100),
    DiaChiGiaoHang TEXT NOT NULL,
    LoaiDonHang VARCHAR(20) DEFAULT 'Giao hàng',  -- Giao hàng, Mang đi
    NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayGiaoMong DATETIME,       -- Thời gian mong muốn nhận hàng
    TongTien DECIMAL(12,2),
    PhiGiaoHang DECIMAL(12,2) DEFAULT 0,
    TongThanhToan DECIMAL(12,2), -- Tổng tiền + phí giao hàng
    MaVC INT NULL,               -- Voucher áp dụng
    GiamGia DECIMAL(12,2) DEFAULT 0,
    TrangThai VARCHAR(30) DEFAULT 'Chờ xác nhận',  -- Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Hoàn thành, Đã hủy
    LyDoHuy TEXT,                -- Lý do hủy đơn (nếu có)
    MaNVXuLy INT,                -- Nhân viên xử lý đơn
    GhiChu TEXT,                 -- Ghi chú của khách hàng
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaVC) REFERENCES Voucher(MaVC),
    FOREIGN KEY (MaNVXuLy) REFERENCES NhanVien(MaNV)
);

-- ======================
-- BẢNG CHI TIẾT ĐƠN HÀNG ONLINE
-- ======================
CREATE TABLE CTDonHangOnline (
    MaDHOnline INT,
    MaMon INT,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(12,2) NOT NULL,
    ThanhTien DECIMAL(12,2) NOT NULL,
    GhiChu VARCHAR(255),         -- Ghi chú đặc biệt cho món
    PRIMARY KEY (MaDHOnline, MaMon),
    FOREIGN KEY (MaDHOnline) REFERENCES DonHangOnline(MaDHOnline),
    FOREIGN KEY (MaMon) REFERENCES Mon(MaMon)
);

-- ======================
-- BẢNG THEO DÕI ĐƠN HÀNG
-- ======================
CREATE TABLE TheoDoiDonHang (
    MaTheoDoi INT AUTO_INCREMENT PRIMARY KEY,
    MaDHOnline INT,
    TrangThai VARCHAR(30),
    MoTa VARCHAR(255),
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNVCapNhat INT,
    FOREIGN KEY (MaDHOnline) REFERENCES DonHangOnline(MaDHOnline),
    FOREIGN KEY (MaNVCapNhat) REFERENCES NhanVien(MaNV)
);

-- ======================
-- BẢNG ORDER TẠI CHỖ
-- ======================
CREATE TABLE Orders (
    MaOrder INT AUTO_INCREMENT PRIMARY KEY,
    MaBan INT NOT NULL,
    MaNV INT NOT NULL,                       -- Nhân viên phục vụ tạo order
    NgayOrder DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(12,2) DEFAULT 0,       -- Tổng tiền order
    TrangThai VARCHAR(20) DEFAULT 'Đang phục vụ', -- Đang phục vụ, Đã hoàn thành, Đã hủy
    GhiChu TEXT,                             -- Ghi chú cho order
    FOREIGN KEY (MaBan) REFERENCES Ban(MaBan),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
);

-- ======================
-- BẢNG CHI TIẾT ORDER TẠI CHỖ
-- ======================
CREATE TABLE CTOrder (
    MaOrder INT,
    MaMon INT,
    SoLuong INT NOT NULL,
    GhiChu VARCHAR(255),                     -- VD: ít đá, thêm đường
    TrangThaiMon VARCHAR(20) DEFAULT 'Chờ xử lý', -- Chờ xử lý, Đang làm, Hoàn thành
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
    MaOrder INT,                             -- Liên kết với order tại chỗ (nếu có)
    MaDHOnline INT,                          -- Liên kết với đơn hàng online (nếu có)
    HinhThuc VARCHAR(50) NOT NULL,           -- Tiền mặt, Thẻ, Ví điện tử, Chuyển khoản
    SoTien DECIMAL(12,2) NOT NULL,
    SoTienNhan DECIMAL(12,2),                -- Số tiền nhận (cho tiền mặt)
    SoTienThua DECIMAL(12,2) DEFAULT 0,      -- Số tiền thừa
    MaGiaoDich VARCHAR(100),                 -- Mã giao dịch (cho thanh toán điện tử)
    TrangThai VARCHAR(20) DEFAULT 'Thành công', -- Thành công, Thất bại, Chờ xử lý
    NgayTT DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNVXuLy INT,                            -- Nhân viên xử lý thanh toán
    GhiChu TEXT,                             -- Ghi chú thanh toán
    FOREIGN KEY (MaDH) REFERENCES DonHang(MaDH),
    FOREIGN KEY (MaOrder) REFERENCES Orders(MaOrder),
    FOREIGN KEY (MaDHOnline) REFERENCES DonHangOnline(MaDHOnline),
    FOREIGN KEY (MaNVXuLy) REFERENCES NhanVien(MaNV)
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

-- Thêm khu vực
INSERT INTO KhuVuc (TenKhuVuc, MoTa, HinhAnh, Video, TrangThai) VALUES
('Tầng 1 - Khu A', 'Khu vực chính tầng 1, gần quầy bar với không gian mở rộng rãi', 
 '/images/areas/tang1-khu-a.jpg', '/videos/areas/tang1-khu-a-tour.mp4', 'Hoạt động'),
('Tầng 1 - Khu B', 'Khu vực tầng 1, gần cửa sổ với ánh sáng tự nhiên tuyệt đẹp', 
 '/images/areas/tang1-khu-b.jpg', '/videos/areas/tang1-khu-b-tour.mp4', 'Hoạt động'),
('Tầng 2 - Khu VIP', 'Khu vực VIP tầng 2, yên tĩnh và sang trọng cho cuộc họp', 
 '/images/areas/tang2-vip.jpg', '/videos/areas/tang2-vip-tour.mp4', 'Hoạt động'),
('Sân vườn', 'Khu vực ngoài trời, thoáng mát với cây xanh và không khí trong lành', 
 '/images/areas/san-vuon.jpg', '/videos/areas/san-vuon-tour.mp4', 'Hoạt động'),
('Phòng riêng', 'Các phòng riêng cho nhóm lớn, trang bị đầy đủ tiện nghi hiện đại', 
 '/images/areas/phong-rieng.jpg', '/videos/areas/phong-rieng-tour.mp4', 'Hoạt động');

-- Thêm bàn với khu vực
INSERT INTO Ban (TenBan, SoCho, MaKhuVuc, ViTri, TrangThai) VALUES
('Bàn 01', 2, 1, 'Gần quầy bar', 'Trống'),
('Bàn 02', 4, 1, 'Giữa khu vực', 'Trống'),
('Bàn 03', 6, 1, 'Góc khu vực', 'Trống'),
('Bàn 04', 2, 2, 'Cạnh cửa sổ', 'Trống'),
('Bàn 05', 4, 2, 'Giữa khu vực', 'Trống'),
('Bàn 06', 8, 3, 'Phòng VIP 1', 'Trống'),
('Bàn 07', 2, 4, 'Sân vườn - Góc 1', 'Trống'),
('Bàn 08', 4, 4, 'Sân vườn - Giữa', 'Trống'),
('Bàn 09', 6, 4, 'Sân vườn - Góc 2', 'Trống'),
('Bàn 10', 2, 2, 'Cạnh cửa sổ', 'Trống'),
('Bàn 11', 10, 5, 'Phòng riêng 1', 'Trống'),
('Bàn 12', 12, 5, 'Phòng riêng 2', 'Trống');

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
INSERT INTO Kho (TenNL, DonVi, SoLuong, MucCanhBao, DonGiaNhap, NgayNhap, TrangThai) VALUES
('Cà phê hạt Arabica', 'kg', 50.00, 10.00, 180000, '2024-01-10', 'Còn hàng'),
('Cà phê hạt Robusta', 'kg', 30.00, 8.00, 120000, '2024-01-10', 'Còn hàng'),
('Sữa tươi', 'lít', 100.00, 20.00, 25000, '2024-01-15', 'Còn hàng'),
('Đường trắng', 'kg', 25.00, 5.00, 22000, '2024-01-12', 'Còn hàng'),
('Trà xanh', 'kg', 15.00, 3.00, 150000, '2024-01-08', 'Còn hàng'),
('Trà đen', 'kg', 12.00, 3.00, 130000, '2024-01-08', 'Còn hàng'),
('Trân châu', 'kg', 8.00, 2.00, 45000, '2024-01-14', 'Còn hàng'),
('Bơ', 'kg', 20.00, 5.00, 80000, '2024-01-13', 'Còn hàng'),
('Cam tươi', 'kg', 30.00, 10.00, 35000, '2024-01-16', 'Còn hàng'),
('Bánh mì', 'ổ', 50, 15, 8000, '2024-01-17', 'Còn hàng'),
('Thịt gà', 'kg', 15.00, 5.00, 95000, '2024-01-14', 'Còn hàng'),
('Phô mai', 'kg', 8.00, 2.00, 120000, '2024-01-11', 'Còn hàng'),
('Chocolate', 'kg', 10.00, 3.00, 200000, '2024-01-09', 'Còn hàng'),
('Kem tươi', 'lít', 25.00, 8.00, 45000, '2024-01-15', 'Còn hàng'),
('Mì Ý', 'kg', 12.00, 4.00, 55000, '2024-01-12', 'Còn hàng');

-- Thêm khách hàng mẫu
INSERT INTO KhachHang (HoTen, GioiTinh, NgaySinh, SDT, Email, MatKhau, DiaChi, DiemTichLuy) VALUES
('Phạm Văn Khách', 'Nam', '1985-03-15', '0999888777', 'khach1@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Nguyễn Huệ, Q1, TP.HCM', 150),
('Hoàng Thị Lan', 'Nữ', '1990-07-22', '0888777666', 'khach2@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456 Lê Lợi, Q3, TP.HCM', 230),
('Nguyễn Minh Tuấn', 'Nam', '1988-12-08', '0777666555', 'khach3@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '789 Trần Hưng Đạo, Q5, TP.HCM', 80),
('Lê Thị Hoa', 'Nữ', '1992-04-18', '0666555444', 'khach4@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '321 Võ Văn Tần, Q3, TP.HCM', 320),
('Trần Văn Đức', 'Nam', '1987-09-25', '0555444333', 'khach5@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '654 Pasteur, Q1, TP.HCM', 95);

-- Thêm đặt bàn mẫu
INSERT INTO DatBan (MaKH, MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi, TrangThai, TenKhach, SoDienThoai, EmailKhach, GhiChu, MaNVXuLy) VALUES
(1, 2, '2024-01-15', '19:00:00', '21:00:00', 4, 'Đã xác nhận', 'Phạm Văn Khách', '0999888777', 'khach1@email.com', 'Bàn gần cửa sổ', 3),
(2, 5, '2024-01-16', '18:30:00', '20:30:00', 2, 'Đã đặt', 'Hoàng Thị Lan', '0888777666', 'khach2@email.com', 'Sinh nhật', 4),
(3, 3, '2024-01-17', '20:00:00', '22:30:00', 6, 'Hoàn thành', 'Nguyễn Minh Tuấn', '0777666555', 'khach3@email.com', 'Họp mặt bạn bè', 3),
(4, 1, '2024-01-18', '12:00:00', '14:00:00', 2, 'Hoàn thành', 'Lê Thị Hoa', '0666555444', 'khach4@email.com', NULL, 5),
(5, 4, '2024-01-19', '14:30:00', '16:30:00', 4, 'Đã đặt', 'Trần Văn Đức', '0555444333', 'khach5@email.com', 'Họp kinh doanh', 4);

-- Thêm voucher mẫu
INSERT INTO Voucher (MaKH, TenVC, MaCode, LoaiGiamGia, GiaTri, GiaTriToiDa, DonHangToiThieu, SoLuongToiDa, NgayBD, NgayKT, TrangThai, MoTa) VALUES
(1, 'Voucher Chào Mừng', 'WELCOME10', 'Tiền', 50000, NULL, 200000, 1, '2024-01-01', '2024-12-31', 'Còn hạn', 'Giảm 50k cho đơn hàng từ 200k'),
(2, 'Voucher Sinh Nhật', 'BIRTHDAY20', 'Phần trăm', 20, 100000, 300000, 1, '2024-01-01', '2024-06-30', 'Còn hạn', 'Giảm 20% tối đa 100k cho đơn từ 300k'),
(NULL, 'Khách Hàng Mới', 'NEWCUSTOMER', 'Tiền', 30000, NULL, 150000, 100, '2024-01-01', '2024-12-31', 'Còn hạn', 'Giảm 30k cho khách hàng mới'),
(3, 'Khách Hàng Thân Thiết', 'LOYAL50', 'Tiền', 150000, NULL, 500000, 1, '2024-01-01', '2024-12-31', 'Tạm dừng', 'Giảm 150k cho khách VIP'),
(NULL, 'Cuối Tuần Vui Vẻ', 'WEEKEND15', 'Phần trăm', 15, 75000, 200000, 50, '2024-01-01', '2024-12-31', 'Còn hạn', 'Giảm 15% cuối tuần');

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

-- Thêm đơn hàng online mẫu
INSERT INTO DonHangOnline (MaKH, TenKhach, SDTKhach, EmailKhach, DiaChiGiaoHang, LoaiDonHang, NgayGiaoMong, TongTien, PhiGiaoHang, TongThanhToan, TrangThai, MaNVXuLy, GhiChu) VALUES
(1, 'Phạm Văn Khách', '0999888777', 'khach1@email.com', '123 Đường ABC, Quận 1, TP.HCM', 'Giao hàng', '2024-01-20 14:00:00', 95000, 15000, 110000, 'Đã xác nhận', 3, 'Giao hàng nhanh'),
(2, 'Hoàng Thị Lan', '0888777666', 'khach2@email.com', '456 Đường XYZ, Quận 3, TP.HCM', 'Giao hàng', '2024-01-21 10:30:00', 120000, 20000, 140000, 'Đang chuẩn bị', 4, 'Không cay'),
(NULL, 'Nguyễn Văn Tân', '0777555333', 'tan@email.com', '789 Đường DEF, Quận 7, TP.HCM', 'Giao hàng', '2024-01-22 16:00:00', 85000, 25000, 110000, 'Chờ xác nhận', NULL, 'Gọi trước khi giao'),
(3, 'Nguyễn Minh Tuấn', '0777666555', 'khach3@email.com', 'Quán cà phê ABC', 'Mang đi', '2024-01-23 09:00:00', 65000, 0, 65000, 'Hoàn thành', 5, 'Đến lấy lúc 9h'),
(NULL, 'Trần Thị Mai', '0666444222', 'mai@email.com', '321 Đường GHI, Quận 5, TP.HCM', 'Giao hàng', '2024-01-24 18:30:00', 150000, 30000, 180000, 'Đang giao', 3, 'Tầng 5, căn hộ 502');

-- Thêm chi tiết đơn hàng online
INSERT INTO CTDonHangOnline (MaDHOnline, MaMon, SoLuong, DonGia, ThanhTien, GhiChu) VALUES
-- Đơn hàng 1
(1, 2, 2, 30000, 60000, 'Ít đường'),
(1, 9, 1, 25000, 25000, NULL),
(1, 13, 1, 35000, 35000, 'Không hành'),
-- Đơn hàng 2  
(2, 3, 1, 45000, 45000, 'Nóng'),
(2, 11, 1, 40000, 40000, 'Thêm bơ'),
(2, 17, 1, 55000, 55000, 'Ít cay'),
-- Đơn hàng 3
(3, 1, 2, 25000, 50000, NULL),
(3, 6, 1, 35000, 35000, 'Ít đá'),
-- Đơn hàng 4
(4, 4, 1, 35000, 35000, NULL),
(4, 8, 1, 25000, 25000, NULL),
-- Đơn hàng 5
(5, 15, 2, 50000, 100000, NULL),
(5, 12, 1, 55000, 55000, 'Thêm kem');

-- Thêm giỏ hàng mẫu (khách hàng đang chọn món)
INSERT INTO GioHang (MaKH, MaMon, SoLuong, GhiChu) VALUES
(1, 5, 1, 'Thêm sữa'),
(1, 14, 2, NULL),
(2, 7, 1, 'Ít đá'),
(3, 10, 1, NULL),
(4, 16, 1, 'Thêm chocolate');

-- Thêm theo dõi đơn hàng
INSERT INTO TheoDoiDonHang (MaDHOnline, TrangThai, MoTa, MaNVCapNhat) VALUES
-- Đơn hàng 1
(1, 'Chờ xác nhận', 'Đơn hàng mới được tạo', NULL),
(1, 'Đã xác nhận', 'Đơn hàng đã được xác nhận, đang chuẩn bị', 3),
-- Đơn hàng 2
(2, 'Chờ xác nhận', 'Đơn hàng mới được tạo', NULL),
(2, 'Đã xác nhận', 'Đơn hàng đã được xác nhận', 4),
(2, 'Đang chuẩn bị', 'Đang pha chế các món', 4),
-- Đơn hàng 3
(3, 'Chờ xác nhận', 'Đơn hàng mới được tạo', NULL),
-- Đơn hàng 4
(4, 'Chờ xác nhận', 'Đơn hàng mới được tạo', NULL),
(4, 'Đã xác nhận', 'Đơn hàng đã được xác nhận', 5),
(4, 'Đang chuẩn bị', 'Đang pha chế các món', 5),
(4, 'Hoàn thành', 'Khách hàng đã đến lấy hàng', 5),
-- Đơn hàng 5
(5, 'Chờ xác nhận', 'Đơn hàng mới được tạo', NULL),
(5, 'Đã xác nhận', 'Đơn hàng đã được xác nhận', 3),
(5, 'Đang chuẩn bị', 'Đang pha chế các món', 3),
(5, 'Đang giao', 'Shipper đang trên đường giao hàng', 3);
