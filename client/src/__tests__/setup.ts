/**
 * Test Setup for Vitest
 * Configures testing environment with DOM matchers
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for components using media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe = () => {};
    disconnect = () => {};
    unobserve = () => {};
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
    observe = () => {};
    disconnect = () => {};
    unobserve = () => {};
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
});

// Suppress console errors during tests (optional)
// Uncomment to reduce noise in test output
// beforeAll(() => {
//     jest.spyOn(console, 'error').mockImplementation(() => {});
// });
