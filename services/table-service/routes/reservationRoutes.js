const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  deleteReservation,
  getTodayReservations,
  getAvailableTables,
  getReservationStats
} = require('../controllers/reservationController');

const { validateReservation, validateCustomerInfo, validateReservationTime, validateGuestCount } = require('../middleware/reservationValidation');

// Migration endpoint to fix database schema
router.post('/migrate-database', async (req, res) => {
  try {
    const migrateDatBanTable = require('../migrateDatBan');
    await migrateDatBanTable();
    
    res.json({
      success: true,
      message: 'Database migration completed successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error.message
    });
  }
});

// Get reservation statistics
router.get('/stats', getReservationStats);

// Check time conflicts for reservation
router.post('/check-conflict', async (req, res) => {
  try {
    const { MaBan, tables, NgayDat, GioDat, GioKetThuc, excludeId } = req.body;
    
    // Validate required fields
    if (!NgayDat || !GioDat) {
      return res.status(400).json({
        error: 'NgayDat và GioDat là bắt buộc',
        hasConflict: false,
        conflicts: []
      });
    }
    
    // Import model here to avoid circular dependency
    const { DatBan } = require('../models');
    const { Op } = require('sequelize');
    
    // Build where clause
    const whereClause = {
      NgayDat: NgayDat,
      TrangThai: {
        [Op.notIn]: ['Đã hủy', 'Hoàn thành']
      }
    };
    
    // Handle single table or multiple tables
    if (MaBan) {
      whereClause.MaBan = MaBan;
    } else if (tables && Array.isArray(tables) && tables.length > 0) {
      whereClause.MaBan = { [Op.in]: tables };
    } else {
      return res.status(400).json({
        error: 'MaBan hoặc tables là bắt buộc',
        hasConflict: false,
        conflicts: []
      });
    }
    
    // Exclude current reservation if updating
    if (excludeId) {
      whereClause.MaDatBan = { [Op.ne]: excludeId };
    }
    
    // Check for time conflicts only if GioKetThuc is provided
    let timeConditions = [];
    
    if (GioKetThuc) {
      timeConditions = [
        // New reservation starts during existing reservation
        {
          GioDat: { [Op.lte]: GioDat },
          GioKetThuc: { [Op.gt]: GioDat }
        },
        // New reservation ends during existing reservation  
        {
          GioDat: { [Op.lt]: GioKetThuc },
          GioKetThuc: { [Op.gte]: GioKetThuc }
        },
        // New reservation completely contains existing reservation
        {
          GioDat: { [Op.gte]: GioDat },
          GioKetThuc: { [Op.lte]: GioKetThuc }
        }
      ];
    } else {
      // If no end time, just check if start time conflicts
      timeConditions = [
        {
          GioDat: GioDat,
        },
        {
          GioDat: { [Op.lte]: GioDat },
          GioKetThuc: { [Op.gt]: GioDat }
        }
      ];
    }
    
    const conflictingReservations = await DatBan.findAll({
      where: {
        ...whereClause,
        [Op.or]: timeConditions
      }
    });
    
    res.json({
      hasConflict: conflictingReservations.length > 0,
      conflicts: conflictingReservations
    });
  } catch (error) {
    console.error('Error checking time conflicts:', error);
    res.status(500).json({
      error: 'Failed to check time conflicts',
      message: error.message,
      hasConflict: false,
      conflicts: []
    });
  }
});

// Get all reservations with filters
router.get('/', getReservations);

// Get reservation by ID
router.get('/:id', getReservationById);

// Create new reservation
router.post('/', createReservation);

// Create multi-table reservation
router.post('/multi-table', async (req, res) => {
  try {
    const { tables, NgayDat, GioDat, GioKetThuc, SoNguoi, TenKhach, SoDienThoai, EmailKhach, GhiChu } = req.body;
    
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Danh sách bàn không được để trống'
      });
    }

    // Import model here to avoid circular dependency
    const { DatBan } = require('../models');
    const { sequelize } = require('../config/database');
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      const createdReservations = [];
      
      // Create reservation for each table
      for (const tableId of tables) {
        const reservationData = {
          MaBan: tableId,
          NgayDat,
          GioDat,
          GioKetThuc,
          SoNguoi: Math.ceil(SoNguoi / tables.length), // Distribute guests across tables
          TenKhach,
          SoDienThoai,
          EmailKhach,
          GhiChu: GhiChu ? `${GhiChu} [Đặt nhóm ${tables.length} bàn]` : `Đặt nhóm ${tables.length} bàn`,
          TrangThai: 'Đã đặt'
        };
        
        const reservation = await DatBan.create(reservationData, { transaction });
        createdReservations.push(reservation);
      }
      
      // Commit transaction
      await transaction.commit();
      
      res.status(201).json({
        success: true,
        message: `Đã tạo thành công ${createdReservations.length} đặt bàn`,
        data: createdReservations
      });
      
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating multi-table reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tạo đặt bàn nhóm',
      message: error.message
    });
  }
});

// Update reservation
router.put('/:id', updateReservation);

// Update reservation status
router.patch('/:id/status', updateReservationStatus);
router.put('/:id/trang-thai', updateReservationStatus); // Vietnamese route

// Cancel reservation
router.patch('/:id/cancel', cancelReservation);

// Delete reservation
router.delete('/:id', deleteReservation);

module.exports = router;
