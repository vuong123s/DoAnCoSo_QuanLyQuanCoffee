import React, { useState, useEffect } from 'react';
import { 
  FiTruck, 
  FiPackage, 
  FiClock, 
  FiMapPin, 
  FiPhone,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const DeliveryInfo = ({ 
  orderType = 'delivery', 
  address = '', 
  phone = '',
  cartTotal = 0,
  className = '' 
}) => {
  const [estimatedTime, setEstimatedTime] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState('available');

  useEffect(() => {
    calculateDeliveryInfo();
  }, [orderType, address, cartTotal]);

  const calculateDeliveryInfo = () => {
    if (orderType === 'pickup') {
      setEstimatedTime('15-20 phút');
      setDeliveryFee(0);
      setDeliveryStatus('available');
      return;
    }

    // Delivery calculations
    const baseTime = 25; // Base delivery time in minutes
    const rushHourMultiplier = isRushHour() ? 1.5 : 1;
    const distanceTime = calculateDistanceTime(address);
    
    const totalTime = Math.round((baseTime + distanceTime) * rushHourMultiplier);
    const minTime = totalTime - 5;
    const maxTime = totalTime + 10;
    
    setEstimatedTime(`${minTime}-${maxTime} phút`);

    // Calculate delivery fee
    const baseFee = 25000;
    const distanceFee = calculateDistanceFee(address);
    const totalFee = baseFee + distanceFee;
    
    // Free shipping threshold
    const freeShippingThreshold = 200000;
    setDeliveryFee(cartTotal >= freeShippingThreshold ? 0 : totalFee);

    // Check delivery availability
    setDeliveryStatus(isDeliveryAvailable(address) ? 'available' : 'unavailable');
  };

  const isRushHour = () => {
    const now = new Date();
    const hour = now.getHours();
    return (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19);
  };

  const calculateDistanceTime = (address) => {
    // Simple distance calculation based on keywords
    const keywords = address.toLowerCase();
    if (keywords.includes('quận 1') || keywords.includes('district 1')) return 0;
    if (keywords.includes('quận 3') || keywords.includes('quận 5')) return 5;
    if (keywords.includes('quận 7') || keywords.includes('quận 2')) return 15;
    return 10; // Default
  };

  const calculateDistanceFee = (address) => {
    const keywords = address.toLowerCase();
    if (keywords.includes('quận 1') || keywords.includes('district 1')) return 0;
    if (keywords.includes('quận 3') || keywords.includes('quận 5')) return 10000;
    if (keywords.includes('quận 7') || keywords.includes('quận 2')) return 20000;
    return 15000; // Default
  };

  const isDeliveryAvailable = (address) => {
    // Check if delivery is available to this area
    const unavailableAreas = ['quận 9', 'thủ đức', 'bình dương'];
    const keywords = address.toLowerCase();
    return !unavailableAreas.some(area => keywords.includes(area));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (deliveryStatus) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unavailable':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (deliveryStatus) {
      case 'available':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'unavailable':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`p-4 ${
        orderType === 'delivery' 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
          : 'bg-gradient-to-r from-green-500 to-green-600'
      }`}>
        <div className="flex items-center space-x-3 text-white">
          {orderType === 'delivery' ? (
            <FiTruck className="w-6 h-6" />
          ) : (
            <FiPackage className="w-6 h-6" />
          )}
          <h3 className="text-lg font-bold">
            {orderType === 'delivery' ? 'Thông tin giao hàng' : 'Thông tin tự lấy'}
          </h3>
        </div>
      </div>

      <div className="p-6">
        {/* Delivery Status */}
        <div className={`flex items-center space-x-3 p-3 rounded-xl border mb-4 ${getStatusColor()}`}>
          {getStatusIcon()}
          <div>
            <p className="font-medium">
              {deliveryStatus === 'available' 
                ? (orderType === 'delivery' ? 'Có thể giao hàng' : 'Có thể tự lấy')
                : 'Không thể giao hàng đến khu vực này'
              }
            </p>
            {deliveryStatus === 'unavailable' && (
              <p className="text-sm opacity-75">
                Vui lòng chọn tự lấy hoặc thay đổi địa chỉ
              </p>
            )}
          </div>
        </div>

        {/* Time Estimate */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-amber-100 p-2 rounded-lg">
            <FiClock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Thời gian dự kiến</p>
            <p className="text-amber-600 font-bold">{estimatedTime}</p>
            {isRushHour() && (
              <p className="text-xs text-orange-500">* Giờ cao điểm, có thể chậm hơn</p>
            )}
          </div>
        </div>

        {/* Delivery Fee */}
        {orderType === 'delivery' && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
            <div className="flex items-center space-x-3">
              <FiTruck className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Phí giao hàng</span>
            </div>
            <div className="text-right">
              {deliveryFee === 0 ? (
                <div>
                  <span className="text-green-600 font-bold">Miễn phí</span>
                  {cartTotal >= 200000 && (
                    <p className="text-xs text-green-500">Đơn hàng trên 200k</p>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-gray-900 font-bold">{formatCurrency(deliveryFee)}</span>
                  {cartTotal < 200000 && (
                    <p className="text-xs text-gray-500">
                      Thêm {formatCurrency(200000 - cartTotal)} để miễn phí
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address Info */}
        {orderType === 'delivery' && address && (
          <div className="mb-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg mt-1">
                <FiMapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">Địa chỉ giao hàng</p>
                <p className="text-gray-600 text-sm">{address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Phone Info */}
        {phone && (
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FiPhone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Số điện thoại</p>
                <p className="text-gray-600">{phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Store Info for Pickup */}
        {orderType === 'pickup' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-bold text-green-800 mb-2">Thông tin cửa hàng</h4>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <FiMapPin className="w-4 h-4" />
                <span>123 Nguyễn Văn Cừ, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4" />
                <span>(028) 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>Mở cửa: 6:00 - 22:00 hàng ngày</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-2">
            <FiInfo className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="space-y-1 text-xs">
                <li>• Thời gian có thể thay đổi tùy theo tình hình giao thông</li>
                <li>• Shipper sẽ gọi điện trước khi giao hàng 5-10 phút</li>
                <li>• Đơn hàng sẽ được chuẩn bị ngay sau khi xác nhận</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
