# Line-by-Line Changes Required

## 🔴 Change 1: Originator Volume - rowOrgvolfactor mapping

**Find this code:**
```typescript
filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
  newSetRows[2].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value;
    }
  });
});
```

**Replace with:**
```typescript
filteredApiValue[0].rowOrgvolfactor.forEach((e: any, i: any) => {
  newSetRows[2].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? '0';
    }
  });
});
```

---

## 🔴 Change 2: Originator Volume - rowOriginatorMarketSize mapping

**Find this code:**
```typescript
filteredApiValue[0].rowOriginatorMarketSize.forEach((e: any, i: any) => {
  newSetRows[3].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value;
    }
  });
});
```

**Replace with:**
```typescript
filteredApiValue[0].rowOriginatorMarketSize.forEach((e: any, i: any) => {
  newSetRows[3].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? '0';
    }
  });
});
```

---

## 🔴 Change 3: Originator Volume - rowOriginatorMarketSizeAfter mapping

**Find this code:**
```typescript
filteredApiValue[0].rowOriginatorMarketSizeAfter.forEach((e: any, i: any) => {
  newSetRows[4].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value;
    }
  });
});
```

**Replace with:**
```typescript
filteredApiValue[0].rowOriginatorMarketSizeAfter.forEach((e: any, i: any) => {
  newSetRows[4].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? '0';
    }
  });
});
```

---

## 🔴 Change 4: Originator Price - rowOrgpricefactor mapping (CRITICAL)

**Find this code:**
```typescript
filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
  newSetRows[1].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.price ?? e.value ?? '';
    }
  });
});
```

**Replace with:**
```typescript
filteredApiValue[0].rowOrgpricefactor.forEach((e: any, i: any) => {
  newSetRows[1].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? e.price ?? '0';
    }
  });
});
```

**Key Changes:**
- ✅ Changed `e.price ?? e.value` to `e.value ?? e.price`
- ✅ Changed `.map()` to `.forEach()`
- ✅ Changed `''` to `'0'`

---

## 🔴 Change 5: Originator Price - rowOriginatorExfactorPrice mapping (CRITICAL)

**Find this code:**
```typescript
filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
  newSetRows[2].map((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.price ?? e.value ?? '';
    }
  });
});
```

**Replace with:**
```typescript
filteredApiValue[0].rowOriginatorExfactorPrice.forEach((e: any, i: any) => {
  newSetRows[2].forEach((re: any, rei: any) => {
    if (e.year == re.key) {
      re.value = e.value ?? e.price ?? '0';
    }
  });
});
```

**Key Changes:**
- ✅ Changed `e.price ?? e.value` to `e.value ?? e.price`
- ✅ Changed `.map()` to `.forEach()`
- ✅ Changed `''` to `'0'`

---

## 🟡 Change 6: Add null check for Originator Volume

**Find this code:**
```typescript
if (filteredApiValue.length) {
```

**Replace with:**
```typescript
if (filteredApiValue && filteredApiValue.length) {
```

---

## 🟡 Change 7: Add null check for Originator Price

**Find this code:**
```typescript
if (filteredApiValue.length) {
```

**Replace with:**
```typescript
if (filteredApiValue && filteredApiValue.length) {
```

---

## Quick Reference: What Changed

### Issue #1: Using `.map()` instead of `.forEach()`
- **Problem:** `.map()` creates a new array but doesn't modify the original
- **Solution:** Use `.forEach()` to modify array in place
- **Affects:** All Originator Volume and Price mappings

### Issue #2: Wrong property priority
- **Problem:** Checking `e.price` before `e.value` in Originator Price
- **Solution:** Check `e.value` first, since API returns `value` property
- **Affects:** Originator Price mappings only

### Issue #3: Missing fallback values
- **Problem:** No default value if API returns null/undefined
- **Solution:** Add `?? '0'` fallback
- **Affects:** All mappings

---

## 📋 Checklist

Before making changes:
- [ ] Backup your current file
- [ ] Locate the `handleGetAllAPiData` function in your component

While making changes:
- [ ] Apply Change 1: Originator Volume - rowOrgvolfactor
- [ ] Apply Change 2: Originator Volume - rowOriginatorMarketSize
- [ ] Apply Change 3: Originator Volume - rowOriginatorMarketSizeAfter
- [ ] Apply Change 4: Originator Price - rowOrgpricefactor (CRITICAL)
- [ ] Apply Change 5: Originator Price - rowOriginatorExfactorPrice (CRITICAL)
- [ ] Apply Change 6: Null check for Originator Volume
- [ ] Apply Change 7: Null check for Originator Price

After making changes:
- [ ] Save the file
- [ ] Test: Save Originator Volume data → Refresh → Verify data appears
- [ ] Test: Save Originator Price data → Refresh → Verify data appears
- [ ] Check browser console for any errors

---

## Most Critical Changes (Fix These First!)

If you want to fix the most important issues first, focus on these 2:

### 🚨 Priority 1: Originator Price Factor
Change line with `rowOrgpricefactor` from:
```typescript
re.value = e.price ?? e.value ?? '';
```
To:
```typescript
re.value = e.value ?? e.price ?? '0';
```

### 🚨 Priority 2: Originator Price Ex-factory
Change line with `rowOriginatorExfactorPrice` from:
```typescript
re.value = e.price ?? e.value ?? '';
```
To:
```typescript
re.value = e.value ?? e.price ?? '0';
```

These two changes will likely fix your Originator Price issue immediately!
