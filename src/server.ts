import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';
import routes from './routes';
import { handleError } from './utils/errors';

// Load environment variables
dotenv.config();

// Create Express app
const app: express.Application = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Request logging
app.use(loggerMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'FocusFlow API',
    version: '1.0.0',
    description: 'Backend API for FocusFlow task management application',
    documentation: '/api/docs',
    endpoints: {
      health: `${API_PREFIX}/health`,
      projects: `${API_PREFIX}/projects`,
      goals: `${API_PREFIX}/goals`,
      tasks: `${API_PREFIX}/tasks`,
      sync: `${API_PREFIX}/sync`,
    },
  });
});

// API routes
app.use(API_PREFIX, routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  handleError(error, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 FocusFlow API Server                                ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                    ║
║   Port: ${PORT}                                              ║
║   API Prefix: ${API_PREFIX}                                      ║
║                                                           ║
║   📍 Local: http://localhost:${PORT}                        ║
║   📍 API: http://localhost:${PORT}${API_PREFIX}                   ║
║   📍 Health: http://localhost:${PORT}${API_PREFIX}/health         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
