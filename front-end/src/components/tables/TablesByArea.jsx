import React, { useState, useEffect } from 'react';
import { tableAPI, areaAPI } from '../../shared/services/api';
import { FiUsers, FiMapPin, FiClock, FiCheck, FiX, FiCamera, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AreaImageGallery from './AreaImageGallery';

const TablesByArea = ({ 
  onTableSelect, 
  selectedTableIds = [], 
  isMultipleSelect = false,
  showReservations = false,
  reservationDate = null,
  reservationTime = null 
}) => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryArea, setGalleryArea] = useState(null);

  // Enhanced area images mapping with fallbacks
  const getAreaImage = (areaName) => {
    const imageMap = {
      'Tầng 1': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'Tầng 2': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'VIP': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'Sân thượng': 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'Ngoài trời': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    };
    
    // Find matching key or use default
    const matchingKey = Object.keys(imageMap).find(key => 
      areaName?.toLowerCase().includes(key.toLowerCase())
    );
    
    return imageMap[matchingKey] || imageMap['Tầng 1'];
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      fetchTablesByArea(selectedArea.MaKhuVuc);
    }
  }, [selectedArea, reservationDate, reservationTime]);

  const fetchAreas = async () => {
    try {
      const response = await areaAPI.getAreas();
      if (response.data.success) {
        setAreas(response.data.areas);
        if (response.data.areas.length > 0) {
          setSelectedArea(response.data.areas[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast.error('Lỗi khi tải danh sách khu vực');
    } finally {
      setLoading(false);
    }
  };

  const fetchTablesByArea = async (areaId) => {
    try {
      setLoading(true);
      const params = {
        real_time_status: 'true'
      };
      
      if (reservationDate && reservationTime) {
        params.date = reservationDate;
        params.time = reservationTime;
        params.duration = 120; // Default 2 hours
      }
      
      const response = await areaAPI.getTablesByArea(areaId, params);
      if (response.data.success) {
        setTables(response.data.tables);
      }
      console.log(response.data.tables)
    } catch (error) {
      console.error('Error fetching tables by area:', error);
      toast.error('Lỗi khi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'Trống':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'Đã đặt':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Đang phục vụ':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'Bảo trì':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTableStatusIcon = (status) => {
    switch (status) {
      case 'Trống':
        return <FiCheck className="w-4 h-4" />;
      case 'Đã đặt':
        return <FiClock className="w-4 h-4" />;
      case 'Đang phục vụ':
        return <FiUsers className="w-4 h-4" />;
      case 'Bảo trì':
        return <FiX className="w-4 h-4" />;
      default:
        return <FiUsers className="w-4 h-4" />;
    }
  };

  const isTableSelected = (table) => {
    const tableId = table.MaBan || table.id;
    return selectedTableIds.includes(tableId);
  };

  const canSelectTable = (table) => {
    // Use real-time status if available, otherwise fall back to TrangThai
    const status = table.real_time_status || table.TrangThai;
    const isAvailable = table.is_available !== undefined ? table.is_available : (status === 'Trống');
    
    if (!isMultipleSelect) return isAvailable;
    return isAvailable && !isTableSelected(table);
  };

  const handleTableClick = (table) => {
    if (!canSelectTable(table) && !isTableSelected(table)) {
      toast.error('Bàn này không thể chọn');
      return;
    }

    if (onTableSelect) {
      onTableSelect(table);
    }

    if (isMultipleSelect) {
      const action = isTableSelected(table) ? 'Đã bỏ chọn' : 'Đã chọn';
      toast.success(`${action} ${table.TenBan}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Area Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {areas.map((area) => (
          <div
            key={area.MaKhuVuc}
            onClick={() => setSelectedArea(area)}
            className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
              selectedArea?.MaKhuVuc === area.MaKhuVuc
                ? 'ring-4 ring-amber-500 shadow-xl transform scale-105'
                : 'hover:shadow-lg hover:scale-102'
            }`}
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={area.HinhAnh || getAreaImage(area.TenKhuVuc)}
                alt={area.TenKhuVuc}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.src = getAreaImage(area.TenKhuVuc);
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h3 className="font-semibold text-sm">{area.TenKhuVuc}</h3>
              <p className="text-xs opacity-90">{area.table_count || 0} bàn</p>
            </div>
            {selectedArea?.MaKhuVuc === area.MaKhuVuc && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Area Header */}
      {selectedArea && (
        <div className="relative rounded-xl overflow-hidden">
          <div className="h-48 relative">
            <img
              src={selectedArea.HinhAnh || getAreaImage(selectedArea.TenKhuVuc)}
              alt={selectedArea.TenKhuVuc}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getAreaImage(selectedArea.TenKhuVuc);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-between p-6">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">{selectedArea.TenKhuVuc}</h2>
                <p className="text-lg opacity-90">{selectedArea.MoTa || 'Khu vực phục vụ khách hàng'}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <FiMapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{tables.length} bàn</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {selectedArea.Video && (
                  <button 
                    onClick={() => window.open(selectedArea.Video, '_blank')}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                    title="Xem video giới thiệu"
                  >
                    <FiPlay className="w-6 h-6 text-white" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    setGalleryArea(selectedArea);
                    setShowGallery(true);
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                  title="Xem thư viện ảnh"
                >
                  <FiCamera className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const isSelected = isTableSelected(table);
          const canSelect = canSelectTable(table);
          const displayStatus = table.real_time_status || table.TrangThai;
          
          return (
            <div
              key={table.MaBan}
              onClick={() => handleTableClick(table)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-200 transform scale-105'
                  : getTableStatusColor(displayStatus)
              } ${
                !canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getTableStatusIcon(displayStatus)}
                </div>
                <h3 className="font-semibold text-sm mb-1">{table.TenBan}</h3>
                <div className="flex items-center justify-center text-xs mb-1">
                  <FiUsers className="w-3 h-3 mr-1" />
                  <span>{table.SoCho} chỗ</span>
                </div>
                {table.ViTri && (
                  <div className="flex items-center justify-center text-xs">
                    <FiMapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{table.ViTri}</span>
                  </div>
                )}
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-current bg-opacity-20">
                    {displayStatus}
                  </span>
                </div>
                
                {/* Show next reservation info if available */}
                {table.next_reservation && (
                  <div className="mt-1 text-xs text-gray-600">
                    <FiClock className="w-3 h-3 inline mr-1" />
                    {table.next_reservation.GioDat}
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm">Trống</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span className="text-sm">Đã đặt</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-sm">Đang phục vụ</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
          <span className="text-sm">Bảo trì</span>
        </div>
        {isMultipleSelect && (
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
            <span className="text-sm">Đã chọn</span>
          </div>
        )}
      </div>

      {/* Area Image Gallery Modal */}
      {showGallery && galleryArea && (
        <AreaImageGallery
          area={galleryArea}
          isOpen={showGallery}
          onClose={() => {
            setShowGallery(false);
            setGalleryArea(null);
          }}
        />
      )}
    </div>
  );
};

export default TablesByArea;
