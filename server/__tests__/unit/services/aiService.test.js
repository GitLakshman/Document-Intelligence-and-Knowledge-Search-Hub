/**
 * AI Service Unit Tests
 */

const aiService = require('../../../services/aiService');

describe('AI Service', () => {
    describe('generateCacheKey', () => {
        it('should create consistent cache key', () => {
            const key1 = aiService.generateCacheKey('What is this?', ['id1', 'id2']);
            const key2 = aiService.generateCacheKey('What is this?', ['id1', 'id2']);
            
            expect(key1).toBe(key2);
        });

        it('should normalize question case', () => {
            const key1 = aiService.generateCacheKey('What Is This?', ['id1']);
            const key2 = aiService.generateCacheKey('what is this?', ['id1']);
            
            expect(key1).toBe(key2);
        });

        it('should normalize whitespace', () => {
            const key1 = aiService.generateCacheKey('What   is   this?', ['id1']);
            const key2 = aiService.generateCacheKey('What is this?', ['id1']);
            
            expect(key1).toBe(key2);
        });

        it('should sort document IDs', () => {
            const key1 = aiService.generateCacheKey('test', ['id2', 'id1']);
            const key2 = aiService.generateCacheKey('test', ['id1', 'id2']);
            
            expect(key1).toBe(key2);
        });
    });

    describe('checkRateLimit', () => {
        beforeEach(() => {
            // Clear rate limits before each test
            aiService.rateLimits.clear();
        });

        it('should allow first request', () => {
            const result = aiService.checkRateLimit('user1');
            
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(19);
        });

        it('should track multiple requests', () => {
            aiService.checkRateLimit('user1');
            aiService.checkRateLimit('user1');
            const result = aiService.checkRateLimit('user1');
            
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(17);
        });

        it('should handle different users independently', () => {
            aiService.checkRateLimit('user1');
            aiService.checkRateLimit('user1');
            const result = aiService.checkRateLimit('user2');
            
            expect(result.remaining).toBe(19); // Fresh limit for user2
        });
    });

    describe('findRelevantDocuments', () => {
        const mockDocs = [
            {
                _id: 'doc1',
                originalName: 'javascript-guide.pdf',
                content: 'JavaScript is a programming language for web development.',
                toObject: function() { return { ...this }; }
            },
            {
                _id: 'doc2',
                originalName: 'python-guide.pdf',
                content: 'Python is a programming language for data science.',
                toObject: function() { return { ...this }; }
            },
            {
                _id: 'doc3',
                originalName: 'cooking-recipes.pdf',
                content: 'This book contains delicious pasta recipes.',
                toObject: function() { return { ...this }; }
            }
        ];

        it('should find relevant documents by content', () => {
            const result = aiService.findRelevantDocuments(mockDocs, 'JavaScript programming');
            
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]._id).toBe('doc1');
        });

        it('should score filename matches higher', () => {
            const result = aiService.findRelevantDocuments(mockDocs, 'python');
            
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]._id).toBe('doc2');
        });

        it('should exclude non-relevant documents', () => {
            const result = aiService.findRelevantDocuments(mockDocs, 'machine learning');
            
            expect(result.length).toBe(0);
        });

        it('should respect maxDocs limit', () => {
            const result = aiService.findRelevantDocuments(mockDocs, 'programming', 1);
            
            expect(result.length).toBe(1);
        });
    });

    describe('extractExcerpts', () => {
        const longContent = 'This is the introduction. This content talks about JavaScript programming. JavaScript is a popular language for web development. It is used by millions of developers. The community is very active. This is the conclusion.';

        it('should return full content if under max length', () => {
            const shortContent = 'Short text.';
            const result = aiService.extractExcerpts(shortContent, 'anything', 100);
            
            expect(result).toBe(shortContent);
        });

        it('should extract relevant excerpt', () => {
            const result = aiService.extractExcerpts(longContent, 'JavaScript programming', 100);
            
            expect(result).toContain('JavaScript');
        });

        it('should add ellipsis for truncated content', () => {
            const result = aiService.extractExcerpts(longContent, 'JavaScript', 50);
            
            expect(result).toContain('...');
        });
    });

    describe('cacheResponse', () => {
        beforeEach(() => {
            aiService.responseCache.clear();
        });

        it('should cache response', () => {
            const key = 'test-key';
            const response = { answer: 'Test answer', references: [] };
            
            aiService.cacheResponse(key, response);
            const cached = aiService.getCachedResponse(key);
            
            expect(cached).toEqual(response);
        });

        it('should return null for non-existent cache', () => {
            const cached = aiService.getCachedResponse('non-existent');
            
            expect(cached).toBeNull();
        });
    });

    describe('getRateLimitStatus', () => {
        beforeEach(() => {
            aiService.rateLimits.clear();
        });

        it('should return full limit for new user', () => {
            const status = aiService.getRateLimitStatus('new-user');
            
            expect(status.remaining).toBe(20);
            expect(status.resetIn).toBe(0);
        });

        it('should return remaining after requests', () => {
            aiService.checkRateLimit('user1');
            aiService.checkRateLimit('user1');
            aiService.checkRateLimit('user1');
            
            const status = aiService.getRateLimitStatus('user1');
            
            expect(status.remaining).toBe(17);
        });
    });
});
