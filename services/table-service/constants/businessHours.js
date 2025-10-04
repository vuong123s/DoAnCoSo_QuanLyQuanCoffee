/**
 * Business Hours Constants
 * Quản lý thời gian hoạt động của quán cà phê
 */

const BUSINESS_HOURS = {
  // Giờ mở cửa và đóng cửa
  OPENING_TIME: '06:00:00',
  CLOSING_TIME: '22:00:00',
  
  // Thời gian đặt bàn
  MIN_BOOKING_DURATION: 60, // phút
  MAX_BOOKING_DURATION: 240, // phút (4 giờ)
  MIN_ADVANCE_BOOKING: 60, // phút (đặt trước ít nhất 1 giờ)
  MAX_ADVANCE_BOOKING: 30, // ngày (đặt trước tối đa 30 ngày)
  
  // Thời gian reset bàn tự động
  AUTO_RESET_TIME: '22:00:00', // 10h tối
  
  // Thời gian hủy đơn tự động
  AUTO_CANCEL_EXPIRED_MINUTES: 15, // Hủy đơn quá hạn 15 phút
  
  // Validation messages
  MESSAGES: {
    INVALID_TIME_RANGE: 'Giờ đặt bàn phải trong khoảng 06:00 - 22:00',
    INVALID_END_TIME: 'Giờ kết thúc không được quá 22:00',
    MIN_DURATION: 'Thời gian đặt bàn tối thiểu là 60 phút',
    MAX_DURATION: 'Thời gian đặt bàn tối đa là 240 phút',
    MIN_ADVANCE: 'Phải đặt bàn trước ít nhất 1 giờ',
    MAX_ADVANCE: 'Chỉ có thể đặt bàn trước tối đa 30 ngày'
  }
};

/**
 * Kiểm tra giờ có trong khoảng hoạt động không
 * @param {string} time - Thời gian định dạng HH:mm:ss
 * @returns {boolean}
 */
const isWithinBusinessHours = (time) => {
  return time >= BUSINESS_HOURS.OPENING_TIME && time <= BUSINESS_HOURS.CLOSING_TIME;
};

/**
 * Kiểm tra thời gian đặt bàn hợp lệ
 * @param {string} startTime - Giờ bắt đầu
 * @param {string} endTime - Giờ kết thúc
 * @returns {object} { isValid: boolean, message: string }
 */
const validateBookingTime = (startTime, endTime) => {
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
 * Chuyển đổi thời gian thành phút
 * @param {string} time - Thời gian định dạng HH:mm:ss
 * @returns {number}
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Chuyển đổi phút thành thời gian
 * @param {number} minutes - Số phút
 * @returns {string} Thời gian định dạng HH:mm:ss
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

/**
 * Lấy thời gian hiện tại + số phút
 * @param {number} addMinutes - Số phút cần cộng thêm
 * @returns {string} Thời gian định dạng HH:mm:ss
 */
const getCurrentTimePlus = (addMinutes = 0) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + addMinutes);
  return now.toTimeString().split(' ')[0];
};

module.exports = {
  BUSINESS_HOURS,
  isWithinBusinessHours,
  validateBookingTime,
  timeToMinutes,
  minutesToTime,
  getCurrentTimePlus
};
