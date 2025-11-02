-- Kiểm tra xem có data trong database không
USE quanlycafe;

-- 1. Kiểm tra số lượng món ăn
SELECT 'Tổng số món ăn:' as Info, COUNT(*) as SoLuong FROM Mon;

-- 2. Kiểm tra số lượng đơn hàng
SELECT 'Tổng số đơn hàng:' as Info, COUNT(*) as SoLuong FROM DonHang;

-- 3. Kiểm tra đơn hàng hoàn thành
SELECT 'Đơn hàng Hoàn thành:' as Info, COUNT(*) as SoLuong FROM DonHang WHERE TrangThai = 'Hoàn thành';

-- 4. Kiểm tra chi tiết đơn hàng
SELECT 'Tổng chi tiết đơn hàng:' as Info, COUNT(*) as SoLuong FROM CTDonHang;

-- 5. Kiểm tra thanh toán thành công
SELECT 'Thanh toán Thành công:' as Info, COUNT(*) as SoLuong FROM ThanhToan WHERE TrangThai = 'Thành công';

-- 6. Test procedure với tất cả data
CALL XepHangMonBanChay(NULL, NULL, 10);

-- 7. Test procedure với 30 ngày qua
CALL XepHangMonBanChay(DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), 10);
