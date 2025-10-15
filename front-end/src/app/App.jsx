import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import CartProvider from "../components/providers/CartProvider";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";

// Public Pages
import Home from "../pages/public/Home";
// Use the unified Menu page that fetches from API and supports Vietnamese schema
import Menu from "../pages/public/Menu";
import ProductDetail from "../pages/public/ProductDetail";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

// Debug Pages
import MenuDebug from "../pages/debug/MenuDebug";
import ProfileDebug from "../pages/debug/ProfileDebug";
import CustomerProfileDemo from "../pages/demo/CustomerProfileDemo";
import RealProfileDemo from "../pages/demo/RealProfileDemo";
import ProfileGuide from "../pages/demo/ProfileGuide";
import CartDemo from "../pages/demo/CartDemo";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Customer Pages
import Profile from "../pages/customer/Profile";
import OrderHistory from "../pages/customer/OrderHistory";
import OrderTracking from "../pages/customer/OrderTracking";
import Cart from "../pages/customer/Cart";
import BookTable from "../pages/customer/BookTable";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import MenuManagement from "../pages/admin/MenuManagement";
import TableManagement from "../pages/admin/TableManagement";
import ReservationManagement from "../pages/admin/ReservationManagement";
import OrderManagement from "../pages/admin/OrderManagement";
import OnlineOrderManagement from "../pages/admin/OnlineOrderManagement";
import SalesManagement from "../pages/admin/SalesManagement";
import UserManagement from "../pages/admin/UserManagement";
import Analytics from "../pages/admin/Analytics";
import MediaManagement from "../pages/admin/MediaManagement";

// Components
import ProtectedRoute from "../components/common/ui/ProtectedRoute";
import LoadingSpinner from "../components/common/ui/LoadingSpinner";

function App() {
  const { isLoading, user, isAuthenticated } = useAuthStore();

  console.log('App render:', { isLoading, isAuthenticated, hasUser: !!user });

  // No need to initialize - Zustand persist handles this automatically

  if (isLoading) {
    console.log('App showing loading spinner');
    return <LoadingSpinner />;
  }

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="menu-debug" element={<MenuDebug />} />
            <Route path="profile-debug" element={<ProfileDebug />} />
            <Route path="profile-demo" element={<CustomerProfileDemo />} />
            <Route path="real-profile" element={<RealProfileDemo />} />
            <Route path="profile-guide" element={<ProfileGuide />} />
            <Route path="cart-demo" element={<CartDemo />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="book-table" element={<BookTable />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['customer', 'staff', 'manager', 'admin']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="orders/:orderId" element={<OrderTracking />} />
            <Route path="cart" element={<Cart />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="reservations" element={<ReservationManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="online-orders" element={<OnlineOrderManagement />} />
            <Route path="sales" element={<SalesManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="media" element={<MediaManagement />} />
          </Route>

          {/* Redirects */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          
          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Trang không tồn tại</p>
                <a href="/" className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
                  Về trang chủ
                </a>
              </div>
            </div>
          } />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
