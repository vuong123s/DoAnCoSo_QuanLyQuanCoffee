const LichLamViec = require('../models/LichLamViec');
const YeuCauNhanVien = require('../models/YeuCauNhanVien');
const { NhanVien } = require('../models/User');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Lấy thông tin nhân viên
exports.getEmployeeInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await NhanVien.findByPk(id, {
      attributes: { exclude: ['MatKhau'] }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    }
    
    res.json({ employee });
  } catch (error) {
    console.error('Get employee info error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin nhân viên' });
  }
};

// Cập nhật thông tin nhân viên
exports.updateEmployeeInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, email } = req.body;
    
    const employee = await NhanVien.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    }
    
    // Chỉ cho phép cập nhật một số trường
    await employee.update({
      SDT: phone || employee.SDT,
      Email: email || employee.Email
    });
    
    res.json({ 
      message: 'Cập nhật thông tin thành công',
      employee: await NhanVien.findByPk(id, { attributes: { exclude: ['MatKhau'] } })
    });
  } catch (error) {
    console.error('Update employee info error:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật thông tin' });
  }
};

// Lấy lịch làm việc của nhân viên
exports.getEmployeeSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    
    let whereClause = { MaNV: id };
    
    if (month && year) {
      // Parse to integers
      const monthInt = parseInt(month, 10);
      const yearInt = parseInt(year, 10);
      
      // Create Date objects for proper MySQL DATE comparison
      const startDate = new Date(yearInt, monthInt - 1, 1);
      const endDate = new Date(yearInt, monthInt, 0); // Last day of month
      
      whereClause.NgayLam = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const schedules = await LichLamViec.findAll({
      where: whereClause,
      order: [['NgayLam', 'DESC'], ['CaLam', 'ASC']]
    });
    
    res.json({ schedules });
  } catch (error) {
    console.error('Get employee schedule error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy lịch làm việc' });
  }
};

// Lấy báo cáo tháng của nhân viên
exports.getMonthlyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Thiếu tháng hoặc năm' });
    }
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as SoCa,
        COUNT(CASE WHEN TrangThai = 'Hoàn thành' THEN 1 END) as SoCaHoanThanh,
        COUNT(CASE WHEN TrangThai = 'Vắng mặt' THEN 1 END) as SoCaVang
      FROM LichLamViec
      WHERE MaNV = :maNV 
        AND MONTH(NgayLam) = :month 
        AND YEAR(NgayLam) = :year
    `, {
      replacements: { maNV: id, month, year },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ report: results[0] || {} });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy báo cáo tháng' });
  }
};

// Tạo lịch làm việc (Quản lý)
exports.createSchedule = async (req, res) => {
  try {
    const { MaNV, NgayLam, CaLam, GhiChu } = req.body;
    
    // Kiểm tra nhân viên tồn tại
    const employee = await NhanVien.findByPk(MaNV);
    if (!employee) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    }
    
    // Kiểm tra trùng lịch
    const existingSchedule = await LichLamViec.findOne({
      where: { MaNV, NgayLam, CaLam }
    });
    
    if (existingSchedule) {
      return res.status(400).json({ 
        error: `Nhân viên ${employee.HoTen} đã có lịch làm ${CaLam} vào ngày này` 
      });
    }
    
    const schedule = await LichLamViec.create({
      MaNV,
      NgayLam,
      CaLam,
      GhiChu,
      TrangThai: 'Đã xếp lịch'
    });
    
    res.status(201).json({ 
      message: 'Tạo lịch làm việc thành công',
      schedule 
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Lỗi khi tạo lịch làm việc' });
  }
};

// Lấy danh sách tất cả nhân viên (Quản lý)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await NhanVien.findAll({
      where: {
        ChucVu: {
          [Op.in]: ['Nhân viên', 'Quản lý', 'Admin']
        }
      },
      attributes: ['MaNV', 'HoTen', 'ChucVu', 'SDT', 'Email'],
      order: [['HoTen', 'ASC']]
    });
    
    // Already in Vietnamese schema
    const mappedEmployees = employees.map(emp => emp.toJSON());
    
    res.json({ employees: mappedEmployees });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách nhân viên' });
  }
};

// Lấy tất cả lịch làm việc (Quản lý)
exports.getAllSchedules = async (req, res) => {
  try {
    let { month, year, maNV } = req.query;
    
    // Handle array values (take first element if array)
    if (Array.isArray(month)) month = month[0];
    if (Array.isArray(year)) year = year[0];
    if (Array.isArray(maNV)) maNV = maNV[0];
    
    console.log('getAllSchedules called with params:', { month, year, maNV });
    
    // Build WHERE conditions for raw query
    let whereConditions = [];
    let replacements = {};
    
    if (maNV) {
      whereConditions.push('l.MaNV = :maNV');
      replacements.maNV = maNV;
    }
    
    if (month && year) {
      whereConditions.push('MONTH(l.NgayLam) = :month');
      whereConditions.push('YEAR(l.NgayLam) = :year');
      replacements.month = month;
      replacements.year = year;
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const query = `
      SELECT 
        l.*,
        nv.HoTen,
        nv.ChucVu
      FROM LichLamViec l
      INNER JOIN NhanVien nv ON l.MaNV = nv.MaNV
      ${whereClause}
      ORDER BY l.NgayLam DESC, l.CaLam ASC
    `;
    
    console.log('Executing query:', query);
    console.log('With replacements:', replacements);
    
    const schedules = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('Found schedules:', schedules.length);
    
    res.json({ schedules: schedules || [] });
  } catch (error) {
    console.error('Get all schedules error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return more specific error message
    if (error.message.includes("Table") && error.message.includes("doesn't exist")) {
      return res.status(500).json({ 
        error: 'Bảng LichLamViec chưa tồn tại. Vui lòng chạy script import-schedule-tables.sql',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Lỗi khi lấy danh sách lịch làm việc',
      details: error.message 
    });
  }
};

// Xóa lịch làm việc (Quản lý)
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await LichLamViec.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Không tìm thấy lịch làm việc' });
    }
    
    // Không cho xóa lịch đã chấm công
    if (schedule.TrangThai === 'Hoàn thành' || schedule.GioVao) {
      return res.status(400).json({ 
        error: 'Không thể xóa lịch đã chấm công',
        suggestion: 'Bạn có thể đánh dấu là "Vắng mặt" thay vì xóa'
      });
    }
    
    await schedule.destroy();
    res.json({ message: 'Xóa lịch làm việc thành công' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Lỗi khi xóa lịch làm việc' });
  }
};

// Lấy yêu cầu của nhân viên
exports.getEmployeeRequests = async (req, res) => {
  try {
    const { id } = req.params;
    
    const requests = await YeuCauNhanVien.findAll({
      where: { MaNV: id },
      order: [['NgayTao', 'DESC']]
    });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get employee requests error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu' });
  }
};

// Tạo yêu cầu (nghỉ phép/tăng ca)
exports.createRequest = async (req, res) => {
  try {
    const { MaNV, LoaiYeuCau, NgayBatDau, NgayKetThuc, LyDo } = req.body;
    
    const request = await YeuCauNhanVien.create({
      MaNV,
      LoaiYeuCau,
      NgayBatDau,
      NgayKetThuc,
      LyDo,
      TrangThai: 'Chờ duyệt'
    });
    
    res.status(201).json({ 
      message: 'Gửi yêu cầu thành công',
      request 
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Lỗi khi tạo yêu cầu' });
  }
};

// Lấy tất cả yêu cầu (Quản lý)
exports.getAllRequests = async (req, res) => {
  try {
    const { trangThai } = req.query;
    
    let whereClause = {};
    if (trangThai) {
      whereClause.TrangThai = trangThai;
    }
    
    const requests = await sequelize.query(`
      SELECT 
        yc.*,
        nv.HoTen,
        nv.ChucVu,
        nvd.HoTen as TenNguoiDuyet
      FROM YeuCauNhanVien yc
      INNER JOIN NhanVien nv ON yc.MaNV = nv.MaNV
      LEFT JOIN NhanVien nvd ON yc.NguoiDuyet = nvd.MaNV
      ${trangThai ? 'WHERE yc.TrangThai = :trangThai' : ''}
      ORDER BY yc.NgayTao DESC
    `, {
      replacements: { trangThai },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu' });
  }
};

// Duyệt yêu cầu (Quản lý)
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { NguoiDuyet, TrangThai, GhiChuDuyet } = req.body;
    
    const request = await YeuCauNhanVien.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
    }
    
    if (request.TrangThai !== 'Chờ duyệt') {
      return res.status(400).json({ error: 'Yêu cầu đã được xử lý' });
    }
    
    await request.update({
      TrangThai,
      NguoiDuyet,
      NgayDuyet: new Date(),
      GhiChuDuyet
    });
    
    res.json({ 
      message: TrangThai === 'Đã duyệt' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu',
      request 
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Lỗi khi duyệt yêu cầu' });
  }
};

// Chấm công hoàn thành ca làm
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { TrangThai, GhiChu } = req.body;
    
    const schedule = await LichLamViec.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Không tìm thấy lịch làm việc' });
    }
    
    // Validate trạng thái
    const validStatuses = ['Hoàn thành', 'Vắng mặt'];
    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({ 
        error: 'Trạng thái không hợp lệ',
        message: 'Trạng thái phải là "Hoàn thành" hoặc "Vắng mặt"'
      });
    }
    
    await schedule.update({
      TrangThai,
      GhiChu: GhiChu || schedule.GhiChu
    });
    
    res.json({ 
      message: TrangThai === 'Hoàn thành' ? 'Đã chấm công hoàn thành ca làm' : 'Đã đánh dấu vắng mặt',
      schedule 
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Lỗi khi chấm công' });
  }
};

// Chấm công hàng loạt
exports.markBulkAttendance = async (req, res) => {
  try {
    const { schedules } = req.body; // Array of { MaLich, TrangThai, GhiChu }
    
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ error: 'Danh sách lịch làm việc không hợp lệ' });
    }
    
    const results = [];
    const errors = [];
    
    for (const item of schedules) {
      try {
        const schedule = await LichLamViec.findByPk(item.MaLich);
        if (!schedule) {
          errors.push({ MaLich: item.MaLich, error: 'Không tìm thấy' });
          continue;
        }
        
        await schedule.update({
          TrangThai: item.TrangThai,
          GhiChu: item.GhiChu || schedule.GhiChu
        });
        
        results.push({ MaLich: item.MaLich, success: true });
      } catch (err) {
        errors.push({ MaLich: item.MaLich, error: err.message });
      }
    }
    
    res.json({ 
      message: `Đã chấm công ${results.length}/${schedules.length} ca làm`,
      results,
      errors
    });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ error: 'Lỗi khi chấm công hàng loạt' });
  }
};
