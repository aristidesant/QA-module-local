import { waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useEffect } from 'react';

const { mockUseGetCampaignContactSchemas } = vi.hoisted(() => ({
	mockUseGetCampaignContactSchemas: vi.fn(),
}));

vi.mock('~/queries/campaignContactSchemasQueries', () => ({
	useGetCampaignContactSchemas: (...args: unknown[]) =>
		mockUseGetCampaignContactSchemas(...(args as unknown[])),
}));

import { useCampaignSchemasWithFilters } from '../useFilteredSchemas';

const TestConsumer = ({ onReady }: { onReady: (s: any) => void }) => {
	const state = useCampaignSchemasWithFilters();
	useEffect(() => {
		onReady(state);
	}, [state]);
	return (
		<div>
			<ul data-testid='schemas'>
				{state.schemas.map((s) => (
					<li key={s.id} data-testid={`schema-${s.id}`}>
						{s.name} - {s.objective?.name}
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

describe('useCampaignSchemasWithFilters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sorts schemas by objective name when sortBy objectiveId', async () => {
		const schemas = [
			{
				id: 1,
				name: 'Schema A',
				code: 'a',
				objectiveId: 20,
				schemaFields: [],
				version: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-02',
				updatedAt: '2023-02-02',
				objective: { id: 20, name: 'Beta' },
			},
			{
				id: 2,
				name: 'Schema B',
				code: 'b',
				objectiveId: 10,
				schemaFields: [],
				version: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01',
				updatedAt: '2023-02-01',
				objective: { id: 10, name: 'Alpha' },
			},
		];

		mockUseGetCampaignContactSchemas.mockReturnValue({
			data: { data: schemas, total: 2 },
			isLoading: false,
		});

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => expect(hookState).toBeDefined());

		// Change to sort by objectiveId (which sorts by objective.name string comparison)
		act(() =>
			hookState.setFilters({
				...hookState.filters,
				sortBy: 'objectiveId',
				sortOrder: 'asc',
			})
		);
		await waitFor(() => {
			expect(hookState.schemas[0].objective?.name).toBe('Alpha');
		});
	});

	it('updates pagination total from response', async () => {
		mockUseGetCampaignContactSchemas.mockReturnValue({
			data: { data: [], total: 99 },
			isLoading: false,
		});

		let hookState: any;
		renderWithProviders(<TestConsumer onReady={(s) => (hookState = s)} />);
		await waitFor(() => expect(hookState).toBeDefined());
		expect(hookState.pagination.total).toBe(99);
	});
});

export {};
