# Hệ thống Phân quyền (Role-Based Access Control)

## Tổng quan

Hệ thống Coffee Shop sử dụng phân quyền dựa trên vai trò (RBAC) để kiểm soát quyền truy cập vào các tính năng và trang quản trị.

## Các vai trò trong hệ thống

### 1. **Admin** (Quản trị viên)
- Quyền cao nhất trong hệ thống
- Truy cập tất cả các tính năng
- Quản lý nhân viên và người dùng
- Xem tất cả báo cáo và phân tích

### 2. **Quản lý** (Manager)
- Quản lý hoạt động hàng ngày
- Quản lý menu, bàn ăn, kho
- Xem báo cáo và phân tích
- Quản lý lịch làm việc
- **Không thể** quản lý tài khoản nhân viên

### 3. **Nhân viên** (Staff)
- Phục vụ khách hàng
- Quản lý đặt bàn
- Xử lý đơn hàng
- Sử dụng POS/bán hàng
- **Không thể** thay đổi cấu hình hệ thống

### 4. **Khách hàng** (Customer)
- Đặt bàn online
- Đặt món ăn online
- Xem lịch sử đơn hàng
- Quản lý thông tin cá nhân

## Phân quyền theo tính năng

| Tính năng | Admin | Quản lý | Nhân viên | Khách hàng |
|-----------|-------|---------|-----------|------------|
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Quản lý Menu | ✅ | ✅ | ❌ | ❌ |
| Quản lý Bàn | ✅ | ✅ | ❌ | ❌ |
| Đặt bàn | ✅ | ✅ | ✅ | ✅ (công khai) |
| Đơn hàng | ✅ | ✅ | ✅ | ❌ |
| POS/Bán hàng | ✅ | ✅ | ✅ | ❌ |
| Quản lý Kho | ✅ | ✅ | ❌ | ❌ |
| Quản lý Nhân viên | ✅ | ❌ | ❌ | ❌ |
| Lịch làm việc | ✅ | ✅ | ✅ (xem) | ❌ |
| Báo cáo & Phân tích | ✅ | ✅ | ❌ | ❌ |

## Cách sử dụng

### 1. Bảo vệ Route (trong App.jsx)

```jsx
import ProtectedRoute from './components/common/ui/ProtectedRoute';

// Yêu cầu đăng nhập
<Route path="/profile" element={
  <ProtectedRoute requireAuth={true}>
    <Profile />
  </ProtectedRoute>
} />

// Yêu cầu vai trò cụ thể
<Route path="/admin/users" element={
  <ProtectedRoute 
    requireAuth={true} 
    allowedRoles={['Admin', 'admin']}
  >
    <UserManagement />
  </ProtectedRoute>
} />

// Nhiều vai trò được phép
<Route path="/admin/menu" element={
  <ProtectedRoute 
    allowedRoles={['Admin', 'Quản lý', 'admin', 'manager']}
  >
    <MenuManagement />
  </ProtectedRoute>
} />
```

### 2. Bảo vệ UI Component (RoleGuard)

```jsx
import RoleGuard from './components/common/ui/RoleGuard';

// Hiển thị cho admin only
<RoleGuard requireAdmin={true}>
  <DeleteButton />
</RoleGuard>

// Hiển thị cho manager trở lên
<RoleGuard requireManager={true}>
  <EditMenuButton />
</RoleGuard>

// Kiểm tra quyền cụ thể
<RoleGuard permission="MANAGE_USERS">
  <UserManagementSection />
</RoleGuard>

// Hiển thị cho nhiều vai trò
<RoleGuard allowedRoles={['Admin', 'Quản lý']}>
  <AdminPanel />
</RoleGuard>

// Hiển thị fallback nếu không có quyền
<RoleGuard 
  requireAdmin={true}
  fallback={<p>Bạn không có quyền truy cập</p>}
>
  <AdminSettings />
</RoleGuard>

// Đảo ngược logic (hiển thị khi KHÔNG có quyền)
<RoleGuard requireAdmin={true} invert={true}>
  <LimitedFeatureMessage />
</RoleGuard>
```

### 3. Kiểm tra trong Code (useAuthStore)

```jsx
import { useAuthStore } from './app/stores/authStore';

function MyComponent() {
  const { isAdmin, isManager, isStaff, hasRole, hasPermission } = useAuthStore();

  // Kiểm tra vai trò
  if (isAdmin()) {
    // Chỉ admin mới thấy
  }

  if (isManager()) {
    // Manager và Admin thấy
  }

  if (isStaff()) {
    // Staff, Manager và Admin thấy
  }

  // Kiểm tra vai trò cụ thể
  if (hasRole(['Admin', 'Quản lý'])) {
    // Logic code
  }

  // Kiểm tra quyền
  if (hasPermission('MANAGE_USERS')) {
    // Logic code
  }

  return <div>...</div>;
}
```

### 4. Sử dụng Utilities trực tiếp

```jsx
import { 
  hasRole, 
  hasPermission, 
  isAdmin, 
  isManager, 
  isStaff,
  getRoleDisplayName,
  getRoleBadgeColor 
} from './shared/utils/roles';

// Kiểm tra vai trò
const userRole = user.ChucVu;
if (isAdmin(userRole)) {
  // Admin logic
}

// Hiển thị tên vai trò
const roleName = getRoleDisplayName(userRole); // "Admin", "Quản lý", etc.

// Lấy màu badge
const colors = getRoleBadgeColor(userRole);
// { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
```

## Danh sách Permissions

Các permission được định nghĩa trong `shared/utils/roles.js`:

```javascript
PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Menu Management
  MANAGE_MENU: ['Admin', 'Quản lý'],
  VIEW_MENU: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Table Management
  MANAGE_TABLES: ['Admin', 'Quản lý'],
  VIEW_TABLES: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Reservations
  MANAGE_RESERVATIONS: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Orders
  MANAGE_ORDERS: ['Admin', 'Quản lý', 'Nhân viên'],
  VIEW_ALL_ORDERS: ['Admin', 'Quản lý'],
  
  // POS/Sales
  USE_POS: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Users
  MANAGE_USERS: ['Admin'],
  VIEW_USERS: ['Admin', 'Quản lý'],
  
  // Inventory
  MANAGE_INVENTORY: ['Admin', 'Quản lý'],
  VIEW_INVENTORY: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Schedules
  MANAGE_SCHEDULES: ['Admin', 'Quản lý'],
  VIEW_SCHEDULES: ['Admin', 'Quản lý', 'Nhân viên'],
  
  // Analytics
  VIEW_ANALYTICS: ['Admin', 'Quản lý'],
  
  // Online Orders
  MANAGE_ONLINE_ORDERS: ['Admin', 'Quản lý', 'Nhân viên'],
}
```

## Tương thích Schema

Hệ thống hỗ trợ cả tên vai trò tiếng Việt và tiếng Anh:

**Tiếng Việt (từ database):**
- `Admin`
- `Quản lý`
- `Nhân viên`
- `Khách hàng`

**Tiếng Anh (để tương thích):**
- `admin`
- `manager`
- `staff`
- `customer`

Hệ thống tự động chuẩn hóa và so sánh vai trò, bạn có thể sử dụng cả hai định dạng.

## Cấu trúc Files

```
front-end/
├── src/
│   ├── shared/
│   │   └── utils/
│   │       └── roles.js              # Role utilities và constants
│   ├── components/
│   │   └── common/
│   │       └── ui/
│   │           ├── ProtectedRoute.jsx # Route protection
│   │           └── RoleGuard.jsx      # UI component protection
│   ├── app/
│   │   ├── App.jsx                   # Route definitions với phân quyền
│   │   └── stores/
│   │       └── authStore.js          # Auth state với role methods
│   └── layouts/
│       └── AdminLayout.jsx           # Menu filtering theo role
```

## Luồng xác thực

1. User đăng nhập → Token & user data lưu vào authStore
2. authStore lưu thông tin user (bao gồm ChucVu/role)
3. ProtectedRoute kiểm tra authentication và role khi navigate
4. AdminLayout filter menu items dựa trên permissions
5. RoleGuard ẩn/hiện UI elements dựa trên role
6. Components có thể kiểm tra role/permission bất kỳ lúc nào

## Ví dụ thực tế

### Ví dụ 1: Trang quản lý nhân viên (chỉ Admin)

```jsx
// App.jsx
<Route path="/admin/users" element={
  <ProtectedRoute 
    requireAuth={true} 
    allowedRoles={['Admin', 'admin']}
  >
    <UserManagement />
  </ProtectedRoute>
} />

// UserManagement.jsx
function UserManagement() {
  const { isAdmin } = useAuthStore();

  return (
    <div>
      <h1>Quản lý nhân viên</h1>
      
      <RoleGuard requireAdmin={true}>
        <button>Thêm nhân viên mới</button>
        <button>Xóa nhân viên</button>
      </RoleGuard>
    </div>
  );
}
```

### Ví dụ 2: Trang menu (Admin + Manager)

```jsx
// App.jsx
<Route path="/admin/menu" element={
  <ProtectedRoute 
    allowedRoles={['Admin', 'Quản lý', 'admin', 'manager']}
  >
    <MenuManagement />
  </ProtectedRoute>
} />

// MenuManagement.jsx
function MenuManagement() {
  const { hasPermission } = useAuthStore();

  return (
    <div>
      <h1>Quản lý Menu</h1>
      
      <RoleGuard permission="MANAGE_MENU">
        <button>Thêm món mới</button>
        <button>Xóa món</button>
      </RoleGuard>
      
      <RoleGuard permission="VIEW_MENU">
        <MenuList />
      </RoleGuard>
    </div>
  );
}
```

### Ví dụ 3: Hiển thị khác nhau theo role

```jsx
function Dashboard() {
  const { user, isAdmin, isManager, isStaff } = useAuthStore();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Admin thấy tất cả */}
      <RoleGuard requireAdmin={true}>
        <AdminDashboard />
      </RoleGuard>
      
      {/* Manager thấy dashboard của mình */}
      <RoleGuard requireManager={true} invert={isAdmin()}>
        <ManagerDashboard />
      </RoleGuard>
      
      {/* Staff thấy dashboard cơ bản */}
      <RoleGuard requireStaff={true} invert={isAdmin() || isManager()}>
        <StaffDashboard />
      </RoleGuard>
    </div>
  );
}
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: Phân quyền frontend chỉ để cải thiện UX và ẩn/hiện UI. 

**PHẢI luôn kiểm tra quyền ở Backend/API Gateway** để đảm bảo bảo mật thực sự!

Frontend role checking:
- ✅ Ẩn/hiện menu items
- ✅ Disable buttons
- ✅ Redirect đến trang lỗi 403
- ✅ Cải thiện trải nghiệm người dùng

Backend role checking (BẮT BUỘC):
- ✅ Validate JWT token
- ✅ Kiểm tra role trong database
- ✅ Từ chối requests không hợp lệ
- ✅ Bảo vệ dữ liệu thực sự

## Testing

Để test phân quyền:

1. Tạo user với các role khác nhau trong database
2. Đăng nhập với từng user
3. Kiểm tra menu items hiển thị đúng
4. Thử truy cập routes không có quyền (phải thấy 403)
5. Kiểm tra UI elements ẩn/hiện đúng

## Troubleshooting

### Vấn đề: Menu không hiển thị
- Kiểm tra user có ChucVu/role trong database
- Kiểm tra permission mapping trong `roles.js`
- Console.log `userRole` để debug

### Vấn đề: Luôn redirect về login
- Kiểm tra token trong localStorage
- Kiểm tra authStore.isAuthenticated
- Kiểm tra user object có đủ thông tin

### Vấn đề: Role không khớp
- Kiểm tra database lưu "Admin" hay "admin"
- Sử dụng `normalizeRole()` để chuẩn hóa
- Đảm bảo allowedRoles bao gồm cả 2 format

## Tài liệu tham khảo

- `front-end/src/shared/utils/roles.js` - Role utilities
- `front-end/src/components/common/ui/ProtectedRoute.jsx` - Route protection
- `front-end/src/components/common/ui/RoleGuard.jsx` - Component protection
- `front-end/src/app/stores/authStore.js` - Authentication state
