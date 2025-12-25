import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Request logging context
export interface RequestContext {
  requestId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
}

// Create child logger with request context
export const createRequestLogger = (context: RequestContext) => {
  return logger.child(context);
};

// Log levels helper
export const log = {
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, data?: object) => logger.error(data, msg),
  debug: (msg: string, data?: object) => logger.debug(data, msg),
  fatal: (msg: string, data?: object) => logger.fatal(data, msg),
};

export default logger;
