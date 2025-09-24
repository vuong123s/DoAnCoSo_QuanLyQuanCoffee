# 📁 Frontend Source Structure

Cấu trúc source code đã được tối ưu hóa cho Coffee Shop frontend.

## 🏗️ Directory Structure

```
src/
├── 🎨 components/          # Reusable components
│   ├── layout/            # Layout components (Header, Footer, Navbar)
│   ├── product/           # Product-related components
│   ├── ui/                # UI components (LoadingSpinner, ProtectedRoute)
│   └── index.js           # Main components export
│
├── 📄 pages/              # Page components
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── customer/          # Customer-specific pages
│   ├── public/            # Public pages
│   └── index.js           # Main pages export
│
├── 🏗️ layouts/            # Layout wrappers
│   ├── AdminLayout.jsx    # Admin dashboard layout
│   ├── AuthLayout.jsx     # Authentication layout
│   └── MainLayout.jsx     # Main public layout
│
├── 🗃️ stores/             # Zustand state management
│   └── authStore.js       # Authentication state
│
├── 🔌 services/           # API services
│   └── api.js             # API client and endpoints
│
├── 🪝 hooks/              # Custom React hooks
│   └── useAuth.js         # Authentication hook
│
├── 🎯 constants/          # App constants
│   └── index.js           # Routes, status values, storage keys
│
├── 🛠️ utils/              # Utility functions
│   └── index.js           # Formatters, validators, helpers
│
├── 🖼️ assets/             # Static assets
│   ├── img/               # Images
│   └── footer_contact.js  # Contact data
│
├── 🎨 App.jsx             # Main App component
├── 🎨 App.css             # App-specific styles
├── 🎨 index.css           # Global styles
└── 🚀 main.jsx            # App entry point
```

## 📦 Import Examples

### Components
```javascript
// Old way (before optimization)
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

// New way (after optimization)
import { LoadingSpinner } from '../components/ui';
import { ProductCard } from '../components/product';

// Or import all components
import { LoadingSpinner, ProductCard, Header } from '../components';
```

### Pages
```javascript
// Admin pages
import { AdminDashboard, MenuManagement } from '../pages/admin';

// Auth pages
import { Login, Register } from '../pages/auth';

// Customer pages
import { BookTable, Cart } from '../pages/customer';

// Public pages
import { Home, Menu } from '../pages/public';
```

### Constants & Utils
```javascript
// Constants
import { ROUTES, USER_ROLES, ORDER_STATUS } from '../constants';

// Utils
import { formatCurrency, formatDate, storage } from '../utils';
```

## 🎯 Benefits

### ✅ **Organized Structure:**
- Components grouped by functionality
- Clear separation of concerns
- Easy to locate and maintain files

### ✅ **Better Imports:**
- Cleaner import statements
- Barrel exports for easy access
- Reduced import path complexity

### ✅ **Scalability:**
- Easy to add new components
- Consistent file organization
- Better code reusability

### ✅ **Developer Experience:**
- Faster development
- Better code navigation
- Consistent naming conventions

## 🔄 Migration Notes

If you're updating existing imports, use these patterns:

### Components Migration
```javascript
// Before
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import ProductCard from './components/ProductCard';

// After
import { LoadingSpinner } from './components/ui';
import { Header } from './components/layout';
import { ProductCard } from './components/product';
```

### Pages Migration
```javascript
// Before
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/auth/Login';

// After
import { AdminDashboard } from './pages/admin';
import { Login } from './pages/auth';
```

## 🛠️ Development Guidelines

1. **Component Placement:**
   - `ui/` - Reusable UI components
   - `layout/` - Layout and navigation components
   - `product/` - Product-specific components

2. **Page Organization:**
   - `admin/` - Admin dashboard pages
   - `auth/` - Login, register pages
   - `customer/` - Customer-specific pages
   - `public/` - Public-facing pages

3. **Constants Usage:**
   - Use constants for routes, status values
   - Avoid hardcoding strings
   - Centralize configuration

4. **Utils Functions:**
   - Keep utility functions pure
   - Add proper JSDoc comments
   - Export individual functions

---

**📝 Note:** This structure follows React best practices and makes the codebase more maintainable and scalable.
