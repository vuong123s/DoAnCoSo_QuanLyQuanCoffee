const { Bill, BillItem } = require('../models');
const { Op } = require('sequelize');

// Create a new bill
const createBill = async (req, res) => {
  try {
    const { table_id, user_id, items, tax_rate = 0.1, discount_amount = 0, notes } = req.body;

    if (!table_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: table_id and items array'
      });
    }

    // Calculate totals
    let total_amount = 0;
    const processedItems = items.map(item => {
      if (!item.menu_item_id || !item.quantity || !item.unit_price) {
        throw new Error('Each item must have menu_item_id, quantity, and unit_price');
      }
      const total_price = parseFloat(item.unit_price) * parseInt(item.quantity);
      total_amount += total_price;
      
      return {
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: total_price,
        notes: item.notes || null
      };
    });

    const tax_amount = total_amount * tax_rate;
    const final_amount = total_amount + tax_amount - discount_amount;

    // Create bill
    const bill = await Bill.create({
      table_id,
      user_id: user_id || null,
      total_amount: total_amount.toFixed(2),
      tax_amount: tax_amount.toFixed(2),
      discount_amount: discount_amount.toFixed(2),
      final_amount: final_amount.toFixed(2),
      payment_status: 'pending',
      notes
    });

    // Create bill items
    const billItems = processedItems.map(item => ({
      ...item,
      bill_id: bill.id
    }));

    await BillItem.bulkCreate(billItems);

    // Fetch complete bill with items
    const completeBill = await Bill.findByPk(bill.id, {
      include: [{
        model: BillItem,
        as: 'items'
      }]
    });

    res.status(201).json({
      message: 'Bill created successfully',
      bill: completeBill
    });

  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      error: 'Failed to create bill',
      message: error.message
    });
  }
};

// Get all bills with optional filters
const getBills = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      table_id, 
      user_id, 
      payment_status,
      start_date,
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (table_id) whereClause.table_id = table_id;
    if (user_id) whereClause.user_id = user_id;
    if (payment_status) whereClause.payment_status = payment_status;
    
    if (start_date || end_date) {
      whereClause.created_at = {};
      if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
      if (end_date) whereClause.created_at[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await Bill.findAndCountAll({
      where: whereClause,
      include: [{
        model: BillItem,
        as: 'items'
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      bills: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      error: 'Failed to fetch bills',
      message: error.message
    });
  }
};

// Get bill by ID
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findByPk(id, {
      include: [{
        model: BillItem,
        as: 'items'
      }]
    });

    if (!bill) {
      return res.status(404).json({
        error: 'Bill not found'
      });
    }

    res.json({ bill });

  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      error: 'Failed to fetch bill',
      message: error.message
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, notes } = req.body;

    if (!payment_status) {
      return res.status(400).json({
        error: 'Payment status is required'
      });
    }

    const validStatuses = ['pending', 'paid', 'cancelled', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        error: 'Invalid payment status'
      });
    }

    const bill = await Bill.findByPk(id);
    if (!bill) {
      return res.status(404).json({
        error: 'Bill not found'
      });
    }

    const updateData = {
      payment_status,
      notes: notes || bill.notes
    };

    if (payment_status === 'paid') {
      updateData.payment_method = payment_method;
      updateData.payment_date = new Date();
    }

    await bill.update(updateData);

    const updatedBill = await Bill.findByPk(id, {
      include: [{
        model: BillItem,
        as: 'items'
      }]
    });

    res.json({
      message: 'Payment status updated successfully',
      bill: updatedBill
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      error: 'Failed to update payment status',
      message: error.message
    });
  }
};

// Get billing statistics
const getBillingStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    if (start_date || end_date) {
      whereClause.created_at = {};
      if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
      if (end_date) whereClause.created_at[Op.lte] = new Date(end_date);
    }

    const totalBills = await Bill.count({ where: whereClause });
    
    const paidBills = await Bill.count({
      where: { ...whereClause, payment_status: 'paid' }
    });

    const pendingBills = await Bill.count({
      where: { ...whereClause, payment_status: 'pending' }
    });

    const totalRevenue = await Bill.sum('final_amount', {
      where: { ...whereClause, payment_status: 'paid' }
    });

    const averageBillAmount = await Bill.findAll({
      where: { ...whereClause, payment_status: 'paid' },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('final_amount')), 'average']
      ]
    });

    res.json({
      stats: {
        total_bills: totalBills,
        paid_bills: paidBills,
        pending_bills: pendingBills,
        cancelled_bills: totalBills - paidBills - pendingBills,
        total_revenue: totalRevenue || 0,
        average_bill_amount: averageBillAmount[0]?.dataValues?.average || 0
      }
    });

  } catch (error) {
    console.error('Error fetching billing stats:', error);
    res.status(500).json({
      error: 'Failed to fetch billing statistics',
      message: error.message
    });
  }
};

// Delete bill (soft delete by updating status)
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findByPk(id);
    if (!bill) {
      return res.status(404).json({
        error: 'Bill not found'
      });
    }

    if (bill.payment_status === 'paid') {
      return res.status(400).json({
        error: 'Cannot delete a paid bill'
      });
    }

    await bill.update({ payment_status: 'cancelled' });

    res.json({
      message: 'Bill cancelled successfully'
    });

  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({
      error: 'Failed to delete bill',
      message: error.message
    });
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updatePaymentStatus,
  getBillingStats,
  deleteBill
};
