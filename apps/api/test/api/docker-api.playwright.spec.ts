import { test, expect, request } from '@playwright/test';
import { ApiTestHelper, AuthHelper, TestDataHelper } from './helpers/api-test-helpers';

/**
 * E2E Tests with Real Docker Database using Playwright
 *
 * These tests verify all backend endpoints work correctly with a real PostgreSQL database.
 *
 * Prerequisites:
 * 1. Docker must be running
 * 2. Run: npm run test:e2e:setup (to start test database)
 * 3. Run: npx playwright test docker-e2e.playwright.spec.ts (to run these tests)
 *
 * After tests:
 * - Run: npm run test:e2e:cleanup (to stop test database)
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

test.describe('Backend API with Docker Database (Playwright e2e)', () => {
  let apiHelper: ApiTestHelper;
  let authHelper: AuthHelper;
  let testData: TestDataHelper;

  test.beforeAll(async () => {
    // Verify database environment is set
    if (process.env.SKIP_DATABASE === 'true') {
      throw new Error(
        'SKIP_DATABASE is true. These tests require a real database. ' +
          'Run: npm run test:e2e:setup first',
      );
    }

    console.log('🔧 Initializing Playwright API test context...');
    
    const requestContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    apiHelper = new ApiTestHelper(requestContext);
    authHelper = new AuthHelper();
    testData = new TestDataHelper();

    console.log('✅ Playwright API test context initialized');
  });

  test.describe('1. Health Check', () => {
    test('should return healthy status with database connected', async () => {
      const response = await apiHelper.get('/health');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'status', 'ok');
      apiHelper.assertPropertyValue(response, 'database', 'connected');
      apiHelper.assertHasProperty(response, 'timestamp');

      console.log('✓ Health check passed:', response.body);
    });
  });

  test.describe('2. Authentication & Authorization', () => {
    test('should reject login with invalid credentials', async () => {
      const response = await apiHelper.post('/api/v1/auth/login', {
        data: {
          email: 'invalid@example.com',
          password: 'wrongpassword',
        },
      });

      apiHelper.assertStatus(response, 401);
    });

    test('should login with valid credentials', async () => {
      const response = await apiHelper.post('/api/v1/auth/login', {
        data: {
          email: 'admin@albaly.com',
          password: 'password',
        },
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'accessToken');
      apiHelper.assertHasProperty(response, 'user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'admin@albaly.com');
      expect(response.body.user).toHaveProperty('organizationId');

      // Store auth token and IDs for subsequent tests
      authHelper.setToken(response.body.accessToken);
      testData.set('userId', response.body.user.id);
      testData.set('organizationId', response.body.user.organizationId);

      console.log('✓ Login successful, token obtained');
      console.log('  User ID:', testData.get('userId'));
      console.log('  Organization ID:', testData.get('organizationId'));
    });

    test('should get current user with valid token', async () => {
      const response = await apiHelper.get('/api/v1/auth/me', {
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', testData.get('userId'));
      apiHelper.assertHasProperty(response, 'email');
      apiHelper.assertHasProperty(response, 'name');
      apiHelper.assertPropertyValue(response, 'organizationId', testData.get('organizationId'));

      console.log('✓ User profile retrieved');
    });

    test('should reject requests without token', async () => {
      const response = await apiHelper.get('/api/v1/auth/me');
      apiHelper.assertStatus(response, 401);
    });

    test('should reject requests with invalid token', async () => {
      const response = await apiHelper.get('/api/v1/auth/me', {
        headers: { 'Authorization': 'Bearer invalid-token' },
      });
      apiHelper.assertStatus(response, 401);
    });
  });

  test.describe('3. Companies Module', () => {
    test('should get companies list with pagination', async () => {
      const response = await apiHelper.get('/api/v1/companies', {
        query: {
          page: 1,
          limit: 10,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('total');

      console.log(`✓ Found ${response.body.data.length} companies`);

      if (response.body.data.length > 0) {
        testData.set('companyId', response.body.data[0].id);
      }
    });

    test('should search companies by keyword', async () => {
      const response = await apiHelper.get('/api/v1/companies', {
        query: {
          keyword: 'tech',
          page: 1,
          limit: 10,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertIsArray(response, 'data');

      console.log(
        `✓ Search found ${response.body.data.length} companies with keyword "tech"`,
      );
    });

    test('should filter companies by industry', async () => {
      const response = await apiHelper.get('/api/v1/companies', {
        query: {
          industry: 'Technology',
          page: 1,
          limit: 10,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertIsArray(response, 'data');
    });

    test('should get company by ID', async () => {
      const companyId = testData.get('companyId');
      if (!companyId) {
        console.log('⊘ Skipping - no company ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.get(`/api/v1/companies/${companyId}`);

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', companyId);
      apiHelper.assertHasProperty(response, 'nameEn');

      console.log(`✓ Retrieved company: ${response.body.nameEn}`);
    });

    test('should create a new company', async () => {
      const newCompany = {
        companyNameEn: 'Test Company E2E',
        companyNameTh: 'บริษัททดสอบ',
        businessDescription: 'Test company created by E2E tests',
        websiteUrl: 'https://test-company.example.com',
      };

      const response = await apiHelper.post('/api/v1/companies', {
        data: newCompany,
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertPropertyValue(response, 'companyNameEn', newCompany.companyNameEn);

      testData.set('companyId', response.body.id);
      console.log(`✓ Created company with ID: ${response.body.id}`);
    });

    test('should update a company', async () => {
      const companyId = testData.get('companyId');
      if (!companyId) {
        console.log('⊘ Skipping - no company ID available');
        test.skip();
        return;
      }

      const updates = {
        businessDescription: 'Updated description from E2E test',
        websiteUrl: 'https://updated-test-company.example.com',
      };

      const response = await apiHelper.put(`/api/v1/companies/${companyId}`, {
        data: updates,
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', companyId);
      expect(response.body.businessDescription).toContain('Updated');

      console.log('✓ Company updated successfully');
    });
  });

  test.describe('4. Company Lists Module', () => {
    test('should get company lists', async () => {
      const response = await apiHelper.get('/api/v1/company-lists', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ Found ${response.body.data.length} company lists`);
    });

    test('should create a new company list', async () => {
      const newList = {
        name: 'E2E Test List',
        description: 'List created by E2E tests',
      };

      const response = await apiHelper.post('/api/v1/company-lists', {
        data: newList,
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertPropertyValue(response, 'name', newList.name);

      testData.set('listId', response.body.id);
      console.log(`✓ Created list with ID: ${response.body.id}`);
    });

    test('should get company list by ID', async () => {
      const listId = testData.get('listId');
      if (!listId) {
        console.log('⊘ Skipping - no list ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.get(`/api/v1/company-lists/${listId}`);

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', listId);
      apiHelper.assertPropertyValue(response, 'name', 'E2E Test List');

      console.log('✓ Retrieved company list by ID successfully');
    });

    test('should add company to list', async () => {
      const listId = testData.get('listId');
      const companyId = testData.get('companyId');
      
      if (!listId || !companyId) {
        console.log('⊘ Skipping - no list or company ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.post(`/api/v1/company-lists/${listId}/companies`, {
        data: { companyIds: [companyId] },
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(response, 200);
      console.log('✓ Added company to list');
    });

    test('should get companies in list', async () => {
      const listId = testData.get('listId');
      if (!listId) {
        console.log('⊘ Skipping - no list ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.get(`/api/v1/company-lists/${listId}/items`);

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ List contains ${response.body.data.length} companies`);
    });
  });

  test.describe('5. Exports Module', () => {
    test('should get export jobs', async () => {
      const response = await apiHelper.get('/api/v1/exports', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ Found ${response.body.data.length} export jobs`);
    });

    test('should create export job', async () => {
      const exportJob = {
        filename: 'e2e-test-export.csv',
        scope: 'E2E Test Export',
        format: 'CSV',
        organizationId: testData.get('organizationId'),
        requestedBy: testData.get('userId'),
      };

      const response = await apiHelper.post('/api/v1/exports', {
        data: exportJob,
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertHasProperty(response, 'status');

      testData.set('exportJobId', response.body.id);
      console.log(`✓ Created export job with ID: ${response.body.id}`);
    });

    test('should get export job by ID', async () => {
      const exportJobId = testData.get('exportJobId');
      if (!exportJobId) {
        console.log('⊘ Skipping - no export job ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.get(`/api/v1/exports/${exportJobId}`);

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', exportJobId);

      console.log('✓ Retrieved export job details');
    });

    test('should filter export jobs by status', async () => {
      const response = await apiHelper.get('/api/v1/exports', {
        query: { status: 'completed' },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertIsArray(response, 'data');
    });
  });

  test.describe('6. Imports Module', () => {
    test('should get import jobs', async () => {
      const response = await apiHelper.get('/api/v1/imports', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ Found ${response.body.data.length} import jobs`);
    });

    test('should create import job', async () => {
      const importJob = {
        filename: 'e2e-test-import.csv',
        organizationId: testData.get('organizationId'),
        uploadedBy: testData.get('userId'),
      };

      const response = await apiHelper.post('/api/v1/imports', {
        data: importJob,
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertHasProperty(response, 'status');

      testData.set('importJobId', response.body.id);
      console.log(`✓ Created import job with ID: ${response.body.id}`);
    });

    test('should get import job by ID', async () => {
      const importJobId = testData.get('importJobId');
      if (!importJobId) {
        console.log('⊘ Skipping - no import job ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.get(`/api/v1/imports/${importJobId}`);

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', importJobId);

      console.log('✓ Retrieved import job details');
    });

    test('should validate import data', async () => {
      const importJobId = testData.get('importJobId');
      if (!importJobId) {
        console.log('⊘ Skipping - no import job ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.post(`/api/v1/imports/${importJobId}/validate`);

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'status');

      console.log('✓ Import validation completed');
    });
  });

  test.describe('7. Staff Module', () => {
    test('should get staff members', async () => {
      const response = await apiHelper.get('/api/v1/staff', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ Found ${response.body.data.length} staff members`);
    });

    test('should create staff member', async () => {
      const staffMember = {
        name: 'E2E Test Staff',
        email: `e2e-staff-${Date.now()}@test.com`,
        role: 'member',
        department: 'Testing',
        organizationId: testData.get('organizationId'),
      };

      const response = await apiHelper.post('/api/v1/staff', {
        data: staffMember,
      });

      apiHelper.assertStatus(response, 201);
      apiHelper.assertHasProperty(response, 'id');
      apiHelper.assertPropertyValue(response, 'name', staffMember.name);

      testData.set('staffId', response.body.id);
      console.log(`✓ Created staff member with ID: ${response.body.id}`);
    });

    test('should get staff member by ID', async () => {
      const staffId = testData.get('staffId');
      if (!staffId) {
        console.log('⊘ Skipping - no staff ID available');
        test.skip();
        return;
      }

      const response = await apiHelper.get(`/api/v1/staff/${staffId}`);

      apiHelper.assertStatus(response, 200);
      apiHelper.assertPropertyValue(response, 'id', staffId);

      console.log('✓ Retrieved staff member details');
    });

    test('should update staff member', async () => {
      const staffId = testData.get('staffId');
      if (!staffId) {
        console.log('⊘ Skipping - no staff ID available');
        test.skip();
        return;
      }

      const updates = {
        department: 'Updated Department',
      };

      const response = await apiHelper.put(`/api/v1/staff/${staffId}`, {
        data: updates,
      });

      apiHelper.assertStatus(response, 200);
      console.log('✓ Staff member updated');
    });
  });

  test.describe('8. Reports Module', () => {
    test('should get dashboard analytics', async () => {
      const response = await apiHelper.get('/api/v1/reports/dashboard');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'totalCompanies');
      apiHelper.assertHasProperty(response, 'totalLists');
      apiHelper.assertHasProperty(response, 'dataQualityScore');
      expect(typeof response.body.totalCompanies).toBe('number');

      console.log('✓ Dashboard analytics:', {
        companies: response.body.totalCompanies,
        lists: response.body.totalLists,
        quality: response.body.dataQualityScore,
      });
    });

    test('should get data quality metrics', async () => {
      const response = await apiHelper.get('/api/v1/reports/data-quality');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'overallScore');
      apiHelper.assertHasProperty(response, 'metrics');
      apiHelper.assertIsArray(response, 'metrics');

      console.log(`✓ Data quality score: ${response.body.overallScore}`);
    });

    test('should get user activity reports', async () => {
      const response = await apiHelper.get('/api/v1/reports/user-activity');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'totalSessions');
      apiHelper.assertHasProperty(response, 'uniqueUsers');

      console.log('✓ User activity tracked');
    });

    test('should get export history', async () => {
      const response = await apiHelper.get('/api/v1/reports/export-history');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'totalExports');
      apiHelper.assertHasProperty(response, 'formatBreakdown');

      console.log(
        `✓ Export history: ${response.body.totalExports} total exports`,
      );
    });
  });

  test.describe('9. Admin Module', () => {
    test('should get organization users', async () => {
      const response = await apiHelper.get('/api/v1/admin/users', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertHasProperty(response, 'pagination');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ Found ${response.body.data.length} users in organization`);
    });

    test('should get organization policies', async () => {
      const response = await apiHelper.get('/api/v1/admin/policies');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'dataRetention');
      apiHelper.assertHasProperty(response, 'accessControl');

      console.log('✓ Organization policies retrieved');
    });

    test('should get integration settings', async () => {
      const response = await apiHelper.get('/api/v1/admin/integrations');

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'databases');
      apiHelper.assertHasProperty(response, 'apis');

      console.log('✓ Integration settings retrieved');
    });

    test('should get activity logs', async () => {
      const response = await apiHelper.get('/api/v1/admin/activity-logs', {
        query: { page: 1, limit: 10 },
      });

      apiHelper.assertStatus(response, 200);
      apiHelper.assertHasProperty(response, 'data');
      apiHelper.assertIsArray(response, 'data');

      console.log(`✓ Retrieved ${response.body.data.length} activity logs`);
    });
  });

  test.describe('10. Data Integrity & Business Logic', () => {
    test('should maintain data consistency across operations', async () => {
      // Get initial company count
      const initialResponse = await apiHelper.get('/api/v1/companies', {
        query: {
          page: 1,
          limit: 1,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(initialResponse, 200);
      const initialTotal = initialResponse.body.pagination.total;

      // Create a new company
      const newCompany = {
        companyNameEn: 'Data Integrity Test Company',
        businessDescription: 'Testing data integrity',
      };

      const createResponse = await apiHelper.post('/api/v1/companies', {
        data: newCompany,
        headers: authHelper.getAuthHeader(),
      });

      apiHelper.assertStatus(createResponse, 201);

      // Verify count increased
      const afterResponse = await apiHelper.get('/api/v1/companies', {
        query: {
          page: 1,
          limit: 1,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(afterResponse, 200);
      const afterTotal = afterResponse.body.pagination.total;

      expect(afterTotal).toBe(initialTotal + 1);

      console.log(
        `✓ Data consistency maintained (${initialTotal} -> ${afterTotal})`,
      );
    });

    test('should enforce organization isolation', async () => {
      const response = await apiHelper.get('/api/v1/companies', {
        query: {
          page: 1,
          limit: 100,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(response, 200);
      const companies = response.body.data;

      // Check that companies with organizationId all match the user's org
      const companiesWithOrg = companies.filter((c: any) => c.organizationId);
      const matchingOrg = companiesWithOrg.every(
        (c: any) => c.organizationId === testData.get('organizationId'),
      );

      expect(matchingOrg).toBe(true);
      console.log('✓ Organization isolation enforced');
    });

    test('should handle pagination correctly', async () => {
      const page1Response = await apiHelper.get('/api/v1/companies', {
        query: {
          page: 1,
          limit: 5,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      const page2Response = await apiHelper.get('/api/v1/companies', {
        query: {
          page: 2,
          limit: 5,
          organizationId: testData.get('organizationId') || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true',
        },
      });

      apiHelper.assertStatus(page1Response, 200);
      apiHelper.assertStatus(page2Response, 200);

      // If there are enough records, pages should be different
      if (page1Response.body.pagination.total > 5) {
        const page1Ids = page1Response.body.data.map((c: any) => c.id);
        const page2Ids = page2Response.body.data.map((c: any) => c.id);

        const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id));
        expect(hasOverlap).toBe(false);
      }

      console.log('✓ Pagination works correctly');
    });
  });
});
