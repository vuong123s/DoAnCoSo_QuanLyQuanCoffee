const { Table, TableReservation } = require('../models');
const { Op } = require('sequelize');

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
    if (status) whereClause.status = status;
    if (location) whereClause.location = location;
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';
    
    if (capacity_min || capacity_max) {
      whereClause.capacity = {};
      if (capacity_min) whereClause.capacity[Op.gte] = parseInt(capacity_min);
      if (capacity_max) whereClause.capacity[Op.lte] = parseInt(capacity_max);
    }

    const includeOptions = [];
    if (include_reservations === 'true') {
      includeOptions.push({
        model: TableReservation,
        as: 'reservations',
        where: {
          status: ['confirmed', 'checked_in'],
          reservation_date: {
            [Op.gte]: new Date().toISOString().split('T')[0]
          }
        },
        required: false,
        order: [['reservation_date', 'ASC'], ['reservation_time', 'ASC']]
      });
    }

    const { count, rows } = await Table.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['table_number', 'ASC']],
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
        model: TableReservation,
        as: 'reservations',
        order: [['reservation_date', 'DESC'], ['reservation_time', 'DESC']]
      });
    }

    const table = await Table.findByPk(id, {
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
    const existingTable = await Table.findOne({
      where: { table_number: table_number.trim() }
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

    const table = await Table.create({
      table_number: table_number.trim(),
      capacity: parseInt(capacity),
      location,
      description,
      features: parsedFeatures,
      position_x: position_x ? parseFloat(position_x) : null,
      position_y: position_y ? parseFloat(position_y) : null
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

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    // If table_number is being updated, check for duplicates
    if (updateData.table_number && updateData.table_number.trim() !== table.table_number) {
      const existingTable = await Table.findOne({
        where: { 
          table_number: updateData.table_number.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingTable) {
        return res.status(400).json({
          error: 'Table number already exists'
        });
      }

      updateData.table_number = updateData.table_number.trim();
    }

    // Handle features JSON field
    if (updateData.features && typeof updateData.features !== 'string') {
      updateData.features = JSON.stringify(updateData.features);
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

    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status'
      });
    }

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    const updateData = { status };
    if (notes) updateData.description = notes;
    if (status === 'maintenance') updateData.last_cleaned = new Date();

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

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({
        error: 'Table not found'
      });
    }

    // Check if table has active reservations
    const activeReservations = await TableReservation.count({
      where: {
        table_id: id,
        status: ['confirmed', 'checked_in'],
        reservation_date: {
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
      is_active: true,
      status: ['available', 'occupied'] // occupied tables might become available
    };

    if (party_size) {
      whereClause.capacity = { [Op.gte]: parseInt(party_size) };
    }

    if (location) {
      whereClause.location = location;
    }

    // Calculate time range for conflict checking
    const requestedStart = new Date(`${date} ${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + parseInt(duration) * 60000);

    // Find tables with conflicting reservations
    const conflictingReservations = await TableReservation.findAll({
      where: {
        reservation_date: date,
        status: ['confirmed', 'checked_in'],
        [Op.or]: [
          {
            // Reservation starts before requested time but ends after requested start
            reservation_time: { [Op.lt]: time },
            [Op.and]: [
              sequelize.literal(`TIME_ADD(reservation_time, INTERVAL duration_minutes MINUTE) > '${time}'`)
            ]
          },
          {
            // Reservation starts during requested time period
            reservation_time: {
              [Op.between]: [time, requestedEnd.toTimeString().split(' ')[0]]
            }
          }
        ]
      },
      attributes: ['table_id']
    });

    const conflictingTableIds = conflictingReservations.map(r => r.table_id);

    // Add conflicting tables to where clause
    if (conflictingTableIds.length > 0) {
      whereClause.id = { [Op.notIn]: conflictingTableIds };
    }

    const availableTables = await Table.findAll({
      where: whereClause,
      order: [['capacity', 'ASC'], ['table_number', 'ASC']]
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
    const totalTables = await Table.count({ where: { is_active: true } });
    
    const statusCounts = await Table.findAll({
      where: { is_active: true },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const locationCounts = await Table.findAll({
      where: { is_active: true },
      attributes: [
        'location',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['location']
    });

    const capacityStats = await Table.findAll({
      where: { is_active: true },
      attributes: [
        [sequelize.fn('MIN', sequelize.col('capacity')), 'min_capacity'],
        [sequelize.fn('MAX', sequelize.col('capacity')), 'max_capacity'],
        [sequelize.fn('AVG', sequelize.col('capacity')), 'avg_capacity'],
        [sequelize.fn('SUM', sequelize.col('capacity')), 'total_capacity']
      ]
    });

    res.json({
      stats: {
        total_tables: totalTables,
        status_breakdown: statusCounts.map(s => ({
          status: s.status,
          count: parseInt(s.dataValues.count)
        })),
        location_breakdown: locationCounts.map(l => ({
          location: l.location,
          count: parseInt(l.dataValues.count)
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
