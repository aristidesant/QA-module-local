import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ObjectivePickerPanel from './ObjectivePickerPanel';

const { objectivesFormSpy } = vi.hoisted(() => ({
	objectivesFormSpy: vi.fn(),
}));

vi.mock('~/modules/campaigns/hooks/useFilteredObjectives', () => ({
	useCampaignObjectivesWithFilters: () => ({
		objectives: [
			{
				id: 1,
				name: 'Objective A',
				description: '',
				categoryId: 1,
				categoryName: 'Sales',
				active: true,
				userId: 1,
				clientId: 1,
				createdAt: '',
				updatedAt: '',
			},
		],
		pagination: { page: 1, pageSize: 10, total: 1 },
		filters: {
			search: '',
			status: 'all',
			categoryId: null,
			sortBy: 'name',
			sortOrder: 'asc',
		},
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
	'~/modules/campaigns/CampaignManagementPage/Objectives/components/CampaignObjectivesFilters',
	() => ({
		CampaignObjectivesFilters: () => <div data-testid='filters'>Filters</div>,
	})
);

vi.mock(
	'~/modules/campaigns/CampaignManagementPage/Objectives/components/CampaignObjectivesForm/CampaignObjectivesForm',
	() => ({
		CampaignObjectivesForm: (props: { withinParentForm?: boolean }) => {
			objectivesFormSpy(props);
			return <div data-testid='objective-form'>Form</div>;
		},
	})
);

describe('ObjectivePickerPanel', () => {
	it('calls onSelect when selecting an objective', () => {
		const onSelect = vi.fn();
		renderWithProviders(<ObjectivePickerPanel onSelect={onSelect} />);

		fireEvent.click(screen.getByText('Select'));
		expect(onSelect).toHaveBeenCalledWith({ id: 1, name: 'Objective A' });
	});

	it('renders inline create form without nested <form> submissions', () => {
		const onSelect = vi.fn();
		renderWithProviders(<ObjectivePickerPanel onSelect={onSelect} />);

		fireEvent.click(screen.getByRole('button', { name: /new objective/i }));

		expect(objectivesFormSpy).toHaveBeenCalledWith(
			expect.objectContaining({ withinParentForm: true })
		);

		expect(
			screen.getByRole('button', { name: /new objective/i })
		).toHaveAttribute('type', 'button');
	});
});
