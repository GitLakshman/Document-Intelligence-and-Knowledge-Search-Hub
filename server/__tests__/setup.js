/**
 * Jest Test Setup
 * Configures the test environment with in-memory MongoDB
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Increase timeout for slow operations
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
    // Create in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Cleanup after all tests
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Set environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.NODE_ENV = 'test';
