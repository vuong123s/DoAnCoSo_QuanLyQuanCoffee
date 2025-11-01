-- ==============================================
-- SEED DỮ LIỆU MẪU CHO HÔM NAY (DASHBOARD)
-- ==============================================
-- Chạy script này để tạo dữ liệu mẫu cho ngày hôm nay

USE QuanLyCafe;

-- Tạo đơn hàng mẫu cho hôm nay
SET @MaNV_Sample := (SELECT MaNV FROM NhanVien ORDER BY MaNV LIMIT 1);
SET @MaBan_Sample1 := (SELECT MaBan FROM Ban ORDER BY MaBan LIMIT 1);
SET @MaBan_Sample2 := (SELECT MaBan FROM Ban ORDER BY MaBan LIMIT 1 OFFSET 1);
SET @MaBan_Sample3 := (SELECT MaBan FROM Ban ORDER BY MaBan LIMIT 1 OFFSET 2);

-- Đơn 1: Hôm nay 09:30
INSERT INTO DonHang (MaDat, MaBan, MaNV, NgayLap, TongTien, TrangThai)
VALUES (NULL, @MaBan_Sample1, @MaNV_Sample, CONCAT(CURDATE(), ' 09:30:00'), 0, 'Hoàn thành');
SET @MaDH_Today1 := LAST_INSERT_ID();

INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDH_Today1, MaMon, 2, DonGia, DonGia * 2
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1;

INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDH_Today1, MaMon, 1, DonGia, DonGia
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1 OFFSET 2;

UPDATE DonHang SET TongTien = (SELECT SUM(ThanhTien) FROM CTDonHang WHERE MaDH = @MaDH_Today1) WHERE MaDH = @MaDH_Today1;

-- Đơn 2: Hôm nay 11:15
INSERT INTO DonHang (MaDat, MaBan, MaNV, NgayLap, TongTien, TrangThai)
VALUES (NULL, @MaBan_Sample2, @MaNV_Sample, CONCAT(CURDATE(), ' 11:15:00'), 0, 'Hoàn thành');
SET @MaDH_Today2 := LAST_INSERT_ID();

INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDH_Today2, MaMon, 1, DonGia, DonGia
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1 OFFSET 1;

INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDH_Today2, MaMon, 3, DonGia, DonGia * 3
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1 OFFSET 3;

UPDATE DonHang SET TongTien = (SELECT SUM(ThanhTien) FROM CTDonHang WHERE MaDH = @MaDH_Today2) WHERE MaDH = @MaDH_Today2;

-- Đơn 3: Hôm nay 14:20
INSERT INTO DonHang (MaDat, MaBan, MaNV, NgayLap, TongTien, TrangThai)
VALUES (NULL, @MaBan_Sample3, @MaNV_Sample, CONCAT(CURDATE(), ' 14:20:00'), 0, 'Hoàn thành');
SET @MaDH_Today3 := LAST_INSERT_ID();

INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDH_Today3, MaMon, 2, DonGia, DonGia * 2
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1;

INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDH_Today3, MaMon, 1, DonGia, DonGia
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1 OFFSET 4;

UPDATE DonHang SET TongTien = (SELECT SUM(ThanhTien) FROM CTDonHang WHERE MaDH = @MaDH_Today3) WHERE MaDH = @MaDH_Today3;

-- Cập nhật trạng thái bàn để có dữ liệu cho Dashboard
UPDATE Ban SET TrangThai = 'Trống' WHERE MaBan = @MaBan_Sample1;
UPDATE Ban SET TrangThai = 'Đang phục vụ' WHERE MaBan = @MaBan_Sample2;
UPDATE Ban SET TrangThai = 'Đã đặt' WHERE MaBan = @MaBan_Sample3;

-- Tạo đặt bàn mẫu cho hôm nay
SET @MaKH_Sample := (SELECT MaKH FROM KhachHang ORDER BY MaKH LIMIT 1);

-- Đặt bàn 1: Hôm nay, hoàn thành
INSERT INTO DatBan (MaKH, MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi, TrangThai, TenKhach, SoDienThoai, EmailKhach, GhiChu)
VALUES (
  @MaKH_Sample,
  (SELECT MaBan FROM Ban WHERE TrangThai = 'Đã đặt' LIMIT 1),
  CURDATE(),
  '18:00:00',
  '20:00:00',
  4,
  'Hoàn thành',
  'Nguyễn Văn A',
  '0901234567',
  'nguyenvana@email.com',
  'Đặt bàn tối nay'
);

-- Đặt bàn 2: Hôm nay, đã đặt
INSERT INTO DatBan (MaKH, MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi, TrangThai, TenKhach, SoDienThoai, EmailKhach, GhiChu)
VALUES (
  @MaKH_Sample,
  (SELECT MaBan FROM Ban WHERE TrangThai = 'Trống' LIMIT 1 OFFSET 3),
  CURDATE(),
  '19:30:00',
  '21:30:00',
  2,
  'Đã đặt',
  'Trần Thị B',
  '0912345678',
  'tranthib@email.com',
  'Đặt bàn cho 2 người'
);

-- Đặt bàn 3: Hôm nay, đã xác nhận
INSERT INTO DatBan (MaKH, MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi, TrangThai, TenKhach, SoDienThoai, EmailKhach, GhiChu)
VALUES (
  @MaKH_Sample,
  (SELECT MaBan FROM Ban WHERE TrangThai = 'Trống' LIMIT 1 OFFSET 4),
  CURDATE(),
  '20:00:00',
  '22:00:00',
  6,
  'Đã xác nhận',
  'Lê Văn C',
  '0923456789',
  'levanc@email.com',
  'Đặt bàn cho nhóm lớn'
);

-- Tạo đơn hàng online mẫu cho hôm nay
SET @MaKH_Online := (SELECT MaKH FROM KhachHang ORDER BY MaKH LIMIT 1);
SET @MaNV_Online := (SELECT MaNV FROM NhanVien WHERE ChucVu = 'Nhân viên' ORDER BY MaNV LIMIT 1);

-- Đơn online 1: Hôm nay 10:00 - Hoàn thành
INSERT INTO DonHangOnline (MaKH, TenKhach, SDTKhach, EmailKhach, DiaChiGiaoHang, LoaiDonHang, NgayDat, NgayGiaoMong, TongTien, PhiGiaoHang, TongThanhToan, TrangThai, MaNVXuLy)
VALUES (
  @MaKH_Online,
  'Nguyễn Thị D',
  '0934567890',
  'nguyenthid@email.com',
  '123 Đường ABC, Quận 1, TP.HCM',
  'Giao hàng',
  CONCAT(CURDATE(), ' 10:00:00'),
  CONCAT(CURDATE(), ' 11:00:00'),
  0,
  15000,
  0,
  'Hoàn thành',
  @MaNV_Online
);
SET @MaDHOnline1 := LAST_INSERT_ID();

INSERT INTO CTDonHangOnline (MaDHOnline, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDHOnline1, MaMon, 2, DonGia, DonGia * 2
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1;

INSERT INTO CTDonHangOnline (MaDHOnline, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDHOnline1, MaMon, 1, DonGia, DonGia
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1 OFFSET 1;

UPDATE DonHangOnline 
SET TongTien = (SELECT SUM(ThanhTien) FROM CTDonHangOnline WHERE MaDHOnline = @MaDHOnline1),
    TongThanhToan = (SELECT SUM(ThanhTien) FROM CTDonHangOnline WHERE MaDHOnline = @MaDHOnline1) + PhiGiaoHang
WHERE MaDHOnline = @MaDHOnline1;

-- Đơn online 2: Hôm nay 13:30 - Đang giao
INSERT INTO DonHangOnline (MaKH, TenKhach, SDTKhach, EmailKhach, DiaChiGiaoHang, LoaiDonHang, NgayDat, NgayGiaoMong, TongTien, PhiGiaoHang, TongThanhToan, TrangThai, MaNVXuLy)
VALUES (
  @MaKH_Online,
  'Trần Văn E',
  '0945678901',
  'tranvane@email.com',
  '456 Đường XYZ, Quận 3, TP.HCM',
  'Giao hàng',
  CONCAT(CURDATE(), ' 13:30:00'),
  CONCAT(CURDATE(), ' 15:00:00'),
  0,
  20000,
  0,
  'Đang giao',
  @MaNV_Online
);
SET @MaDHOnline2 := LAST_INSERT_ID();

INSERT INTO CTDonHangOnline (MaDHOnline, MaMon, SoLuong, DonGia, ThanhTien)
SELECT @MaDHOnline2, MaMon, 3, DonGia, DonGia * 3
FROM Mon WHERE TrangThai = 'Có sẵn' ORDER BY MaMon LIMIT 1 OFFSET 2;

UPDATE DonHangOnline 
SET TongTien = (SELECT SUM(ThanhTien) FROM CTDonHangOnline WHERE MaDHOnline = @MaDHOnline2),
    TongThanhToan = (SELECT SUM(ThanhTien) FROM CTDonHangOnline WHERE MaDHOnline = @MaDHOnline2) + PhiGiaoHang
WHERE MaDHOnline = @MaDHOnline2;

-- Kiểm tra kết quả
SELECT 'Đã tạo 3 đơn hàng tại chỗ và 2 đơn hàng online cho hôm nay' as ThongBao;
SELECT COUNT(*) as SoDonHangHomNay FROM DonHang WHERE DATE(NgayLap) = CURDATE();
SELECT COUNT(*) as SoDonHangOnlineHomNay FROM DonHangOnline WHERE DATE(NgayDat) = CURDATE();
SELECT SUM(TongTien) as TongDoanhThuHomNay FROM DonHang WHERE DATE(NgayLap) = CURDATE() AND TrangThai = 'Hoàn thành';
SELECT COUNT(*) as SoDatBanHomNay FROM DatBan WHERE DATE(NgayDat) = CURDATE();
SELECT TrangThai, COUNT(*) as SoLuong FROM Ban GROUP BY TrangThai;
