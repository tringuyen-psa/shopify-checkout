import { Controller, Get, Res, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { UserSeederService } from './modules/users/user.seeder.service';
import { UserService } from './modules/users/user.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly userSeederService: UserSeederService,
    private readonly userService: UserService,
  ) {}
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
        docs: '/docs (CDN version)',
        packages: '/packages',
        purchases: '/purchases',
        payments: '/payments',
      },
      cors: 'Enabled for all origins',
      documentation: 'Available at /api or /docs',
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

  @Get('docs')
  @ApiOperation({ summary: 'Alternative Swagger documentation with CDN assets' })
  @ApiResponse({
    status: 200,
    description: 'Swagger documentation HTML page',
  })
  getSwaggerDocs(@Res() res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction
      ? 'https://shopify-checkout-api.vercel.app'
      : 'http://localhost:29000';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Digital Store API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
        .swagger-ui .topbar { display: none }
        .information-container { display: none }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '${baseUrl}/api-json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: "none",
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: false,
            });
        };
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Post('create-demo-user')
  @ApiOperation({ summary: 'Create demo user for testing' })
  @ApiResponse({
    status: 200,
    description: 'Demo user created successfully',
  })
  async createDemoUser() {
    try {
      const user = await this.userSeederService.createDemoUser();
      const loginResult = await this.userService.login({
        email: user.email,
        password: 'demo123',
      });

      return {
        success: true,
        message: 'Demo user created and logged in successfully',
        user: loginResult.user,
        accessToken: loginResult.accessToken,
        credentials: {
          email: 'demo@example.com',
          password: 'demo123',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create demo user',
        error: error.message,
      };
    }
  }

  @Post('test-login')
  @ApiOperation({ summary: 'Test login with demo credentials' })
  @ApiResponse({
    status: 200,
    description: 'Login test result',
  })
  async testLogin(@Body() body: { email?: string; password?: string }) {
    const { email = 'demo@example.com', password = 'demo123' } = body;

    try {
      const result = await this.userService.login({ email, password });
      return {
        success: true,
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        error: error.message,
        credentials: {
          email: 'demo@example.com',
          password: 'demo123',
        },
      };
    }
  }
}