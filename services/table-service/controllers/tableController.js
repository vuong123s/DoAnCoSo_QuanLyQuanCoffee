const { Ban, DatBan } = require('../models');
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
      is_active,
      capacity_min,
      capacity_max,
      include_reservations = false
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (status) whereClause.TrangThai = status;
    // Note: Vietnamese schema doesn't have location or is_active fields
    
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
      order: [['TenBan', 'ASC']],
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
      table_number,
      capacity,
      location = 'indoor',
      description,
      features,
      position_x,
      position_y
    } = req.body;

    if (!table_number || !capacity) {
      return res.status(400).json({
        error: 'Missing required fields: table_number and capacity'
      });
    }

    // Check if table number already exists
    const existingTable = await Ban.findOne({
      where: { TenBan: table_number.trim() }
    });

    if (existingTable) {
      return res.status(400).json({
        error: 'Table number already exists'
      });
    }

    // Parse features if provided
    let parsedFeatures = null;
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? features : JSON.stringify(features);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid features format'
        });
      }
    }

    const table = await Ban.create({
      TenBan: table_number.trim(),
      SoCho: parseInt(capacity),
      TrangThai: 'Trống'
    });

    res.status(201).json({
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
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required'
      });
    }

    const validStatuses = ['Trống', 'Đã đặt', 'Đang phục vụ'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Valid values: Trống, Đã đặt, Đang phục vụ'
      });
    }

    const table = await Ban.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    const updateData = { TrangThai: status };

    await table.update(updateData);

    res.json({
      message: `Table status updated to ${status}`,
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

    // Check if table has active reservations
    const activeReservations = await DatBan.count({
      where: {
        MaBan: id,
        TrangThai: ['Đã đặt', 'Hoàn thành'],
        NgayDat: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        }
      }
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        error: 'Cannot delete table with active reservations',
        active_reservations: activeReservations
      });
    }

    await table.destroy();

    res.json({
      message: 'Table deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting table:', error);
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

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getAvailableTables,
  getTableStats
};
