const { sequelize } = require('./config/database');
const { Ban } = require('./models');


const seedTables = async () => {
  try {
    console.log('🌱 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully.');

    console.log('🌱 Seeding tables...');
    
    // Check if tables already exist
    const existingTables = await Ban.count();
    if (existingTables > 0) {
      console.log(`⚠️  Found ${existingTables} existing tables. Skipping seed.`);
      return;
    }

    // Create sample tables
    await Ban.bulkCreate(sampleTables);
    console.log(`✅ Successfully created ${sampleTables.length} sample tables.`);

    // Display created tables
    const createdTables = await Ban.findAll();
    console.log('\n📋 Created tables:');
    createdTables.forEach(table => {
      console.log(`   - ${table.TenBan} (${table.SoCho} chỗ) - ${table.TrangThai}`);
    });

  } catch (error) {
    console.error('❌ Error seeding tables:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTables();
}

module.exports = seedTables;
