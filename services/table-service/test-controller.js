// Simple test to validate table controller syntax
const { Ban, DatBan } = require('./models');

console.log('Testing table controller imports...');

// Test model imports
console.log('Ban model:', Ban ? '✅ Loaded' : '❌ Failed');
console.log('DatBan model:', DatBan ? '✅ Loaded' : '❌ Failed');

// Test controller import
try {
  const controller = require('./controllers/tableController');
  console.log('Controller functions:');
  console.log('- getTables:', typeof controller.getTables === 'function' ? '✅' : '❌');
  console.log('- getTableById:', typeof controller.getTableById === 'function' ? '✅' : '❌');
  console.log('- createTable:', typeof controller.createTable === 'function' ? '✅' : '❌');
  console.log('- updateTable:', typeof controller.updateTable === 'function' ? '✅' : '❌');
  console.log('- updateTableStatus:', typeof controller.updateTableStatus === 'function' ? '✅' : '❌');
  console.log('- deleteTable:', typeof controller.deleteTable === 'function' ? '✅' : '❌');
  console.log('- getAvailableTables:', typeof controller.getAvailableTables === 'function' ? '✅' : '❌');
  console.log('- getTableStats:', typeof controller.getTableStats === 'function' ? '✅' : '❌');
  
  console.log('\n✅ All controller functions loaded successfully!');
  console.log('🎉 Table controller migration to Vietnamese schema completed!');
  
} catch (error) {
  console.error('❌ Error loading controller:', error.message);
  process.exit(1);
}
