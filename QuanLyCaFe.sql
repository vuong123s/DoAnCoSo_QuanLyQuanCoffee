-- Set root password thành 123456
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';

-- Refresh privileges
FLUSH PRIVILEGES;

-- Tạo database
CREATE DATABASE IF NOT EXISTS QuanLyCafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyCafe;

-- Cài đặt để cho phép tạo function
SET GLOBAL log_bin_trust_function_creators = 1;

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
    TenLoai VARCHAR(100) NOT NULL,
    HinhAnh VARCHAR(255),        -- Hình ảnh đại diện cho loại món
    MoTa TEXT                    -- Mô tả chi tiết về loại món
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
-- BẢNG ĐƠN HÀNG
-- ======================
CREATE TABLE DonHang (
    MaDH INT AUTO_INCREMENT PRIMARY KEY,
    MaDat INT,                                       -- Liên kết với đơn đặt bàn
    MaKH INT,                                        -- Mã khách hàng (để cộng điểm)
    MaBan INT,
    MaNV INT,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(12,2),
    TrangThai VARCHAR(20) DEFAULT 'Chờ thanh toán',  -- Chờ thanh toán, Hoàn thành, Đã hủy
    DiemSuDung INT DEFAULT 0,                        -- Số điểm tích lũy đã sử dụng để giảm giá (1 điểm = 1,000 VNĐ)
    -- FOREIGN KEY (MaDat) REFERENCES DatBan(MaDat), -- Sẽ thêm sau khi tạo bảng DatBan
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
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
    GhiChu VARCHAR(255),         -- Ghi chú đặc biệt cho món (VD: ít đá, thêm đường)
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

-- Thêm foreign key constraint cho bảng DonHang sau khi tạo bảng DatBan
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_DatBan FOREIGN KEY (MaDat) REFERENCES DatBan(MaDat);

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
    DiaChiGiaoHang TEXT NOT NULL,
    LoaiDonHang VARCHAR(20) DEFAULT 'Giao hàng',  -- Giao hàng, Mang đi
    NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    NgayGiaoMong DATETIME,       -- Thời gian mong muốn nhận hàng
    TongTien DECIMAL(12,2) DEFAULT 0,
    PhiGiaoHang DECIMAL(12,2) DEFAULT 0,
    DiemSuDung INT DEFAULT 0,    -- Số điểm tích lũy đã sử dụng để giảm giá (1 điểm = 1,000 VNĐ)
    TongThanhToan DECIMAL(12,2) DEFAULT 0, -- Tổng tiền sau khi trừ điểm: TongTien - (DiemSuDung * 1000) + PhiGiaoHang
    TrangThai VARCHAR(30) DEFAULT 'Chờ xác nhận',  -- Chờ xác nhận, Đã xác nhận, Đang chuẩn bị, Đang giao, Hoàn thành, Đã hủy
    MaNVXuLy INT,                -- Nhân viên xử lý đơn
    GhiChu TEXT,                 -- Ghi chú của khách hàng
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
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
-- BẢNG THANH TOÁN
-- ======================
CREATE TABLE ThanhToan (
    MaTT INT AUTO_INCREMENT PRIMARY KEY,
    MaDH INT,
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
INSERT INTO LoaiMon (TenLoai, HinhAnh, MoTa) VALUES
('Cà phê', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 'Các loại cà phê truyền thống và hiện đại, từ espresso đến cà phê sữa đá'),
('Trà', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', 'Trà xanh, trà đen, trà thảo mộc và các loại trà đặc biệt'),
('Nước ép', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', 'Nước ép tươi từ các loại trái cây tự nhiên, giàu vitamin'),
('Bánh ngọt', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Bánh kem, bánh tart, cookies và các loại bánh ngọt thơm ngon'),
('Bánh mặn', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'Sandwich, bánh mì, pizza mini và các món bánh mặn hấp dẫn'),
('Đồ uống đá xay', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', 'Smoothie, frappuccino và các loại đồ uống đá xay mát lạnh'),
('Món nóng', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', 'Súp, mì, cháo và các món ăn nóng bổ dưỡng'),
('Salad', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad tươi ngon với rau củ quả và các loại dressing đặc biệt');

-- Thêm món ăn/uống
INSERT INTO Mon (TenMon, DonGia, HinhAnh, MoTa, MaLoai, TrangThai) VALUES
('Cà phê đen', 25000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 'Cà phê đen truyền thống Việt Nam', 1, 'Còn bán'),
('Cà phê sữa', 30000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'Cà phê sữa đá thơm ngon', 1, 'Còn bán'),
('Cappuccino', 45000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'Cà phê Cappuccino Ý nguyên chất', 1, 'Còn bán'),
('Americano', 35000, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', 'Cà phê Americano đậm đà', 1, 'Còn bán'),
('Latte', 40000, 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400', 'Cà phê Latte với bọt sữa mịn', 1, 'Còn bán'),
('Trà đào', 35000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 'Trà đào cam sả thơm mát', 2, 'Còn bán'),
('Trà sữa trân châu', 40000, 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400', 'Trà sữa trân châu đen ngọt ngào', 2, 'Còn bán'),
('Trà xanh', 25000, 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400', 'Trà xanh thanh mát', 2, 'Còn bán'),
('Nước cam', 25000, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 'Nước cam tươi nguyên chất', 3, 'Còn bán'),
('Sinh tố bơ', 35000, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', 'Sinh tố bơ béo ngậy', 3, 'Còn bán'),
('Bánh croissant', 40000, 'https://images.unsplash.com/photo-1555507036-ab794f4afe5a?w=400', 'Bánh croissant bơ thơm giòn', 4, 'Còn bán'),
('Bánh tiramisu', 55000, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 'Bánh tiramisu Ý chính hiệu', 4, 'Còn bán'),
('Bánh mì thịt nướng', 35000, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'Bánh mì thịt nướng đặc biệt', 5, 'Còn bán'),
('Sandwich gà', 45000, 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400', 'Sandwich gà phô mai', 5, 'Còn bán'),
('Frappuccino', 50000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'Đồ uống đá xay cà phê', 6, 'Còn bán'),
('Chocolate đá xay', 45000, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'Chocolate đá xay thơm ngon', 6, 'Còn bán'),
('Mì Ý sốt kem', 65000, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', 'Mì Ý sốt kem nấm', 7, 'Còn bán'),
('Cơm chiên hải sản', 70000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', 'Cơm chiên hải sản đặc biệt', 7, 'Còn bán'),
('Salad Caesar', 55000, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 'Salad Caesar với gà nướng', 8, 'Còn bán'),
('Salad trái cây', 45000, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Salad trái cây tươi mát', 8, 'Còn bán');

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
('Phạm Văn Khách', 'Nam', '1985-03-15', '0999888777', 'khach1@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Nguyễn Huệ, Q1, TP.HCM', 18),  -- 12 điểm (125k) + 6 điểm (65k) = 18 điểm
('Hoàng Thị Lan', 'Nữ', '1990-07-22', '0888777666', 'khach2@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456 Lê Lợi, Q3, TP.HCM', 8),    -- 8 điểm (85k)
('Nguyễn Minh Tuấn', 'Nam', '1988-12-08', '0777666555', 'khach3@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '789 Trần Hưng Đạo, Q5, TP.HCM', 0),    -- Chưa có đơn hàng hoàn thành
('Lê Thị Hoa', 'Nữ', '1992-04-18', '0666555444', 'khach4@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '321 Võ Văn Tần, Q3, TP.HCM', 0),    -- Chưa có đơn hàng hoàn thành
('Trần Văn Đức', 'Nam', '1987-09-25', '0555444333', 'khach5@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '654 Pasteur, Q1, TP.HCM', 0);       -- Chưa có đơn hàng hoàn thành

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

-- Thêm đơn hàng mẫu (liên kết với đơn đặt bàn và khách hàng)
INSERT INTO DonHang (MaDat, MaKH, MaBan, MaNV, NgayLap, TongTien, TrangThai) VALUES
(1, 1, 2, 3, '2024-01-15 19:30:00', 125000, 'Hoàn thành'),  -- Đơn hàng từ đặt bàn 1, khách hàng 1 (đã cộng 12 điểm)
(2, 2, 5, 4, '2024-01-16 18:45:00', 85000, 'Hoàn thành'),   -- Đơn hàng từ đặt bàn 2, khách hàng 2 (đã cộng 8 điểm)
(3, NULL, 3, 3, '2024-01-17 20:15:00', 200000, 'Hoàn thành'),  -- Đơn hàng từ đặt bàn 3, khách vãng lai
(NULL, 1, 1, 5, '2024-01-18 10:30:00', 65000, 'Hoàn thành'), -- Đơn hàng walk-in, khách hàng 1 (đã cộng 6 điểm)
(NULL, NULL, 4, 4, '2024-01-18 14:20:00', 150000, 'Đang xử lý'); -- Đơn hàng walk-in, khách vãng lai (chưa hoàn thành)

-- Thêm chi tiết đơn hàng
INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien, GhiChu) VALUES
(1, 1, 2, 25000, 50000, 'Ít đường'),
(1, 11, 1, 40000, 40000, 'Nóng'),
(1, 9, 1, 25000, 25000, NULL),
(2, 3, 1, 45000, 45000, 'Thêm sữa'),
(2, 12, 1, 55000, 55000, 'Không cay'),
(3, 5, 2, 40000, 80000, 'Ít đá'),
(3, 7, 2, 40000, 80000, 'Thêm trân châu'),
(3, 13, 1, 35000, 35000, 'Không hành'),
(4, 2, 1, 30000, 30000, 'Đậm đà'),
(4, 6, 1, 35000, 35000, 'Ít đá'),
(5, 15, 2, 50000, 100000, NULL),
(5, 14, 1, 45000, 45000, 'Thêm kem');


-- Thêm thanh toán mẫu
INSERT INTO ThanhToan (MaDH, HinhThuc, SoTien, NgayTT) VALUES
(1, 'Tiền mặt', 125000, '2024-01-15 10:45:00'),
(2, 'Thẻ', 85000, '2024-01-15 14:30:00'),
(3, 'Ví điện tử', 200000, '2024-01-16 10:00:00'),
(5, 'Tiền mặt', 150000, '2024-01-17 11:25:00');

-- Thêm đơn hàng online mẫu
INSERT INTO DonHangOnline (MaKH, TenKhach, SDTKhach, DiaChiGiaoHang, LoaiDonHang, NgayGiaoMong, TongTien, PhiGiaoHang, DiemSuDung, TongThanhToan, TrangThai, MaNVXuLy, GhiChu) VALUES
-- Đơn 1: Khách hàng dùng 10 điểm (giảm 10,000đ)
(1, 'Phạm Văn Khách', '0999888777', '123 Đường ABC, Quận 1, TP.HCM', 'Giao hàng', '2024-01-20 14:00:00', 120000, 15000, 10, 125000, 'Đã xác nhận', 3, 'Giao hàng nhanh'),
-- Đơn 2: Không dùng điểm
(2, 'Hoàng Thị Lan', '0888777666', '456 Đường XYZ, Quận 3, TP.HCM', 'Giao hàng', '2024-01-21 10:30:00', 140000, 20000, 0, 160000, 'Đang chuẩn bị', 4, 'Không cay'),
-- Đơn 3: Khách vãng lai, dùng 5 điểm (giảm 5,000đ)
(NULL, 'Nguyễn Văn Tân', '0777555333', '789 Đường DEF, Quận 7, TP.HCM', 'Giao hàng', '2024-01-22 16:00:00', 110000, 25000, 5, 130000, 'Chờ xác nhận', NULL, 'Gọi trước khi giao'),
-- Đơn 4: Mang đi, dùng 20 điểm (giảm 20,000đ)
(3, 'Nguyễn Minh Tuấn', '0777666555', 'Quán cà phê ABC', 'Mang đi', '2024-01-23 09:00:00', 85000, 0, 20, 65000, 'Hoàn thành', 5, 'Đến lấy lúc 9h'),
-- Đơn 5: Khách vãng lai, không dùng điểm
(NULL, 'Trần Thị Mai', '0666444222', '321 Đường GHI, Quận 5, TP.HCM', 'Giao hàng', '2024-01-24 18:30:00', 150000, 30000, 0, 180000, 'Đang giao', 3, 'Tầng 5, căn hộ 502');

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

-- ==============================================
-- STORED PROCEDURES TỰ ĐỘNG HỦY ĐẶT BÀN
-- ==============================================

DELIMITER //

-- ==============================================
-- 1. FUNCTION: Tự động hủy đơn đặt bàn quá hạn
-- ==============================================
CREATE FUNCTION TuDongHuyDonDatBanQuaHan()
RETURNS INT
DETERMINISTIC
READS SQL DATA
MODIFIES SQL DATA
BEGIN
    DECLARE v_SoDonHuy INT DEFAULT 0;
    DECLARE v_NgayHienTai DATE DEFAULT CURDATE();
    DECLARE v_GioHienTai TIME DEFAULT CURTIME();
    DECLARE v_ThoiGianHienTai DATETIME DEFAULT NOW();
    
    -- Lấy thời gian hiện tại
    SET v_NgayHienTai = CURDATE();
    SET v_GioHienTai = CURTIME();
    SET v_ThoiGianHienTai = NOW();
    
    -- Cập nhật trạng thái các đơn đặt bàn quá hạn
    -- Điều kiện: Ngày đặt < ngày hiện tại HOẶC (ngày đặt = ngày hiện tại VÀ giờ đặt + 30 phút < giờ hiện tại)
    UPDATE DatBan 
    SET TrangThai = 'Đã hủy',
        GhiChu = CONCAT(IFNULL(GhiChu, ''), ' [Tự động hủy do quá hạn - ', v_ThoiGianHienTai, ']')
    WHERE TrangThai IN ('Đã đặt', 'Đã xác nhận')
      AND (
          -- Trường hợp 1: Ngày đặt đã qua
          NgayDat < v_NgayHienTai
          OR
          -- Trường hợp 2: Ngày đặt là hôm nay nhưng đã quá giờ đặt + 30 phút
          (NgayDat = v_NgayHienTai AND ADDTIME(GioDat, '00:30:00') < v_GioHienTai)
      );
    
    -- Lấy số lượng đơn đã hủy
    SET v_SoDonHuy = ROW_COUNT();
    
    -- Cập nhật trạng thái bàn về "Trống" cho các bàn có đơn đặt bị hủy
    UPDATE Ban b
    SET TrangThai = 'Trống'
    WHERE TrangThai = 'Đã đặt'
      AND NOT EXISTS (
          SELECT 1 FROM DatBan db 
          WHERE db.MaBan = b.MaBan 
            AND db.TrangThai IN ('Đã đặt', 'Đã xác nhận')
            AND (
                db.NgayDat > v_NgayHienTai
                OR (db.NgayDat = v_NgayHienTai AND db.GioDat > v_GioHienTai)
            )
      );
    
    -- Log kết quả
    INSERT INTO LogHeThong (ThoiGian, HanhDong, MoTa, SoLuong) 
    VALUES (v_ThoiGianHienTai, 'AUTO_CANCEL_RESERVATIONS', 
            CONCAT('Tự động hủy đơn đặt bàn quá hạn'), v_SoDonHuy)
    ON DUPLICATE KEY UPDATE 
        ThoiGian = VALUES(ThoiGian),
        SoLuong = VALUES(SoLuong);
    
    -- Trả về số đơn đã hủy
    RETURN v_SoDonHuy;
        
END //

-- ==============================================
-- 2. FUNCTION: Kiểm tra và cảnh báo đơn sắp hết hạn
-- ==============================================
CREATE FUNCTION KiemTraDonSapHetHan(
    p_SoPhutCanhBao INT
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_NgayHienTai DATE;
    DECLARE v_GioHienTai TIME;
    DECLARE v_GioiHanCanhBao TIME;
    DECLARE v_SoPhutCanhBao INT DEFAULT 15;
    DECLARE v_SoDonSapHetHan INT DEFAULT 0;
    
    -- Xử lý giá trị mặc định
    IF p_SoPhutCanhBao IS NULL OR p_SoPhutCanhBao <= 0 THEN
        SET v_SoPhutCanhBao = 15;
    ELSE
        SET v_SoPhutCanhBao = p_SoPhutCanhBao;
    END IF;
    
    -- Lấy thời gian hiện tại
    SET v_NgayHienTai = CURDATE();
    SET v_GioHienTai = CURTIME();
    SET v_GioiHanCanhBao = ADDTIME(v_GioHienTai, CONCAT('00:', v_SoPhutCanhBao, ':00'));
    
    -- Đếm số đơn đặt bàn sắp hết hạn
    SELECT COUNT(*)
    INTO v_SoDonSapHetHan
    FROM DatBan db
    JOIN Ban b ON db.MaBan = b.MaBan
    WHERE db.TrangThai IN ('Đã đặt', 'Đã xác nhận')
      AND db.NgayDat = v_NgayHienTai
      AND db.GioDat BETWEEN v_GioHienTai AND v_GioiHanCanhBao;
    
    RETURN v_SoDonSapHetHan;
    
END //

-- ==============================================
-- 3. FUNCTION: Lấy báo cáo đơn đặt bàn bị hủy
-- ==============================================
CREATE FUNCTION BaoCaoDonDatBanBiHuy(
    p_NgayBatDau DATE,
    p_NgayKetThuc DATE
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TongSoDonHuy INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO v_TongSoDonHuy
    FROM DatBan
    WHERE TrangThai = 'Đã hủy'
      AND DATE(NgayTaoDat) BETWEEN p_NgayBatDau AND p_NgayKetThuc;
    
    RETURN v_TongSoDonHuy;
END //

-- ==============================================
-- 4. FUNCTION: Tính thời gian còn lại đến giờ đặt bàn
-- ==============================================
CREATE FUNCTION TinhThoiGianConLai(
    p_NgayDat DATE,
    p_GioDat TIME
)
RETURNS VARCHAR(50)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_ThoiGianDat DATETIME;
    DECLARE v_ThoiGianHienTai DATETIME;
    DECLARE v_ChenhLech INT DEFAULT 0;
    DECLARE v_Gio INT DEFAULT 0;
    DECLARE v_Phut INT DEFAULT 0;
    DECLARE v_KetQua VARCHAR(50) DEFAULT '';
    
    SET v_ThoiGianDat = CONCAT(p_NgayDat, ' ', p_GioDat);
    SET v_ThoiGianHienTai = NOW();
    
    -- Tính chênh lệch theo phút
    SET v_ChenhLech = TIMESTAMPDIFF(MINUTE, v_ThoiGianHienTai, v_ThoiGianDat);
    
    IF v_ChenhLech < 0 THEN
        SET v_KetQua = 'Đã quá hạn';
    ELSEIF v_ChenhLech = 0 THEN
        SET v_KetQua = 'Đúng giờ';
    ELSE
        SET v_Gio = FLOOR(v_ChenhLech / 60);
        SET v_Phut = v_ChenhLech % 60;
        
        IF v_Gio > 0 THEN
            SET v_KetQua = CONCAT(v_Gio, ' giờ ', v_Phut, ' phút');
        ELSE
            SET v_KetQua = CONCAT(v_Phut, ' phút');
        END IF;
    END IF;
    
    RETURN v_KetQua;
END //

-- ==============================================
-- 5. EVENT: Tự động chạy hủy đơn đặt bàn mỗi 30 phút
-- ==============================================
CREATE EVENT IF NOT EXISTS AutoCancelExpiredReservations
ON SCHEDULE EVERY 30 MINUTE
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    SELECT TuDongHuyDonDatBanQuaHan();
END //

DELIMITER ;

-- ==============================================
-- BẢNG LOG HỆ THỐNG (nếu chưa có)
-- ==============================================
CREATE TABLE IF NOT EXISTS LogHeThong (
    MaLog INT AUTO_INCREMENT PRIMARY KEY,
    ThoiGian DATETIME NOT NULL,
    HanhDong VARCHAR(100) NOT NULL,
    MoTa TEXT,
    SoLuong INT DEFAULT 0,
    INDEX idx_action_time (HanhDong, ThoiGian)
);

-- ==============================================
-- EXAMPLES SỬ DỤNG
-- ==============================================

-- Ví dụ 1: Chạy thủ công hủy đơn quá hạn
-- SELECT TuDongHuyDonDatBanQuaHan() as SoDonDaHuy;

-- Ví dụ 2: Kiểm tra đơn sắp hết hạn trong 15 phút
-- SELECT KiemTraDonSapHetHan(15) as SoDonSapHetHan;

-- Ví dụ 3: Báo cáo đơn bị hủy trong tháng
-- SELECT BaoCaoDonDatBanBiHuy('2024-01-01', '2024-01-31') as TongSoDonHuy;

-- Ví dụ 4: Tính thời gian còn lại
-- SELECT TinhThoiGianConLai('2024-01-15', '19:00:00') as ThoiGianConLai;

-- ==============================================
-- STORED PROCEDURES PHÂN TÍCH DOANH THU
-- ==============================================

DELIMITER //

-- ==============================================
-- 1. PROCEDURE: Tính tổng doanh thu từ đơn hàng đã thanh toán
-- ==============================================
CREATE PROCEDURE TinhTongDoanhThu()
BEGIN
    SELECT 
        COALESCE(SUM(dh.TongTien), 0) as TongDoanhThu,
        COUNT(DISTINCT dh.MaDH) as TongDonHang,
        COUNT(DISTINCT dh.MaNV) as SoNhanVienPhucVu,
        COALESCE(AVG(dh.TongTien), 0) as DoanhThuTrungBinh
    FROM DonHang dh
    INNER JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    WHERE dh.TrangThai = 'Hoàn thành' 
      AND tt.TrangThai = 'Thành công';
END //

-- ==============================================
-- 2. PROCEDURE: Doanh thu theo khoảng thời gian
-- ==============================================
CREATE PROCEDURE DoanhThuTheoKhoangThoiGian(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        DATE(dh.NgayLap) as Ngay,
        COALESCE(SUM(dh.TongTien), 0) as DoanhThu,
        COUNT(DISTINCT dh.MaDH) as SoDonHang,
        COALESCE(AVG(dh.TongTien), 0) as DoanhThuTrungBinh,
        COUNT(DISTINCT dh.MaBan) as SoBanPhucVu
    FROM DonHang dh
    INNER JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    WHERE dh.TrangThai = 'Hoàn thành'
      AND tt.TrangThai = 'Thành công'
      AND DATE(dh.NgayLap) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    GROUP BY DATE(dh.NgayLap)
    ORDER BY DATE(dh.NgayLap) ASC;
END //

-- ==============================================
-- 3. PROCEDURE: Doanh thu theo món
-- ==============================================
CREATE PROCEDURE DoanhThuTheoMon(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        m.MaMon,
        m.TenMon,
        m.DonGia as GiaHienTai,
        lm.TenLoai as LoaiMon,
        COALESCE(SUM(ct.SoLuong), 0) as TongSoLuongBan,
        COALESCE(SUM(ct.ThanhTien), 0) as TongDoanhThu,
        COALESCE(AVG(ct.DonGia), 0) as GiaBanTrungBinh,
        COUNT(DISTINCT ct.MaDH) as SoDonHang
    FROM Mon m
    LEFT JOIN CTDonHang ct ON m.MaMon = ct.MaMon
    LEFT JOIN DonHang dh ON ct.MaDH = dh.MaDH
    LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    LEFT JOIN LoaiMon lm ON m.MaLoai = lm.MaLoai
    WHERE (p_NgayBatDau IS NULL OR DATE(dh.NgayLap) >= p_NgayBatDau)
      AND (p_NgayKetThuc IS NULL OR DATE(dh.NgayLap) <= p_NgayKetThuc)
      AND (dh.TrangThai = 'Hoàn thành' OR dh.TrangThai IS NULL)
      AND (tt.TrangThai = 'Thành công' OR tt.TrangThai IS NULL)
    GROUP BY m.MaMon, m.TenMon, m.DonGia, lm.TenLoai
    ORDER BY TongDoanhThu DESC;
END //

-- ==============================================
-- 4. PROCEDURE: Xếp hạng món bán chạy
-- ==============================================
CREATE PROCEDURE XepHangMonBanChay(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE,
    IN p_SoLuong INT
)
BEGIN
    DECLARE v_SoLuong INT DEFAULT 10;
    
    IF p_SoLuong IS NOT NULL AND p_SoLuong > 0 THEN
        SET v_SoLuong = p_SoLuong;
    END IF;
    
    SELECT 
        m.MaMon,
        m.TenMon,
        m.HinhAnh,
        lm.TenLoai as LoaiMon,
        COALESCE(SUM(ct.SoLuong), 0) as TongSoLuongBan,
        COALESCE(SUM(ct.ThanhTien), 0) as TongDoanhThu,
        COUNT(DISTINCT ct.MaDH) as SoDonHang,
        COALESCE(AVG(ct.DonGia), 0) as GiaBanTrungBinh
    FROM Mon m
    INNER JOIN CTDonHang ct ON m.MaMon = ct.MaMon
    INNER JOIN DonHang dh ON ct.MaDH = dh.MaDH
    LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    LEFT JOIN LoaiMon lm ON m.MaLoai = lm.MaLoai
    WHERE dh.TrangThai = 'Hoàn thành'
      AND (tt.TrangThai = 'Thành công' OR tt.TrangThai IS NULL)
      AND (p_NgayBatDau IS NULL OR DATE(dh.NgayLap) >= p_NgayBatDau)
      AND (p_NgayKetThuc IS NULL OR DATE(dh.NgayLap) <= p_NgayKetThuc)
    GROUP BY m.MaMon, m.TenMon, m.HinhAnh, lm.TenLoai
    ORDER BY TongSoLuongBan DESC
    LIMIT v_SoLuong;
END //
-- ==============================================
-- 5. PROCEDURE: Doanh thu theo danh mục
-- ==============================================
CREATE PROCEDURE DoanhThuTheoDanhMuc(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        lm.MaLoai,
        lm.TenLoai,
        lm.HinhAnh,
        COALESCE(SUM(ct.SoLuong), 0) as TongSoLuongBan,
        COALESCE(SUM(ct.ThanhTien), 0) as TongDoanhThu,
        COUNT(DISTINCT m.MaMon) as SoMonKhacNhau,
        COUNT(DISTINCT ct.MaDH) as SoDonHang,
        COALESCE(AVG(ct.ThanhTien), 0) as DoanhThuTrungBinhMoiMon
    FROM LoaiMon lm
    LEFT JOIN Mon m ON lm.MaLoai = m.MaLoai
    LEFT JOIN CTDonHang ct ON m.MaMon = ct.MaMon
    LEFT JOIN DonHang dh ON ct.MaDH = dh.MaDH
    LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    WHERE (p_NgayBatDau IS NULL OR DATE(dh.NgayLap) >= p_NgayBatDau)
      AND (p_NgayKetThuc IS NULL OR DATE(dh.NgayLap) <= p_NgayKetThuc)
      AND (dh.TrangThai = 'Hoàn thành' OR dh.TrangThai IS NULL)
      AND (tt.TrangThai = 'Thành công' OR tt.TrangThai IS NULL)
    GROUP BY lm.MaLoai, lm.TenLoai, lm.HinhAnh
    ORDER BY TongDoanhThu DESC;
END //

-- ==============================================
-- 6. PROCEDURE: Thống kê doanh thu theo giờ trong ngày
-- ==============================================
CREATE PROCEDURE DoanhThuTheoGio(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        HOUR(dh.NgayLap) as Gio,
        COALESCE(SUM(dh.TongTien), 0) as DoanhThu,
        COUNT(DISTINCT dh.MaDH) as SoDonHang,
        COALESCE(AVG(dh.TongTien), 0) as DoanhThuTrungBinh
    FROM DonHang dh
    INNER JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    WHERE dh.TrangThai = 'Hoàn thành'
      AND tt.TrangThai = 'Thành công'
      AND DATE(dh.NgayLap) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    GROUP BY HOUR(dh.NgayLap)
    ORDER BY Gio ASC;
END //

-- ==============================================
-- 7. PROCEDURE: Thống kê doanh thu theo nhân viên
-- ==============================================
CREATE PROCEDURE DoanhThuTheoNhanVien(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        nv.MaNV,
        nv.HoTen,
        nv.ChucVu,
        COALESCE(SUM(dh.TongTien), 0) as TongDoanhThu,
        COUNT(DISTINCT dh.MaDH) as SoDonHang,
        COALESCE(AVG(dh.TongTien), 0) as DoanhThuTrungBinh
    FROM NhanVien nv
    LEFT JOIN DonHang dh ON nv.MaNV = dh.MaNV
    LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
    WHERE (p_NgayBatDau IS NULL OR DATE(dh.NgayLap) >= p_NgayBatDau)
      AND (p_NgayKetThuc IS NULL OR DATE(dh.NgayLap) <= p_NgayKetThuc)
      AND (dh.TrangThai = 'Hoàn thành' OR dh.TrangThai IS NULL)
      AND (tt.TrangThai = 'Thành công' OR tt.TrangThai IS NULL)
    GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
    ORDER BY TongDoanhThu DESC;
END //

-- ==============================================
-- 8. PROCEDURE: Thống kê doanh thu theo hình thức thanh toán
-- ==============================================
CREATE PROCEDURE DoanhThuTheoHinhThucThanhToan(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        tt.HinhThuc,
        COALESCE(SUM(tt.SoTien), 0) as TongDoanhThu,
        COUNT(DISTINCT tt.MaTT) as SoGiaoDich,
        COALESCE(AVG(tt.SoTien), 0) as GiaTriTrungBinh,
        ROUND(SUM(tt.SoTien) * 100.0 / (SELECT SUM(SoTien) FROM ThanhToan WHERE TrangThai = 'Thành công'), 2) as TyLePhanTram
    FROM ThanhToan tt
    INNER JOIN DonHang dh ON tt.MaDH = dh.MaDH
    WHERE tt.TrangThai = 'Thành công'
      AND dh.TrangThai = 'Hoàn thành'
      AND DATE(tt.NgayTT) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    GROUP BY tt.HinhThuc
    ORDER BY TongDoanhThu DESC;
END //

DELIMITER ;

-- ==============================================
-- EXAMPLES SỬ DỤNG STORED PROCEDURES
-- ==============================================

-- Ví dụ 1: Tính tổng doanh thu
-- CALL TinhTongDoanhThu();

-- Ví dụ 2: Doanh thu theo khoảng thời gian (7 ngày qua)
-- CALL DoanhThuTheoKhoangThoiGian(DATE_SUB(CURDATE(), INTERVAL 7 DAY), CURDATE());

-- Ví dụ 3: Doanh thu theo món (tháng này)
-- CALL DoanhThuTheoMon(DATE_FORMAT(CURDATE(), '%Y-%m-01'), CURDATE());

-- Ví dụ 4: Top 10 món bán chạy (tháng này)
-- CALL XepHangMonBanChay(DATE_FORMAT(CURDATE(), '%Y-%m-01'), CURDATE(), 10);

-- Ví dụ 5: Doanh thu theo danh mục (tuần này)
-- CALL DoanhThuTheoDanhMuc(DATE_SUB(CURDATE(), INTERVAL 7 DAY), CURDATE());

-- Ví dụ 6: Doanh thu theo giờ (hôm nay)
-- CALL DoanhThuTheoGio(CURDATE(), CURDATE());

-- Ví dụ 7: Doanh thu theo nhân viên (tháng này)
-- CALL DoanhThuTheoNhanVien(DATE_FORMAT(CURDATE(), '%Y-%m-01'), CURDATE());

-- Ví dụ 8: Doanh thu theo hình thức thanh toán (tháng này)
-- CALL DoanhThuTheoHinhThucThanhToan(DATE_FORMAT(CURDATE(), '%Y-%m-01'), CURDATE());

-- Ví dụ 5: Xem log hệ thống
-- SELECT * FROM LogHeThong WHERE HanhDong = 'AUTO_CANCEL_RESERVATIONS' ORDER BY ThoiGian DESC LIMIT 10;

-- ==============================================
-- 6. FUNCTION: Tự động reset bàn về trạng thái trống lúc 10h tối
-- ==============================================
CREATE FUNCTION TuDongResetBanLucCuoiNgay()
RETURNS INT
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE v_SoBanReset INT DEFAULT 0;
    DECLARE v_ThoiGianHienTai DATETIME;
    
    -- Lấy thời gian hiện tại
    SET v_ThoiGianHienTai = NOW();
    
    -- Reset tất cả bàn "Đang sử dụng" về "Trống"
    UPDATE Ban 
    SET TrangThai = 'Trống'
    WHERE TrangThai = 'Đang sử dụng';
    
    -- Lấy số lượng bàn đã reset
    SET v_SoBanReset = ROW_COUNT();
    
    -- Log kết quả
    INSERT INTO LogHeThong (ThoiGian, HanhDong, MoTa, SoLuong) 
    VALUES (v_ThoiGianHienTai, 'AUTO_RESET_TABLES', 
            CONCAT('Tự động reset bàn về trạng thái trống lúc cuối ngày - Reset ', v_SoBanReset, ' bàn'), v_SoBanReset);
    
    -- Trả về số bàn đã reset
    RETURN v_SoBanReset;
        
END //

-- ==============================================
-- 7. FUNCTION: Reset bàn có điều kiện (chỉ reset bàn không có đặt bàn active)
-- ==============================================
CREATE FUNCTION TuDongResetBanThongMinh()
RETURNS INT
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE v_SoBanReset INT DEFAULT 0;
    DECLARE v_ThoiGianHienTai DATETIME;
    DECLARE v_NgayHienTai DATE;
    
    -- Lấy thời gian hiện tại
    SET v_ThoiGianHienTai = NOW();
    SET v_NgayHienTai = CURDATE();
    
    -- Reset bàn "Đang sử dụng" về "Trống" chỉ khi không có đặt bàn active
    UPDATE Ban b
    SET TrangThai = 'Trống'
    WHERE TrangThai = 'Đang sử dụng'
      AND NOT EXISTS (
          SELECT 1 FROM DatBan db 
          WHERE db.MaBan = b.MaBan 
            AND db.TrangThai IN ('Đã đặt', 'Đã xác nhận')
            AND (
                -- Có đặt bàn cho ngày mai hoặc sau đó
                db.NgayDat > v_NgayHienTai
                OR 
                -- Có đặt bàn hôm nay nhưng chưa đến giờ (sau 22h)
                (db.NgayDat = v_NgayHienTai AND db.GioDat > '22:00:00')
            )
      );
    
    -- Lấy số lượng bàn đã reset
    SET v_SoBanReset = ROW_COUNT();
    
    -- Log kết quả
    INSERT INTO LogHeThong (ThoiGian, HanhDong, MoTa, SoLuong) 
    VALUES (v_ThoiGianHienTai, 'AUTO_RESET_TABLES_SMART', 
            CONCAT('Tự động reset bàn thông minh lúc cuối ngày'), v_SoBanReset)
    ON DUPLICATE KEY UPDATE 
        ThoiGian = VALUES(ThoiGian),
        SoLuong = VALUES(SoLuong);
    
    -- Trả về số bàn đã reset
    RETURN v_SoBanReset;
        
END //

-- ==============================================
-- 8. FUNCTION: Kiểm tra bàn có thể reset không
-- ==============================================
CREATE FUNCTION KiemTraBanCoTheReset(p_MaBan INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TrangThaiBan VARCHAR(20) DEFAULT '';
    DECLARE v_CoDatBanActive INT DEFAULT 0;
    DECLARE v_NgayHienTai DATE;
    
    SET v_NgayHienTai = CURDATE();
    
    -- Lấy trạng thái bàn hiện tại
    SELECT TrangThai INTO v_TrangThaiBan 
    FROM Ban 
    WHERE MaBan = p_MaBan;
    
    -- Nếu bàn không ở trạng thái "Đang sử dụng" thì không cần reset
    IF v_TrangThaiBan != 'Đang sử dụng' THEN
        RETURN FALSE;
    END IF;
    
    -- Kiểm tra có đặt bàn active không
    SELECT COUNT(*) INTO v_CoDatBanActive
    FROM DatBan
    WHERE MaBan = p_MaBan
      AND TrangThai IN ('Đã đặt', 'Đã xác nhận')
      AND (
          -- Có đặt bàn cho ngày mai hoặc sau đó
          NgayDat > v_NgayHienTai
          OR 
          -- Có đặt bàn hôm nay nhưng chưa đến giờ (sau 22h)
          (NgayDat = v_NgayHienTai AND GioDat > '22:00:00')
      );
    
    -- Nếu có đặt bàn active thì không reset
    IF v_CoDatBanActive > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END //

-- ==============================================
-- 9. EVENT: Tự động reset bàn lúc 10h tối mỗi ngày
-- ==============================================
CREATE EVENT IF NOT EXISTS AutoResetTablesAt10PM
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 22 HOUR)
DO
BEGIN
    SELECT TuDongResetBanThongMinh();
END //

-- ==============================================
-- 10. FUNCTION: Lấy báo cáo reset bàn theo ngày
-- ==============================================
CREATE FUNCTION BaoCaoResetBanTheoNgay(
    p_NgayBatDau DATE,
    p_NgayKetThuc DATE
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TongSoBanReset INT DEFAULT 0;
    
    SELECT SUM(SoLuong)
    INTO v_TongSoBanReset
    FROM LogHeThong
    WHERE HanhDong IN ('AUTO_RESET_TABLES', 'AUTO_RESET_TABLES_SMART')
      AND DATE(ThoiGian) BETWEEN p_NgayBatDau AND p_NgayKetThuc;
    
    RETURN IFNULL(v_TongSoBanReset, 0);
END //

DELIMITER ;

-- ==============================================
-- EXAMPLES SỬ DỤNG CÁC PROCEDURES RESET BÀN
-- ==============================================

-- Ví dụ 1: Chạy thủ công reset tất cả bàn
-- SELECT TuDongResetBanLucCuoiNgay() as SoBanDaReset;

-- Ví dụ 2: Chạy thủ công reset bàn thông minh
-- SELECT TuDongResetBanThongMinh() as SoBanDaReset;

-- Ví dụ 3: Kiểm tra bàn có thể reset không
-- SELECT KiemTraBanCoTheReset(1) as CoTheReset;

-- Ví dụ 4: Báo cáo reset bàn trong tháng
-- SELECT BaoCaoResetBanTheoNgay('2024-01-01', '2024-01-31') as TongSoBanReset;

-- Ví dụ 5: Xem log reset bàn
-- SELECT * FROM LogHeThong WHERE HanhDong LIKE '%RESET_TABLES%' ORDER BY ThoiGian DESC LIMIT 10;

-- ==============================================
-- STORED PROCEDURES KIỂM TRA KHI TẠO ĐƠN ĐẶT BÀN
-- ==============================================

DELIMITER //

-- ==============================================
-- 11. FUNCTION: Kiểm tra thông tin khách hàng hợp lệ
-- ==============================================
CREATE FUNCTION KiemTraThongTinKhachHang(
    p_TenKhach VARCHAR(100),
    p_SoDienThoai VARCHAR(15),
    p_EmailKhach VARCHAR(100)
)
RETURNS VARCHAR(500)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_KetQua VARCHAR(500) DEFAULT '';
    
    -- Kiểm tra tên khách hàng
    IF p_TenKhach IS NULL OR TRIM(p_TenKhach) = '' THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Tên khách hàng không được để trống. ');
    ELSEIF CHAR_LENGTH(TRIM(p_TenKhach)) < 2 THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Tên khách hàng phải có ít nhất 2 ký tự. ');
    ELSEIF CHAR_LENGTH(TRIM(p_TenKhach)) > 100 THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Tên khách hàng không được quá 100 ký tự. ');
    END IF;
    
    -- Kiểm tra số điện thoại
    IF p_SoDienThoai IS NULL OR TRIM(p_SoDienThoai) = '' THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Số điện thoại không được để trống. ');
    ELSEIF NOT (p_SoDienThoai REGEXP '^[0-9+()-\\s]+$') THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Số điện thoại chỉ được chứa số, dấu +, -, (), khoảng trắng. ');
    ELSEIF CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(p_SoDienThoai, '+', ''), '-', ''), '(', ''), ')', '')) < 10 THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Số điện thoại phải có ít nhất 10 chữ số. ');
    END IF;
    
    -- Kiểm tra email (nếu có)
    IF p_EmailKhach IS NOT NULL AND TRIM(p_EmailKhach) != '' THEN
        IF NOT (p_EmailKhach REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$') THEN
            SET v_KetQua = CONCAT(v_KetQua, 'Định dạng email không hợp lệ. ');
        END IF;
    END IF;
    
    -- Trả về kết quả
    IF v_KetQua = '' THEN
        RETURN 'OK';
    ELSE
        RETURN TRIM(v_KetQua);
    END IF;
END //

-- ==============================================
-- 12. FUNCTION: Kiểm tra thời gian đặt bàn hợp lệ
-- ==============================================
DELIMITER //
CREATE FUNCTION KiemTraThoiGianDatBan(
    p_NgayDat DATE,
    p_GioDat TIME,
    p_GioKetThuc TIME
)
RETURNS VARCHAR(500)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_KetQua VARCHAR(500) DEFAULT '';
    DECLARE v_NgayHienTai DATE;
    DECLARE v_GioHienTai TIME;
    DECLARE v_GioMoCua TIME DEFAULT '06:00:00';
    DECLARE v_GioDongCua TIME DEFAULT '22:00:00';
    DECLARE v_ThoiGianToiThieu INT DEFAULT 60; /* 60 phút */
    DECLARE v_ThoiGianToiDa INT DEFAULT 240; /* 4 giờ */
    DECLARE v_ChenhLechPhut INT DEFAULT 0;
    
    SET v_NgayHienTai = CURDATE();
    SET v_GioHienTai = CURTIME();
    
    -- Kiểm tra ngày đặt
    IF p_NgayDat IS NULL THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Ngày đặt bàn không được để trống. ');
    ELSEIF p_NgayDat < v_NgayHienTai THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Không thể đặt bàn cho ngày đã qua. ');
    ELSEIF p_NgayDat > DATE_ADD(v_NgayHienTai, INTERVAL 30 DAY) THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Chỉ có thể đặt bàn trước tối đa 30 ngày. ');
    END IF;
    
    -- Kiểm tra giờ đặt
    IF p_GioDat IS NULL THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Giờ đặt bàn không được để trống. ');
    ELSEIF p_GioDat < v_GioMoCua OR p_GioDat > v_GioDongCua THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Giờ đặt bàn phải trong khoảng 06:00 - 22:00. ');
    END IF;
    
    -- Kiểm tra giờ kết thúc
    IF p_GioKetThuc IS NULL THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Giờ kết thúc không được để trống. ');
    ELSEIF p_GioKetThuc <= p_GioDat THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Giờ kết thúc phải sau giờ bắt đầu. ');
    ELSEIF p_GioKetThuc > v_GioDongCua THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Giờ kết thúc không được quá 22:00. ');
    END IF;
    
    -- Kiểm tra thời gian đặt bàn hợp lý
    IF p_GioDat IS NOT NULL AND p_GioKetThuc IS NOT NULL THEN
        SET v_ChenhLechPhut = TIMESTAMPDIFF(MINUTE, p_GioDat, p_GioKetThuc);
        
        IF v_ChenhLechPhut < v_ThoiGianToiThieu THEN
            SET v_KetQua = CONCAT(v_KetQua, 'Thời gian đặt bàn tối thiểu là ', v_ThoiGianToiThieu, ' phút. ');
        ELSEIF v_ChenhLechPhut > v_ThoiGianToiDa THEN
            SET v_KetQua = CONCAT(v_KetQua, 'Thời gian đặt bàn tối đa là ', v_ThoiGianToiDa, ' phút. ');
        END IF;
    END IF;
    
    -- Kiểm tra đặt bàn trong ngày hiện tại
    IF p_NgayDat = v_NgayHienTai AND p_GioDat IS NOT NULL THEN
        IF p_GioDat <= ADDTIME(v_GioHienTai, '01:00:00') THEN
            SET v_KetQua = CONCAT(v_KetQua, 'Phải đặt bàn trước ít nhất 1 giờ. ');
        END IF;
    END IF;
    
    -- Trả về kết quả
    IF v_KetQua = '' THEN
        RETURN 'OK';
    ELSE
        RETURN TRIM(v_KetQua);
    END IF;
END //
DELIMITER ;

-- ==============================================
-- 13. FUNCTION: Kiểm tra số lượng khách hợp lệ
-- ==============================================
DELIMITER //
CREATE FUNCTION KiemTraSoLuongKhach(
    p_SoNguoi INT,
    p_MaBan INT
)
RETURNS VARCHAR(500)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_KetQua VARCHAR(500) DEFAULT '';
    DECLARE v_SoChoToiThieu INT DEFAULT 1;
    DECLARE v_SoChoToiDa INT DEFAULT 20;
    DECLARE v_SoChoBan INT DEFAULT 0;
    DECLARE v_TenBan VARCHAR(50) DEFAULT '';
    
    -- Kiểm tra số người cơ bản
    IF p_SoNguoi IS NULL THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Số lượng khách không được để trống. ');
    ELSEIF p_SoNguoi < v_SoChoToiThieu THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Số lượng khách tối thiểu là ', v_SoChoToiThieu, ' người. ');
    ELSEIF p_SoNguoi > v_SoChoToiDa THEN
        SET v_KetQua = CONCAT(v_KetQua, 'Số lượng khách tối đa là ', v_SoChoToiDa, ' người. Vui lòng liên hệ trực tiếp để đặt bàn nhóm lớn. ');
    END IF;
    
    -- Kiểm tra sức chứa bàn (nếu có chỉ định bàn)
    IF p_MaBan IS NOT NULL AND p_SoNguoi IS NOT NULL THEN
        SELECT SoCho, TenBan INTO v_SoChoBan, v_TenBan
        FROM Ban 
        WHERE MaBan = p_MaBan;
        
        IF v_SoChoBan IS NULL THEN
            SET v_KetQua = CONCAT(v_KetQua, 'Bàn không tồn tại. ');
        ELSEIF p_SoNguoi > v_SoChoBan THEN
            SET v_KetQua = CONCAT(v_KetQua, 'Số khách (', p_SoNguoi, ') vượt quá sức chứa bàn ', v_TenBan, ' (', v_SoChoBan, ' chỗ). ');
        END IF;
    END IF;
    
    -- Trả về kết quả
    IF v_KetQua = '' THEN
        RETURN 'OK';
    ELSE
        RETURN TRIM(v_KetQua);
    END IF;
END //
DELIMITER ;

-- ==============================================
-- 14. FUNCTION: Kiểm tra trùng lặp đặt bàn
-- ==============================================
DELIMITER //
CREATE FUNCTION KiemTraTrungLapDatBan(
    p_SoDienThoai VARCHAR(15),
    p_NgayDat DATE,
    p_GioDat TIME,
    p_GioKetThuc TIME
)
RETURNS VARCHAR(500)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_KetQua VARCHAR(500) DEFAULT '';
    DECLARE v_SoDonTrung INT DEFAULT 0;
    DECLARE v_ThongTinTrung TEXT DEFAULT '';
    
    -- Kiểm tra trùng lặp theo số điện thoại trong cùng khoảng thời gian
    SELECT COUNT(*), GROUP_CONCAT(CONCAT(TenKhach, ' - Bàn ', (SELECT TenBan FROM Ban WHERE Ban.MaBan = DatBan.MaBan), ' (', GioDat, '-', IFNULL(GioKetThuc, ADDTIME(GioDat, '02:00:00')), ')') SEPARATOR '; ')
    INTO v_SoDonTrung, v_ThongTinTrung
    FROM DatBan
    WHERE SoDienThoai = p_SoDienThoai
      AND NgayDat = p_NgayDat
      AND TrangThai IN ('Đã đặt', 'Đã xác nhận')
      AND (
          -- Kiểm tra xung đột thời gian
          (p_GioDat >= GioDat AND p_GioDat < IFNULL(GioKetThuc, ADDTIME(GioDat, '02:00:00')))
          OR (p_GioKetThuc > GioDat AND p_GioKetThuc <= IFNULL(GioKetThuc, ADDTIME(GioDat, '02:00:00')))
          OR (p_GioDat <= GioDat AND p_GioKetThuc >= IFNULL(GioKetThuc, ADDTIME(GioDat, '02:00:00')))
      );
    
    -- Nếu có trùng lặp
    IF v_SoDonTrung > 0 THEN
        SET v_KetQua = CONCAT('Số điện thoại này đã có đặt bàn trong cùng khoảng thời gian: ', v_ThongTinTrung);
    END IF;
    
    -- Trả về kết quả
    IF v_KetQua = '' THEN
        RETURN 'OK';
    ELSE
        RETURN v_KetQua;
    END IF;
END //
DELIMITER ;

-- ==============================================
-- 15. FUNCTION: Kiểm tra toàn diện khi tạo đặt bàn
-- ==============================================
DELIMITER //
CREATE FUNCTION KiemTraToanDienDatBan(
    p_MaKH INT,
    p_MaBan INT,
    p_NgayDat DATE,
    p_GioDat TIME,
    p_GioKetThuc TIME,
    p_SoNguoi INT,
    p_TenKhach VARCHAR(100),
    p_SoDienThoai VARCHAR(15),
    p_EmailKhach VARCHAR(100)
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_LoiThongTin VARCHAR(500) DEFAULT '';
    DECLARE v_LoiThoiGian VARCHAR(500) DEFAULT '';
    DECLARE v_LoiSoNguoi VARCHAR(500) DEFAULT '';
    DECLARE v_LoiTrungLap VARCHAR(500) DEFAULT '';
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        RETURN FALSE;
    END;
    
    -- Kiểm tra các tham số bắt buộc
    IF p_TenKhach IS NULL OR TRIM(p_TenKhach) = '' THEN
        RETURN FALSE;
    END IF;
    
    IF p_SoDienThoai IS NULL OR TRIM(p_SoDienThoai) = '' THEN
        RETURN FALSE;
    END IF;
    
    IF p_NgayDat IS NULL OR p_GioDat IS NULL OR p_GioKetThuc IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF p_SoNguoi IS NULL OR p_SoNguoi <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- 1. Kiểm tra thông tin khách hàng
    SET v_LoiThongTin = KiemTraThongTinKhachHang(p_TenKhach, p_SoDienThoai, p_EmailKhach);
    IF v_LoiThongTin != 'OK' THEN
        RETURN FALSE;
    END IF;
    
    -- 2. Kiểm tra thời gian đặt bàn
    SET v_LoiThoiGian = KiemTraThoiGianDatBan(p_NgayDat, p_GioDat, p_GioKetThuc);
    IF v_LoiThoiGian != 'OK' THEN
        RETURN FALSE;
    END IF;
    
    -- 3. Kiểm tra số lượng khách
    SET v_LoiSoNguoi = KiemTraSoLuongKhach(p_SoNguoi, p_MaBan);
    IF v_LoiSoNguoi != 'OK' THEN
        RETURN FALSE;
    END IF;
    
    -- 4. Kiểm tra trùng lặp đặt bàn
    SET v_LoiTrungLap = KiemTraTrungLapDatBan(p_SoDienThoai, p_NgayDat, p_GioDat, p_GioKetThuc);
    IF v_LoiTrungLap != 'OK' THEN
        RETURN FALSE;
    END IF;
    
    -- Tất cả kiểm tra đều hợp lệ
    RETURN TRUE;
END //
DELIMITER ;

-- ==============================================
-- 16. FUNCTION: Tạo đặt bàn với kiểm tra đầy đủ (nâng cấp)
-- ==============================================
DELIMITER //
CREATE FUNCTION TaoDatBanVoiKiemTraDayDu(
    p_MaKH INT,
    p_MaBan INT,
    p_NgayDat DATE,
    p_GioDat TIME,
    p_GioKetThuc TIME,
    p_SoNguoi INT,
    p_TenKhach VARCHAR(100),
    p_SoDienThoai VARCHAR(15),
    p_EmailKhach VARCHAR(100),
    p_GhiChu TEXT,
    p_MaNVXuLy INT
)
RETURNS INT
DETERMINISTIC
MODIFIES SQL DATA
BEGIN
    DECLARE v_KiemTra BOOLEAN DEFAULT FALSE;
    DECLARE v_ThoiGianTao DATETIME;
    DECLARE v_MaDatMoi INT DEFAULT 0;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        RETURN 0;
    END;
    
    -- Lấy thời gian hiện tại
    SET v_ThoiGianTao = NOW();
    
    -- Kiểm tra toàn diện
    SET v_KiemTra = KiemTraToanDienDatBan(
        p_MaKH, p_MaBan, p_NgayDat, p_GioDat, p_GioKetThuc, p_SoNguoi,
        p_TenKhach, p_SoDienThoai, p_EmailKhach
    );
    
    -- Nếu không pass kiểm tra
    IF v_KiemTra = FALSE THEN
        RETURN 0;
    END IF;
    
    -- Tạo đặt bàn mới
    INSERT INTO DatBan (
        MaKH, MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi,
        TrangThai, TenKhach, SoDienThoai, EmailKhach, GhiChu, MaNVXuLy,
        NgayTaoDat
    ) VALUES (
        p_MaKH, p_MaBan, p_NgayDat, p_GioDat, p_GioKetThuc, p_SoNguoi,
        'Đã đặt', p_TenKhach, p_SoDienThoai, p_EmailKhach, p_GhiChu, p_MaNVXuLy,
        v_ThoiGianTao
    );
    
    -- Lấy ID đặt bàn mới tạo
    SET v_MaDatMoi = LAST_INSERT_ID();
    
    -- Cập nhật trạng thái bàn (nếu có chỉ định bàn)
    IF p_MaBan IS NOT NULL THEN
        UPDATE Ban SET TrangThai = 'Đã đặt' WHERE MaBan = p_MaBan;
    END IF;
    
    -- Log thành công (với error handling)
    INSERT IGNORE INTO LogHeThong (ThoiGian, HanhDong, MoTa, SoLuong) 
    VALUES (v_ThoiGianTao, 'CREATE_RESERVATION_SUCCESS', 
            CONCAT('Tạo đặt bàn thành công - Khách: ', IFNULL(p_TenKhach, ''), ', SĐT: ', IFNULL(p_SoDienThoai, '')), 1);
    
    RETURN v_MaDatMoi;
    
END //
DELIMITER ;

-- ==============================================
-- 17. FUNCTION: Tính điểm uy tín khách hàng
-- ==============================================
DELIMITER //
CREATE FUNCTION TinhDiemUyTinKhachHang(p_SoDienThoai VARCHAR(15))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_DiemUyTin INT DEFAULT 100; /* Điểm khởi điểm */
    DECLARE v_SoDonHoanThanh INT DEFAULT 0;
    DECLARE v_SoDonHuy INT DEFAULT 0;
    DECLARE v_SoDonNoShow INT DEFAULT 0;
    DECLARE v_TongSoDon INT DEFAULT 0;
    
    -- Đếm các loại đơn đặt bàn
    SELECT 
        COUNT(CASE WHEN TrangThai = 'Hoàn thành' THEN 1 END),
        COUNT(CASE WHEN TrangThai = 'Đã hủy' THEN 1 END),
        COUNT(CASE WHEN TrangThai = 'No-show' THEN 1 END),
        COUNT(*)
    INTO v_SoDonHoanThanh, v_SoDonHuy, v_SoDonNoShow, v_TongSoDon
    FROM DatBan
    WHERE SoDienThoai = p_SoDienThoai
      AND NgayTaoDat >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH); /* 6 tháng gần nhất */
    -- Tính điểm uy tín
    IF v_TongSoDon = 0 THEN
        RETURN v_DiemUyTin; /* Khách hàng mới */
    END IF;
    
    -- Cộng điểm cho đơn hoàn thành
    SET v_DiemUyTin = v_DiemUyTin + (v_SoDonHoanThanh * 5);
    
    -- Trừ điểm cho đơn hủy
    SET v_DiemUyTin = v_DiemUyTin - (v_SoDonHuy * 10);
    
    -- Trừ điểm nặng cho no-show
    SET v_DiemUyTin = v_DiemUyTin - (v_SoDonNoShow * 20);
    
    -- Đảm bảo điểm không âm và không quá 200
    IF v_DiemUyTin < 0 THEN
        SET v_DiemUyTin = 0;
    ELSEIF v_DiemUyTin > 200 THEN
        SET v_DiemUyTin = 200;
    END IF;
    
    RETURN v_DiemUyTin;
END //

DELIMITER ;

-- ==============================================
-- EXAMPLES SỬ DỤNG CÁC PROCEDURES KIỂM TRA
-- ==============================================

-- Ví dụ 1: Kiểm tra thông tin khách hàng
-- SELECT KiemTraThongTinKhachHang('Nguyễn Văn A', '0123456789', 'test@email.com') as KetQua;

-- Ví dụ 2: Kiểm tra thời gian đặt bàn (6h-22h)
-- SELECT KiemTraThoiGianDatBan('2024-01-15', '19:00:00', '21:00:00') as KetQua;

-- Ví dụ 3: Kiểm tra số lượng khách
-- SELECT KiemTraSoLuongKhach(4, 1) as KetQua;

-- Ví dụ 4: Kiểm tra trùng lặp
-- SELECT KiemTraTrungLapDatBan('0123456789', '2024-01-15', '19:00:00', '21:00:00') as KetQua;

-- Ví dụ 5: Kiểm tra toàn diện
-- SELECT KiemTraToanDienDatBan(1, 1, '2024-01-15', '19:00:00', '21:00:00', 4, 'Nguyễn Văn A', '0123456789', 'test@email.com') as KetQua;

-- Ví dụ 6: Tạo đặt bàn với kiểm tra đầy đủ
-- SELECT TaoDatBanVoiKiemTraDayDu(1, 1, '2024-01-15', '19:00:00', '21:00:00', 4, 'Nguyễn Văn A', '0123456789', 'test@email.com', 'Ghi chú', 1) as MaDatMoi;

-- Ví dụ 7: Tính điểm uy tín khách hàng
-- SELECT TinhDiemUyTinKhachHang('0123456789') as DiemUyTin;

-- Bật Event Scheduler (cần chạy với quyền admin)
-- SET GLOBAL event_scheduler = ON;

DELIMITER ;

-- ==============================================
-- STORED PROCEDURES CHO ĐƠN ĐẶT BÀN VÀ ĐƠN HÀNG
-- ==============================================

-- ==============================================
-- 1. PROCEDURE: Lấy đơn hàng từ đơn đặt bàn
-- ==============================================
DELIMITER //
CREATE PROCEDURE LayDonHangTuDatBan(
    IN p_MaDat INT
)
BEGIN
    SELECT 
        dh.MaDH,
        dh.MaDat,
        dh.MaBan,
        b.TenBan,
        dh.MaNV,
        nv.HoTen as TenNhanVien,
        dh.NgayLap,
        dh.TongTien,
        dh.TrangThai as TrangThaiDonHang,
        -- Thông tin đặt bàn
        db.TenKhach,
        db.SoDienThoai,
        db.EmailKhach,
        db.NgayDat,
        db.GioDat,
        db.GioKetThuc,
        db.SoNguoi,
        db.TrangThai as TrangThaiDatBan,
        db.GhiChu as GhiChuDatBan
    FROM DonHang dh
    LEFT JOIN DatBan db ON dh.MaDat = db.MaDat
    LEFT JOIN Ban b ON dh.MaBan = b.MaBan
    LEFT JOIN NhanVien nv ON dh.MaNV = nv.MaNV
    WHERE dh.MaDat = p_MaDat
    ORDER BY dh.NgayLap DESC;
END //

-- ==============================================
-- 2. PROCEDURE: Lấy chi tiết đơn hàng từ đơn đặt bàn  
-- ==============================================
CREATE PROCEDURE LayChiTietDonHangTuDatBan(
    IN p_MaDat INT
)
BEGIN
    SELECT 
        ct.MaDH,
        ct.MaMon,
        m.TenMon,
        m.HinhAnh,
        ct.SoLuong,
        ct.DonGia,
        ct.ThanhTien,
        ct.GhiChu,
        -- Thông tin đơn hàng
        dh.NgayLap,
        dh.TrangThai as TrangThaiDonHang
    FROM CTDonHang ct
    INNER JOIN DonHang dh ON ct.MaDH = dh.MaDH
    INNER JOIN Mon m ON ct.MaMon = m.MaMon
    WHERE dh.MaDat = p_MaDat
    ORDER BY dh.NgayLap DESC, m.TenMon;
END //

-- ==============================================
-- 3. PROCEDURE: Tạo đơn hàng từ đơn đặt bàn
-- ==============================================
CREATE PROCEDURE TaoDonHangTuDatBan(
    IN p_MaDat INT,
    IN p_MaNV INT,
    OUT p_MaDH INT,
    OUT p_ThongBao VARCHAR(255)
)
BEGIN
    DECLARE v_MaBan INT;
    DECLARE v_TrangThaiDatBan VARCHAR(20);
    DECLARE v_SoDonHangHienTai INT DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_MaDH = 0;
        SET p_ThongBao = 'Lỗi khi tạo đơn hàng từ đơn đặt bàn';
    END;
    
    START TRANSACTION;
    
    -- Kiểm tra đơn đặt bàn có tồn tại không
    SELECT MaBan, TrangThai 
    INTO v_MaBan, v_TrangThaiDatBan
    FROM DatBan 
    WHERE MaDat = p_MaDat;
    
    IF v_MaBan IS NULL THEN
        SET p_MaDH = 0;
        SET p_ThongBao = 'Không tìm thấy đơn đặt bàn';
        ROLLBACK;
    ELSEIF v_TrangThaiDatBan NOT IN ('Đã xác nhận', 'Đã đặt') THEN
        SET p_MaDH = 0;
        SET p_ThongBao = CONCAT('Đơn đặt bàn có trạng thái: ', v_TrangThaiDatBan, '. Không thể tạo đơn hàng');
        ROLLBACK;
    ELSE
        -- Kiểm tra đã có đơn hàng cho đơn đặt bàn này chưa
        SELECT COUNT(*) INTO v_SoDonHangHienTai
        FROM DonHang 
        WHERE MaDat = p_MaDat AND TrangThai != 'Đã hủy';
        
        IF v_SoDonHangHienTai > 0 THEN
            SET p_MaDH = 0;
            SET p_ThongBao = 'Đơn đặt bàn này đã có đơn hàng';
            ROLLBACK;
        ELSE
            -- Tạo đơn hàng mới
            INSERT INTO DonHang (MaDat, MaBan, MaNV, NgayLap, TongTien, TrangThai)
            VALUES (p_MaDat, v_MaBan, p_MaNV, NOW(), 0, 'Chờ thanh toán');
            
            SET p_MaDH = LAST_INSERT_ID();
            
            -- Cập nhật trạng thái đặt bàn
            UPDATE DatBan 
            SET TrangThai = 'Đang phục vụ'
            WHERE MaDat = p_MaDat;
            
            -- Cập nhật trạng thái bàn
            UPDATE Ban 
            SET TrangThai = 'Đang phục vụ'
            WHERE MaBan = v_MaBan;
            
            SET p_ThongBao = 'Tạo đơn hàng thành công';
            COMMIT;
        END IF;
    END IF;
END //

-- ==============================================
-- 4. VIEW: Thông tin tổng hợp đơn đặt bàn và đơn hàng
-- ==============================================
CREATE VIEW VW_DatBan_DonHang AS
SELECT 
    db.MaDat,
    db.MaKH,
    db.MaBan,
    b.TenBan,
    kv.TenKhuVuc,
    db.NgayDat,
    db.GioDat,
    db.GioKetThuc,
    db.SoNguoi,
    db.TrangThai as TrangThaiDatBan,
    db.TenKhach,
    db.SoDienThoai,
    db.EmailKhach,
    db.GhiChu as GhiChuDatBan,
    db.NgayTaoDat,
    -- Thông tin đơn hàng (nếu có)
    dh.MaDH,
    dh.NgayLap,
    dh.TongTien,
    dh.TrangThai as TrangThaiDonHang,
    nv.HoTen as TenNhanVien,
    -- Thông tin thanh toán (nếu có)
    tt.MaTT,
    tt.HinhThuc as HinhThucThanhToan,
    tt.SoTien as SoTienThanhToan,
    tt.NgayTT,
    CASE 
        WHEN dh.MaDH IS NULL THEN 'Chưa có đơn hàng'
        WHEN tt.MaTT IS NULL THEN 'Chưa thanh toán'
        ELSE 'Đã thanh toán'
    END as TrangThaiTongHop
FROM DatBan db
LEFT JOIN Ban b ON db.MaBan = b.MaBan
LEFT JOIN KhuVuc kv ON b.MaKhuVuc = kv.MaKhuVuc
LEFT JOIN DonHang dh ON db.MaDat = dh.MaDat
LEFT JOIN NhanVien nv ON dh.MaNV = nv.MaNV
LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH;

DELIMITER ;

-- ==============================================
-- CÁC PROCEDURE HỖ TRỢ FRONTEND
-- ==============================================

-- Ví dụ sử dụng:
-- 1. Lấy đơn hàng từ đơn đặt bàn
-- CALL LayDonHangTuDatBan(1);

-- 2. Lấy chi tiết đơn hàng từ đơn đặt bàn  
-- CALL LayChiTietDonHangTuDatBan(1);

-- 3. Tạo đơn hàng từ đơn đặt bàn
-- CALL TaoDonHangTuDatBan(1, 3, @maDH, @thongBao);
-- SELECT @maDH as MaDonHang, @thongBao as ThongBao;

-- 4. Xem tổng hợp đơn đặt bàn và đơn hàng
-- SELECT * FROM VW_DatBan_DonHang WHERE MaDat = 1;

-- ==============================================
-- HỆ THỐNG QUẢN LÝ LỊCH LÀM VIỆC NHÂN VIÊN (TỐI ƯU)
-- ==============================================

-- ======================
-- BẢNG LỊCH LÀM VIỆC (Đơn giản hóa)
-- ======================
CREATE TABLE LichLamViec (
    MaLich INT AUTO_INCREMENT PRIMARY KEY,
    MaNV INT NOT NULL,                       -- Nhân viên
    NgayLam DATE NOT NULL,                   -- Ngày làm việc
    CaLam VARCHAR(20) NOT NULL,              -- Ca sáng, Ca chiều, Ca tối
    TrangThai VARCHAR(30) DEFAULT 'Đã xếp lịch', -- Đã xếp lịch, Hoàn thành, Vắng mặt
    GhiChu TEXT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    UNIQUE KEY unique_schedule (MaNV, NgayLam, CaLam) -- Tránh trùng lịch
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ======================
-- BẢNG NGHỈ PHÉP & TĂNG CA (Gộp 2 bảng thành 1)
-- ======================
CREATE TABLE YeuCauNhanVien (
    MaYeuCau INT AUTO_INCREMENT PRIMARY KEY,
    MaNV INT NOT NULL,                       -- Nhân viên
    LoaiYeuCau VARCHAR(30) NOT NULL,         -- Nghỉ phép, Nghỉ ốm, Tăng ca
    NgayBatDau DATE NOT NULL,                -- Ngày bắt đầu
    NgayKetThuc DATE,                        -- Ngày kết thúc (NULL nếu tăng ca 1 ngày)
    GioBatDau TIME,                          -- Giờ bắt đầu (cho tăng ca)
    GioKetThuc TIME,                         -- Giờ kết thúc (cho tăng ca)
    LyDo TEXT NOT NULL,                      -- Lý do
    TrangThai VARCHAR(30) DEFAULT 'Chờ duyệt', -- Chờ duyệt, Đã duyệt, Từ chối
    NguoiDuyet INT,                          -- Quản lý duyệt
    NgayDuyet DATETIME,
    GhiChuDuyet TEXT,
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (NguoiDuyet) REFERENCES NhanVien(MaNV)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==============================================
-- DỮ LIỆU MẪU
-- ==============================================
-- Lịch làm việc mẫu (tháng hiện tại)
INSERT INTO LichLamViec (MaNV, NgayLam, CaLam, TrangThai, GhiChu) VALUES
-- Tuần 1 - Nguyễn Văn Admin (MaNV=1)
(1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Ca sáng', 'Hoàn thành', 'Đúng giờ'),
(1, DATE_SUB(CURDATE(), INTERVAL 19 DAY), 'Ca chiều', 'Hoàn thành', 'Làm thêm giờ'),
(1, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(1, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'Ca chiều', 'Hoàn thành', NULL),

-- Tuần 2
(1, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'Ca sáng', 'Hoàn thành', 'Đến muộn 10 phút'),
(1, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(1, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'Ca sáng', 'Vắng mặt', 'Nghỉ phép'),
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Ca chiều', 'Hoàn thành', NULL),

-- Tuần 3
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Ca chiều', 'Hoàn thành', 'Đang làm việc'),

-- Tuần hiện tại
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(1, CURDATE(), 'Ca chiều', 'Đã xếp lịch', NULL),
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Ca sáng', 'Đã xếp lịch', NULL),
(1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Ca chiều', 'Đã xếp lịch', NULL),

-- Trần Thị Manager (MaNV=2)
(2, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 19 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 17 DAY), 'Ca sáng', 'Hoàn thành', NULL),

(2, DATE_SUB(CURDATE(), INTERVAL 13 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Ca sáng', 'Hoàn thành', NULL),

(2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Ca sáng', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Ca sáng', 'Hoàn thành', NULL),

(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Ca chiều', 'Hoàn thành', NULL),
(2, CURDATE(), 'Ca sáng', 'Đã xếp lịch', NULL),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Ca chiều', 'Đã xếp lịch', NULL),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Ca sáng', 'Đã xếp lịch', NULL);

-- Yêu cầu nghỉ phép / tăng ca mẫu
INSERT INTO YeuCauNhanVien (MaNV, LoaiYeuCau, NgayBatDau, NgayKetThuc, GioBatDau, GioKetThuc, LyDo, TrangThai, NguoiDuyet, GhiChuDuyet) VALUES
-- Yêu cầu đã duyệt
(1, 'Nghỉ phép', DATE_SUB(CURDATE(), INTERVAL 11 DAY), DATE_SUB(CURDATE(), INTERVAL 11 DAY), NULL, NULL, 'Nghỉ phép có việc gia đình', 'Đã duyệt', 2, 'Đồng ý cho nghỉ'),
(2, 'Tăng ca', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), '22:00:00', '24:00:00', 'Tăng ca hoàn thành dự án', 'Đã duyệt', 1, 'Đồng ý tăng ca'),

-- Yêu cầu chờ duyệt
(1, 'Nghỉ phép', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), NULL, NULL, 'Nghỉ phép du lịch', 'Chờ duyệt', NULL, NULL),
(2, 'Tăng ca', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), '22:00:00', '01:00:00', 'Tăng ca chuẩn bị sự kiện', 'Chờ duyệt', NULL, NULL),

-- Yêu cầu từ chối
(1, 'Nghỉ phép', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), NULL, NULL, 'Nghỉ phép không lý do', 'Từ chối', 2, 'Không đủ lý do chính đáng');

-- ==============================================
-- STORED PROCEDURES (ĐƠN GIẢN HÓA)
-- ==============================================
DELIMITER //

-- Duyệt yêu cầu (nghỉ phép/tăng ca)
CREATE PROCEDURE DuyetYeuCau(
    IN p_MaYeuCau INT,
    IN p_NguoiDuyet INT,
    IN p_TrangThai VARCHAR(30),
    IN p_GhiChu TEXT
)
BEGIN
    UPDATE YeuCauNhanVien
    SET TrangThai = p_TrangThai,
        NguoiDuyet = p_NguoiDuyet,
        NgayDuyet = NOW(),
        GhiChuDuyet = p_GhiChu
    WHERE MaYeuCau = p_MaYeuCau;
END //

DELIMITER ;

-- ==============================================
-- VIEW - BÁO CÁO
-- ==============================================

-- Báo cáo lịch làm việc tháng
CREATE VIEW VW_BaoCaoThang AS
SELECT 
    nv.MaNV,
    nv.HoTen,
    nv.ChucVu,
    MONTH(l.NgayLam) as Thang,
    YEAR(l.NgayLam) as Nam,
    COUNT(*) as SoCa,
    COUNT(CASE WHEN l.TrangThai = 'Hoàn thành' THEN 1 END) as SoCaHoanThanh,
    COUNT(CASE WHEN l.TrangThai = 'Vắng mặt' THEN 1 END) as SoCaVang
FROM NhanVien nv
LEFT JOIN LichLamViec l ON nv.MaNV = l.MaNV
GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu, MONTH(l.NgayLam), YEAR(l.NgayLam);

-- ==============================================
-- HƯỚNG DẪN SỬ DỤNG
-- ==============================================

-- 1. Tạo lịch làm việc:
-- INSERT INTO LichLamViec (MaNV, NgayLam, CaLam, TrangThai, GhiChu) 
-- VALUES (1, '2025-11-05', 'Ca sáng', 'Đã xếp lịch', NULL);

-- 2. Xin nghỉ phép:
-- INSERT INTO YeuCauNhanVien (MaNV, LoaiYeuCau, NgayBatDau, NgayKetThuc, LyDo)
-- VALUES (1, 'Nghỉ phép', '2025-11-10', '2025-11-12', 'Nghỉ việc riêng');

-- 3. Duyệt yêu cầu:
-- CALL DuyetYeuCau(1, 2, 'Đã duyệt', 'Đồng ý');

-- 4. Xem báo cáo tháng:
-- SELECT * FROM VW_BaoCaoThang WHERE MaNV = 1 AND Thang = 11 AND Nam = 2025;

-- 5. Cập nhật trạng thái lịch làm việc:
-- UPDATE LichLamViec SET TrangThai = 'Hoàn thành' WHERE MaLich = 1;
