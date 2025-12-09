import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import KnowledgeBaseList from './KnowledgeBaseList';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import {
	KnowledgeBaseStatus,
	KnowledgeBaseType,
} from '~/models/KnowledgeBaseModel';
import * as queries from '~/queries/knowledgeBaseQueries';

const mockKB = (
	overrides: Partial<KnowledgeBaseModel> = {}
): KnowledgeBaseModel => ({
	id: 1,
	name: 'Alpha',
	description: 'Desc',
	type: KnowledgeBaseType.FILE,
	status: KnowledgeBaseStatus.ACTIVE,
	clientId: 1,
	userId: 1,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
	...overrides,
});

// Mock paginated hook
vi.mock('~/queries/knowledgeBaseQueries', async () => {
	const actual = await vi.importActual<typeof queries>(
		'~/queries/knowledgeBaseQueries'
	);
	return {
		...actual,
		useKnowledgeBasesPaginated: vi.fn(() => ({
			data: { data: [mockKB({ id: 1, name: 'Alpha' })], total: 14 },
			isLoading: false,
			refetch: vi.fn(),
		})),
		useDeleteKnowledgeBase: vi.fn(() => ({ mutate: vi.fn() })),
		useRetryKnowledgeBase: vi.fn(() => ({ mutate: vi.fn() })),
	};
});

// Mock BaseTable to expose sorting/pagination triggers
vi.mock('~/components/BaseTable', () => {
	return {
		__esModule: true,
		default: ({ onSortingChange, onPaginationChange }: any) => (
			<div>
				<button onClick={() => onSortingChange?.([{ id: 'name', desc: true }])}>
					sort-name-desc
				</button>
				<button onClick={() => onPaginationChange?.(1, 10)}>go-page-2</button>
				<div>table</div>
			</div>
		),
	};
});

// Mock filter to expose simple filter controls
vi.mock('./KnowledgeBaseFilter', () => {
	return {
		__esModule: true,
		default: ({ setQuery, setStatusFilter, setTypeFilter }: any) => (
			<div>
				<button onClick={() => setQuery('alpha')}>set-search-alpha</button>
				<button onClick={() => setStatusFilter('ACTIVE')}>
					set-status-active
				</button>
				<button onClick={() => setTypeFilter('FILE')}>set-type-file</button>
			</div>
		),
	};
});

describe('KnowledgeBaseList - server filtering/sorting/pagination', () => {
	const user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls paginated hook with default sort and pagination (limit/offset)', async () => {
		renderWithProviders(<KnowledgeBaseList />);
		expect(queries.useKnowledgeBasesPaginated).toHaveBeenCalled();
		const call = vi
			.mocked(queries.useKnowledgeBasesPaginated)
			.mock.calls.at(-1)?.[0] as any;
		expect(call).toEqual(
			expect.objectContaining({
				sortBy: 'name',
				sortOrder: 'asc',
				limit: 10,
				offset: 0,
			})
		);
	});

	it('updates sorting to desc when triggered', async () => {
		renderWithProviders(<KnowledgeBaseList />);
		await user.click(screen.getByText('sort-name-desc'));
		const call = vi
			.mocked(queries.useKnowledgeBasesPaginated)
			.mock.calls.at(-1)?.[0] as any;
		expect(call).toEqual(
			expect.objectContaining({ sortBy: 'name', sortOrder: 'desc' })
		);
	});

	it('updates offset when paginating to page 2', async () => {
		renderWithProviders(<KnowledgeBaseList />);
		await user.click(screen.getByText('go-page-2'));
		const call = vi
			.mocked(queries.useKnowledgeBasesPaginated)
			.mock.calls.at(-1)?.[0] as any;
		expect(call).toEqual(expect.objectContaining({ limit: 10, offset: 10 }));
	});

	it('applies server filters from filter controls', async () => {
		renderWithProviders(<KnowledgeBaseList />);
		await user.click(screen.getByText('set-search-alpha'));
		await user.click(screen.getByText('set-status-active'));
		await user.click(screen.getByText('set-type-file'));

		await waitFor(() => {
			const call = vi
				.mocked(queries.useKnowledgeBasesPaginated)
				.mock.calls.at(-1)?.[0] as any;
			expect(call).toEqual(
				expect.objectContaining({
					search: 'alpha',
					status: 'ACTIVE',
					type: 'FILE',
				})
			);
		});
	});
});
