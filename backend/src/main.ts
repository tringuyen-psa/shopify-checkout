import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow all origins as requested
  app.enableCors({
    origin: '*', // Allow all origins - AI, frontend, any client
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Digital Store API')
    .setDescription('API for digital package store with payment integration - Universal Access Enabled')
    .setVersion('1.0')
    .addTag('packages', 'Package management endpoints')
    .addTag('purchases', 'Purchase and subscription management')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('stripe', 'Stripe payment integration')
    .addTag('paypal', 'PayPal payment integration')
    .addServer('http://localhost:29000', 'Development server')
    .addServer('http://localhost:29000', 'Local API server')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 29000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
  console.log(`🌐 CORS enabled for all origins - Universal access granted`);
}

bootstrap();