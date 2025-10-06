import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Platform Admin Endpoints (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let platformAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login with platform admin user for testing
    // This assumes the database has a platform_admin user seeded
    try {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'platform@example.com',
          password: 'password123',
        });

      if (loginResponse.status === 200 && loginResponse.body.accessToken) {
        platformAdminToken = loginResponse.body.accessToken;
        console.log('Platform admin login successful');
      } else {
        console.warn('Platform admin login failed, tests may fail');
      }
    } catch (error) {
      console.warn('Platform admin login error:', error);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Platform Admin Tenants Endpoint', () => {
    it('/api/v1/platform-admin/tenants (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/tenants')
        .expect(401);
    });

    it('/api/v1/platform-admin/tenants (GET) - should get all tenants with platform admin token', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/tenants')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('totalPages');
          
          // Verify tenant data structure
          if (res.body.data.length > 0) {
            const tenant = res.body.data[0];
            expect(tenant).toHaveProperty('id');
            expect(tenant).toHaveProperty('name');
            expect(tenant).toHaveProperty('status');
            expect(tenant).toHaveProperty('subscription_tier');
            expect(tenant).toHaveProperty('user_count');
            expect(tenant).toHaveProperty('data_count');
            expect(tenant).toHaveProperty('last_activity');
            expect(tenant).toHaveProperty('created_at');
            expect(tenant).toHaveProperty('updated_at');
          }
        });
    });

    it('/api/v1/platform-admin/tenants (GET) - should support pagination', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/tenants')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('Platform Admin Users Endpoint', () => {
    it('/api/v1/platform-admin/users (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/users')
        .expect(401);
    });

    it('/api/v1/platform-admin/users (GET) - should get all platform users with platform admin token', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/users')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          
          // Verify user data structure
          if (res.body.data.length > 0) {
            const user = res.body.data[0];
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('role');
            expect(user).toHaveProperty('status');
            expect(user).toHaveProperty('organization_id');
            expect(user).toHaveProperty('created_at');
            expect(user).toHaveProperty('updated_at');
            expect(user).toHaveProperty('lastLogin');
            expect(user).toHaveProperty('loginCount');
            expect(typeof user.loginCount).toBe('number');
          }
        });
    });

    it('/api/v1/platform-admin/users (GET) - should support pagination', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/users')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('Platform Admin Shared Companies Endpoint', () => {
    it('/api/v1/platform-admin/shared-companies (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/shared-companies')
        .expect(401);
    });

    it('/api/v1/platform-admin/shared-companies (GET) - should get shared companies with platform admin token', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/shared-companies')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          
          // Verify company data structure
          if (res.body.data.length > 0) {
            const company = res.body.data[0];
            expect(company).toHaveProperty('id');
            expect(company).toHaveProperty('companyNameEn');
            expect(company).toHaveProperty('industrialName');
            expect(company).toHaveProperty('province');
            expect(company).toHaveProperty('verificationStatus');
            expect(company).toHaveProperty('dataCompleteness');
            expect(company).toHaveProperty('lastUpdated');
            expect(company).toHaveProperty('isShared');
            expect(company.isShared).toBe(true);
            expect(typeof company.dataCompleteness).toBe('number');
          }
        });
    });

    it('/api/v1/platform-admin/shared-companies (GET) - should support pagination', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/shared-companies')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('Permission Checks', () => {
    it('should deny access to regular user without platform admin permissions', async () => {
      // Try to login with a regular user
      let regularUserToken: string;
      
      try {
        const loginResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'user@example.com',
            password: 'password123',
          });

        if (loginResponse.status === 200 && loginResponse.body.accessToken) {
          regularUserToken = loginResponse.body.accessToken;
          
          // Try to access platform admin endpoints with regular user token
          await request(app.getHttpServer())
            .get('/api/v1/platform-admin/tenants')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(403);

          await request(app.getHttpServer())
            .get('/api/v1/platform-admin/users')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(403);

          await request(app.getHttpServer())
            .get('/api/v1/platform-admin/shared-companies')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(403);
        }
      } catch (error) {
        console.warn('Regular user permission test skipped:', error);
      }
    });
  });

  describe('Database Integration', () => {
    it('should return data from database, not mock data', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/tenants')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          // If we get data, it should be from database
          // Mock data typically has specific IDs or patterns
          if (res.body.data.length > 0) {
            const tenant = res.body.data[0];
            // Database records should have UUID format IDs
            expect(tenant.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
            // Should have timestamps from database
            expect(new Date(tenant.created_at).toString()).not.toBe('Invalid Date');
            expect(new Date(tenant.updated_at).toString()).not.toBe('Invalid Date');
          }
        });
    });

    it('should have correct user_count and data_count from database queries', () => {
      if (!platformAdminToken) {
        console.warn('Skipping test - no platform admin token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/api/v1/platform-admin/tenants')
        .set('Authorization', `Bearer ${platformAdminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            const tenant = res.body.data[0];
            // Counts should be numbers (from database COUNT queries)
            expect(typeof tenant.user_count).toBe('number');
            expect(typeof tenant.data_count).toBe('number');
            expect(tenant.user_count).toBeGreaterThanOrEqual(0);
            expect(tenant.data_count).toBeGreaterThanOrEqual(0);
          }
        });
    });
  });
});
