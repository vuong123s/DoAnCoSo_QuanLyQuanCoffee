-- Tạo function không dùng REGEXP để tránh lỗi syntax
-- Chạy toàn bộ file này trong MySQL Workbench

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
    DECLARE v_TempStr VARCHAR(500);
    
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
        
        -- Xử lý trường hợp "1 ổ Bánh mì"
        SET v_TempStr = TRIM(v_PhanTu);
        IF LOCATE('ổ', v_TempStr) > 0 AND LOCATE(' ', v_TempStr) > 0 THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_TempStr, ' ', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'ổ';
            SET v_TenNL = TRIM(SUBSTRING(v_TempStr, LOCATE('ổ', v_TempStr) + 1));
        -- Xử lý trường hợp "0.02kg" hoặc "2kg"
        ELSEIF LOCATE('kg', v_TempStr) > 0 THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_TempStr, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_TempStr, LOCATE('kg', v_TempStr) + 2));
        -- Xử lý trường hợp "0.2lít" hoặc "3lít"
        ELSEIF LOCATE('lít', v_TempStr) > 0 THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_TempStr, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_TempStr, LOCATE('lít', v_TempStr) + 3));
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

