# Campaigns Two-Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/campaigns` page from a single SectionCard to two separate cards (filters + table) with collapsible filters.

**Architecture:** Split the current single `SectionCard` into two: a collapsible filters card with SectionCard header (icon, title, description, badge, clear button, collapse toggle) and a table card with SectionCard header (icon, title, result count, action buttons). Move action buttons from ContentContainer to table card header.

**Tech Stack:** React, TypeScript, Mantine v9, react-i18next, CSS Modules

---

## File Structure

**Files to modify:**

- `src/locales/en/campaigns.list.json` - Add new i18n keys
- `src/locales/es/campaigns.list.json` - Add Spanish translations
- `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.tsx` - Remove FilterContainer, accept collapse props
- `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.module.css` - Remove header styles, keep controls grid
- `src/modules/campaigns/CampaignsList/CampaignsList.tsx` - Split into two SectionCards, add collapse state, move action buttons

**Files unchanged:**

- `src/modules/campaigns/CampaignsList/useCampaignsColumns.tsx` - No changes
- `src/components/SectionCard/SectionCard.tsx` - Use existing API

---

### Task 1: Add i18n Keys

**Files:**

- Modify: `src/locales/en/campaigns.list.json:61-91`
- Modify: `src/locales/es/campaigns.list.json:61-91`

- [ ] **Step 1: Add English i18n keys**

Open `src/locales/en/campaigns.list.json` and add the following keys inside the `filters` object (after line 76):

```json
"collapse": "Collapse filters",
"expand": "Expand filters",
"resultCount": "{{count}} campaigns found"
```

The `filters` section should now include:

```json
"filters": {
    "title": "Filters",
    "description": "Refine the paginated campaign list with server-side filters.",
    "search": "Campaign name",
    "searchPlaceholder": "Search campaigns...",
    "sortBy": "Sort by",
    "type": "Type",
    "allTypes": "All types",
    "executionType": "Execution Type",
    "allExecutionTypes": "All execution types",
    "status": "Status",
    "allStatuses": "All statuses",
    "includeInactive": "Include inactive",
    "advanced": "Advanced",
    "clearFilters": "Clear filters",
    "clearAllFilters": "Clear all filters",
    "collapse": "Collapse filters",
    "expand": "Expand filters",
    "resultCount": "{{count}} campaigns found",
    "sortOptions": {
        "updatedAt": "Last updated",
        "createdAt": "Creation date",
        "name": "Name",
        "status": "Status",
        "lastActivity": "Last activity"
    },
    "typeOptions": {
        "outbound": "Outbound",
        "inbound": "Inbound"
    },
    "executionTypeOptions": {
        "timeBased": "Time Based"
    }
}
```

- [ ] **Step 2: Add Spanish i18n keys**

Open `src/locales/es/campaigns.list.json` and add the same keys inside the `filters` object:

```json
"collapse": "Contraer filtros",
"expand": "Expandir filtros",
"resultCount": "{{count}} campañas encontradas"
```

- [ ] **Step 3: Verify i18n files are valid JSON**

Run: `npm run typecheck`
Expected: No errors related to JSON parsing

- [ ] **Step 4: Commit i18n changes**

```bash
git add src/locales/en/campaigns.list.json src/locales/es/campaigns.list.json
git commit -m "feat(i18n): add campaigns two-card layout keys"
```

---

### Task 2: Refactor CampaignFilters Component

**Files:**

- Modify: `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.tsx:1-171`
- Modify: `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.module.css:1-106`

- [ ] **Step 1: Update CampaignFilters props interface**

Open `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.tsx` and update the props interface to accept collapse state:

```typescript
interface CampaignFiltersProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	filters: {
		type?: string;
		status?: CampaignStatus;
		includeInactive?: boolean;
	};
	onFiltersChange: (filters: CampaignFiltersProps['filters']) => void;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
}
```

- [ ] **Step 2: Update CampaignFilters function signature**

Update the function signature to destructure the new props:

```typescript
export default function CampaignFilters({
	searchValue,
	onSearchChange,
	filters,
	onFiltersChange,
	isCollapsed,
	onToggleCollapse,
}: CampaignFiltersProps) {
```

- [ ] **Step 3: Remove FilterContainer and header markup**

Replace the entire return statement (lines 76-169) with just the controls grid:

```typescript
	return (
		<div className={styles.controlsGrid}>
			<TextInput
				label={t('filters.search')}
				placeholder={t('filters.searchPlaceholder')}
				value={searchValue}
				onChange={(event) => onSearchChange(event.currentTarget.value)}
				leftSection={<IconSearch size={16} className={styles.searchIcon} />}
				rightSection={
					searchValue ? (
						<CloseButton
							size='sm'
							onClick={() => onSearchChange('')}
							variant='subtle'
							aria-label={t('actions.close', { ns: 'common' })}
						/>
					) : null
				}
				size='sm'
				className={styles.searchInput}
			/>

			<Select
				label={t('filters.type')}
				placeholder={t('filters.allTypes')}
				data={typeOptions}
				value={filters.type}
				onChange={(value) =>
					handleFilterChange('type', value as string | null)
				}
				clearable
				size='sm'
				className={styles.typeSelect}
				comboboxProps={{ withinPortal: true }}
			/>

			<Select
				label={t('filters.status')}
				placeholder={t('filters.allStatuses')}
				data={statusOptions}
				value={filters.status}
				onChange={(value) =>
					handleFilterChange('status', value as CampaignStatus | null)
				}
				clearable
				size='sm'
				className={styles.statusSelect}
				comboboxProps={{ withinPortal: true }}
			/>

			<Switch
				label={t('filters.includeInactive')}
				checked={filters.includeInactive !== false}
				onChange={(event) =>
					handleFilterChange(
						'includeInactive',
						event.currentTarget.checked ? true : false
					)
				}
				size='sm'
				className={styles.inactiveSwitch}
			/>
		</div>
	);
```

- [ ] **Step 4: Remove unused imports**

Remove these imports from the top of the file:

- `Badge`
- `Button`
- `Group`
- `Text`
- `IconFilter`
- `FilterContainer`

The imports should now be:

```typescript
import { Select, Switch, TextInput, CloseButton } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import styles from './CampaignFilters.module.css';
import { CampaignStatus, CampaignStatusConfig } from '~/models/CampaignStatus';
import { useTranslation } from 'react-i18next';
```

- [ ] **Step 5: Remove activeFiltersCount and hasActiveFilters calculations**

Remove these lines (36-43):

```typescript
const activeFiltersCount =
	Object.entries(filters).filter(([key, value]) => {
		if (key === 'includeInactive') {
			return value === false;
		}
		return value !== undefined && value !== null;
	}).length + (searchValue.trim() ? 1 : 0);
const hasActiveFilters = activeFiltersCount > 0;
```

- [ ] **Step 6: Remove handleClearFilters function**

Remove these lines (67-74):

```typescript
const handleClearFilters = () => {
	onSearchChange('');
	onFiltersChange({
		type: undefined,
		status: undefined,
		includeInactive: true,
	});
};
```

- [ ] **Step 7: Update CSS to remove header styles**

Open `src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.module.css` and remove these classes:

- `.filtersContainer` (lines 1-3)
- `.titleBlock` (lines 5-10)
- `.titleIcon` (lines 12-14)
- `.title` (lines 16-20)
- `.activeBadge` and dark variant (lines 22-30)
- `.headerRow` (lines 32-39)
- `.titleGroup` (lines 41-43)
- `.subtitle` (lines 45-47)
- `.resetButton:disabled` (lines 88-91)

Keep only:

- `.controlsGrid` (lines 49-57)
- `.searchInput` and variants (lines 59-69)
- `.searchIcon` (lines 71-73)
- `.typeSelect` (lines 75-77)
- `.statusSelect` (lines 79-81)
- `.inactiveSwitch` (lines 83-86)
- Responsive adjustments (lines 93-106)

The CSS file should now be:

```css
.controlsGrid {
	display: grid;
	grid-template-columns:
		minmax(0, 1.8fr) minmax(150px, 0.8fr) minmax(160px, 0.9fr)
		auto;
	gap: var(--mantine-spacing-xs);
	align-items: end;
	width: 100%;
}

.searchInput {
	min-width: 0;
}

[data-mantine-color-scheme='dark'] .searchInput input {
	border-color: var(--mantine-color-dark-4);
}

.searchInput input {
	border-color: var(--mantine-color-gray-3);
}

.searchIcon {
	color: var(--mantine-color-gray-5);
}

.typeSelect {
	min-width: 0;
}

.statusSelect {
	min-width: 0;
}

.inactiveSwitch {
	padding-bottom: 2px;
	justify-self: start;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.searchInput,
	.typeSelect,
	.statusSelect,
	.inactiveSwitch {
		max-width: 100%;
		width: 100%;
	}

	.controlsGrid {
		grid-template-columns: 1fr;
	}
}
```

- [ ] **Step 8: Run typecheck**

Run: `npm run typecheck`
Expected: No errors (CampaignFilters will have unused props temporarily, but no type errors)

- [ ] **Step 9: Commit CampaignFilters refactor**

```bash
git add src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.tsx
git add src/modules/campaigns/CampaignsList/CampaignFilters/CampaignFilters.module.css
git commit -m "refactor(campaigns): simplify CampaignFilters to controls only"
```

---

### Task 3: Refactor CampaignsList to Two-Card Layout

**Files:**

- Modify: `src/modules/campaigns/CampaignsList/CampaignsList.tsx:321-407`

- [ ] **Step 1: Add collapse state**

Open `src/modules/campaigns/CampaignsList/CampaignsList.tsx` and add collapse state after the filters state (around line 106):

```typescript
const [filters, setFilters] = useState<CampaignFiltersType>(
	INITIAL_CAMPAIGN_FILTERS
);

const [filtersCollapsed, setFiltersCollapsed] = useState(false);
```

- [ ] **Step 2: Add required imports**

Add these imports at the top of the file (around line 18-23):

```typescript
import {
	IconAlertCircle,
	IconRocket,
	IconPlus,
	IconRefresh,
	IconFilter,
	IconList,
	IconChevronUp,
	IconChevronDown,
} from '@tabler/icons-react';
```

Also add `Badge`, `ActionIcon` to the Mantine imports (line 8-17):

```typescript
import {
	Text,
	Button,
	Modal,
	ActionIcon,
	Group,
	Loader,
	Center,
	LoadingOverlay,
	Badge,
} from '@mantine/core';
```

- [ ] **Step 3: Calculate active filters count**

Add this calculation after the `hasActiveFilters` variable (around line 134):

```typescript
const activeFiltersCount =
	Object.entries(filters).filter(([key, value]) => {
		if (key === 'includeInactive') {
			return value === false;
		}
		return value !== undefined && value !== null;
	}).length + (pagination.searchValue.trim() ? 1 : 0);
```

- [ ] **Step 4: Create clear filters handler**

Add this function after `handleCampaignClick` (around line 319):

```typescript
const handleClearFilters = () => {
	pagination.setSearchValue('');
	setFilters({
		type: undefined,
		status: undefined,
		includeInactive: true,
	});
};
```

- [ ] **Step 5: Replace ContentContainer and SectionCard structure**

Replace the entire return statement structure (lines 321-407) with the two-card layout:

```typescript
	return (
		<>
			<ContentContainer
				title={t('page.title')}
				description={t('page.description')}
			>
				<SectionCard
					icon={IconFilter}
					title={t('filters.title')}
					description={t('filters.description')}
					headerAccent='blue'
					padding='md'
					headerExtras={
						<Group gap='xs'>
							{activeFiltersCount > 0 && (
								<Badge size='sm' variant='light' color='blue'>
									{activeFiltersCount}
								</Badge>
							)}
						</Group>
					}
					headerActions={
						<Group gap='xs'>
							<Button
								variant='subtle'
								size='xs'
								onClick={handleClearFilters}
								disabled={activeFiltersCount === 0}
							>
								{t('filters.clearAllFilters')}
							</Button>
							<ActionIcon
								variant='subtle'
								size='sm'
								onClick={() => setFiltersCollapsed(!filtersCollapsed)}
								title={
									filtersCollapsed
										? t('filters.expand')
										: t('filters.collapse')
								}
							>
								{filtersCollapsed ? (
									<IconChevronDown size={16} />
								) : (
									<IconChevronUp size={16} />
								)}
							</ActionIcon>
						</Group>
					}
				>
					{!filtersCollapsed && (
						<CampaignFilters
							searchValue={pagination.searchValue}
							onSearchChange={pagination.setSearchValue}
							filters={filters}
							onFiltersChange={setFilters}
							isCollapsed={filtersCollapsed}
							onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
						/>
					)}
				</SectionCard>

				<SectionCard
					icon={IconList}
					title={t('page.title')}
					description={t('filters.resultCount', {
						count: campaignsResponse?.total || 0,
					})}
					headerAccent='green'
					padding='md'
					headerExtras={
						<Group gap='xs'>
							<Badge size='sm' variant='light' color='green'>
								{campaignsResponse?.total || 0}
							</Badge>
						</Group>
					}
					headerActions={
						<Group gap='xs'>
							{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE) && (
								<Button
									leftSection={<IconPlus size={16} />}
									onClick={handleShowAddNewCampaignModal}
									data-testid='header-create-campaign-btn'
								>
									{t('list.createCampaign')}
								</Button>
							)}
							<ActionIcon
								variant='subtle'
								size='sm'
								onClick={() => reloadCampaigns()}
								data-testid='header-refresh-btn'
								title='Refresh'
							>
								<IconRefresh size={16} />
							</ActionIcon>
						</Group>
					}
				>
					{isLoading ? (
						<CampaignsListSkeleton />
					) : isError ? (
						<div className={styles.errorContainer}>
							<IconAlertCircle size={32} color='red' />
							<Text c='red' mt='sm'>
								{error instanceof Error ? error.message : t('list.loadError')}
							</Text>
						</div>
					) : campaignsResponse?.data?.length === 0 && hasActiveFilters ? (
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							message={t('list.noCampaignsFound')}
							description={t('list.noCampaignsFoundDesc')}
						/>
					) : !campaignsResponse?.data ||
					  campaignsResponse.data.length === 0 ? (
						<EmptyState
							icon={<IconRocket size={64} stroke={1.2} />}
							message={t('list.noCampaignsYet')}
							description={t('list.noCampaignsYetDesc')}
							action={
								<Button
									leftSection={<IconPlus size={18} />}
									onClick={handleShowAddNewCampaignModal}
								>
									{t('list.createButton')}
								</Button>
							}
						/>
					) : (
						<>
							<BaseTable
								data={campaignsResponse?.data || []}
								columns={columns}
								onRowClick={handleCampaignClick}
								density='compact'
							/>

							<PaginationControls
								currentPage={pagination.currentPage}
								totalPages={totalPages}
								itemsPerPage={pagination.itemsPerPage}
								totalItems={campaignsResponse?.total || 0}
								onPageChange={pagination.setCurrentPage}
								onItemsPerPageChange={handleItemsPerPageChange}
								searchTerm={pagination.debouncedSearch}
								isLoading={isLoading}
								itemLabel={t('list.itemLabel')}
							/>
						</>
					)}
				</SectionCard>
			</ContentContainer>
```

- [ ] **Step 6: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 7: Commit two-card layout**

```bash
git add src/modules/campaigns/CampaignsList/CampaignsList.tsx
git commit -m "feat(campaigns): implement two-card layout with collapsible filters"
```

---

### Task 4: Manual Testing and Polish

**Files:**

- None (testing only)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: Dev server starts at http://localhost:5173

- [ ] **Step 2: Navigate to campaigns page**

Open: http://localhost:5173/campaigns
Expected: Page loads with two separate cards

- [ ] **Step 3: Verify filters card**

Check:

- Filters card has blue icon badge with filter icon
- Title shows "Filters"
- Description shows below title
- Active filter count badge appears when filters are set
- "Clear all filters" button is visible and functional
- Collapse/expand toggle button works

- [ ] **Step 4: Verify table card**

Check:

- Table card has green icon badge with list icon
- Title shows "Campaigns"
- Description shows result count (e.g., "24 campaigns found")
- Result count badge is visible
- "Create New Campaign" button appears (if user has permission)
- Refresh button is visible and functional

- [ ] **Step 5: Verify responsive behavior**

Resize browser to mobile width (< 768px):

- Filter controls stack vertically
- Layout remains functional

- [ ] **Step 6: Verify dark mode**

Toggle dark mode in Mantine dev tools:

- Both cards render correctly
- Contrast is maintained
- Icons and badges are visible

- [ ] **Step 7: Test collapse functionality**

Click collapse toggle:

- Filters card body hides
- Only header remains visible
- Chevron icon changes direction
- Click again to expand

- [ ] **Step 8: Test filter interactions**

Set various filters:

- Search text
- Type dropdown
- Status dropdown
- Include inactive toggle

Verify:

- Active filter count badge updates
- Result count in table card updates
- Table data filters correctly
- Clear all filters resets everything

- [ ] **Step 9: Test action buttons**

Click "Create New Campaign":

- Wizard modal opens

Click refresh button:

- Data reloads

Click table rows:

- Navigation to campaign detail works

- [ ] **Step 10: Final commit (if any fixes needed)**

```bash
git add .
git commit -m "fix(campaigns): polish two-card layout"
```

---

## Summary

This plan implements the two-card layout redesign for the campaigns page:

1. **Task 1** - Added i18n keys for collapse/expand and result count
2. **Task 2** - Refactored CampaignFilters to be a controls-only component
3. **Task 3** - Split single SectionCard into two cards with proper headers
4. **Task 4** - Manual testing to verify all functionality

The implementation follows the approved spec and maintains all existing functionality while improving visual separation and adding collapsible filters.
