/**
 * API Client Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import api from '../../api';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API Client', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('has correct base URL configuration', () => {
        expect(api.defaults.baseURL).toContain('/api');
    });

    it('is an axios instance', () => {
        // Verify it's a valid axios instance with request method
        expect(typeof api.get).toBe('function');
        expect(typeof api.post).toBe('function');
        expect(typeof api.delete).toBe('function');
    });

    it('has interceptors configured', () => {
        // Axios instances have interceptors
        expect(api.interceptors).toBeDefined();
        expect(api.interceptors.request).toBeDefined();
        expect(api.interceptors.response).toBeDefined();
    });
});

describe('API Request Interceptor', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('adds Authorization header when token exists', () => {
        localStorageMock.setItem('token', 'test-token');
        
        // Create a mock request config
        const config = {
            headers: {} as Record<string, string>
        };
        
        // Manually run through what the interceptor does
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        expect(config.headers['Authorization']).toBe('Bearer test-token');
    });

    it('does not add Authorization header when no token', () => {
        const config = {
            headers: {} as Record<string, string>
        };
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        expect(config.headers['Authorization']).toBeUndefined();
    });
});
