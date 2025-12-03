-- Script để test function TruNguyenLieuTuMoTa
USE QuanLyCafe;

-- Test 1: Kiểm tra function có tồn tại không
SELECT 
    ROUTINE_NAME,
    ROUTINE_SCHEMA,
    ROUTINE_TYPE,
    CREATED,
    LAST_ALTERED
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';

-- Test 2: Test function với mô tả món thực tế
-- Test với mô tả: "0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng + 0.2lít Nước"
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng + 0.2lít Nước', 1) AS SoNguyenLieuDaTru;

-- Test 3: Test với số lượng món = 2
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng', 2) AS SoNguyenLieuDaTru;

-- Test 4: Kiểm tra số lượng nguyên liệu trong kho sau khi trừ
SELECT MaNL, TenNL, DonVi, SoLuong, TrangThai 
FROM Kho 
WHERE TenNL IN ('Cà phê hạt Robusta', 'Đường trắng', 'Nước')
ORDER BY TenNL;

