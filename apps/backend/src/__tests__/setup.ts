// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-key-for-testing';
process.env.NODE_ENV = 'test';

// Suppress console.log during tests unless needed
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
