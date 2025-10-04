const { BUSINESS_HOURS, validateBookingTime, isWithinBusinessHours, timeToMinutes } = require('../constants/businessHours');

/**
 * Middleware validation cho đặt bàn
 */

/**
 * Validate thời gian đặt bàn
 */
const validateReservationTime = (req, res, next) => {
  try {
    const { NgayDat, GioDat, GioKetThuc } = req.body;
    
    // Kiểm tra ngày đặt
    if (!NgayDat) {
      return res.status(400).json({
        success: false,
        error: 'Ngày đặt bàn không được để trống'
      });
    }
    
    const reservationDate = new Date(NgayDat);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Không được đặt bàn cho ngày đã qua
    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Không thể đặt bàn cho ngày đã qua'
      });
    }
    
    // Không được đặt bàn quá 30 ngày
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + BUSINESS_HOURS.MAX_ADVANCE_BOOKING);
    if (reservationDate > maxDate) {
      return res.status(400).json({
        success: false,
        error: `Chỉ có thể đặt bàn trước tối đa ${BUSINESS_HOURS.MAX_ADVANCE_BOOKING} ngày`
      });
    }
    
    // Kiểm tra giờ đặt
    if (!GioDat) {
      return res.status(400).json({
        success: false,
        error: 'Giờ đặt bàn không được để trống'
      });
    }
    
    // Kiểm tra giờ trong khoảng hoạt động
    if (!isWithinBusinessHours(GioDat)) {
      return res.status(400).json({
        success: false,
        error: BUSINESS_HOURS.MESSAGES.INVALID_TIME_RANGE
      });
    }
    
    // Kiểm tra giờ kết thúc (nếu có)
    if (GioKetThuc) {
      if (GioKetThuc > BUSINESS_HOURS.CLOSING_TIME) {
        return res.status(400).json({
          success: false,
          error: BUSINESS_HOURS.MESSAGES.INVALID_END_TIME
        });
      }
      
      // Kiểm tra thời gian đặt bàn hợp lý
      const validation = validateBookingTime(GioDat, GioKetThuc);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.message
        });
      }
    }
    
    // Kiểm tra đặt bàn trước ít nhất 1 giờ (cho ngày hôm nay)
    const isToday = reservationDate.toDateString() === today.toDateString();
    if (isToday) {
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0];
      const currentMinutes = timeToMinutes(currentTime);
      const bookingMinutes = timeToMinutes(GioDat);
      
      if (bookingMinutes <= currentMinutes + BUSINESS_HOURS.MIN_ADVANCE_BOOKING) {
        return res.status(400).json({
          success: false,
          error: BUSINESS_HOURS.MESSAGES.MIN_ADVANCE
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in validateReservationTime:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi khi validate thời gian đặt bàn'
    });
  }
};

/**
 * Validate thông tin khách hàng
 */
const validateCustomerInfo = (req, res, next) => {
  try {
    const { TenKhach, SoDienThoai, EmailKhach } = req.body;
    
    // Kiểm tra tên khách hàng
    if (!TenKhach || TenKhach.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Tên khách hàng phải có ít nhất 2 ký tự'
      });
    }
    
    if (TenKhach.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Tên khách hàng không được quá 100 ký tự'
      });
    }
    
    // Kiểm tra số điện thoại
    if (!SoDienThoai || SoDienThoai.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Số điện thoại phải có ít nhất 10 chữ số'
      });
    }
    
    const phoneRegex = /^[0-9+()-\s]+$/;
    if (!phoneRegex.test(SoDienThoai)) {
      return res.status(400).json({
        success: false,
        error: 'Số điện thoại chỉ được chứa số, dấu +, -, (), khoảng trắng'
      });
    }
    
    // Kiểm tra email (nếu có)
    if (EmailKhach && EmailKhach.trim() !== '') {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(EmailKhach)) {
        return res.status(400).json({
          success: false,
          error: 'Định dạng email không hợp lệ'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in validateCustomerInfo:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi khi validate thông tin khách hàng'
    });
  }
};

/**
 * Validate số lượng khách
 */
const validateGuestCount = (req, res, next) => {
  try {
    const { SoNguoi } = req.body;
    
    if (!SoNguoi || isNaN(SoNguoi)) {
      return res.status(400).json({
        success: false,
        error: 'Số lượng khách không được để trống'
      });
    }
    
    const guestCount = parseInt(SoNguoi);
    
    if (guestCount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Số lượng khách tối thiểu là 1 người'
      });
    }
    
    if (guestCount > 20) {
      return res.status(400).json({
        success: false,
        error: 'Số lượng khách tối đa là 20 người. Vui lòng liên hệ trực tiếp để đặt bàn nhóm lớn'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in validateGuestCount:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi khi validate số lượng khách'
    });
  }
};

/**
 * Middleware tổng hợp cho validation đặt bàn
 */
const validateReservation = [
  validateCustomerInfo,
  validateReservationTime,
  validateGuestCount
];

module.exports = {
  validateReservation,
  validateReservationTime,
  validateCustomerInfo,
  validateGuestCount
};
