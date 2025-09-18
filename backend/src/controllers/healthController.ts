import { Request, Response } from 'express';
import mongoose from 'mongoose';

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
export const getHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'OK',
        database: 'OK',
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    // Check database connection
    const databaseState = mongoose.connection.readyState;
    if (databaseState !== 1) { // 1 = connected
      healthCheck.checks.database = 'ERROR';
      healthCheck.message = 'Database connection issue';
    }

    // Set appropriate status code
    const statusCode = healthCheck.checks.database === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'ERROR',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'ERROR',
        database: 'ERROR',
      },
      error: (error as Error).message,
      version: process.env.npm_package_version || '1.0.0',
    };

    res.status(503).json(healthCheck);
  }
};

// @desc    Detailed health check with database ping
// @route   GET /api/health/detailed
// @access  Public
export const getDetailedHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Check database connection with a simple query
    let databaseStatus: any = null;
    try {
      if (mongoose.connection.db) {
        databaseStatus = await mongoose.connection.db.admin().ping();
      }
    } catch (dbError) {
      databaseStatus = { error: (dbError as Error).message };
    }
    
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      checks: {
        server: 'OK',
        database: {
          status: 'OK',
          connection: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          ping: databaseStatus,
        },
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: process.memoryUsage(),
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'ERROR',
      timestamp: new Date().toISOString(),
      checks: {
        server: 'OK',
        database: {
          status: 'ERROR',
          error: (error as Error).message,
        },
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      error: (error as Error).message,
    };

    res.status(503).json(healthCheck);
  }
};