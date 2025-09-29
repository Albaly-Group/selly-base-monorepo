import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): object {
    return {
      message: 'Selly Base API',
      version: '1.0',
      status: 'running',
      endpoints: {
        health: '/health',
        documentation: '/docs',
        api: '/api/v1',
      },
    };
  }

  getHealth(): string {
    return 'Selly Base API is running with full TypeORM entities and Companies API!';
  }
}
