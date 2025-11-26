# Exact Changes Needed in Your Code

## 📍 File to Modify
`src/components/row-calculation/row-calculation-dialog.tsx`

Or wherever your `RowCalculationDialog` component is located.

---

## 🔍 Find and Replace These Sections

### 1️⃣ In the `handleGetAllAPiData` function - Originator Price Section

**FIND THIS CODE (around line 776-800):**
```typescript
if (cardType == 'Originator Price') {
  let currentFactorRow = newSetRows[1];
  let filteredApiValue = getOriPriceRows[0]?.data?.filter(
    (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
  );
  if (filteredApiValue && filteredApiValue.length > 0) {
    filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
      newSetRows[1].map((re: any, rei: any) => {
        if (e.year == re.key) {
          re.value = e.price ?? e.value ?? '';  // ❌ WRONG - checking e.price first
        }
      });
    });
    filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
      newSetRows[2].map((re: any, rei: any) => {
        if (e.year == re.key) {
          re.value = e.price ?? e.value ?? '';  // ❌ WRONG - checking e.price first
        }
      });
    });
    setRows(newSetRows);
  }
}
```

**REPLACE WITH:**
```typescript
if (cardType == 'Originator Price') {
  let currentFactorRow = newSetRows[1];
  
  // Handle different possible response structures
  let apiData = getOriPriceRows[0]?.data || getOriPriceRows?.data || getOriPriceRows;
  if (!Array.isArray(apiData)) {
    apiData = [apiData];
  }
  
  let filteredApiValue = apiData?.filter(
    (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
  );
  
  if (filteredApiValue && filteredApiValue.length > 0) {
    const matchedData = filteredApiValue[0];
    
    // Update row 1 - RoW ORG price factor
    if (matchedData.rowOrgpricefactor && Array.isArray(matchedData.rowOrgpricefactor)) {
      matchedData.rowOrgpricefactor.forEach((e: any) => {
        newSetRows[1].forEach((re: any) => {
          if (String(e.year) == String(re.key)) {  // ✅ String comparison
            re.value = e.value ?? '0';  // ✅ Use e.value (not e.price)
          }
        });
      });
    }
    
    // Update row 2 - Originator ex-factory price
    if (matchedData.rowOriginatorExfactorPrice && Array.isArray(matchedData.rowOriginatorExfactorPrice)) {
      matchedData.rowOriginatorExfactorPrice.forEach((e: any) => {
        newSetRows[2].forEach((re: any) => {
          if (String(e.year) == String(re.key)) {  // ✅ String comparison
            re.value = e.value ?? '0';  // ✅ Use e.value (not e.price)
          }
        });
      });
    }
    
    setRows(newSetRows);
  }
}
```

---

### 2️⃣ In the `handleGetAllAPiData` function - Originator Volume Section

**FIND THIS CODE (around line 744-775):**
```typescript
if (cardType == 'Originator Volume') {
  let currentThirdRow = newSetRows[2];
  let filteredApiValue = getOriVolRows[0]?.data?.filter(
    (rowEle: any) => rowEle.programName == currentThirdRow[1].value && rowEle.country == currentThirdRow[0].value
  );
  if (filteredApiValue.length) {
    filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
      newSetRows[2].map((re: any, rei: any) => {
        if (e.year == re.key) {  // ❌ May fail with type mismatch
          re.value = e.value;
        }
      });
    });
    // ... similar for other arrays
  }
}
```

**REPLACE WITH:**
```typescript
if (cardType == 'Originator Volume') {
  let currentThirdRow = newSetRows[2];
  
  // Handle different possible response structures
  let apiData = getOriVolRows[0]?.data || getOriVolRows?.data || getOriVolRows;
  if (!Array.isArray(apiData)) {
    apiData = [apiData];
  }
  
  let filteredApiValue = apiData?.filter(
    (rowEle: any) => rowEle.programName == currentThirdRow[1].value && rowEle.country == currentThirdRow[0].value
  );
  
  if (filteredApiValue && filteredApiValue.length > 0) {
    const matchedData = filteredApiValue[0];
    
    // Update row 2 - RoW ORG volume factor
    if (matchedData.rowOrgvolfactor && Array.isArray(matchedData.rowOrgvolfactor)) {
      matchedData.rowOrgvolfactor.forEach((e: any) => {
        newSetRows[2].forEach((re: any) => {
          if (String(e.year) == String(re.key)) {  // ✅ String comparison
            re.value = e.value ?? '0';
          }
        });
      });
    }
    
    // Update row 3 - Originator Market size
    if (matchedData.rowOriginatorMarketSize && Array.isArray(matchedData.rowOriginatorMarketSize)) {
      matchedData.rowOriginatorMarketSize.forEach((e: any) => {
        newSetRows[3].forEach((re: any) => {
          if (String(e.year) == String(re.key)) {  // ✅ String comparison
            re.value = e.value ?? '0';
          }
        });
      });
    }
    
    // Update row 4 - Originator Market size after
    if (matchedData.rowOriginatorMarketSizeAfter && Array.isArray(matchedData.rowOriginatorMarketSizeAfter)) {
      matchedData.rowOriginatorMarketSizeAfter.forEach((e: any) => {
        newSetRows[4].forEach((re: any) => {
          if (String(e.year) == String(re.key)) {  // ✅ String comparison
            re.value = e.value ?? '0';
          }
        });
      });
    }
    
    setRows(newSetRows);
  }
}
```

---

### 3️⃣ At the beginning of `handleGetAllAPiData` function

**FIND THIS LINE (around line 740):**
```typescript
const newSetRows = [...rows];
```

**REPLACE WITH:**
```typescript
// Create a deep copy of rows to ensure proper state update
const newSetRows = rows.map(row => row.map(cell => ({ ...cell })));
```

---

### 4️⃣ (Optional) Add debugging - After fetching all APIs

**ADD THESE LINES after the API calls (around line 738):**
```typescript
console.log('API Response - Originator Volume:', getOriVolRows);
console.log('API Response - Originator Price:', getOriPriceRows);
console.log('API Response - Sandoz Volume:', getSandozVolRows);
console.log('API Response - Sandoz Price:', getSandozPricRows);
```

---

## 📝 Summary of Key Changes

| Issue | Old Code | New Code |
|-------|----------|----------|
| **Property name** | `e.price ?? e.value` | `e.value` |
| **Year comparison** | `e.year == re.key` | `String(e.year) == String(re.key)` |
| **Array copy** | `[...rows]` | `rows.map(row => row.map(cell => ({...cell})))` |
| **Null checks** | Direct access | Check with `if (data && Array.isArray(data))` |
| **Map vs forEach** | `.map()` | `.forEach()` |
| **API structure** | `getOriVolRows[0]?.data` | Handle multiple structures |

---

## 🚀 After Making Changes

1. Save the file
2. Restart your development server
3. Open browser DevTools → Console
4. Test Originator Volume and Price
5. Check console logs for any errors
6. Values should now persist after refresh

---

## ❓ Still Not Working?

If the issue persists after these changes, check your browser console for the debug logs and share:
1. The API response structure
2. The filtered data result
3. Any error messages
