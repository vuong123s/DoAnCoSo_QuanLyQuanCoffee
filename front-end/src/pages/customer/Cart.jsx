import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/stores/authStore';
import useCartStore from '../../app/stores/cartStore';
import { onlineOrderAPI, voucherAPI } from '../../shared/services/api';
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
    TenKhach: user?.TenKH || '',
    SoDienThoai: user?.SoDienThoai || '',
    DiaChi: user?.DiaChi || '',
    GhiChu: ''
  });
  const [voucher, setVoucher] = useState({
    code: '',
    discount: 0,
    isValid: false,
    applied: false
  });
  const [availableVouchers, setAvailableVouchers] = useState([]);

  useEffect(() => {
    initializeCart();
    fetchAvailableVouchers();
  }, []);

  const fetchAvailableVouchers = async () => {
    try {
      const customerType = user?.LoaiKH || 'Khách hàng';
      const response = await voucherAPI.getAvailableVouchers(customerType);
      setAvailableVouchers(response.data || []);
    } catch (error) {
      console.error('Fetch vouchers error:', error);
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

  const validateVoucher = async () => {
    if (!voucher.code.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    try {
      const orderData = {
        TongTien: getCartTotal(),
        MaKH: user?.MaKH,
        LoaiKH: user?.LoaiKH || 'Khách hàng'
      };

      const response = await voucherAPI.validateVoucher(voucher.code, orderData);
      
      if (response.data.valid) {
        setVoucher({
          ...voucher,
          discount: response.data.discount,
          isValid: true,
          applied: true
        });
        toast.success(`Áp dụng voucher thành công! Giảm ${formatCurrency(response.data.discount)}`);
      } else {
        toast.error(response.data.message || 'Mã voucher không hợp lệ');
      }
    } catch (error) {
      console.error('Validate voucher error:', error);
      toast.error('Có lỗi khi kiểm tra voucher');
    }
  };

  const removeVoucher = () => {
    setVoucher({
      code: '',
      discount: 0,
      isValid: false,
      applied: false
    });
    toast.success('Đã hủy voucher');
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const discount = voucher.applied ? voucher.discount : 0;
    return Math.max(0, subtotal - discount);
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

    if (orderType === 'delivery') {
      if (!deliveryInfo.TenKhach || !deliveryInfo.SoDienThoai || !deliveryInfo.DiaChi) {
        toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
        return;
      }
    }

    setSubmitting(true);
    try {
      const orderData = {
        MaKH: user?.MaKH || null,
        LoaiDonHang: orderType === 'delivery' ? 'Giao hàng' : 'Tự lấy',
        TenKhach: deliveryInfo.TenKhach,
        SoDienThoai: deliveryInfo.SoDienThoai,
        DiaChi: orderType === 'delivery' ? deliveryInfo.DiaChi : null,
        GhiChu: deliveryInfo.GhiChu,
        MaVC: voucher.applied ? voucher.code : null,
        TongTien: getCartTotal(),
        TienGiam: voucher.applied ? voucher.discount : 0,
        ThanhTien: calculateTotal(),
        items: cartItems.map(item => ({
          MaMon: item.MaMon,
          SoLuong: item.SoLuong,
          DonGia: item.DonGia,
          GhiChu: item.GhiChu || ''
        }))
      };

      const response = await onlineOrderAPI.createOnlineOrder(orderData);
      
      // Clear cart after successful order
      await clearCart();
      setDeliveryInfo({
        TenKhach: user?.TenKH || '',
        SoDienThoai: user?.SoDienThoai || '',
        DiaChi: user?.DiaChi || '',
        GhiChu: ''
      });
      removeVoucher();
      
      toast.success('Đặt hàng thành công!');
      
      // Navigate to order tracking
      navigate(`/customer/orders/${response.data.MaDonHang}`);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
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

                  {/* Voucher */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                      <FiTag className="w-4 h-4" />
                      <span>Mã giảm giá</span>
                    </label>
                    {!voucher.applied ? (
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <FiPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={voucher.code}
                            onChange={(e) => setVoucher({...voucher, code: e.target.value})}
                            placeholder="Nhập mã voucher"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                          />
                        </div>
                        <button
                          onClick={validateVoucher}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                        >
                          Áp dụng
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-500 p-2 rounded-full">
                              <FiTag className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-green-800">{voucher.code}</div>
                              <div className="text-sm text-green-600">Giảm {formatCurrency(voucher.discount)}</div>
                            </div>
                          </div>
                          <button
                            onClick={removeVoucher}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Available Vouchers */}
                    {availableVouchers.length > 0 && !voucher.applied && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Voucher khả dụng:</p>
                        <div className="space-y-2">
                          {availableVouchers.slice(0, 3).map((v) => (
                            <button
                              key={v.MaVC}
                              onClick={() => setVoucher({...voucher, code: v.MaVC})}
                              className="block w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all"
                            >
                              <div className="flex items-center space-x-2">
                                <FiTag className="w-4 h-4 text-blue-500" />
                                <div>
                                  <span className="font-bold text-blue-700">{v.MaVC}</span>
                                  <p className="text-xs text-blue-600">{v.TenVC}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

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
                      
                      {voucher.applied && (
                        <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FiTag className="w-4 h-4" />
                            <span>Giảm giá ({voucher.code}):</span>
                          </div>
                          <span className="font-bold">-{formatCurrency(voucher.discount)}</span>
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
