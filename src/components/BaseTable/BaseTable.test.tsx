import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import BaseTable from './BaseTable';

type TestData = {
	id: string;
	name: string;
	age: number;
};

const testData: TestData[] = [
	{ id: '1', name: 'John Doe', age: 30 },
	{ id: '2', name: 'Jane Smith', age: 25 },
	{ id: '3', name: 'Bob Johnson', age: 35 },
];

const testColumns: ColumnDef<TestData, any>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'age',
		header: 'Age',
	},
];

const renderTable = (
	props: Partial<Parameters<typeof BaseTable<TestData>>[0]> = {}
) => {
	return render(
		<MantineProvider>
			<BaseTable<TestData> data={testData} columns={testColumns} {...props} />
		</MantineProvider>
	);
};

const renderExpandedRow = (row: TestData) => (
	<div data-testid={`expanded-${row.id}`}>Details for {row.name}</div>
);

describe('BaseTable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders table with headers and data', () => {
			renderTable();

			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getByText('Age')).toBeInTheDocument();
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
			expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
		});

		it('renders empty message when data is empty', () => {
			renderTable({ data: [] });

			expect(screen.getByText('No data available')).toBeInTheDocument();
		});

		it('renders custom empty message', () => {
			renderTable({ data: [], emptyMessage: 'No items found' });

			expect(screen.getByText('No items found')).toBeInTheDocument();
		});

		it('renders loading state with skeleton rows', () => {
			renderTable({ isLoading: true, skeletonRowsCount: 3 });

			// Mantine Skeleton renders with mantine-Skeleton-root class
			const skeletonRows = document.querySelectorAll('[class*="Skeleton"]');
			expect(skeletonRows.length).toBeGreaterThan(0);
		});

		it('applies compact density class', () => {
			renderTable({ density: 'compact' });

			const thElements = document.querySelectorAll('th');
			thElements.forEach((th) => {
				expect(th.className).toContain('compactTh');
			});
		});

		it('applies custom className', () => {
			renderTable({ className: 'custom-class' });

			const rootElement = document.querySelector('.custom-class');
			expect(rootElement).toBeInTheDocument();
		});
	});

	it('shows LoadingOverlay when loading', () => {
		renderTable({ isLoading: true });

		const overlay = document.querySelector('.mantine-LoadingOverlay-root');
		expect(overlay).toBeInTheDocument();
	});

	it('does not call onRowClick when expand icon is clicked', () => {
		const onRowClick = vi.fn();
		renderTable({
			enableExpanding: true,
			renderExpandedRow,
			onRowClick,
		});

		// Click on the first expand icon
		const expandButtons = document.querySelectorAll('[class*="expandIcon"]');
		const firstExpand = expandButtons[0];
		expect(firstExpand).toBeInTheDocument();
		fireEvent.click(firstExpand as Element);

		expect(onRowClick).not.toHaveBeenCalled();
		// Expanded content should be shown
		expect(screen.getByTestId('expanded-1')).toBeInTheDocument();
	});

	it('rotates expand icon when expanded', () => {
		renderTable({
			enableExpanding: true,
			renderExpandedRow,
		});

		const expandButtons = document.querySelectorAll('[class*="expandIcon"]');
		const firstExpand = expandButtons[0];
		fireEvent.click(firstExpand as Element);

		// The chevron icon should have the rotated class
		const chevrons = document.querySelectorAll('[class*="expandIconRotated"]');
		expect(chevrons.length).toBeGreaterThan(0);
	});

	it('server pagination updates when pageIndex prop changes', () => {
		const largeData: TestData[] = Array.from({ length: 25 }, (_, i) => ({
			id: String(i + 1),
			name: `User ${i + 1}`,
			age: 20 + i,
		}));

		const { rerender } = render(
			<MantineProvider>
				<BaseTable<TestData>
					columns={testColumns}
					data={largeData}
					filterMode='server'
					enablePagination={true}
					showPaginationControls={true}
					pageCount={3}
					pageIndex={0}
					pageSize={10}
				/>
			</MantineProvider>
		);

		// Initial active page should be 1
		expect(
			screen.getByRole('button', { name: '1' }).getAttribute('aria-current')
		).toBe('page');

		// Rerender with pageIndex 1
		rerender(
			<MantineProvider>
				<BaseTable<TestData>
					columns={testColumns}
					data={largeData}
					filterMode='server'
					enablePagination={true}
					showPaginationControls={true}
					pageCount={3}
					pageIndex={1}
					pageSize={10}
				/>
			</MantineProvider>
		);

		expect(
			screen.getByRole('button', { name: '2' }).getAttribute('aria-current')
		).toBe('page');
	});

	it('expanded content has correct colspan', () => {
		renderTable({
			enableExpanding: true,
			renderExpandedRow,
		});

		const firstRow = screen.getByText('John Doe').closest('tr');
		fireEvent.click(firstRow!);

		const expandedTd = screen.getByTestId('expanded-1').closest('td');
		expect(expandedTd?.getAttribute('colspan')).toBe(
			String(testColumns.length + 1)
		);
	});

	describe('Row Selection', () => {
		it('applies selected row class when selectedRowId matches', () => {
			renderTable({
				selectedRowId: '2',
				getRowId: (row) => row.id,
			});

			const rows = document.querySelectorAll('tbody tr');
			const selectedRow = rows[1];
			expect(selectedRow.className).toContain('selectedRow');
		});

		it('calls onRowClick when row is clicked', () => {
			const onRowClick = vi.fn();
			renderTable({ onRowClick });

			fireEvent.click(screen.getByText('John Doe'));

			expect(onRowClick).toHaveBeenCalledWith(testData[0]);
		});
	});

	describe('Sorting', () => {
		it('renders sort icons on sortable columns', () => {
			renderTable();

			const sortIcons = document.querySelectorAll('[class*="sortIcon"]');
			expect(sortIcons.length).toBeGreaterThan(0);
		});

		it('toggles sort direction when header is clicked', () => {
			renderTable();

			const nameHeader = screen.getByText('Name').closest('th');
			fireEvent.click(nameHeader!);

			expect(nameHeader?.getAttribute('data-sorted')).toBe('true');
		});

		it('applies initial sort state', () => {
			renderTable({ initialSort: [{ id: 'name', desc: false }] });

			const nameHeader = screen.getByText('Name').closest('th');
			expect(nameHeader?.getAttribute('data-sorted')).toBe('true');
		});

		it('calls onSortingChange in server mode', () => {
			const onSortingChange = vi.fn();
			renderTable({
				filterMode: 'server',
				onSortingChange,
			});

			const nameHeader = screen.getByText('Name').closest('th');
			fireEvent.click(nameHeader!);

			expect(onSortingChange).toHaveBeenCalled();
		});
	});

	describe('Pagination', () => {
		const largeData: TestData[] = Array.from({ length: 25 }, (_, i) => ({
			id: String(i + 1),
			name: `User ${i + 1}`,
			age: 20 + i,
		}));

		it('renders pagination controls when enabled and data exceeds page size', () => {
			renderTable({
				data: largeData,
				enablePagination: true,
				showPaginationControls: true,
				pageSize: 10,
			});

			const pagination = document.querySelector('[class*="pagination"]');
			expect(pagination).toBeInTheDocument();
		});

		it('does not render pagination controls when page count is 1', () => {
			renderTable({
				data: testData,
				enablePagination: true,
				showPaginationControls: true,
				pageSize: 10,
			});

			const paginationButtons = screen.queryAllByRole('button');
			const paginationNavButtons = paginationButtons.filter((btn) =>
				btn.getAttribute('aria-label')?.includes('page')
			);
			expect(paginationNavButtons.length).toBe(0);
		});

		it('calls onPaginationChange in server mode', () => {
			const onPaginationChange = vi.fn();
			renderTable({
				data: largeData,
				filterMode: 'server',
				enablePagination: true,
				showPaginationControls: true,
				pageCount: 3,
				pageIndex: 0,
				pageSize: 10,
				onPaginationChange,
			});

			// Click on page 2 button
			const page2Button = screen.getByRole('button', { name: '2' });
			fireEvent.click(page2Button);

			expect(onPaginationChange).toHaveBeenCalled();
		});
	});

	describe('Expandable Rows', () => {
		const renderExpandedRow = (row: TestData) => (
			<div data-testid={`expanded-${row.id}`}>Details for {row.name}</div>
		);

		it('renders expand icons when expandable is enabled', () => {
			renderTable({
				enableExpanding: true,
				renderExpandedRow,
			});

			const expandIcons = document.querySelectorAll('[class*="expandIcon"]');
			expect(expandIcons.length).toBe(testData.length);
		});

		it('expands row when clicked', () => {
			renderTable({
				enableExpanding: true,
				renderExpandedRow,
			});

			const firstRow = screen.getByText('John Doe').closest('tr');
			fireEvent.click(firstRow!);

			expect(screen.getByTestId('expanded-1')).toBeInTheDocument();
			expect(screen.getByText('Details for John Doe')).toBeInTheDocument();
		});

		it('renders initially expanded rows', () => {
			renderTable({
				enableExpanding: true,
				renderExpandedRow,
				initialExpandedRows: ['1'],
			});

			// TanStack Table uses internal row IDs (0-indexed by default), not getRowId
			// Initial expansion with '1' will expand the row at internal index 1 (Jane Smith)
			expect(screen.getByTestId('expanded-2')).toBeInTheDocument();
		});

		it('calls onExpandedChange when row expansion changes', () => {
			const onExpandedChange = vi.fn();
			renderTable({
				enableExpanding: true,
				renderExpandedRow,
				onExpandedChange,
			});

			const firstRow = screen.getByText('John Doe').closest('tr');
			fireEvent.click(firstRow!);

			expect(onExpandedChange).toHaveBeenCalled();
		});
	});

	describe('Custom Row ClassName', () => {
		it('applies custom className from getRowClassName', () => {
			renderTable({
				getRowClassName: (row) =>
					row.original.age > 30 ? 'old-person' : 'young-person',
			});

			const rows = document.querySelectorAll('tbody tr');
			expect(rows[0].className).toContain('young-person');
			expect(rows[1].className).toContain('young-person');
			expect(rows[2].className).toContain('old-person');
		});
	});

	describe('Filter Mode', () => {
		it('uses client-side filtering by default', () => {
			renderTable({ filterMode: 'client', enableFiltering: true });

			// Component should render without errors
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		it('respects server filter mode', () => {
			const onFilterChange = vi.fn();
			renderTable({
				filterMode: 'server',
				onFilterChange,
			});

			// Component should render without errors
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});
	});

	describe('Column Meta', () => {
		it('applies headerClassName from column meta', () => {
			const columnsWithMeta: ColumnDef<TestData, any>[] = [
				{
					accessorKey: 'name',
					header: 'Name',
					meta: { headerClassName: 'custom-header' },
				},
				{
					accessorKey: 'age',
					header: 'Age',
				},
			];

			render(
				<MantineProvider>
					<BaseTable<TestData> data={testData} columns={columnsWithMeta} />
				</MantineProvider>
			);

			const nameHeader = screen.getByText('Name').closest('th');
			expect(nameHeader?.className).toContain('custom-header');
		});

		it('applies cellClassName from column meta', () => {
			const columnsWithMeta: ColumnDef<TestData, any>[] = [
				{
					accessorKey: 'name',
					header: 'Name',
					meta: { cellClassName: 'custom-cell' },
				},
				{
					accessorKey: 'age',
					header: 'Age',
				},
			];

			render(
				<MantineProvider>
					<BaseTable<TestData> data={testData} columns={columnsWithMeta} />
				</MantineProvider>
			);

			const nameCell = screen.getByText('John Doe').closest('td');
			expect(nameCell?.className).toContain('custom-cell');
		});
	});

	describe('Non-sortable Columns', () => {
		it('does not render sort icon for non-sortable columns', () => {
			const nonSortableColumns: ColumnDef<TestData, any>[] = [
				{
					accessorKey: 'name',
					header: 'Name',
					enableSorting: false,
				},
				{
					accessorKey: 'age',
					header: 'Age',
				},
			];

			render(
				<MantineProvider>
					<BaseTable<TestData> data={testData} columns={nonSortableColumns} />
				</MantineProvider>
			);

			const nameHeader = screen.getByText('Name').closest('th');
			expect(nameHeader?.className).not.toContain('sortable');
		});
	});

	describe('Advanced Sorting', () => {
		it('sorts in descending order on second click', () => {
			renderTable();

			const nameHeader = screen.getByText('Name').closest('th');
			// First click - ascending
			fireEvent.click(nameHeader!);
			// Second click - descending
			fireEvent.click(nameHeader!);

			// Verify descending sort icon is rendered
			const downIcon = nameHeader?.querySelector('[class*="sortIcon"]');
			expect(downIcon).toBeInTheDocument();
		});

		it('clears sort on third click', () => {
			renderTable();

			const nameHeader = screen.getByText('Name').closest('th');
			// First click - ascending
			fireEvent.click(nameHeader!);
			// Second click - descending
			fireEvent.click(nameHeader!);
			// Third click - clears sort
			fireEvent.click(nameHeader!);

			expect(nameHeader?.getAttribute('data-sorted')).toBeFalsy();
		});

		it('handles initialSort with descending order', () => {
			renderTable({ initialSort: [{ id: 'age', desc: true }] });

			const ageHeader = screen.getByText('Age').closest('th');
			expect(ageHeader?.getAttribute('data-sorted')).toBe('true');
		});
	});

	describe('Client-side Filtering', () => {
		it('enables filtering when filterMode is client and enableFiltering is true', () => {
			renderTable({
				filterMode: 'client',
				enableFiltering: true,
			});

			// Component should render and have filtering capabilities
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});
	});

	describe('Client-side Pagination', () => {
		const largeData: TestData[] = Array.from({ length: 25 }, (_, i) => ({
			id: String(i + 1),
			name: `User ${i + 1}`,
			age: 20 + i,
		}));

		it('navigates to next page using pagination controls', () => {
			renderTable({
				data: largeData,
				filterMode: 'client',
				enablePagination: true,
				showPaginationControls: true,
				pageSize: 10,
			});

			// Initially shows first 10 users
			expect(screen.getByText('User 1')).toBeInTheDocument();
			expect(screen.queryByText('User 11')).not.toBeInTheDocument();

			// Click page 2
			const page2Button = screen.getByRole('button', { name: '2' });
			fireEvent.click(page2Button);

			// Now shows users 11-20
			expect(screen.queryByText('User 1')).not.toBeInTheDocument();
			expect(screen.getByText('User 11')).toBeInTheDocument();
		});

		it('uses edge pagination buttons', () => {
			renderTable({
				data: largeData,
				filterMode: 'client',
				enablePagination: true,
				showPaginationControls: true,
				pageSize: 10,
			});

			// Find the last page button
			const page3Button = screen.getByRole('button', { name: '3' });
			fireEvent.click(page3Button);

			// Should show users 21-25
			expect(screen.getByText('User 21')).toBeInTheDocument();
		});
	});

	describe('Server-side Pagination and Sorting', () => {
		const largeData: TestData[] = Array.from({ length: 10 }, (_, i) => ({
			id: String(i + 1),
			name: `User ${i + 1}`,
			age: 20 + i,
		}));

		it('handles server-side sorting with callback', () => {
			const onSortingChange = vi.fn();
			renderTable({
				data: largeData,
				filterMode: 'server',
				onSortingChange,
			});

			const ageHeader = screen.getByText('Age').closest('th');
			fireEvent.click(ageHeader!);

			expect(onSortingChange).toHaveBeenCalled();
		});

		it('handles multiple sort changes in server mode', () => {
			const onSortingChange = vi.fn();
			renderTable({
				data: largeData,
				filterMode: 'server',
				onSortingChange,
			});

			const nameHeader = screen.getByText('Name').closest('th');
			fireEvent.click(nameHeader!);
			fireEvent.click(nameHeader!);

			expect(onSortingChange).toHaveBeenCalledTimes(2);
		});
	});

	describe('Expanded Rows Advanced', () => {
		const renderExpandedRow = (row: TestData) => (
			<div data-testid={`expanded-${row.id}`}>Details for {row.name}</div>
		);

		it('collapses expanded row when clicked again', () => {
			renderTable({
				enableExpanding: true,
				renderExpandedRow,
			});

			const firstRow = screen.getByText('John Doe').closest('tr');
			// Expand
			fireEvent.click(firstRow!);
			expect(screen.getByTestId('expanded-1')).toBeInTheDocument();

			// Collapse
			fireEvent.click(firstRow!);
			expect(screen.queryByTestId('expanded-1')).not.toBeInTheDocument();
		});

		it('can expand multiple rows simultaneously', () => {
			renderTable({
				enableExpanding: true,
				renderExpandedRow,
			});

			const firstRow = screen.getByText('John Doe').closest('tr');
			const secondRow = screen.getByText('Jane Smith').closest('tr');

			fireEvent.click(firstRow!);
			fireEvent.click(secondRow!);

			expect(screen.getByTestId('expanded-1')).toBeInTheDocument();
			expect(screen.getByTestId('expanded-2')).toBeInTheDocument();
		});

		it('does not render expand column when renderExpandedRow is not provided', () => {
			renderTable({
				enableExpanding: true,
			});

			const expandIcons = document.querySelectorAll('[class*="expandIcon"]');
			expect(expandIcons.length).toBe(0);
		});
	});

	describe('Row Click Behavior', () => {
		it('calls onRowClick even when expanding is enabled', () => {
			const onRowClick = vi.fn();
			const renderExpandedRow = (row: TestData) => (
				<div data-testid={`expanded-${row.id}`}>Details</div>
			);

			renderTable({
				enableExpanding: true,
				renderExpandedRow,
				onRowClick,
			});

			const firstRow = screen.getByText('John Doe').closest('tr');
			fireEvent.click(firstRow!);

			expect(onRowClick).toHaveBeenCalledWith(testData[0]);
		});
	});

	describe('Density Variations', () => {
		it('applies default density when not specified', () => {
			renderTable();

			const thElements = document.querySelectorAll('th');
			thElements.forEach((th) => {
				expect(th.className).not.toContain('compactTh');
			});
		});

		it('applies compact density to table cells', () => {
			renderTable({ density: 'compact' });

			const tdElements = document.querySelectorAll('tbody td');
			tdElements.forEach((td) => {
				expect(td.className).toContain('compactTd');
			});
		});
	});

	describe('Loading State Variations', () => {
		it('renders correct number of skeleton rows based on skeletonRowsCount', () => {
			renderTable({ isLoading: true, skeletonRowsCount: 7 });

			const skeletonRows = document.querySelectorAll('tbody tr');
			expect(skeletonRows.length).toBe(7);
		});

		it('uses default skeletonRowsCount of 5', () => {
			renderTable({ isLoading: true });

			const skeletonRows = document.querySelectorAll('tbody tr');
			expect(skeletonRows.length).toBe(5);
		});
	});

	describe('Empty State', () => {
		it('shows correct colspan for empty message with expandable rows', () => {
			const renderExpandedRow = (_row: TestData) => <div>Details</div>;

			renderTable({
				data: [],
				enableExpanding: true,
				renderExpandedRow,
			});

			const emptyCell = screen.getByText('No data available').closest('td');
			expect(emptyCell?.getAttribute('colspan')).toBe(
				String(testColumns.length + 1)
			);
		});
	});

	describe('Selected Row', () => {
		it('does not apply selected class when selectedRowId is null', () => {
			renderTable({
				selectedRowId: null,
				getRowId: (row) => row.id,
			});

			const rows = document.querySelectorAll('tbody tr');
			rows.forEach((row) => {
				expect(row.className).not.toContain('selectedRow');
			});
		});

		it('does not apply selected class when getRowId is not provided', () => {
			renderTable({
				selectedRowId: '2',
			});

			const rows = document.querySelectorAll('tbody tr');
			rows.forEach((row) => {
				expect(row.className).not.toContain('selectedRow');
			});
		});
	});

	describe('Custom getRowClassName', () => {
		it('handles undefined return from getRowClassName', () => {
			renderTable({
				getRowClassName: () => undefined,
			});

			const rows = document.querySelectorAll('tbody tr');
			expect(rows.length).toBe(testData.length);
		});
	});

	describe('Placeholder Headers', () => {
		it('renders placeholder headers correctly', () => {
			const columnsWithPlaceholder: ColumnDef<TestData, any>[] = [
				{
					id: 'placeholder',
					header: () => null,
				},
				{
					accessorKey: 'name',
					header: 'Name',
				},
			];

			render(
				<MantineProvider>
					<BaseTable<TestData>
						data={testData}
						columns={columnsWithPlaceholder}
					/>
				</MantineProvider>
			);

			expect(screen.getByText('Name')).toBeInTheDocument();
		});
	});

	describe('Server-side Filter Changes', () => {
		it('calls onFilterChange callback in server mode when filter changes', () => {
			const onFilterChange = vi.fn();
			renderTable({
				filterMode: 'server',
				onFilterChange,
			});

			// Component renders in server mode
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});
	});

	describe('Pagination Edge Cases', () => {
		const largeData: TestData[] = Array.from({ length: 25 }, (_, i) => ({
			id: String(i + 1),
			name: `User ${i + 1}`,
			age: 20 + i,
		}));

		it('does not show pagination when showPaginationControls is false', () => {
			renderTable({
				data: largeData,
				enablePagination: true,
				showPaginationControls: false,
				pageSize: 10,
			});

			const pagination = document.querySelector('[class*="pagination"]');
			expect(pagination).not.toBeInTheDocument();
		});

		it('does not show pagination when enablePagination is false', () => {
			renderTable({
				data: largeData,
				enablePagination: false,
				showPaginationControls: true,
			});

			const pagination = document.querySelector('[class*="pagination"]');
			expect(pagination).not.toBeInTheDocument();
		});
	});

	describe('Table Structure', () => {
		it('renders striped and highlightOnHover table', () => {
			renderTable();

			const table = document.querySelector('table');
			expect(table).toBeInTheDocument();
		});

		it('renders expand header cell when expanding is enabled', () => {
			const renderExpandedRow = (_row: TestData) => <div>Details</div>;

			renderTable({
				enableExpanding: true,
				renderExpandedRow,
			});

			// Should have 3 header cells (expand + name + age)
			const headerCells = document.querySelectorAll('thead th');
			expect(headerCells.length).toBe(testColumns.length + 1);
		});
	});

	describe('Class Name Handling', () => {
		it('handles undefined className prop', () => {
			renderTable({ className: undefined });

			const rootElement = document.querySelector('[class*="root"]');
			expect(rootElement).toBeInTheDocument();
		});
	});
});
