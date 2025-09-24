import React, { useState, useEffect } from 'react';
import { tableAPI } from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';
import AreaImageGallery from './AreaImageGallery';
import { FiUsers, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TablesByArea = ({ 
  onTableSelect, 
  selectedTableId, 
  selectedTableIds = [], 
  isMultipleSelect = false, 
  showReservations = false 
}) => {
  const [areas, setAreas] = useState([]);
  const [tablesByArea, setTablesByArea] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [galleryArea, setGalleryArea] = useState('');

  // Area images mapping
  const areaImages = {
    'Tầng 1': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center',
    'Tầng 2': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop&crop=center',
    'VIP': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center',
    'Sân thượng': 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=300&h=200&fit=crop&crop=center',
    'Ngoài trời': 'https://images.unsplash.com/photo-1552566651-6e4e3b7a8f8b?w=300&h=200&fit=crop&crop=center'
  };

  // Area descriptions
  const areaDescriptions = {
    'Tầng 1': 'Khu vực chính với không gian rộng rãi, gần quầy bar và bếp',
    'Tầng 2': 'Tầng trên yên tĩnh với các phòng riêng và ban công',
    'VIP': 'Khu vực cao cấp với phòng riêng sang trọng và dịch vụ đặc biệt',
    'Sân thượng': 'Không gian mở với tầm nhìn đẹp và không khí trong lành',
    'Ngoài trời': 'Sân vườn xanh mát với không gian tự nhiên thư giãn'
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      fetchTablesByArea(selectedArea);
    }
  }, [selectedArea, showReservations]);

  const fetchAreas = async () => {
    try {
      const response = await tableAPI.getAreas();
      const areasData = response.data.areas || [];
      setAreas(areasData);
      
      // Auto-select first area
      if (areasData.length > 0) {
        setSelectedArea(areasData[0].name);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error('Có lỗi khi tải danh sách khu vực');
    }
  };

  const fetchTablesByArea = async (area) => {
    try {
      setLoading(true);
      const response = await tableAPI.getTablesByArea(area, { include_reservations: showReservations });
      setTablesByArea(prev => ({
        ...prev,
        [area]: response.data.tables || []
      }));
    } catch (error) {
      console.error('Error fetching tables by area:', error);
      toast.error(`Có lỗi khi tải danh sách bàn cho khu vực ${area}`);
    } finally {
      setLoading(false);
    }
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'Trống':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Đã đặt':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Đang phục vụ':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTableStatusIcon = (status) => {
    switch (status) {
      case 'Trống':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'Đã đặt':
        return <FiClock className="w-4 h-4" />;
      case 'Đang phục vụ':
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return <FiMapPin className="w-4 h-4" />;
    }
  };

  const handleTableClick = (table) => {
    // Only allow selection of available tables
    const isAvailable = table.TrangThai === 'Trống' || table.TrangThai === 'available';
    
    if (!isAvailable && isMultipleSelect) {
      toast.error('Chỉ có thể chọn bàn trống');
      return;
    }
    
    if (onTableSelect) {
      onTableSelect(table);
    }
  };

  const openGallery = (area) => {
    setGalleryArea(area);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryArea('');
  };

  const currentTables = tablesByArea[selectedArea] || [];

  return (
    <div className="space-y-6">
      {/* Area Selector with Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {areas.map((area) => (
          <div
            key={area.name}
            className={`relative rounded-lg overflow-hidden transition-all transform hover:scale-105 cursor-pointer ${
              selectedArea === area.name
                ? 'ring-2 ring-amber-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedArea(area.name)}
          >
            {/* Area Image */}
            <div className="relative h-32">
              <img
                src={areaImages[area.name] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center'}
                alt={area.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center';
                }}
              />
              {/* Overlay */}
              <div className={`absolute inset-0 transition-all ${
                selectedArea === area.name
                  ? 'bg-amber-600 bg-opacity-20'
                  : 'bg-black bg-opacity-20 hover:bg-opacity-10'
              }`}></div>
              
              {/* Selected indicator */}
              {selectedArea === area.name && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
              )}

              {/* Gallery button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openGallery(area.name);
                }}
                className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
                title="Xem thêm hình ảnh"
              >
                <FiCamera className="w-4 h-4" />
              </button>
            </div>

            {/* Area Info */}
            <div className="p-3 bg-white">
              <div className="font-semibold text-gray-900 mb-1">{area.name}</div>
              <div className="text-xs text-gray-600 mb-2">{area.table_count} bàn</div>
              <div className="text-xs text-gray-500 line-clamp-2">
                {areaDescriptions[area.name] || 'Khu vực trong nhà hàng'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Area Header */}
      {selectedArea && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative h-48">
            <img
              src={areaImages[selectedArea]}
              alt={selectedArea}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedArea}</h2>
                  <p className="text-gray-200 mb-2">{areaDescriptions[selectedArea]}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      {currentTables.length} bàn
                    </span>
                    <span className="flex items-center">
                      <FiUsers className="w-4 h-4 mr-1" />
                      {currentTables.reduce((total, table) => total + (table.SoCho || 0), 0)} chỗ ngồi
                    </span>
                  </div>
                </div>
                
                {/* Gallery button for selected area */}
                <button
                  onClick={() => openGallery(selectedArea)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all flex items-center space-x-2"
                  title="Xem thêm hình ảnh"
                >
                  <FiCamera className="w-4 h-4" />
                  <span className="text-sm">Xem thêm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Display */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div>

          {currentTables.length === 0 ? (
            <div className="text-center py-8">
              <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có bàn nào trong khu vực này</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentTables.map((table) => {
                const tableId = table.MaBan || table.id;
                const isSelected = isMultipleSelect 
                  ? selectedTableIds.includes(tableId)
                  : selectedTableId === tableId;
                const isAvailable = table.TrangThai === 'Trống' || table.TrangThai === 'available';
                
                return (
                <div
                  key={tableId}
                  onClick={() => handleTableClick(table)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                      : isAvailable
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Table Number */}
                  <div className="text-center mb-2">
                    <div className="text-lg font-bold text-gray-900">
                      {table.TenBan}
                    </div>
                  </div>

                  {/* Table Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <FiUsers className="w-3 h-3 mr-1" />
                      <span>{table.SoCho} chỗ</span>
                    </div>

                    {table.ViTri && (
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        <span>{table.ViTri}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getTableStatusColor(table.TrangThai)}`}>
                      {getTableStatusIcon(table.TrangThai)}
                      <span className="hidden sm:inline">{table.TrangThai}</span>
                    </div>
                  </div>

                  {/* Reservations Info */}
                  {showReservations && table.datban && table.datban.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        <div className="font-medium">Đặt chỗ hôm nay:</div>
                        {table.datban.slice(0, 2).map((reservation, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{reservation.GioDat}</span>
                            <span>{reservation.TenKhach}</span>
                          </div>
                        ))}
                        {table.datban.length > 2 && (
                          <div className="text-center text-gray-500">
                            +{table.datban.length - 2} khác
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected indicator for multi-select */}
                  {isSelected && isMultipleSelect && (
                    <div className="absolute inset-0 border-2 border-amber-500 rounded-lg pointer-events-none">
                      <div className="absolute top-1 left-1 w-3 h-3 bg-amber-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Đã đặt</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span>Đang phục vụ</span>
        </div>
        {isMultipleSelect && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded"></div>
            <span>Đã chọn</span>
          </div>
        )}
      </div>

      {/* Multi-select instruction */}
      {isMultipleSelect && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-sm">
            💡 <strong>Hướng dẫn:</strong> Nhấn vào bàn trống để chọn/bỏ chọn. 
            Chỉ có thể chọn bàn có trạng thái "Trống".
          </p>
        </div>
      )}

      {/* Image Gallery Modal */}
      <AreaImageGallery 
        area={galleryArea}
        isOpen={showGallery}
        onClose={closeGallery}
      />
    </div>
  );
};

export default TablesByArea;
