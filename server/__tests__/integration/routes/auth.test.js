/**
 * Auth Router Integration Tests
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../../routes/auth');
const { errorHandler } = require('../../../middleware/errorHandler');

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
    return app;
};

describe('Auth Routes Integration', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Integration Test User',
                    email: 'integration@test.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe('integration@test.com');
        });

        it('should return 400 for missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com'
                    // Missing name and password
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing');
        });

        it('should return 400 for duplicate email', async () => {
            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'First User',
                    email: 'duplicate@test.com',
                    password: 'password123'
                });

            // Try to register with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Second User',
                    email: 'duplicate@test.com',
                    password: 'password456'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create test user for login tests
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login User',
                    email: 'logintest@test.com',
                    password: 'password123'
                });
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'logintest@test.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe('logintest@test.com');
        });

        it('should return 401 for invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'logintest@test.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('Invalid');
        });

        it('should return 401 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        let token;

        beforeEach(async () => {
            // Register and get token
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Profile User',
                    email: 'profile@test.com',
                    password: 'password123'
                });
            token = res.body.token;
        });

        it('should return user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('profile@test.com');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
        });
    });
});
