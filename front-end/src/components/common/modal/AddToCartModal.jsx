import React, { useState } from 'react';
import { FiX, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import useCartStore from '../../../app/stores/cartStore';
import toast from 'react-hot-toast';

const AddToCartModal = ({ isOpen, onClose, product }) => {
  const { addToCart, loading } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  if (!isOpen || !product) return null;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      // Create cart item with Vietnamese schema
      const cartItem = {
        MaMon: product.MaMon || product.id,
        TenMon: product.TenMon || product.name || product.title,
        DonGia: product.DonGia || product.price,
        HinhAnh: product.HinhAnh || product.image || product.img,
        MoTa: product.MoTa || product.description,
        TrangThai: product.TrangThai || 'Có sẵn'
      };

      console.log('Adding to cart:', { product, cartItem, quantity });
      await addToCart(cartItem, quantity);
      
      // Reset form
      setQuantity(1);
      setNote('');
      onClose();
      
      toast.success(`Đã thêm ${quantity} ${cartItem.TenMon} vào giỏ hàng`);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Có lỗi khi thêm vào giỏ hàng');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const productName = product.TenMon || product.name || product.title;
  const productPrice = product.DonGia || product.price;
  const productImage = product.HinhAnh || product.image || product.img;
  const productDescription = product.MoTa || product.description;
  const totalPrice = productPrice * quantity;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Thêm vào giỏ hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <img
              src={productImage || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"}
              alt={productName}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{productName}</h3>
              <p className="text-sm text-gray-600 mb-2">{productDescription}</p>
              <p className="text-lg font-bold text-amber-600">
                {formatCurrency(productPrice)}
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="text-xl font-semibold min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: ít đá, thêm đường, không kem..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {note.length}/200 ký tự
            </p>
          </div>

          {/* Total Price */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tổng cộng:</span>
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span>{loading ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
