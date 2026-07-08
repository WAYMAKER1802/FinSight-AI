const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  console.log('Starting MongoMemoryServer...');
  try {
    const mongoServer = await MongoMemoryServer.create();
    console.log('✅ Mongo URI:', mongoServer.getUri());
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
