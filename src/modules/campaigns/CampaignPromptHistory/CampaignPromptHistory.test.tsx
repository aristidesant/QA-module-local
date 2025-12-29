import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import CampaignPromptHistory from './CampaignPromptHistory';

// Mock query hook
const mockUseGetCampaignPromptHistory = vi.fn();
const mockUseGetCampaignPromptHistoryByPromptType = vi.fn();
vi.mock('~/queries/campaignPromptHistoryQueries', () => ({
	useGetCampaignPromptHistory: (...args: any[]) =>
		mockUseGetCampaignPromptHistory(...args),
	useGetCampaignPromptHistoryByPromptType: (...args: any[]) =>
		mockUseGetCampaignPromptHistoryByPromptType(...args),
}));

// Mock pagination hook to avoid debounce
vi.mock('~/hooks/usePagination', () => ({
	usePagination: (_args: any) => ({
		currentPage: 1,
		itemsPerPage: 5,
		searchValue: '',
		debouncedSearch: '',
		setCurrentPage: vi.fn(),
		setItemsPerPage: vi.fn(),
		setSearchValue: vi.fn(),
		getApiParams: () => ({ limit: 5, offset: 0 }),
		calculateTotalPages: () => 1,
	}),
}));

// Mock columns hook to provide a simple actions cell we can interact with
vi.mock('./useCampaignPromptHistoryColumns', () => ({
	useCampaignPromptHistoryColumns: ({ onSelect, onViewPrompt }: any) => [
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }: any) => (
				<div>
					<button
						data-testid={`view-${row.original.id}`}
						onClick={() => onViewPrompt?.(row.original)}
					>
						View
					</button>
					<button
						data-testid={`restore-${row.original.id}`}
						onClick={() => onSelect?.(row.original.promptText)}
					>
						Restore
					</button>
				</div>
			),
		},
	],
}));

// Mock BaseTable to render the provided rows and allow clicking actions
vi.mock('~/components/BaseTable', () => ({
	__esModule: true,
	default: ({ data, onRowClick, columns }: any) => (
		<div data-testid='base-table'>
			{data.map((item: any) => (
				<div
					key={item.id}
					data-testid={`row-${item.id}`}
					onClick={() => onRowClick?.(item)}
				>
					<span>{item.promptText}</span>
					<div role='menu'>
						{columns
							?.find((c: any) => c.id === 'actions')
							?.cell({ row: { original: item } })}
					</div>
				</div>
			))}
		</div>
	),
}));

// Mock PaginationControls to avoid complexity
vi.mock('~/components/PaginationControls', () => ({
	__esModule: true,
	default: ({ children }: any) => (
		<div data-testid='pagination'>{children}</div>
	),
}));

describe('CampaignPromptHistory', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseGetCampaignPromptHistoryByPromptType.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
		});
	});

	it('renders list of prompt history excluding current prompt', async () => {
		// two items: 1 is current (index 0), 2 is previous -> should render only item 2
		mockUseGetCampaignPromptHistory.mockReturnValue({
			data: {
				total: 2,
				limit: 5,
				offset: 0,
				data: [
					{
						id: 1,
						campaignId: 1,
						version: 3,
						promptText: 'CURRENT',
						createdAt: '2024-01-01T00:00:00Z',
						user: { id: 1, username: 'current' },
					},
					{
						id: 2,
						campaignId: 1,
						version: 2,
						promptText: 'PREV',
						createdAt: '2023-01-01T00:00:00Z',
						user: { id: 2, username: 'prev' },
					},
				],
			},
			isLoading: false,
			isError: false,
		});

		const mockOnSelect = vi.fn();
		renderWithProviders(
			<CampaignPromptHistory
				campaignId={'1'}
				currentPromptText={'CURRENT'}
				onSelect={mockOnSelect}
			/>
		);

		expect(await screen.findByTestId('base-table')).toBeInTheDocument();
		expect(screen.queryByTestId('row-1')).not.toBeInTheDocument();
		expect(screen.getByTestId('row-2')).toBeInTheDocument();
	});

	it('opens modal when view action clicked and can restore via onSelect', async () => {
		mockUseGetCampaignPromptHistory.mockReturnValue({
			data: {
				total: 2,
				limit: 5,
				offset: 0,
				data: [
					{
						id: 1,
						campaignId: 1,
						version: 3,
						promptText: 'CURRENT',
						createdAt: '2024-01-01T00:00:00Z',
						user: { id: 1, username: 'current' },
					},
					{
						id: 2,
						campaignId: 1,
						version: 2,
						promptText: 'PREV',
						createdAt: '2023-01-01T00:00:00Z',
						user: { id: 2, username: 'prev' },
					},
				],
			},
			isLoading: false,
			isError: false,
		});

		const mockOnSelect = vi.fn();
		renderWithProviders(
			<CampaignPromptHistory
				campaignId={'1'}
				currentPromptText={'CURRENT'}
				onSelect={mockOnSelect}
			/>
		);

		const user = userEvent.setup();
		const viewButton = await screen.findByTestId('view-2');
		await user.click(viewButton);

		// Modal title should appear
		expect(await screen.findByText('Prompt History')).toBeInTheDocument();

		// Click restore from the modal's restore button (restore button is present in PromptHistoryModal)
		const restoreBtn = screen.getByRole('button', {
			name: 'Restore This Version',
		});
		await user.click(restoreBtn);
		expect(mockOnSelect).toHaveBeenCalledWith('PREV');
	});

	it('renders error message when query errors', () => {
		mockUseGetCampaignPromptHistory.mockReturnValue({
			isLoading: false,
			isError: true,
			error: new Error('Boom'),
		});

		renderWithProviders(
			<CampaignPromptHistory campaignId='1' onSelect={() => {}} />
		);

		expect(screen.getByText('Boom')).toBeInTheDocument();
	});

	it('uses prompt-type history hook when campaignPromptTypeId is provided', async () => {
		mockUseGetCampaignPromptHistory.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
		});
		mockUseGetCampaignPromptHistoryByPromptType.mockReturnValue({
			data: {
				total: 1,
				limit: 5,
				offset: 0,
				data: [
					{
						id: 2,
						campaignId: 1,
						version: 2,
						promptText: 'PREV',
						createdAt: '2023-01-01T00:00:00Z',
						user: { id: 2, username: 'prev' },
					},
				],
			},
			isLoading: false,
			isError: false,
		});

		const mockOnSelect = vi.fn();
		renderWithProviders(
			<CampaignPromptHistory
				campaignId={'1'}
				campaignPromptTypeId={'10'}
				currentPromptText={'CURRENT'}
				onSelect={mockOnSelect}
			/>
		);

		expect(mockUseGetCampaignPromptHistoryByPromptType).toHaveBeenCalled();
		expect(await screen.findByTestId('base-table')).toBeInTheDocument();
	});
});
