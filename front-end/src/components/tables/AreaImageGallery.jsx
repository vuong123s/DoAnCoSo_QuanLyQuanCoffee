import React, { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiUsers } from 'react-icons/fi';

const AreaImageGallery = ({ area, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Enhanced image collections for each area type
  const getAreaImages = (areaName) => {
    const baseImages = {
      'Tầng 1': [
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Khu vực chính - Tầng 1',
          description: 'Không gian rộng rãi với ánh sáng tự nhiên, gần quầy bar và bếp'
        },
        {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Khu vực cửa sổ',
          description: 'Bàn gần cửa sổ với tầm nhìn ra ngoài đường'
        },
        {
          url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Quầy bar',
          description: 'Khu vực quầy bar hiện đại với ghế cao'
        }
      ],
      'Tầng 2': [
        {
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Tầng 2 - Khu vực yên tĩnh',
          description: 'Không gian riêng tư và yên tĩnh cho các cuộc họp'
        },
        {
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Phòng riêng nhỏ',
          description: 'Phòng riêng cho 4-6 người'
        },
        {
          url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Ban công tầng 2',
          description: 'Ban công nhỏ với tầm nhìn đẹp'
        }
      ],
      'VIP': [
        {
          url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Phòng VIP cao cấp',
          description: 'Phòng riêng sang trọng với dịch vụ đặc biệt'
        },
        {
          url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Khu vực VIP',
          description: 'Không gian cao cấp với nội thất sang trọng'
        },
        {
          url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Phòng họp VIP',
          description: 'Phòng họp riêng với đầy đủ tiện nghi'
        }
      ],
      'Sân thượng': [
        {
          url: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Sân thượng - Tầm nhìn toàn cảnh',
          description: 'Không gian mở với tầm nhìn đẹp ra thành phố'
        },
        {
          url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Khu vực có mái che',
          description: 'Khu vực có mái che cho những ngày mưa'
        },
        {
          url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Góc thư giãn',
          description: 'Góc thư giãn với ghế sofa thoải mái'
        }
      ],
      'Ngoài trời': [
        {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Sân vườn xanh mát',
          description: 'Không gian ngoài trời với cây xanh tự nhiên'
        },
        {
          url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Khu vực dưới bóng cây',
          description: 'Bàn ghế dưới bóng cây mát mẻ'
        },
        {
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          title: 'Góc sân vườn',
          description: 'Góc yên tĩnh trong sân vườn'
        }
      ]
    };

    // Find matching key or use default
    const matchingKey = Object.keys(baseImages).find(key => 
      areaName?.toLowerCase().includes(key.toLowerCase())
    );
    
    return baseImages[matchingKey] || baseImages['Tầng 1'];
  };

  const images = getAreaImages(area?.TenKhuVuc);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentImageIndex(prev => 
            prev === 0 ? images.length - 1 : prev - 1
          );
          break;
        case 'ArrowRight':
          setCurrentImageIndex(prev => 
            prev === images.length - 1 ? 0 : prev + 1
          );
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, images.length, onClose]);

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  if (!isOpen || !area) return null;

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-colors"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-colors"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="relative">
          <img
            src={currentImage.url}
            alt={currentImage.title}
            className="w-full h-[70vh] object-cover rounded-lg"
          />
          
          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">{currentImage.title}</h3>
              <p className="text-lg opacity-90 mb-3">{currentImage.description}</p>
              
              {/* Area Info */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <FiMapPin className="w-4 h-4 mr-1" />
                  <span>{area.TenKhuVuc}</span>
                </div>
                {area.table_count && (
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span>{area.table_count} bàn</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-amber-500 opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaImageGallery;
