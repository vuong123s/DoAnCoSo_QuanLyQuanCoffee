/**
 * Customer Controller
 * Quản lý các chức năng liên quan đến khách hàng
 */

const { KhachHang } = require('../models');

/**
 * Cộng điểm tích lũy cho khách hàng
 */
const addPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    // Validate
    if (!points || points <= 0) {
      return res.status(400).json({
        error: 'Invalid points',
        message: 'Số điểm phải lớn hơn 0'
      });
    }

    // Tìm khách hàng
    const customer = await KhachHang.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Cộng điểm
    const currentPoints = customer.DiemTichLuy || 0;
    const newPoints = currentPoints + parseInt(points);
    
    await customer.update({
      DiemTichLuy: newPoints
    });

    console.log(`✅ Added ${points} points to customer ${id} (${currentPoints} → ${newPoints})`);

    res.json({
      success: true,
      message: 'Cộng điểm thành công',
      customer: {
        MaKH: customer.MaKH,
        HoTen: customer.HoTen,
        DiemTichLuy: newPoints,
        pointsAdded: parseInt(points)
      }
    });

  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({
      error: 'Failed to add points',
      message: error.message
    });
  }
};

/**
 * Trừ điểm tích lũy (khi khách dùng điểm)
 */
const deductPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        error: 'Invalid points',
        message: 'Số điểm phải lớn hơn 0'
      });
    }

    const customer = await KhachHang.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Không tìm thấy khách hàng'
      });
    }

    const currentPoints = customer.DiemTichLuy || 0;
    
    if (currentPoints < points) {
      return res.status(400).json({
        error: 'Insufficient points',
        message: `Không đủ điểm. Hiện có: ${currentPoints}, yêu cầu: ${points}`
      });
    }

    const newPoints = currentPoints - parseInt(points);
    
    await customer.update({
      DiemTichLuy: newPoints
    });

    console.log(`✅ Deducted ${points} points from customer ${id} (${currentPoints} → ${newPoints})`);

    res.json({
      success: true,
      message: 'Trừ điểm thành công',
      customer: {
        MaKH: customer.MaKH,
        HoTen: customer.HoTen,
        DiemTichLuy: newPoints,
        pointsDeducted: parseInt(points)
      }
    });

  } catch (error) {
    console.error('Error deducting points:', error);
    res.status(500).json({
      error: 'Failed to deduct points',
      message: error.message
    });
  }
};

/**
 * Lấy lịch sử điểm (có thể mở rộng sau)
 */
const getPointsHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await KhachHang.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      customer: {
        MaKH: customer.MaKH,
        HoTen: customer.HoTen,
        DiemTichLuy: customer.DiemTichLuy || 0
      },
      message: 'Tính năng lịch sử điểm sẽ được bổ sung sau'
    });

  } catch (error) {
    console.error('Error getting points history:', error);
    res.status(500).json({
      error: 'Failed to get points history',
      message: error.message
    });
  }
};

module.exports = {
  addPoints,
  deductPoints,
  getPointsHistory
};
