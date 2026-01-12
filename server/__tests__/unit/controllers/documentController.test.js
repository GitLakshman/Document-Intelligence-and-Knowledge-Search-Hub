/**
 * Document Controller Unit Tests
 */

const mongoose = require('mongoose');
const Document = require('../../../models/Document');
const User = require('../../../models/User');
const {
    getDocuments,
    getDocument,
    deleteDocument,
    getDocumentStatus
} = require('../../../controllers/documentController');

// Mock documentProcessor
jest.mock('../../../services/documentProcessor', () => ({
    deleteFile: jest.fn().mockResolvedValue(undefined)
}));

const mockRequest = (params = {}, query = {}, body = {}, user = null, pagination = null) => ({
    params,
    query,
    body,
    user,
    pagination
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Document Controller', () => {
    let testUser;
    let testDocument;

    beforeEach(async () => {
        testUser = await User.create({
            name: 'Doc Test User',
            email: 'doctest@example.com',
            password: 'password123'
        });

        testDocument = await Document.create({
            user: testUser._id,
            filename: 'test-file.pdf',
            originalName: 'Test Document.pdf',
            mimeType: 'application/pdf',
            size: 1024,
            content: 'This is test content from the document.',
            status: 'ready'
        });
    });

    describe('getDocuments', () => {
        it('should return paginated documents for user', async () => {
            const req = mockRequest(
                {},
                {},
                {},
                testUser,
                { page: 1, limit: 10, skip: 0 }
            );
            const res = mockResponse();

            await getDocuments(req, res);

            expect(res.json).toHaveBeenCalled();
            
            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('documents');
            expect(response).toHaveProperty('currentPage', 1);
            expect(response).toHaveProperty('totalDocuments', 1);
            expect(response.documents).toHaveLength(1);
            expect(response.documents[0].originalName).toBe('Test Document.pdf');
        });

        it('should not include document content in list', async () => {
            const req = mockRequest(
                {},
                {},
                {},
                testUser,
                { page: 1, limit: 10, skip: 0 }
            );
            const res = mockResponse();

            await getDocuments(req, res);

            const response = res.json.mock.calls[0][0];
            // Content should be excluded (undefined) when using .select('-content')
            expect(response.documents[0].content).toBeUndefined();
        });
    });

    describe('getDocument', () => {
        it('should return document by ID', async () => {
            const req = mockRequest(
                { id: testDocument._id.toString() },
                {},
                {},
                testUser
            );
            const res = mockResponse();

            await getDocument(req, res);

            expect(res.json).toHaveBeenCalled();
            
            const response = res.json.mock.calls[0][0];
            expect(response.originalName).toBe('Test Document.pdf');
            expect(response.content).toBe('This is test content from the document.');
        });

        it('should throw error for non-existent document', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const req = mockRequest(
                { id: fakeId.toString() },
                {},
                {},
                testUser
            );
            const res = mockResponse();

            await expect(getDocument(req, res)).rejects.toThrow('Document not found');
        });

        it('should not return documents from other users', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const req = mockRequest(
                { id: testDocument._id.toString() },
                {},
                {},
                otherUser
            );
            const res = mockResponse();

            await expect(getDocument(req, res)).rejects.toThrow('Document not found');
        });
    });

    describe('deleteDocument', () => {
        it('should delete document successfully', async () => {
            const req = mockRequest(
                { id: testDocument._id.toString() },
                {},
                {},
                testUser
            );
            const res = mockResponse();

            await deleteDocument(req, res);

            expect(res.json).toHaveBeenCalledWith({ message: 'Document deleted successfully' });

            // Verify document is deleted
            const deleted = await Document.findById(testDocument._id);
            expect(deleted).toBeNull();
        });
    });

    describe('getDocumentStatus', () => {
        it('should return document status', async () => {
            const req = mockRequest(
                { id: testDocument._id.toString() },
                {},
                {},
                testUser
            );
            const res = mockResponse();

            await getDocumentStatus(req, res);

            expect(res.json).toHaveBeenCalled();
            
            const response = res.json.mock.calls[0][0];
            expect(response.status).toBe('ready');
            expect(response.originalName).toBe('Test Document.pdf');
        });
    });
});
