import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

const expressServer = express();

let cachedNestApp: any = null;

async function createNestServer() {
  if (cachedNestApp) {
    return cachedNestApp;
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressServer),
    {
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
    }
  );

  // Global exception filter for consistent error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://*.vercel.app', /\.vercel\.app$/] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Selly Base API')
    .setDescription('The Selly Base API for company and list management with full authentication and validation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('companies', 'Company management endpoints')
    .addTag('company-lists', 'Company list management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();
  cachedNestApp = app;

  return app;
}

export { createNestServer, expressServer };