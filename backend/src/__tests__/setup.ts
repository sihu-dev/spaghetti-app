// Jest setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment defaults
process.env.NODE_ENV = 'development';
process.env.PORT = '3001';
process.env.ANTHROPIC_API_KEY = 'test-api-key';
process.env.CORS_ORIGINS = 'http://localhost:*';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
process.env.ENABLE_HELMET = 'false';
process.env.TRUST_PROXY = 'false';

// Global test timeout
jest.setTimeout(10000);

// Suppress console during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
