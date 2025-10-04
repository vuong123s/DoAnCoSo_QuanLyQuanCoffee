import React from 'react';
import { FiShoppingCart, FiDollarSign, FiPercent, FiClock } from 'react-icons/fi';

const CartSummary = ({ 
  itemCount, 
  totalAmount, 
  discount = 0, 
  estimatedTime = '15-20 phút',
  className = '' 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const finalAmount = totalAmount - discount;

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Items Count */}
        <div className="flex items-center space-x-3 bg-white rounded-xl p-4">
          <div className="bg-blue-500 p-2 rounded-full">
            <FiShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Số món</p>
            <p className="text-xl font-bold text-gray-900">{itemCount}</p>
          </div>
        </div>

        {/* Total Amount */}
        <div className="flex items-center space-x-3 bg-white rounded-xl p-4">
          <div className="bg-green-500 p-2 rounded-full">
            <FiDollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(finalAmount)}</p>
          </div>
        </div>

        {/* Discount (if any) */}
        {discount > 0 && (
          <div className="flex items-center space-x-3 bg-white rounded-xl p-4">
            <div className="bg-red-500 p-2 rounded-full">
              <FiPercent className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Giảm giá</p>
              <p className="text-xl font-bold text-red-500">-{formatCurrency(discount)}</p>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="flex items-center space-x-3 bg-white rounded-xl p-4">
          <div className="bg-purple-500 p-2 rounded-full">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời gian</p>
            <p className="text-lg font-bold text-purple-600">{estimatedTime}</p>
          </div>
        </div>
      </div>

      {/* Subtotal breakdown */}
      {discount > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Tạm tính:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-red-600 mb-2">
            <span>Giảm giá:</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-amber-200">
            <span>Thành tiền:</span>
            <span className="text-amber-600">{formatCurrency(finalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
