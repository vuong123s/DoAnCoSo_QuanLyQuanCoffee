import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/stores/authStore';
import toast from 'react-hot-toast';
import {
  FiHome, FiMenu, FiUsers, FiCalendar, FiShoppingCart,
  FiDollarSign, FiBarChart2, FiSettings, FiLogOut,
  FiChevronLeft, FiChevronRight, FiBell, FiSearch,
  FiCoffee, FiTable, FiCreditCard, FiPackage,
  FiSun, FiMoon, FiMaximize2, FiMinimize2, FiX,
  FiChevronDown, FiUser, FiHelpCircle, FiActivity,
  FiTrendingUp, FiClock, FiStar, FiZap, FiImage
} from 'react-icons/fi';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Đăng xuất thành công!');
    logout();
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Enhanced menu items with categories and descriptions
  const menuCategories = [
    {
      title: 'Tổng quan',
      items: [
        { 
          path: '/admin', 
          icon: FiHome, 
          label: 'Dashboard', 
          exact: true,
          description: 'Tổng quan & phân tích',
          color: 'from-blue-500 to-blue-600'
        }
      ]
    },
    {
      title: 'Quản lý cửa hàng',
      items: [
        { 
          path: '/admin/menu', 
          icon: FiCoffee, 
          label: 'Menu', 
          description: 'Thức uống, món ăn & danh mục',
          color: 'from-amber-500 to-amber-600'
        },
        { 
          path: '/admin/tables', 
          icon: FiTable, 
          label: 'Bàn ăn', 
          description: 'Quản lý bàn',
          color: 'from-indigo-500 to-indigo-600'
        },
        { 
          path: '/admin/reservations', 
          icon: FiCalendar, 
          label: 'Đặt bàn', 
          description: 'Quản lý đặt chỗ',
          color: 'from-pink-500 to-pink-600'
        },
        { 
          path: '/admin/inventory', 
          icon: FiPackage, 
          label: 'Kho', 
          description: 'Quản lý nguyên liệu',
          color: 'from-emerald-500 to-emerald-600'
        },
      ]
    },
    {
      title: 'Kinh doanh',
      items: [
        { 
          path: '/admin/orders', 
          icon: FiShoppingCart, 
          label: 'Đơn hàng', 
          description: 'Theo dõi đơn hàng',
          color: 'from-orange-500 to-orange-600'
        },
        { 
          path: '/admin/online-orders', 
          icon: FiPackage, 
          label: 'Đơn hàng online', 
          description: 'Quản lý đặt hàng online',
          color: 'from-blue-500 to-blue-600'
        },
        { 
          path: '/admin/sales', 
          icon: FiCreditCard, 
          label: 'Bán hàng tại chỗ', 
          description: 'Quản lý đơn hàng Orders tại chỗ',
          color: 'from-green-500 to-green-600'
        }
      ]
    },
    {
      title: 'Nhân sự',
      items: [
        { 
          path: '/admin/users', 
          icon: FiUsers, 
          label: 'Nhân viên', 
          description: 'Quản lý tài khoản',
          color: 'from-cyan-500 to-cyan-600'
        },
        { 
          path: '/admin/schedules', 
          icon: FiClock, 
          label: 'Lịch làm việc', 
          description: 'Xếp ca & chấm công',
          color: 'from-teal-500 to-teal-600'
        }
      ]
    },
    {
      title: 'Hệ thống',
      items: [
        { 
          path: '/admin/settings', 
          icon: FiSettings, 
          label: 'Cài đặt', 
          description: 'Thiết lập hệ thống',
          color: 'from-gray-500 to-gray-600'
        }
      ]
    }
  ];

  const allMenuItems = menuCategories.flatMap(category => category.items);

  // Function to get icon color based on theme color
  const getIconColor = (colorGradient) => {
    const colorMap = {
      'from-blue-500 to-blue-600': 'text-blue-600',
      'from-purple-500 to-purple-600': 'text-purple-600',
      'from-amber-500 to-amber-600': 'text-amber-600',
      'from-green-500 to-green-600': 'text-green-600',
      'from-indigo-500 to-indigo-600': 'text-indigo-600',
      'from-pink-500 to-pink-600': 'text-pink-600',
      'from-orange-500 to-orange-600': 'text-orange-600',
      'from-emerald-500 to-emerald-600': 'text-emerald-600',
      'from-cyan-500 to-cyan-600': 'text-cyan-600',
      'from-violet-500 to-violet-600': 'text-violet-600',
      'from-teal-500 to-teal-600': 'text-teal-600',
      'from-gray-500 to-gray-600': 'text-gray-600'
    };
    return colorMap[colorGradient] || 'text-blue-600';
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getCurrentPageInfo = () => {
    const currentItem = allMenuItems.find(item => 
      isActive(item.path, item.exact)
    );
    return currentItem || { label: 'Dashboard', description: 'Tổng quan hệ thống' };
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Sidebar */}
      <div className={`bg-white shadow-2xl transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-80'
      } flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="relative p-3">
          <div className="absolute inset-0"></div>
          <div className="relative z-10">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <FiCoffee className="w-7 h-7" />
                  </div>
                  <h1 className="font-bold !text-[24px]">Coffee Shop</h1>
                </div>
              )}
              
              {sidebarCollapsed && (
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FiMenu className="text-black w-7 h-7" />
                </div>
              )}
              
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-xl bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all duration-200"
                title={sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              >
                {sidebarCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-hide">
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  {category.title}
                </h3>
              )}
              <div className="space-y-1">
                {category.items.map((item) => (
                  <div key={item.path} className="relative group">
                    <Link
                      to={item.path}
                      className={`relative flex items-center transition-all duration-300 ${
                        sidebarCollapsed 
                          ? 'px-2 py-3 mx-2 justify-center' 
                          : 'px-4 py-3 mx-2'
                      } rounded-xl ${
                        isActive(item.path, item.exact)
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-102'
                      }`}
                    >
                    {/* Icon Container - Always visible with proper contrast */}
                    <div className={`flex items-center justify-center transition-all duration-300 ${
                      sidebarCollapsed 
                        ? 'w-8 h-8' 
                        : 'w-10 h-10 mr-3'
                    } rounded-lg ${
                      isActive(item.path, item.exact) 
                        ? 'bg-white shadow-md' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <item.icon className={`transition-all duration-300 ${
                        sidebarCollapsed ? 'w-4 h-4' : 'w-5 h-5'
                      } ${
                        isActive(item.path, item.exact) 
                          ? getIconColor(item.color)
                          : 'text-gray-600 group-hover:text-gray-700'
                      }`} />
                    </div>
                    
                    {/* Text Content - Only show when expanded */}
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.label}</div>
                        <div className={`text-xs mt-0.5 truncate ${
                          isActive(item.path, item.exact) 
                            ? 'text-white text-opacity-80' 
                            : 'text-gray-500 group-hover:text-gray-600'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    )}
                    
                    {/* Active Indicator for Expanded State */}
                    {isActive(item.path, item.exact) && !sidebarCollapsed && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                    )}
                    
                    {/* Active Dot for Collapsed State */}
                    {isActive(item.path, item.exact) && sidebarCollapsed && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    )}
                  </Link>
                  
                  {/* Tooltip for Collapsed State */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-300 mt-0.5">{item.description}</div>
                      {/* Tooltip Arrow */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <header className="bg-white shadow-lg border-b border-gray-200 z-10">
          <div className="flex items-center justify-between h-20 px-8">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getCurrentPageInfo().label}</h1>
                </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Search */}
              <div className="relative hidden md:block">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong hệ thống..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 w-80 text-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="hidden sm:block p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                >
                  {fullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-3 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 group">
                  <FiBell className="w-5 h-5 group-hover:animate-pulse" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>

              {/* Enhanced User Menu */}
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {(user?.HoTen || user?.name)?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.HoTen || user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.ChucVu || user?.role || 'Quản trị viên'}</p>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Enhanced User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.HoTen || user?.name || 'Admin'}</p>
                      <p className="text-sm text-gray-500">{user?.email || 'admin@coffeeshop.com'}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser className="w-4 h-4 mr-3" />
                        Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/settings');
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiSettings className="w-4 h-4 mr-3" />
                        Cài đặt
                      </button>
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiHelpCircle className="w-4 h-4 mr-3" />
                        Trợ giúp
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 scrollbar-hide">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
