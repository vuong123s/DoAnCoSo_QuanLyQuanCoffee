import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUsers, FiPhone, FiUser, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import { reservationAPI } from '../../services/api';

const BookTable = () => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
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
      SoNguoi: 2,
      TenKhach: '',
      SoDienThoai: '',
      GhiChu: ''
    }
  });

  const watchedValues = watch(['NgayDat', 'GioDat', 'SoNguoi']);

  const fetchAvailableTables = useCallback(async (NgayDat, GioDat, SoNguoi) => {
    try {
      setLoading(true);
      const response = await reservationAPI.getAvailableTables({ NgayDat, GioDat, SoNguoi });
      
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
    const [NgayDat, GioDat, SoNguoi] = watchedValues;
    if (NgayDat && GioDat && SoNguoi && step === 2) {
      fetchAvailableTables(NgayDat, GioDat, SoNguoi);
    }
  }, [watchedValues[0], watchedValues[1], watchedValues[2], step, fetchAvailableTables]);

  const onSubmitForm = (data) => {
    setReservationData(data);
    setStep(2);
    fetchAvailableTables(data.NgayDat, data.GioDat, data.SoNguoi);
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleConfirmReservation = async () => {
    if (!selectedTable || !reservationData) {
      toast.error('Vui lòng chọn bàn');
      return;
    }

    // Validate required fields for guest booking
    if (!reservationData.TenKhach || !reservationData.SoDienThoai) {
      toast.error('Vui lòng nhập đầy đủ thông tin khách hàng');
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
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTable(null);
    setReservationData(null);
    setAvailableTables([]);
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
              Đặt Bàn Thành Công!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Cảm ơn bạn đã đặt bàn tại Coffee Shop. Chúng tôi sẽ liên hệ với bạn để xác nhận.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-800 mb-4">Thông tin đặt bàn:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Tên khách hàng:</span> {reservationData?.TenKhach}</p>
                <p><span className="font-medium">Số điện thoại:</span> {reservationData?.SoDienThoai}</p>
                <p><span className="font-medium">Ngày:</span> {formatDate(reservationData?.NgayDat)}</p>
                <p><span className="font-medium">Giờ:</span> {formatTime(reservationData?.GioDat)}</p>
                <p><span className="font-medium">Số người:</span> {reservationData?.SoNguoi} người</p>
                <p><span className="font-medium">Bàn:</span> {selectedTable?.TenBan} (Sức chứa: {selectedTable?.SoCho} người)</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông Tin Đặt Bàn</h2>
              
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

                  {/* Giờ đặt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiClock className="w-4 h-4 inline mr-2" />
                      Giờ đặt *
                    </label>
                    <select
                      {...register('GioDat', { required: 'Vui lòng chọn giờ' })}
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
                <h2 className="text-2xl font-bold text-gray-800">Chọn Bàn</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  ← Quay lại
                </button>
              </div>

              {reservationData && (
                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">Thông tin đặt bàn:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Ngày:</span> {formatDate(reservationData.NgayDat)}</p>
                    <p><span className="font-medium">Giờ:</span> {formatTime(reservationData.GioDat)}</p>
                    <p><span className="font-medium">Số người:</span> {reservationData.SoNguoi} người</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Đang tìm bàn trống...</p>
                </div>
              ) : availableTables.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg">Không có bàn trống trong thời gian này.</p>
                  <p className="text-gray-500 mt-2">Vui lòng chọn thời gian khác.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {availableTables.map((table) => (
                      <div
                        key={table.MaBan}
                        onClick={() => handleTableSelect(table)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTable?.MaBan === table.MaBan
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-800">{table.TenBan}</h3>
                        <p className="text-sm text-gray-600">Sức chứa: {table.SoCho} người</p>
                        <p className="text-sm text-gray-500">Trạng thái: {table.TrangThai}</p>
                      </div>
                    ))}
                  </div>

                  {selectedTable && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleConfirmReservation}
                        disabled={loading}
                        className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {loading ? 'Đang đặt bàn...' : 'Xác Nhận Đặt Bàn'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTable;
