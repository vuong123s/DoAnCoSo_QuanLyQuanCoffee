-- Script để sửa lỗi function do case sensitivity của database name
-- Vấn đề: MySQL tìm function với database name quanlycafe (chữ thường) nhưng database là QuanLyCafe

-- Bước 1: Kiểm tra tất cả databases
SHOW DATABASES LIKE '%cafe%';

-- Bước 2: Kiểm tra database hiện tại
SELECT DATABASE() AS CurrentDatabase;

-- Bước 3: Kiểm tra function có tồn tại trong database nào
SELECT 
    ROUTINE_SCHEMA,
    ROUTINE_NAME,
    ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';

-- Bước 4: Xóa function trong tất cả databases có thể
DROP FUNCTION IF EXISTS QuanLyCafe.TruNguyenLieuTuMoTa;
DROP FUNCTION IF EXISTS quanlycafe.TruNguyenLieuTuMoTa;
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;

-- Bước 5: Đảm bảo đang ở đúng database
USE QuanLyCafe;

-- Bước 6: Đảm bảo có quyền tạo function
SET GLOBAL log_bin_trust_function_creators = 1;

DELIMITER //

-- Bước 7: Tạo function với SQL SECURITY DEFINER để tránh vấn đề quyền
CREATE FUNCTION TruNguyenLieuTuMoTa(
    p_MoTa TEXT,
    p_SoLuong INT
)
RETURNS INT
DETERMINISTIC
MODIFIES SQL DATA
SQL SECURITY DEFINER
COMMENT 'Parse và trừ nguyên liệu từ mô tả món'
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
    
    -- Nếu mô tả rỗng hoặc NULL thì return
    IF p_MoTa IS NULL OR TRIM(p_MoTa) = '' THEN
        RETURN 0;
    END IF;
    
    SET v_MoTa = TRIM(p_MoTa);
    
    -- Lặp qua từng phần tử được phân tách bởi '+'
    WHILE v_Pos <= CHAR_LENGTH(v_MoTa) DO
        -- Tìm vị trí dấu '+' tiếp theo
        SET v_NextPos = LOCATE('+', v_MoTa, v_Pos);
        
        IF v_NextPos = 0 THEN
            -- Đây là phần tử cuối cùng
            SET v_PhanTu = TRIM(SUBSTRING(v_MoTa, v_Pos));
            SET v_Pos = CHAR_LENGTH(v_MoTa) + 1;
        ELSE
            -- Lấy phần tử hiện tại
            SET v_PhanTu = TRIM(SUBSTRING(v_MoTa, v_Pos, v_NextPos - v_Pos));
            SET v_Pos = v_NextPos + 1;
        END IF;
        
        -- Bỏ qua nếu phần tử rỗng
        IF v_PhanTu = '' THEN
            ITERATE;
        END IF;
        
        -- Parse phần tử
        IF v_PhanTu REGEXP '^[0-9]+\\s+ổ' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, ' ', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'ổ';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('ổ', v_PhanTu) + 1));
        ELSEIF v_PhanTu REGEXP '^[0-9]+\\.[0-9]+kg' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        ELSEIF v_PhanTu REGEXP '^[0-9]+\\.[0-9]+lít' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        ELSEIF v_PhanTu REGEXP '^[0-9]+kg' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        ELSEIF v_PhanTu REGEXP '^[0-9]+lít' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        ELSE
            ITERATE;
        END IF;
        
        -- Nhân với số lượng món đã bán
        SET v_SoLuongTru = v_SoLuongTru * p_SoLuong;
        
        -- Tìm nguyên liệu trong kho
        SELECT MaNL, SoLuong INTO v_MaNL, v_SoLuongHienTai
        FROM Kho
        WHERE TenNL = TRIM(v_TenNL) AND DonVi = v_DonVi
        LIMIT 1;
        
        -- Nếu tìm thấy nguyên liệu và số lượng đủ
        IF v_MaNL IS NOT NULL AND v_SoLuongHienTai >= v_SoLuongTru THEN
            -- Trừ nguyên liệu
            UPDATE Kho
            SET SoLuong = SoLuong - v_SoLuongTru
            WHERE MaNL = v_MaNL;
            
            -- Cập nhật trạng thái
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

-- Bước 8: Kiểm tra function đã được tạo
SELECT 
    ROUTINE_SCHEMA,
    ROUTINE_NAME,
    ROUTINE_TYPE,
    DEFINER,
    CREATED,
    LAST_ALTERED
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';

-- Bước 9: Test function
SELECT TruNguyenLieuTuMoTa('0.02kg Cà phê hạt Robusta + 0.015kg Đường trắng', 1) AS TestResult;

SELECT 'Function đã được tạo thành công trong database!' AS Status;

