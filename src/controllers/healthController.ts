import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler } from '../utils/errors';
import { successResponse } from '../utils/response';

/**
 * GET /api/health - Health check endpoint
 * Returns server status and database connectivity
 */
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  // Check database connectivity
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    version: '1.0.0',
  };

  successResponse(res, health);
});
