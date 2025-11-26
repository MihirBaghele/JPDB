# Debugging Checklist: API Data Not Appearing in UI

## Before You Start
- [ ] Open Browser DevTools (F12)
- [ ] Go to the Console tab
- [ ] Clear the console
- [ ] Reload the page / open the dialog

## Step 1: Check API Call
Look for: `=== API FETCH START ===`

**Questions to answer:**
- [ ] Do you see this log? (If NO, the useEffect isn't running)
- [ ] What is the Card Type? (Should match: "Originator Price", "Originator Volume", etc.)
- [ ] What is the forecast ID? (Should be a number like 35 or 61)

## Step 2: Check API Response
Look for: `✅ Originator Price API response:`

**Questions to answer:**
- [ ] Is the response an array?
- [ ] Does it have at least one object?
- [ ] Does the object have `rowOrgpricefactor` and `rowOriginatorExfactorPrice`?
- [ ] What is the `country` field value?

**Example good response:**
```javascript
[{
  country: "Test 25",
  rowOrgpricefactor: [{year: 2025, value: "22.00"}, ...],
  rowOriginatorExfactorPrice: [{year: 2025, value: "5.95"}, ...]
}]
```

## Step 3: Check Country Matching
Look for: `Looking for country:` and `Available countries in API:`

**Questions to answer:**
- [ ] Does the country being searched match one in the API?
- [ ] Are there any spacing differences? (e.g., "Test 25" vs "Test  25")
- [ ] Are there any case differences? (e.g., "Test 25" vs "test 25")

**Common issues:**
- Extra spaces: `"Test 25 "` vs `"Test 25"`
- Wrong capitalization: `"test 25"` vs `"Test 25"`
- Country not in API response at all

## Step 4: Check Filtering Results
Look for: `Filtered data:`

**Questions to answer:**
- [ ] Is the filtered data an array with at least one item?
- [ ] If empty, go back to Step 3 - the country doesn't match

**If you see:** `⚠️ No matching data found`
- The API response doesn't contain data for the specified country
- Check what's in `rows[1][0].value` (the country field)
- Verify this country exists in your database

## Step 5: Check Data Mapping
Look for: `✅ Mapping price factor:` and `✅ Mapping ex-factory price:`

**Questions to answer:**
- [ ] Do you see multiple mapping logs (one per year)?
- [ ] Are the years correct (e.g., 2025, 2026, 2027)?
- [ ] Are the values correct (matching API response)?

**Example:**
```
✅ Mapping price factor: year 2025 = 22.00
✅ Mapping price factor: year 2026 = 222.00
✅ Mapping ex-factory price: year 2025 = 5.95
✅ Mapping ex-factory price: year 2026 = 73.88
```

## Step 6: Check Final State
Look for: `✅ Updated rows for Originator Price:`

**Questions to answer:**
- [ ] Can you see the updated rows array?
- [ ] Does row[1] contain the factor values?
- [ ] Does row[2] contain the price values?

## Step 7: Visual Verification
**In the UI:**
- [ ] Can you see the table?
- [ ] Are there input fields for years?
- [ ] Do the input fields show the mapped values?
- [ ] Are the "RoW" rows editable (not disabled)?

## Common Problems and Solutions

### Problem 1: No logs appear at all
**Diagnosis:** useEffect is not running
**Solutions:**
- Check if `isOpen` prop is true
- Check if `rows.length > 0`
- Verify the component is actually mounted

### Problem 2: API returns empty array or null
**Diagnosis:** API issue or wrong forecast ID
**Solutions:**
- Check Network tab in DevTools
- Verify the API endpoint is correct
- Check if `traditional_forecast_id` is valid
- Try using forecast ID `61` as fallback

### Problem 3: Country mismatch
**Diagnosis:** Filtering returns empty array
**Solutions:**
```javascript
// In console, check exact values:
console.log('Expected:', JSON.stringify(rows[1][0].value))
console.log('Available:', apiData.map(item => JSON.stringify(item.country)))
```
- Trim whitespace: `rowEle.country.trim() === countryToMatch.trim()`
- Ignore case: `rowEle.country.toLowerCase() === countryToMatch.toLowerCase()`

### Problem 4: Data maps but doesn't display
**Diagnosis:** React state update issue
**Solutions:**
- Check if rows are being recreated (losing updates)
- Verify `setRows(newSetRows)` is called
- Check for other useEffects that might reset state
- Look for the final log: `✅ Updated rows for Originator Price`

### Problem 5: Data shows then disappears
**Diagnosis:** Another render is resetting the data
**Solutions:**
- Check if `defaultValues` is recalculating
- Look for multiple `=== API FETCH START ===` logs
- Verify useMemo dependencies are correct

### Problem 6: Wrong data displayed
**Diagnosis:** Year mapping issue
**Solutions:**
- Check if years in API match table headers
- Verify the comparison: `e.year == re.key`
- Print both values: `console.log('Comparing', e.year, 'with', re.key)`

## Network Tab Verification

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for API calls to:
   - `getRowOriginatorPrice`
   - `getRowOriginatorVolume`
   - `getRowSandozPrice`
   - `getRowSandozVolume`

**Check:**
- [ ] Status code is 200 (success)
- [ ] Response contains expected data
- [ ] Request includes correct forecast ID

## Quick Test

Run this in the browser console when the dialog is open:

```javascript
// Check rows state
console.log('Current rows:', rows);

// Check what country is being used
console.log('Country being searched:', rows[1]?.[0]?.value);

// Manually trigger fetch (if handleGetAllAPiData is accessible)
// handleGetAllAPiData();
```

## Still Not Working?

If you've gone through all steps and it's still not working:

1. **Copy all console output** (especially the API response and country matching logs)
2. **Take a screenshot** of the UI
3. **Copy the Network tab** request/response for the GET API call
4. Share these with your team for further debugging

## Success Indicators

You should see:
✅ `=== API FETCH START ===`
✅ API response with data
✅ Country found in available countries
✅ Filtered data with 1+ items
✅ Multiple "Mapping" logs
✅ Updated rows log
✅ `=== API FETCH COMPLETE ===`
✅ Values visible in UI input fields
