-- Sample data for new microservices
-- Run this after setting up the database

USE QuanLyCafe;

-- Insert sample inventory items
INSERT INTO Kho (TenNguyenLieu, DonVi, SoLuongTon, SoLuongToiThieu, DonGiaNhap, NgayNhap, NgayHetHan, ViTri, NhaCungCap, GhiChu) VALUES
('Cà phê Arabica', 'kg', 25.5, 5.0, 150000, '2024-01-15', '2024-12-31', 'Kệ A1', 'Công ty Cà phê Việt', 'Cà phê chất lượng cao'),
('Cà phê Robusta', 'kg', 30.0, 5.0, 120000, '2024-01-15', '2024-12-31', 'Kệ A2', 'Công ty Cà phê Việt', 'Cà phê đậm đà'),
('Sữa tươi', 'lít', 50.0, 10.0, 25000, '2024-01-20', '2024-01-27', 'Tủ lạnh 1', 'Vinamilk', 'Bảo quản lạnh'),
('Đường trắng', 'kg', 20.0, 3.0, 18000, '2024-01-10', '2025-01-10', 'Kệ B1', 'Công ty Đường Biên Hòa', 'Đường tinh luyện'),
('Trà xanh', 'kg', 5.5, 1.0, 200000, '2024-01-12', '2024-07-12', 'Kệ C1', 'Trà Thái Nguyên', 'Trà cao cấp'),
('Chocolate powder', 'kg', 8.0, 2.0, 180000, '2024-01-18', '2024-12-18', 'Kệ B2', 'Cocoa Vietnam', 'Bột chocolate nguyên chất'),
('Vanilla syrup', 'chai', 12.0, 3.0, 45000, '2024-01-16', '2024-06-16', 'Kệ D1', 'Monin Vietnam', 'Syrup vani tự nhiên'),
('Caramel syrup', 'chai', 10.0, 3.0, 45000, '2024-01-16', '2024-06-16', 'Kệ D1', 'Monin Vietnam', 'Syrup caramel'),
('Ly giấy size M', 'cái', 500.0, 100.0, 800, '2024-01-14', NULL, 'Kệ E1', 'Bao bì Sài Gòn', 'Ly giấy 350ml'),
('Ly giấy size L', 'cái', 300.0, 50.0, 1000, '2024-01-14', NULL, 'Kệ E1', 'Bao bì Sài Gòn', 'Ly giấy 500ml');

-- Insert sample vouchers
INSERT INTO Voucher (MaVC, TenVC, MoTa, LoaiGiamGia, GiaTriGiam, GiaTriToiDa, DonHangToiThieu, NgayBatDau, NgayKetThuc, SoLuongToiDa, SoLuongDaSuDung, TrangThai, LoaiKhachHang, NgayTao, MaNVTao) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'Phần trăm', 10.00, 50000.00, 100000.00, '2024-01-01', '2024-12-31', 1000, 0, 'Hoạt động', 'Thành viên', '2024-01-01', 1),
('SAVE20K', 'Giảm 20K cho đơn từ 200K', 'Giảm 20,000đ cho đơn hàng từ 200,000đ', 'Tiền', 20000.00, NULL, 200000.00, '2024-01-01', '2024-06-30', 500, 0, 'Hoạt động', 'Tất cả', '2024-01-01', 1),
('VIP15', 'Ưu đãi khách VIP', 'Giảm 15% cho khách VIP', 'Phần trăm', 15.00, 100000.00, 150000.00, '2024-01-01', '2024-12-31', 200, 0, 'Hoạt động', 'Khách VIP', '2024-01-01', 1),
('WEEKEND25', 'Khuyến mãi cuối tuần', 'Giảm 25,000đ cho đơn cuối tuần', 'Tiền', 25000.00, NULL, 300000.00, '2024-01-01', '2024-12-31', 100, 0, 'Hoạt động', 'Tất cả', '2024-01-01', 1),
('STUDENT5', 'Ưu đãi sinh viên', 'Giảm 5% cho sinh viên', 'Phần trăm', 5.00, 30000.00, 50000.00, '2024-01-01', '2024-12-31', 2000, 0, 'Hoạt động', 'Thành viên', '2024-01-01', 1);

-- Insert sample cart items (for testing)
INSERT INTO GioHang (MaKH, SessionId, MaMon, SoLuong, DonGia, GhiChu, NgayThem) VALUES
(1, NULL, 1, 2, 45000, 'Ít đường', '2024-01-20 10:30:00'),
(1, NULL, 3, 1, 55000, 'Thêm kem', '2024-01-20 10:31:00'),
(NULL, 'guest-session-123', 2, 1, 50000, 'Size L', '2024-01-20 11:00:00');

-- Insert sample online orders
INSERT INTO DonHangOnline (MaKH, TenKhachHang, SoDienThoai, Email, DiaChiGiaoHang, PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang, TongTienHang, PhiGiaoHang, MaVoucher, GiamGiaVoucher, TongThanhToan, GhiChu, NgayDatHang, ThoiGianGiaoHang) VALUES
(1, 'Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', '123 Đường ABC, Quận 1, TP.HCM', 'Tiền mặt', 'Chưa thanh toán', 'Đang xử lý', 145000.00, 15000.00, 'WELCOME10', 14500.00, 145500.00, 'Giao hàng giờ hành chính', '2024-01-20 10:30:00', '2024-01-20 14:00:00'),
(2, 'Trần Thị B', '0907654321', 'tranthib@email.com', '456 Đường XYZ, Quận 3, TP.HCM', 'Chuyển khoản', 'Đã thanh toán', 'Đang giao hàng', 200000.00, 20000.00, 'SAVE20K', 20000.00, 200000.00, 'Gọi trước khi giao', '2024-01-20 09:15:00', '2024-01-20 13:30:00');

-- Insert sample online order details
INSERT INTO CTDonHangOnline (MaDonHangOnline, MaMon, TenMon, SoLuong, DonGia, ThanhTien, GhiChuMon, TrangThaiMon) VALUES
(1, 1, 'Cà phê đen đá', 2, 45000, 90000, 'Ít đường', 'Đang làm'),
(1, 3, 'Cappuccino', 1, 55000, 55000, 'Thêm kem', 'Chờ xử lý'),
(2, 2, 'Cà phê sữa đá', 2, 50000, 100000, 'Bình thường', 'Hoàn thành'),
(2, 4, 'Trà xanh', 2, 35000, 70000, 'Ít đá', 'Hoàn thành'),
(2, 5, 'Bánh mì', 1, 30000, 30000, 'Không rau', 'Hoàn thành');

-- Insert sample order tracking
INSERT INTO TheoDoiDonHang (MaDonHangOnline, TrangThai, MoTa, ViTriHienTai, ThoiGianCapNhat, MaNVCapNhat) VALUES
(1, 'Đã nhận đơn', 'Đơn hàng đã được xác nhận', 'Quán cà phê', '2024-01-20 10:35:00', 1),
(1, 'Đang chuẩn bị', 'Đang pha chế đồ uống', 'Quán cà phê', '2024-01-20 10:45:00', 2),
(2, 'Đã nhận đơn', 'Đơn hàng đã được xác nhận', 'Quán cà phê', '2024-01-20 09:20:00', 1),
(2, 'Đang chuẩn bị', 'Đang pha chế đồ uống', 'Quán cà phê', '2024-01-20 09:30:00', 2),
(2, 'Đang giao hàng', 'Shipper đang trên đường giao', 'Đường Nguyễn Huệ', '2024-01-20 10:00:00', 3);

-- Insert sample voucher usage
INSERT INTO VoucherUsage (MaVC, MaKH, SoDienThoai, MaDonHangOnline, GiaTriDonHang, GiaTriGiam, NgaySuDung, TrangThai) VALUES
('WELCOME10', 1, '0901234567', 1, 145000.00, 14500.00, '2024-01-20 10:30:00', 'Đã sử dụng'),
('SAVE20K', 2, '0907654321', 2, 220000.00, 20000.00, '2024-01-20 09:15:00', 'Đã sử dụng');

-- Insert sample import records
INSERT INTO NhapKho (MaKho, SoLuongNhap, DonGiaNhap, ThanhTien, NgayNhap, NgayHetHan, SoHoaDon, NhaCungCap, MaNVNhap, GhiChu, TrangThai) VALUES
(1, 10.0, 150000, 1500000, '2024-01-15', '2024-12-31', 'HD001', 'Công ty Cà phê Việt', 1, 'Nhập hàng đầu tháng', 'Đã nhập'),
(2, 15.0, 120000, 1800000, '2024-01-15', '2024-12-31', 'HD002', 'Công ty Cà phê Việt', 1, 'Nhập hàng đầu tháng', 'Đã nhập'),
(3, 20.0, 25000, 500000, '2024-01-20', '2024-01-27', 'HD003', 'Vinamilk', 2, 'Sữa tươi hàng tuần', 'Đã nhập');

-- Insert sample export records
INSERT INTO XuatKho (MaKho, SoLuongXuat, DonGiaXuat, ThanhTien, NgayXuat, LyDoXuat, MaDonHang, MaDonHangOnline, MaNVXuat, GhiChu, TrangThai) VALUES
(1, 0.5, 150000, 75000, '2024-01-20 10:45:00', 'Sản xuất', NULL, 1, 2, 'Pha chế đơn hàng online #1', 'Đã xuất'),
(2, 0.3, 120000, 36000, '2024-01-20 09:30:00', 'Sản xuất', NULL, 2, 2, 'Pha chế đơn hàng online #2', 'Đã xuất'),
(3, 0.2, 25000, 5000, '2024-01-20 10:00:00', 'Sản xuất', NULL, 2, 2, 'Pha chế cappuccino', 'Đã xuất');

-- Update voucher usage count
UPDATE Voucher SET SoLuongDaSuDung = 1 WHERE MaVC IN ('WELCOME10', 'SAVE20K');

COMMIT;
