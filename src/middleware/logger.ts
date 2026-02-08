import morgan from 'morgan';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (_req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Development format: detailed logging
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format: combined with timestamp
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

export const loggerMiddleware = process.env.NODE_ENV === 'production'
  ? morgan(prodFormat)
  : morgan(devFormat);
