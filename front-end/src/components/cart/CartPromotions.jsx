import React, { useState, useEffect } from 'react';
import { 
  FiGift, 
  FiPercent, 
  FiTruck, 
  FiClock, 
  FiStar,
  FiArrowRight,
  FiX,
  FiShoppingBag
} from 'react-icons/fi';

const CartPromotions = ({ 
  cartTotal, 
  itemCount, 
  onAddItem,
  className = '' 
}) => {
  const [activePromotions, setActivePromotions] = useState([]);
  const [dismissedPromotions, setDismissedPromotions] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Sample promotions data
  const promotions = [
    {
      id: 'free-shipping',
      type: 'shipping',
      title: 'Miễn phí giao hàng',
      description: 'Thêm {amount} để được miễn phí giao hàng',
      threshold: 200000,
      icon: FiTruck,
      color: 'blue',
      priority: 1
    },
    {
      id: 'combo-deal',
      type: 'combo',
      title: 'Combo tiết kiệm',
      description: 'Thêm 1 bánh ngọt để được giảm 15%',
      threshold: 0,
      icon: FiGift,
      color: 'purple',
      priority: 2,
      action: 'add-dessert'
    },
    {
      id: 'bulk-discount',
      type: 'quantity',
      title: 'Giảm giá số lượng',
      description: 'Mua thêm {count} món để được giảm 10%',
      threshold: 5,
      icon: FiPercent,
      color: 'green',
      priority: 3
    },
    {
      id: 'happy-hour',
      type: 'time',
      title: 'Giờ vàng',
      description: 'Giảm 20% cho đơn hàng từ 14:00-16:00',
      threshold: 0,
      icon: FiClock,
      color: 'orange',
      priority: 4,
      timeDependent: true
    }
  ];

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    const applicable = promotions.filter(promo => {
      if (dismissedPromotions.includes(promo.id)) return false;
      
      switch (promo.type) {
        case 'shipping':
          return cartTotal < promo.threshold && cartTotal > 0;
        case 'quantity':
          return itemCount < promo.threshold && itemCount > 0;
        case 'time':
          return hour >= 14 && hour < 16;
        case 'combo':
          return cartTotal > 100000;
        default:
          return false;
      }
    }).sort((a, b) => a.priority - b.priority);

    setActivePromotions(applicable.slice(0, 2)); // Show max 2 promotions
  }, [cartTotal, itemCount, dismissedPromotions]);

  const dismissPromotion = (promoId) => {
    setDismissedPromotions(prev => [...prev, promoId]);
  };

  const getPromotionContent = (promo) => {
    switch (promo.type) {
      case 'shipping':
        const remaining = promo.threshold - cartTotal;
        return promo.description.replace('{amount}', formatCurrency(remaining));
      case 'quantity':
        const remainingCount = promo.threshold - itemCount;
        return promo.description.replace('{count}', remainingCount);
      default:
        return promo.description;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
      green: 'from-green-500 to-green-600 bg-green-50 border-green-200 text-green-700',
      orange: 'from-orange-500 to-orange-600 bg-orange-50 border-orange-200 text-orange-700'
    };
    return colors[color] || colors.blue;
  };

  if (activePromotions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <FiGift className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-gray-800">Ưu đãi dành cho bạn</h3>
      </div>

      {activePromotions.map((promo) => {
        const IconComponent = promo.icon;
        const colorClasses = getColorClasses(promo.color);
        
        return (
          <div
            key={promo.id}
            className={`
              relative overflow-hidden rounded-2xl border-2 p-4
              ${colorClasses.split(' ').slice(2).join(' ')}
              transition-all duration-300 hover:shadow-md
            `}
          >
            {/* Background Gradient */}
            <div className={`
              absolute inset-0 bg-gradient-to-r opacity-10
              ${colorClasses.split(' ').slice(0, 2).join(' ')}
            `} />
            
            {/* Content */}
            <div className="relative flex items-start space-x-3">
              {/* Icon */}
              <div className={`
                p-2 rounded-xl bg-gradient-to-r text-white
                ${colorClasses.split(' ').slice(0, 2).join(' ')}
              `}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 mb-1">
                  {promo.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {getPromotionContent(promo)}
                </p>

                {/* Progress Bar (for threshold-based promotions) */}
                {(promo.type === 'shipping' || promo.type === 'quantity') && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Tiến độ</span>
                      <span>
                        {promo.type === 'shipping' 
                          ? `${formatCurrency(cartTotal)} / ${formatCurrency(promo.threshold)}`
                          : `${itemCount} / ${promo.threshold} món`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`
                          h-2 rounded-full bg-gradient-to-r transition-all duration-500
                          ${colorClasses.split(' ').slice(0, 2).join(' ')}
                        `}
                        style={{
                          width: `${Math.min(100, (promo.type === 'shipping' 
                            ? (cartTotal / promo.threshold) 
                            : (itemCount / promo.threshold)
                          ) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {promo.action && (
                  <button
                    onClick={() => onAddItem && onAddItem(promo.action)}
                    className={`
                      inline-flex items-center space-x-2 px-4 py-2 rounded-lg
                      bg-gradient-to-r text-white font-medium text-sm
                      hover:shadow-md transition-all transform hover:scale-105
                      ${colorClasses.split(' ').slice(0, 2).join(' ')}
                    `}
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    <span>Thêm ngay</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => dismissPromotion(promo.id)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Additional Suggestions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
        <div className="flex items-center space-x-2 mb-2">
          <FiStar className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-amber-800">Gợi ý cho bạn</span>
        </div>
        <p className="text-sm text-amber-700 mb-3">
          Khách hàng thường đặt thêm bánh ngọt hoặc nước ép khi order cà phê
        </p>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
            + Bánh croissant
          </button>
          <button className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
            + Nước cam
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPromotions;
