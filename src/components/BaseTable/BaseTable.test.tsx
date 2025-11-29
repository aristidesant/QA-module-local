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
});
