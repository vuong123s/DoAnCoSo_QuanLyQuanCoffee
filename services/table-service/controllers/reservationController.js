const { DatBan, Ban } = require('../models');
const { Op, sequelize } = require('sequelize');

// Lấy tất cả đặt bàn với bộ lọc
const getReservations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      MaBan,
      TrangThai,
      NgayDat,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Áp dụng bộ lọc
    if (MaBan) whereClause.MaBan = MaBan;
    if (TrangThai) whereClause.TrangThai = TrangThai;
    
    if (NgayDat) {
      whereClause.NgayDat = NgayDat;
    } else if (start_date || end_date) {
      whereClause.NgayDat = {};
      if (start_date) whereClause.NgayDat[Op.gte] = start_date;
      if (end_date) whereClause.NgayDat[Op.lte] = end_date;
    }

    const { count, rows } = await DatBan.findAndCountAll({
      where: whereClause,
      include: [{
        model: Ban,
        as: 'ban',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'TrangThai']
      }],
      order: [['NgayDat', 'DESC'], ['GioDat', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reservations: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách đặt bàn',
      message: error.message
    });
  }
};

// Lấy đặt bàn theo ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await DatBan.findByPk(id, {
      include: [{
        model: Ban,
        as: 'ban',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'TrangThai']
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đặt bàn'
      });
    }

    res.json({
      success: true,
      data: { reservation }
    });

  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy thông tin đặt bàn',
      message: error.message
    });
  }
};

// Tạo đặt bàn mới
const createReservation = async (req, res) => {
  try {
    console.log('📝 Creating reservation with data:', req.body);
    
    const {
      MaKH,
      MaBan,
      NgayDat,
      GioDat,
      SoNguoi,
      TenKhach,
      SoDienThoai,
      GhiChu
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!MaBan || !NgayDat || !GioDat || !SoNguoi || !TenKhach || !SoDienThoai) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin bắt buộc: MaBan, NgayDat, GioDat, SoNguoi, TenKhach, SoDienThoai'
      });
    }

    // Kiểm tra bàn có tồn tại không
    console.log('🔍 Looking for table with ID:', MaBan);
    const table = await Ban.findByPk(MaBan);
    console.log('📋 Found table:', table ? table.toJSON() : 'null');
    
    if (!table) {
      return res.status(400).json({
        success: false,
        error: 'Không tìm thấy bàn'
      });
    }

    // Kiểm tra số người có vượt quá sức chứa không
    if (SoNguoi > table.SoCho) {
      return res.status(400).json({
        success: false,
        error: `Số người (${SoNguoi}) vượt quá sức chứa của bàn (${table.SoCho})`
      });
    }

    // Kiểm tra xung đột thời gian đặt bàn
    const conflictingReservation = await DatBan.findOne({
      where: {
        MaBan,
        NgayDat,
        GioDat,
        TrangThai: ['Đã đặt', 'Đã xác nhận']
      }
    });

    if (conflictingReservation) {
      return res.status(400).json({
        success: false,
        error: 'Bàn đã được đặt trong thời gian này',
        conflicting_reservation: {
          MaDat: conflictingReservation.MaDat,
          GioDat: conflictingReservation.GioDat
        }
      });
    }

    // Tạo đặt bàn
    console.log('🔄 Creating reservation in database...');
    const reservationData = {
      MaKH: MaKH || null,
      MaBan,
      NgayDat,
      GioDat,
      SoNguoi: parseInt(SoNguoi),
      TrangThai: 'Đã đặt',
      TenKhach: TenKhach ? TenKhach.trim() : '',
      SoDienThoai: SoDienThoai ? SoDienThoai.trim() : '',
      GhiChu: GhiChu ? GhiChu.trim() : null
    };
    
    console.log('📋 Reservation data to create:', reservationData);
    const reservation = await DatBan.create(reservationData);
    console.log('✅ Reservation created with ID:', reservation.MaDat);

    // Cập nhật trạng thái bàn nếu đặt cho hôm nay
    const today = new Date().toISOString().split('T')[0];
    if (NgayDat === today) {
      await table.update({ TrangThai: 'Đã đặt' });
    }

    const createdReservation = await DatBan.findByPk(reservation.MaDat, {
      include: [{
        model: Ban,
        as: 'ban',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'TrangThai']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Đặt bàn thành công',
      data: { reservation: createdReservation }
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tạo đặt bàn',
      message: error.message
    });
  }
};

// Cập nhật đặt bàn
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const reservation = await DatBan.findByPk(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đặt bàn'
      });
    }

    // Không cho phép cập nhật đặt bàn đã hoàn thành hoặc đã hủy
    if (['Hoàn thành', 'Đã hủy'].includes(reservation.TrangThai)) {
      return res.status(400).json({
        success: false,
        error: `Không thể cập nhật đặt bàn đã ${reservation.TrangThai}`
      });
    }

    // Nếu cập nhật MaBan, kiểm tra bàn mới
    if (updateData.MaBan && updateData.MaBan !== reservation.MaBan) {
      const newTable = await Ban.findByPk(updateData.MaBan);
      if (!newTable) {
        return res.status(400).json({
          success: false,
          error: 'Không tìm thấy bàn mới'
        });
      }

      // Kiểm tra số người với sức chứa bàn mới
      const soNguoi = updateData.SoNguoi || reservation.SoNguoi;
      if (soNguoi > newTable.SoCho) {
        return res.status(400).json({
          success: false,
          error: `Số người (${soNguoi}) vượt quá sức chứa bàn mới (${newTable.SoCho})`
        });
      }
    }

    await reservation.update(updateData);

    const updatedReservation = await DatBan.findByPk(id, {
      include: [{
        model: Ban,
        as: 'ban',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'TrangThai']
      }]
    });

    res.json({
      success: true,
      message: 'Cập nhật đặt bàn thành công',
      data: { reservation: updatedReservation }
    });

  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật đặt bàn',
      message: error.message
    });
  }
};

// Cập nhật trạng thái đặt bàn
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { TrangThai, GhiChu } = req.body;

    if (!TrangThai) {
      return res.status(400).json({
        success: false,
        error: 'Trạng thái là bắt buộc'
      });
    }

    const validStatuses = ['Đã đặt', 'Đã xác nhận', 'Đã hủy', 'Hoàn thành'];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({
        success: false,
        error: 'Trạng thái không hợp lệ'
      });
    }

    const reservation = await DatBan.findByPk(id, {
      include: [{
        model: Ban,
        as: 'ban'
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đặt bàn'
      });
    }

    const updateData = { TrangThai };
    if (GhiChu) updateData.GhiChu = GhiChu;

    // Cập nhật trạng thái bàn dựa trên trạng thái đặt bàn
    const table = await Ban.findByPk(reservation.MaBan);
    switch (TrangThai) {
      case 'Đã xác nhận':
        // Cập nhật trạng thái bàn nếu đặt cho hôm nay
        const today = new Date().toISOString().split('T')[0];
        if (reservation.NgayDat === today) {
          await table.update({ TrangThai: 'Đã đặt' });
        }
        break;
      case 'Hoàn thành':
        await table.update({ TrangThai: 'Trống' });
        break;
      case 'Đã hủy':
        // Chỉ cập nhật trạng thái bàn nếu bàn đang được đặt cho reservation này
        if (table.TrangThai === 'Đã đặt') {
          await table.update({ TrangThai: 'Trống' });
        }
        break;
    }

    await reservation.update(updateData);

    const updatedReservation = await DatBan.findByPk(id, {
      include: [{
        model: Ban,
        as: 'ban',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'TrangThai']
      }]
    });

    res.json({
      success: true,
      message: `Cập nhật trạng thái đặt bàn thành ${TrangThai}`,
      data: { reservation: updatedReservation }
    });

  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật trạng thái đặt bàn',
      message: error.message
    });
  }
};

// Hủy đặt bàn
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { GhiChu } = req.body;

    const reservation = await DatBan.findByPk(id, {
      include: [{
        model: Ban,
        as: 'ban'
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đặt bàn'
      });
    }

    if (['Hoàn thành', 'Đã hủy'].includes(reservation.TrangThai)) {
      return res.status(400).json({
        success: false,
        error: `Không thể hủy đặt bàn đã ${reservation.TrangThai}`
      });
    }

    await reservation.update({
      TrangThai: 'Đã hủy',
      GhiChu: GhiChu || reservation.GhiChu
    });

    // Cập nhật trạng thái bàn nếu bàn đang được đặt
    const table = await Ban.findByPk(reservation.MaBan);
    if (table.TrangThai === 'Đã đặt') {
      await table.update({ TrangThai: 'Trống' });
    }

    res.json({
      success: true,
      message: 'Hủy đặt bàn thành công',
      data: { reservation }
    });

  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể hủy đặt bàn',
      message: error.message
    });
  }
};

// Lấy đặt bàn hôm nay
const getTodayReservations = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { TrangThai } = req.query;

    const whereClause = {
      NgayDat: today
    };

    if (TrangThai) {
      whereClause.TrangThai = TrangThai;
    }

    const reservations = await DatBan.findAll({
      where: whereClause,
      include: [{
        model: Ban,
        as: 'ban',
        attributes: ['MaBan', 'TenBan', 'SoCho', 'TrangThai']
      }],
      order: [['GioDat', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        date: today,
        reservations
      }
    });

  } catch (error) {
    console.error('Error fetching today reservations:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách đặt bàn hôm nay',
      message: error.message
    });
  }
};

// Lấy bàn trống theo thời gian
const getAvailableTables = async (req, res) => {
  try {
    const { NgayDat, GioDat, SoNguoi } = req.query;

    if (!NgayDat || !GioDat || !SoNguoi) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin: NgayDat, GioDat, SoNguoi'
      });
    }

    // Lấy tất cả bàn có sức chứa phù hợp
    const allTables = await Ban.findAll({
      where: {
        SoCho: { [Op.gte]: parseInt(SoNguoi) },
        TrangThai: { [Op.ne]: 'Bảo trì' }
      }
    });

    // Lấy các bàn đã được đặt trong thời gian này
    const reservedTables = await DatBan.findAll({
      where: {
        NgayDat,
        GioDat,
        TrangThai: ['Đã đặt', 'Đã xác nhận']
      },
      attributes: ['MaBan']
    });

    const reservedTableIds = reservedTables.map(r => r.MaBan);
    const availableTables = allTables.filter(table => !reservedTableIds.includes(table.MaBan));

    res.json({
      success: true,
      data: {
        available_tables: availableTables,
        total_available: availableTables.length
      }
    });

  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy danh sách bàn trống',
      message: error.message
    });
  }
};

// Thống kê đặt bàn
const getReservationStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const whereClause = {};

    if (start_date || end_date) {
      whereClause.NgayDat = {};
      if (start_date) whereClause.NgayDat[Op.gte] = start_date;
      if (end_date) whereClause.NgayDat[Op.lte] = end_date;
    }

    const totalReservations = await DatBan.count({ where: whereClause });
    
    const statusCounts = await DatBan.findAll({
      where: whereClause,
      attributes: [
        'TrangThai',
        [sequelize.fn('COUNT', sequelize.col('MaDat')), 'count']
      ],
      group: ['TrangThai']
    });

    const averagePartySize = await DatBan.findAll({
      where: { ...whereClause, TrangThai: { [Op.ne]: 'Đã hủy' } },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('SoNguoi')), 'average']
      ]
    });

    res.json({
      success: true,
      data: {
        stats: {
          total_reservations: totalReservations,
          status_breakdown: statusCounts.map(s => ({
            status: s.TrangThai,
            count: parseInt(s.dataValues.count)
          })),
          average_party_size: parseFloat(averagePartySize[0]?.dataValues?.average || 0).toFixed(1)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reservation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể lấy thống kê đặt bàn',
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
  getAvailableTables,
  getReservationStats
};
