const { Ban, DatBan, KhuVuc } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get all tables with optional filters
const getTables = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      location,
      khu_vuc,
      area,
      is_active,
      capacity_min,
      capacity_max,
      include_reservations = false
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (status) whereClause.TrangThai = status;
    
    // Filter by area/khu_vuc
    if (khu_vuc || area) {
      whereClause.MaKhuVuc = khu_vuc || area;
    }
    
    if (capacity_min || capacity_max) {
      whereClause.SoCho = {};
      if (capacity_min) whereClause.SoCho[Op.gte] = parseInt(capacity_min);
      if (capacity_max) whereClause.SoCho[Op.lte] = parseInt(capacity_max);
    }

    const includeOptions = [];
    if (include_reservations === 'true') {
      includeOptions.push({
        model: DatBan,
        as: 'datban',
        where: {
          TrangThai: ['Đã đặt', 'Hoàn thành'],
          NgayDat: {
            [Op.gte]: new Date().toISOString().split('T')[0]
          }
        },
        required: false,
        order: [['NgayDat', 'ASC'], ['GioDat', 'ASC']]
      });
    }

    const { count, rows } = await Ban.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['MaKhuVuc', 'ASC'], ['TenBan', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      tables: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      error: 'Failed to fetch tables',
      message: error.message
    });
  }
};

// Get table by ID
const getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include_reservations = false } = req.query;

    const includeOptions = [];
    if (include_reservations === 'true') {
      includeOptions.push({
        model: DatBan,
        as: 'datban',
        order: [['NgayDat', 'DESC'], ['GioDat', 'DESC']]
      });
    }

    const table = await Ban.findByPk(id, {
      include: includeOptions
    });

    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    res.json({ table });

  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({
      error: 'Failed to fetch table',
      message: error.message
    });
  }
};

// Create new table
const createTable = async (req, res) => {
  try {
    const {
      // English field names
      table_number,
      capacity,
      location = 'indoor',
      khu_vuc = 'Tầng 1',
      area,
      vi_tri,
      position,
      description,
      features,
      position_x,
      position_y,
      // Vietnamese field names
      TenBan,
      SoCho,
      MaKhuVuc,
      ViTri,
      TrangThai
    } = req.body;

    // Support both English and Vietnamese field names
    const tableNumber = table_number || TenBan;
    const tableCapacity = capacity || SoCho;
    const tableArea = area || MaKhuVuc || khu_vuc || 1;
    const tablePosition = position || vi_tri || ViTri || null;
    const tableStatus = TrangThai || 'Trống';

    if (!tableNumber || !tableCapacity) {
      return res.status(400).json({
        error: 'Missing required fields: table_number/TenBan and capacity/SoCho'
      });
    }

    // Check if table number already exists
    const existingTable = await Ban.findOne({
      where: { TenBan: tableNumber.trim() }
    });

    if (existingTable) {
      return res.status(400).json({
        error: 'Table number already exists',
        message: `Bàn "${tableNumber}" đã tồn tại trong hệ thống`
      });
    }

    // Validate area exists (if provided)
    if (tableArea && tableArea !== 1) {
      const { KhuVuc } = require('../models');
      const areaExists = await KhuVuc.findByPk(tableArea);
      if (!areaExists) {
        return res.status(400).json({
          error: 'Invalid area',
          message: `Khu vực ${tableArea} không tồn tại`
        });
      }
    }

    const table = await Ban.create({
      TenBan: tableNumber.trim(),
      SoCho: parseInt(tableCapacity),
      TrangThai: tableStatus,
      MaKhuVuc: parseInt(tableArea),
      ViTri: tablePosition
    });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      table
    });

  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      error: 'Failed to create table',
      message: error.message
    });
  }
};

// Update table
const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const table = await Ban.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    // If table_number is being updated, check for duplicates
    if (updateData.table_number && updateData.table_number.trim() !== table.TenBan) {
      const existingTable = await Ban.findOne({
        where: { 
          TenBan: updateData.table_number.trim(),
          MaBan: { [Op.ne]: id }
        }
      });

      if (existingTable) {
        return res.status(400).json({
          error: 'Table number already exists'
        });
      }

      updateData.TenBan = updateData.table_number.trim();
      delete updateData.table_number;
    }

    // Map capacity field
    if (updateData.capacity) {
      updateData.SoCho = parseInt(updateData.capacity);
      delete updateData.capacity;
    }

    // Map status field
    if (updateData.status) {
      updateData.TrangThai = updateData.status;
      delete updateData.status;
    }

    await table.update(updateData);

    res.json({
      message: 'Table updated successfully',
      table
    });

  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      error: 'Failed to update table',
      message: error.message
    });
  }
};

// Update table status
const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, TrangThai, notes } = req.body;

    // Support both English and Vietnamese field names
    const statusValue = status || TrangThai;

    if (!statusValue) {
      return res.status(400).json({
        error: 'Status is required (status or TrangThai field)'
      });
    }

    const validStatuses = ['Trống', 'Đã đặt', 'Đang phục vụ', 'Đang sử dụng', 'Bảo trì'];
    if (!validStatuses.includes(statusValue)) {
      return res.status(400).json({
        error: 'Invalid status. Valid values: Trống, Đã đặt, Đang phục vụ, Đang sử dụng, Bảo trì'
      });
    }

    const table = await Ban.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    const updateData = { TrangThai: statusValue };

    await table.update(updateData);

    res.json({
      message: `Table status updated to ${statusValue}`,
      table
    });

  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({
      error: 'Failed to update table status',
      message: error.message
    });
  }
};

// Delete table
const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Ban.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    // Check if table has any reservations (active or historical)
    const totalReservations = await DatBan.count({
      where: { MaBan: id }
    });

    if (totalReservations > 0) {
      // Check for active/future reservations
      const activeReservations = await DatBan.count({
        where: {
          MaBan: id,
          TrangThai: ['Đã đặt', 'Đã xác nhận'],
          NgayDat: {
            [Op.gte]: new Date().toISOString().split('T')[0]
          }
        }
      });

      const message = activeReservations > 0 
        ? `Bàn này có ${activeReservations} đặt bàn đang hoạt động và ${totalReservations} đặt bàn tổng cộng. Không thể xóa để đảm bảo tính toàn vẹn dữ liệu.`
        : `Bàn này có ${totalReservations} đặt bàn trong lịch sử. Không thể xóa để đảm bảo tính toàn vẹn dữ liệu.`;

      return res.status(400).json({
        error: 'Cannot delete table with existing reservations',
        message: message,
        suggestion: 'Bạn có thể đánh dấu bàn là "Bảo trì" thay vì xóa, hoặc liên hệ quản trị viên để xử lý.',
        active_reservations: activeReservations,
        total_reservations: totalReservations
      });
    }

    await table.destroy();

    res.json({
      message: 'Table deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting table:', error);
    
    // Handle Sequelize foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError' || error.code === 'ER_ROW_IS_REFERENCED_2') {
      // Get total reservations count for this table
      try {
        const totalReservations = await DatBan.count({
          where: { MaBan: id }
        });
        
        return res.status(400).json({
          error: 'Cannot delete table with existing reservations',
          message: `Bàn này có ${totalReservations} đặt bàn trong hệ thống. Không thể xóa để đảm bảo tính toàn vẹn dữ liệu.`,
          suggestion: 'Bạn có thể đánh dấu bàn là "Bảo trì" thay vì xóa, hoặc liên hệ quản trị viên để xử lý.',
          total_reservations: totalReservations,
          constraint_error: true
        });
      } catch (countError) {
        return res.status(400).json({
          error: 'Cannot delete table with existing reservations',
          message: 'Bàn này có đặt bàn trong hệ thống. Không thể xóa để đảm bảo tính toàn vẹn dữ liệu.',
          suggestion: 'Bạn có thể đánh dấu bàn là "Bảo trì" thay vì xóa, hoặc liên hệ quản trị viên để xử lý.',
          constraint_error: true
        });
      }
    }
    
    // Handle other errors
    res.status(500).json({
      error: 'Failed to delete table',
      message: error.message
    });
  }
};

// Get available tables for specific date/time
const getAvailableTables = async (req, res) => {
  try {
    const { 
      date, 
      time, 
      duration = 120, 
      party_size,
      location 
    } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        error: 'Date and time are required'
      });
    }

    const whereClause = {
      TrangThai: ['Trống', 'Đang phục vụ'] // Available and occupied tables
    };

    if (party_size) {
      whereClause.SoCho = { [Op.gte]: parseInt(party_size) };
    }

    // Note: Vietnamese schema doesn't have location field

    // Calculate time range for conflict checking
    const requestedStart = new Date(`${date} ${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + parseInt(duration) * 60000);

    // Find tables with conflicting reservations
    const conflictingReservations = await DatBan.findAll({
      where: {
        NgayDat: date,
        TrangThai: ['Đã đặt', 'Hoàn thành'],
        GioDat: {
          [Op.between]: [time, requestedEnd.toTimeString().split(' ')[0]]
        }
      },
      attributes: ['MaBan']
    });

    const conflictingTableIds = conflictingReservations.map(r => r.MaBan);

    // Add conflicting tables to where clause
    if (conflictingTableIds.length > 0) {
      whereClause.MaBan = { [Op.notIn]: conflictingTableIds };
    }

    const availableTables = await Ban.findAll({
      where: whereClause,
      order: [['SoCho', 'ASC'], ['TenBan', 'ASC']]
    });

    res.json({
      available_tables: availableTables,
      search_criteria: {
        date,
        time,
        duration: parseInt(duration),
        party_size: party_size ? parseInt(party_size) : null,
        location
      }
    });

  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({
      error: 'Failed to fetch available tables',
      message: error.message
    });
  }
};

// Get table statistics
const getTableStats = async (req, res) => {
  try {
    const totalTables = await Ban.count();
    
    const statusCounts = await Ban.findAll({
      attributes: [
        'TrangThai',
        [sequelize.fn('COUNT', sequelize.col('MaBan')), 'count']
      ],
      group: ['TrangThai']
    });

    const areaCounts = await Ban.findAll({
      attributes: [
        'MaKhuVuc',
        [sequelize.fn('COUNT', sequelize.col('MaBan')), 'count']
      ],
      group: ['MaKhuVuc']
    });

    const capacityStats = await Ban.findAll({
      attributes: [
        [sequelize.fn('MIN', sequelize.col('SoCho')), 'min_capacity'],
        [sequelize.fn('MAX', sequelize.col('SoCho')), 'max_capacity'],
        [sequelize.fn('AVG', sequelize.col('SoCho')), 'avg_capacity'],
        [sequelize.fn('SUM', sequelize.col('SoCho')), 'total_capacity']
      ]
    });

    res.json({
      stats: {
        total_tables: totalTables,
        status_breakdown: statusCounts.map(s => ({
          status: s.TrangThai,
          count: parseInt(s.dataValues.count)
        })),
        area_breakdown: areaCounts.map(a => ({
          area: a.MaKhuVuc,
          count: parseInt(a.dataValues.count)
        })),
        capacity_stats: capacityStats[0]?.dataValues || {}
      }
    });

  } catch (error) {
    console.error('Error fetching table stats:', error);
    res.status(500).json({
      error: 'Failed to fetch table statistics',
      message: error.message
    });
  }
};

// Get all areas/khu_vuc
const getAreas = async (req, res) => {
  try {
    // Import KhuVuc model
    const { KhuVuc } = require('../models');
    
    // Get areas with table count
    const areas = await KhuVuc.findAll({
      attributes: [
        'MaKhuVuc',
        'TenKhuVuc', 
        'MoTa',
        'TrangThai',
        [sequelize.fn('COUNT', sequelize.col('tables.MaBan')), 'table_count']
      ],
      include: [{
        model: Ban,
        as: 'tables',
        attributes: [],
        required: false
      }],
      group: ['KhuVuc.MaKhuVuc', 'KhuVuc.TenKhuVuc', 'KhuVuc.MoTa', 'KhuVuc.TrangThai'],
      order: [['MaKhuVuc', 'ASC']]
    });

    const areaList = areas.map(area => ({
      MaKhuVuc: area.MaKhuVuc,
      TenKhuVuc: area.TenKhuVuc,
      MoTa: area.MoTa,
      TrangThai: area.TrangThai,
      table_count: parseInt(area.dataValues.table_count) || 0,
      // Legacy support
      name: area.MaKhuVuc,
      id: area.MaKhuVuc
    }));

    res.json({
      success: true,
      areas: areaList
    });

  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({
      error: 'Failed to fetch areas',
      message: error.message
    });
  }
};

// Get tables by area with real-time availability
const getTablesByArea = async (req, res) => {
  try {
    const { area } = req.params;
    const { 
      include_reservations = false,
      date = new Date().toISOString().split('T')[0],
      time = new Date().toTimeString().split(' ')[0],
      duration = 120,
      real_time_status = true
    } = req.query;

    const whereClause = { MaKhuVuc: area };

    const includeOptions = [];
    if (include_reservations === 'true') {
      includeOptions.push({
        model: DatBan,
        as: 'datban',
        where: {
          TrangThai: ['Đã đặt', 'Đã xác nhận', 'Hoàn thành'],
          NgayDat: {
            [Op.gte]: new Date().toISOString().split('T')[0]
          }
        },
        required: false,
        order: [['NgayDat', 'ASC'], ['GioDat', 'ASC']]
      });
    }

    // Include area information
    includeOptions.push({
      model: KhuVuc,
      as: 'khuVuc',
      attributes: ['MaKhuVuc', 'TenKhuVuc', 'MoTa', 'HinhAnh', 'Video', 'TrangThai']
    });

    const tables = await Ban.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['TenBan', 'ASC']]
    });

    // Calculate real-time availability if requested
    let tablesWithAvailability = tables;
    if (real_time_status === 'true') {
      tablesWithAvailability = await Promise.all(tables.map(async (table) => {
        const availability = await calculateTableAvailability(table.MaBan, date, time, duration);
        return {
          ...table.toJSON(),
          real_time_status: availability.status,
          is_available: availability.is_available,
          next_reservation: availability.next_reservation,
          current_reservation: availability.current_reservation
        };
      }));
    }

    res.json({
      success: true,
      area: tables.length > 0 ? tables[0].khuVuc : null,
      tables: tablesWithAvailability,
      total_tables: tables.length,
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
    
    // Calculate requested time range
    const requestedStart = new Date(`${requestDate} ${requestTime}`);
    const requestedEnd = new Date(requestedStart.getTime() + parseInt(duration) * 60000);
    const requestedEndTime = requestedEnd.toTimeString().split(' ')[0];

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

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getAvailableTables,
  getTableStats,
  getAreas,
  getTablesByArea
};
