import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * E2E Tests with Real Docker Database
 * 
 * These tests verify all backend endpoints work correctly with a real PostgreSQL database.
 * 
 * Prerequisites:
 * 1. Docker must be running
 * 2. Run: npm run test:e2e:setup (to start test database)
 * 3. Run: npm run test:e2e:docker (to run these tests)
 * 
 * After tests:
 * - Run: npm run test:e2e:cleanup (to stop test database)
 */

describe('Backend API with Docker Database (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let companyId: string;
  let listId: string;
  let exportJobId: string;
  let importJobId: string;
  let staffId: string;

  beforeAll(async () => {
    // Verify database environment is set
    if (process.env.SKIP_DATABASE === 'true') {
      throw new Error(
        'SKIP_DATABASE is true. These tests require a real database. ' +
        'Run: npm run test:e2e:setup first'
      );
    }

    console.log('🔧 Initializing test application...');
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Set global prefix for API routes (must match main.ts)
    app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health', 'docs', 'docs/(.*)'],
    });
    
    // Add validation pipe like in production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    
    // Enable CORS
    app.enableCors();
    
    await app.init();
    
    console.log('✅ Test application initialized');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test application...');
    await app.close();
  });

  describe('1. Health Check', () => {
    it('should return healthy status with database connected', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
      
      console.log('✓ Health check passed:', response.body);
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('should reject login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@albaly.com',
          password: 'password',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'admin@albaly.com');
      expect(response.body.user).toHaveProperty('organizationId');

      authToken = response.body.accessToken;
      userId = response.body.user.id;
      organizationId = response.body.user.organizationId;
      
      console.log('✓ Login successful, token obtained');
      console.log('  User ID:', userId);
      console.log('  Organization ID:', organizationId);
    });

    it('should get current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('organizationId', organizationId);
      
      console.log('✓ User profile retrieved');
    });

    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('3. Companies Module', () => {
    it('should get companies list with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          page: 1, 
          limit: 10,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('total');
      
      console.log(`✓ Found ${response.body.data.length} companies`);
      
      if (response.body.data.length > 0) {
        companyId = response.body.data[0].id;
      }
    });

    it('should search companies by keyword', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          keyword: 'tech', 
          page: 1, 
          limit: 10,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Search found ${response.body.data.length} companies with keyword "tech"`);
    });

    it('should filter companies by industry', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          industry: 'Technology', 
          page: 1, 
          limit: 10,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get company by ID', async () => {
      if (!companyId) {
        console.log('⊘ Skipping - no company ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/companies/${companyId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', companyId);
      expect(response.body).toHaveProperty('nameEn');
      
      console.log(`✓ Retrieved company: ${response.body.nameEn}`);
    });

    it('should create a new company', async () => {
      const newCompany = {
        companyNameEn: 'Test Company E2E',
        companyNameTh: 'บริษัททดสอบ',
        businessDescription: 'Test company created by E2E tests',
        websiteUrl: 'https://test-company.example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCompany)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('companyNameEn', newCompany.companyNameEn);
      
      companyId = response.body.id;
      console.log(`✓ Created company with ID: ${companyId}`);
    });

    it('should update a company', async () => {
      if (!companyId) {
        console.log('⊘ Skipping - no company ID available');
        return;
      }

      const updates = {
        businessDescription: 'Updated description from E2E test',
        websiteUrl: 'https://updated-test-company.example.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/companies/${companyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('id', companyId);
      expect(response.body.businessDescription).toContain('Updated');
      
      console.log('✓ Company updated successfully');
    });
  });

  describe('4. Company Lists Module', () => {
    it('should get company lists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/company-lists')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Found ${response.body.data.length} company lists`);
    });

    it('should create a new company list', async () => {
      const newList = {
        name: 'E2E Test List',
        description: 'List created by E2E tests',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/company-lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newList)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newList.name);
      
      listId = response.body.id;
      console.log(`✓ Created list with ID: ${listId}`);
    });

    it('should get company list by ID', async () => {
      if (!listId) {
        console.log('⊘ Skipping - no list ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/company-lists/${listId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', listId);
      expect(response.body).toHaveProperty('name', 'E2E Test List');
      
      console.log('✓ Retrieved company list by ID successfully');
    });

    it('should add company to list', async () => {
      if (!listId || !companyId) {
        console.log('⊘ Skipping - no list or company ID available');
        return;
      }

      await request(app.getHttpServer())
        .post(`/api/v1/company-lists/${listId}/companies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ companyIds: [companyId] })
        .expect(200);
      
      console.log('✓ Added company to list');
    });

    it('should get companies in list', async () => {
      if (!listId) {
        console.log('⊘ Skipping - no list ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/company-lists/${listId}/items`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ List contains ${response.body.data.length} companies`);
    });
  });

  describe('5. Exports Module', () => {
    it('should get export jobs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/exports')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Found ${response.body.data.length} export jobs`);
    });

    it('should create export job', async () => {
      const exportJob = {
        filename: 'e2e-test-export.csv',
        scope: 'E2E Test Export',
        format: 'CSV',
        organizationId,
        requestedBy: userId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/exports')
        .send(exportJob)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      
      exportJobId = response.body.id;
      console.log(`✓ Created export job with ID: ${exportJobId}`);
    });

    it('should get export job by ID', async () => {
      if (!exportJobId) {
        console.log('⊘ Skipping - no export job ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/exports/${exportJobId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', exportJobId);
      
      console.log('✓ Retrieved export job details');
    });

    it('should filter export jobs by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/exports')
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('6. Imports Module', () => {
    it('should get import jobs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/imports')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Found ${response.body.data.length} import jobs`);
    });

    it('should create import job', async () => {
      const importJob = {
        filename: 'e2e-test-import.csv',
        organizationId,
        uploadedBy: userId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/imports')
        .send(importJob)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      
      importJobId = response.body.id;
      console.log(`✓ Created import job with ID: ${importJobId}`);
    });

    it('should get import job by ID', async () => {
      if (!importJobId) {
        console.log('⊘ Skipping - no import job ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/imports/${importJobId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', importJobId);
      
      console.log('✓ Retrieved import job details');
    });

    it('should validate import data', async () => {
      if (!importJobId) {
        console.log('⊘ Skipping - no import job ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/imports/${importJobId}/validate`)
        .expect(201);

      expect(response.body).toHaveProperty('status');
      
      console.log('✓ Import validation completed');
    });
  });

  describe('7. Staff Module', () => {
    it('should get staff members', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/staff')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Found ${response.body.data.length} staff members`);
    });

    it('should create staff member', async () => {
      const staffMember = {
        name: 'E2E Test Staff',
        email: `e2e-staff-${Date.now()}@test.com`,
        role: 'member',
        department: 'Testing',
        organizationId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/staff')
        .send(staffMember)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', staffMember.name);
      
      staffId = response.body.id;
      console.log(`✓ Created staff member with ID: ${staffId}`);
    });

    it('should get staff member by ID', async () => {
      if (!staffId) {
        console.log('⊘ Skipping - no staff ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/staff/${staffId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', staffId);
      
      console.log('✓ Retrieved staff member details');
    });

    it('should update staff member', async () => {
      if (!staffId) {
        console.log('⊘ Skipping - no staff ID available');
        return;
      }

      const updates = {
        department: 'Updated Department',
      };

      await request(app.getHttpServer())
        .put(`/api/v1/staff/${staffId}`)
        .send(updates)
        .expect(200);
      
      console.log('✓ Staff member updated');
    });
  });

  describe('8. Reports Module', () => {
    it('should get dashboard analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('totalCompanies');
      expect(response.body).toHaveProperty('totalLists');
      expect(response.body).toHaveProperty('dataQualityScore');
      expect(typeof response.body.totalCompanies).toBe('number');
      
      console.log('✓ Dashboard analytics:', {
        companies: response.body.totalCompanies,
        lists: response.body.totalLists,
        quality: response.body.dataQualityScore,
      });
    });

    it('should get data quality metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/data-quality')
        .expect(200);

      expect(response.body).toHaveProperty('overallScore');
      expect(response.body).toHaveProperty('metrics');
      expect(Array.isArray(response.body.metrics)).toBe(true);
      
      console.log(`✓ Data quality score: ${response.body.overallScore}`);
    });

    it('should get user activity reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/user-activity')
        .expect(200);

      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('uniqueUsers');
      
      console.log('✓ User activity tracked');
    });

    it('should get export history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/reports/export-history')
        .expect(200);

      expect(response.body).toHaveProperty('totalExports');
      expect(response.body).toHaveProperty('formatBreakdown');
      
      console.log(`✓ Export history: ${response.body.totalExports} total exports`);
    });
  });

  describe('9. Admin Module', () => {
    it('should get organization users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Found ${response.body.data.length} users in organization`);
    });

    it('should get organization policies', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/policies')
        .expect(200);

      expect(response.body).toHaveProperty('dataRetention');
      expect(response.body).toHaveProperty('accessControl');
      
      console.log('✓ Organization policies retrieved');
    });

    it('should get integration settings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/integrations')
        .expect(200);

      expect(response.body).toHaveProperty('databases');
      expect(response.body).toHaveProperty('apis');
      
      console.log('✓ Integration settings retrieved');
    });

    it('should get activity logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/activity-logs')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      console.log(`✓ Retrieved ${response.body.data.length} activity logs`);
    });
  });

  describe('10. Data Integrity & Business Logic', () => {
    it('should maintain data consistency across operations', async () => {
      // Get initial company count
      const initialResponse = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          page: 1, 
          limit: 1,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      const initialTotal = initialResponse.body.pagination.total;

      // Create a new company
      const newCompany = {
        companyNameEn: 'Data Integrity Test Company',
        businessDescription: 'Testing data integrity',
      };

      await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCompany)
        .expect(201);

      // Verify count increased
      const afterResponse = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          page: 1, 
          limit: 1,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      const afterTotal = afterResponse.body.pagination.total;

      expect(afterTotal).toBe(initialTotal + 1);
      
      console.log(`✓ Data consistency maintained (${initialTotal} -> ${afterTotal})`);
    });

    it('should enforce organization isolation', async () => {
      // All data should be scoped to the logged-in user's organization
      const companiesResponse = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          page: 1, 
          limit: 100,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      const companies = companiesResponse.body.data;
      
      // Check that companies with organizationId all match the user's org
      const companiesWithOrg = companies.filter((c: any) => c.organizationId);
      const matchingOrg = companiesWithOrg.every(
        (c: any) => c.organizationId === organizationId
      );

      expect(matchingOrg).toBe(true);
      
      console.log('✓ Organization isolation enforced');
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          page: 1, 
          limit: 5,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/companies')
        .query({ 
          page: 2, 
          limit: 5,
          organizationId: organizationId || '550e8400-e29b-41d4-a716-446655440000',
          includeSharedData: 'true'
        })
        .expect(200);

      // If there are enough records, pages should be different
      if (page1.body.pagination.total > 5) {
        const page1Ids = page1.body.data.map((c: any) => c.id);
        const page2Ids = page2.body.data.map((c: any) => c.id);
        
        const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id));
        expect(hasOverlap).toBe(false);
      }
      
      console.log('✓ Pagination works correctly');
    });
  });
});
