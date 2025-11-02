-- =====================================================
-- Script: Thêm cột MaKH vào bảng DonHang
-- Mục đích: Cho phép cộng điểm cho khách hàng khi hoàn thành đơn
-- =====================================================

USE QuanLyCaFe;

-- Kiểm tra nếu cột MaKH chưa tồn tại thì thêm vào
ALTER TABLE DonHang 
ADD COLUMN IF NOT EXISTS MaKH INT AFTER MaDat,
ADD CONSTRAINT fk_donhang_khachhang 
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Kiểm tra kết quả
DESCRIBE DonHang;

SELECT 'Migration completed: Added MaKH column to DonHang table' as Status;
