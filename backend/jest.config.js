module.exports = {
    testEnvironment: 'node',
    clearMocks: true,
    setupFiles: ['<rootDir>/tests/helpers/env.js'],
    collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/database/migrations/**'],
};
