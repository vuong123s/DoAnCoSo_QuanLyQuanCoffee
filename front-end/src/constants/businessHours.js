/**
 * Business Hours Constants for Frontend
 * Quản lý thời gian hoạt động của quán cà phê
 */

export const BUSINESS_HOURS = {
  // Giờ mở cửa và đóng cửa
  OPENING_TIME: '06:00',
  CLOSING_TIME: '22:00',
  OPENING_TIME_DISPLAY: '6:00',
  CLOSING_TIME_DISPLAY: '22:00',
  
  // Thời gian đặt bàn
  MIN_BOOKING_DURATION: 60, // phút
  MAX_BOOKING_DURATION: 240, // phút (4 giờ)
  MIN_ADVANCE_BOOKING: 60, // phút (đặt trước ít nhất 1 giờ)
  MAX_ADVANCE_BOOKING: 30, // ngày (đặt trước tối đa 30 ngày)
  
  // Validation messages
  MESSAGES: {
    INVALID_TIME_RANGE: 'Giờ đặt bàn phải trong khoảng 6:00 - 22:00',
    INVALID_END_TIME: 'Giờ kết thúc không được quá 22:00',
    MIN_DURATION: 'Thời gian đặt bàn tối thiểu là 60 phút',
    MAX_DURATION: 'Thời gian đặt bàn tối đa là 240 phút',
    MIN_ADVANCE: 'Phải đặt bàn trước ít nhất 1 giờ',
    MAX_ADVANCE: 'Chỉ có thể đặt bàn trước tối đa 30 ngày',
    PAST_DATE: 'Không thể đặt bàn cho ngày đã qua',
    REQUIRED_DATE: 'Vui lòng chọn ngày đặt bàn',
    REQUIRED_TIME: 'Vui lòng chọn giờ đặt bàn',
    REQUIRED_END_TIME: 'Vui lòng chọn giờ kết thúc',
    END_TIME_BEFORE_START: 'Giờ kết thúc phải sau giờ bắt đầu'
  }
};

/**
 * Kiểm tra giờ có trong khoảng hoạt động không
 * @param {string} time - Thời gian định dạng HH:mm
 * @returns {boolean}
 */
export const isWithinBusinessHours = (time) => {
  if (!time) return false;
  return time >= BUSINESS_HOURS.OPENING_TIME && time <= BUSINESS_HOURS.CLOSING_TIME;
};

/**
 * Kiểm tra thời gian đặt bàn hợp lệ
 * @param {string} startTime - Giờ bắt đầu
 * @param {string} endTime - Giờ kết thúc
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateBookingTime = (startTime, endTime) => {
  if (!startTime) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.REQUIRED_TIME
    };
  }
  
  if (!endTime) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.REQUIRED_END_TIME
    };
  }
  
  // Kiểm tra giờ bắt đầu
  if (!isWithinBusinessHours(startTime)) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.INVALID_TIME_RANGE
    };
  }
  
  // Kiểm tra giờ kết thúc
  if (endTime > BUSINESS_HOURS.CLOSING_TIME) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.INVALID_END_TIME
    };
  }
  
  // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
  if (endTime <= startTime) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.END_TIME_BEFORE_START
    };
  }
  
  // Kiểm tra thời gian đặt bàn
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;
  
  if (duration < BUSINESS_HOURS.MIN_BOOKING_DURATION) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.MIN_DURATION
    };
  }
  
  if (duration > BUSINESS_HOURS.MAX_BOOKING_DURATION) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.MAX_DURATION
    };
  }
  
  return { isValid: true, message: 'OK' };
};

/**
 * Kiểm tra ngày đặt bàn hợp lệ
 * @param {string} date - Ngày đặt bàn YYYY-MM-DD
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateBookingDate = (date) => {
  if (!date) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.REQUIRED_DATE
    };
  }
  
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Không được đặt bàn cho ngày đã qua
  if (bookingDate < today) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.PAST_DATE
    };
  }
  
  // Không được đặt bàn quá 30 ngày
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + BUSINESS_HOURS.MAX_ADVANCE_BOOKING);
  if (bookingDate > maxDate) {
    return {
      isValid: false,
      message: BUSINESS_HOURS.MESSAGES.MAX_ADVANCE
    };
  }
  
  return { isValid: true, message: 'OK' };
};

/**
 * Chuyển đổi thời gian thành phút
 * @param {string} time - Thời gian định dạng HH:mm
 * @returns {number}
 */
export const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Chuyển đổi phút thành thời gian
 * @param {number} minutes - Số phút
 * @returns {string} Thời gian định dạng HH:mm
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Lấy thời gian hiện tại + số phút
 * @param {number} addMinutes - Số phút cần cộng thêm
 * @returns {string} Thời gian định dạng HH:mm
 */
export const getCurrentTimePlus = (addMinutes = 0) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + addMinutes);
  return now.toTimeString().substring(0, 5);
};

/**
 * Tạo danh sách options cho time picker
 * @param {number} stepMinutes - Bước thời gian (phút)
 * @returns {Array} Danh sách options
 */
export const generateTimeOptions = (stepMinutes = 30) => {
  const options = [];
  const startMinutes = timeToMinutes(BUSINESS_HOURS.OPENING_TIME);
  const endMinutes = timeToMinutes(BUSINESS_HOURS.CLOSING_TIME);
  
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += stepMinutes) {
    const time = minutesToTime(minutes);
    const displayTime = time.replace(':', ':');
    options.push({
      value: time,
      label: displayTime
    });
  }
  
  return options;
};

/**
 * Format thời gian hiển thị
 * @param {string} time - Thời gian HH:mm hoặc HH:mm:ss
 * @returns {string} Thời gian hiển thị
 */
export const formatDisplayTime = (time) => {
  if (!time) return '';
  return time.substring(0, 5);
};

/**
 * Lấy thông tin giờ mở cửa để hiển thị
 * @returns {string}
 */
export const getBusinessHoursDisplay = () => {
  return `${BUSINESS_HOURS.OPENING_TIME_DISPLAY} - ${BUSINESS_HOURS.CLOSING_TIME_DISPLAY}`;
};
