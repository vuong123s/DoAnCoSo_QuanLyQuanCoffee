# PHÂN TÍCH CHI TIẾT HỆ THỐNG QUẢN LÝ QUÁN CÀ PHÊ

## 📋 TỔNG QUAN HỆ THỐNG

### Kiến trúc Microservices
```
Frontend (React + Vite) ←→ API Gateway (Port 3000) ←→ Microservices
                                    ├── user-service (3001)
                                    ├── menu-service (3002)  
                                    ├── table-service (3003)
                                    ├── billing-service (3004)
                                    ├── online-order-service (3005)
                                    ├── voucher-service (3006)
                                    └── inventory-service (3007)
                                            ↓
                                    MySQL Database (QuanLyCafe)
```

### Công nghệ sử dụng
- **Frontend**: React 19, Vite, TailwindCSS, Zustand, React Router DOM
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL với schema tiếng Việt
- **Authentication**: JWT tokens
- **State Management**: Zustand với persistence

---

## 👥 CHỨC NĂNG THEO VAI TRÒ

### 1. KHÁCH HÀNG (Customer Features)

#### 1.1 Đăng ký/Đăng nhập

**Quy trình đăng ký chi tiết:**

*Bước 1: Frontend Form Validation*
- Form sử dụng React Hook Form với validation rules:
  - Họ tên: Required, 2-50 ký tự, không chứa số
  - Email: Required, format email hợp lệ, unique check
  - SĐT: Required, format Việt Nam (10-11 số, bắt đầu 0)
  - Mật khẩu: Required, tối thiểu 6 ký tự, có chữ hoa, số
  - Xác nhận mật khẩu: Required, phải trùng với mật khẩu
- Real-time validation với debounce 300ms
- Hiển thị lỗi ngay dưới từng field

*Bước 2: API Call Registration*
- Frontend gửi POST `/api/auth/register` với dữ liệu:
```javascript
{
  HoTen: "Nguyễn Văn A",
  Email: "user@example.com", 
  SDT: "0123456789",
  MatKhau: "hashedPassword",
  DiaChi: "123 Đường ABC, Quận 1, TP.HCM"
}
```

*Bước 3: Backend Processing*
- API Gateway forward đến User Service (port 3001)
- Kiểm tra email đã tồn tại: `SELECT * FROM KhachHang WHERE Email = ?`
- Hash password với bcrypt (salt rounds: 12)
- Tạo record mới trong bảng KhachHang:
```sql
INSERT INTO KhachHang (HoTen, Email, SDT, MatKhau, DiaChi, NgayDangKy, TrangThai, DiemTichLuy)
VALUES (?, ?, ?, ?, ?, NOW(), 'Hoạt động', 0)
```

*Bước 4: Response & Auto Login*
- Tạo JWT token với payload: `{MaKH, Email, HoTen, role: 'Khách hàng'}`
- Trả về: `{success: true, user: userData, token: jwtToken}`
- Frontend tự động login và redirect đến trang chủ

**Quy trình đăng nhập chi tiết:**

*Bước 1: Form Input & Validation*
- Hỗ trợ đăng nhập bằng Email hoặc SĐT
- Validation: Required fields, format check
- Show/hide password toggle
- Remember me checkbox (extend token expiry)

*Bước 2: Authentication Request*
- POST `/api/auth/login` với payload:
```javascript
{
  loginField: "user@example.com", // Email hoặc SĐT
  MatKhau: "userPassword"
}
```

*Bước 3: Backend Verification*
- Tìm user: `SELECT * FROM KhachHang WHERE Email = ? OR SDT = ?`
- Kiểm tra trạng thái tài khoản (TrangThai = 'Hoạt động')
- Verify password: `bcrypt.compare(inputPassword, hashedPassword)`
- Cập nhật thời gian đăng nhập cuối

*Bước 4: Token Generation & Response*
- Tạo JWT token (24h hoặc 7 ngày nếu remember me)
- Payload: `{MaKH, Email, HoTen, SDT, DiemTichLuy, role: 'Khách hàng'}`
- Response: `{success: true, user: cleanUserData, token: jwtToken}`

*Bước 5: Frontend State Management*
- Lưu token vào Zustand store với persistence
- Set axios default Authorization header
- Redirect theo role hoặc returnUrl
- Hiển thị welcome toast với tên user
**Database Tables:**
```sql
KhachHang: MaKH, HoTen, Email, SDT, MatKhau, DiaChi, NgayDangKy, TrangThai, DiemTichLuy
```

#### 1.2 Xem, tìm kiếm, lọc menu và danh mục

**Quy trình hiển thị menu chi tiết:**

*Bước 1: Load Categories & Menu Items*
- API call song song: `GET /api/categories` và `GET /api/menu/items?status=Còn bán`
- Categories response: `{categories: [{MaLoai, TenLoai, HinhAnh, SoLuongMon}]}`
- Menu items response: `{menu_items: [{MaMon, TenMon, DonGia, HinhAnh, MoTa, MaLoai, TrangThai}]}`
- Frontend group items theo MaLoai để hiển thị theo category

*Bước 2: UI Rendering*
- Category tabs với số lượng món: "Cà phê (15)", "Trà (8)", "Bánh ngọt (12)"
- Grid layout responsive: 2 cột (mobile), 3 cột (tablet), 4 cột (desktop)
- Mỗi card món hiển thị:
  - Hình ảnh với lazy loading và placeholder
  - Tên món (TenMon) với ellipsis nếu quá dài
  - Giá (DonGia) format VND: "45,000 ₫"
  - Mô tả ngắn (MoTa) tối đa 2 dòng
  - Nút "Thêm vào giỏ" với icon

*Bước 3: Performance Optimization*
- Image lazy loading với Intersection Observer
- Virtual scrolling cho danh sách dài (>100 items)
- Caching API response trong 5 phút
- Skeleton loading khi fetch data

**Tìm kiếm và lọc chi tiết:**

*Search Functionality:*
- Input với debounce 500ms để tránh spam API
- Search trong TenMon và MoTa với LIKE query
- Highlight từ khóa trong kết quả
- Clear search button và search history (localStorage)
- API: `GET /api/menu/items?search=cà phê&limit=20&offset=0`

*Category Filter:*
- Tab navigation với active state
- "Tất cả" tab hiển thị toàn bộ menu
- Click category → filter items theo MaLoai
- URL update: `/menu?category=ca-phe` cho bookmarkable
- Badge hiển thị số lượng món trong category

*Price Range Filter:*
- Dual range slider với min/max values
- Real-time update khi drag slider
- Display current range: "50,000 ₫ - 200,000 ₫"
- API: `GET /api/menu/items?minPrice=50000&maxPrice=200000`

*Sort Options:*
- Dropdown với options:
  - "Mặc định" (theo thứ tự MaMon)
  - "Giá: Thấp → Cao" (ORDER BY DonGia ASC)
  - "Giá: Cao → Thấp" (ORDER BY DonGia DESC)  
  - "Tên: A → Z" (ORDER BY TenMon ASC)
  - "Mới nhất" (ORDER BY NgayTao DESC)

*Advanced Filters:*
- Availability filter: "Còn bán", "Hết hàng", "Tất cả"
- Rating filter (nếu có review system)
- Dietary filters: "Chay", "Không đường", "Không caffeine"

**Frontend Implementation chi tiết:**

*State Management với Zustand:*
```javascript
const useMenuStore = create((set, get) => ({
  categories: [],
  menuItems: [],
  filteredItems: [],
  filters: {
    category: 'all',
    search: '',
    priceRange: [0, 500000],
    sortBy: 'default',
    availability: 'available'
  },
  
  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ filters });
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { menuItems, filters } = get();
    let filtered = [...menuItems];
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.MaLoai === filters.category);
    }
    
    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(item => 
        item.TenMon.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.MoTa?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(item => 
      item.DonGia >= filters.priceRange[0] && 
      item.DonGia <= filters.priceRange[1]
    );
    
    // Apply sort
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.DonGia - b.DonGia);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.DonGia - a.DonGia);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.TenMon.localeCompare(b.TenMon, 'vi'));
        break;
    }
    
    set({ filteredItems: filtered });
  }
}));
```

*URL Sync & Bookmarking:*
- Sync filters với URL params: `/menu?category=ca-phe&search=latte&sort=price-asc`
- Browser back/forward support
- Shareable URLs cho specific filter combinations
- SEO-friendly URLs với category slugs

#### 1.3 Đặt bàn

**Quy trình đặt bàn chi tiết:**

*Bước 1: Chọn thời gian và số người*
- Date picker với disabled dates (quá khứ, ngày nghỉ)
- Time slots hiển thị theo business hours: 6:00 - 22:00
- Mỗi slot 30 phút: 6:00, 6:30, 7:00, ..., 21:30
- Số người dropdown: 1-20 người với validation
- Real-time check availability khi thay đổi thời gian

*Bước 2: Load Available Tables*
- API call: `GET /api/tables/available?date=2024-01-15&time=19:00&guests=4`
- Backend query kiểm tra:
  ```sql
  SELECT b.* FROM Ban b 
  WHERE b.SoCho >= ? 
  AND b.TrangThai = 'Trống'
  AND b.MaBan NOT IN (
    SELECT db.MaBan FROM DatBan db 
    WHERE db.NgayDat = ? 
    AND db.TrangThai IN ('Đã đặt', 'Đã xác nhận')
    AND (
      (db.GioDat <= ? AND db.GioKetThuc > ?) OR
      (db.GioDat < ? AND db.GioKetThuc >= ?)
    )
  )
  ```

*Bước 3: Table Selection Interface*
- Visual layout theo khu vực: Tầng 1, Tầng 2, VIP, Sân thượng
- Mỗi bàn hiển thị:
  - Tên bàn (TenBan): "Bàn 01", "VIP-01"
  - Số chỗ (SoCho): "4 chỗ", "8 chỗ"
  - Vị trí (ViTri): "Gần cửa sổ", "Góc yên tĩnh"
  - Status color: Xanh (available), Xám (unavailable)
- Auto suggest bàn phù hợp nhất (đủ chỗ, ít thừa nhất)

*Bước 4: Customer Information Form*
- Form fields với validation:
  - Tên khách: Required, 2-50 ký tự
  - SĐT: Required, format VN (10-11 số)
  - Email: Optional, format email
  - Ghi chú: Optional, max 500 ký tự
- Auto-fill nếu user đã đăng nhập (từ token)

*Bước 5: Conflict Check & Confirmation*
- Final conflict check trước khi submit:
  ```javascript
  const conflictCheck = await reservationAPI.checkTimeConflict({
    MaBan: selectedTable.MaBan,
    NgayDat: selectedDate,
    GioDat: selectedTime,
    GioKetThuc: calculateEndTime(selectedTime, 120)
  });
  ```
- Hiển thị summary: Bàn, Thời gian, Số người, Thông tin khách
- Submit tạo reservation

*Bước 6: Reservation Creation*
- API: `POST /api/reservations` với payload:
  ```javascript
  {
    MaKH: user?.MaKH || null, // null nếu guest
    TenKhach: "Nguyễn Văn A",
    SDT: "0123456789",
    Email: "user@example.com",
    MaBan: 5,
    NgayDat: "2024-01-15",
    GioDat: "19:00:00",
    GioKetThuc: "21:00:00",
    SoNguoi: 4,
    TrangThai: "Đã đặt",
    GhiChu: "Sinh nhật, cần bánh kem"
  }
  ```

**Business Logic chi tiết:**

*Time Conflict Detection:*
- Kiểm tra overlap với reservations hiện có
- Buffer time 15 phút giữa các booking
- Xử lý edge cases: booking đúng giờ bắt đầu/kết thúc

*Table Recommendation Algorithm:*
```javascript
const recommendTables = (availableTables, guestCount) => {
  return availableTables
    .filter(table => table.SoCho >= guestCount)
    .sort((a, b) => {
      // Ưu tiên bàn vừa đủ chỗ
      const wasteA = a.SoCho - guestCount;
      const wasteB = b.SoCho - guestCount;
      if (wasteA !== wasteB) return wasteA - wasteB;
      
      // Ưu tiên khu vực VIP cho nhóm lớn
      if (guestCount >= 6) {
        if (a.MaKhuVuc === 'VIP' && b.MaKhuVuc !== 'VIP') return -1;
        if (b.MaKhuVuc === 'VIP' && a.MaKhuVuc !== 'VIP') return 1;
      }
      
      return a.MaBan - b.MaBan; // Fallback: theo số bàn
    });
};
```

*Validation Rules:*
- Thời gian đặt: Tối thiểu 30 phút từ hiện tại
- Thời gian tối đa: 14 ngày trước
- Giờ hoạt động: 6:00 - 22:00 (configurable)
- Thời gian giữ bàn: 2 tiếng (có thể extend)
- Số người: 1-20 (có thể book nhiều bàn cho nhóm lớn)

**Database Tables:**
```sql
DatBan: MaDat, MaKH, TenKhach, SDT, Email, MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi, TrangThai, GhiChu
Ban: MaBan, TenBan, SoCho, MaKhuVuc, TrangThai
```

#### 1.4 Đặt món online

**Shopping Cart Flow:**
1. **Add to Cart**: Click món → chọn size/options → add vào cart
2. **Cart Management**: View cart, update quantity, remove items
3. **Checkout**: Chọn loại đơn (Pickup/Delivery), nhập thông tin
4. **Payment**: Chọn phương thức thanh toán (COD/Online)
5. **Confirmation**: Nhận order ID và estimated time

**Cart State Management:**
- Zustand store cho cart persistence
- LocalStorage backup để không mất cart khi reload
- Real-time price calculation với voucher/discount
- Minimum order validation

**Database Tables:**
```sql
GioHang: MaGH, MaKH, MaMon, SoLuong, NgayThem, GhiChu
DonHangOnline: MaDHOnline, MaKH, LoaiDonHang, TongTien, TrangThai, DiaChiGiaoHang, SDTKhach
CTDonHangOnline: MaDHOnline, MaMon, SoLuong, DonGia, ThanhTien, GhiChu
```

#### 1.5 Theo dõi và xem lịch sử đơn hàng

**Order Tracking:**
- Real-time status updates: Đã nhận → Đang chuẩn bị → Sẵn sàng → Hoàn thành
- Estimated completion time với countdown timer
- Push notifications cho status changes (nếu có mobile app)
- Order details: items, quantities, prices, special requests

**Order History:**
- Paginated list của tất cả đơn hàng trước đó
- Filter theo: Date range, Order type (Dine-in/Pickup/Delivery), Status
- Quick reorder functionality
- Export order history (PDF/Excel)

**Database Tables:**
```sql
TheoDoiDonHang: MaTheoDoi, MaDHOnline, TrangThai, ThoiGian, GhiChu
```

#### 1.6 Tích và sử dụng điểm

**Loyalty Points System:**
- Tích điểm: 1% giá trị đơn hàng = 1 điểm
- Sử dụng điểm: 100 điểm = 10,000 VND discount
- Bonus points cho special events, birthdays
- Points expiry: 12 tháng từ ngày tích

**Points Management:**
- Hiển thị current balance trên profile
- Points history với transaction details
- Available rewards/vouchers có thể đổi
- Tier system: Bronze/Silver/Gold với benefits khác nhau

**Database Tables:**
```sql
DiemTichLuy: MaDiem, MaKH, LoaiGiaoDich, SoDiem, NgayGiaoDich, MoTa, SoDuSauGD
TierKhachHang: MaTier, TenTier, DiemToiThieu, PhanTramTichDiem, UuDai
```

---

### 2. NHÂN VIÊN (Staff Features)

#### 2.1 POS bán hàng: chọn món, tính tiền, in hóa đơn

**POS Interface Layout chi tiết:**

*Left Panel - Table Management (30%):*
- Grid layout hiển thị tất cả bàn theo khu vực
- Color-coded status:
  - 🟢 Xanh lá: "Trống" (available)
  - 🟡 Vàng: "Đã đặt" (reserved)
  - 🔴 Đỏ: "Đang phục vụ" (occupied)
  - ⚫ Xám: "Bảo trì" (maintenance)
- Hiển thị thông tin bàn: Tên bàn, Số chỗ, Thời gian occupied
- Quick actions: Chuyển bàn, Gộp bàn, Tách bill

*Center Panel - Menu Selection (45%):*
- Category tabs: Cà phê, Trà, Bánh ngọt, Món chính, v.v.
- Grid layout món ăn với:
  - Hình ảnh món (lazy loading)
  - Tên món và giá
  - Stock status (còn/hết)
  - Quick add button
- Search bar với autocomplete
- Popular items section (top 10)

*Right Panel - Order Management (25%):*
- Current order details:
  - Thông tin bàn và nhân viên
  - Danh sách món đã order
  - Quantity controls (+/-)
  - Special notes per item
  - Subtotal, tax, service charge
  - Total amount
- Payment section
- Action buttons: Save, Print, Cancel

**Order Creation Flow chi tiết:**

*Bước 1: Table Selection & Order Initialization*
- Click bàn "Trống" → hiển thị confirmation dialog
- Tạo đơn hàng mới:
  ```javascript
  const newOrder = {
    MaBan: selectedTable.MaBan,
    MaNV: currentStaff.MaNV,
    NgayLap: new Date(),
    TrangThai: 'Đang xử lý',
    TongTien: 0,
    items: []
  };
  ```
- Update table status → "Đang phục vụ"
- Load menu items cho center panel

*Bước 2: Menu Item Selection*
- Click món → hiển thị item details modal:
  - Tên món, giá, mô tả
  - Size options (nếu có): S, M, L
  - Customization options: Đường, đá, sữa
  - Special notes input
  - Quantity selector
- Confirm add → thêm vào order:
  ```javascript
  const orderItem = {
    MaMon: item.MaMon,
    TenMon: item.TenMon,
    SoLuong: quantity,
    DonGia: item.DonGia,
    ThanhTien: quantity * item.DonGia,
    GhiChu: customNotes,
    TrangThaiMon: 'Chờ xử lý'
  };
  ```

*Bước 3: Order Modification*
- Update quantity: Click +/- buttons
- Remove item: Swipe left hoặc delete button
- Add notes: Click item → edit notes
- Real-time total calculation:
  ```javascript
  const calculateTotal = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.ThanhTien, 0);
    const tax = subtotal * 0.1; // 10% VAT
    const serviceCharge = subtotal * 0.05; // 5% service
    return subtotal + tax + serviceCharge;
  };
  ```

*Bước 4: Payment Processing*
- Payment method selection:
  - Tiền mặt (Cash)
  - Thẻ (Card)
  - Chuyển khoản (Transfer)
  - Ví điện tử (E-wallet)
- Cash payment flow:
  - Input số tiền nhận
  - Auto calculate tiền thừa
  - Validation: tiền nhận >= total
- Card/Transfer flow:
  - Integration với POS terminal
  - Transaction confirmation
  - Receipt generation

*Bước 5: Order Completion*
- Save order to database:
  ```sql
  INSERT INTO DonHang (MaBan, MaNV, NgayLap, TongTien, TrangThai, PhuongThucThanhToan)
  VALUES (?, ?, NOW(), ?, 'Hoàn thành', ?);
  
  INSERT INTO CTDonHang (MaDH, MaMon, SoLuong, DonGia, ThanhTien, GhiChu)
  VALUES (?, ?, ?, ?, ?, ?);
  ```
- Print receipt (thermal printer)
- Update table status → "Trống"
- Send kitchen order (nếu có món cần chế biến)

**Advanced POS Features:**

*Multi-table Management:*
- Gộp bàn: Merge multiple tables into one order
- Tách bill: Split order items across multiple payments
- Chuyển bàn: Move order from one table to another
- Hold order: Temporarily save order without payment

*Staff Workflow:*
- Staff login với PIN hoặc card
- Order tracking per staff member
- Commission calculation
- Shift handover reports

*Kitchen Integration:*
- Send order to kitchen display system
- Track cooking status per item
- Notify when items ready
- Manage preparation queue

*Inventory Integration:*
- Real-time stock checking
- Auto-deduct ingredients when order confirmed
- Low stock alerts
- Prevent ordering out-of-stock items

**Keyboard Shortcuts chi tiết:**
- `Ctrl+N`: New order (tạo đơn mới)
- `Ctrl+S`: Save order (lưu đơn)
- `Ctrl+P`: Process payment (thanh toán)
- `Ctrl+D`: Delete selected item (xóa món)
- `F1-F12`: Quick add popular items (thêm nhanh món phổ biến)
- `Enter`: Confirm action (xác nhận)
- `Esc`: Cancel/Back (hủy/quay lại)
- `Ctrl+F`: Focus search (tìm kiếm)
- `Ctrl+T`: Switch table (chuyển bàn)
- `Ctrl+H`: Hold order (giữ đơn)

**Database Tables:**
```sql
DonHang: MaDH, MaBan, MaNV, NgayLap, TongTien, TrangThai, PhuongThucThanhToan
CTDonHang: MaDH, MaMon, SoLuong, DonGia, ThanhTien, GhiChu
```

#### 2.2 Quản lý đơn online và đặt bàn

**Online Order Management:**
- Dashboard hiển thị tất cả đơn online theo thời gian thực
- Filter theo: Status, Order type, Time range
- Update status: Nhận đơn → Chuẩn bị → Sẵn sàng → Hoàn thành
- Print kitchen tickets cho từng món
- Customer notification khi status change

**Reservation Management:**
- Calendar view của tất cả reservations
- Drag & drop để reschedule reservations
- Check-in customers khi họ arrive
- No-show tracking và blacklist management
- SMS/Email reminders trước giờ đặt

**Workflow Integration:**
- Seamless chuyển từ reservation sang dine-in order
- Table assignment optimization
- Waitlist management khi full capacity

#### 2.3 Cập nhật trạng thái bàn

**Table Status Management:**
- **Trống**: Available for new customers
- **Đã đặt**: Reserved với thời gian cụ thể  
- **Đang phục vụ**: Currently occupied
- **Cần dọn**: Needs cleaning after customers leave
- **Bảo trì**: Out of service

**Real-time Updates:**
- Click bàn → dropdown menu với status options
- Auto status change khi tạo/hoàn thành đơn hàng
- Visual indicators: colors, icons, timers
- Table turnover tracking cho performance metrics

**Business Rules:**
- Không thể delete bàn đang có đơn hàng active
- Auto reset về "Trống" sau khi thanh toán
- Alert khi bàn occupied quá lâu (>3 hours)

---

### 3. QUẢN LÝ (Manager Features)

#### 3.1 Dashboard: thống kê doanh thu, đơn hàng, khách hàng

**Revenue Analytics:**
- **Daily/Weekly/Monthly revenue** với line charts
- **Revenue by payment method**: Cash vs Card vs Online
- **Revenue by order type**: Dine-in vs Pickup vs Delivery
- **Average order value** trends
- **Peak hours analysis** với heatmap

**Order Statistics:**
- **Total orders** với growth percentage
- **Order status breakdown**: Completed vs Cancelled vs Pending
- **Order fulfillment time** averages
- **Popular time slots** cho optimization

**Customer Analytics:**
- **New vs Returning customers** ratio
- **Customer lifetime value** calculations
- **Top customers** by spending
- **Customer acquisition** trends
- **Loyalty program** participation rates

**Dashboard Components:**
```javascript
// Key metrics cards
- Today's Revenue: 2,500,000 VND (+15% vs yesterday)
- Orders Today: 45 (+8% vs yesterday)  
- Active Customers: 1,234 (+5% vs last month)
- Average Order: 125,000 VND (+3% vs last week)

// Charts
- Revenue trend (last 30 days)
- Top selling items (pie chart)
- Order volume by hour (bar chart)
- Customer growth (line chart)
```

#### 3.2 Quản lý menu, nhân viên, kho

**Menu Management:**
- **CRUD operations**: Create, Read, Update, Delete menu items
- **Category management**: Organize items into categories
- **Pricing management**: Bulk price updates, seasonal pricing
- **Availability control**: Mark items as available/unavailable
- **Image management**: Upload, crop, optimize images
- **Recipe management**: Ingredients, preparation instructions

**Staff Management:**
- **Employee profiles**: Personal info, contact, role, salary
- **Shift scheduling**: Weekly schedules, time tracking
- **Performance tracking**: Sales per staff, customer feedback
- **Access control**: Role-based permissions
- **Payroll integration**: Hours worked, commission calculation

**Inventory Management:**
- **Stock levels**: Current quantities, low stock alerts
- **Supplier management**: Vendor info, purchase orders
- **Cost tracking**: COGS, profit margins per item
- **Expiry management**: FIFO, waste reduction
- **Auto-reorder**: Automatic purchase orders when low stock

**Database Tables:**
```sql
NhanVien: MaNV, HoTen, ChucVu, Email, SDT, Luong, NgayVaoLam, TrangThai
CaLam: MaCa, MaNV, NgayLam, GioBatDau, GioKetThuc, SoGioLam
Kho: MaNL, TenNL, SoLuong, DonVi, DonGiaNhap, NgayNhap, NgayHetHan, MucCanhBao
```

#### 3.3 Báo cáo doanh thu, món bán chạy

**Revenue Reports:**
- **Daily sales report**: Revenue, orders, average ticket
- **Monthly P&L**: Revenue, COGS, expenses, profit
- **Year-over-year comparison**: Growth trends, seasonality
- **Payment method analysis**: Cash flow, transaction fees
- **Tax reports**: VAT calculations, government compliance

**Product Performance:**
- **Best sellers**: Top items by quantity và revenue
- **Slow movers**: Items cần promotion hoặc discontinue
- **Profit margin analysis**: Most profitable items
- **Category performance**: Which categories drive revenue
- **Seasonal trends**: Menu items performance by season

**Export Options:**
- **PDF reports**: Professional formatting cho presentations
- **Excel exports**: Raw data cho further analysis
- **Email scheduling**: Auto-send daily/weekly reports
- **Dashboard widgets**: Real-time metrics display

**Report Filters:**
- Date range selection
- Staff member performance
- Location comparison (nếu multi-store)
- Customer segment analysis
- Product category breakdown

---

## 🔧 TECHNICAL IMPLEMENTATION

### Database Schema Overview
```sql
-- Core Tables
KhachHang: Customer information và loyalty points
NhanVien: Staff profiles và access control
Mon: Menu items với pricing và availability
Ban: Table layout và current status
DonHang: Dine-in orders với payment info
DonHangOnline: Online orders với delivery info
GioHang: Shopping cart persistence
DatBan: Table reservations với time slots

-- Supporting Tables  
LoaiMon: Menu categories
KhuVuc: Dining areas/zones
Voucher: Discount codes và promotions
Kho: Inventory tracking
DiemTichLuy: Loyalty points transactions
TheoDoiDonHang: Order status history
```

### API Endpoints Structure
```
/api/auth/* - Authentication & authorization
/api/menu/* - Menu items và categories  
/api/tables/* - Table management
/api/orders/* - Order processing
/api/customers/* - Customer management
/api/staff/* - Staff operations
/api/inventory/* - Stock management
/api/reports/* - Analytics và reporting
```

### Frontend Route Structure
```
/login - Customer/Staff login
/register - Customer registration
/menu - Public menu browsing
/cart - Shopping cart
/checkout - Order placement
/profile - Customer profile & history
/pos - Staff POS system
/admin/dashboard - Manager dashboard
/admin/menu - Menu management
/admin/staff - Staff management
/admin/inventory - Inventory control
/admin/reports - Analytics & reports
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Core Customer Features (Week 1-2)
1. Authentication system (login/register)
2. Menu browsing với search/filter
3. Shopping cart functionality
4. Basic order placement

### Phase 2: Staff Operations (Week 3-4)  
1. POS system interface
2. Table management
3. Order status updates
4. Basic reporting

### Phase 3: Management Features (Week 5-6)
1. Dashboard analytics
2. Menu management
3. Staff management  
4. Advanced reporting

### Phase 4: Advanced Features (Week 7-8)
1. Loyalty points system
2. Real-time notifications
3. Advanced analytics
4. Mobile optimization

---

## 📊 SUCCESS METRICS

### Business Metrics
- **Order completion rate**: >95%
- **Average order value**: Increase 15%
- **Customer retention**: >60% return rate
- **Staff efficiency**: Reduce order time 20%

### Technical Metrics  
- **Page load time**: <2 seconds
- **API response time**: <500ms
- **Uptime**: >99.5%
- **Error rate**: <1%

### User Experience
- **Customer satisfaction**: >4.5/5 rating
- **Staff adoption**: >90% usage rate
- **Order accuracy**: >98%
- **Payment success**: >99%

---

Hệ thống này được thiết kế để đáp ứng đầy đủ nhu cầu của một quán cà phê hiện đại với workflow tối ưu cho từng vai trò người dùng.