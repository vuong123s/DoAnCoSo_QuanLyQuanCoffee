-- Script để sửa lỗi function và trigger hoàn chỉnh
-- Chạy script này: mysql -u root -p QuanLyCafe < scripts/fix-complete-function-and-trigger.sql

USE QuanLyCafe;

-- Bước 1: Kiểm tra database hiện tại
SELECT DATABASE() AS CurrentDatabase;

-- Bước 2: Đảm bảo có quyền tạo function
SET GLOBAL log_bin_trust_function_creators = 1;

-- Bước 3: Xóa function và trigger cũ nếu tồn tại
DROP FUNCTION IF EXISTS TruNguyenLieuTuMoTa;
DROP TRIGGER IF EXISTS TG_TruNguyenLieuKhiDonHangHoanThanh;
DROP TRIGGER IF EXISTS TG_TruNguyenLieuKhiDonHangOnlineHoanThanh;
DROP PROCEDURE IF EXISTS TruNguyenLieuChoDonHang;
DROP PROCEDURE IF EXISTS TruNguyenLieuChoDonHangOnline;

DELIMITER //

-- Bước 4: Tạo lại function
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
        -- Xử lý trường hợp "1 ổ Bánh mì" (có khoảng trắng giữa số và đơn vị)
        IF v_PhanTu REGEXP '^[0-9]+\\s+ổ' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, ' ', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'ổ';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('ổ', v_PhanTu) + 1));
        -- Xử lý trường hợp "0.02kg Cà phê" hoặc "0.2lít Sữa" (số thập phân + đơn vị)
        ELSEIF v_PhanTu REGEXP '^[0-9]+\\.[0-9]+kg' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        ELSEIF v_PhanTu REGEXP '^[0-9]+\\.[0-9]+lít' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'lít', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'lít';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('lít', v_PhanTu) + 3));
        -- Xử lý trường hợp "2kg Đường" hoặc "3lít Sữa" (số nguyên + đơn vị)
        ELSEIF v_PhanTu REGEXP '^[0-9]+kg' THEN
            SET v_SoLuongTru = CAST(SUBSTRING_INDEX(v_PhanTu, 'kg', 1) AS DECIMAL(10,3));
            SET v_DonVi = 'kg';
            SET v_TenNL = TRIM(SUBSTRING(v_PhanTu, LOCATE('kg', v_PhanTu) + 2));
        ELSEIF v_PhanTu REGEXP '^[0-9]+lít' THEN
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

-- Bước 5: Tạo lại stored procedure cho đơn hàng tại chỗ
CREATE PROCEDURE TruNguyenLieuChoDonHang(
    IN p_MaDH INT
)
BEGIN
    DECLARE v_MaMon INT;
    DECLARE v_SoLuong INT;
    DECLARE v_MoTa TEXT;
    DECLARE v_SoNguyenLieuDaTru INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy tất cả món trong đơn hàng
    DECLARE cur_mon CURSOR FOR
        SELECT ct.MaMon, ct.SoLuong, m.MoTa
        FROM CTDonHang ct
        INNER JOIN Mon m ON ct.MaMon = m.MaMon
        WHERE ct.MaDH = p_MaDH;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Mở cursor
    OPEN cur_mon;
    
    read_loop: LOOP
        FETCH cur_mon INTO v_MaMon, v_SoLuong, v_MoTa;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Trừ nguyên liệu cho món này
        SET v_SoNguyenLieuDaTru = v_SoNguyenLieuDaTru + TruNguyenLieuTuMoTa(v_MoTa, v_SoLuong);
        
    END LOOP;
    
    CLOSE cur_mon;
    
    -- Log kết quả
    INSERT INTO LogHeThong (ThoiGian, HanhDong, MoTa, SoLuong)
    VALUES (NOW(), 'TRU_NGUYEN_LIEU_DON_HANG', 
            CONCAT('Trừ nguyên liệu cho đơn hàng #', p_MaDH, ' - Đã trừ ', v_SoNguyenLieuDaTru, ' loại nguyên liệu'), 
            v_SoNguyenLieuDaTru);
END //

-- Bước 6: Tạo lại stored procedure cho đơn hàng online
CREATE PROCEDURE TruNguyenLieuChoDonHangOnline(
    IN p_MaDHOnline INT
)
BEGIN
    DECLARE v_MaMon INT;
    DECLARE v_SoLuong INT;
    DECLARE v_MoTa TEXT;
    DECLARE v_SoNguyenLieuDaTru INT DEFAULT 0;
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy tất cả món trong đơn hàng online
    DECLARE cur_mon CURSOR FOR
        SELECT ct.MaMon, ct.SoLuong, m.MoTa
        FROM CTDonHangOnline ct
        INNER JOIN Mon m ON ct.MaMon = m.MaMon
        WHERE ct.MaDHOnline = p_MaDHOnline;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Mở cursor
    OPEN cur_mon;
    
    read_loop: LOOP
        FETCH cur_mon INTO v_MaMon, v_SoLuong, v_MoTa;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Trừ nguyên liệu cho món này
        SET v_SoNguyenLieuDaTru = v_SoNguyenLieuDaTru + TruNguyenLieuTuMoTa(v_MoTa, v_SoLuong);
        
    END LOOP;
    
    CLOSE cur_mon;
    
    -- Log kết quả
    INSERT INTO LogHeThong (ThoiGian, HanhDong, MoTa, SoLuong)
    VALUES (NOW(), 'TRU_NGUYEN_LIEU_DON_HANG_ONLINE', 
            CONCAT('Trừ nguyên liệu cho đơn hàng online #', p_MaDHOnline, ' - Đã trừ ', v_SoNguyenLieuDaTru, ' loại nguyên liệu'), 
            v_SoNguyenLieuDaTru);
END //

DELIMITER ;

-- Bước 7: Tạo lại trigger cho đơn hàng tại chỗ
DELIMITER //

CREATE TRIGGER TG_TruNguyenLieuKhiDonHangHoanThanh
AFTER UPDATE ON DonHang
FOR EACH ROW
BEGIN
    -- Chỉ thực hiện khi trạng thái chuyển sang 'Hoàn thành'
    IF NEW.TrangThai = 'Hoàn thành' AND OLD.TrangThai != 'Hoàn thành' THEN
        CALL TruNguyenLieuChoDonHang(NEW.MaDH);
    END IF;
END //

-- Bước 8: Tạo lại trigger cho đơn hàng online
CREATE TRIGGER TG_TruNguyenLieuKhiDonHangOnlineHoanThanh
AFTER UPDATE ON DonHangOnline
FOR EACH ROW
BEGIN
    -- Chỉ thực hiện khi trạng thái chuyển sang 'Hoàn thành'
    IF NEW.TrangThai = 'Hoàn thành' AND OLD.TrangThai != 'Hoàn thành' THEN
        CALL TruNguyenLieuChoDonHangOnline(NEW.MaDHOnline);
    END IF;
END //

DELIMITER ;

-- Bước 9: Kiểm tra function và trigger đã được tạo
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE,
    ROUTINE_SCHEMA
FROM information_schema.ROUTINES
WHERE ROUTINE_NAME IN ('TruNguyenLieuTuMoTa', 'TruNguyenLieuChoDonHang', 'TruNguyenLieuChoDonHangOnline')
ORDER BY ROUTINE_NAME;

SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE
FROM information_schema.TRIGGERS
WHERE TRIGGER_NAME IN ('TG_TruNguyenLieuKhiDonHangHoanThanh', 'TG_TruNguyenLieuKhiDonHangOnlineHoanThanh')
ORDER BY TRIGGER_NAME;

SELECT 'Function, stored procedures và triggers đã được tạo thành công!' AS Status;

