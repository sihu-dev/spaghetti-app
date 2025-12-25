import { cleanEnv, str, port, bool } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'staging', 'production'],
    default: 'development'
  }),
  PORT: port({ default: 3000 }),

  // Anthropic API
  ANTHROPIC_API_KEY: str({
    desc: 'Anthropic API key for Claude AI',
    example: 'sk-ant-api03-...'
  }),

  // CORS
  CORS_ORIGINS: str({
    default: 'chrome-extension://*,http://localhost:*,https://*.github.dev',
    desc: 'Comma-separated list of allowed origins'
  }),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: str({ default: '900000' }), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: str({ default: '100' }),

  // Security
  ENABLE_HELMET: bool({ default: true }),
  TRUST_PROXY: bool({ default: false }),

  // JWT
  JWT_SECRET: str({
    default: 'dev-jwt-secret-change-in-production',
    desc: 'Secret key for JWT access tokens'
  }),
  JWT_REFRESH_SECRET: str({
    default: 'dev-jwt-refresh-secret-change-in-production',
    desc: 'Secret key for JWT refresh tokens'
  }),
});

export type Env = typeof env;
