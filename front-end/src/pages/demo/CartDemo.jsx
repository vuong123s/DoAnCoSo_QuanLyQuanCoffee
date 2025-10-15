import React, { useState } from 'react';
import { FiShoppingCart, FiPlus } from 'react-icons/fi';
import useCartStore from '../../app/stores/cartStore';
import CartSidebar from '../../components/common/cart/CartSidebar';
import AddToCartModal from '../../components/common/modal/AddToCartModal';

const CartDemo = () => {
  const { addToCart, items, getCartTotal, getCartItemCount } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sample products for demo
  const sampleProducts = [
    {
      MaMon: 1,
      TenMon: 'Americano',
      DonGia: 35000,
      HinhAnh: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      MoTa: 'Cà phê Americano đậm đà',
      TrangThai: 'Có sẵn'
    },
    {
      MaMon: 2,
      TenMon: 'Cappuccino',
      DonGia: 45000,
      HinhAnh: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      MoTa: 'Cappuccino với bọt sữa mịn',
      TrangThai: 'Có sẵn'
    },
    {
      MaMon: 3,
      TenMon: 'Latte',
      DonGia: 50000,
      HinhAnh: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      MoTa: 'Latte thơm ngon với latte art',
      TrangThai: 'Có sẵn'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleQuickAdd = async (product) => {
    await addToCart(product, 1);
  };

  const handleDetailedAdd = (product) => {
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Demo Giỏ Hàng</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Thử nghiệm chức năng thêm vào giỏ hàng với các sản phẩm mẫu
          </p>
          
          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Số lượng sản phẩm:</span>
              <span className="font-semibold">{getCartItemCount()}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Tổng tiền:</span>
              <span className="font-semibold text-amber-600">{formatCurrency(getCartTotal())}</span>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span>Xem giỏ hàng</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product) => (
            <div key={product.MaMon} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={product.HinhAnh}
                alt={product.TenMon}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.TenMon}
                </h3>
                <p className="text-gray-600 mb-4">{product.MoTa}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-amber-600">
                    {formatCurrency(product.DonGia)}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Thêm nhanh</span>
                  </button>
                  <button
                    onClick={() => handleDetailedAdd(product)}
                    className="flex-1 border border-amber-600 text-amber-600 py-2 px-4 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Tùy chọn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Cart Items */}
        {items.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm trong giỏ hàng</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.MaMon} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.HinhAnh}
                      alt={item.TenMon}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.TenMon}</h4>
                      <p className="text-sm text-gray-600">Số lượng: {item.SoLuong}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-amber-600">
                        {formatCurrency(item.DonGia * item.SoLuong)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default CartDemo;
