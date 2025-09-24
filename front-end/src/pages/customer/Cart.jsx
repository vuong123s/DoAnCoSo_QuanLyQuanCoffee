import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';
import { onlineOrderAPI, voucherAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">Giỏ hàng trống</div>
              <p className="text-gray-400 mt-2">Hãy thêm món vào giỏ hàng để tiếp tục</p>
              <button
                onClick={() => navigate('/menu')}
                className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
              >
                Xem thực đơn
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Món đã chọn ({cartItems.length})</h2>
                {cartItems.map((item) => (
                  <div key={item.MaMon} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.TenMon}</h3>
                      <p className="text-gray-600 text-sm">{item.MoTa}</p>
                      <p className="text-green-600 font-medium">{formatCurrency(item.DonGia)}</p>
                      
                      {/* Item Note */}
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Ghi chú cho món này..."
                          value={item.GhiChu || ''}
                          onChange={(e) => handleNoteChange(item.MaMon, e.target.value)}
                          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.MaMon, item.SoLuong - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.SoLuong}</span>
                      <button
                        onClick={() => handleQuantityChange(item.MaMon, item.SoLuong + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(item.DonGia * item.SoLuong)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.MaMon)}
                        className="text-red-600 hover:text-red-800 text-sm mt-1"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-lg sticky top-6">
                  <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
                  
                  {/* Order Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại đơn hàng
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="delivery"
                          checked={orderType === 'delivery'}
                          onChange={(e) => setOrderType(e.target.value)}
                          className="mr-2"
                        />
                        Giao hàng
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="pickup"
                          checked={orderType === 'pickup'}
                          onChange={(e) => setOrderType(e.target.value)}
                          className="mr-2"
                        />
                        Tự lấy
                      </label>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên khách hàng *
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.TenKhach}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, TenKhach: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={deliveryInfo.SoDienThoai}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, SoDienThoai: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {orderType === 'delivery' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ giao hàng *
                        </label>
                        <textarea
                          value={deliveryInfo.DiaChi}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, DiaChi: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        value={deliveryInfo.GhiChu}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, GhiChu: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ghi chú đặc biệt..."
                      />
                    </div>
                  </div>

                  {/* Voucher */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã giảm giá
                    </label>
                    {!voucher.applied ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={voucher.code}
                          onChange={(e) => setVoucher({...voucher, code: e.target.value})}
                          placeholder="Nhập mã voucher"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={validateVoucher}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                        >
                          Áp dụng
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                        <div>
                          <div className="text-sm font-medium text-green-800">{voucher.code}</div>
                          <div className="text-sm text-green-600">Giảm {formatCurrency(voucher.discount)}</div>
                        </div>
                        <button
                          onClick={removeVoucher}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                    
                    {/* Available Vouchers */}
                    {availableVouchers.length > 0 && !voucher.applied && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Voucher khả dụng:</p>
                        <div className="space-y-1">
                          {availableVouchers.slice(0, 3).map((v) => (
                            <button
                              key={v.MaVC}
                              onClick={() => setVoucher({...voucher, code: v.MaVC})}
                              className="block w-full text-left text-xs bg-blue-50 p-2 rounded hover:bg-blue-100"
                            >
                              <span className="font-medium">{v.MaVC}</span> - {v.TenVC}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    {voucher.applied && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrency(voucher.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || cartItems.length === 0}
                    className="w-full mt-6 bg-amber-600 text-white py-3 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? 'Đang đặt hàng...' : `Đặt hàng ${formatCurrency(calculateTotal())}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
