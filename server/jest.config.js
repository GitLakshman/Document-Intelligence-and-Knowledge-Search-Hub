/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'middleware/**/*.js',
        'services/**/*.js',
        'routes/**/*.js',
        '!**/index.js'
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testTimeout: 30000,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
