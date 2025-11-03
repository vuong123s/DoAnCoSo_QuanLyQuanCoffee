/**
 * Loyalty Points Utility
 * Quản lý tính điểm tích lũy cho khách hàng
 */

const axios = require('axios');

// Quy tắc tính điểm: 1 điểm = 10,000 VNĐ
const POINTS_PER_AMOUNT = 10000;

/**
 * Tính số điểm tích lũy dựa trên tổng tiền
 * @param {number} amount - Tổng tiền đơn hàng
 * @returns {number} Số điểm được cộng
 */
const calculatePoints = (amount) => {
  if (!amount || amount <= 0) return 0;
  return Math.floor(amount / POINTS_PER_AMOUNT);
};

/**
 * Cộng điểm tích lũy cho khách hàng
 * @param {number} customerId - Mã khách hàng
 * @param {number} points - Số điểm cần cộng
 * @returns {Promise<Object>} Kết quả cộng điểm
 */
const addPointsToCustomer = async (customerId, points) => {
  try {
    if (!customerId || points <= 0) {
      return {
        success: false,
        message: 'Invalid customer ID or points'
      };
    }

    // Gọi API user-service để cộng điểm
    const response = await axios.post(
      `http://localhost:3001/api/customers/${customerId}/add-points`,
      { points },
      { timeout: 5000 }
    );

    return {
      success: true,
      data: response.data,
      pointsAdded: points
    };
  } catch (error) {
    console.error(`Error adding points to customer ${customerId}:`, error.message);
    return {
      success: false,
      message: error.message,
      pointsAdded: 0
    };
  }
};

/**
 * Trừ điểm tích lũy của khách hàng khi sử dụng điểm giảm giá
 * @param {number} customerId - Mã khách hàng
 * @param {number} points - Số điểm cần trừ
 * @returns {Promise<Object>} Kết quả trừ điểm
 */
const deductPointsFromCustomer = async (customerId, points) => {
  try {
    if (!customerId || points <= 0) {
      return {
        success: false,
        message: 'Invalid customer ID or points'
      };
    }

    // Gọi API user-service để trừ điểm
    const response = await axios.post(
      `http://localhost:3001/api/customers/${customerId}/deduct-points`,
      { points },
      { timeout: 5000 }
    );

    return {
      success: true,
      data: response.data,
      pointsDeducted: points
    };
  } catch (error) {
    console.error(`Error deducting points from customer ${customerId}:`, error.message);
    return {
      success: false,
      message: error.message,
      pointsDeducted: 0
    };
  }
};

/**
 * Xử lý cộng điểm khi đơn hàng hoàn thành
 * @param {number} customerId - Mã khách hàng
 * @param {number} totalAmount - Tổng tiền đơn hàng
 * @param {string} orderType - Loại đơn hàng (DonHang/DonHangOnline)
 * @param {number} orderId - Mã đơn hàng
 * @returns {Promise<Object>} Kết quả cộng điểm
 */
const processOrderPoints = async (customerId, totalAmount, orderType = 'DonHang', orderId) => {
  try {
    // Nếu không có khách hàng, không cộng điểm
    if (!customerId) {
      return {
        success: false,
        message: 'No customer ID provided',
        pointsAdded: 0
      };
    }

    // Tính số điểm
    const points = calculatePoints(totalAmount);
    
    if (points === 0) {
      return {
        success: false,
        message: 'Order amount too low to earn points',
        pointsAdded: 0
      };
    }

    // Cộng điểm cho khách hàng
    const result = await addPointsToCustomer(customerId, points);

    if (result.success) {
      console.log(`✅ Added ${points} points to customer ${customerId} for ${orderType} #${orderId} (Amount: ${totalAmount})`);
    } else {
      console.warn(`⚠️ Failed to add points to customer ${customerId} for ${orderType} #${orderId}:`, result.message);
    }

    return result;
  } catch (error) {
    console.error('Error processing order points:', error);
    return {
      success: false,
      message: error.message,
      pointsAdded: 0
    };
  }
};

module.exports = {
  calculatePoints,
  addPointsToCustomer,
  deductPointsFromCustomer,
  processOrderPoints,
  POINTS_PER_AMOUNT
};
