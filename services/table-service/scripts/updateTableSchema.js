const { sequelize } = require('../config/database');

async function updateTableSchema() {
  try {
    console.log('Updating table schema to add KhuVuc and ViTri columns...');
    
    // Add KhuVuc column
    await sequelize.query(`
      ALTER TABLE Ban 
      ADD COLUMN IF NOT EXISTS KhuVuc VARCHAR(50) DEFAULT 'Tầng 1' 
      COMMENT 'Khu vực của bàn: Tầng 1, Tầng 2, Sân thượng, VIP, etc.'
    `);
    
    // Add ViTri column
    await sequelize.query(`
      ALTER TABLE Ban 
      ADD COLUMN IF NOT EXISTS ViTri VARCHAR(100) 
      COMMENT 'Vị trí cụ thể của bàn trong khu vực'
    `);
    
    // Update existing tables with default area values
    await sequelize.query(`
      UPDATE Ban 
      SET KhuVuc = 'Tầng 1' 
      WHERE KhuVuc IS NULL OR KhuVuc = ''
    `);
    
    console.log('Schema updated successfully!');
    
    // Show current table structure
    const [results] = await sequelize.query('DESCRIBE Ban');
    console.log('\nCurrent table structure:');
    console.table(results);
    
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateTableSchema();
