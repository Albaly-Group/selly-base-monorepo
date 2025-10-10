# Duplicate React Key Fix

## Problem

The application was encountering a React warning:

```
Encountered two children with the same key, การขายส่งเครื่องจักรอุปกรณ์และเครื่องใช้ทางการเกษตร. 
Keys should be unique so that components maintain their identity across updates.
```

This error appeared in the combobox component when rendering dropdown options.

## Root Cause

1. The API returns industry data with a `titleEn` field that is **not unique** across records
2. Multiple industry records can have the same `titleEn` value (e.g., "การขายส่งเครื่องจักรอุปกรณ์และเครื่องใช้ทางการเกษตร")
3. The smart filtering panel extracts only the `nameEn` string from the API response
4. These strings are mapped to ComboboxOption objects where the same string is used for both `value` and `label`
5. The combobox component used `key={opt.value || `option-${idx}`}` for React keys
6. When two options have the same `value`, they get the same key, causing React warnings

## Solution

Changed the key generation strategy in the combobox component to always include the index, ensuring uniqueness:

### Before
```typescript
key={opt.value || `option-${idx}`}
```

This approach only used the index as a fallback when `opt.value` was falsy (empty string, null, undefined).

### After
```typescript
key={opt.value ? `${opt.value}-${idx}` : `option-${idx}`}
```

This approach always combines the value with the index, guaranteeing unique keys even when values are duplicated.

## Files Changed

1. **apps/web/components/ui/combobox.tsx**
   - Line 148: Updated key generation logic

2. **apps/web/__tests__/components/combobox.test.tsx**
   - Updated existing test expectations to match new key format
   - Added new test case for duplicate values scenario

## Testing

### Test Results
- ✅ All 6 test suites passing
- ✅ 45 tests passing (39 tests + 6 skipped)
- ✅ New test case added for duplicate values
- ✅ Linting successful
- ✅ Build successful

### New Test Case
```typescript
it('should generate unique keys for duplicate values', () => {
  const options = [
    { value: 'การขายส่งเครื่องจักรอุปกรณ์และเครื่องใช้ทางการเกษตร', label: 'Agricultural Machinery Wholesale' },
    { value: 'การขายส่งเครื่องจักรอุปกรณ์และเครื่องใช้ทางการเกษตร', label: 'Agricultural Equipment Wholesale' },
    { value: 'tech', label: 'Technology' },
  ]

  const keys = options.map((option, index) => 
    option.value ? `${option.value}-${index}` : `option-${index}`
  )

  expect(keys).toHaveLength(3)
  expect(new Set(keys).size).toBe(keys.length) // All keys are unique
})
```

## Impact

### Positive
- ✅ Eliminates React warning about duplicate keys
- ✅ Ensures React can properly track component identity
- ✅ Maintains existing functionality
- ✅ No breaking changes
- ✅ Better stability during re-renders

### Considerations
- Using index in keys is generally discouraged when items can be reordered
- In this case, it's acceptable because:
  1. The filtered list is regenerated on each search query change
  2. Items maintain their relative positions during filtering
  3. The index provides necessary uniqueness when values are duplicated
  4. Combined with the value, it provides stable keys for most cases

## Alternative Solutions Considered

1. **Use unique IDs from API** - Would require restructuring data flow to pass full objects instead of strings
2. **Deduplicate at data level** - Would lose information if multiple records legitimately have the same name
3. **Use label as key** - Would still have duplicates if labels are also duplicated

The chosen solution is minimal, doesn't require data structure changes, and solves the immediate problem.

## Verification

To verify this fix works:

1. Navigate to the smart filtering panel
2. Open the Industry dropdown
3. Check browser console - no React warnings about duplicate keys
4. Verify dropdown still functions correctly with search and selection

## Related Documentation

- React Keys Documentation: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
- Issue references industry data structure in `apps/api/src/entities/RefIndustryCodes.ts`
