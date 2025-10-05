const { KhuVuc, Ban, DatBan } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get all areas with table counts and statistics
const getAreas = async (req, res) => {
  try {
    const { include_tables = false } = req.query;

    const includeOptions = [];
    
    if (include_tables === 'true') {
      includeOptions.push({
        model: Ban,
        as: 'tables',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'ViTri', 'TrangThai'],
        required: false
      });
    }

    const areas = await KhuVuc.findAll({
      where: {
        TrangThai: 'Hoạt động'
      },
      include: includeOptions,
      order: [['MaKhuVuc', 'ASC']]
    });

    // Get table counts for each area
    const areasWithStats = await Promise.all(areas.map(async (area) => {
      const tableStats = await Ban.findAll({
        where: { MaKhuVuc: area.MaKhuVuc },
        attributes: [
          'TrangThai',
          [sequelize.fn('COUNT', sequelize.col('MaBan')), 'count']
        ],
        group: ['TrangThai']
      });

      const totalTables = await Ban.count({
        where: { MaKhuVuc: area.MaKhuVuc }
      });

      const statusBreakdown = tableStats.map(stat => ({
        status: stat.TrangThai,
        count: parseInt(stat.dataValues.count)
      }));

      return {
        ...area.toJSON(),
        table_count: totalTables,
        status_breakdown: statusBreakdown
      };
    }));

    res.json({
      success: true,
      areas: areasWithStats
    });

  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch areas',
      message: error.message
    });
  }
};

// Get area by ID with detailed information
const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include_tables = true } = req.query;

    const includeOptions = [];
    
    if (include_tables === 'true') {
      includeOptions.push({
        model: Ban,
        as: 'tables',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'ViTri', 'TrangThai'],
        required: false,
        order: [['TenBan', 'ASC']]
      });
    }

    const area = await KhuVuc.findByPk(id, {
      include: includeOptions
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        error: 'Area not found'
      });
    }

    // Get table statistics for this area
    const tableStats = await Ban.findAll({
      where: { MaKhuVuc: id },
      attributes: [
        'TrangThai',
        [sequelize.fn('COUNT', sequelize.col('MaBan')), 'count']
      ],
      group: ['TrangThai']
    });

    const totalTables = await Ban.count({
      where: { MaKhuVuc: id }
    });

    const statusBreakdown = tableStats.map(stat => ({
      status: stat.TrangThai,
      count: parseInt(stat.dataValues.count)
    }));

    res.json({
      success: true,
      area: {
        ...area.toJSON(),
        table_count: totalTables,
        status_breakdown: statusBreakdown
      }
    });

  } catch (error) {
    console.error('Error fetching area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch area',
      message: error.message
    });
  }
};

// Get tables by area with real-time availability
const getTablesByArea = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Safely extract and validate query parameters
    let { date, time, duration = 120 } = req.query;
    
    // Set default values if not provided
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    
    if (!time) {
      time = new Date().toTimeString().split(' ')[0];
    }
    
    // Ensure parameters are strings, not arrays
    if (Array.isArray(date)) date = date[0];
    if (Array.isArray(time)) time = time[0];
    if (Array.isArray(duration)) duration = duration[0];
    
    // Clean up any comma-separated values
    date = String(date).split(',')[0];
    time = String(time).split(',')[0];
    duration = String(duration).split(',')[0];

    // First get the area information
    const area = await KhuVuc.findByPk(id);
    if (!area) {
      return res.status(404).json({
        success: false,
        error: 'Area not found'
      });
    }

    // Get all tables in this area
    const tables = await Ban.findAll({
      where: { MaKhuVuc: id },
      order: [['TenBan', 'ASC']]
    });

    // Calculate real-time availability for each table
    const tablesWithAvailability = await Promise.all(tables.map(async (table) => {
      const availability = await calculateTableAvailability(table.MaBan, date, time, duration);
      return {
        ...table.toJSON(),
        real_time_status: availability.status,
        is_available: availability.is_available,
        next_reservation: availability.next_reservation,
        current_reservation: availability.current_reservation
      };
    }));

    res.json({
      success: true,
      area: area.toJSON(),
      tables: tablesWithAvailability,
      search_criteria: {
        date,
        time,
        duration: parseInt(duration)
      }
    });

  } catch (error) {
    console.error('Error fetching tables by area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tables by area',
      message: error.message
    });
  }
};

// Helper function to calculate real-time table availability
const calculateTableAvailability = async (tableId, requestDate, requestTime, duration = 120) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    
    // Debug logging (uncomment for debugging)
    // console.log(`🔍 calculateTableAvailability called with:`, {
    //   tableId,
    //   requestDate: typeof requestDate === 'string' ? requestDate : JSON.stringify(requestDate),
    //   requestTime: typeof requestTime === 'string' ? requestTime : JSON.stringify(requestTime),
    //   duration
    // });
    
    // Validate and format input parameters
    if (!requestDate || requestDate === 'Invalid' || requestDate.includes(',')) {
      requestDate = today;
    }
    
    if (!requestTime || requestTime === 'Invalid' || requestTime.includes(',')) {
      requestTime = currentTime;
    }
    
    // Clean up any comma-separated values or malformed strings
    requestDate = String(requestDate).split(',')[0].trim();
    requestTime = String(requestTime).split(',')[0].trim();
    
    // Ensure time format is HH:MM:SS
    if (requestTime.length === 5) {
      requestTime = requestTime + ':00';
    } else if (requestTime.length < 5) {
      requestTime = currentTime;
    }
    
    // console.log(`✅ After cleanup:`, { requestDate, requestTime, duration });
    
    // Calculate requested time range with proper validation
    let requestedStart = new Date(`${requestDate}T${requestTime}`);
    if (isNaN(requestedStart.getTime())) {
      console.warn(`Invalid date/time: ${requestDate}T${requestTime}, using current time`);
      requestTime = currentTime;
      requestedStart = new Date(`${requestDate}T${requestTime}`);
      if (isNaN(requestedStart.getTime())) {
        throw new Error('Cannot create valid date/time');
      }
    }
    
    const requestedEnd = new Date(requestedStart.getTime() + parseInt(duration) * 60000);
    const requestedEndTime = requestedEnd.toTimeString().split(' ')[0];
    
    // Validate calculated end time
    if (!requestedEndTime || requestedEndTime === 'Invalid') {
      throw new Error('Cannot calculate valid end time');
    }

    // Find conflicting reservations for the requested time
    const conflictingReservations = await DatBan.findAll({
      where: {
        MaBan: tableId,
        NgayDat: requestDate,
        TrangThai: ['Đã đặt', 'Đã xác nhận', 'Hoàn thành'],
        [Op.or]: [
          // Reservation starts during our requested time
          {
            GioDat: {
              [Op.between]: [requestTime, requestedEndTime]
            }
          },
          // Reservation ends during our requested time
          {
            GioKetThuc: {
              [Op.between]: [requestTime, requestedEndTime]
            }
          },
          // Reservation completely covers our requested time
          {
            [Op.and]: [
              { GioDat: { [Op.lte]: requestTime } },
              { GioKetThuc: { [Op.gte]: requestedEndTime } }
            ]
          }
        ]
      },
      order: [['GioDat', 'ASC']]
    });

    // Find current reservation (if any)
    const currentReservation = await DatBan.findOne({
      where: {
        MaBan: tableId,
        NgayDat: today,
        TrangThai: ['Đã đặt', 'Đã xác nhận', 'Hoàn thành'],
        GioDat: { [Op.lte]: currentTime },
        GioKetThuc: { [Op.gte]: currentTime }
      }
    });

    // Find next reservation
    const nextReservation = await DatBan.findOne({
      where: {
        MaBan: tableId,
        [Op.or]: [
          // Today's future reservations
          {
            NgayDat: today,
            GioDat: { [Op.gt]: currentTime },
            TrangThai: ['Đã đặt', 'Đã xác nhận']
          },
          // Future date reservations
          {
            NgayDat: { [Op.gt]: today },
            TrangThai: ['Đã đặt', 'Đã xác nhận']
          }
        ]
      },
      order: [['NgayDat', 'ASC'], ['GioDat', 'ASC']]
    });

    // Determine real-time status
    let status = 'Trống';
    let isAvailable = true;

    if (conflictingReservations.length > 0) {
      status = 'Đã đặt';
      isAvailable = false;
    } else if (currentReservation) {
      // If there's a current reservation but it's for today and time has passed
      if (requestDate === today && requestTime <= currentTime) {
        status = 'Đang phục vụ';
        isAvailable = false;
      } else {
        status = 'Trống';
        isAvailable = true;
      }
    }

    return {
      status,
      is_available: isAvailable,
      current_reservation: currentReservation ? {
        MaDat: currentReservation.MaDat,
        TenKhach: currentReservation.TenKhach,
        GioDat: currentReservation.GioDat,
        GioKetThuc: currentReservation.GioKetThuc,
        TrangThai: currentReservation.TrangThai
      } : null,
      next_reservation: nextReservation ? {
        MaDat: nextReservation.MaDat,
        TenKhach: nextReservation.TenKhach,
        NgayDat: nextReservation.NgayDat,
        GioDat: nextReservation.GioDat,
        GioKetThuc: nextReservation.GioKetThuc,
        TrangThai: nextReservation.TrangThai
      } : null
    };

  } catch (error) {
    console.error('Error calculating table availability:', error);
    return {
      status: 'Không xác định',
      is_available: false,
      current_reservation: null,
      next_reservation: null
    };
  }
};

// Create new area
const createArea = async (req, res) => {
  try {
    const { TenKhuVuc, MoTa, HinhAnh, Video } = req.body;

    if (!TenKhuVuc) {
      return res.status(400).json({
        success: false,
        error: 'Area name is required'
      });
    }

    // Check if area name already exists
    const existingArea = await KhuVuc.findOne({
      where: { TenKhuVuc: TenKhuVuc.trim() }
    });

    if (existingArea) {
      return res.status(400).json({
        success: false,
        error: 'Area name already exists'
      });
    }

    const area = await KhuVuc.create({
      TenKhuVuc: TenKhuVuc.trim(),
      MoTa: MoTa || null,
      HinhAnh: HinhAnh || null,
      Video: Video || null,
      TrangThai: 'Hoạt động'
    });

    res.status(201).json({
      success: true,
      message: 'Area created successfully',
      area
    });

  } catch (error) {
    console.error('Error creating area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create area',
      message: error.message
    });
  }
};

// Update area
const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const area = await KhuVuc.findByPk(id);
    if (!area) {
      return res.status(404).json({
        success: false,
        error: 'Area not found'
      });
    }

    // Check for duplicate name if name is being updated
    if (updateData.TenKhuVuc && updateData.TenKhuVuc.trim() !== area.TenKhuVuc) {
      const existingArea = await KhuVuc.findOne({
        where: { 
          TenKhuVuc: updateData.TenKhuVuc.trim(),
          MaKhuVuc: { [Op.ne]: id }
        }
      });

      if (existingArea) {
        return res.status(400).json({
          success: false,
          error: 'Area name already exists'
        });
      }
    }

    await area.update(updateData);

    res.json({
      success: true,
      message: 'Area updated successfully',
      area
    });

  } catch (error) {
    console.error('Error updating area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update area',
      message: error.message
    });
  }
};

// Delete area
const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await KhuVuc.findByPk(id);
    if (!area) {
      return res.status(404).json({
        success: false,
        error: 'Area not found'
      });
    }

    // Check if area has tables
    const tableCount = await Ban.count({
      where: { MaKhuVuc: id }
    });

    if (tableCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete area with existing tables',
        table_count: tableCount
      });
    }

    await area.destroy();

    res.json({
      success: true,
      message: 'Area deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete area',
      message: error.message
    });
  }
};

module.exports = {
  getAreas,
  getAreaById,
  getTablesByArea,
  createArea,
  updateArea,
  deleteArea,
  calculateTableAvailability
};
