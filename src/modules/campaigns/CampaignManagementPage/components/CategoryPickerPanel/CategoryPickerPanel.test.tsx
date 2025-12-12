import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CategoryPickerPanel from './CategoryPickerPanel';

vi.mock('~/modules/campaigns/hooks/useFilteredCategories', () => ({
	useCampaignCategoriesWithFilters: () => ({
		categories: [
			{
				id: 1,
				name: 'Sales',
				code: 'sales',
				description: '',
				active: true,
				userId: 1,
				clientId: 1,
				createdAt: '',
				updatedAt: '',
			},
		],
		pagination: { page: 1, pageSize: 10, total: 1 },
		filters: { search: '', status: 'all', sortBy: 'name', sortOrder: 'asc' },
		setPagination: vi.fn(),
		setFilters: vi.fn(),
		isLoading: false,
	}),
}));

vi.mock('~/components/BaseTable', () => ({
	default: ({
		data,
		columns,
	}: {
		data: Array<{ id: number; [key: string]: unknown }>;
		columns: Array<{
			id?: string;
			accessorKey?: string;
			cell?: (args: { row: { original: unknown } }) => React.ReactNode;
		}>;
	}) => (
		<div>
			{data.map((row) => (
				<div key={row.id}>
					{columns.map((col) => (
						<div key={col.id || col.accessorKey}>
							{col.cell ? col.cell({ row: { original: row } }) : null}
						</div>
					))}
				</div>
			))}
		</div>
	),
}));

vi.mock('~/components/PaginationControls', () => ({
	default: () => <div data-testid='pagination'>Pagination</div>,
}));

vi.mock(
	'~/modules/campaigns/CampaignManagementPage/Categories/components/CampaignCategoriesFilters',
	() => ({
		CampaignCategoriesFilters: () => <div data-testid='filters'>Filters</div>,
	})
);

vi.mock(
	'~/modules/campaigns/CampaignManagementPage/Categories/components/CampaignCategoriesForm/CampaignCategoriesForm',
	() => ({
		CampaignCategoriesForm: () => <div data-testid='category-form'>Form</div>,
	})
);

describe('CategoryPickerPanel', () => {
	it('calls onSelect when selecting a category', () => {
		const onSelect = vi.fn();
		renderWithProviders(<CategoryPickerPanel onSelect={onSelect} />);

		fireEvent.click(screen.getByText('Select'));
		expect(onSelect).toHaveBeenCalledWith({ id: 1, name: 'Sales' });
	});
});
