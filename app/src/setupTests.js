// Jest setup file for iOS error testing
global.fetch = jest.fn();

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
