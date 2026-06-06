# Campaigns Page: Two-Card Layout Redesign

**Date:** 2026-06-06  
**Status:** Approved for implementation

## Overview

Redesign the `/campaigns` page layout from a single `SectionCard` (containing both filters and table) to two separate `SectionCard` components: one for filters and one for the table. This improves visual separation, follows patterns established in other pages (e.g., InvoicesPage), and enables collapsible filters.

## Current State

The campaigns page currently uses a single `SectionCard` that wraps:

- `CampaignFilters` component (search, type, status, include inactive)
- `BaseTable` with campaign data
- `PaginationControls`

The page header (`ContentContainer`) contains the title, description, and action buttons (create campaign, refresh) in the `titleRight` prop.

**Key files:**

- `src/modules/campaigns/CampaignsList/CampaignsList.tsx` (main layout)
- `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.tsx` (filters)

## Target State

### Layout Structure

```
ContentContainer (title + description only, no titleRight)
├── SectionCard: Filters
│   ├── Header: icon + title + description + active count badge + "Clear all" + collapse toggle
│   └── Body: filter controls (search, type, status, include inactive)
└── SectionCard: Table
    ├── Header: icon + title + result count + "Create Campaign" button + refresh button
    └── Body: BaseTable + PaginationControls
```

### Filters Card

**Component:** `SectionCard` with collapsible behavior

**Header:**

- Icon: `IconFilter` in a colored badge (blue accent)
- Title: "Filters" (i18n: `filters.title`)
- Description: "Narrow down your campaign list" (i18n: `filters.description`)
- Active filter count badge (shown only when count > 0)
- "Clear all filters" button (right-aligned, subtle variant)
- Collapse/expand toggle button (chevron up/down icon)

**Body:**

- Same filter controls as current implementation:
  - Search (`TextInput`)
  - Type (`Select`: OUTBOUND, INBOUND)
  - Status (`Select`: ACTIVE, INACTIVE, FAILED)
  - Include inactive (`Switch`)
- Grid layout: `minmax(0, 1.8fr) minmax(150px, 0.8fr) minmax(160px, 0.9fr) auto`
- Responsive: single column at `max-width: 768px`

**Collapsible behavior:**

- State managed locally in `CampaignsList` (default: expanded)
- When collapsed: only header visible, body hidden
- Collapse toggle: `IconChevronUp` (expanded) / `IconChevronDown` (collapsed)
- Smooth transition via CSS `max-height` or conditional rendering

**Props:**

- `searchValue`, `onSearchChange` (string handlers)
- `filters`, `onFiltersChange` (filter state object)
- `isCollapsed`, `onToggleCollapse` (collapse state handlers)

### Table Card

**Component:** `SectionCard`

**Header:**

- Icon: `IconList` in a colored badge (green accent)
- Title: "Campaigns" (i18n: `page.title` or new key)
- Description: "{count} campaigns found" (i18n: `list.resultCount`, interpolated)
- Result count badge (always shown)
- "Create Campaign" button (primary variant, left section: `IconPlus`)
  - Shown only if user has `CAMPAIGNS.CREATE` permission
- Refresh button (action icon, `IconRefresh`)

**Body:**

- Conditional rendering:
  - Loading: `CampaignsListSkeleton`
  - Error: error container with icon + message
  - Empty (with filters): `EmptyState` ("no campaigns found")
  - Empty (no data): `EmptyState` with "Create Campaign" action
  - Data: `BaseTable` + `PaginationControls`
- `BaseTable` props:
  - `data`: campaign array
  - `columns`: from `useCampaignsColumns`
  - `onRowClick`: navigate to `/campaign/view/:id`
  - `density`: `'compact'`
- `PaginationControls` props:
  - `currentPage`, `totalPages`, `itemsPerPage`, `totalItems`
  - `onPageChange`, `onItemsPerPageChange`
  - `searchTerm`, `isLoading`, `itemLabel`

### ContentContainer

Simplified to contain only:

- `title`: "Campaigns" (i18n: `page.title`)
- `description`: "Manage your inbound and outbound campaigns" (i18n: `page.description`)
- No `titleRight` (actions moved to table card header)

## Implementation Details

### Component Changes

**`CampaignsList.tsx`:**

1. Add state for collapse: `const [filtersCollapsed, setFiltersCollapsed] = useState(false);`
2. Replace single `SectionCard` with two separate `SectionCard` components
3. Remove `titleRight` from `ContentContainer`
4. Pass action buttons to table card via `headerActions` or `actions` prop
5. Pass collapse state to `CampaignFilters`

**`CampaignFilters.tsx`:**

1. Add `isCollapsed` and `onToggleCollapse` props
2. Remove internal `FilterContainer` wrapper (use `SectionCard` body instead)
3. Move header content (title, badge, clear button) to parent `SectionCard` header
4. Keep filter controls grid in component body
5. Conditionally render controls based on `isCollapsed`

**`useCampaignsColumns.tsx`:**

- No changes required

### i18n Keys

**New keys to add:**

- `campaigns.list.filters.description`: "Narrow down your campaign list"
- `campaigns.list.resultCount`: "{{count}} campaigns found"
- `campaigns.list.filters.collapse`: "Collapse filters"
- `campaigns.list.filters.expand`: "Expand filters"

**Existing keys to reuse:**

- `campaigns.list.page.title`: "Campaigns"
- `campaigns.list.page.description`: "Manage your inbound and outbound campaigns"
- `campaigns.list.filters.title`: "Filters"
- `campaigns.list.filters.clearAllFilters`: "Clear all filters"
- `campaigns.list.list.createCampaign`: "Create Campaign"

### Styling

**CSS Modules:**

- `CampaignFilters.module.css`:
  - Remove `.filtersContainer` (no longer needed)
  - Keep `.controlsGrid` and responsive breakpoints
  - Remove header-related styles (moved to `SectionCard`)

**SectionCard props:**

- Filters card: `icon={IconFilter}`, `headerAccent="blue"`, `padding="md"`
- Table card: `icon={IconList}`, `headerAccent="green"`, `padding="md"`

### State Management

**Collapse state:**

- Local state in `CampaignsList`: `useState(false)` (default expanded)
- No persistence across navigation (resets on page reload)
- Could be extended to `localStorage` if user preference persistence is needed later

**Filter state:**

- No changes (remains in `CampaignsList` via `useState`)

**Pagination state:**

- No changes (remains in `usePagination` hook)

## Migration Path

1. **Phase 1: Component structure**
   - Split single `SectionCard` into two
   - Move action buttons to table card header
   - Simplify `ContentContainer`

2. **Phase 2: Filters card**
   - Refactor `CampaignFilters` to work with `SectionCard` header
   - Add collapse functionality
   - Update i18n keys

3. **Phase 3: Table card**
   - Add header with icon, title, result count
   - Move action buttons to `headerActions`
   - Verify table and pagination work correctly

4. **Phase 4: Polish**
   - Test responsive behavior
   - Verify dark/light mode
   - Test collapse/expand animation
   - Update tests (if any)

## Testing Considerations

**Manual testing:**

- Filters card collapse/expand works correctly
- Action buttons in table card header function properly
- Result count updates when filters change
- Responsive layout at 768px breakpoint
- Dark/light mode rendering
- Keyboard navigation for collapse toggle

**Automated testing:**

- Update existing tests to reflect new structure
- Test collapse state persistence (if implemented)
- Verify permission-based button visibility

## Out of Scope

- Changes to filter logic or behavior
- Changes to table columns or data fetching
- Changes to campaign detail view
- Persistence of collapse state to `localStorage`
- Animation refinements beyond basic collapse/expand

## References

**Similar patterns in codebase:**

- `src/modules/billing/InvoicesPage/InvoicesPage.tsx` (multi-card layout)
- `src/components/SectionCard/SectionCard.tsx` (component API)
- `src/modules/outcomes/components/DispositionCatalogList/DispositionCatalogList.tsx` (SectionCard with filters)

**Visual mockup:**

- See `.superpowers/brainstorm/75423-1780761001/content/02-final-design.html`
