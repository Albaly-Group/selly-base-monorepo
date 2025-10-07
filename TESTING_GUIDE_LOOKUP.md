# Testing Guide - Company Lookup and Smart Filtering

This guide provides step-by-step instructions for testing the company lookup and smart filtering fixes.

## Prerequisites

### 1. Database Setup
```bash
# Start PostgreSQL database
docker compose -f docker-compose.db-only.yml up -d

# Or use existing database
# Connection: localhost:5432, DB: selly_base, User: postgres, Password: postgres123

# Load seed data
psql -h localhost -U postgres -d selly_base -f selly-base-optimized-schema.sql
```

### 2. Start Backend API
```bash
cd apps/api
npm install
npm run start:dev
```

API should be running at `http://localhost:3001`

### 3. Start Frontend Web App
```bash
cd apps/web
npm install
npm run dev
```

Web app should be running at `http://localhost:3000`

## Test Credentials

From seed SQL:
- **Email**: `admin@albaly.com`
- **Password**: `password123`
- **Organization**: Albaly Digital (with access to shared data)

Alternative users:
- `admin@democustomer.com` / `password123` (Demo Customer Corp - sees own + shared data)
- `staff@albaly.com` / `password123` (Albaly staff with limited permissions)

## Test Cases

### Test 1: Simple Search - Verify Data Display

**Objective**: Verify that company data displays correctly with all fields populated

**Steps**:
1. Login with `admin@albaly.com` / `password123`
2. Navigate to Company Lookup (`/lookup`)
3. Enter "Bank" in the search box
4. Press Enter or click Search

**Expected Results**:
- ✅ Companies list appears
- ✅ "Siam Commercial Bank PCL" is shown
- ✅ Industry column shows "Financial and insurance activities"
- ✅ Province column shows "Bangkok"
- ✅ Data Completeness shows "95%" (not "NaN%" or "undefined")
- ✅ Status badge shows "verified" with green color
- ✅ No console errors in browser DevTools

**Screenshot Checkpoint**: Take screenshot showing company table with all fields populated

---

### Test 2: Industry Classification Display

**Objective**: Verify that industry_classification JSONB field is properly displayed

**Steps**:
1. Perform simple search for "Foods" or "CP"
2. Locate "CP Foods PCL" in results
3. Check Industry column

**Expected Results**:
- ✅ Industry shows "Manufacturing" or "Agriculture, forestry and fishing"
- ✅ Not showing "undefined" or "[object Object]"
- ✅ For Bangkok Tech Startup Ltd, should show "Computer programming, consultancy" or "Information and communication"

---

### Test 3: Smart Filtering - Industry Filter

**Objective**: Verify that industry filter works on backend and frontend

**Steps**:
1. Navigate to `/lookup`
2. Click "Smart Filtering" button
3. In Industry dropdown, select "Manufacturing"
4. Click "Apply Smart Filtering"

**Expected Results**:
- ✅ Blue badge appears: "Smart Filtering Applied"
- ✅ Only "CP Foods PCL" appears (has Manufacturing in industry_classification)
- ✅ Other companies are filtered out
- ✅ Network tab shows API call with `industrial=Manufacturing` parameter

**API Call Check**:
```
GET /api/v1/companies/search?industrial=Manufacturing&page=1&limit=25&includeSharedData=true&organizationId=...
```

---

### Test 4: Smart Filtering - Multiple Filters

**Objective**: Verify that multiple filters work together

**Steps**:
1. Click "Smart Filtering" button
2. Select:
   - Industry: "Financial and insurance activities"
   - Province: "Bangkok"
   - Company Size: "Large"
3. Click "Apply Smart Filtering"

**Expected Results**:
- ✅ Only "Siam Commercial Bank PCL" appears
- ✅ Matches all three criteria:
  - Industry: Financial and insurance activities ✓
  - Province: Bangkok ✓
  - Company Size: large ✓

---

### Test 5: Select All Checkbox

**Objective**: Verify that select all checkbox works with filtered results

**Steps**:
1. Perform any search to get multiple results
2. Click the checkbox in table header (select all)
3. Observe selected count
4. Click "Add to List" button to see count
5. Uncheck the header checkbox

**Expected Results**:
- ✅ When checked: All visible companies are selected
- ✅ Selection count updates: e.g., "Add to List (4)"
- ✅ All row checkboxes are checked
- ✅ When unchecked: All selections cleared
- ✅ Count resets to "Add to List (0)"
- ✅ All row checkboxes are unchecked

---

### Test 6: Select All with Filtering

**Objective**: Verify select all only selects filtered results

**Steps**:
1. Click "Smart Filtering"
2. Select Industry: "Technology" or "Computer programming, consultancy"
3. Apply filters
4. Check "Select All" checkbox
5. Verify count

**Expected Results**:
- ✅ Only filtered companies are selected
- ✅ If only 1 company matches (Bangkok Tech Startup), count shows (1)
- ✅ Selecting all doesn't select companies from other pages/filters

---

### Test 7: Data Completeness Percentage

**Objective**: Verify quality score converts to percentage correctly

**Steps**:
1. Search for all companies (simple search with "*" or blank)
2. Check Data Completeness column for each company

**Expected Results**:
- ✅ Siam Commercial Bank PCL: 95% (from quality score 0.95)
- ✅ CP Foods PCL: 92% (from quality score 0.92)
- ✅ Local Bangkok Restaurant Chain: 65% (from quality score 0.65)
- ✅ Bangkok Tech Startup Ltd: 72% (from quality score 0.72)
- ✅ No "NaN%" or "undefined%"
- ✅ Colors reflect completeness: green (≥80%), yellow (60-79%), red (<60%)

---

### Test 8: Company Size Filter

**Objective**: Verify company size filter works correctly

**Steps**:
1. Open Smart Filtering
2. Select Company Size: "Small"
3. Apply filters

**Expected Results**:
- ✅ Only "Bangkok Tech Startup Ltd" appears (size: small)

**Repeat with other sizes**:
- Medium → "Local Bangkok Restaurant Chain"
- Large → "Siam Commercial Bank PCL"
- Enterprise → "CP Foods PCL"

---

### Test 9: Province Filter

**Objective**: Verify province filter works correctly

**Steps**:
1. Open Smart Filtering
2. Enter Province: "Bangkok"
3. Apply filters

**Expected Results**:
- ✅ All 4 test companies appear (all in Bangkok)
- ✅ API call includes `province=Bangkok`

**Test with non-existent province**:
1. Enter Province: "Chiang Mai"
2. Apply filters
3. Expected: No results (no test data for Chiang Mai)

---

### Test 10: Combined Filters Persistence

**Objective**: Verify filter state persists and can be cleared

**Steps**:
1. Apply multiple filters (industry + province + size)
2. Verify results
3. Click "Clear All" button
4. Verify filters cleared

**Expected Results**:
- ✅ Blue badge shows "Smart Filtering Applied"
- ✅ Clicking "Clear All" removes badge
- ✅ Results reset to empty state (no automatic search)
- ✅ Filter panel resets to default values

---

### Test 11: Export Function with Selection

**Objective**: Verify export works with selected companies

**Steps**:
1. Search for companies
2. Select 2-3 companies (individual checkboxes)
3. Click "Export (N)" button
4. Check downloaded CSV file

**Expected Results**:
- ✅ CSV file downloads
- ✅ Contains only selected companies
- ✅ Includes all columns: Name, Industry, Province, etc.
- ✅ Data matches what's displayed in UI

---

### Test 12: API Response Validation

**Objective**: Verify backend returns properly formatted data

**Steps**:
1. Open browser DevTools → Network tab
2. Perform a search
3. Find the API call to `/companies/search`
4. Inspect response

**Expected Response Structure**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "nameEn": "Siam Commercial Bank PCL",
      "industryClassification": ["Financial and insurance activities"],
      "province": "Bangkok",
      "companySize": "large",
      "dataQualityScore": "0.95",
      "verificationStatus": "verified",
      "tags": ["finance", "banking", "enterprise"],
      "isSharedData": true,
      "dataSource": "albaly_list"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Validation**:
- ✅ industryClassification is array of strings (not null/undefined)
- ✅ dataQualityScore is string representation of decimal (0.0-1.0)
- ✅ companySize is string enum value
- ✅ tags is array of strings

---

## Automated Tests

### Unit Tests - Backend
```bash
cd apps/api
npm test -- companies.service.spec.ts
```

**Expected**: All 12 tests pass

### E2E Tests
```bash
# From project root
npm run test:e2e -- company-management.e2e.spec.ts
```

**Expected Tests to Pass**:
- should display companies in a clear, organized layout
- should search for companies
- should filter companies by industry
- should open company detail view
- should create new company through UI
- should edit existing company
- should handle pagination of companies
- should persist data across page refresh

## Common Issues and Solutions

### Issue 1: "undefined" in Industry Column
**Cause**: industry_classification is null in database
**Solution**: Run seed SQL to populate proper data
```sql
UPDATE companies 
SET industry_classification = '["Technology"]'::jsonb 
WHERE id = 'your-company-id';
```

### Issue 2: "NaN%" in Data Completeness
**Cause**: dataQualityScore is null or invalid
**Solution**: Ensure quality score is between 0.0 and 1.0
```sql
UPDATE companies 
SET data_quality_score = 0.75 
WHERE data_quality_score IS NULL;
```

### Issue 3: Select All Not Working
**Cause**: filteredCompanies array is empty or undefined
**Solution**: Verify search returns results before testing select all

### Issue 4: Smart Filtering Not Filtering
**Cause**: Backend parameter not matching frontend
**Solution**: Check Network tab, verify parameter name matches backend DTO

### Issue 5: No Test Data Visible
**Cause**: User doesn't have access to organization data
**Solution**: 
- Use `admin@albaly.com` for full access
- Verify `includeSharedData=true` in API call
- Check user's organizationId matches or is null

## Performance Testing

### Load Test - Search with Filters
```bash
# Test API endpoint performance
curl -w "@curl-format.txt" -o /dev/null -s \
  "http://localhost:3001/api/v1/companies/search?industrial=Manufacturing&province=Bangkok"
```

**Expected**: Response time < 200ms

### Stress Test - Multiple Concurrent Requests
```bash
# Use Apache Bench or similar tool
ab -n 100 -c 10 \
  "http://localhost:3001/api/v1/companies/search?searchTerm=tech"
```

**Expected**: 
- Success rate: 100%
- Average response time: < 300ms

## Test Data Reference

### Company IDs for Direct Testing
```
550e8400-e29b-41d4-a716-446655440030 - Siam Commercial Bank PCL
550e8400-e29b-41d4-a716-446655440031 - CP Foods PCL
550e8400-e29b-41d4-a716-446655440032 - Local Bangkok Restaurant Chain
550e8400-e29b-41d4-a716-446655440033 - Bangkok Tech Startup Ltd
```

### Test API Calls Directly
```bash
# Search by industry
curl "http://localhost:3001/api/v1/companies/search?industrial=Financial&includeSharedData=true"

# Search by size
curl "http://localhost:3001/api/v1/companies/search?companySize=large&includeSharedData=true"

# Multiple filters
curl "http://localhost:3001/api/v1/companies/search?industrial=Manufacturing&province=Bangkok&companySize=enterprise&includeSharedData=true"
```

## Regression Testing Checklist

After any code changes, verify:
- [ ] API builds without errors
- [ ] Web app builds without errors
- [ ] All unit tests pass (companies.service.spec.ts)
- [ ] Simple search works
- [ ] Smart filtering works
- [ ] Select all works
- [ ] Data displays correctly (no undefined/NaN)
- [ ] Export works
- [ ] Add to list works
- [ ] No console errors
- [ ] Network calls use correct parameters

## Sign-off Criteria

Before marking as complete:
- ✅ All automated tests pass
- ✅ All manual test cases pass
- ✅ No console errors in browser
- ✅ No 4xx/5xx errors in network tab
- ✅ Data displays match seed SQL data
- ✅ Select all checkbox functions correctly
- ✅ Export includes correct selected companies
- ✅ Filters apply correctly on backend
- ✅ Code builds successfully
- ✅ Documentation is complete

## Support and Troubleshooting

For issues or questions:
1. Check COMPANY_LOOKUP_FIX_SUMMARY.md for detailed implementation
2. Review browser console for errors
3. Check Network tab for API call details
4. Verify seed SQL data is loaded correctly
5. Ensure all dependencies are installed (`npm install`)
