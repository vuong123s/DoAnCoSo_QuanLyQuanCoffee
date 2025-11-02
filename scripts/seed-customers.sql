-- Seed dữ liệu khách hàng mẫu
USE QuanLyCafe;

-- Xóa khách hàng cũ (nếu có)
DELETE FROM KhachHang;

-- Reset auto increment
ALTER TABLE KhachHang AUTO_INCREMENT = 1;

-- Thêm khách hàng mẫu
INSERT INTO KhachHang (HoTen, GioiTinh, NgaySinh, SDT, Email, MatKhau, DiaChi, DiemTichLuy, NgayDangKy, TrangThai) VALUES
('Nguyễn Văn An', 'Nam', '1990-05-15', '0901234567', 'nguyenvanan@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Nguyễn Huệ, Q1, TP.HCM', 150, NOW(), 'Hoạt động'),
('Trần Thị Bình', 'Nữ', '1995-08-20', '0912345678', 'tranthibinh@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456 Lê Lợi, Q3, TP.HCM', 80, NOW(), 'Hoạt động'),
('Lê Minh Châu', 'Nữ', '1988-12-03', '0923456789', 'leminhchau@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '789 Trần Hưng Đạo, Q5, TP.HCM', 200, NOW(), 'Hoạt động'),
('Phạm Văn Dũng', 'Nam', '1992-03-10', '0934567890', 'phamvandung@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '321 Võ Văn Tần, Q3, TP.HCM', 50, NOW(), 'Hoạt động'),
('Hoàng Thị Em', 'Nữ', '1997-11-25', '0945678901', 'hoangthiem@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '654 Điện Biên Phủ, Q1, TP.HCM', 120, NOW(), 'Hoạt động'),
('Đặng Văn Phúc', 'Nam', '1985-07-18', '0956789012', 'dangvanphuc@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '987 Cách Mạng Tháng 8, Q3, TP.HCM', 300, NOW(), 'Hoạt động'),
('Vũ Thị Giang', 'Nữ', '1993-02-14', '0967890123', 'vuthigiang@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '147 Nguyễn Thị Minh Khai, Q1, TP.HCM', 90, NOW(), 'Hoạt động'),
('Bùi Minh Hải', 'Nam', '1991-09-08', '0978901234', 'buiminhhai@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '258 Lý Thường Kiệt, Q10, TP.HCM', 60, NOW(), 'Hoạt động'),
('Ngô Thị Hoa', 'Nữ', '1996-06-30', '0989012345', 'ngothihoa@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '369 Hai Bà Trưng, Q1, TP.HCM', 180, NOW(), 'Hoạt động'),
('Trịnh Văn Khải', 'Nam', '1989-04-22', '0990123456', 'trinhvankhai@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '741 Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', 0, NOW(), 'Hoạt động');

SELECT '✅ Đã thêm 10 khách hàng mẫu!' as Status;
SELECT * FROM KhachHang;
