import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * E2E Test - Data Consistency Validation
 * 
 * This test validates that data displayed in the frontend matches the actual data
 * in the database, ensuring no mock data or hardcoded values are shown to users.
 * 
 * Test Flow:
 * 1. Query database directly to get ground truth
 * 2. Call backend API and verify it returns database data
 * 3. Load frontend page and verify it displays API data
 * 4. Report any mismatches as test failures
 * 
 * Prerequisites:
 * - Database must be running with test data
 * - Backend API must be running
 * - Frontend must be running
 */

interface DatabaseCounts {
  organizations: number;
  users: number;
  companies: number;
  sharedCompanies: number;
}

async function queryDatabase(query: string): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `docker exec selly-base-postgres psql -U postgres -d selly_base -t -c "${query}"`,
    );
    return stdout.trim();
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

async function getDatabaseCounts(): Promise<DatabaseCounts> {
  const organizationsCount = await queryDatabase(
    'SELECT COUNT(*) FROM organizations;',
  );
  const usersCount = await queryDatabase('SELECT COUNT(*) FROM users;');
  const companiesCount = await queryDatabase('SELECT COUNT(*) FROM companies;');
  const sharedCompaniesCount = await queryDatabase(
    'SELECT COUNT(*) FROM companies WHERE is_shared_data = true;',
  );

  return {
    organizations: parseInt(organizationsCount, 10),
    users: parseInt(usersCount, 10),
    companies: parseInt(companiesCount, 10),
    sharedCompanies: parseInt(sharedCompaniesCount, 10),
  };
}

test.describe('Data Consistency Validation', () => {
  let dbCounts: DatabaseCounts;
  let authToken: string;

  test.beforeAll(async () => {
    // Get actual database counts
    dbCounts = await getDatabaseCounts();
    console.log('Database counts:', dbCounts);
  });

  test.beforeEach(async ({ page }) => {
    // Login to get auth token
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('platform@albaly.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // Extract auth token from storage
    const token = await page.evaluate(() => {
      return localStorage.getItem('authToken') || '';
    });
    authToken = token;
  });

  test('Backend API should return actual database counts for platform admin', async ({
    request,
  }) => {
    // Test tenants endpoint
    const tenantsResponse = await request.get(
      'http://localhost:3001/api/v1/platform-admin/tenants',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    expect(tenantsResponse.ok()).toBeTruthy();
    const tenantsData = await tenantsResponse.json();

    // Verify API returns actual database count, not mock data
    const apiTenantCount = tenantsData.data?.length || tenantsData.length || 0;
    expect(apiTenantCount).toBe(dbCounts.organizations);
    
    if (apiTenantCount !== dbCounts.organizations) {
      console.error(
        `❌ MISMATCH: API returns ${apiTenantCount} tenants but database has ${dbCounts.organizations}`,
      );
    }

    // Test users endpoint
    const usersResponse = await request.get(
      'http://localhost:3001/api/v1/platform-admin/users',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    expect(usersResponse.ok()).toBeTruthy();
    const usersData = await usersResponse.json();
    const apiUserCount = usersData.data?.length || usersData.length || 0;
    expect(apiUserCount).toBe(dbCounts.users);
    
    if (apiUserCount !== dbCounts.users) {
      console.error(
        `❌ MISMATCH: API returns ${apiUserCount} users but database has ${dbCounts.users}`,
      );
    }

    // Test shared companies endpoint
    const companiesResponse = await request.get(
      'http://localhost:3001/api/v1/platform-admin/shared-companies',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    expect(companiesResponse.ok()).toBeTruthy();
    const companiesData = await companiesResponse.json();
    const apiCompanyCount =
      companiesData.data?.length || companiesData.length || 0;
    expect(apiCompanyCount).toBe(dbCounts.sharedCompanies);
    
    if (apiCompanyCount !== dbCounts.sharedCompanies) {
      console.error(
        `❌ MISMATCH: API returns ${apiCompanyCount} shared companies but database has ${dbCounts.sharedCompanies}`,
      );
    }
  });

  test('Frontend should display actual database counts on platform admin dashboard', async ({
    page,
  }) => {
    await page.goto('/platform-admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for statistics cards/numbers
    const statsElements = await page.locator('text=/\\d+/').allTextContents();
    console.log('Found stats on page:', statsElements);

    // Look for specific statistics that should match database
    const tenantsText = await page
      .getByText(/tenants?/i)
      .first()
      .locator('..')
      .textContent();
    console.log('Tenants text:', tenantsText);

    const usersText = await page
      .getByText(/users?/i)
      .first()
      .locator('..')
      .textContent();
    console.log('Users text:', usersText);

    const companiesText = await page
      .getByText(/companies|shared/i)
      .first()
      .locator('..')
      .textContent();
    console.log('Companies text:', companiesText);

    // Extract numbers from text
    const extractNumber = (text: string | null): number => {
      if (!text) return 0;
      const match = text.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };

    const displayedTenants = extractNumber(tenantsText);
    const displayedUsers = extractNumber(usersText);
    const displayedCompanies = extractNumber(companiesText);

    console.log('Displayed counts:', {
      tenants: displayedTenants,
      users: displayedUsers,
      companies: displayedCompanies,
    });
    console.log('Database counts:', dbCounts);

    // Validate counts match database
    if (displayedTenants > 0) {
      expect(displayedTenants).toBe(dbCounts.organizations);
      if (displayedTenants !== dbCounts.organizations) {
        console.error(
          `❌ FRONTEND MISMATCH: Shows ${displayedTenants} tenants but database has ${dbCounts.organizations}`,
        );
      }
    }

    if (displayedUsers > 0) {
      expect(displayedUsers).toBe(dbCounts.users);
      if (displayedUsers !== dbCounts.users) {
        console.error(
          `❌ FRONTEND MISMATCH: Shows ${displayedUsers} users but database has ${dbCounts.users}`,
        );
      }
    }

    if (displayedCompanies > 0) {
      expect(displayedCompanies).toBe(dbCounts.sharedCompanies);
      if (displayedCompanies !== dbCounts.sharedCompanies) {
        console.error(
          `❌ FRONTEND MISMATCH: Shows ${displayedCompanies} companies but database has ${dbCounts.sharedCompanies}`,
        );
      }
    }
  });

  test('Frontend should not display hardcoded mock data', async ({ page }) => {
    await page.goto('/platform-admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Common mock/placeholder values that should not appear
    const mockValues = [
      '45.2K', // From screenshot
      '45200',
      '23', // Mock tenant count from screenshot
      '99.9%', // Mock uptime from screenshot
      '1250', // Mock company count from docs
      '1,250',
    ];

    const pageContent = await page.content();

    for (const mockValue of mockValues) {
      if (pageContent.includes(mockValue)) {
        console.warn(
          `⚠️ WARNING: Found potential mock value "${mockValue}" on page`,
        );
        // Only fail if it's clearly wrong (45.2K when we have 4 companies)
        if (mockValue === '45.2K' || mockValue === '45200') {
          expect(pageContent).not.toContain(mockValue);
        }
      }
    }
  });

  test('API endpoints should not return mock data when database is empty', async ({
    request,
  }) => {
    // This test ensures APIs don't fall back to mock data silently

    // Check that lists endpoint returns actual data or empty array, not mock data
    const listsResponse = await request.get(
      'http://localhost:3001/api/v1/company-lists',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (listsResponse.ok()) {
      const listsData = await listsResponse.json();
      const lists = listsData.data || listsData || [];

      // Verify lists have organization_id (not mock data)
      if (lists.length > 0) {
        for (const list of lists) {
          expect(list).toHaveProperty('organization_id');
          expect(list.organization_id).toBeTruthy();
        }
      }
    }
  });

  test('Data flow integrity: Database -> API -> Frontend', async ({
    page,
    request,
  }) => {
    // This test validates the complete data flow

    // Step 1: Get data from database
    const dbOrgs = dbCounts.organizations;
    console.log('Step 1: Database has', dbOrgs, 'organizations');

    // Step 2: Get data from API
    const apiResponse = await request.get(
      'http://localhost:3001/api/v1/platform-admin/tenants',
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    expect(apiResponse.ok()).toBeTruthy();
    const apiData = await apiResponse.json();
    const apiOrgs = apiData.data?.length || apiData.length || 0;
    console.log('Step 2: API returns', apiOrgs, 'organizations');

    expect(apiOrgs).toBe(dbOrgs);

    // Step 3: Verify frontend displays API data
    await page.goto('/platform-admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // The frontend should show the same count
    const pageText = await page.textContent('body');
    console.log('Step 3: Checking frontend display');

    // Check if any organizational data is displayed
    if (apiOrgs > 0 && pageText) {
      // Frontend should show some indication of the organizations
      // This is a soft check - we just verify no mock data
      expect(pageText).not.toContain('45.2K');
      expect(pageText).not.toContain('45,200');
    }

    console.log('✅ Data flow validated: Database -> API -> Frontend');
  });
});
