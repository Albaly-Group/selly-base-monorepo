import { Injectable, Optional } from '@nestjs/common';
import { DatabaseHealthService } from './database/database-health.service';

@Injectable()
export class AppService {
  constructor(
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

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

  async getHealth(): Promise<object> {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'disabled',
    };

    try {
      const isHealthy = await this.databaseHealthService.isHealthy();
      health.database = isHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      health.database = 'error';
    }

    return health;
  }
}
