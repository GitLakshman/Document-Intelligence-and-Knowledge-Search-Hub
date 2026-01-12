/**
 * Auth Controller Unit Tests
 */

const { register, login, getProfile } = require('../../../controllers/authController');
const User = require('../../../models/User');

// Mock request/response helpers
const mockRequest = (body = {}, user = null) => ({
    body,
    user
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('Auth Controller', () => {
    describe('register', () => {
        it('should register a new user successfully', async () => {
            const req = mockRequest({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
            const res = mockResponse();

            await register(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
            
            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('_id');
            expect(response).toHaveProperty('name', 'Test User');
            expect(response).toHaveProperty('email', 'test@example.com');
            expect(response).toHaveProperty('token');
            expect(response).not.toHaveProperty('password');
        });

        it('should throw error if user already exists', async () => {
            // Create user first
            await User.create({
                name: 'Existing User',
                email: 'existing@example.com',
                password: 'password123'
            });

            const req = mockRequest({
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123'
            });
            const res = mockResponse();

            await expect(register(req, res, mockNext)).rejects.toThrow(
                'User already exists with this email'
            );
        });
    });

    describe('login', () => {
        beforeEach(async () => {
            await User.create({
                name: 'Login Test User',
                email: 'login@example.com',
                password: 'password123'
            });
        });

        it('should login successfully with correct credentials', async () => {
            const req = mockRequest({
                email: 'login@example.com',
                password: 'password123'
            });
            const res = mockResponse();

            await login(req, res, mockNext);

            expect(res.json).toHaveBeenCalled();
            
            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('_id');
            expect(response).toHaveProperty('email', 'login@example.com');
            expect(response).toHaveProperty('token');
        });

        it('should throw error with invalid email', async () => {
            const req = mockRequest({
                email: 'invalid@example.com',
                password: 'password123'
            });
            const res = mockResponse();

            await expect(login(req, res, mockNext)).rejects.toThrow(
                'Invalid email or password'
            );
        });

        it('should throw error with invalid password', async () => {
            const req = mockRequest({
                email: 'login@example.com',
                password: 'wrongpassword'
            });
            const res = mockResponse();

            await expect(login(req, res, mockNext)).rejects.toThrow(
                'Invalid email or password'
            );
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const user = await User.create({
                name: 'Profile User',
                email: 'profile@example.com',
                password: 'password123'
            });

            const req = mockRequest({}, { _id: user._id });
            const res = mockResponse();

            await getProfile(req, res, mockNext);

            expect(res.json).toHaveBeenCalled();
            
            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('name', 'Profile User');
            expect(response).toHaveProperty('email', 'profile@example.com');
            expect(response).not.toHaveProperty('password');
        });
    });
});
