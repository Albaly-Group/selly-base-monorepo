import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer()).get('/health').expect(200);
    });
  });

  describe('Auth Endpoints', () => {
    it('/api/v1/auth/login (POST) - should login with demo user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'demo123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          authToken = res.body.accessToken;
        });
    });

    it('/api/v1/auth/me (GET) - should get current user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });
  });

  describe('Companies Endpoints', () => {
    it('/api/v1/companies (GET) - should get companies list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/api/v1/companies (GET) - should filter companies by keyword', () => {
      return request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ keyword: 'Tech', page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Exports Endpoints', () => {
    it('/api/v1/exports (GET) - should get export jobs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/exports')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/api/v1/exports/:id (GET) - should get export job by id', () => {
      return request(app.getHttpServer())
        .get('/api/v1/exports/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe('1');
        });
    });

    it('/api/v1/exports (POST) - should create export job', () => {
      return request(app.getHttpServer())
        .post('/api/v1/exports')
        .send({
          filename: 'test-export.csv',
          scope: 'Test Export',
          format: 'CSV',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('queued');
        });
    });
  });

  describe('Imports Endpoints', () => {
    it('/api/v1/imports (GET) - should get import jobs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/imports')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/api/v1/imports/:id (GET) - should get import job by id', () => {
      return request(app.getHttpServer())
        .get('/api/v1/imports/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe('1');
        });
    });

    it('/api/v1/imports (POST) - should create import job', () => {
      return request(app.getHttpServer())
        .post('/api/v1/imports')
        .send({
          filename: 'test-import.csv',
          uploadedBy: 'test@example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('queued');
        });
    });
  });

  describe('Staff Endpoints', () => {
    it('/api/v1/staff (GET) - should get staff members', () => {
      return request(app.getHttpServer())
        .get('/api/v1/staff')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Reports Endpoints', () => {
    it('/api/v1/reports/dashboard (GET) - should get dashboard analytics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/dashboard')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCompanies');
          expect(res.body).toHaveProperty('totalLists');
          expect(res.body).toHaveProperty('dataQualityScore');
        });
    });

    it('/api/v1/reports/data-quality (GET) - should get data quality metrics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/data-quality')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('overallScore');
          expect(res.body).toHaveProperty('metrics');
        });
    });

    it('/api/v1/reports/user-activity (GET) - should get user activity reports', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/user-activity')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalSessions');
          expect(res.body).toHaveProperty('uniqueUsers');
        });
    });

    it('/api/v1/reports/export-history (GET) - should get export history reports', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reports/export-history')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalExports');
          expect(res.body).toHaveProperty('formatBreakdown');
        });
    });
  });

  describe('Admin Endpoints', () => {
    it('/api/v1/admin/users (GET) - should get organization users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/api/v1/admin/policies (GET) - should get organization policies', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/policies')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('dataRetention');
          expect(res.body).toHaveProperty('accessControl');
        });
    });

    it('/api/v1/admin/integrations (GET) - should get integration settings', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/integrations')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('databases');
          expect(res.body).toHaveProperty('apis');
        });
    });
  });

  describe('Company Lists Endpoints', () => {
    it('/api/v1/company-lists (GET) - should get company lists', () => {
      return request(app.getHttpServer())
        .get('/api/v1/company-lists')
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
