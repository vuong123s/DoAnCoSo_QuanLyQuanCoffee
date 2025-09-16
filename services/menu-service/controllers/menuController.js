const { MenuItem, Category } = require('../models');
const { Op } = require('sequelize');

// Get all menu items with optional filters
const getMenuItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category_id, 
      is_available,
      is_featured,
      search,
      sort_by = 'sort_order',
      sort_order = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (category_id) whereClause.category_id = category_id;
    if (is_available !== undefined) whereClause.is_available = is_available === 'true';
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const validSortFields = ['name', 'price', 'sort_order', 'created_at'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'sort_order';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows } = await MenuItem.findAndCountAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      }],
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      menu_items: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
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

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
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
    const featuredItems = await MenuItem.findAll({
      where: {
        is_featured: true,
        is_available: true
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      }],
      order: [['sort_order', 'ASC']]
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
