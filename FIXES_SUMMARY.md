# Fix Summary: Originator Volume & Price Data Mapping Issue

## Problem
After refresh, saved values for **Originator Volume** and **Originator Price** were not displaying in the UI, while **Sandoz Volume** and **Sandoz Price** worked correctly.

## Root Causes Identified

1. **Inconsistent property access**: Code was checking for `e.price` before `e.value`, but API returns only `e.value`
2. **Missing deep copy**: Shallow copy of rows wasn't triggering React re-renders properly
3. **Type mismatch**: Year comparison failing due to string vs number mismatch
4. **API response structure**: Code didn't handle different possible API response structures

## Fixed File Location
📁 `/workspace/src/components/row-calculation/row-calculation-dialog.tsx`

## Key Changes Made

### Change 1: Deep Copy of Rows (Line ~740)
**BEFORE:**
```typescript
const newSetRows = [...rows];
```

**AFTER:**
```typescript
const newSetRows = rows.map(row => row.map(cell => ({ ...cell })));
```
✅ **Why**: Ensures proper React state update by creating new object references

---

### Change 2: Consistent Value Property (Lines 775, 786, 797, 835, 846)
**BEFORE (Originator Price):**
```typescript
re.value = e.price ?? e.value ?? '';
```

**AFTER:**
```typescript
re.value = e.value ?? '0';
```
✅ **Why**: API returns `value` property, not `price` property

---

### Change 3: String Year Comparison (Lines 774, 785, 796, 834, 845)
**BEFORE:**
```typescript
if (e.year == re.key) {
```

**AFTER:**
```typescript
if (String(e.year) == String(re.key)) {
```
✅ **Why**: Handles both string and number year formats from API

---

### Change 4: Better API Response Handling (Lines 755-758, 816-819)
**BEFORE:**
```typescript
let filteredApiValue = getOriVolRows[0]?.data?.filter(...)
```

**AFTER:**
```typescript
let apiData = getOriVolRows[0]?.data || getOriVolRows?.data || getOriVolRows;
if (!Array.isArray(apiData)) {
  apiData = [apiData];
}
let filteredApiValue = apiData?.filter(...)
```
✅ **Why**: Handles different API response structures gracefully

---

### Change 5: Added Null Checks (Lines 770, 782, 793, 831, 842)
**BEFORE:**
```typescript
filteredApiValue[0].rowOrgvolfactor.forEach((e: any) => {
```

**AFTER:**
```typescript
if (matchedData.rowOrgvolfactor && Array.isArray(matchedData.rowOrgvolfactor)) {
  matchedData.rowOrgvolfactor.forEach((e: any) => {
```
✅ **Why**: Prevents errors if API data is missing or malformed

---

### Change 6: Added Debug Logging (Lines 739-764)
**ADDED:**
```typescript
console.log('API Response - Originator Volume:', getOriVolRows);
console.log('API Response - Originator Price:', getOriPriceRows);
console.log('Looking for:', { programName, country });
console.log('Filtered Originator Volume data:', filteredApiValue);
```
✅ **Why**: Helps debug if issues persist

---

### Change 7: Better useEffect Dependency (Line 939)
**BEFORE:**
```typescript
useEffect(() => {
  handleGetAllAPiData();
}, []);
```

**AFTER:**
```typescript
useEffect(() => {
  if (rows.length > 0) {
    handleGetAllAPiData();
  }
}, [cardType]);
```
✅ **Why**: Only fetches after rows are initialized and re-fetches when cardType changes

---

## Testing Steps

1. Open browser console to see debug logs
2. Save data for Originator Volume
3. Refresh the page
4. Check console logs to see:
   - API Response data
   - Filtered data
   - Updated rows
5. Verify values appear in UI
6. Repeat for Originator Price

## Expected Result
✅ After refresh, Originator Volume and Originator Price values should now display correctly in the UI, just like Sandoz Volume and Sandoz Price already do.

---

## If Issue Persists

Check console logs for:
1. **"API Response - Originator Volume:"** - Is data coming from API?
2. **"Looking for:"** - Are programName and country correct?
3. **"Filtered Originator Volume data:"** - Is filtering working?
4. **"Updated rows for Originator Volume:"** - Are rows being updated?

If any of these show unexpected values, you may need to adjust the filtering logic to match your actual API response structure.
