import { test, expect, request } from '@playwright/test';
import { ApiTestHelper, AuthHelper } from './helpers/api-test-helpers';

/**
 * API Endpoints E2E Tests using Playwright
 * 
 * These tests verify all backend API endpoints using Playwright's API testing capabilities.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

test.describe('API Endpoints (Playwright e2e)', () => {
  let apiHelper: ApiTestHelper;
  let authHelper: AuthHelper;

  test.beforeAll(async () => {
    const requestContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    apiHelper = new ApiTestHelper(requestContext);
    authHelper = new AuthHelper();
  });

  test.describe('Health Check', () => {
    test('/health (GET)', async () => {
      const response = await apiHelper.get('/health');
      apiHelper.assertStatus(response, 200);
    });
  });

  test.describe('Auth Endpoints', () => {
    test('/api/v1/auth/login (POST) - should login with demo user', async () => {
      const response = await apiHelper.post('/api/v1/auth/login', {
        data: {
          email: 'demo@example.com',
          password: 'demo123',
        },
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'accessToken');
      authHelper.setToken(response.body.accessToken);
    });

    test('/api/v1/auth/me (GET) - should get current user', async () => {
      const response = await apiHelper.get('/api/v1/auth/me', {
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertHasProperty(response, 'email');
    });
  });

  test.describe('Companies Endpoints', () => {
    test('/api/v1/companies (GET) - should get companies list', async () => {
      const response = await apiHelper.get('/api/v1/companies', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');
    });

    test('/api/v1/companies (GET) - should filter companies by keyword', async () => {
      const response = await apiHelper.get('/api/v1/companies', {
        query: { keyword: 'Tech', page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertIsArray(response, 'data');
    });
  });

  test.describe('Exports Endpoints', () => {
    test('/api/v1/exports (GET) - should get export jobs', async () => {
      const response = await apiHelper.get('/api/v1/exports', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');
    });

    test('/api/v1/exports/:id (GET) - should get export job by id', async () => {
      const response = await apiHelper.get('/api/v1/exports/1');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertPropertyValue(response, 'id', '1');
    });

    test('/api/v1/exports (POST) - should create export job', async () => {
      const response = await apiHelper.post('/api/v1/exports', {
        data: {
          filename: 'test-export.csv',
          scope: 'Test Export',
          format: 'CSV',
        },
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      expect(response.body.status).toBe('queued');
    });
  });

  test.describe('Imports Endpoints', () => {
    test('/api/v1/imports (GET) - should get import jobs', async () => {
      const response = await apiHelper.get('/api/v1/imports', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');
    });

    test('/api/v1/imports/:id (GET) - should get import job by id', async () => {
      const response = await apiHelper.get('/api/v1/imports/1');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertPropertyValue(response, 'id', '1');
    });

    test('/api/v1/imports (POST) - should create import job', async () => {
      const response = await apiHelper.post('/api/v1/imports', {
        data: {
          filename: 'test-import.csv',
          uploadedBy: 'test@example.com',
        },
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      expect(response.body.status).toBe('queued');
    });
  });

  test.describe('Staff Endpoints', () => {
    test('/api/v1/staff (GET) - should get staff members', async () => {
      const response = await apiHelper.get('/api/v1/staff', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');
    });
  });

  test.describe('Reports Endpoints', () => {
    test('/api/v1/reports/dashboard (GET) - should get dashboard analytics', async () => {
      const response = await apiHelper.get('/api/v1/reports/dashboard');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'totalCompanies');
      apiHelper.assertHasProperty(response, 'totalLists');
      apiHelper.assertHasProperty(response, 'dataQualityScore');
    });

    test('/api/v1/reports/data-quality (GET) - should get data quality metrics', async () => {
      const response = await apiHelper.get('/api/v1/reports/data-quality');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'overallScore');
      apiHelper.assertHasProperty(response, 'metrics');
    });

    test('/api/v1/reports/user-activity (GET) - should get user activity reports', async () => {
      const response = await apiHelper.get('/api/v1/reports/user-activity');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'totalSessions');
      apiHelper.assertHasProperty(response, 'uniqueUsers');
    });

    test('/api/v1/reports/export-history (GET) - should get export history reports', async () => {
      const response = await apiHelper.get('/api/v1/reports/export-history');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'totalExports');
      apiHelper.assertHasProperty(response, 'formatBreakdown');
    });
  });
});
