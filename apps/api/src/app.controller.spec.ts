import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseHealthService } from './database/database-health.service';

describe('AppController', () => {
  let appController: AppController;
  let mockDatabaseHealthService: Partial<DatabaseHealthService>;

  beforeEach(async () => {
    // Create mock DatabaseHealthService
    mockDatabaseHealthService = {
      isHealthy: jest.fn().mockResolvedValue(true),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DatabaseHealthService,
          useValue: mockDatabaseHealthService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information', () => {
      const result = appController.getRoot();
      expect(result).toHaveProperty('message', 'Selly Base API');
      expect(result).toHaveProperty('version', '1.0');
      expect(result).toHaveProperty('status', 'running');
      expect(result).toHaveProperty('endpoints');
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      const result = await appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('database');
    });
  });
});
