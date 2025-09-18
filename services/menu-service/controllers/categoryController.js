const { LoaiMon, Mon } = require('../models');
const { Op } = require('sequelize');

// Get all categories with optional filters (Vietnamese schema)
const getCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      is_active,
      include_items = false,
      search 
    } = req.query;

    // Parse query parameters to integers
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const offset = (parsedPage - 1) * parsedLimit;

    console.log(`📊 Categories query params: page=${parsedPage}, limit=${parsedLimit}, offset=${offset}`);
    const whereClause = {};

    // Apply filters (map to Vietnamese fields)
    // Note: LoaiMon doesn't have is_active field in Vietnamese schema, skip this filter
    
    if (search) {
      whereClause[Op.or] = [
        { TenLoai: { [Op.like]: `%${search}%` } }
      ];
    }

    // Include menu items if requested
    let includeOptions = [];
    if (include_items === 'true') {
      includeOptions.push({
        model: Mon,
        as: 'mons',
        attributes: ['MaMon', 'TenMon', 'DonGia', 'HinhAnh', 'TrangThai']
      });
    }

    const { count, rows } = await LoaiMon.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['TenLoai', 'ASC']],
      limit: parsedLimit,
      offset: offset
    });

    res.json({
      categories: rows,
      pagination: {
        current_page: parsedPage,
        total_pages: Math.ceil(count / parsedLimit),
        total_items: count,
        items_per_page: parsedLimit
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
};

// Get category by ID (Vietnamese schema)
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include_items = false } = req.query;

    const includeOptions = [];
    if (include_items === 'true') {
      includeOptions.push({
        model: Mon,
        as: 'mons',
        attributes: ['MaMon', 'TenMon', 'DonGia', 'HinhAnh', 'TrangThai'],
        order: [['TenMon', 'ASC']]
      });
    }

    const category = await LoaiMon.findByPk(id, {
      include: includeOptions
    });

    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    res.json({ category });

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      error: 'Failed to fetch category',
      message: error.message
    });
  }
};

// Create new category (Vietnamese schema)
const createCategory = async (req, res) => {
  try {
    const {
      TenLoai,
      name // fallback for English API compatibility
    } = req.body;

    const categoryName = TenLoai || name;

    if (!categoryName) {
      return res.status(400).json({
        error: 'Category name (TenLoai) is required'
      });
    }

    // Check if category name already exists
    const existingCategory = await LoaiMon.findOne({
      where: { TenLoai: categoryName.trim() }
    });

    if (existingCategory) {
      return res.status(400).json({
        error: 'Category name already exists'
      });
    }

    const category = await LoaiMon.create({
      TenLoai: categoryName.trim()
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      error: 'Failed to create category',
      message: error.message
    });
  }
};

// Update category (Vietnamese schema)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { TenLoai, name } = req.body;
    
    const categoryName = TenLoai || name;

    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // If name is being updated, check for duplicates
    if (categoryName && categoryName.trim() !== category.TenLoai) {
      const existingCategory = await LoaiMon.findOne({
        where: { 
          TenLoai: categoryName.trim(),
          MaLoai: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          error: 'Category name already exists'
        });
      }
    }

    const updateData = {};
    if (categoryName) updateData.TenLoai = categoryName.trim();

    await category.update(updateData);

    res.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      error: 'Failed to update category',
      message: error.message
    });
  }
};

// Delete category (Vietnamese schema)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Check if category has menu items
    const menuItemsCount = await Mon.count({
      where: { MaLoai: id }
    });

    if (menuItemsCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with existing menu items',
        menu_items_count: menuItemsCount
      });
    }

    await category.destroy();

    res.json({
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      error: 'Failed to delete category',
      message: error.message
    });
  }
};

// Toggle category status (Vietnamese schema - simplified, no status field)
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Vietnamese schema doesn't have is_active field for categories
    // This function is kept for API compatibility but doesn't do anything
    res.json({
      message: 'Category status toggle not supported in Vietnamese schema',
      category
    });

  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      error: 'Failed to toggle category status',
      message: error.message
    });
  }
};

// Get menu items by category (Vietnamese schema)
const getMenuItemsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      is_available,
      sort_by = 'name',
      sort_order = 'ASC'
    } = req.query;

    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Parse query parameters to integers
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const offset = (parsedPage - 1) * parsedLimit;
    
    const whereClause = { MaLoai: id };

    if (is_available !== undefined) {
      whereClause.TrangThai = is_available === 'true' ? 'Còn bán' : 'Hết hàng';
    }

    // Sorting mapping
    const sortFieldMap = {
      name: 'TenMon',
      price: 'DonGia'
    };
    const mappedSortField = sortFieldMap[sort_by] || 'TenMon';
    const sortDirection = String(sort_order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows } = await Mon.findAndCountAll({
      where: whereClause,
      order: [[mappedSortField, sortDirection]],
      limit: parsedLimit,
      offset: offset
    });

    res.json({
      category: {
        MaLoai: category.MaLoai,
        TenLoai: category.TenLoai
      },
      menu_items: rows,
      pagination: {
        current_page: parsedPage,
        total_pages: Math.ceil(count / parsedLimit),
        total_items: count,
        items_per_page: parsedLimit
      }
    });

  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({
      error: 'Failed to fetch menu items by category',
      message: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getMenuItemsByCategory
};
