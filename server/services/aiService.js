/**
 * AI Service - Handles Gemini API interactions, caching, and rate limiting
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RATE_LIMIT, DOCUMENT } = require('../config/constants');

class AIService {
    constructor() {
        this.genAI = null;
        this.model = null;
        // In-memory cache for responses (question hash -> response)
        this.responseCache = new Map();
        // Rate limiting: userId -> { count, resetTime }
        this.rateLimits = new Map();
    }

    /**
     * Initialize the Gemini AI service
     */
    initialize() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ Warning: GEMINI_API_KEY not set. AI features will not work.');
            return;
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        console.log('✅ AI Service initialized with gemini-flash-latest model');
    }

    /**
     * Generate a cache key from question and document IDs
     */
    generateCacheKey(question, documentIds) {
        const normalizedQuestion = question.toLowerCase().trim().replace(/\s+/g, ' ');
        const docKey = documentIds.sort().join('_');
        return `${normalizedQuestion}::${docKey}`;
    }

    /**
     * Check and update rate limit for a user
     */
    checkRateLimit(userId) {
        const now = Date.now();
        const userLimit = this.rateLimits.get(userId);

        if (!userLimit || now > userLimit.resetTime) {
            this.rateLimits.set(userId, {
                count: 1,
                resetTime: now + RATE_LIMIT.CACHE_TTL_MS
            });
            return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS_PER_HOUR - 1 };
        }

        if (userLimit.count >= RATE_LIMIT.MAX_REQUESTS_PER_HOUR) {
            const minutesLeft = Math.ceil((userLimit.resetTime - now) / (60 * 1000));
            return {
                allowed: false,
                remaining: 0,
                minutesLeft
            };
        }

        userLimit.count++;
        return {
            allowed: true,
            remaining: RATE_LIMIT.MAX_REQUESTS_PER_HOUR - userLimit.count
        };
    }

    /**
     * Get cached response if available and not expired
     */
    getCachedResponse(cacheKey) {
        const cached = this.responseCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < RATE_LIMIT.CACHE_TTL_MS) {
            console.log('📦 Returning cached response (API call saved!)');
            return cached.response;
        }
        if (cached) {
            this.responseCache.delete(cacheKey);
        }
        return null;
    }

    /**
     * Cache a response with size limit enforcement
     */
    cacheResponse(cacheKey, response) {
        if (this.responseCache.size >= RATE_LIMIT.MAX_CACHE_SIZE) {
            const oldestKey = this.responseCache.keys().next().value;
            this.responseCache.delete(oldestKey);
        }
        this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now()
        });
    }

    /**
     * Find relevant documents using TF-IDF inspired scoring
     */
    findRelevantDocuments(documents, question, maxDocs = DOCUMENT.MAX_RELEVANT_DOCS) {
        const questionWords = question.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2);

        const scoredDocs = documents.map(doc => {
            const content = doc.content.toLowerCase();
            const name = doc.originalName.toLowerCase();
            let score = 0;

            questionWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = content.match(regex);
                if (matches) {
                    // Logarithmic weight for term frequency
                    score += (1 + Math.log10(matches.length));
                }

                // Extra weight for filename matches
                if (name.includes(word)) {
                    score += 5;
                }
            });

            // Exact phrase match bonus
            const questionPhrase = question.toLowerCase().replace(/[^\w\s]/g, '');
            if (content.includes(questionPhrase)) {
                score *= 2;
                score += 20;
            }

            return { ...doc.toObject(), relevanceScore: score };
        });

        return scoredDocs
            .filter(doc => doc.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, maxDocs);
    }

    /**
     * Extract the most relevant excerpt from document content
     */
    extractExcerpts(content, question, maxLength = DOCUMENT.EXCERPT_LENGTH) {
        if (content.length <= maxLength) return content;

        const questionWords = question.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2);

        // Split into sentences
        const sentences = content.split(/(?<=[.!?])\s+/);
        let bestWindow = { score: -1, text: '', index: 0 };

        // Sliding window to find best context
        for (let i = 0; i < sentences.length; i++) {
            let currentWindowText = '';
            let currentScore = 0;
            let j = i;

            while (j < sentences.length && (currentWindowText.length + sentences[j].length) <= maxLength) {
                const sentenceLower = sentences[j].toLowerCase();
                questionWords.forEach(word => {
                    if (sentenceLower.includes(word)) currentScore += 1;
                });
                currentWindowText += (currentWindowText ? ' ' : '') + sentences[j];
                j++;
            }

            if (currentScore > bestWindow.score) {
                bestWindow = { score: currentScore, text: currentWindowText, index: i };
            }
        }

        // If no matches found, return start of document
        if (bestWindow.score <= 0) {
            return content.substring(0, maxLength).trim() + '...';
        }

        const prefix = bestWindow.index > 0 ? '...' : '';
        const suffix = bestWindow.text.length < content.length ? '...' : '';
        return prefix + bestWindow.text.trim() + suffix;
    }

    /**
     * Generate an answer using Gemini AI
     */
    async generateAnswer(question, relevantDocs, userId) {
        if (!this.model) {
            throw new Error('AI service not initialized. Please check your GEMINI_API_KEY.');
        }

        const rateCheck = this.checkRateLimit(userId);
        if (!rateCheck.allowed) {
            throw new Error(`Rate limit exceeded. Please wait ${rateCheck.minutesLeft} minutes before trying again.`);
        }

        if (relevantDocs.length === 0) {
            return {
                answer: "I couldn't find any relevant information in your documents to answer this question. Please upload documents related to your query.",
                references: [],
                cached: false,
                remainingQueries: rateCheck.remaining
            };
        }

        const documentIds = relevantDocs.map(doc => doc._id.toString());
        const cacheKey = this.generateCacheKey(question, documentIds);

        const cachedResponse = this.getCachedResponse(cacheKey);
        if (cachedResponse) {
            return {
                ...cachedResponse,
                cached: true,
                remainingQueries: rateCheck.remaining + 1
            };
        }

        // Build context with improved extraction
        const context = relevantDocs.map((doc, index) => {
            const excerpt = this.extractExcerpts(doc.content, question, DOCUMENT.AI_CONTEXT_LENGTH);
            return `[SOURCE ${index + 1}]: File: "${doc.originalName}"\nCONTENT: ${excerpt}`;
        }).join('\n\n');

        const prompt = `You are a helpful Research Assistant. Use the provided SOURCES to answer the QUESTION.
        
RULES:
1. Answer ONLY based on the provided SOURCES.
2. If the answer is not in the sources, say "I don't have enough information in the uploaded documents to answer this."
3. Keep the tone professional and concise.
4. Use Markdown for formatting (bolding, lists, etc).

SOURCES:
${context}

QUESTION: ${question}

Helpful Answer:`;

        try {
            console.log(`🔄 Generating AI answer for query: "${question.substring(0, 50)}..."`);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const answer = response.text();

            const references = relevantDocs.map(doc => ({
                documentId: doc._id,
                documentName: doc.originalName,
                excerpt: this.extractExcerpts(doc.content, question, 200),
                relevanceScore: doc.relevanceScore
            }));

            const responseData = { answer, references };
            this.cacheResponse(cacheKey, responseData);

            return {
                ...responseData,
                cached: false,
                remainingQueries: rateCheck.remaining
            };
        } catch (error) {
            console.error('Gemini API error:', error);

            if (error.message?.includes('quota') || error.status === 429) {
                throw new Error('Gemini API rate limit exceeded. Please try again shortly.');
            }
            if (error.message?.includes('blocked')) {
                throw new Error('This query was flagged by safety filters. Please rephrase.');
            }

            throw new Error(`AI error: ${error.message || 'Failed to generate answer'}`);
        }
    }

    /**
     * Get rate limit status for a user
     */
    getRateLimitStatus(userId) {
        const now = Date.now();
        const userLimit = this.rateLimits.get(userId);

        if (!userLimit || now > userLimit.resetTime) {
            return {
                remaining: RATE_LIMIT.MAX_REQUESTS_PER_HOUR,
                resetIn: 0
            };
        }

        return {
            remaining: Math.max(0, RATE_LIMIT.MAX_REQUESTS_PER_HOUR - userLimit.count),
            resetIn: Math.ceil((userLimit.resetTime - now) / (60 * 1000))
        };
    }

    /**
     * Clear the response cache
     */
    clearCache() {
        this.responseCache.clear();
        console.log('🗑️ Response cache cleared');
    }
}

module.exports = new AIService();
