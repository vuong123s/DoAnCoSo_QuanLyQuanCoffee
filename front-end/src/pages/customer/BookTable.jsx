import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUsers, FiPhone, FiUser, FiMessageSquare, FiCheckCircle, FiArrowLeft, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import { reservationAPI } from '../../services/api';
import TablesByArea from '../../components/TablesByArea';

const BookTable = () => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [isMultipleBooking, setIsMultipleBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Select Table, 3: Confirmation
  const [reservationData, setReservationData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm({
    defaultValues: {
      NgayDat: new Date().toISOString().split('T')[0],
      GioDat: '12:00',
      GioKetThuc: '14:00',
      SoNguoi: 2,
      TenKhach: '',
      SoDienThoai: '',
      GhiChu: ''
    }
  });

  const watchedValues = watch(['NgayDat', 'GioDat', 'GioKetThuc', 'SoNguoi']);

  const fetchAvailableTables = useCallback(async (NgayDat, GioDat, GioKetThuc, SoNguoi) => {
    try {
      setLoading(true);
      console.log('🔍 Frontend sending params:', { NgayDat, GioDat, GioKetThuc, SoNguoi });
      const response = await reservationAPI.getAvailableTables({ NgayDat, GioDat, GioKetThuc, SoNguoi });
      
      if (response.data.success) {
        setAvailableTables(response.data.data.available_tables);
      } else {
        toast.error('Không thể lấy danh sách bàn trống');
      }
    } catch (error) {
      console.error('Error fetching available tables:', error);
      toast.error('Lỗi khi lấy danh sách bàn trống');
      setAvailableTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available tables when date, time, or party size changes
  useEffect(() => {
    const [NgayDat, GioDat, GioKetThuc, SoNguoi] = watchedValues;
    if (NgayDat && GioDat && GioKetThuc && SoNguoi && step === 2) {
      fetchAvailableTables(NgayDat, GioDat, GioKetThuc, SoNguoi);
    }
  }, [watchedValues[0], watchedValues[1], watchedValues[2], watchedValues[3], step, fetchAvailableTables]);

  const onSubmitForm = (data) => {
    // Kiểm tra thời gian hợp lệ
    if (data.GioDat >= data.GioKetThuc) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }
    
    setReservationData(data);
    setStep(2);
    fetchAvailableTables(data.NgayDat, data.GioDat, data.GioKetThuc, data.SoNguoi);
  };

  const handleTableSelect = (table) => {
    if (isMultipleBooking) {
      // Multi-select mode: toggle table in/out of selection
      const tableId = table.MaBan || table.id;
      const isAlreadySelected = selectedTables.some(t => (t.MaBan || t.id) === tableId);
      
      if (isAlreadySelected) {
        // Remove table from selection
        setSelectedTables(prev => prev.filter(t => (t.MaBan || t.id) !== tableId));
        toast.success(`Đã bỏ chọn ${table.TenBan || table.name || `Bàn ${tableId}`}`);
      } else {
        // Add table to selection (max 10 tables)
        if (selectedTables.length >= 10) {
          toast.error('Chỉ có thể chọn tối đa 10 bàn');
          return;
        }
        setSelectedTables(prev => [...prev, table]);
        toast.success(`Đã chọn ${table.TenBan || table.name || `Bàn ${tableId}`}`);
      }
    } else {
      // Single select mode
      setSelectedTable(table);
    }
  };

  const removeTableFromSelection = (tableId) => {
    setSelectedTables(prev => prev.filter(t => (t.MaBan || t.id) !== tableId));
  };

  const clearAllSelections = () => {
    setSelectedTables([]);
    setSelectedTable(null);
  };

  const handleConfirmReservation = async () => {
    // Validate required fields for guest booking
    if (!reservationData.TenKhach || !reservationData.SoDienThoai) {
      toast.error('Vui lòng nhập đầy đủ thông tin khách hàng');
      return;
    }

    if (isMultipleBooking) {
      // Multiple booking validation
      if (selectedTables.length === 0) {
        toast.error('Vui lòng chọn ít nhất một bàn');
        return;
      }

      try {
        setLoading(true);
        
        // Create multiple individual reservations
        const reservationPromises = selectedTables.map(table => {
          const bookingData = {
            ...reservationData,
            MaBan: table.MaBan || table.id,
            GhiChu: `${reservationData.GhiChu || ''} - Đặt nhóm ${selectedTables.length} bàn`.trim()
          };
          return reservationAPI.createReservation(bookingData);
        });

        const results = await Promise.all(reservationPromises);
        const successCount = results.filter(r => r.data.success).length;
        
        if (successCount === selectedTables.length) {
          setStep(3);
          toast.success(`Đặt thành công ${successCount} bàn!`);
        } else {
          toast.error(`Chỉ đặt được ${successCount}/${selectedTables.length} bàn`);
        }
      } catch (error) {
        console.error('Error creating multiple reservations:', error);
        toast.error('Lỗi khi đặt nhiều bàn');
      } finally {
        setLoading(false);
      }
    } else {
      // Single booking
      if (!selectedTable) {
        toast.error('Vui lòng chọn bàn');
        return;
      }

      try {
        setLoading(true);
        const bookingData = {
          ...reservationData,
          MaBan: selectedTable.MaBan
        };

        const response = await reservationAPI.createReservation(bookingData);
        
        if (response.data.success) {
          setStep(3);
          toast.success('Đặt bàn thành công!');
        } else {
          toast.error(response.data.error || 'Không thể đặt bàn');
        }
      } catch (error) {
        console.error('Error creating reservation:', error);
        toast.error(error.response?.data?.error || 'Lỗi khi đặt bàn');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTable(null);
    setSelectedTables([]);
    setReservationData(null);
    setAvailableTables([]);
    setIsMultipleBooking(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {isMultipleBooking ? 'Đặt Nhiều Bàn Thành Công!' : 'Đặt Bàn Thành Công!'}
            </h1>
            
            <p className="text-gray-600 mb-8">
              {isMultipleBooking 
                ? `Cảm ơn bạn đã đặt ${selectedTables.length} bàn tại Coffee Shop. Chúng tôi sẽ liên hệ với bạn để xác nhận.`
                : 'Cảm ơn bạn đã đặt bàn tại Coffee Shop. Chúng tôi sẽ liên hệ với bạn để xác nhận.'
              }
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-800 mb-4">Thông tin đặt bàn:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Tên khách hàng:</span> {reservationData?.TenKhach}</p>
                <p><span className="font-medium">Số điện thoại:</span> {reservationData?.SoDienThoai}</p>
                <p><span className="font-medium">Ngày:</span> {formatDate(reservationData?.NgayDat)}</p>
                <p><span className="font-medium">Thời gian:</span> {reservationData?.GioDat} - {reservationData?.GioKetThuc}</p>
                <p><span className="font-medium">Số người:</span> {reservationData?.SoNguoi} người</p>
                
                {isMultipleBooking ? (
                  <div>
                    <p><span className="font-medium">Số bàn đã đặt:</span> {selectedTables.length} bàn</p>
                    <div className="mt-3">
                      <p className="font-medium mb-2">Danh sách bàn:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTables.map((table, index) => (
                          <div key={table.MaBan || table.id} className="bg-white border rounded p-2">
                            <p className="font-medium text-xs">
                              {table.TenBan || table.name || `Bàn ${table.MaBan || table.id}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Sức chứa: {table.SoCho || table.capacity} người
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p><span className="font-medium">Bàn:</span> {selectedTable?.TenBan} (Sức chứa: {selectedTable?.SoCho} người)</p>
                )}
                
                {reservationData?.GhiChu && (
                  <p><span className="font-medium">Ghi chú:</span> {reservationData.GhiChu}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Đặt Bàn Khác
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Đặt Bàn</h1>
          <p className="text-gray-600 text-lg mb-4">
            Đặt bàn trước để có trải nghiệm tốt nhất tại Coffee Shop
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 text-sm">
              💡 <strong>Lưu ý:</strong> Bạn có thể đặt bàn mà không cần đăng nhập. 
              Chỉ cần điền thông tin liên hệ để chúng tôi xác nhận đặt bàn.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-amber-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-amber-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Thông Tin Đặt Bàn</h2>
                
                {/* Multiple booking toggle */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Đặt nhiều bàn</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMultipleBooking(!isMultipleBooking);
                      clearAllSelections();
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      isMultipleBooking ? 'bg-amber-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isMultipleBooking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  
                </div>
              </div>

              {/* Booking type explanation */}
              <div className={`mb-6 p-4 rounded-lg border ${
                isMultipleBooking 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm ${
                  isMultipleBooking ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {isMultipleBooking 
                    ? '🎉 Đặt nhiều bàn: Nhấn vào bàn để chọn/bỏ chọn. Tối đa 10 bàn cho sự kiện lớn'
                    : '👤 Đặt bàn đơn: Chọn một bàn cho gia đình hoặc nhóm nhỏ'
                  }
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên khách hàng */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="w-4 h-4 inline mr-2" />
                      Tên khách hàng *
                    </label>
                    <input
                      type="text"
                      {...register('TenKhach', { 
                        required: 'Vui lòng nhập tên khách hàng',
                        minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Nhập tên của bạn"
                    />
                    {errors.TenKhach && (
                      <p className="text-red-500 text-sm mt-1">{errors.TenKhach.message}</p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="w-4 h-4 inline mr-2" />
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      {...register('SoDienThoai', { 
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: 'Số điện thoại không hợp lệ'
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                    {errors.SoDienThoai && (
                      <p className="text-red-500 text-sm mt-1">{errors.SoDienThoai.message}</p>
                    )}
                  </div>

                  {/* Ngày đặt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiCalendar className="w-4 h-4 inline mr-2" />
                      Ngày đặt *
                    </label>
                    <input
                      type="date"
                      {...register('NgayDat', { 
                        required: 'Vui lòng chọn ngày',
                        validate: (value) => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return selectedDate >= today || 'Không thể đặt bàn cho ngày trong quá khứ';
                        }
                      })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    {errors.NgayDat && (
                      <p className="text-red-500 text-sm mt-1">{errors.NgayDat.message}</p>
                    )}
                  </div>

                  {/* Giờ bắt đầu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiClock className="w-4 h-4 inline mr-2" />
                      Giờ bắt đầu *
                    </label>
                    <select
                      {...register('GioDat', { required: 'Vui lòng chọn giờ bắt đầu' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {Array.from({ length: 14 }, (_, i) => {
                        const hour = i + 7; // 7AM to 8PM
                        return (
                          <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </select>
                    {errors.GioDat && (
                      <p className="text-red-500 text-sm mt-1">{errors.GioDat.message}</p>
                    )}
                  </div>

                  {/* Giờ kết thúc */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiClock className="w-4 h-4 inline mr-2" />
                      Giờ kết thúc *
                    </label>
                    <select
                      {...register('GioKetThuc', { 
                        required: 'Vui lòng chọn giờ kết thúc',
                        validate: (value) => {
                          const startTime = getValues('GioDat');
                          return value > startTime || 'Giờ kết thúc phải sau giờ bắt đầu';
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {Array.from({ length: 15 }, (_, i) => {
                        const hour = i + 8; // 8AM to 10PM
                        return (
                          <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </select>
                    {errors.GioKetThuc && (
                      <p className="text-red-500 text-sm mt-1">{errors.GioKetThuc.message}</p>
                    )}
                  </div>

                  {/* Số người */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUsers className="w-4 h-4 inline mr-2" />
                      Số người *
                    </label>
                    <select
                      {...register('SoNguoi', { 
                        required: 'Vui lòng chọn số người',
                        min: { value: 1, message: 'Số người phải ít nhất 1' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} người
                        </option>
                      ))}
                    </select>
                    {errors.SoNguoi && (
                      <p className="text-red-500 text-sm mt-1">{errors.SoNguoi.message}</p>
                    )}
                  </div>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMessageSquare className="w-4 h-4 inline mr-2" />
                    Ghi chú
                  </label>
                  <textarea
                    {...register('GhiChu')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Yêu cầu đặc biệt (tùy chọn)"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    Tiếp Tục
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isMultipleBooking ? `Chọn Nhiều Bàn (${selectedTables.length}/10)` : 'Chọn Bàn'}
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              </div>

              {reservationData && (
                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">Thông tin đặt bàn:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Khách hàng:</span> {reservationData.TenKhach}</p>
                    <p><span className="font-medium">Ngày:</span> {formatDate(reservationData.NgayDat)}</p>
                    <p><span className="font-medium">Thời gian:</span> {reservationData?.GioDat} - {reservationData?.GioKetThuc}</p>
                    <p><span className="font-medium">Số người:</span> {reservationData.SoNguoi} người</p>
                  </div>
                </div>
              )}

              {/* Selected tables display for multiple booking */}
              {isMultipleBooking && selectedTables.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-blue-800">
                      Bàn đã chọn ({selectedTables.length})
                    </h3>
                    <button
                      onClick={clearAllSelections}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {selectedTables.map((table) => {
                      const tableId = table.MaBan || table.id;
                      const tableName = table.TenBan || table.name || `Bàn ${tableId}`;
                      return (
                        <div
                          key={tableId}
                          className="bg-white border border-blue-200 rounded-lg p-2 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">{tableName}</p>
                            <p className="text-xs text-gray-600">
                              <FiUsers className="inline w-3 h-3 mr-1" />
                              {table.SoCho || table.capacity} người
                            </p>
                          </div>
                          <button
                            onClick={() => removeTableFromSelection(tableId)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tables by Area Component */}
              <div className="mb-6">
                <TablesByArea 
                  onTableSelect={handleTableSelect}
                  selectedTableId={selectedTable?.MaBan}
                  selectedTableIds={isMultipleBooking ? selectedTables.map(t => t.MaBan || t.id) : []}
                  isMultipleSelect={isMultipleBooking}
                  showReservations={false}
                />
              </div>

              {/* Single table selection display */}
              {!isMultipleBooking && selectedTable && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">Bàn đã chọn:</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{selectedTable.TenBan}</p>
                      <p className="text-sm text-gray-600">
                        <FiUsers className="inline w-4 h-4 mr-1" />
                        Sức chứa: {selectedTable.SoCho} người
                      </p>
                      {selectedTable.KhuVuc && (
                        <p className="text-sm text-gray-600">
                          Khu vực: {selectedTable.KhuVuc}
                        </p>
                      )}
                      {selectedTable.ViTri && (
                        <p className="text-sm text-gray-600">
                          Vị trí: {selectedTable.ViTri}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation button */}
              <div className="flex justify-center">
                {isMultipleBooking ? (
                  selectedTables.length > 0 && (
                    <button
                      onClick={handleConfirmReservation}
                      disabled={loading}
                      className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>
                        {loading 
                          ? 'Đang đặt bàn...' 
                          : `Xác Nhận Đặt ${selectedTables.length} Bàn`
                        }
                      </span>
                    </button>
                  )
                ) : (
                  selectedTable && (
                    <button
                      onClick={handleConfirmReservation}
                      disabled={loading}
                      className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>{loading ? 'Đang đặt bàn...' : 'Xác Nhận Đặt Bàn'}</span>
                    </button>
                  )
                )}
              </div>

              {/* No selection message */}
              {((isMultipleBooking && selectedTables.length === 0) || (!isMultipleBooking && !selectedTable)) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {isMultipleBooking 
                      ? 'Nhấn vào các bàn để chọn nhiều bàn cùng lúc' 
                      : 'Vui lòng chọn một bàn để tiếp tục'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTable;
