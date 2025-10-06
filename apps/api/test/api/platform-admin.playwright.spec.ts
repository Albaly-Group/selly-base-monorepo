import { test, expect, request } from '@playwright/test';
import { ApiTestHelper, AuthHelper } from './helpers/api-test-helpers';

/**
 * Platform Admin Endpoints E2E Tests using Playwright
 * 
 * These tests verify platform admin API endpoints using Playwright's API testing capabilities.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

test.describe('Platform Admin Endpoints (Playwright e2e)', () => {
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

    // Login with platform admin user for testing
    try {
      const loginResponse = await apiHelper.post('/api/v1/auth/login', {
        data: {
          email: 'platform@example.com',
          password: 'password123',
        },
      });

      if (loginResponse.status === 200 && loginResponse.body.accessToken) {
        authHelper.setToken(loginResponse.body.accessToken);
        console.log('Platform admin login successful');
      } else {
        console.warn('Platform admin login failed, tests may fail');
      }
    } catch (error) {
      console.warn('Platform admin login error:', error);
    }
  });

  test.describe('Platform Admin Tenants Endpoint', () => {
    test('/api/v1/platform-admin/tenants (GET) - should require authentication', async () => {
      const response = await apiHelper.get('/api/v1/platform-admin/tenants');
      apiHelper.assertStatus(response, 401);
    });

    test('/api/v1/platform-admin/tenants (GET) - should get all tenants with platform admin token', async () => {
      if (!authHelper.getToken()) {
        console.warn('Skipping test - no platform admin token available');
        test.skip();
        return;
      }

      const response = await apiHelper.get('/api/v1/platform-admin/tenants', {
        query: { page: 1, limit: 10 },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');

      // Verify tenant data structure
      if (response.body.data.length > 0) {
        const tenant = response.body.data[0];
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

    test('/api/v1/platform-admin/tenants (GET) - should support pagination', async () => {
      if (!authHelper.getToken()) {
        console.warn('Skipping test - no platform admin token available');
        test.skip();
        return;
      }

      const response = await apiHelper.get('/api/v1/platform-admin/tenants', {
        query: { page: 1, limit: 5 },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  test.describe('Platform Admin Users Endpoint', () => {
    test('/api/v1/platform-admin/users (GET) - should require authentication', async () => {
      const response = await apiHelper.get('/api/v1/platform-admin/users');
      apiHelper.assertStatus(response, 401);
    });

    test('/api/v1/platform-admin/users (GET) - should get all platform users with platform admin token', async () => {
      if (!authHelper.getToken()) {
        console.warn('Skipping test - no platform admin token available');
        test.skip();
        return;
      }

      const response = await apiHelper.get('/api/v1/platform-admin/users', {
        query: { page: 1, limit: 10 },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      // Verify user data structure
      if (response.body.data.length > 0) {
        const user = response.body.data[0];
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

    test('/api/v1/platform-admin/users (GET) - should support pagination', async () => {
      if (!authHelper.getToken()) {
        console.warn('Skipping test - no platform admin token available');
        test.skip();
        return;
      }

      const response = await apiHelper.get('/api/v1/platform-admin/users', {
        query: { page: 1, limit: 5 },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  test.describe('Platform Admin Shared Companies Endpoint', () => {
    test('/api/v1/platform-admin/shared-companies (GET) - should require authentication', async () => {
      const response = await apiHelper.get('/api/v1/platform-admin/shared-companies');
      apiHelper.assertStatus(response, 401);
    });

    test('/api/v1/platform-admin/shared-companies (GET) - should get shared companies with platform admin token', async () => {
      if (!authHelper.getToken()) {
        console.warn('Skipping test - no platform admin token available');
        test.skip();
        return;
      }

      const response = await apiHelper.get('/api/v1/platform-admin/shared-companies', {
        query: { page: 1, limit: 10 },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      // Verify company data structure
      if (response.body.data.length > 0) {
        const company = response.body.data[0];
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

    test('/api/v1/platform-admin/shared-companies (GET) - should support pagination', async () => {
      if (!authHelper.getToken()) {
        console.warn('Skipping test - no platform admin token available');
        test.skip();
        return;
      }

      const response = await apiHelper.get('/api/v1/platform-admin/shared-companies', {
        query: { page: 1, limit: 5 },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });
});
