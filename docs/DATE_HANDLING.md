# Date Handling System - CRITICAL DOCUMENTATION

## ⚠️ IMPORTANT: DO NOT MODIFY WITHOUT READING THIS

This document explains the date handling system for EZReturns. The system is designed to ensure dates are always handled in **Eastern Time (ET)** without timezone conversion issues.

## The Problem We Solved

PostgreSQL date columns can cause timezone shifts when:
1. A date is inserted as a string (e.g., "2025-12-17")
2. The Supabase JavaScript client retrieves it
3. The client applies timezone conversion based on the server/browser timezone
4. Result: Dec 17 becomes Dec 16 when displayed

## The Solution

### 1. Date Generation (Schedule Page)
- Use `getDateOffsetET(i)` from `lib/timezone.ts`
- Returns dates as `YYYY-MM-DD` strings in ET timezone
- Example: `"2025-12-17"`
- **DO NOT** add time components or use `new Date()`

```typescript
// ✅ CORRECT
const dateStr = getDateOffsetET(0) // "2025-12-17"

// ❌ WRONG - adds time component
const dateStr = new Date().toISOString().split('T')[0]
```

### 2. Database Storage (Stripe Actions)
- Pass the plain `YYYY-MM-DD` string directly to Supabase
- **DO NOT** add time components like `T12:00:00`
- The `pickup_date` column is type `date` (not timestamp)

```typescript
// ✅ CORRECT
const { data: order } = await supabase
  .from("orders")
  .insert({
    pickup_date: "2025-12-17", // Plain date string
    // ...
  })

// ❌ WRONG - adds time component
pickup_date: "2025-12-17T12:00:00"
```

### 3. Database Retrieval (All Query Pages)
- **CRITICAL**: Use `pickup_date::text` in SELECT queries
- This tells PostgreSQL to return the date as a text string
- Prevents the Supabase client from applying timezone conversion

```typescript
// ✅ CORRECT
const { data: orders } = await supabase
  .from("orders")
  .select("id, user_id, pickup_date::text, pickup_time, ...")

// ❌ WRONG - allows timezone conversion
.select("id, user_id, pickup_date, pickup_time, ...")
```

### 4. Date Display (All Components)
- Use `formatDateShort(dateStr)` from `lib/timezone.ts`
- Parses the `YYYY-MM-DD` string directly without creating Date objects
- Returns formatted string like "Dec 17"

```typescript
// ✅ CORRECT
const displayDate = formatDateShort("2025-12-17") // "Dec 17"

// ❌ WRONG - creates Date object, causes timezone issues
const displayDate = new Date("2025-12-17").toLocaleDateString()
```

## Files That Use This System

### Critical Files (DO NOT MODIFY)
1. **lib/timezone.ts** - Core timezone utilities
2. **app/schedule/page.tsx** - Date generation
3. **app/actions/stripe.ts** - Database writes (line 129: pickup_date)
4. **app/dashboard/page.tsx** - Date retrieval (line 17: pickup_date::text)
5. **app/manage/dashboard/page.tsx** - Date retrieval (line 43: pickup_date::text)
6. **app/orders/[id]/page.tsx** - Date retrieval (line 25: pickup_date::text)
7. **app/manage/orders/[id]/page.tsx** - Date retrieval (line 35: pickup_date::text)
8. **components/admin/admin-dashboard.tsx** - Date display (line 738: formatDateShort)
9. **components/user-dashboard.tsx** - Date display (line 332: formatDateShort)
10. **components/customer-order-detail.tsx** - Date display
11. **components/admin/order-detail.tsx** - Date display

## Testing Checklist

When making changes, always test:

1. **Schedule Page**: Select Dec 17 → Should show "Dec 17"
2. **Checkout Page**: Review order → Should show "Wed, Dec 17"
3. **Payment Processing**: Complete payment
4. **Customer Dashboard**: Check order → Should show "Dec 17"
5. **Admin Dashboard**: Check order → Should show "Dec 17"
6. **Order Detail Pages**: Both customer and admin → Should show "Dec 17"

All views should show the SAME date that was selected.

## Common Mistakes to Avoid

### ❌ Adding Time Components
```typescript
// WRONG
pickup_date: `${date}T12:00:00`
pickup_date: `${date}T00:00:00`
```

### ❌ Using new Date() for Display
```typescript
// WRONG
const date = new Date(order.pickup_date)
const formatted = date.toLocaleDateString()
```

### ❌ Removing ::text from Queries
```typescript
// WRONG
.select("pickup_date, pickup_time")

// CORRECT
.select("pickup_date::text, pickup_time")
```

### ❌ Using Date Objects for Comparison
```typescript
// WRONG
const today = new Date().toISOString().split('T')[0]

// CORRECT
const today = getTodayET()
```

## Why This Works

1. **Plain YYYY-MM-DD strings**: No time or timezone information
2. **PostgreSQL `date` column**: Stores dates without time
3. **`::text` casting**: Returns raw string, bypasses client conversion
4. **Direct string parsing**: No Date objects = no timezone shifts

## Emergency Rollback

If dates start shifting again:

1. Check all Supabase queries have `pickup_date::text`
2. Verify `lib/timezone.ts` functions are being used
3. Check that `pickup_date` inserts are plain strings (no `T...`)
4. Review any new code that touches dates

## Last Updated

December 17, 2025 - System confirmed working correctly.
```

```typescript file="" isHidden
