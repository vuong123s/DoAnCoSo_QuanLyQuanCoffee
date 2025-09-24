import React from 'react';
import { FiMapPin, FiUsers } from 'react-icons/fi';

const AreaPreview = ({ area, tableCount = 0, totalCapacity = 0, className = "" }) => {
  // Area images mapping
  const areaImages = {
    'Tầng 1': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center',
    'Tầng 2': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop&crop=center',
    'VIP': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center',
    'Sân thượng': 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=400&h=250&fit=crop&crop=center',
    'Ngoài trời': 'https://images.unsplash.com/photo-1552566651-6e4e3b7a8f8b?w=400&h=250&fit=crop&crop=center'
  };

  // Area descriptions
  const areaDescriptions = {
    'Tầng 1': 'Khu vực chính với không gian rộng rãi',
    'Tầng 2': 'Tầng trên yên tĩnh với phòng riêng',
    'VIP': 'Khu vực cao cấp với dịch vụ đặc biệt',
    'Sân thượng': 'Không gian mở với tầm nhìn đẹp',
    'Ngoài trời': 'Sân vườn xanh mát tự nhiên'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="relative h-32">
        <img
          src={areaImages[area] || areaImages['Tầng 1']}
          alt={area}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 rounded text-xs font-medium">
          {area}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 mb-1">{area}</h3>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {areaDescriptions[area] || 'Khu vực trong nhà hàng'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <FiMapPin className="w-3 h-3 mr-1" />
            {tableCount} bàn
          </span>
          {totalCapacity > 0 && (
            <span className="flex items-center">
              <FiUsers className="w-3 h-3 mr-1" />
              {totalCapacity} chỗ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaPreview;
