# Test Tính Năng Đặt Nhiều Bàn

## Hướng dẫn Test

### 1. Khởi động hệ thống
```bash
# Terminal 1: Khởi động backend services
cd services/table-service
npm start

# Terminal 2: Khởi động API Gateway  
cd api-gateway
npm start

# Terminal 3: Khởi động frontend
cd front-end
npm run dev
```

### 2. Test Cases

#### Test Case 1: Đặt bàn đơn (Single Booking)
1. Truy cập: http://localhost:5173/book-table
2. Đảm bảo toggle "Đặt nhiều bàn" đang TẮT
3. Điền thông tin:
   - Tên: Test User
   - SĐT: 0123456789
   - Ngày: Ngày mai
   - Giờ: 19:00
   - Số người: 4
4. Nhấn "Tiếp Tục"
5. Chọn 1 bàn trống
6. Nhấn "Xác Nhận Đặt Bàn"
7. **Kết quả mong đợi**: Đặt bàn thành công, hiển thị thông tin 1 bàn

#### Test Case 2: Đặt nhiều bàn (Multiple Booking)
1. Truy cập: http://localhost:5173/book-table
2. BẬT toggle "Đặt nhiều bàn"
3. Điền thông tin:
   - Tên: Test Multiple User
   - SĐT: 0987654321
   - Ngày: Ngày mai
   - Giờ: 20:00
   - Số người: 12
4. Nhấn "Tiếp Tục"
5. Chọn 3 bàn trống (nhấn vào từng bàn)
6. Kiểm tra danh sách bàn đã chọn hiển thị đúng
7. Nhấn "Xác Nhận Đặt 3 Bàn"
8. **Kết quả mong đợi**: Đặt 3 bàn thành công, hiển thị danh sách bàn

#### Test Case 3: Toggle giữa Single và Multiple
1. Bắt đầu với chế độ đặt đơn, chọn 1 bàn
2. Chuyển sang chế độ đặt nhiều bàn
3. **Kết quả mong đợi**: Bàn đã chọn bị xóa, UI chuyển sang multi-select
4. Chọn 2 bàn trong chế độ nhiều bàn
5. Chuyển về chế độ đặt đơn
6. **Kết quả mong đợi**: Danh sách bàn đã chọn bị xóa, UI chuyển về single-select

#### Test Case 4: Validation
1. Chế độ đặt nhiều bàn
2. Thử chọn bàn đã được đặt hoặc đang phục vụ
3. **Kết quả mong đợi**: Hiển thị toast error "Chỉ có thể chọn bàn trống"
4. Thử chọn quá 10 bàn
5. **Kết quả mong đợi**: Hiển thị toast error "Chỉ có thể chọn tối đa 10 bàn"

#### Test Case 5: Xóa bàn khỏi danh sách
1. Chế độ đặt nhiều bàn, chọn 3 bàn
2. Nhấn nút X trên 1 bàn trong danh sách đã chọn
3. **Kết quả mong đợi**: Bàn đó bị xóa khỏi danh sách
4. Nhấn "Xóa tất cả"
5. **Kết quả mong đợi**: Tất cả bàn bị xóa khỏi danh sách

### 3. Kiểm tra Database

#### Sau khi đặt bàn đơn:
```sql
SELECT * FROM DatBan WHERE TenKhach = 'Test User';
-- Kết quả: 1 record với thông tin bàn đã đặt
```

#### Sau khi đặt nhiều bàn:
```sql
SELECT * FROM DatBan WHERE TenKhach = 'Test Multiple User';
-- Kết quả: 3 records với cùng thông tin khách hàng, khác MaBan
-- GhiChu sẽ có thêm "- Đặt nhóm 3 bàn"
```

### 4. UI/UX Checks

#### Visual Indicators:
- ✅ Bàn đã chọn có border màu vàng và ring
- ✅ Bàn trống có màu xanh
- ✅ Bàn đã đặt/đang phục vụ có màu tương ứng
- ✅ Counter hiển thị đúng số bàn đã chọn (x/10)
- ✅ Danh sách bàn đã chọn hiển thị đầy đủ thông tin

#### Responsive Design:
- ✅ Hoạt động tốt trên mobile
- ✅ Grid layout responsive
- ✅ Toggle button dễ sử dụng

#### Toast Messages:
- ✅ Thông báo khi chọn/bỏ chọn bàn
- ✅ Thông báo lỗi khi validation fail
- ✅ Thông báo thành công khi đặt bàn

### 5. Performance Tests

#### Load Test:
1. Chọn/bỏ chọn nhiều bàn liên tục
2. **Kết quả mong đợi**: UI responsive, không lag
3. Chuyển đổi giữa các khu vực với nhiều bàn đã chọn
4. **Kết quả mong đợi**: Danh sách bàn đã chọn được giữ nguyên

### 6. Error Handling

#### Network Errors:
1. Ngắt kết nối mạng khi đặt bàn
2. **Kết quả mong đợi**: Hiển thị error message phù hợp
3. Khôi phục kết nối và thử lại
4. **Kết quả mong đợi**: Hoạt động bình thường

#### API Errors:
1. Backend trả về error 500
2. **Kết quả mong đợi**: Hiển thị "Lỗi khi đặt nhiều bàn"
3. Một số bàn đặt thành công, một số thất bại
4. **Kết quả mong đợi**: Hiển thị "Chỉ đặt được X/Y bàn"

## Kết Quả Test

### ✅ Passed
- [ ] Test Case 1: Đặt bàn đơn
- [ ] Test Case 2: Đặt nhiều bàn  
- [ ] Test Case 3: Toggle chế độ
- [ ] Test Case 4: Validation
- [ ] Test Case 5: Xóa bàn
- [ ] Database consistency
- [ ] UI/UX responsive
- [ ] Performance acceptable
- [ ] Error handling proper

### ❌ Failed
- [ ] Issue 1: Mô tả lỗi
- [ ] Issue 2: Mô tả lỗi

### 📝 Notes
- Ghi chú về các vấn đề phát hiện
- Đề xuất cải tiến
