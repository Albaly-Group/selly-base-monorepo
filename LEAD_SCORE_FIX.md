# Lead Score Display Fix

## Issue
Smart filtering was not showing the weighted lead scores properly after search. The "Weighted Score" column in the table was showing "-" instead of calculated scores.

## Root Cause
In `apps/web/app/lookup/page.tsx`, the `leadScores` object was always being returned as an empty object `{}` regardless of whether smart filtering was applied:

```typescript
// BEFORE - Line 138
return { filteredCompanies: companies, leadScores: {}, isLoading: false };
```

This meant that even though the smart filtering panel was setting up criteria and weights, the actual lead scores were never calculated for the filtered companies.

## Solution
Added logic to calculate weighted lead scores when smart filtering is applied:

```typescript
// AFTER - Lines 138-147
// Calculate lead scores when smart filtering is applied
let calculatedLeadScores: { [companyId: string]: WeightedLeadScore } = {};
if (hasAppliedFiltering && smartFiltering) {
  companies.forEach(company => {
    const score = calculateWeightedLeadScore(company, smartFiltering);
    calculatedLeadScores[company.id] = score;
  });
}

return { filteredCompanies: companies, leadScores: calculatedLeadScores, isLoading: false };
```

## How It Works

### 1. Import the scoring function
```typescript
import { calculateWeightedLeadScore } from "@/lib/types"
```

### 2. Calculate scores for each company
When `hasAppliedFiltering` is true, iterate through all filtered companies and calculate their weighted lead score based on the smart filtering criteria:

- **Keyword match**: Checks if company name, registration number, or industry contains the keyword
- **Industry match**: Exact match on industry classification
- **Province match**: Exact match on province
- **Company size match**: Exact match on company size
- **Contact status match**: Match on verification status

Each matching criterion contributes its weight to the total score.

### 3. Display in table
The `CompanyTable` component now receives the calculated scores and displays them in the "Weighted Score" column:

```typescript
{leadScores[company.id] ? (
  <div>
    <div className="font-semibold text-lg">
      {leadScores[company.id].normalizedScore}%  {/* 0-100% */}
    </div>
    <div className="text-xs text-gray-500">
      {leadScores[company.id].score}/{leadScores[company.id].maxPossibleScore}  {/* Raw score */}
    </div>
  </div>
) : (
  <span className="text-gray-400">-</span>
)}
```

## Score Calculation Example

If a user applies smart filtering with:
- Industry: "Manufacturing" (weight: 30%)
- Province: "Bangkok" (weight: 25%)
- Company Size: "Medium" (weight: 25%)
- Contact Status: "Active" (weight: 20%)

A company that matches all criteria would get:
- Total Score: 30 + 25 + 25 + 20 = 100
- Max Possible Score: 100
- Normalized Score: 100%

A company matching only Industry and Province would get:
- Total Score: 30 + 25 = 55
- Max Possible Score: 100
- Normalized Score: 55%

## Features
- ✅ Normalized scores (0-100%) for easy comparison
- ✅ Raw scores showing actual vs. max possible
- ✅ Sortable by score column (highest first)
- ✅ Only calculated when smart filtering is applied
- ✅ Performance optimized (calculated once per search)

## Testing
1. Open Smart Filtering panel
2. Select filters (Industry, Province, Size, Status)
3. Set weights for each filter
4. Apply filtering
5. Check "Weighted Score" column in results table
6. Verify scores are displayed and sortable

## Build Status
✅ All builds passing
✅ TypeScript compilation successful
✅ No breaking changes

## Files Changed
- `apps/web/app/lookup/page.tsx` - Added lead score calculation logic
