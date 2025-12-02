import { screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Hoisted mocks
const { mockUseGetCampaignCategories } = vi.hoisted(() => ({
	mockUseGetCampaignCategories: vi.fn(),
}));

vi.mock('~/queries/campaignCategoriesQueries', () => ({
	useGetCampaignCategories: (...args: unknown[]) =>
		mockUseGetCampaignCategories(...(args as unknown[])),
}));

import { useCampaignCategoriesWithFilters } from '../useFilteredCategories';
import { useEffect } from 'react';

const TestConsumer = ({ onReady }: { onReady: (state: any) => void }) => {
	const state = useCampaignCategoriesWithFilters();
	useEffect(() => {
		onReady(state);
	}, [state]);
	return (
		<div>
			<div
				data-testid='filters'
				data-search={state.filters.search}
				data-status={state.filters.status}
				data-sortby={state.filters.sortBy}
				data-sortorder={state.filters.sortOrder}
			></div>
			<div
				data-testid='pagination'
				data-page={state.pagination.page}
				data-pagesize={state.pagination.pageSize}
				data-total={state.pagination.total}
			></div>
			<ul data-testid='categories'>
				{state.categories.map((c) => (
					<li key={c.id} data-testid={`cat-${c.id}`}>
						{c.name}
					</li>
				))}
			</ul>
		</div>
	);
};

describe('useCampaignCategoriesWithFilters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns default filters and pagination', async () => {
		mockUseGetCampaignCategories.mockReturnValue({
			data: { data: [], total: 0 },
			isLoading: false,
		});

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => {
			expect(hookState).toBeDefined();
			expect(hookState.filters.search).toBe('');
			expect(hookState.filters.status).toBe('all');
			expect(hookState.filters.sortBy).toBe('name');
			expect(hookState.filters.sortOrder).toBe('asc');
			expect(hookState.pagination.page).toBe(1);
			expect(hookState.pagination.pageSize).toBe(10);
		});
	});

	it('applies server params and updates pagination based on response', async () => {
		const categories = [
			{
				id: 1,
				name: 'B',
				code: 'b',
				description: '',
				active: true,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-02',
				updatedAt: '2023-03-02',
			},
			{
				id: 2,
				name: 'A',
				code: 'a',
				description: '',
				active: true,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01',
				updatedAt: '2023-02-02',
			},
		];

		// Implementation stores the args so we can assert server param value
		mockUseGetCampaignCategories.mockImplementation((_params) => ({
			data: { data: categories, total: 42 },
			isLoading: false,
		}));

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => {
			expect(hookState.categories.length).toBe(2);
			expect(hookState.pagination.total).toBe(42);
		});

		// Ensure sorting by name (default asc) is applied
		const list = screen.getByTestId('categories');
		expect(list.querySelector('li')?.textContent).toBe('A');
	});

	it('resets page when filters change and constructs correct server params', async () => {
		mockUseGetCampaignCategories.mockReturnValue({
			data: { data: [], total: 0 },
			isLoading: false,
		});

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => expect(hookState).toBeDefined());

		// Set to page 2
		act(() => hookState.setPagination({ page: 2, pageSize: 10, total: 0 }));
		await waitFor(() => expect(hookState.pagination.page).toBe(2));

		// Change filters and expect page reset to 1
		act(() =>
			hookState.setFilters({ ...hookState.filters, search: 'my search' })
		);
		await waitFor(() => expect(hookState.pagination.page).toBe(1));
	});
});

export {};
