import React, { useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';

const AreaImageGallery = ({ area, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extended image collections for each area
  const areaImageCollections = {
    'Tầng 1': [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
        title: 'Không gian chính tầng 1',
        description: 'Khu vực chính với thiết kế hiện đại và ánh sáng tự nhiên'
      },
      {
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&crop=center',
        title: 'Quầy bar tầng 1',
        description: 'Quầy bar với đầy đủ đồ uống và không gian thoải mái'
      },
      {
        url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop&crop=center',
        title: 'Khu vực gần cửa sổ',
        description: 'Bàn gần cửa sổ với tầm nhìn ra ngoài đường'
      }
    ],
    'Tầng 2': [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&crop=center',
        title: 'Không gian tầng 2',
        description: 'Tầng 2 yên tĩnh với thiết kế ấm cúng'
      },
      {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
        title: 'Phòng riêng tầng 2',
        description: 'Phòng riêng cho các buổi họp hoặc gặp gỡ riêng tư'
      },
      {
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
        title: 'Ban công tầng 2',
        description: 'Ban công nhỏ với không gian thư giãn'
      }
    ],
    'VIP': [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
        title: 'Phòng VIP chính',
        description: 'Phòng VIP sang trọng với dịch vụ cao cấp'
      },
      {
        url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&h=600&fit=crop&crop=center',
        title: 'Phòng VIP lớn',
        description: 'Phòng VIP rộng rãi cho nhóm lớn'
      },
      {
        url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&h=600&fit=crop&crop=center',
        title: 'Khu vực VIP riêng biệt',
        description: 'Không gian VIP với thiết kế đẳng cấp'
      }
    ],
    'Sân thượng': [
      {
        url: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&h=600&fit=crop&crop=center',
        title: 'Sân thượng chính',
        description: 'Sân thượng với tầm nhìn toàn cảnh thành phố'
      },
      {
        url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&h=600&fit=crop&crop=center',
        title: 'Khu vực dưới ô',
        description: 'Không gian có mái che, thoải mái trong mọi thời tiết'
      },
      {
        url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop&crop=center',
        title: 'Góc sân thượng',
        description: 'Góc yên tĩnh với view đẹp'
      }
    ],
    'Ngoài trời': [
      {
        url: 'https://images.unsplash.com/photo-1552566651-6e4e3b7a8f8b?w=800&h=600&fit=crop&crop=center',
        title: 'Sân vườn',
        description: 'Sân vườn xanh mát với cây cối tự nhiên'
      },
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
        title: 'Khu vực dưới cây',
        description: 'Bàn dưới bóng cây mát mẻ'
      },
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
        title: 'Sân hiên ngoài trời',
        description: 'Sân hiên rộng rãi với không gian mở'
      }
    ]
  };

  const images = areaImageCollections[area] || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Main image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          <div className="relative">
            <img
              src={currentImage.url}
              alt={currentImage.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center';
              }}
            />
            <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {area}
            </div>
          </div>
          
          {/* Image info */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentImage.title}</h3>
            <p className="text-gray-600 mb-4">{currentImage.description}</p>
            
            {/* Image counter */}
            {images.length > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {currentImageIndex + 1} / {images.length}
                </div>
                
                {/* Thumbnail navigation */}
                <div className="flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-amber-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaImageGallery;
