import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { tableAPI, reservationAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { FiCalendar, FiClock, FiUsers, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Reservations = () => {
  const [tables, setTables] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const watchedDate = watch('date');
  const watchedTime = watch('time');
  const watchedGuests = watch('guests');

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await tableAPI.getTables();
        setTables(response.data.tables || []);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  useEffect(() => {
    if (watchedDate && watchedTime && watchedGuests) {
      checkAvailability();
    }
  }, [watchedDate, watchedTime, watchedGuests]);

  const checkAvailability = async () => {
    if (!watchedDate || !watchedTime || !watchedGuests) return;

    setLoading(true);
    try {
      const response = await tableAPI.checkAvailability({
        date: watchedDate,
        time: watchedTime,
        guests: watchedGuests
      });
      setAvailableTables(response.data.availableTables || []);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableTables([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt bàn');
      return;
    }

    try {
      await reservationAPI.createReservation({
        ...data,
        customerId: user.id,
        status: 'pending'
      });
      toast.success('Đặt bàn thành công! Chúng tôi sẽ liên hệ xác nhận sớm.');
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00'
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Đặt bàn</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Đặt bàn trước để đảm bảo có chỗ ngồi thoải mái tại Coffee Shop
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  {...register('customerName', { required: 'Họ và tên là bắt buộc' })}
                  type="text"
                  defaultValue={user?.name || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  {...register('customerPhone', {
                    required: 'Số điện thoại là bắt buộc',
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại không hợp lệ'
                    }
                  })}
                  type="tel"
                  defaultValue={user?.phone || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Ngày đặt *
                </label>
                <input
                  {...register('date', { required: 'Ngày đặt là bắt buộc' })}
                  type="date"
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="inline w-4 h-4 mr-1" />
                  Giờ đặt *
                </label>
                <select
                  {...register('time', { required: 'Giờ đặt là bắt buộc' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn giờ</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUsers className="inline w-4 h-4 mr-1" />
                  Số khách *
                </label>
                <select
                  {...register('guests', { required: 'Số khách là bắt buộc' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Chọn số khách</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>{num} người</option>
                  ))}
                </select>
                {errors.guests && (
                  <p className="mt-1 text-sm text-red-600">{errors.guests.message}</p>
                )}
              </div>
            </div>

            {/* Available Tables */}
            {(watchedDate && watchedTime && watchedGuests) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Chọn bàn
                </label>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang kiểm tra bàn trống...</p>
                  </div>
                ) : availableTables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {availableTables.map((table) => (
                      <label key={table.id} className="relative cursor-pointer">
                        <input
                          {...register('tableId', { required: 'Vui lòng chọn bàn' })}
                          type="radio"
                          value={table.id}
                          className="sr-only"
                        />
                        <div className="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-amber-500 peer-checked:border-amber-600 peer-checked:bg-amber-50">
                          <div className="font-medium text-gray-900">Bàn {table.number}</div>
                          <div className="text-sm text-gray-600">{table.capacity} chỗ</div>
                          <div className="text-xs text-gray-500 mt-1">{table.location}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FiX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không có bàn trống cho thời gian này</p>
                    <p className="text-sm text-gray-500 mt-1">Vui lòng chọn thời gian khác</p>
                  </div>
                )}
                
                {errors.tableId && (
                  <p className="mt-2 text-sm text-red-600">{errors.tableId.message}</p>
                )}
              </div>
            )}

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yêu cầu đặc biệt
              </label>
              <textarea
                {...register('specialRequests')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ví dụ: Cần ghế trẻ em, vị trí gần cửa sổ, sinh nhật..."
              />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Điều khoản đặt bàn:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vui lòng đến đúng giờ đã đặt</li>
                <li>• Bàn sẽ được giữ trong 15 phút kể từ giờ đặt</li>
                <li>• Có thể hủy hoặc thay đổi trước 2 tiếng</li>
                <li>• Liên hệ (028) 1234 5678 để thay đổi đặt bàn</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex-1">
                  <p className="text-amber-800 text-sm">
                    <strong>Lưu ý:</strong> Bạn cần đăng nhập để đặt bàn. 
                    <a href="/auth/login" className="underline ml-1">Đăng nhập ngay</a>
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
                className="bg-amber-600 text-white py-3 px-8 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Đang đặt bàn...' : 'Đặt bàn ngay'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiCheck className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Xác nhận nhanh</h3>
            <p className="text-gray-600 text-sm">Nhận xác nhận đặt bàn trong vòng 5 phút</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiClock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Linh hoạt</h3>
            <p className="text-gray-600 text-sm">Có thể thay đổi hoặc hủy trước 2 tiếng</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiUsers className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Dịch vụ tận tâm</h3>
            <p className="text-gray-600 text-sm">Đội ngũ phục vụ chuyên nghiệp, thân thiện</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
