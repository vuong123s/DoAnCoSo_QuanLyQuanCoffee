import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { menuAPI, billingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Cart = () => {
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [note, setNote] = useState('');
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      // This would typically come from table service
      // For now, we'll create mock data
      setTables([
        { MaBan: 1, TenBan: 'Bàn 1', TrangThai: 'Trống' },
        { MaBan: 2, TenBan: 'Bàn 2', TrangThai: 'Trống' },
        { MaBan: 3, TenBan: 'Bàn 3', TrangThai: 'Trống' },
        { MaBan: 4, TenBan: 'Bàn 4', TrangThai: 'Trống' },
        { MaBan: 5, TenBan: 'Bàn 5', TrangThai: 'Trống' }
      ]);
    } catch (error) {
      console.error('Fetch tables error:', error);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.MaMon === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.MaMon !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    toast.success('Đã xóa món khỏi giỏ hàng');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.success('Đã xóa tất cả món khỏi giỏ hàng');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.DonGia * item.quantity), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable) {
      toast.error('Vui lòng chọn bàn');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        MaKH: user.MaKH,
        MaBan: selectedTable,
        GhiChu: note,
        items: cartItems.map(item => ({
          MaMon: item.MaMon,
          SoLuong: item.quantity,
          DonGia: item.DonGia
        })),
        TongTien: calculateTotal()
      };

      await billingAPI.createBill(orderData);
      
      // Clear cart after successful order
      clearCart();
      setSelectedTable('');
      setNote('');
      
      toast.success('Đặt hàng thành công!');
    } catch (error) {
      console.error('Submit order error:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
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
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.MaMon} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.TenMon}</h3>
                      <p className="text-gray-600">{item.MoTa}</p>
                      <p className="text-green-600 font-medium">{formatCurrency(item.DonGia)}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.MaMon, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.MaMon, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(item.DonGia * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeItem(item.MaMon)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details */}
              <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn bàn *
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Chọn bàn --</option>
                      {tables.filter(table => table.TrangThai === 'Trống').map((table) => (
                        <option key={table.MaBan} value={table.MaBan}>
                          {table.TenBan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ghi chú đặc biệt cho đơn hàng..."
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || !selectedTable}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
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
