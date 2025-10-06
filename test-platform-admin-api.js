#!/usr/bin/env node

/**
 * Test script for platform admin API endpoints
 * This script connects directly to the database to test the service layer
 */

const { Client } = require('pg');

// Database configuration
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'selly_base',
});

async function testDatabaseConnection() {
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Database connection successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testTenantsFetch() {
  console.log('📊 Testing getTenants() functionality...');
  try {
    // Query organizations with counts
    const query = `
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.domain,
        o.status,
        o.subscription_tier,
        o.created_at,
        o.updated_at,
        (SELECT COUNT(*) FROM users WHERE organization_id = o.id) as user_count,
        (SELECT COUNT(*) FROM companies WHERE organization_id = o.id) as data_count,
        (SELECT MAX(last_login_at) FROM users WHERE organization_id = o.id) as last_activity
      FROM organizations o
      ORDER BY o.created_at DESC
      LIMIT 10;
    `;
    
    const result = await client.query(query);
    const rows = result.rows;
    console.log(`✅ Found ${rows.length} tenant organizations`);
    
    rows.forEach((tenant, index) => {
      console.log(`\n  ${index + 1}. ${tenant.name} (${tenant.slug})`);
      console.log(`     Status: ${tenant.status}, Tier: ${tenant.subscription_tier || 'N/A'}`);
      console.log(`     Users: ${tenant.user_count}, Data: ${tenant.data_count}`);
      console.log(`     Last Activity: ${tenant.last_activity || tenant.updated_at}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ getTenants test failed:', error.message);
    return false;
  }
}

async function testPlatformUsersFetch() {
  console.log('\n\n👥 Testing getPlatformUsers() functionality...');
  try {
    // Query all users with their organizations
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.organization_id,
        u.created_at,
        u.updated_at,
        u.last_login_at,
        o.name as organization_name,
        r.name as role_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.created_at DESC
      LIMIT 10;
    `;
    
    const result = await client.query(query);
    const rows = result.rows;
    console.log(`✅ Found ${rows.length} platform users`);
    
    rows.forEach((user, index) => {
      console.log(`\n  ${index + 1}. ${user.name} <${user.email}>`);
      console.log(`     Role: ${user.role_name || 'N/A'}, Status: ${user.status}`);
      console.log(`     Organization: ${user.organization_name || 'None (Platform Admin)'}`);
      console.log(`     Last Login: ${user.last_login_at || 'Never'}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ getPlatformUsers test failed:', error.message);
    return false;
  }
}

async function testSharedCompaniesFetch() {
  console.log('\n\n🏢 Testing getSharedCompanies() functionality...');
  try {
    // Query shared companies
    const query = `
      SELECT 
        c.id,
        c.name_en as company_name,
        c.industry_code,
        c.province,
        c.primary_registration_no,
        c.verification_status,
        c.is_shared_data,
        c.updated_at
      FROM companies c
      WHERE c.is_shared_data = true
      ORDER BY c.updated_at DESC
      LIMIT 10;
    `;
    
    const result = await client.query(query);
    const rows = result.rows;
    console.log(`✅ Found ${rows.length} shared companies`);
    
    rows.forEach((company, index) => {
      console.log(`\n  ${index + 1}. ${company.company_name}`);
      console.log(`     Industry: ${company.industry_code || 'N/A'}, Province: ${company.province || 'N/A'}`);
      console.log(`     Registration: ${company.primary_registration_no || 'N/A'}`);
      console.log(`     Verification: ${company.verification_status}, Shared: ${company.is_shared_data}`);
      console.log(`     Last Updated: ${company.updated_at}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ getSharedCompanies test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Platform Admin API Database Integration Tests');
  console.log('================================================\n');
  
  const connected = await testDatabaseConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  const test1 = await testTenantsFetch();
  const test2 = await testPlatformUsersFetch();
  const test3 = await testSharedCompaniesFetch();
  
  console.log('\n\n================================================');
  console.log('📈 Test Summary');
  console.log('================================================');
  console.log(`getTenants():           ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`getPlatformUsers():     ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`getSharedCompanies():   ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = test1 && test2 && test3;
  console.log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  await client.end();
  process.exit(allPassed ? 0 : 1);
}

runTests();
