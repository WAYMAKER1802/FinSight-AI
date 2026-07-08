/**
 * Global Jest Setup & Teardown
 */
'use strict';

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' }); 

beforeAll(async () => {
  const uri = process.env.TEST_DB_URI || 'mongodb://localhost:27017/finsight_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
});
