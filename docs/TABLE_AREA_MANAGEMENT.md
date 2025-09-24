# Quản lý Bàn theo Khu vực với Hình ảnh

## Tổng quan
Hệ thống quản lý bàn theo khu vực cho phép tổ chức và hiển thị bàn ăn theo các khu vực khác nhau trong nhà hàng, kèm theo hình ảnh minh họa trực quan.

## Các Khu vực Hỗ trợ

### 1. Tầng 1 (Main Floor)
- **Mô tả**: Khu vực chính với không gian rộng rãi, gần quầy bar và bếp
- **Đặc điểm**: Ánh sáng tự nhiên, dễ tiếp cận, phù hợp cho khách đi một mình hoặc nhóm nhỏ
- **Hình ảnh**: Restaurant main dining area với thiết kế hiện đại

### 2. Tầng 2 (Upper Level)
- **Mô tả**: Tầng trên yên tĩnh với các phòng riêng và ban công
- **Đặc điểm**: Không gian riêng tư, yên tĩnh, phù hợp cho cuộc họp hoặc hẹn hò
- **Hình ảnh**: Elegant upper floor dining với không gian ấm cúng

### 3. VIP (Premium Area)
- **Mô tả**: Khu vực cao cấp với phòng riêng sang trọng và dịch vụ đặc biệt
- **Đặc điểm**: Dịch vụ cao cấp, riêng tư tuyệt đối, phù hợp cho khách VIP
- **Hình ảnh**: Luxury private dining rooms với thiết kế đẳng cấp

### 4. Sân thượng (Rooftop)
- **Mô tả**: Không gian mở với tầm nhìn đẹp và không khí trong lành
- **Đặc điểm**: View đẹp, không khí thoáng mát, phù hợp cho buổi tối
- **Hình ảnh**: Rooftop dining với city view

### 5. Ngoài trời (Outdoor)
- **Mô tả**: Sân vườn xanh mát với không gian tự nhiên thư giãn
- **Đặc điểm**: Không gian xanh, gần gũi thiên nhiên, phù hợp cho gia đình
- **Hình ảnh**: Garden dining với cây xanh tự nhiên

## Tính năng Hình ảnh

### 1. Area Selector với Hình ảnh
- Hiển thị hình ảnh đại diện cho mỗi khu vực
- Thông tin số lượng bàn và mô tả ngắn
- Nút camera để xem thêm hình ảnh
- Hover effects và selection indicators

### 2. Area Header với Banner
- Hình ảnh banner lớn cho khu vực đã chọn
- Overlay với thông tin chi tiết
- Nút "Xem thêm" để mở gallery
- Thống kê số bàn và chỗ ngồi

### 3. Image Gallery Modal
- Slideshow với nhiều hình ảnh cho mỗi khu vực
- Navigation controls (prev/next)
- Thumbnail indicators
- Thông tin chi tiết cho từng hình ảnh
- Responsive design

## Cách sử dụng

### Cho Admin (Quản lý Bàn)

1. **Truy cập trang quản lý bàn**:
   ```
   /admin/tables
   ```

2. **Chọn chế độ xem "Theo khu vực"**:
   - Click vào tab "Theo khu vực" trong view selector
   - Hệ thống sẽ hiển thị các khu vực với hình ảnh

3. **Xem hình ảnh khu vực**:
   - Click vào icon camera trên mỗi khu vực
   - Hoặc click "Xem thêm" trên header khu vực đã chọn

4. **Quản lý bàn theo khu vực**:
   - Chọn khu vực để xem danh sách bàn
   - Thực hiện các thao tác CRUD trên bàn
   - Cập nhật thông tin khu vực và vị trí bàn

### Cho Khách hàng (Đặt bàn)

1. **Truy cập trang đặt bàn**:
   ```
   /book-table
   ```

2. **Chọn bàn theo khu vực**:
   - Điền thông tin đặt bàn (bước 1)
   - Chọn bàn theo khu vực (bước 2)
   - Xem hình ảnh các khu vực để lựa chọn phù hợp

3. **Xem chi tiết khu vực**:
   - Click vào icon camera để xem gallery
   - Đọc mô tả và đặc điểm của từng khu vực
   - Chọn bàn phù hợp với nhu cầu

## Components

### 1. TablesByArea
```jsx
<TablesByArea 
  onTableSelect={handleTableSelect}
  selectedTableId={selectedTable?.MaBan}
  showReservations={true}
/>
```

**Props**:
- `onTableSelect`: Callback khi chọn bàn
- `selectedTableId`: ID bàn đang được chọn
- `showReservations`: Hiển thị thông tin đặt chỗ

### 2. AreaImageGallery
```jsx
<AreaImageGallery 
  area={selectedArea}
  isOpen={showGallery}
  onClose={closeGallery}
/>
```

**Props**:
- `area`: Tên khu vực
- `isOpen`: Trạng thái mở/đóng gallery
- `onClose`: Callback khi đóng gallery

### 3. AreaPreview
```jsx
<AreaPreview 
  area="Tầng 1"
  tableCount={8}
  totalCapacity={32}
  className="w-full"
/>
```

**Props**:
- `area`: Tên khu vực
- `tableCount`: Số lượng bàn
- `totalCapacity`: Tổng số chỗ ngồi
- `className`: CSS classes tùy chỉnh

## API Endpoints

### 1. Lấy danh sách khu vực
```
GET /api/tables/areas
```

**Response**:
```json
{
  "areas": [
    {
      "name": "Tầng 1",
      "table_count": 8
    }
  ]
}
```

### 2. Lấy bàn theo khu vực
```
GET /api/tables/areas/:area
```

**Response**:
```json
{
  "area": "Tầng 1",
  "tables": [...],
  "total_tables": 8
}
```

### 3. Lọc bàn theo khu vực
```
GET /api/tables?khu_vuc=Tầng 1
```

## Database Schema

### Bảng Ban (Tables)
```sql
ALTER TABLE Ban 
ADD COLUMN KhuVuc VARCHAR(50) DEFAULT 'Tầng 1',
ADD COLUMN ViTri VARCHAR(100);
```

### Sample Data
```sql
INSERT INTO Ban (TenBan, SoCho, TrangThai, KhuVuc, ViTri) VALUES
('T1-01', 2, 'Trống', 'Tầng 1', 'Gần cửa sổ'),
('VIP-01', 4, 'Trống', 'VIP', 'Phòng VIP 1'),
('ST-01', 2, 'Trống', 'Sân thượng', 'Góc sân thượng');
```

## Hình ảnh từ Unsplash

Hệ thống sử dụng hình ảnh chất lượng cao từ Unsplash:

- **Restaurant interiors**: Không gian nội thất nhà hàng
- **Dining areas**: Khu vực ăn uống đa dạng
- **Rooftop dining**: Nhà hàng sân thượng
- **Garden dining**: Nhà hàng sân vườn
- **VIP rooms**: Phòng VIP cao cấp

## Tối ưu hóa

### 1. Performance
- Lazy loading cho hình ảnh
- Image compression và optimization
- Caching cho API responses

### 2. UX/UI
- Smooth transitions và animations
- Responsive design cho mobile
- Loading states và error handling

### 3. Accessibility
- Alt text cho tất cả hình ảnh
- Keyboard navigation support
- Screen reader compatibility

## Troubleshooting

### 1. Hình ảnh không tải được
- Kiểm tra kết nối internet
- Fallback images được cung cấp tự động
- Error handling với placeholder images

### 2. API không phản hồi
- Kiểm tra service đang chạy
- Xem logs trong console
- Fallback data được hiển thị

### 3. Gallery không mở
- Kiểm tra state management
- Verify event handlers
- Check for JavaScript errors

## Kết luận

Tính năng quản lý bàn theo khu vực với hình ảnh cung cấp trải nghiệm trực quan và hiện đại cho cả admin và khách hàng, giúp việc quản lý và lựa chọn bàn trở nên dễ dàng và hấp dẫn hơn.
