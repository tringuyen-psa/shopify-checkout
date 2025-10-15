import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get API health and information' })
  @ApiResponse({
    status: 200,
    description: 'API is running and accessible',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Digital Store API is running!' },
        status: { type: 'string', example: 'healthy' },
        version: { type: 'string', example: '1.0.0' },
        endpoints: {
          type: 'object',
          properties: {
            swagger: { type: 'string', example: '/api' },
            packages: { type: 'string', example: '/packages' },
            purchases: { type: 'string', example: '/purchases' },
            payments: { type: 'string', example: '/payments' },
          },
        },
        cors: { type: 'string', example: 'Enabled for all origins' },
        documentation: { type: 'string', example: 'Available at /api' },
      },
    },
  })
  getHealth() {
    return {
      message: 'Digital Store API is running!',
      status: 'healthy',
      version: '1.0.0',
      endpoints: {
        swagger: '/api',
        packages: '/packages',
        purchases: '/purchases',
        payments: '/payments',
      },
      cors: 'Enabled for all origins',
      documentation: 'Available at /api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-10-15T09:00:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  getDetailedHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.version,
    };
  }
}