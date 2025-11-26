# Fix Summary: Originator Volume and Price Data Mapping Issue

## Problem
After refresh, saved values for **Originator Volume** and **Originator Price** are not mapping correctly from the GET API to the UI, while **Sandoz Volume** and **Sandoz Price** work fine.

## Root Cause
The API response structure uses the `value` property in the data arrays:
- `rowOrgvolfactor` → contains objects with `{id, year, value}`
- `rowOriginatorMarketSize` → contains objects with `{id, year, value}`
- `rowOriginatorExfactorPrice` → contains objects with `{id, year, value}`

However, the code was checking for `price` property first or using `.map()` instead of `.forEach()`, causing values not to be assigned properly.

---

## Changes Required

### 📍 **Change 1: Fix Originator Volume Mapping**
**Location:** In the `handleGetAllAPiData` function, inside the `if (cardType == 'Originator Volume')` block

**Lines to change:** Around line 680-700 in your original code

**❌ WRONG CODE:**
```typescript
filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
  newSetRows[2].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value;  // ❌ Using .map() doesn't modify in place
    }
  });
});
```

**✅ CORRECT CODE:**
```typescript
filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
  newSetRows[2].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? '0';  // ✅ Using .forEach() and default value
    }
  });
});
```

**Why:** 
- `.map()` creates a new array but doesn't modify the original
- Need to use `.forEach()` to modify the array in place
- Add fallback to `'0'` if value is null/undefined

---

### 📍 **Change 2: Fix Originator Price Factor Mapping**
**Location:** In the `handleGetAllAPiData` function, inside the `if (cardType == 'Originator Price')` block

**Lines to change:** Around line 715-720 in your original code

**❌ WRONG CODE:**
```typescript
filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
  newSetRows[1].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.price ?? e.value ?? '';  // ❌ Wrong: checks 'price' first
    }
  });
});
```

**✅ CORRECT CODE:**
```typescript
filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
  newSetRows[1].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? e.price ?? '0';  // ✅ Correct: checks 'value' first
    }
  });
});
```

**Why:**
- API returns `value` property, not `price` in `rowOrgpricefactor`
- Need to check `e.value` first, then fallback to `e.price`, then to `'0'`
- Use `.forEach()` instead of `.map()`

---

### 📍 **Change 3: Fix Originator Ex-factory Price Mapping**
**Location:** In the `handleGetAllAPiData` function, inside the `if (cardType == 'Originator Price')` block

**Lines to change:** Around line 722-727 in your original code

**❌ WRONG CODE:**
```typescript
filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
  newSetRows[2].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.price ?? e.value ?? '';  // ❌ Wrong: checks 'price' first
    }
  });
});
```

**✅ CORRECT CODE:**
```typescript
filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
  newSetRows[2].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? e.price ?? '0';  // ✅ Correct: checks 'value' first
    }
  });
});
```

**Why:** Same as above - prioritize `value` property and use `.forEach()`

---

### 📍 **Change 4: Add Null Check for Filtered API Data**
**Location:** All `if (cardType == ...)` blocks in `handleGetAllAPiData`

**❌ WRONG CODE:**
```typescript
if (filteredApiValue.length) {
  // process data
}
```

**✅ CORRECT CODE:**
```typescript
if (filteredApiValue && filteredApiValue.length) {
  // process data
}
```

**Why:** Prevent runtime errors if API returns null/undefined

---

## Complete Fixed Function

Here's the complete corrected `handleGetAllAPiData` function:

```typescript
const handleGetAllAPiData = async (): Promise<void> => {
  let getOriVolRows = await getRowOriginatorVolume(
    activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
  );
  let getOriPriceRows = await getRowOriginatorPrice(
    activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
  );
  let getSandozVolRows = await getRowSandozVolume(
    activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
  );
  let getSandozPricRows = await getRowSandozPrice(
    activeForecastItems.traditional_forecast_id ? activeForecastItems.traditional_forecast_id : 61
  );

  const newSetRows = [...rows];

  // ✅ FIXED: Originator Volume
  if (cardType == 'Originator Volume') {
    let currentThirdRow = newSetRows[2];
    let filteredApiValue = getOriVolRows[0]?.data?.filter(
      (rowEle: any) => rowEle.programName == currentThirdRow[1].value && rowEle.country == currentThirdRow[0].value
    );
    if (filteredApiValue && filteredApiValue.length) {
      // ✅ Changed: .map() → .forEach() and added default value
      filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
        newSetRows[2].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? '0';
          }
        });
      });
      // ✅ Changed: .map() → .forEach() and added default value
      filteredApiValue[0].rowOriginatorMarketSize.forEach((e: any, i: any) => {
        newSetRows[3].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? '0';
          }
        });
      });
      // ✅ Changed: .map() → .forEach() and added default value
      filteredApiValue[0].rowOriginatorMarketSizeAfter.forEach((e: any, i: any) => {
        newSetRows[4].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? '0';
          }
        });
      });
      setRows(newSetRows);
    }
  }

  // ✅ FIXED: Originator Price
  if (cardType == 'Originator Price') {
    let currentFactorRow = newSetRows[1];
    let filteredApiValue = getOriPriceRows[0]?.data?.filter(
      (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
    );
    if (filteredApiValue && filteredApiValue.length) {
      // ✅ Changed: e.price → e.value first, and .map() → .forEach()
      filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
        newSetRows[1].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? e.price ?? '0';
          }
        });
      });
      // ✅ Changed: e.price → e.value first, and .map() → .forEach()
      filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
        newSetRows[2].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? e.price ?? '0';
          }
        });
      });
      setRows(newSetRows);
    }
  }

  // Sandoz Price and Volume (already working, but applied same fixes for consistency)
  if (cardType == 'Sandoz Price') {
    let currentFactorRow = newSetRows[1];
    let filteredApiValue = getSandozPricRows[0]?.data?.filter(
      (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
    );
    if (filteredApiValue && filteredApiValue.length) {
      filteredApiValue[0].rowSandozpriFac.forEach((e: any, i: any) => {
        newSetRows[1].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? e.price ?? '0';
          }
        });
      });
      filteredApiValue[0].rowSandozPrice.forEach((e: any, i: any) => {
        newSetRows[2].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? e.price ?? '0';
          }
        });
      });
      setRows(newSetRows);
    }
  }

  if (cardType == 'Sandoz Volume') {
    let currentFactorRow = newSetRows[1];
    let filteredApiValue = getSandozVolRows[0]?.data?.filter(
      (rowEle: any) => rowEle.programName == currentFactorRow[1].value && rowEle.country == currentFactorRow[0].value
    );
    if (filteredApiValue && filteredApiValue.length) {
      filteredApiValue[0].rowSandozvolFac.forEach((e: any, i: any) => {
        newSetRows[1].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? e.price ?? '0';
          }
        });
      });
      filteredApiValue[0].rowSandozVolume.forEach((e: any, i: any) => {
        newSetRows[2].forEach((re: any, rei: any) => {
          if (e.year == re.key) {
            re.value = e.value ?? e.price ?? '0';
          }
        });
      });
      setRows(newSetRows);
    }
  }
};
```

---

## Summary of All Changes

| Issue | Location | Change Required |
|-------|----------|----------------|
| **1. Originator Volume - rowOrgvolfactor** | Line ~683 | Change `.map()` to `.forEach()` |
| **2. Originator Volume - rowOriginatorMarketSize** | Line ~689 | Change `.map()` to `.forEach()` |
| **3. Originator Volume - rowOriginatorMarketSizeAfter** | Line ~695 | Change `.map()` to `.forEach()` |
| **4. Originator Price - rowOrgpricefactor** | Line ~715 | Change `e.price ?? e.value` to `e.value ?? e.price` AND `.map()` to `.forEach()` |
| **5. Originator Price - rowOriginatorExfactorPrice** | Line ~722 | Change `e.price ?? e.value` to `e.value ?? e.price` AND `.map()` to `.forEach()` |
| **6. All blocks** | Multiple | Add null check: `if (filteredApiValue && filteredApiValue.length)` |

---

## Why Sandoz Was Working

Sandoz Volume and Price were working because:
1. They might have had different property structures
2. Or the order of checking `e.value ?? e.price` was correct
3. But to be safe, apply the same fixes to maintain consistency

---

## Testing Steps

After applying these changes:

1. **Save data** for Originator Volume and Price
2. **Refresh the page**
3. **Verify** that the saved values appear in the UI correctly
4. **Check console** for the API response structure to confirm it matches expectations

---

## File to Update

**File:** Your React component file (the one containing `RowCalculationDialog`)

**Function:** `handleGetAllAPiData` (around lines 670-750)

Apply all the changes listed above in this function.
