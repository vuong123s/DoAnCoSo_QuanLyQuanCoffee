import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiEye } from 'react-icons/fi';

const ProductShowcase = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const productId = product.MaMon || product.id;
  const productName = product.TenMon || product.name;
  const productDescription = product.MoTa || product.description;
  const productPrice = product.DonGia || product.price;
  const productImage = product.HinhAnh || product.image;
  const isAvailable = product.TrangThai === 'Còn bán' || product.available !== false;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleViewDetails = () => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart && isAvailable) {
      onAddToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img
          src={productImage || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"}
          alt={productName}
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400";
          }}
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium bg-red-600 px-3 py-1 rounded-full">
              Hết hàng
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleViewDetails}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-md transition-all duration-200"
            title="Xem chi tiết"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
          {productName}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {productDescription}
        </p>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 ${
                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm ml-2">(4.0)</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-amber-600">
            {formatCurrency(productPrice)}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleViewDetails}
              className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Chi tiết
            </button>
            {isAvailable && (
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
