import React, { useState } from 'react';
import { 
  FiCoffee, 
  FiMinus, 
  FiPlus, 
  FiTrash2, 
  FiMessageSquare,
  FiHeart,
  FiStar
} from 'react-icons/fi';

const CartItemCard = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  onNoteChange,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    onQuantityChange(item.MaMon, newQuantity);
  };

  const handleNoteChange = (note) => {
    onNoteChange(item.MaMon, note);
  };

  const itemTotal = item.DonGia * item.SoLuong;

  return (
    <div className={`
      bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 
      border border-gray-100 overflow-hidden group
      ${className}
    `}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Item Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-2xl flex items-center justify-center shadow-inner">
              <FiCoffee className="w-10 h-10 text-amber-600" />
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`
                absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-200 shadow-md
                ${isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-400 hover:text-red-500'
                }
              `}
            >
              <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                  {item.TenMon}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar 
                      key={star} 
                      className="w-4 h-4 text-yellow-400 fill-current" 
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(item.MaMon)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className={`text-gray-600 text-sm mb-3 ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {item.MoTa}
            </p>

            {item.MoTa && item.MoTa.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium mb-3"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}

            {/* Price and Quantity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-amber-600">
                  {formatCurrency(item.DonGia)}
                </span>
                <span className="text-gray-400">×</span>
                <span className="text-gray-600 font-medium">{item.SoLuong}</span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                <button
                  onClick={() => handleQuantityChange(item.SoLuong - 1)}
                  disabled={item.SoLuong <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-l-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                
                <div className="w-12 h-10 flex items-center justify-center bg-white border-x border-gray-200 font-bold text-gray-900">
                  {item.SoLuong}
                </div>
                
                <button
                  onClick={() => handleQuantityChange(item.SoLuong + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-r-xl transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item Total */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Thành tiền:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(itemTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={item.GhiChu || ''}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Ghi chú đặc biệt cho món này..."
              rows={2}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <button className="text-amber-600 hover:text-amber-700 font-medium">
              Đặt lại
            </button>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Chia sẻ
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Cập nhật: {new Date().toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
