import React from 'react';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import useCartStore from '../../../app/stores/cartStore';
import { useNavigate } from 'react-router-dom';
import CartStatus from './CartStatus';

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    items, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCartStore();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const totalAmount = getCartTotal();
  const itemCount = getCartItemCount();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <FiShoppingCart className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Giỏ hàng ({itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Cart Status */}
          <CartStatus isOnline={false} hasErrors={false} />
          
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-600 mb-6">
                Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
              </p>
              <button
                onClick={onClose}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                console.log('Cart item:', item); // Debug log
                const itemName = item.TenMon || item.name;
                const itemPrice = item.DonGia || item.price;
                const itemImage = item.HinhAnh || item.image;
                const itemQuantity = item.SoLuong || item.quantity;
                const itemId = item.MaMon || item.id;
                const itemTotal = itemPrice * itemQuantity;

                return (
                  <div key={`cart-item-${itemId}-${index}`} className="flex space-x-4 bg-gray-50 rounded-lg p-4">
                    <img
                      src={itemImage || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
                      alt={itemName}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{itemName}</h4>
                      <p className="text-sm text-amber-600 font-semibold mb-2">
                        {formatCurrency(itemPrice)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(itemId, itemQuantity - 1)}
                            disabled={loading}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {itemQuantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(itemId, itemQuantity + 1)}
                            disabled={loading}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(itemId)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right mt-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {/* Clear Cart */}
            <button
              onClick={clearCart}
              disabled={loading}
              className="w-full text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              Xóa tất cả
            </button>

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span className="text-amber-600">{formatCurrency(totalAmount)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán'}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
