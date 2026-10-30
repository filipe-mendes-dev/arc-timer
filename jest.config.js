module.exports = {
    preset: 'jest-expo',
    // collectCoverageFrom: [
    //     'src/**/*.{ts,tsx}',
    //     '!src/**/*.d.ts',
    //     '!src/**/styles.ts',
    //     '!src/**/*.styles.ts',
    // ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html', 'lcov'],
    testMatch: [
        '<rootDir>/tests/**/*.test.ts',
        '<rootDir>/tests/**/*.test.tsx',
    ],
    moduleNameMapper: {
        // Immer's React Native export is ESM; Jest executes its equivalent CJS build.
        '^immer$': '<rootDir>/node_modules/immer/dist/cjs/index.js',
        '^src/(.*)$': '<rootDir>/src/$1',
        '^tests/(.*)$': '<rootDir>/tests/$1',
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^expo-modules-core/(.*)$':
            '<rootDir>/node_modules/expo-modules-core/$1',
        '^expo-modules-core$':
            '<rootDir>/node_modules/expo-modules-core',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    watchman: false,
};
