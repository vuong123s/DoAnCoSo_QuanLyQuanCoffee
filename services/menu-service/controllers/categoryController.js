const { Category, MenuItem } = require('../models');
const { Op } = require('sequelize');

// Get all categories with optional filters
const getCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      is_active,
      include_items = false,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const includeOptions = [];
    if (include_items === 'true') {
      includeOptions.push({
        model: MenuItem,
        as: 'menu_items',
        where: { is_available: true },
        required: false,
        attributes: ['id', 'name', 'price', 'image_url', 'is_featured']
      });
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      categories: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
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

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include_items = false } = req.query;

    const includeOptions = [];
    if (include_items === 'true') {
      includeOptions.push({
        model: MenuItem,
        as: 'menu_items',
        order: [['sort_order', 'ASC']]
      });
    }

    const category = await Category.findByPk(id, {
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

// Create new category
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image_url,
      is_active = true,
      sort_order = 0
    } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Category name is required'
      });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return res.status(400).json({
        error: 'Category name already exists'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      image_url,
      is_active,
      sort_order: parseInt(sort_order)
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

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        where: { 
          name: updateData.name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          error: 'Category name already exists'
        });
      }

      updateData.name = updateData.name.trim();
    }

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

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Check if category has menu items
    const menuItemsCount = await MenuItem.count({
      where: { category_id: id }
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

// Toggle category status
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    await category.update({
      is_active: !category.is_active
    });

    // If deactivating category, also deactivate all menu items in this category
    if (!category.is_active) {
      await MenuItem.update(
        { is_available: false },
        { where: { category_id: id } }
      );
    }

    res.json({
      message: `Category ${category.is_active ? 'activated' : 'deactivated'} successfully`,
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

// Get menu items by category
const getMenuItemsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      is_available,
      sort_by = 'sort_order',
      sort_order = 'ASC'
    } = req.query;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    const offset = (page - 1) * limit;
    const whereClause = { category_id: id };

    if (is_available !== undefined) {
      whereClause.is_available = is_available === 'true';
    }

    const validSortFields = ['name', 'price', 'sort_order', 'created_at'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'sort_order';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows } = await MenuItem.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description
      },
      menu_items: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
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
