import { screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useEffect } from 'react';

// Hoisted mocks
const { mockUseGetCampaignObjectives, mockUseGetCampaignCategories } =
	vi.hoisted(() => ({
		mockUseGetCampaignObjectives: vi.fn(),
		mockUseGetCampaignCategories: vi.fn(),
	}));

vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useGetCampaignObjectives: (...args: unknown[]) =>
		mockUseGetCampaignObjectives(...(args as unknown[])),
}));

vi.mock('~/queries/campaignCategoriesQueries', () => ({
	useGetCampaignCategories: (...args: unknown[]) =>
		mockUseGetCampaignCategories(...(args as unknown[])),
}));

import { useCampaignObjectivesWithFilters } from '../useFilteredObjectives';

const TestConsumer = ({ onReady }: { onReady: (s: any) => void }) => {
	const state = useCampaignObjectivesWithFilters();
	useEffect(() => {
		onReady(state);
	}, [state]);
	return (
		<div>
			<ul data-testid='objectives'>
				{state.objectives.map((o) => (
					<li key={o.id} data-testid={`obj-${o.id}`}>
						{o.name} - {o.categoryName}
					</li>
				))}
			</ul>
			<div
				data-testid='pagination'
				data-page={state.pagination.page}
				data-pagesize={state.pagination.pageSize}
				data-total={state.pagination.total}
			></div>
		</div>
	);
};

describe('useCampaignObjectivesWithFilters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('enriches objectives with category name', async () => {
		const categories = [{ id: 10, name: 'Category X' }];
		const objectives = [
			{
				id: 1,
				name: 'Objective A',
				description: '',
				active: true,
				categoryId: 10,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01',
				updatedAt: '2023-02-01',
			},
		];

		mockUseGetCampaignCategories.mockReturnValue({
			data: { data: categories, total: 1 },
			isLoading: false,
		});
		mockUseGetCampaignObjectives.mockReturnValue({
			data: { data: objectives, total: 1 },
			isLoading: false,
		});

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => expect(hookState).toBeDefined());
		expect(hookState.objectives.length).toBe(1);
		expect(hookState.objectives[0].categoryName).toBe('Category X');
		expect(screen.getByTestId('obj-1').textContent).toContain('Category X');
	});

	it('sorts objectives by category name when sortBy categoryId', async () => {
		const categories = [
			{ id: 10, name: 'Alpha' },
			{ id: 20, name: 'Beta' },
		];
		const objectives = [
			{
				id: 1,
				name: 'A',
				description: '',
				active: true,
				categoryId: 20,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01',
				updatedAt: '2023-02-01',
			},
			{
				id: 2,
				name: 'B',
				description: '',
				active: true,
				categoryId: 10,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-02',
				updatedAt: '2023-02-02',
			},
		];

		mockUseGetCampaignCategories.mockReturnValue({
			data: { data: categories, total: 2 },
			isLoading: false,
		});
		mockUseGetCampaignObjectives.mockReturnValue({
			data: { data: objectives, total: 2 },
			isLoading: false,
		});

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => expect(hookState).toBeDefined());
		// Default sortBy name - change to sort by categoryId
		act(() =>
			hookState.setFilters({
				...hookState.filters,
				sortBy: 'categoryId',
				sortOrder: 'asc',
			})
		);
		await waitFor(() => {
			expect(hookState.objectives[0].categoryName).toBe('Alpha');
		});
	});
});

export {};
