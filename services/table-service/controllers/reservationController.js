const { TableReservation, Table } = require('../models');
const { Op } = require('sequelize');

// Get all reservations with optional filters
const getReservations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      table_id,
      status,
      date,
      start_date,
      end_date,
      customer_phone,
      customer_name
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (table_id) whereClause.table_id = table_id;
    if (status) whereClause.status = status;
    if (customer_phone) whereClause.customer_phone = { [Op.like]: `%${customer_phone}%` };
    if (customer_name) whereClause.customer_name = { [Op.like]: `%${customer_name}%` };
    
    if (date) {
      whereClause.reservation_date = date;
    } else if (start_date || end_date) {
      whereClause.reservation_date = {};
      if (start_date) whereClause.reservation_date[Op.gte] = start_date;
      if (end_date) whereClause.reservation_date[Op.lte] = end_date;
    }

    const { count, rows } = await TableReservation.findAndCountAll({
      where: whereClause,
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'capacity', 'location']
      }],
      order: [['reservation_date', 'DESC'], ['reservation_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      reservations: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      error: 'Failed to fetch reservations',
      message: error.message
    });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await TableReservation.findByPk(id, {
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'capacity', 'location', 'features']
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        error: 'Reservation not found'
      });
    }

    res.json({ reservation });

  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      error: 'Failed to fetch reservation',
      message: error.message
    });
  }
};

// Create new reservation
const createReservation = async (req, res) => {
  try {
    const {
      table_id,
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      reservation_time,
      duration_minutes = 120,
      special_requests,
      notes
    } = req.body;

    if (!table_id || !customer_name || !customer_phone || !party_size || !reservation_date || !reservation_time) {
      return res.status(400).json({
        error: 'Missing required fields: table_id, customer_name, customer_phone, party_size, reservation_date, reservation_time'
      });
    }

    // Check if table exists and is active
    const table = await Table.findByPk(table_id);
    if (!table) {
      return res.status(400).json({
        error: 'Table not found'
      });
    }

    if (!table.is_active) {
      return res.status(400).json({
        error: 'Table is not active'
      });
    }

    // Check if party size exceeds table capacity
    if (party_size > table.capacity) {
      return res.status(400).json({
        error: `Party size (${party_size}) exceeds table capacity (${table.capacity})`
      });
    }

    // Check for conflicting reservations
    const requestedStart = new Date(`${reservation_date} ${reservation_time}`);
    const requestedEnd = new Date(requestedStart.getTime() + parseInt(duration_minutes) * 60000);

    const conflictingReservation = await TableReservation.findOne({
      where: {
        table_id,
        reservation_date,
        status: ['confirmed', 'checked_in'],
        [Op.or]: [
          {
            // Existing reservation starts before requested time but ends after requested start
            reservation_time: { [Op.lt]: reservation_time },
            [Op.and]: [
              sequelize.literal(`TIME_ADD(reservation_time, INTERVAL duration_minutes MINUTE) > '${reservation_time}'`)
            ]
          },
          {
            // Existing reservation starts during requested time period
            reservation_time: {
              [Op.between]: [reservation_time, requestedEnd.toTimeString().split(' ')[0]]
            }
          }
        ]
      }
    });

    if (conflictingReservation) {
      return res.status(400).json({
        error: 'Table is already reserved for the requested time slot',
        conflicting_reservation: {
          id: conflictingReservation.id,
          time: conflictingReservation.reservation_time,
          duration: conflictingReservation.duration_minutes
        }
      });
    }

    // Create reservation
    const reservation = await TableReservation.create({
      table_id,
      user_id: user_id || null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email ? customer_email.trim() : null,
      party_size: parseInt(party_size),
      reservation_date,
      reservation_time,
      duration_minutes: parseInt(duration_minutes),
      special_requests,
      notes
    });

    // Update table status to reserved if reservation is for today
    const today = new Date().toISOString().split('T')[0];
    if (reservation_date === today) {
      await table.update({ status: 'reserved' });
    }

    const createdReservation = await TableReservation.findByPk(reservation.id, {
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'capacity', 'location']
      }]
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: createdReservation
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      error: 'Failed to create reservation',
      message: error.message
    });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const reservation = await TableReservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({
        error: 'Reservation not found'
      });
    }

    // Don't allow updates to completed or cancelled reservations
    if (['completed', 'cancelled', 'no_show'].includes(reservation.status)) {
      return res.status(400).json({
        error: `Cannot update ${reservation.status} reservation`
      });
    }

    // If updating table_id, check if new table exists
    if (updateData.table_id && updateData.table_id !== reservation.table_id) {
      const newTable = await Table.findByPk(updateData.table_id);
      if (!newTable || !newTable.is_active) {
        return res.status(400).json({
          error: 'New table not found or not active'
        });
      }

      // Check party size against new table capacity
      const partySize = updateData.party_size || reservation.party_size;
      if (partySize > newTable.capacity) {
        return res.status(400).json({
          error: `Party size (${partySize}) exceeds new table capacity (${newTable.capacity})`
        });
      }
    }

    // If updating time/date, check for conflicts
    if (updateData.reservation_date || updateData.reservation_time || updateData.duration_minutes) {
      const tableId = updateData.table_id || reservation.table_id;
      const date = updateData.reservation_date || reservation.reservation_date;
      const time = updateData.reservation_time || reservation.reservation_time;
      const duration = updateData.duration_minutes || reservation.duration_minutes;

      const requestedStart = new Date(`${date} ${time}`);
      const requestedEnd = new Date(requestedStart.getTime() + parseInt(duration) * 60000);

      const conflictingReservation = await TableReservation.findOne({
        where: {
          table_id: tableId,
          reservation_date: date,
          status: ['confirmed', 'checked_in'],
          id: { [Op.ne]: id }, // Exclude current reservation
          [Op.or]: [
            {
              reservation_time: { [Op.lt]: time },
              [Op.and]: [
                sequelize.literal(`TIME_ADD(reservation_time, INTERVAL duration_minutes MINUTE) > '${time}'`)
              ]
            },
            {
              reservation_time: {
                [Op.between]: [time, requestedEnd.toTimeString().split(' ')[0]]
              }
            }
          ]
        }
      });

      if (conflictingReservation) {
        return res.status(400).json({
          error: 'Table is already reserved for the requested time slot'
        });
      }
    }

    await reservation.update(updateData);

    const updatedReservation = await TableReservation.findByPk(id, {
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'capacity', 'location']
      }]
    });

    res.json({
      message: 'Reservation updated successfully',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({
      error: 'Failed to update reservation',
      message: error.message
    });
  }
};

// Update reservation status
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, cancellation_reason } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status'
      });
    }

    const reservation = await TableReservation.findByPk(id, {
      include: [{
        model: Table,
        as: 'table'
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        error: 'Reservation not found'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    // Set timestamp based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmed_at = new Date();
        // Update table status if reservation is for today
        const today = new Date().toISOString().split('T')[0];
        if (reservation.reservation_date === today) {
          await reservation.table.update({ status: 'reserved' });
        }
        break;
      case 'checked_in':
        updateData.checked_in_at = new Date();
        await reservation.table.update({ status: 'occupied' });
        break;
      case 'completed':
        updateData.completed_at = new Date();
        await reservation.table.update({ status: 'available' });
        break;
      case 'cancelled':
        updateData.cancelled_at = new Date();
        if (cancellation_reason) updateData.cancellation_reason = cancellation_reason;
        // Only update table status if it was reserved for this reservation
        if (reservation.table.status === 'reserved') {
          await reservation.table.update({ status: 'available' });
        }
        break;
      case 'no_show':
        // Only update table status if it was reserved for this reservation
        if (reservation.table.status === 'reserved') {
          await reservation.table.update({ status: 'available' });
        }
        break;
    }

    await reservation.update(updateData);

    const updatedReservation = await TableReservation.findByPk(id, {
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'capacity', 'location']
      }]
    });

    res.json({
      message: `Reservation status updated to ${status}`,
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      error: 'Failed to update reservation status',
      message: error.message
    });
  }
};

// Cancel reservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason, notes } = req.body;

    const reservation = await TableReservation.findByPk(id, {
      include: [{
        model: Table,
        as: 'table'
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        error: 'Reservation not found'
      });
    }

    if (['completed', 'cancelled', 'no_show'].includes(reservation.status)) {
      return res.status(400).json({
        error: `Cannot cancel ${reservation.status} reservation`
      });
    }

    await reservation.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason,
      notes: notes || reservation.notes
    });

    // Update table status if it was reserved for this reservation
    if (reservation.table.status === 'reserved') {
      await reservation.table.update({ status: 'available' });
    }

    res.json({
      message: 'Reservation cancelled successfully',
      reservation
    });

  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      error: 'Failed to cancel reservation',
      message: error.message
    });
  }
};

// Get reservations for today
const getTodayReservations = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { status } = req.query;

    const whereClause = {
      reservation_date: today
    };

    if (status) {
      whereClause.status = status;
    }

    const reservations = await TableReservation.findAll({
      where: whereClause,
      include: [{
        model: Table,
        as: 'table',
        attributes: ['id', 'table_number', 'capacity', 'location']
      }],
      order: [['reservation_time', 'ASC']]
    });

    res.json({
      date: today,
      reservations
    });

  } catch (error) {
    console.error('Error fetching today reservations:', error);
    res.status(500).json({
      error: 'Failed to fetch today reservations',
      message: error.message
    });
  }
};

// Get reservation statistics
const getReservationStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    if (start_date || end_date) {
      whereClause.reservation_date = {};
      if (start_date) whereClause.reservation_date[Op.gte] = start_date;
      if (end_date) whereClause.reservation_date[Op.lte] = end_date;
    }

    const totalReservations = await TableReservation.count({ where: whereClause });
    
    const statusCounts = await TableReservation.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const averagePartySize = await TableReservation.findAll({
      where: { ...whereClause, status: { [Op.ne]: 'cancelled' } },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('party_size')), 'average']
      ]
    });

    res.json({
      stats: {
        total_reservations: totalReservations,
        status_breakdown: statusCounts.map(s => ({
          status: s.status,
          count: parseInt(s.dataValues.count)
        })),
        average_party_size: averagePartySize[0]?.dataValues?.average || 0
      }
    });

  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    res.status(500).json({
      error: 'Failed to fetch reservation statistics',
      message: error.message
    });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
  getTodayReservations,
  getReservationStats
};
