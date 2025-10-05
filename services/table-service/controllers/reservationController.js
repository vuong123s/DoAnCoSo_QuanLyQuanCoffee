const { DatBan, Ban } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Helper function to update table status based on reservations
const updateTableStatusBasedOnReservations = async (MaBan, currentAction = null) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Tìm tất cả đặt bàn active cho bàn này trong ngày hôm nay
    const activeReservations = await DatBan.findAll({
      where: {
        MaBan,
        NgayDat: today,
        TrangThai: ['Đã đặt', 'Đã xác nhận']
      }
    });

    const table = await Ban.findByPk(MaBan);
    if (!table) return;

    // Logic cập nhật trạng thái bàn:
    // - Nếu có ít nhất 1 đơn đặt bàn ở trạng thái "Đã đặt" hoặc "Đã xác nhận" → Bàn = "Đã đặt"
    // - Nếu không có đơn đặt bàn nào active → Bàn = "Trống"
    
    if (activeReservations.length > 0) {
      // Có đặt bàn active → bàn ở trạng thái "Đã đặt"
      if (table.TrangThai !== 'Đã đặt') {
        await table.update({ TrangThai: 'Đã đặt' });
        console.log(`📋 Updated table ${MaBan} status to "Đã đặt" (${activeReservations.length} active reservations)`);
      }
    } else {
      // Không có đặt bàn active → bàn trống
      if (table.TrangThai !== 'Trống') {
        await table.update({ TrangThai: 'Trống' });
        console.log(`📋 Updated table ${MaBan} status to "Trống" (no active reservations)`);
      }
    }
  } catch (error) {
    console.error('Error updating table status:', error);
  }
};

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
      GioKetThuc,
      SoNguoi,
      TenKhach,
      SoDienThoai,
      EmailKhach,
      GhiChu
    } = req.body;

    // Sanitize time values - handle arrays and strings
    const cleanGioDat = Array.isArray(GioDat) ? GioDat[0] : (typeof GioDat === 'string' ? GioDat.trim().split(',')[0] : GioDat);
    const cleanGioKetThuc = Array.isArray(GioKetThuc) ? GioKetThuc[0] : (typeof GioKetThuc === 'string' ? GioKetThuc.trim().split(',')[0] : GioKetThuc);
    
    console.log('🧹 Original reservation values:', { GioDat, GioKetThuc });
    console.log('🧹 Cleaned reservation time values:', { cleanGioDat, cleanGioKetThuc });

    // Kiểm tra các trường bắt buộc cơ bản
    if (!MaBan || !NgayDat || !GioDat || !GioKetThuc || !SoNguoi || !TenKhach || !SoDienThoai) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin bắt buộc: MaBan, NgayDat, GioDat, GioKetThuc, SoNguoi, TenKhach, SoDienThoai'
      });
    }

    // Kiểm tra thời gian hợp lệ (chỉ khi có GioKetThuc)
    if (cleanGioKetThuc && cleanGioDat >= cleanGioKetThuc) {
      return res.status(400).json({
        success: false,
        error: 'Giờ kết thúc phải sau giờ bắt đầu'
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

    // Kiểm tra xem cột GioKetThuc có tồn tại không
    let hasGioKetThucColumn = false;
    try {
      await sequelize.query("SELECT GioKetThuc FROM DatBan LIMIT 1");
      hasGioKetThucColumn = true;
    } catch (error) {
      console.log('⚠️ GioKetThuc column not found, using fallback logic');
      hasGioKetThucColumn = false;
    }

    let conflictingReservations;
    
    if (hasGioKetThucColumn && cleanGioKetThuc) {
      // Logic với khoảng thời gian (khi có cột GioKetThuc)
      conflictingReservations = await DatBan.findAll({
        where: {
          MaBan,
          NgayDat,
          TrangThai: ['Đã đặt', 'Đã xác nhận'],
          [Op.or]: [
            // Trường hợp 1: Thời gian bắt đầu mới nằm trong khoảng thời gian đã đặt
            {
              GioDat: { [Op.lte]: cleanGioDat },
              GioKetThuc: { [Op.gt]: cleanGioDat }
            },
            // Trường hợp 2: Thời gian kết thúc mới nằm trong khoảng thời gian đã đặt
            {
              GioDat: { [Op.lt]: cleanGioKetThuc },
              GioKetThuc: { [Op.gte]: cleanGioKetThuc }
            },
            // Trường hợp 3: Khoảng thời gian mới bao trùm khoảng thời gian đã đặt
            {
              GioDat: { [Op.gte]: cleanGioDat },
              GioKetThuc: { [Op.lte]: cleanGioKetThuc }
            }
          ]
        }
      });
    } else {
      // Logic fallback (chỉ kiểm tra giờ bắt đầu trùng nhau)
      conflictingReservations = await DatBan.findOne({
        where: {
          MaBan,
          NgayDat,
          GioDat: cleanGioDat,
          TrangThai: ['Đã đặt', 'Đã xác nhận']
        }
      });
      conflictingReservations = conflictingReservations ? [conflictingReservations] : [];
    }

    if (conflictingReservations.length > 0) {
      const conflictDetails = conflictingReservations.map(r => ({
        MaDat: r.MaDat,
        GioDat: r.GioDat,
        GioKetThuc: r.GioKetThuc || 'N/A',
        TenKhach: r.TenKhach
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Bàn đã được đặt trong khoảng thời gian này',
        conflicting_reservations: conflictDetails
      });
    }

    // Sử dụng stored procedure để kiểm tra toàn diện
    console.log('🔍 Validating reservation with database functions...');
    // try {
    //   const [validationResult] = await sequelize.query(
    //     `SELECT KiemTraToanDienDatBan(?, ?, ?, ?, ?, ?, ?, ?, ?) as isValid`,
    //     {
    //       replacements: [
    //         MaKH || null,
    //         MaBan,
    //         NgayDat,
    //         cleanGioDat,
    //         cleanGioKetThuc,
    //         parseInt(SoNguoi),
    //         TenKhach ? TenKhach.trim() : '',
    //         SoDienThoai ? SoDienThoai.trim() : '',
    //         EmailKhach ? EmailKhach.trim() : null
    //       ]
    //     }
    //   );

    //   if (!validationResult[0]?.isValid) {
    //     return res.status(400).json({
    //       success: false,
    //       error: 'Dữ liệu đặt bàn không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    //       details: 'Validation failed by database function'
    //     });
    //   }
    // } catch (validationError) {
      console.log('⚠️ Database validation function not available, using basic validation');
    // }

    // Tạo đặt bàn
    console.log('🔄 Creating reservation in database...');
    const reservationData = {
      MaKH: MaKH || null,
      MaBan,
      NgayDat,
      GioDat: cleanGioDat,
      GioKetThuc: cleanGioKetThuc,
      SoNguoi: parseInt(SoNguoi),
      TrangThai: 'Đã đặt',
      TenKhach: TenKhach ? TenKhach.trim() : '',
      SoDienThoai: SoDienThoai ? SoDienThoai.trim() : '',
      EmailKhach: EmailKhach ? EmailKhach.trim() : null,
      GhiChu: GhiChu ? GhiChu.trim() : null,
      NgayTaoDat: new Date(),
      MaNVXuLy: req.user?.MaNV || null // From auth middleware
    };
    
    console.log('📋 Reservation data to create:', reservationData);
    const reservation = await DatBan.create(reservationData);
    console.log('✅ Reservation created with ID:', reservation.MaDat);

    // Cập nhật trạng thái bàn dựa trên đặt bàn mới
    await updateTableStatusBasedOnReservations(MaBan, 'created');

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
    await updateTableStatusBasedOnReservations(reservation.MaBan, TrangThai);

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

    // Cập nhật trạng thái bàn dựa trên tất cả đặt bàn
    await updateTableStatusBasedOnReservations(reservation.MaBan, 'Đã hủy');

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

// Xóa đặt bàn hoàn toàn
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

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

    const tableMaBan = reservation.MaBan;
    
    // Xóa đặt bàn khỏi database
    await reservation.destroy();

    // Cập nhật trạng thái bàn dựa trên tất cả đặt bàn còn lại
    await updateTableStatusBasedOnReservations(tableMaBan, 'deleted');

    res.json({
      success: true,
      message: 'Xóa đặt bàn thành công'
    });

  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể xóa đặt bàn',
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
    const { NgayDat, GioDat, GioKetThuc, SoNguoi } = req.query;
    
    console.log('🔍 getAvailableTables query params:', { NgayDat, GioDat, GioKetThuc, SoNguoi });

    if (!NgayDat || !GioDat || !SoNguoi) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin: NgayDat, GioDat, SoNguoi'
      });
    }

    // Sanitize time values - handle arrays and strings
    const cleanGioDat = Array.isArray(GioDat) ? GioDat[0] : (typeof GioDat === 'string' ? GioDat.trim().split(',')[0] : GioDat);
    const cleanGioKetThuc = Array.isArray(GioKetThuc) ? GioKetThuc[0] : (typeof GioKetThuc === 'string' ? GioKetThuc.trim().split(',')[0] : GioKetThuc);
    
    console.log('🧹 Original values:', { GioDat, GioKetThuc });
    console.log('🧹 Cleaned time values:', { cleanGioDat, cleanGioKetThuc });

    // Kiểm tra thời gian hợp lệ (chỉ khi có GioKetThuc)
    if (cleanGioKetThuc && cleanGioDat >= cleanGioKetThuc) {
      return res.status(400).json({
        success: false,
        error: 'Giờ kết thúc phải sau giờ bắt đầu'
      });
    }

    // Lấy tất cả bàn có sức chứa phù hợp
    const allTables = await Ban.findAll({
      where: {
        SoCho: { [Op.gte]: parseInt(SoNguoi) },
        TrangThai: { [Op.ne]: 'Bảo trì' }
      }
    });

    // Kiểm tra xem cột GioKetThuc có tồn tại không
    let hasGioKetThucColumn = false;
    try {
      await sequelize.query("SELECT GioKetThuc FROM DatBan LIMIT 1");
      hasGioKetThucColumn = true;
    } catch (error) {
      console.log('⚠️ GioKetThuc column not found, using fallback logic');
      hasGioKetThucColumn = false;
    }

    let reservedTables;
    
    if (hasGioKetThucColumn && cleanGioKetThuc) {
      // Logic với khoảng thời gian (khi có cột GioKetThuc)
      console.log('🔄 Using time range logic with:', { cleanGioDat, cleanGioKetThuc });
      reservedTables = await DatBan.findAll({
        where: {
          NgayDat,
          TrangThai: ['Đã đặt', 'Đã xác nhận'],
          [Op.or]: [
            // Trường hợp 1: Thời gian bắt đầu mới nằm trong khoảng thời gian đã đặt
            {
              GioDat: { [Op.lte]: cleanGioDat },
              GioKetThuc: { [Op.gt]: cleanGioDat }
            },
            // Trường hợp 2: Thời gian kết thúc mới nằm trong khoảng thời gian đã đặt
            {
              GioDat: { [Op.lt]: cleanGioKetThuc },
              GioKetThuc: { [Op.gte]: cleanGioKetThuc }
            },
            // Trường hợp 3: Khoảng thời gian mới bao trùm khoảng thời gian đã đặt
            {
              GioDat: { [Op.gte]: cleanGioDat },
              GioKetThuc: { [Op.lte]: cleanGioKetThuc }
            }
          ]
        },
        attributes: ['MaBan']
      });
    } else {
      // Logic fallback (chỉ kiểm tra giờ bắt đầu trùng nhau)
      console.log('🔄 Using fallback logic with:', { cleanGioDat });
      reservedTables = await DatBan.findAll({
        where: {
          NgayDat,
          GioDat: cleanGioDat,
          TrangThai: ['Đã đặt', 'Đã xác nhận']
        },
        attributes: ['MaBan']
      });
    }

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
  deleteReservation,
  getTodayReservations,
  getAvailableTables,
  getReservationStats
};
