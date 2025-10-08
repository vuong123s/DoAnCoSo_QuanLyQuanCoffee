const { Mon, LoaiMon } = require('../models');
const { Op } = require('sequelize');

// Get all menu items with optional filters (Vietnamese schema)
const getMenuItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      is_available,
      search,
      sort_by = 'name',
      sort_order = 'ASC'
    } = req.query;

    // Parse query parameters to integers
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

    console.log(`📊 Menu query params: page=${parsedPage}, limit=${parsedLimit}, offset=${offset}`);
    const whereClause = {};

    // Filters mapping to Vietnamese fields
    if (category_id) whereClause.MaLoai = category_id;
    if (is_available !== undefined) whereClause.TrangThai = is_available === 'true' ? 'Còn bán' : 'Hết hàng';
    if (search) {
      whereClause[Op.or] = [
        { TenMon: { [Op.like]: `%${search}%` } },
        { MoTa: { [Op.like]: `%${search}%` } }
      ];
    }

    // Sorting mapping
    const sortFieldMap = {
      name: 'TenMon',
      price: 'DonGia',
      sort_order: 'MaMon',
      created_at: 'MaMon'
    };
    const mappedSortField = sortFieldMap[sort_by] || 'TenMon';
    const sortDirection = String(sort_order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows } = await Mon.findAndCountAll({
      where: whereClause,
      include: [{
        model: LoaiMon,
        as: 'loaimon',
        attributes: ['MaLoai', 'TenLoai']
      }],
      order: [[mappedSortField, sortDirection]],
      limit: parsedLimit,
      offset: offset
    });

    res.json({
      menu_items: rows,
      pagination: {
        current_page: parsedPage,
        total_pages: Math.ceil(count / parsedLimit),
        total_items: count,
        items_per_page: parsedLimit
      }
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
};

// Get menu item by ID (Vietnamese schema)
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid menu item ID',
        message: 'ID must be a valid number'
      });
    }

    const menuItem = await Mon.findByPk(parseInt(id), {
      include: [{
        model: LoaiMon,
        as: 'loaimon',
        attributes: ['MaLoai', 'TenLoai']
      }]
    });

    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    res.json({ menu_item: menuItem });

  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      error: 'Failed to fetch menu item',
      message: error.message
    });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const {
      // Vietnamese schema fields
      TenMon,
      MoTa,
      DonGia,
      HinhAnh,
      MaLoai,
      TrangThai = 'Có sẵn',
      // English fields for backward compatibility
      category_id,
      name,
      description,
      price,
      image_url,
      is_available = true
    } = req.body;

    console.log('Create menu item data:', req.body);

    // Use Vietnamese fields first, fallback to English
    const tenMon = TenMon || name;
    const donGia = DonGia || price;
    const maLoai = MaLoai || category_id;

    if (!maLoai || !tenMon || !donGia) {
      return res.status(400).json({
        error: 'Missing required fields: MaLoai/category_id, TenMon/name, and DonGia/price'
      });
    }

    // Check if category exists
    const category = await Category.findByPk(maLoai);
    if (!category) {
      return res.status(400).json({
        error: 'Category not found'
      });
    }

    // Validate and parse JSON fields
    let parsedIngredients = null;
    let parsedSizeOptions = null;

    if (ingredients) {
      try {
        parsedIngredients = typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid ingredients format'
        });
      }
    }

    if (size_options) {
      try {
        parsedSizeOptions = typeof size_options === 'string' ? size_options : JSON.stringify(size_options);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid size options format'
        });
      }
    }

    const menuItem = await Mon.create({
      TenMon: tenMon,
      MoTa: MoTa || description,
      DonGia: parseFloat(donGia),
      HinhAnh: HinhAnh || image_url,
      MaLoai: maLoai,
      TrangThai: TrangThai || (is_available ? 'Có sẵn' : 'Hết hàng')
    });

    const createdMenuItem = await Mon.findByPk(menuItem.MaMon);

    res.status(201).json({
      message: 'Menu item created successfully',
      menu_item: createdMenuItem
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      error: 'Failed to create menu item',
      message: error.message
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid menu item ID',
        message: 'ID must be a valid number'
      });
    }

    console.log('Update menu item:', id, updateData);

    const menuItem = await Mon.findByPk(parseInt(id));
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    // If MaLoai is being updated, check if it exists
    if (updateData.MaLoai) {
      const category = await LoaiMon.findByPk(updateData.MaLoai);
      if (!category) {
        return res.status(400).json({
          error: 'Category not found'
        });
      }
    }

    // Handle JSON fields
    if (updateData.ingredients && typeof updateData.ingredients !== 'string') {
      updateData.ingredients = JSON.stringify(updateData.ingredients);
    }

    if (updateData.size_options && typeof updateData.size_options !== 'string') {
      updateData.size_options = JSON.stringify(updateData.size_options);
    }

    await menuItem.update(updateData);

    const updatedMenuItem = await Mon.findByPk(id);

    res.json({
      message: 'Menu item updated successfully',
      menu_item: updatedMenuItem
    });

  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      error: 'Failed to update menu item',
      message: error.message
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    console.log('🗑️ DELETE request for menu item ID:', req.params.id);
    const { id } = req.params;
    const { force = false } = req.query; // Allow force delete option

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid menu item ID',
        message: 'ID must be a valid number'
      });
    }

    const menuItem = await Mon.findByPk(parseInt(id));
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    // Check if menu item is referenced in orders
    const { sequelize } = require('../config/database');
    
    // Check for references in various order tables
    const references = await Promise.all([
      // Check CTDonHangOnline (online order details)
      sequelize.query(
        'SELECT COUNT(*) as count FROM CTDonHangOnline WHERE MaMon = ?',
        { replacements: [id], type: sequelize.QueryTypes.SELECT }
      ),
      // Check CTDonHang (regular order details)
      sequelize.query(
        'SELECT COUNT(*) as count FROM CTDonHang WHERE MaMon = ?',
        { replacements: [id], type: sequelize.QueryTypes.SELECT }
      ),
      // Check CTOrder (order details)
      sequelize.query(
        'SELECT COUNT(*) as count FROM CTOrder WHERE MaMon = ?',
        { replacements: [id], type: sequelize.QueryTypes.SELECT }
      ),
      // Check GioHang (shopping cart)
      sequelize.query(
        'SELECT COUNT(*) as count FROM GioHang WHERE MaMon = ?',
        { replacements: [id], type: sequelize.QueryTypes.SELECT }
      )
    ]);

    const totalReferences = references.reduce((sum, result) => sum + (result[0]?.count || 0), 0);

    if (totalReferences > 0 && !force) {
      return res.status(400).json({
        error: 'Cannot delete menu item',
        message: `Món ăn này đã được sử dụng trong ${totalReferences} đơn hàng. Không thể xóa để đảm bảo tính toàn vẹn dữ liệu.`,
        suggestion: 'Bạn có thể đánh dấu món ăn là "Hết hàng" thay vì xóa, hoặc liên hệ quản trị viên để xử lý.',
        references: totalReferences,
        canSoftDelete: true
      });
    }

    // If force delete is requested, we still can't delete due to foreign key constraints
    if (force && totalReferences > 0) {
      return res.status(400).json({
        error: 'Cannot force delete menu item',
        message: 'Không thể xóa món ăn này vì ràng buộc khóa ngoại trong cơ sở dữ liệu. Vui lòng đánh dấu là "Hết hàng" thay thế.',
        suggestion: 'Sử dụng chức năng "Đánh dấu hết hàng" để ẩn món ăn khỏi menu.'
      });
    }

    // If no references, proceed with deletion
    await menuItem.destroy();

    res.json({
      message: 'Menu item deleted successfully',
      deleted_item: {
        MaMon: menuItem.MaMon,
        TenMon: menuItem.TenMon
      }
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    
    // Handle specific foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Cannot delete menu item',
        message: 'Món ăn này đang được sử dụng trong hệ thống và không thể xóa.',
        suggestion: 'Vui lòng đánh dấu món ăn là "Hết hàng" thay vì xóa để đảm bảo tính toàn vẹn dữ liệu.',
        canSoftDelete: true,
        technical_details: error.original?.sqlMessage || error.message
      });
    }

    res.status(500).json({
      error: 'Failed to delete menu item',
      message: error.message
    });
  }
};

// Toggle menu item availability
const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    await menuItem.update({
      is_available: !menuItem.is_available
    });

    const updatedMenuItem = await MenuItem.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      }]
    });

    res.json({
      message: `Menu item ${updatedMenuItem.is_available ? 'enabled' : 'disabled'} successfully`,
      menu_item: updatedMenuItem
    });

  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    res.status(500).json({
      error: 'Failed to toggle menu item availability',
      message: error.message
    });
  }
};

// Get featured menu items
const getFeaturedItems = async (req, res) => {
  try {
    // In Vietnamese schema, there's no explicit "featured" flag.
    // We will return items that are currently available (TrangThai = 'Còn bán')
    // and limit to top 8 as featured items.
    const featuredItems = await Mon.findAll({
      where: {
        TrangThai: 'Còn bán'
      },
      include: [{
        model: LoaiMon,
        as: 'loaimon',
        attributes: ['MaLoai', 'TenLoai']
      }],
      order: [['MaMon', 'ASC']],
      limit: 8
    });

    res.json({
      featured_items: featuredItems
    });

  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({
      error: 'Failed to fetch featured items',
      message: error.message
    });
  }
};

// Soft delete menu item (mark as unavailable)
const softDeleteMenuItem = async (req, res) => {
  try {
    console.log('🔄 SOFT DELETE request for menu item ID:', req.params.id);
    const { id } = req.params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid menu item ID',
        message: 'ID must be a valid number'
      });
    }

    const menuItem = await Mon.findByPk(parseInt(id));
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    // Mark as unavailable instead of deleting
    await menuItem.update({
      TrangThai: 'Hết hàng'
    });

    const updatedMenuItem = await Mon.findByPk(id, {
      include: [{
        model: LoaiMon,
        as: 'loaimon',
        attributes: ['MaLoai', 'TenLoai', 'MoTa']
      }]
    });

    res.json({
      message: 'Menu item marked as unavailable successfully',
      menu_item: updatedMenuItem,
      action: 'soft_delete'
    });

  } catch (error) {
    console.error('Error soft deleting menu item:', error);
    res.status(500).json({
      error: 'Failed to mark menu item as unavailable',
      message: error.message
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  softDeleteMenuItem,
  toggleAvailability,
  getFeaturedItems
};
