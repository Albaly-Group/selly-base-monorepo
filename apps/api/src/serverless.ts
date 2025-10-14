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
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['log', 'error', 'warn', 'debug', 'verbose'],
    },
  );

  // Set global prefix for API routes (excluding root endpoints)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health', 'docs', 'docs/(.*)'],
  });

  // Global exception filter for consistent error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for frontend communication
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [/\.vercel\.app$/, /\.albaly\.jp$/, /\.amplifyapp\.com$/]
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            /\.vercel\.app$/,
            /\.albaly\.jp$/,
            /\.amplifyapp\.com$/,
          ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-HTTP-Method-Override',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Selly Base API')
    .setDescription(
      'The Selly Base API for company and list management with full authentication and validation',
    )
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

  // Configure Swagger UI with appropriate asset loading for environment
  const swaggerConfig: any = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  // In serverless environments, use CDN-hosted assets to avoid static file serving issues
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    swaggerConfig.customCssUrl =
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css';
    swaggerConfig.customJs = [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js',
    ];
  }

  SwaggerModule.setup('docs', app, document, swaggerConfig);

  await app.init();
  cachedNestApp = app;

  return app;
}

export { createNestServer, expressServer };
