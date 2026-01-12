/**
 * Validation Middleware Unit Tests
 */

const {
    validateRequired,
    validateQuestion,
    validateObjectId,
    validatePagination
} = require('../../../middleware/validate');

const mockRequest = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Validation Middleware', () => {
    describe('validateRequired', () => {
        it('should call next if all required fields are present', () => {
            const middleware = validateRequired(['name', 'email']);
            const req = mockRequest({ name: 'Test', email: 'test@test.com' });
            const res = mockResponse();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with error if fields are missing', () => {
            const middleware = validateRequired(['name', 'email', 'password']);
            const req = mockRequest({ name: 'Test' });
            const res = mockResponse();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('email');
            expect(error.message).toContain('password');
        });
    });

    describe('validateQuestion', () => {
        it('should call next with valid question', () => {
            const req = mockRequest({ question: 'What is the document about?' });
            const res = mockResponse();
            const next = jest.fn();

            validateQuestion(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(req.body.question).toBe('What is the document about?');
        });

        it('should trim question whitespace', () => {
            const req = mockRequest({ question: '   What is this?   ' });
            const res = mockResponse();
            const next = jest.fn();

            validateQuestion(req, res, next);

            expect(req.body.question).toBe('What is this?');
        });

        it('should reject empty question', () => {
            const req = mockRequest({ question: '' });
            const res = mockResponse();
            const next = jest.fn();

            validateQuestion(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('question');
        });

        it('should reject short question', () => {
            const req = mockRequest({ question: 'Hi' });
            const res = mockResponse();
            const next = jest.fn();

            validateQuestion(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('short');
        });
    });

    describe('validateObjectId', () => {
        it('should call next with valid ObjectId', () => {
            const middleware = validateObjectId('id');
            const req = mockRequest({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockResponse();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should reject invalid ObjectId', () => {
            const middleware = validateObjectId('id');
            const req = mockRequest({}, { id: 'invalid-id' });
            const res = mockResponse();
            const next = jest.fn();

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            const error = next.mock.calls[0][0];
            expect(error.message).toContain('Invalid ID');
        });
    });

    describe('validatePagination', () => {
        it('should set default pagination values', () => {
            const req = mockRequest({}, {}, {});
            const res = mockResponse();
            const next = jest.fn();

            validatePagination(req, res, next);

            expect(req.pagination).toEqual({
                page: 1,
                limit: 10,
                skip: 0
            });
            expect(next).toHaveBeenCalledWith();
        });

        it('should use provided pagination values', () => {
            const req = mockRequest({}, {}, { page: '3', limit: '20' });
            const res = mockResponse();
            const next = jest.fn();

            validatePagination(req, res, next);

            expect(req.pagination).toEqual({
                page: 3,
                limit: 20,
                skip: 40
            });
        });

        it('should cap limit at 100', () => {
            const req = mockRequest({}, {}, { page: '1', limit: '500' });
            const res = mockResponse();
            const next = jest.fn();

            validatePagination(req, res, next);

            expect(req.pagination.limit).toBe(100);
        });
    });
});
