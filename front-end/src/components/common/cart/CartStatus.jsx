import React from 'react';
import { FiWifi, FiWifiOff, FiAlertCircle } from 'react-icons/fi';

const CartStatus = ({ isOnline = true, hasErrors = false }) => {
  if (!hasErrors && isOnline) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-2">
        {!isOnline ? (
          <FiWifiOff className="w-4 h-4 text-yellow-600" />
        ) : (
          <FiAlertCircle className="w-4 h-4 text-yellow-600" />
        )}
        <div className="text-sm">
          <p className="text-yellow-800 font-medium">
            {!isOnline ? 'Chế độ offline' : 'Lỗi kết nối'}
          </p>
          <p className="text-yellow-700">
            {!isOnline 
              ? 'Giỏ hàng sẽ được lưu cục bộ và đồng bộ khi có kết nối'
              : 'Một số tính năng có thể không hoạt động đúng'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartStatus;
