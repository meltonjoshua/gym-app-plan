module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/src/$1',
  },
  collectCoverageFrom: [
    'app/src/**/*.{ts,tsx}',
    '!app/src/**/*.d.ts',
  ],
  testMatch: [
    '<rootDir>/app/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/app/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
