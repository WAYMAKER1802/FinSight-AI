const { sequelize } = require('./config/database');

async function fixKeys() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    // Get all indexes for Users table
    const [results] = await sequelize.query(`SHOW INDEX FROM Users`);
    
    // Group by index name
    const indexNames = new Set();
    for (const row of results) {
      if (row.Key_name !== 'PRIMARY') {
        indexNames.add(row.Key_name);
      }
    }
    
    console.log(`Found ${indexNames.size} non-primary indexes.`);
    
    for (const indexName of indexNames) {
      console.log(`Dropping index ${indexName}...`);
      await sequelize.query(`ALTER TABLE Users DROP INDEX \`${indexName}\``);
    }
    
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixKeys();
