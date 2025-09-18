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

    const menuItem = await Mon.findByPk(id, {
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
      category_id,
      name,
      description,
      price,
      image_url,
      is_available = true,
      is_featured = false,
      preparation_time,
      ingredients,
      allergens,
      calories,
      spice_level = 'none',
      size_options,
      sort_order = 0
    } = req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({
        error: 'Missing required fields: category_id, name, and price'
      });
    }

    // Check if category exists
    const category = await Category.findByPk(category_id);
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
          error: 'Invalid size_options format'
        });
      }
    }

    const menuItem = await MenuItem.create({
      category_id,
      name,
      description,
      price: parseFloat(price),
      image_url,
      is_available,
      is_featured,
      preparation_time: preparation_time ? parseInt(preparation_time) : null,
      ingredients: parsedIngredients,
      allergens,
      calories: calories ? parseInt(calories) : null,
      spice_level,
      size_options: parsedSizeOptions,
      sort_order: parseInt(sort_order)
    });

    const createdMenuItem = await MenuItem.findByPk(menuItem.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      }]
    });

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

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    // If category_id is being updated, check if it exists
    if (updateData.category_id) {
      const category = await Category.findByPk(updateData.category_id);
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

    const updatedMenuItem = await MenuItem.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      }]
    });

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
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found'
      });
    }

    await menuItem.destroy();

    res.json({
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
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

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getFeaturedItems
};
