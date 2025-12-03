-- Script đơn giản để tạo function - chạy từng bước một
-- Vấn đề: Function không được tạo thành công

-- Bước 1: Đảm bảo đang ở đúng database
USE QuanLyCafe;

-- Bước 2: Kiểm tra database hiện tại
SELECT DATABASE() AS CurrentDatabase;

-- Bước 3: Đảm bảo có quyền tạo function
SET GLOBAL log_bin_trust_function_creators = 1;

-- Bước 4: Xóa function cũ nếu tồn tại
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;

-- Bước 5: Tạo function (chạy riêng phần này)
DELIMITER //

CREATE FUNCTION TruNguyenLieuTuMoTa(
    p_MoTa TEXT,
    p_SoLuong INT
)
RETURNS INT
DETERMINISTIC
MODIFIES SQL DATA
SQL SECURITY DEFINER
BEGIN
    DECLARE v_MoTa TEXT;
    DECLARE v_PhanTu VARCHAR(500);
    DECLARE v_SoLuongTru DECIMAL(10,3);
    DECLARE v_DonVi VARCHAR(20);
    DECLARE v_TenNL VARCHAR(100);
    DECLARE v_Pos INT DEFAULT 1;
    DECLARE v_NextPos INT;
    DECLARE v_SoNguyenLieuDaTru INT DEFAULT 0;
    DECLARE v_SoLuongHienTai DECIMAL(10,2);
    DECLARE v_MaNL INT;
    
    IF p_MoTa IS NULL OR TRIM(p_MoTa) = '' THEN
        RETURN 0;
    END IF;
    
    SET v_MoTa = TRIM(p_MoTa);
    
    WHILE v_Pos <= CHAR_LENGTH(v_MoTa) DO
        SET v_NextPos = LOCATE('+', v_MoTa, v_Pos);
        
        IF v_NextPos = 0 THEN
            SET v_PhanTu = TRIM(SUBSTRING(v_MoTa, v_Pos));
            SET v_Pos = CHAR_LENGTH(v_MoTa) + 1;
        ELSE
            SET v_PhanTu = TRIM(SUBSTRING(v_MoTa, v_Pos, v_NextPos - v_Pos));
            SET v_Pos = v_NextPos + 1;
        END IF;
        
        IF v_PhanTu = '' THEN
            ITERATE;
        END IF;
        
        -- Xử lý trường hợp "1 ổ Bánh mì" (có khoảng trắng giữa số và đơn vị)
        IF v_PhanTu REGEXP '^[0-9]+[[:space:]]+ổ' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, ' ', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'ổ';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('ổ', v_PhanTu) + 1));
        -- Xử lý trường hợp "0.02kg Cà phê" (số thập phân + kg)
        ELSEIF v_PhanTu REGEXP '^[0-9]+[.][0-9]+kg' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        -- Xử lý trường hợp "0.2lít Sữa" (số thập phân + lít)
        ELSEIF v_PhanTu REGEXP '^[0-9]+[.][0-9]+lít' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        -- Xử lý trường hợp "2kg Đường" (số nguyên + kg)
        ELSEIF v_PhanTu REGEXP '^[0-9]+kg' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        -- Xử lý trường hợp "3lít Sữa" (số nguyên + lít)
        ELSEIF v_PhanTu REGEXP '^[0-9]+lít' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        ELSE
            ITERATE;
        END IF;
        
        SET v_SoLuongTru = v_SoLuongTru * p_SoLuong;
        
        SELECT MaNL, SoLuong INTO v_MaNL, v_SoLuongHienTai
        FROM Kho
        WHERE TenNL = TRIM(v_TenNL) AND DonVi = v_DonVi
        LIMIT 1;
        
        IF v_MaNL IS NOT NULL AND v_SoLuongHienTai >= v_SoLuongTru THEN
            UPDATE Kho
            SET SoLuong = SoLuong - v_SoLuongTru
            WHERE MaNL = v_MaNL;
            
            UPDATE Kho
            SET TrangThai = CASE 
                WHEN SoLuong <= 0 THEN 'Hết hàng'
                WHEN SoLuong <= MucCanhBao THEN 'Gần hết'
                ELSE 'Còn hàng'
            END
            WHERE MaNL = v_MaNL;
            
            SET v_SoNguyenLieuDaTru = v_SoNguyenLieuDaTru + 1;
        END IF;
        
    END WHILE;
    
    RETURN v_SoNguyenLieuDaTru;
END //

DELIMITER ;

-- Bước 6: Kiểm tra function đã được tạo
SELECT 
    ROUTINE_SCHEMA,
    ROUTINE_NAME,
    ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';

-- Bước 7: Test function
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng', 1) AS TestResult;

