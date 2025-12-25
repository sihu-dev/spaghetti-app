describe('Environment Configuration', () => {
  // Store original environment variables and process.exit
  const originalEnv = { ...process.env };
  const originalExit = process.exit;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    jest.resetModules();
    // Reset environment variables and set required ones
    process.env = { ...originalEnv };
    // Always set ANTHROPIC_API_KEY as it's required
    process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    // Mock process.exit to prevent test termination
    process.exit = jest.fn() as any;
  });

  afterEach(() => {
    // Restore process.exit
    process.exit = originalExit;
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('Required environment variables', () => {
    it('should call process.exit when ANTHROPIC_API_KEY is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should accept valid ANTHROPIC_API_KEY', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key-123';

      const { env } = require('../../config/env');
      expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-api03-test-key-123');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept empty string for ANTHROPIC_API_KEY', () => {
      process.env.ANTHROPIC_API_KEY = '';

      // envalid str() validator accepts empty strings by default
      const { env } = require('../../config/env');
      expect(env.ANTHROPIC_API_KEY).toBe('');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept whitespace-only ANTHROPIC_API_KEY', () => {
      process.env.ANTHROPIC_API_KEY = '   ';

      // envalid str() validator accepts whitespace strings
      const { env } = require('../../config/env');
      expect(env.ANTHROPIC_API_KEY).toBe('   ');
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('NODE_ENV validation', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    it('should accept "development" as valid NODE_ENV', () => {
      process.env.NODE_ENV = 'development';

      const { env } = require('../../config/env');
      expect(env.NODE_ENV).toBe('development');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept "staging" as valid NODE_ENV', () => {
      process.env.NODE_ENV = 'staging';

      const { env } = require('../../config/env');
      expect(env.NODE_ENV).toBe('staging');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept "production" as valid NODE_ENV', () => {
      process.env.NODE_ENV = 'production';

      const { env } = require('../../config/env');
      expect(env.NODE_ENV).toBe('production');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should use "development" as default when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const { env } = require('../../config/env');
      expect(env.NODE_ENV).toBe('development');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should call process.exit for invalid NODE_ENV value', () => {
      process.env.NODE_ENV = 'invalid';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call process.exit for "test" as NODE_ENV', () => {
      process.env.NODE_ENV = 'test';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call process.exit for "local" as NODE_ENV', () => {
      process.env.NODE_ENV = 'local';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('PORT configuration', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    it('should use default port 3000 when PORT is not set', () => {
      delete process.env.PORT;

      const { env } = require('../../config/env');
      expect(env.PORT).toBe(3000);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should parse PORT as number from string', () => {
      process.env.PORT = '8080';

      const { env } = require('../../config/env');
      expect(env.PORT).toBe(8080);
      expect(typeof env.PORT).toBe('number');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept valid port numbers', () => {
      const validPorts = [
        { str: '80', num: 80 },
        { str: '443', num: 443 },
        { str: '3000', num: 3000 },
        { str: '8000', num: 8000 },
        { str: '9000', num: 9000 },
        { str: '65535', num: 65535 },
      ];

      validPorts.forEach(({ str, num }) => {
        jest.resetModules();
        process.exit = jest.fn() as any;
        process.env.PORT = str;

        const { env } = require('../../config/env');
        expect(env.PORT).toBe(num);
        expect(process.exit).not.toHaveBeenCalled();
      });
    });

    it('should call process.exit for invalid port number (0)', () => {
      process.env.PORT = '0';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call process.exit for port number greater than 65535', () => {
      process.env.PORT = '65536';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call process.exit for negative port number', () => {
      process.env.PORT = '-1';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call process.exit for non-numeric PORT value', () => {
      process.env.PORT = 'not-a-number';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should call process.exit for PORT with decimal values', () => {
      process.env.PORT = '3000.5';

      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('CORS_ORIGINS configuration', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    it('should use default CORS_ORIGINS when not set', () => {
      delete process.env.CORS_ORIGINS;

      const { env } = require('../../config/env');
      expect(env.CORS_ORIGINS).toBe('chrome-extension://*,http://localhost:*,https://*.github.dev');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept custom CORS_ORIGINS', () => {
      process.env.CORS_ORIGINS = 'https://example.com,https://api.example.com';

      const { env } = require('../../config/env');
      expect(env.CORS_ORIGINS).toBe('https://example.com,https://api.example.com');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept single origin', () => {
      process.env.CORS_ORIGINS = 'https://example.com';

      const { env } = require('../../config/env');
      expect(env.CORS_ORIGINS).toBe('https://example.com');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept wildcard patterns', () => {
      process.env.CORS_ORIGINS = 'https://*.example.com,http://localhost:*';

      const { env } = require('../../config/env');
      expect(env.CORS_ORIGINS).toBe('https://*.example.com,http://localhost:*');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept empty string for CORS_ORIGINS', () => {
      process.env.CORS_ORIGINS = '';

      const { env } = require('../../config/env');
      expect(env.CORS_ORIGINS).toBe('');
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('Rate limiting configuration', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    describe('RATE_LIMIT_WINDOW_MS', () => {
      it('should use default window (900000ms = 15min) when not set', () => {
        delete process.env.RATE_LIMIT_WINDOW_MS;

        const { env } = require('../../config/env');
        expect(env.RATE_LIMIT_WINDOW_MS).toBe('900000');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept custom window duration as string', () => {
        process.env.RATE_LIMIT_WINDOW_MS = '600000';

        const { env } = require('../../config/env');
        expect(env.RATE_LIMIT_WINDOW_MS).toBe('600000');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should keep value as string type', () => {
        process.env.RATE_LIMIT_WINDOW_MS = '300000';

        const { env } = require('../../config/env');
        expect(typeof env.RATE_LIMIT_WINDOW_MS).toBe('string');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept numeric strings', () => {
        const values = ['60000', '300000', '900000', '3600000'];

        values.forEach((value) => {
          jest.resetModules();
          process.exit = jest.fn() as any;
          process.env.RATE_LIMIT_WINDOW_MS = value;

          const { env } = require('../../config/env');
          expect(env.RATE_LIMIT_WINDOW_MS).toBe(value);
          expect(process.exit).not.toHaveBeenCalled();
        });
      });
    });

    describe('RATE_LIMIT_MAX_REQUESTS', () => {
      it('should use default max requests (100) when not set', () => {
        delete process.env.RATE_LIMIT_MAX_REQUESTS;

        const { env } = require('../../config/env');
        expect(env.RATE_LIMIT_MAX_REQUESTS).toBe('100');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept custom max requests as string', () => {
        process.env.RATE_LIMIT_MAX_REQUESTS = '50';

        const { env } = require('../../config/env');
        expect(env.RATE_LIMIT_MAX_REQUESTS).toBe('50');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should keep value as string type', () => {
        process.env.RATE_LIMIT_MAX_REQUESTS = '200';

        const { env } = require('../../config/env');
        expect(typeof env.RATE_LIMIT_MAX_REQUESTS).toBe('string');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept various numeric string values', () => {
        const values = ['10', '50', '100', '500', '1000'];

        values.forEach((value) => {
          jest.resetModules();
          process.exit = jest.fn() as any;
          process.env.RATE_LIMIT_MAX_REQUESTS = value;

          const { env } = require('../../config/env');
          expect(env.RATE_LIMIT_MAX_REQUESTS).toBe(value);
          expect(process.exit).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('Security configuration', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    describe('ENABLE_HELMET', () => {
      it('should default to true when not set', () => {
        delete process.env.ENABLE_HELMET;

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(true);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "true" string to boolean true', () => {
        process.env.ENABLE_HELMET = 'true';

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(true);
        expect(typeof env.ENABLE_HELMET).toBe('boolean');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "false" string to boolean false', () => {
        process.env.ENABLE_HELMET = 'false';

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(false);
        expect(typeof env.ENABLE_HELMET).toBe('boolean');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "1" as boolean true', () => {
        process.env.ENABLE_HELMET = '1';

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(true);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "0" as boolean false', () => {
        process.env.ENABLE_HELMET = '0';

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(false);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "yes" as boolean true', () => {
        process.env.ENABLE_HELMET = 'yes';

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(true);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "no" as boolean false', () => {
        process.env.ENABLE_HELMET = 'no';

        const { env } = require('../../config/env');
        expect(env.ENABLE_HELMET).toBe(false);
        expect(process.exit).not.toHaveBeenCalled();
      });

    });

    describe('TRUST_PROXY', () => {
      it('should default to false when not set', () => {
        delete process.env.TRUST_PROXY;

        const { env } = require('../../config/env');
        expect(env.TRUST_PROXY).toBe(false);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "true" string to boolean true', () => {
        process.env.TRUST_PROXY = 'true';

        const { env } = require('../../config/env');
        expect(env.TRUST_PROXY).toBe(true);
        expect(typeof env.TRUST_PROXY).toBe('boolean');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "false" string to boolean false', () => {
        process.env.TRUST_PROXY = 'false';

        const { env } = require('../../config/env');
        expect(env.TRUST_PROXY).toBe(false);
        expect(typeof env.TRUST_PROXY).toBe('boolean');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "1" as boolean true', () => {
        process.env.TRUST_PROXY = '1';

        const { env } = require('../../config/env');
        expect(env.TRUST_PROXY).toBe(true);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should parse "0" as boolean false', () => {
        process.env.TRUST_PROXY = '0';

        const { env } = require('../../config/env');
        expect(env.TRUST_PROXY).toBe(false);
        expect(process.exit).not.toHaveBeenCalled();
      });
    });
  });

  describe('JWT configuration', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    describe('JWT_SECRET', () => {
      it('should use default dev secret when not set', () => {
        delete process.env.JWT_SECRET;

        const { env } = require('../../config/env');
        expect(env.JWT_SECRET).toBe('dev-jwt-secret-change-in-production');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept custom JWT_SECRET', () => {
        process.env.JWT_SECRET = 'my-super-secret-key-123';

        const { env } = require('../../config/env');
        expect(env.JWT_SECRET).toBe('my-super-secret-key-123');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept long secret strings', () => {
        const longSecret = 'a'.repeat(256);
        process.env.JWT_SECRET = longSecret;

        const { env } = require('../../config/env');
        expect(env.JWT_SECRET).toBe(longSecret);
        expect(env.JWT_SECRET).toHaveLength(256);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept special characters in JWT_SECRET', () => {
        process.env.JWT_SECRET = 'secret!@#$%^&*()-_=+[]{}|;:,.<>?';

        const { env } = require('../../config/env');
        expect(env.JWT_SECRET).toContain('!@#$%^&*()');
        expect(process.exit).not.toHaveBeenCalled();
      });
    });

    describe('JWT_REFRESH_SECRET', () => {
      it('should use default dev refresh secret when not set', () => {
        delete process.env.JWT_REFRESH_SECRET;

        const { env } = require('../../config/env');
        expect(env.JWT_REFRESH_SECRET).toBe('dev-jwt-refresh-secret-change-in-production');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should accept custom JWT_REFRESH_SECRET', () => {
        process.env.JWT_REFRESH_SECRET = 'my-refresh-secret-key-456';

        const { env } = require('../../config/env');
        expect(env.JWT_REFRESH_SECRET).toBe('my-refresh-secret-key-456');
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should allow different secrets for access and refresh tokens', () => {
        process.env.JWT_SECRET = 'access-token-secret';
        process.env.JWT_REFRESH_SECRET = 'refresh-token-secret';

        const { env } = require('../../config/env');
        expect(env.JWT_SECRET).toBe('access-token-secret');
        expect(env.JWT_REFRESH_SECRET).toBe('refresh-token-secret');
        expect(env.JWT_SECRET).not.toBe(env.JWT_REFRESH_SECRET);
        expect(process.exit).not.toHaveBeenCalled();
      });

      it('should allow same value for both JWT secrets', () => {
        const sameSecret = 'shared-secret-key';
        process.env.JWT_SECRET = sameSecret;
        process.env.JWT_REFRESH_SECRET = sameSecret;

        const { env } = require('../../config/env');
        expect(env.JWT_SECRET).toBe(sameSecret);
        expect(env.JWT_REFRESH_SECRET).toBe(sameSecret);
        expect(process.exit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Type coercion', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    it('should coerce PORT from string to number', () => {
      process.env.PORT = '4000';

      const { env } = require('../../config/env');
      expect(env.PORT).toBe(4000);
      expect(typeof env.PORT).toBe('number');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should coerce boolean strings to actual booleans', () => {
      process.env.ENABLE_HELMET = 'true';
      process.env.TRUST_PROXY = 'false';

      const { env } = require('../../config/env');
      expect(env.ENABLE_HELMET).toBe(true);
      expect(env.TRUST_PROXY).toBe(false);
      expect(typeof env.ENABLE_HELMET).toBe('boolean');
      expect(typeof env.TRUST_PROXY).toBe('boolean');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should keep string values as strings', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test';
      process.env.CORS_ORIGINS = 'https://example.com';
      process.env.RATE_LIMIT_WINDOW_MS = '900000';

      const { env } = require('../../config/env');
      expect(typeof env.ANTHROPIC_API_KEY).toBe('string');
      expect(typeof env.CORS_ORIGINS).toBe('string');
      expect(typeof env.RATE_LIMIT_WINDOW_MS).toBe('string');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should handle multiple type coercions in single config', () => {
      process.env.PORT = '8080';
      process.env.ENABLE_HELMET = 'true';
      process.env.TRUST_PROXY = '1';
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';

      const { env } = require('../../config/env');
      expect(typeof env.PORT).toBe('number');
      expect(typeof env.ENABLE_HELMET).toBe('boolean');
      expect(typeof env.TRUST_PROXY).toBe('boolean');
      expect(typeof env.RATE_LIMIT_MAX_REQUESTS).toBe('string');
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('Complete valid configuration', () => {
    it('should accept a complete valid production configuration', () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-prod-key-xyz';
      process.env.CORS_ORIGINS = 'https://example.com';
      process.env.RATE_LIMIT_WINDOW_MS = '600000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';
      process.env.ENABLE_HELMET = 'true';
      process.env.TRUST_PROXY = 'true';
      process.env.JWT_SECRET = 'production-jwt-secret-key';
      process.env.JWT_REFRESH_SECRET = 'production-refresh-secret-key';

      const { env } = require('../../config/env');
      expect(env.NODE_ENV).toBe('production');
      expect(env.PORT).toBe(8080);
      expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-api03-prod-key-xyz');
      expect(env.CORS_ORIGINS).toBe('https://example.com');
      expect(env.RATE_LIMIT_WINDOW_MS).toBe('600000');
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe('50');
      expect(env.ENABLE_HELMET).toBe(true);
      expect(env.TRUST_PROXY).toBe(true);
      expect(env.JWT_SECRET).toBe('production-jwt-secret-key');
      expect(env.JWT_REFRESH_SECRET).toBe('production-refresh-secret-key');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept minimal configuration with only required fields', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-minimal-key';
      // All other fields should use defaults
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.CORS_ORIGINS;
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
      delete process.env.ENABLE_HELMET;
      delete process.env.TRUST_PROXY;
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      const { env } = require('../../config/env');
      expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-api03-minimal-key');
      expect(env.NODE_ENV).toBe('development');
      expect(env.PORT).toBe(3000);
      expect(env.CORS_ORIGINS).toBeDefined();
      expect(env.RATE_LIMIT_WINDOW_MS).toBe('900000');
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe('100');
      expect(env.ENABLE_HELMET).toBe(true);
      expect(env.TRUST_PROXY).toBe(false);
      expect(env.JWT_SECRET).toBeDefined();
      expect(env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should accept staging environment configuration', () => {
      process.env.NODE_ENV = 'staging';
      process.env.PORT = '3001';
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-staging-key';
      process.env.TRUST_PROXY = 'true';

      const { env } = require('../../config/env');
      expect(env.NODE_ENV).toBe('staging');
      expect(env.PORT).toBe(3001);
      expect(env.TRUST_PROXY).toBe(true);
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('Environment exports', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
    });

    it('should export env object', () => {
      const envModule = require('../../config/env');
      expect(envModule).toHaveProperty('env');
      expect(envModule.env).toBeDefined();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should have all expected properties on env object', () => {
      const { env } = require('../../config/env');

      expect(env).toHaveProperty('NODE_ENV');
      expect(env).toHaveProperty('PORT');
      expect(env).toHaveProperty('ANTHROPIC_API_KEY');
      expect(env).toHaveProperty('CORS_ORIGINS');
      expect(env).toHaveProperty('RATE_LIMIT_WINDOW_MS');
      expect(env).toHaveProperty('RATE_LIMIT_MAX_REQUESTS');
      expect(env).toHaveProperty('ENABLE_HELMET');
      expect(env).toHaveProperty('TRUST_PROXY');
      expect(env).toHaveProperty('JWT_SECRET');
      expect(env).toHaveProperty('JWT_REFRESH_SECRET');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should make env object read-only (envalid behavior)', () => {
      const { env } = require('../../config/env');

      // envalid makes the object read-only
      expect(() => {
        (env as any).PORT = 9999;
      }).toThrow();
    });

    it('should provide isDev helper method', () => {
      const { env } = require('../../config/env');
      expect(env).toHaveProperty('isDev');
      expect(typeof env.isDev).toBe('boolean');
    });

    it('should provide isProd helper method', () => {
      const { env } = require('../../config/env');
      expect(env).toHaveProperty('isProd');
      expect(typeof env.isProd).toBe('boolean');
    });

    it('should provide isProduction helper method', () => {
      const { env } = require('../../config/env');
      expect(env).toHaveProperty('isProduction');
      expect(typeof env.isProduction).toBe('boolean');
    });
  });

  describe('Edge cases and validation', () => {
    it('should preserve whitespace in ANTHROPIC_API_KEY', () => {
      process.env.ANTHROPIC_API_KEY = '  sk-ant-api03-test-key  ';

      const { env } = require('../../config/env');
      // envalid does NOT trim whitespace - it preserves the value as-is
      expect(env.ANTHROPIC_API_KEY).toBe('  sk-ant-api03-test-key  ');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should reject NODE_ENV with whitespace (not in choices)', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
      process.env.NODE_ENV = ' production ';

      // NODE_ENV has specific choices, so ' production ' is not valid
      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should validate environment on module import', () => {
      delete process.env.ANTHROPIC_API_KEY;

      // Validation happens immediately on import
      require('../../config/env');
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle numeric PORT at boundaries', () => {
      const boundaryPorts = [
        { str: '1', num: 1 },
        { str: '1024', num: 1024 },
        { str: '49152', num: 49152 },
        { str: '65535', num: 65535 },
      ];

      boundaryPorts.forEach(({ str, num }) => {
        jest.resetModules();
        process.exit = jest.fn() as any;
        process.env.PORT = str;
        process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';

        const { env } = require('../../config/env');
        expect(env.PORT).toBe(num);
        expect(process.exit).not.toHaveBeenCalled();
      });
    });

    it('should accept unicode characters in string fields', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-테스트-키';
      process.env.JWT_SECRET = 'my-secret-密钥-🔐';

      const { env } = require('../../config/env');
      expect(env.ANTHROPIC_API_KEY).toContain('테스트');
      expect(env.JWT_SECRET).toContain('密钥');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should handle very long CORS_ORIGINS string', () => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
      const longOrigins = Array(100)
        .fill('https://example.com')
        .join(',');
      process.env.CORS_ORIGINS = longOrigins;

      const { env } = require('../../config/env');
      expect(env.CORS_ORIGINS).toBe(longOrigins);
      expect(env.CORS_ORIGINS.split(',').length).toBe(100);
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('Default values summary', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-test-key';
      // Remove all optional env vars to test defaults
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.CORS_ORIGINS;
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
      delete process.env.ENABLE_HELMET;
      delete process.env.TRUST_PROXY;
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
    });

    it('should use correct defaults for all optional fields', () => {
      const { env } = require('../../config/env');

      expect(env.NODE_ENV).toBe('development');
      expect(env.PORT).toBe(3000);
      expect(env.CORS_ORIGINS).toBe('chrome-extension://*,http://localhost:*,https://*.github.dev');
      expect(env.RATE_LIMIT_WINDOW_MS).toBe('900000');
      expect(env.RATE_LIMIT_MAX_REQUESTS).toBe('100');
      expect(env.ENABLE_HELMET).toBe(true);
      expect(env.TRUST_PROXY).toBe(false);
      expect(env.JWT_SECRET).toBe('dev-jwt-secret-change-in-production');
      expect(env.JWT_REFRESH_SECRET).toBe('dev-jwt-refresh-secret-change-in-production');
      expect(process.exit).not.toHaveBeenCalled();
    });
  });
});
