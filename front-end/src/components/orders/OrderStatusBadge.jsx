import React from 'react';
import { 
  FiClock, 
  FiCheckCircle, 
  FiTruck, 
  FiPackage, 
  FiX, 
  FiAlertCircle,
  FiShoppingBag 
} from 'react-icons/fi';

const OrderStatusBadge = ({ status, type = 'order', size = 'md', showIcon = true }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      // Order statuses
      'Chờ xác nhận': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FiClock,
        text: 'Chờ xác nhận'
      },
      'Đã xác nhận': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FiCheckCircle,
        text: 'Đã xác nhận'
      },
      'Đang chuẩn bị': {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: FiShoppingBag,
        text: 'Đang chuẩn bị'
      },
      'Đang giao hàng': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: FiTruck,
        text: 'Đang giao hàng'
      },
      'Sẵn sàng lấy': {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: FiPackage,
        text: 'Sẵn sàng lấy'
      },
      'Hoàn thành': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FiCheckCircle,
        text: 'Hoàn thành'
      },
      'Đã hủy': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FiX,
        text: 'Đã hủy'
      },
      'Có vấn đề': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FiAlertCircle,
        text: 'Có vấn đề'
      },
      // Payment statuses
      'Chưa thanh toán': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FiClock,
        text: 'Chưa thanh toán'
      },
      'Đã thanh toán': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FiCheckCircle,
        text: 'Đã thanh toán'
      },
      'Đã hoàn tiền': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FiCheckCircle,
        text: 'Đã hoàn tiền'
      }
    };

    return configs[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: FiAlertCircle,
      text: status || 'Không xác định'
    };
  };

  const getSizeClasses = (size) => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size] || sizes.md;
  };

  const config = getStatusConfig(status, type);
  const IconComponent = config.icon;
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`
      inline-flex items-center space-x-1.5 
      ${config.color} 
      ${sizeClasses}
      border rounded-full font-medium
      transition-all duration-200 hover:shadow-sm
    `}>
      {showIcon && <IconComponent className="w-4 h-4" />}
      <span>{config.text}</span>
    </span>
  );
};

// Predefined status components for common use cases
export const OrderStatus = ({ status, ...props }) => (
  <OrderStatusBadge status={status} type="order" {...props} />
);

export const PaymentStatus = ({ status, ...props }) => (
  <OrderStatusBadge status={status} type="payment" {...props} />
);

// Status progression component
export const StatusProgress = ({ currentStatus, statuses = [] }) => {
  const defaultStatuses = [
    'Chờ xác nhận',
    'Đã xác nhận', 
    'Đang chuẩn bị',
    'Đang giao hàng',
    'Hoàn thành'
  ];
  
  const statusList = statuses.length > 0 ? statuses : defaultStatuses;
  const currentIndex = statusList.indexOf(currentStatus);

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {statusList.map((status, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={status} className="flex items-center space-x-2 flex-shrink-0">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${isActive 
                ? isCurrent 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {index + 1}
            </div>
            <span className={`text-sm font-medium ${
              isActive ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {status}
            </span>
            {index < statusList.length - 1 && (
              <div className={`w-8 h-0.5 ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusBadge;
