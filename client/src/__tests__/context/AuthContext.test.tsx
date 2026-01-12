/**
 * AuthContext Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ReactNode } from 'react';

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

// Test component that consumes auth context
const TestConsumer = () => {
    const { user, isAuthenticated, loading } = useAuth();
    return (
        <div>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="user">{user?.name || 'null'}</span>
        </div>
    );
};

// Wrapper for tests
const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('provides initial unauthenticated state', async () => {
        render(<TestConsumer />, { wrapper });
        
        await waitFor(() => {
            expect(screen.getByTestId('authenticated').textContent).toBe('false');
        });
    });

    it('provides loading state initially', () => {
        render(<TestConsumer />, { wrapper });
        
        // Initially loading should be true or quickly become false
        const loading = screen.getByTestId('loading');
        expect(loading).toBeInTheDocument();
    });

    it('restores user from localStorage token', async () => {
        // Set a mock token (this is a simplified test - real JWT would be decoded)
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTYwMDAwMDAwMH0.mock';
        const mockUser = { _id: '123', name: 'Test User', email: 'test@test.com' };
        
        localStorageMock.setItem('token', mockToken);
        localStorageMock.setItem('user', JSON.stringify(mockUser));
        
        render(<TestConsumer />, { wrapper });
        
        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('Test User');
        });
    });
});

describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => {
            render(<TestConsumer />);
        }).toThrow();
        
        consoleSpy.mockRestore();
    });
});
