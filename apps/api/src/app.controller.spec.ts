import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
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
    it('should return health status', () => {
      expect(appController.getHealth()).toBe(
        'Selly Base API is running with full TypeORM entities and Companies API!',
      );
    });
  });
});
