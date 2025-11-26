# Row Calculation Dialog - API Data Fix

## Overview

This repository contains the fixed version of the `RowCalculationDialog` component that resolves the issue where GET API data was not being displayed in the UI after page refresh.

## Problem Statement

When the "Originator Price" dialog (and other card types) was opened, the GET API would successfully fetch data, but the data would not appear in the UI. The table would show default values instead of the values from the API response.

### Example API Response Not Showing:
```json
[
  {
    "id": 45,
    "rowOrgpricefactor": [
      {"id": 387, "year": 2025, "value": "22.00"},
      {"id": 388, "year": 2026, "value": "222.00"}
    ],
    "rowOriginatorExfactorPrice": [
      {"id": 391, "year": 2025, "value": "5.95"},
      {"id": 392, "year": 2026, "value": "73.88"}
    ],
    "country": "Test 25",
    "traditionalForecastId": 35
  }
]
```

## Files in This Repository

1. **row-calculation-dialog-fixed.tsx** - The corrected component with all fixes applied
2. **FIX-SUMMARY.md** - Detailed explanation of all issues found and fixes applied
3. **DEBUGGING-CHECKLIST.md** - Step-by-step guide to debug if issues persist
4. **README.md** - This file

## Quick Start

### 1. Replace Your Current File

Copy the contents of `row-calculation-dialog-fixed.tsx` and replace your existing component file.

### 2. Test the Fix

1. Open your application in a browser
2. Open Browser DevTools (F12)
3. Go to the Console tab
4. Open the dialog/component
5. Watch for console logs starting with `=== API FETCH START ===`

### 3. Verify Success

You should see:
- ✅ API response logged
- ✅ Country matching logs
- ✅ Data mapping logs with years and values
- ✅ Values appearing in the UI input fields

## Key Changes Made

### 1. Fixed useEffect Trigger
```javascript
// BEFORE - Only runs once on mount
useEffect(() => {
  handleGetAllAPiData();
}, []);

// AFTER - Runs when dialog opens
useEffect(() => {
  if (rows.length > 0 && isOpen) {
    handleGetAllAPiData();
  }
}, [isOpen]);
```

### 2. Added Comprehensive Logging
The fixed version includes detailed console logs to track:
- API calls and responses
- Country matching logic
- Data filtering results
- Value mapping operations
- Final state updates

### 3. Improved Error Handling
```javascript
try {
  setIsLoading(true);
  // API calls...
} catch (error) {
  console.error('❌ Error fetching API data:', error);
} finally {
  setIsLoading(false);
}
```

### 4. Added Loading State
Visual feedback while data is being fetched:
```javascript
{isLoading && (
  <Box sx={{ textAlign: 'center', py: 2 }}>
    <Typography>Loading data...</Typography>
  </Box>
)}
```

### 5. Fixed Comparison Operators
Changed loose equality (`==`) to strict equality (`===`) throughout:
```javascript
// BEFORE
rowEle.country == currentFactorRow[0].value

// AFTER
rowEle.country === currentFactorRow[0].value
```

### 6. Fixed useMemo Dependencies
```javascript
// BEFORE - Missing dependencies
const headers = React.useMemo(() => getHeaders(startYear, endYear), []);

// AFTER - Complete dependencies
const headers = React.useMemo(() => getHeaders(startYear, endYear), [startYear, endYear]);
```

## How to Debug

If the fix doesn't work immediately, follow the **DEBUGGING-CHECKLIST.md** file. It provides a step-by-step process to identify the exact issue.

### Quick Debug Steps:

1. **Open Console** - Check for error messages
2. **Find API logs** - Look for `✅ Originator Price API response:`
3. **Check Country Matching** - Verify the country name matches exactly
4. **Verify Data Mapping** - Look for `✅ Mapping price factor:` logs
5. **Check UI** - Confirm values appear in input fields

## Common Issues and Solutions

### Issue 1: "No matching data found for country: X"

**Cause:** The country name in `rows[1][0].value` doesn't match any country in the API response.

**Solution:**
```javascript
// Check console logs for exact values
// Looking for country: Test 25
// Available countries in API: ["Test 25"]
```
- Verify spelling, spacing, and capitalization match exactly
- Check for trailing spaces: `"Test 25 "` vs `"Test 25"`

### Issue 2: API returns empty array

**Cause:** Wrong forecast ID or no data for that ID.

**Solution:**
- Check `traditional_forecast_id` value
- Verify data exists in database for that forecast ID
- Check Network tab for API request/response details

### Issue 3: Data maps but doesn't show in UI

**Cause:** State update not triggering re-render or being overwritten.

**Solution:**
- Check if multiple `=== API FETCH START ===` logs appear (multiple re-fetches)
- Verify no other useEffect is resetting the rows state
- Check that `setRows(newSetRows)` is actually called

### Issue 4: Values show briefly then disappear

**Cause:** Component re-rendering and resetting to default values.

**Solution:**
- Check if `defaultValues` useMemo is recalculating
- Verify parent component isn't forcing re-renders
- Check if `regionOtionsData` prop is changing

## API Requirements

The component expects GET APIs to return arrays with this structure:

### Originator Price API
```typescript
Array<{
  country: string;
  traditionalForecastId: number;
  rowOrgpricefactor: Array<{year: number, value: string}>;
  rowOriginatorExfactorPrice: Array<{year: number, value: string}>;
}>
```

### Originator Volume API
```typescript
Array<{
  country: string;
  programName: string;
  traditionalForecastId: number;
  rowOrgvolfactor: Array<{year: number, value: string}>;
  rowOriginatorMarketSize: Array<{year: number, value: string}>;
  rowOriginatorMarketSizeAfter: Array<{year: number, value: string}>;
}>
```

### Sandoz Price/Volume APIs
```typescript
Array<{
  country: string;
  programName: string;
  traditionalForecastId: number;
  rowSandozpriFac: Array<{year: number, value: string}>;
  rowSandozPrice: Array<{year: number, value: string}>;
  // or
  rowSandozvolFac: Array<{year: number, value: string}>;
  rowSandozVolume: Array<{year: number, value: string}>;
}>
```

## Testing Checklist

- [ ] Dialog opens successfully
- [ ] Console shows `=== API FETCH START ===`
- [ ] API response is logged and contains data
- [ ] Country matching shows correct match
- [ ] Data mapping logs show correct years and values
- [ ] UI shows mapped values in input fields
- [ ] Editable rows (RoW rows) are enabled
- [ ] Non-editable rows are disabled
- [ ] Save button works correctly
- [ ] Close button works correctly

## Performance Considerations

The fixed version:
- Only fetches data when dialog is opened (`isOpen` dependency)
- Uses useMemo for expensive calculations
- Includes loading state to prevent multiple rapid calls
- Logs are organized for easy debugging (can be removed in production)

## Production Recommendations

Before deploying to production:

1. **Remove or reduce console logs** - Keep only error logs
2. **Add proper error boundaries** - Wrap component in error boundary
3. **Add retry logic** - For API call failures
4. **Add user notifications** - Toast/snackbar for errors
5. **Add analytics** - Track when API calls fail or take too long

## Support

If you're still experiencing issues after:
1. Applying the fix
2. Following the debugging checklist
3. Checking console logs

Please provide:
- Complete console logs (from `=== API FETCH START ===` to `=== API FETCH COMPLETE ===`)
- Network tab screenshot of the API call
- Screenshot of the UI
- The exact `cardType` value you're testing

## License

This code is provided as-is for debugging and fixing the Row Calculation Dialog component.

---

**Last Updated:** 2025-11-26
**Version:** 1.0.0 (Fixed)
