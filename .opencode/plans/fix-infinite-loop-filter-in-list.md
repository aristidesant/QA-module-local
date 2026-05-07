# Fix infinite loop when selecting "is in list" filter operator

## Root Cause

When user selects `in`/`not_in` operator ("is in list"), `sanitizeWidgetRuntimeFilters` normalizes the existing string value into an array (`valueMode === 'multi'`), always creating a **new array reference**.

In `FilterTableRow` (`DashboardWidgetAdvancedSection.tsx`):

1. **Effect 116** calls `setDraftValue(row.value)` — since sanitization always produces a new array ref, `useState` sees a "change" via `Object.is` and schedules a re-render
2. **`useDebouncedValue`** observes `draftValue` changing → **resets its 350ms debounce timer**
3. **Effect 120** compares `debouncedDraftValue` (stale string — debounce never fires) vs `row.value` (array) → mismatches → calls `handleRuntimeFilterValueChange(index, debouncedDraftValue)` with the old string
4. `handleRuntimeFilterValueChange` → `form.setValues` → sanitization creates another new array ref → goto 1

The debounce timer **never** has 350ms of stable `draftValue` to converge, so the cycle runs indefinitely.

## Fix

In `DashboardWidgetAdvancedSection.tsx:116-118`, change effect 116 to use a functional state update with deep equality:

```tsx
useEffect(() => {
	setDraftValue((prev) =>
		areRuntimeFilterValuesEqual(prev, row.value) ? prev : row.value
	);
}, [row.field, row.operator, row.value]);
```

When `row.value` is semantically equal to `draftValue` (same array contents), the updater returns `prev` — React skips the state update, `useDebouncedValue` sees no change, its timer fires after 350ms, `debouncedDraftValue` converges to the array, and effect 120 stops calling `handleRuntimeFilterValueChange`.

## Verification

- `npm run typecheck` — must pass
- Manual test: create a filter with any field, select "is in list" — no infinite loop / freeze
