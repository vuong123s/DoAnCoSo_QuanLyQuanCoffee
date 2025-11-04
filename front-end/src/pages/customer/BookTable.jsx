import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { reservationAPI, billingAPI } from '../../shared/services/api';
import { useAuthStore } from '../../app/stores/authStore';
import TablesByArea from '../../components/tables/TablesByArea';
import MultiTableMenuSelection from '../../components/MultiTableMenuSelection';
import { FiCalendar, FiClock, FiUsers, FiPhone, FiMail, FiMessageSquare, FiCheck, FiX, FiAlertCircle, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BookTable = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTables, setSelectedTables] = useState([]);
  const [tableOrders, setTableOrders] = useState({}); // {tableId: [order items]}
  const [loading, setLoading] = useState(false);
  const [timeConflicts, setTimeConflicts] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      TenKhach: user?.HoTen || '',
      SoDienThoai: user?.SDT || '',
      EmailKhach: user?.Email || '',
      NgayDat: '',
      GioDat: '',
      GioKetThuc: '',
      SoNguoi: 2,
      GhiChu: ''
    }
  });

  const watchedValues = watch(['NgayDat', 'GioDat', 'GioKetThuc']);

  // Auto-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue('TenKhach', user.HoTen || '');
      setValue('SoDienThoai', user.SDT || '');
      setValue('EmailKhach', user.Email || '');
    }
  }, [isAuthenticated, user, setValue]);

  // Check time conflicts when date/time changes
  useEffect(() => {
    if (selectedTables.length > 0 && watchedValues[0] && watchedValues[1] && watchedValues[2]) {
      checkTimeConflicts();
    }
  }, [selectedTables, ...watchedValues]);

  const checkTimeConflicts = async () => {
    const [date, startTime, endTime] = watchedValues;
    if (!date || !startTime || !endTime) return;

    const conflicts = {};
    
    for (const table of selectedTables) {
      try {
        const response = await reservationAPI.checkTimeConflict(
          table.MaBan,
          date,
          startTime,
          endTime
        );
        
        if (response.data.hasConflict) {
          conflicts[table.MaBan] = response.data.conflictingReservations;
        }
      } catch (error) {
        console.error('Error checking time conflict for table:', table.MaBan, error);
      }
    }
    
    setTimeConflicts(conflicts);
  };

  const handleTableSelect = (table) => {
    setSelectedTables(prev => {
      const tableId = table.MaBan || table.id;
      const isAlreadySelected = prev.some(t => (t.MaBan || t.id) === tableId);
      
      if (isAlreadySelected) {
        return prev.filter(t => (t.MaBan || t.id) !== tableId);
      } else {
        // Cho phép chọn tối đa 10 bàn
        if (prev.length >= 10) {
          toast.error('Chỉ có thể chọn tối đa 10 bàn');
          return prev;
        }
        return [...prev, table];
      }
    });
  };

  const removeTable = (tableId) => {
    setSelectedTables(prev => prev.filter(t => (t.MaBan || t.id) !== tableId));
  };

  const clearAllTables = () => {
    setSelectedTables([]);
    setTimeConflicts({});
  };

  const getTotalCapacity = () => {
    return selectedTables.reduce((total, table) => total + (table.SoCho || 0), 0);
  };

  const getSelectedTableIds = () => {
    return selectedTables.map(table => table.MaBan || table.id);
  };

  const hasTimeConflicts = () => {
    return Object.keys(timeConflicts).length > 0;
  };

  const onSubmit = async (data) => {
    if (selectedTables.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bàn');
      return;
    }

    if (hasTimeConflicts()) {
      toast.error('Có xung đột thời gian với các đặt bàn khác. Vui lòng chọn thời gian khác.');
      return;
    }

    // Validate time
    const startTime = new Date(`2000-01-01T${data.GioDat}`);
    const endTime = new Date(`2000-01-01T${data.GioKetThuc}`);
    
    if (endTime <= startTime) {
      toast.error('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    const timeDiff = (endTime - startTime) / (1000 * 60); // minutes
    if (timeDiff < 30) {
      toast.error('Thời gian đặt bàn tối thiểu là 30 phút');
      return;
    }

    if (timeDiff > 240) { // 4 hours
      toast.error('Thời gian đặt bàn tối đa là 4 giờ');
      return;
    }

    setLoading(true);

    try {
      // Đặt bàn (cho phép 1 hoặc nhiều bàn)
      const reservationData = {
        ...data,
        MaKH: user?.MaKH || null,
        tables: selectedTables.map(table => table.MaBan)
      };

      const response = await reservationAPI.createMultiTableReservation(reservationData);

      if (response.data.success) {
        // Lấy danh sách reservations với MaDat cho từng bàn
        const reservations = response.data.data || [];
        
        // Tạo đơn hàng riêng cho TỪNG bàn với món ăn riêng biệt và MaDat tương ứng
        const orderPromises = selectedTables.map(table => {
          const tableId = table.MaBan || table.id;
          const tableOrder = tableOrders[tableId] || [];
          const reservation = reservations.find(r => r.MaBan === tableId);
          const maDat = reservation?.MaDat;
          
          // Chỉ tạo đơn hàng nếu bàn có món ăn và có MaDat
          if (tableOrder.length > 0 && maDat) {
            return createOrderWithItems(tableId, tableOrder, maDat);
          }
          return Promise.resolve(); // Bàn không có món ăn hoặc không có MaDat
        });
        
        try {
          await Promise.all(orderPromises);
          const tablesWithOrders = selectedTables.filter(table => {
            const tableId = table.MaBan || table.id;
            return (tableOrders[tableId] || []).length > 0;
          });
          
          if (tablesWithOrders.length > 0) {
            console.log(`Đã tạo ${tablesWithOrders.length} đơn hàng cho ${tablesWithOrders.length} bàn có món ăn`);
          }
        } catch (error) {
          console.error('Một số đơn hàng không tạo được:', error);
        }
        
        const message = selectedTables.length === 1 
          ? 'Đặt bàn thành công!' 
          : `Đặt bàn thành công! Đã đặt ${response.data.data.length}/${selectedTables.length} bàn`;
        toast.success(message);
        setCurrentStep(4);
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra khi đặt bàn');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedTables([]);
    setTableOrders({});
    setTimeConflicts({});
    setCurrentStep(1);
  };

  const handleTableOrdersChange = (orders) => {
    setTableOrders(orders);
  };

  const createOrderWithItems = async (tableId, orderItems, maDat = null) => {
    try {
      // Tạo đơn hàng kèm món ăn trong một lần gọi API
      const orderData = {
        MaBan: tableId,
        MaDat: maDat, // Thêm mã đặt bàn để liên kết với đơn đặt bàn
        MaNV: null, // Chưa có nhân viên phục vụ
        TrangThai: 'Đang xử lý',
        items: orderItems.map(item => ({
          MaMon: item.MaMon,
          SoLuong: item.SoLuong,
          DonGia: item.DonGia,
          GhiChu: item.GhiChu || ''
        }))
      };

      const response = await billingAPI.createOrderWithItems(orderData);
      
      if (response.data.success) {
        console.log('Đã tạo đơn hàng với món ăn thành công (MaDat:', maDat, '):', response.data.order);
      }
    } catch (error) {
      console.error('Error creating order with items:', error);
      // Không hiển thị lỗi cho user vì đặt bàn đã thành công
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin đặt bàn</h2>
        <p className="text-gray-600">Vui lòng điền thông tin để đặt bàn</p>
      </div>

      <form onSubmit={handleSubmit(() => setCurrentStep(2))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUsers className="inline w-4 h-4 mr-1" />
              Tên khách hàng *
            </label>
            <input
              {...register('TenKhach', { required: 'Vui lòng nhập tên khách hàng' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Nhập tên khách hàng"
            />
            {errors.TenKhach && (
              <p className="mt-1 text-sm text-red-600">{errors.TenKhach.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiPhone className="inline w-4 h-4 mr-1" />
              Số điện thoại *
            </label>
            <input
              {...register('SoDienThoai', { 
                required: 'Vui lòng nhập số điện thoại',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ'
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Nhập số điện thoại"
            />
            {errors.SoDienThoai && (
              <p className="mt-1 text-sm text-red-600">{errors.SoDienThoai.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMail className="inline w-4 h-4 mr-1" />
              Email
            </label>
            <input
              {...register('EmailKhach', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ'
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Nhập email (tùy chọn)"
            />
            {errors.EmailKhach && (
              <p className="mt-1 text-sm text-red-600">{errors.EmailKhach.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUsers className="inline w-4 h-4 mr-1" />
              Số người *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              {...register('SoNguoi', { 
                required: 'Vui lòng nhập số người',
                min: { value: 1, message: 'Số người tối thiểu là 1' },
                max: { value: 50, message: 'Số người tối đa là 50' }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.SoNguoi && (
              <p className="mt-1 text-sm text-red-600">{errors.SoNguoi.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              Ngày đặt *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('NgayDat', { required: 'Vui lòng chọn ngày đặt' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.NgayDat && (
              <p className="mt-1 text-sm text-red-600">{errors.NgayDat.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiClock className="inline w-4 h-4 mr-1" />
              Giờ bắt đầu *
            </label>
            <input
              type="time"
              {...register('GioDat', { required: 'Vui lòng chọn giờ bắt đầu' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.GioDat && (
              <p className="mt-1 text-sm text-red-600">{errors.GioDat.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiClock className="inline w-4 h-4 mr-1" />
              Giờ kết thúc *
            </label>
            <input
              type="time"
              {...register('GioKetThuc', { required: 'Vui lòng chọn giờ kết thúc' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.GioKetThuc && (
              <p className="mt-1 text-sm text-red-600">{errors.GioKetThuc.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiMessageSquare className="inline w-4 h-4 mr-1" />
            Ghi chú
          </label>
          <textarea
            {...register('GhiChu')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Nhập ghi chú (tùy chọn)"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Tiếp theo: Chọn bàn
          </button>
        </div>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Chọn bàn ({selectedTables.length}/10)
        </h2>
        <p className="text-gray-600">
          Chọn các bàn bạn muốn đặt (từ 1 đến 10 bàn)
        </p>
      </div>

      {/* Time Conflict Warning */}
      {hasTimeConflicts() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <h3 className="text-red-800 font-medium">Cảnh báo xung đột thời gian</h3>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Một số bàn đã được đặt trong khung thời gian này. Vui lòng chọn thời gian khác hoặc bỏ chọn các bàn bị xung đột.
          </p>
          <div className="mt-2">
            {Object.entries(timeConflicts).map(([tableId, conflicts]) => {
              const table = selectedTables.find(t => t.MaBan == tableId);
              return (
                <div key={tableId} className="text-sm text-red-600">
                  • {table?.TenBan}: {conflicts.length} đặt bàn trùng thời gian
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Tables by Area */}
      <TablesByArea
        onTableSelect={handleTableSelect}
        selectedTableIds={getSelectedTableIds()}
        isMultipleSelect={true}
        reservationDate={watchedValues[0]}
        reservationTime={watchedValues[1]}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Quay lại
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          disabled={selectedTables.length === 0 || hasTimeConflicts()}
          className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp theo: Chọn món
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          <FiShoppingCart className="inline w-6 h-6 mr-2" />
          Chọn món ăn
        </h2>
        <p className="text-gray-600">
          Bạn có thể chọn món ăn trước (tùy chọn) hoặc bỏ qua để đặt món sau
        </p>
        {selectedTables.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              <strong>Lưu ý:</strong> {selectedTables.length === 1 
                ? 'Bạn có thể đặt món trước (tùy chọn) hoặc bỏ qua để đặt món sau.'
                : `Bạn đã chọn ${selectedTables.length} bàn. Mỗi bàn có thể đặt món khác nhau hoặc không đặt món nào. Hệ thống sẽ tạo đơn hàng riêng cho từng bàn có món ăn.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Menu Selection */}
      <MultiTableMenuSelection
        tables={selectedTables}
        onOrdersChange={handleTableOrdersChange}
        initialOrders={tableOrders}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Quay lại
        </button>
        <div className="space-x-4">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-gray-400 text-white px-8 py-3 rounded-lg hover:bg-gray-500 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Đang đặt bàn...' : 'Bỏ qua - Đặt bàn'}
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading || Object.keys(tableOrders).length === 0}
            className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đặt bàn...' : 'Đặt bàn + Món ăn'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <FiCheck className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Đặt bàn thành công!</h2>
      <p className="text-gray-600">
        Cảm ơn bạn đã đặt bàn. Chúng tôi sẽ liên hệ với bạn để xác nhận trong thời gian sớm nhất.
      </p>
      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-medium text-gray-900 mb-4">Thông tin đặt bàn</h3>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-600">Tên:</span> {watch('TenKhach')}</p>
          <p><span className="text-gray-600">Số điện thoại:</span> {watch('SoDienThoai')}</p>
          <p><span className="text-gray-600">Ngày:</span> {watch('NgayDat')}</p>
          <p><span className="text-gray-600">Thời gian:</span> {watch('GioDat')} - {watch('GioKetThuc')}</p>
          <p><span className="text-gray-600">Số bàn:</span> {selectedTables.length}</p>
          <p><span className="text-gray-600">Tổng sức chứa:</span> {getTotalCapacity()} chỗ</p>
          {/* Hiển thị thông tin món ăn */}
          {Object.keys(tableOrders).length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-600 font-medium">Món đã đặt:</p>
              {selectedTables.map(table => {
                const tableId = table.MaBan || table.id;
                const tableName = table.TenBan || `Bàn ${tableId}`;
                const tableOrder = tableOrders[tableId] || [];
                
                if (tableOrder.length === 0) return null;
                
                return (
                  <div key={tableId} className="text-sm">
                    <span className="text-gray-600">• {tableName}:</span> {tableOrder.length} món
                  </div>
                );
              })}
              {selectedTables.length > 1 && (
                <p className="text-amber-600 text-xs">
                  * Mỗi bàn có đơn hàng riêng biệt
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={resetForm}
        className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
      >
        Đặt bàn mới
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    step === currentStep
                      ? 'bg-amber-600 text-white'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <FiCheck className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-6 text-sm">
              <span className={currentStep === 1 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
                Thông tin
              </span>
              <span className={currentStep === 2 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
                Chọn bàn
              </span>
              <span className={currentStep === 3 ? 'text-amber-600 font-medium' : 'text-gray-500'}>
                Chọn món
              </span>
              <span className={currentStep === 4 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                Hoàn thành
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};

export default BookTable;
