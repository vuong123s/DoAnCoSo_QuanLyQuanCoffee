const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  updatePaymentStatus,
  getBillingStats,
  deleteBill,
  // Order items management (bán hàng)
  addItemToOrder,
  updateOrderItem,
  removeOrderItem,
  getOrderItems,
  createOrderWithItems
} = require('../controllers/billingController');

// Create a new bill
router.post('/', createBill);

// Create order with items (for table reservation with pre-order)
router.post('/with-items', createOrderWithItems);

// Get all bills with optional filters (no auth for testing)
router.get('/', getBills);

// Test route (REMOVE IN PRODUCTION)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Billing service is working!',
    timestamp: new Date()
  });
});

// Test route for orders without auth
router.get('/test-orders', async (req, res) => {
  try {
    console.log('📋 Fetching test orders...');
    const { DonHang, CTDonHang } = require('../models');
    
    const orders = await DonHang.findAll({
      include: [{
        model: CTDonHang,
        as: 'chitiet',
        required: false
      }],
      order: [['NgayLap', 'DESC']],
      limit: 10
    });

    console.log(`📋 Found ${orders.length} orders`);
    console.log('📋 Orders:', orders.map(o => ({ MaDH: o.MaDH, TrangThai: o.TrangThai, MaBan: o.MaBan })));

    res.json({
      success: true,
      donhangs: orders,
      bills: orders, // Alias for compatibility
      count: orders.length
    });
  } catch (error) {
    console.error('❌ Error fetching test orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

// Create sample orders for testing
router.post('/create-sample-orders', async (req, res) => {
  try {
    console.log('🆕 Creating sample orders...');
    const { DonHang } = require('../models');
    
    const sampleOrders = [
      {
        MaBan: 1,
        MaNV: 1,
        TongTien: 85000,
        TrangThai: 'Đang xử lý'
      },
      {
        MaBan: 3,
        MaNV: 1,
        TongTien: 120000,
        TrangThai: 'Đang xử lý'
      },
      {
        MaBan: 5,
        MaNV: 1,
        TongTien: 65000,
        TrangThai: 'Hoàn thành'
      }
    ];

    const createdOrders = await DonHang.bulkCreate(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} sample orders`);
    
    res.json({
      success: true,
      message: 'Sample orders created successfully',
      orders: createdOrders
    });
  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
    res.status(500).json({
      error: 'Failed to create sample orders',
      message: error.message
    });
  }
});

// Get billing statistics
router.get('/stats', (req, res) => {
  // Return mock data for now
  res.json({
    success: true,
    data: {
      totalRevenue: 15000000,
      totalOrders: 245,
      averageOrderValue: 61224,
      todayRevenue: 850000,
      todayOrders: 12,
      monthlyRevenue: 8500000,
      monthlyOrders: 156,
      paymentMethods: {
        cash: 45,
        card: 35,
        transfer: 20
      }
    }
  });
});

// Get bill by ID
router.get('/:id', getBillById);

// Debug route to test if routes are working
router.get('/:id/test', (req, res) => {
  res.json({ message: 'Route is working', id: req.params.id });
});

// Update payment status - try both PATCH and PUT
router.patch('/:id/payment', (req, res, next) => {
  console.log('📡 PATCH /:id/payment route hit:', { id: req.params.id, body: req.body });
  next();
}, updatePaymentStatus);

router.put('/:id/payment', (req, res, next) => {
  console.log('📡 PUT /:id/payment route hit:', { id: req.params.id, body: req.body });
  next();
}, updatePaymentStatus);

// Delete/Cancel bill
router.delete('/:id', deleteBill);

// Order items management routes (bán hàng)
// Add item to order
router.post('/:orderId/items', addItemToOrder);

// Get order items
router.get('/:orderId/items', getOrderItems);

// Update item in order
router.patch('/:orderId/items/:itemId', updateOrderItem);

// Remove item from order
router.delete('/:orderId/items/:itemId', removeOrderItem);

module.exports = router;
