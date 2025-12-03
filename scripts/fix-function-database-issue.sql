-- Script để sửa lỗi function không tìm thấy do vấn đề database name
-- Chạy script này: mysql -u root -p QuanLyCafe < scripts/fix-function-database-issue.sql

USE QuanLyCafe;

-- Kiểm tra function có tồn tại không
SELECT 
    ROUTINE_NAME,
    ROUTINE_SCHEMA,
    ROUTINE_TYPE
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';

-- Xóa function cũ nếu tồn tại (để tạo lại)
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;

-- Đảm bảo có quyền tạo function
SET GLOBAL log_bin_trust_function_creators = 1;

DELIMITER //

-- Tạo lại function trong đúng database
CREATE FUNCTION TruNguyenLieuTuMoTa(
    p_MoTa TEXT,
    p_SoLuong INT
)
RETURNS INT
DETERMINISTIC
MODIFIES SQL DATA
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
        
        -- Parse phần tử: "0.02kg Cà phê hạt Robusta" hoặc "1 ổ Bánh mì" hoặc "0.2lít Sữa tươi"
        -- Tìm số lượng (có thể là số thập phân hoặc số nguyên)
        -- Pattern: [số] [đơn vị] [tên nguyên liệu]
        
        -- Xử lý trường hợp "1 ổ Bánh mì" (có khoảng trắng giữa số và đơn vị)
        IF v_PhanTu REGEXP '^[0-9]+\\s+ổ' THEN
            -- Trường hợp "1 ổ Bánh mì"
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, ' ', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'ổ';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('ổ', v_PhanTu) + 1));
        -- Xử lý trường hợp "0.02kg Cà phê" hoặc "0.2lít Sữa" (số thập phân + đơn vị)
        ELSEIF v_PhanTu REGEXP '^[0-9]+\\.[0-9]+kg' THEN
            -- Trường hợp "0.02kg Cà phê hạt Robusta"
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        ELSEIF v_PhanTu REGEXP '^[0-9]+\\.[0-9]+lít' THEN
            -- Trường hợp "0.2lít Sữa tươi"
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        -- Xử lý trường hợp "2kg Đường" hoặc "3lít Sữa" (số nguyên + đơn vị)
        ELSEIF v_PhanTu REGEXP '^[0-9]+kg' THEN
            -- Trường hợp "2kg Đường"
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        ELSEIF v_PhanTu REGEXP '^[0-9]+lít' THEN
            -- Trường hợp "3lít Sữa"
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        ELSE
            -- Không parse được, bỏ qua
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
            
            -- Cập nhật trạng thái nếu số lượng dưới mức cảnh báo
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

-- Kiểm tra lại function đã được tạo
SELECT 
    ROUTINE_NAME,
    ROUTINE_SCHEMA,
    ROUTINE_TYPE,
    CREATED
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME = 'TruNguyenLieuTuMoTa';

SELECT 'Function TruNguyenLieuTuMoTa đã được tạo lại thành công!' AS Status;

