import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/stores/authStore';
import useCartStore from '../../app/stores/cartStore';
import { onlineOrderAPI, userAPI, authAPI } from '../../shared/services/api';
import LoadingSpinner from '../../components/common/ui/LoadingSpinner';
import { 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiTruck, 
  FiPackage, 
  FiTag, 
  FiX,
  FiArrowLeft,
  FiCoffee,
  FiMapPin,
  FiPhone,
  FiUser,
  FiMessageSquare,
  FiPercent,
  FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    items: cartItems, 
    loading: cartLoading, 
    initializeCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    updateItemNote
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'pickup'
  const [deliveryInfo, setDeliveryInfo] = useState({
    TenKhach: '',
    SoDienThoai: '',
    DiaChi: '',
    GhiChu: ''
  });
  const [pointsUsed, setPointsUsed] = useState(0);
  const [customerPoints, setCustomerPoints] = useState(0);

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, []);

  // Helper function to get customer ID (supports both Vietnamese and English field names)
  const getCustomerId = () => {
    return user?.MaKH || user?.id;
  };

  // Helper function to check if user is a customer
  const isCustomer = () => {
    return user && (user.MaKH || (user.id && user.role === 'customer'));
  };

  // Auto-fill customer info and fetch points when user is available
  useEffect(() => {
    console.log('🔍 Cart useEffect - User:', user);
    if (isCustomer()) {
      const customerId = getCustomerId();
      console.log('✅ User is customer, ID:', customerId);
      
      // Auto-fill delivery info (support both Vietnamese and English field names)
      setDeliveryInfo(prev => ({
        ...prev,
        TenKhach: user.TenKH || user.HoTen || user.name || '',
        SoDienThoai: user.SoDienThoai || user.SDT || user.phone || '',
        DiaChi: user.DiaChi || user.address || ''
      }));
      console.log('📝 Auto-filled delivery info:', {
        TenKhach: user.TenKH || user.HoTen || user.name,
        SoDienThoai: user.SoDienThoai || user.SDT || user.phone
      });
      
      // Always fetch fresh points from database to ensure accuracy
      fetchCustomerPoints();
    } else {
      console.log('❌ No user or not a customer');
      setCustomerPoints(0);
      setPointsUsed(0);
    }
  }, [user]);

  const fetchCustomerPoints = async () => {
    const customerId = getCustomerId();
    console.log('🎯 Fetching customer points from DATABASE for ID:', customerId);
    
    if (!customerId) {
      console.log('⚠️ No customer ID, skipping fetch');
      setCustomerPoints(0);
      return;
    }
    
    try {
      // Use profile endpoint instead of customer endpoint to avoid 403 error
      // Customer can only access their own profile, not other customers
      const response = await authAPI.getProfile();
      console.log('📊 Profile data response:', response.data);
      
      // Support both Vietnamese and English field names
      const userData = response.data.user || response.data;
      const points = userData.DiemTichLuy || userData.points || 0;
      
      setCustomerPoints(points);
      console.log('✅ Fetched fresh points from profile:', points);
    } catch (error) {
      console.error('❌ Fetch customer points error:', error);
      
      // Handle 403 specifically
      if (error.response?.status === 403) {
        console.error('🚫 Access denied: Customer cannot access customer management endpoint');
        toast.error('Không có quyền truy cập');
      } else {
        toast.error('Không thể tải điểm tích lũy');
      }
      setCustomerPoints(0);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleNoteChange = async (itemId, note) => {
    await updateItemNote(itemId, note);
  };

  const handlePointsChange = (value) => {
    const points = parseInt(value) || 0;
    const maxPoints = Math.min(customerPoints, Math.floor(getCartTotal() / 1000));
    
    if (points > maxPoints) {
      toast.error(`Bạn chỉ có thể dùng tối đa ${maxPoints} điểm`);
      setPointsUsed(maxPoints);
    } else if (points < 0) {
      setPointsUsed(0);
    } else {
      setPointsUsed(points);
    }
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const pointsDiscount = pointsUsed * 1000; // 1 điểm = 1,000 VNĐ
    return Math.max(0, subtotal - pointsDiscount);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Validate required fields
    if (!deliveryInfo.TenKhach || !deliveryInfo.SoDienThoai) {
      toast.error('Vui lòng điền tên khách hàng và số điện thoại');
      return;
    }

    if (orderType === 'delivery' && !deliveryInfo.DiaChi) {
      toast.error('Vui lòng điền địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    try {
      // Get customer ID if user is a customer (supports both Vietnamese and English schema)
      const customerId = isCustomer() ? getCustomerId() : null;
      
      const orderData = {
        MaKH: customerId, // Mã khách hàng từ tài khoản đăng nhập
        LoaiDonHang: orderType === 'delivery' ? 'Giao hàng' : 'Mang đi',
        TenKhach: deliveryInfo.TenKhach,
        SDTKhach: deliveryInfo.SoDienThoai,
        DiaChiGiaoHang: orderType === 'delivery' ? deliveryInfo.DiaChi : 'Tự lấy tại cửa hàng',
        GhiChu: deliveryInfo.GhiChu,
        DiemSuDung: pointsUsed, // Số điểm tích lũy đã sử dụng
        TongTien: calculateTotal(), // Tổng tiền sau khi trừ điểm
        PhiGiaoHang: 0,
        items: cartItems.map(item => ({
          MaMon: item.MaMon,
          SoLuong: item.SoLuong,
          DonGia: item.DonGia,
          GhiChu: item.GhiChu || ''
        }))
      };

      console.log('📦 Submitting order data:', orderData);

      const response = await onlineOrderAPI.createOnlineOrder(orderData);
      
      console.log('✅ Order created successfully:', response.data);
      
      // Clear cart and refresh points after successful order
      await clearCart();
      setPointsUsed(0);
      
      // Refresh customer points from database
      if (isCustomer()) {
        fetchCustomerPoints();
      }
      setDeliveryInfo({
        TenKhach: user?.TenKH || '',
        SoDienThoai: user?.SoDienThoai || '',
        DiaChi: user?.DiaChi || '',
        GhiChu: ''
      });
      setPointsUsed(0);
      
      // Deduct points from customer account
      if (pointsUsed > 0 && user?.MaKH) {
        try {
          await userAPI.deductPoints(user.MaKH, pointsUsed);
        } catch (error) {
          console.error('Error deducting points:', error);
        }
      }
      
      toast.success('Đặt hàng thành công!');
      
      // Nếu có tài khoản thì vào profile, không thì chỉ hiển thị thông báo
      if (user) {
        navigate('/profile');
      } else {
        toast.success('Đơn hàng của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ với bạn sớm!', {
          duration: 5000,
          icon: '🎉'
        });
      }
    } catch (error) {
      console.error('Submit order error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || cartLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Quay lại thực đơn</span>
              </button>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
          
          <div className="mt-6">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500 p-3 rounded-full">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length > 0 
                    ? `${cartItems.length} món trong giỏ hàng` 
                    : 'Chưa có món nào trong giỏ hàng'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCoffee className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Hãy khám phá thực đơn phong phú của chúng tôi và thêm những món yêu thích vào giỏ hàng
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 font-medium flex items-center space-x-2 mx-auto"
            >
              <FiCoffee className="w-5 h-5" />
              <span>Khám phá thực đơn</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FiShoppingCart className="w-6 h-6" />
                    <span>Món đã chọn ({cartItems.length})</span>
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {cartItems.map((item, index) => (
                    <div key={item.MaMon} className={`bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="flex items-start space-x-4">
                        {/* Item Image Placeholder */}
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiCoffee className="w-8 h-8 text-amber-600" />
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{item.TenMon}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.MoTa}</p>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-amber-600 font-bold text-lg">{formatCurrency(item.DonGia)}</span>
                            <span className="text-gray-400">×</span>
                            <span className="text-gray-600">{item.SoLuong}</span>
                          </div>
                          
                          {/* Item Note */}
                          <div className="relative">
                            <FiMessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Ghi chú đặc biệt..."
                              value={item.GhiChu || ''}
                              onChange={(e) => handleNoteChange(item.MaMon, e.target.value)}
                              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                            />
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-center space-y-3">
                          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                            <button
                              onClick={() => handleQuantityChange(item.MaMon, item.SoLuong - 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-l-lg transition-colors"
                              disabled={item.SoLuong <= 1}
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-bold text-gray-900 bg-gray-50 py-2">{item.SoLuong}</span>
                            <button
                              onClick={() => handleQuantityChange(item.MaMon, item.SoLuong + 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-r-lg transition-colors"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Item Total & Remove */}
                          <div className="text-center">
                            <div className="font-bold text-lg text-gray-900 mb-2">
                              {formatCurrency(item.DonGia * item.SoLuong)}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.MaMon)}
                              className="flex items-center space-x-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg sticky top-8 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FiDollarSign className="w-6 h-6" />
                    <span>Thông tin đơn hàng</span>
                  </h2>
                </div>
                
                <div className="p-6">
                  {/* Order Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Loại đơn hàng
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        orderType === 'delivery' 
                          ? 'border-amber-500 bg-amber-50 text-amber-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="delivery"
                          checked={orderType === 'delivery'}
                          onChange={(e) => setOrderType(e.target.value)}
                          className="sr-only"
                        />
                        <FiTruck className="w-5 h-5 mr-2" />
                        <span className="font-medium">Giao hàng</span>
                      </label>
                      <label className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        orderType === 'pickup' 
                          ? 'border-amber-500 bg-amber-50 text-amber-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="pickup"
                          checked={orderType === 'pickup'}
                          onChange={(e) => setOrderType(e.target.value)}
                          className="sr-only"
                        />
                        <FiPackage className="w-5 h-5 mr-2" />
                        <span className="font-medium">Tự lấy</span>
                      </label>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <FiUser className="w-4 h-4" />
                        <span>Tên khách hàng *</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.TenKhach}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, TenKhach: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Nhập tên của bạn"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>Số điện thoại *</span>
                      </label>
                      <input
                        type="tel"
                        value={deliveryInfo.SoDienThoai}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, SoDienThoai: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>

                    {orderType === 'delivery' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>Địa chỉ giao hàng *</span>
                        </label>
                        <textarea
                          value={deliveryInfo.DiaChi}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, DiaChi: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
                          placeholder="Nhập địa chỉ giao hàng chi tiết"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>Ghi chú</span>
                      </label>
                      <textarea
                        value={deliveryInfo.GhiChu}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, GhiChu: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
                        placeholder="Ghi chú đặc biệt cho đơn hàng..."
                      />
                    </div>
                  </div>

                  {/* Loyalty Points */}
                  {isCustomer() && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                        <FiTag className="w-4 h-4" />
                        <span>Điểm tích lũy</span>
                      </label>
                      
                      {/* Customer Points Display */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-4 rounded-xl mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-amber-500 p-2 rounded-full">
                              <FiTag className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Điểm hiện có</div>
                              <div className="font-bold text-xl text-amber-700">{customerPoints} điểm</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Giá trị</div>
                            <div className="font-semibold text-amber-600">{formatCurrency(customerPoints * 1000)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Points Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Số điểm muốn dùng:</span>
                          <span className="text-xs">(Tối đa: {Math.min(customerPoints, Math.floor(getCartTotal() / 1000))} điểm)</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={Math.min(customerPoints, Math.floor(getCartTotal() / 1000))}
                            value={pointsUsed}
                            onChange={(e) => handlePointsChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                            placeholder="Nhập số điểm"
                          />
                        </div>
                        {pointsUsed > 0 && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-700 font-medium">🎖️ Giảm giá:</span>
                              <span className="text-green-700 font-bold">-{formatCurrency(pointsUsed * 1000)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t-2 border-gray-100 pt-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                      <FiDollarSign className="w-5 h-5" />
                      <span>Tổng kết đơn hàng</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Tạm tính ({cartItems.length} món):</span>
                        <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                      </div>
                      
                      {/* Loyalty Points Discount - Always show if user is logged in */}
                      {isCustomer() && (
                        <div className={`border-2 px-4 py-3 rounded-xl ${
                          pointsUsed > 0 
                            ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' 
                            : 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <FiTag className={`w-5 h-5 ${
                                pointsUsed > 0 ? 'text-green-600' : 'text-amber-600'
                              }`} />
                              <div>
                                <div className="text-xs text-gray-600 font-medium">🎖️ Điểm sử dụng giảm giá:</div>
                                <div className={`text-sm font-bold ${
                                  pointsUsed > 0 ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {pointsUsed > 0 ? `${pointsUsed} điểm` : 'Không dùng điểm'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Giảm giá</div>
                              <div className={`text-lg font-bold ${
                                pointsUsed > 0 ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                {pointsUsed > 0 ? `-${formatCurrency(pointsUsed * 1000)}` : '0đ'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t-2 border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900">Tổng cộng:</span>
                          <span className="text-2xl font-bold text-amber-600">{formatCurrency(calculateTotal())}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || cartItems.length === 0}
                    className="w-full mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang đặt hàng...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FiShoppingCart className="w-5 h-5" />
                        <span>Đặt hàng • {formatCurrency(calculateTotal())}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        </div>
      )}
      </div>
    </div>
  );
};

export default Cart;
