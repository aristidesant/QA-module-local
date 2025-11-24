import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router';
import { notifications } from '@mantine/notifications';
import CampaignsList from './CampaignsList';
import type { Campaign, PaginatedResponse } from '~/models/CampaignsModel';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
	const actual = await vi.importActual<any>('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Mock queries and stores used by the component
const mockUseGetAllCampaignsPaginated = vi.fn();
const mockUseDeleteCampaign = vi.fn();
const mockUseGetAgent = vi.fn();

vi.mock('~/queries/campaignsQueries', () => ({
	useGetAllCampaignsPaginated: (...args: any[]) =>
		mockUseGetAllCampaignsPaginated(...args),
	useDeleteCampaign: () => mockUseDeleteCampaign(),
}));

vi.mock('~/queries/agentQueries', () => ({
	useGetAgent: (id: string) => mockUseGetAgent(id),
}));

const mockSelectCampaign = vi.fn();
const mockSetRightComponent = vi.fn();
vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn((selector: any) =>
		selector({
			selectCampaign: mockSelectCampaign,
			selectedCampaign: null,
			setRightComponent: mockSetRightComponent,
			rightComponent: null,
		})
	),
}));

const mockResetWizard = vi.fn();
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn((selector: any) =>
		selector({ reset: mockResetWizard })
	),
}));

// Mock usePagination to avoid debounce issues
const mockSetSearchValue = vi.fn();
const mockSetCurrentPage = vi.fn();
const mockSetItemsPerPage = vi.fn();
const mockUsePagination = vi.fn();

vi.mock('~/hooks/usePagination', () => ({
	usePagination: (args: any) => {
		// Default behavior if not overridden
		return (
			mockUsePagination(args) || {
				currentPage: 1,
				itemsPerPage: 10,
				searchValue: '',
				debouncedSearch: '',
				setSearchValue: mockSetSearchValue,
				setCurrentPage: mockSetCurrentPage,
				setItemsPerPage: mockSetItemsPerPage,
				getApiParams: () => ({ offset: 0, limit: 10 }),
				calculateTotalPages: () => 1,
			}
		);
	},
}));

// Mock mantine modals and notifications
const mockOpenConfirm = vi.fn();
const mockOpenModal = vi.fn();
vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: (...args: any[]) => mockOpenConfirm(...args),
		open: (...args: any[]) => mockOpenModal(...args),
		close: vi.fn(),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

// Mock Mantine charts (AreaChart) to avoid importing 'recharts' during tests
vi.mock('@mantine/charts', () => ({
	AreaChart: () => <div data-testid='area-chart' />,
}));

// Mock OutboundCallForm and CloneCampaignForm to simplify tests
vi.mock('~/components/OutboundCallForm', () => ({
	OutboundCallForm: (props: any) => (
		<div data-testid='outbound-call-form'>
			Outbound call for {props.campaignId}
			<button onClick={props.onSuccess}>Success Call</button>
			<button onClick={props.onClose}>Close Call</button>
		</div>
	),
}));

vi.mock('../CloneCampaignForm', () => ({
	default: (props: any) => (
		<div data-testid='clone-campaign-form'>
			Clone {props.campaign?.name}
			<button onClick={props.onComplete}>Complete Clone</button>
		</div>
	),
}));

// Mock CampaignPreview to avoid CSS module loading that can crash jsdom css parser
vi.mock('../CampaignPreview', () => ({
	default: () => <div data-testid='campaign-preview'>Preview</div>,
}));

// Mock CampaignWizard to reduce heavy imports
vi.mock('../CampaignWizard', () => ({
	CampaignWizard: (props: any) => (
		<div data-testid='campaign-wizard'>
			Wizard
			<button onClick={props.onComplete}>Complete Wizard</button>
			<button onClick={props.onCancel}>Cancel Wizard</button>
		</div>
	),
}));

// Mock UI components that might import CSS modules or heavy libraries
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
					<span>{item.name}</span>
					<div>
						<div role='menu'>
							{/* Render the actions column cell if provided by columns */}
							{columns
								?.find((c: any) => c.id === 'actions')
								?.cell({ row: { original: item } })}
						</div>
					</div>
				</div>
			))}
		</div>
	),
}));

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	__esModule: true,
	ContentContainer: ({ children, title, titleRight }: any) => (
		<div>
			<div>{title}</div>
			<div>{titleRight}</div>
			<div>{children}</div>
		</div>
	),
}));

vi.mock('./CampaignsListSkeleton', () => ({
	default: () => <div data-testid='skeleton'>skeleton</div>,
}));

vi.mock('./CampaignFilters', () => ({
	default: ({
		onSearchChange,
		searchValue,
		onSortChange,
		onFiltersChange,
	}: any) => (
		<div data-testid='filters'>
			<input
				data-testid='search-input'
				value={searchValue}
				onChange={(e) => onSearchChange(e.target.value)}
			/>
			<button onClick={() => onSortChange('name')} data-testid='sort-name'>
				Sort Name
			</button>
			<button
				onClick={() => onFiltersChange({ status: 'ACTIVE' })}
				data-testid='filter-active'
			>
				Filter Active
			</button>
		</div>
	),
}));

vi.mock('~/components/PaginationControls', () => ({
	__esModule: true,
	default: ({ onPageChange, onItemsPerPageChange }: any) => (
		<div>
			<button onClick={() => onPageChange?.(2)} data-testid='page-2'>
				Page 2
			</button>
			<button
				onClick={() => onItemsPerPageChange?.('20')}
				data-testid='items-per-page-20'
			>
				20 per page
			</button>
		</div>
	),
}));

vi.mock('~/components/EmptyState', () => ({
	__esModule: true,
	default: ({ message, description, action }: any) => (
		<div>
			<div>{message}</div>
			<div>{description}</div>
			{action && (
				<button onClick={action.props.onClick}>Create Campaign</button>
			)}
		</div>
	),
}));

// Debug logs to help diagnose undefined imports in tests (kept as console logs intentionally)
// Debug logs removed

// Helper to render component
const renderComponent = () =>
	render(
		<MantineProvider>
			<MemoryRouter>
				<CampaignsList />
			</MemoryRouter>
		</MantineProvider>
	);

const sampleCampaign: Campaign = {
	id: 1,
	name: 'Test Campaign',
	agentName: 'Agent One',
	description: 'Lorem ipsum',
	budget: 100,
	configId: 'cfg-1',
	spent: 10,
	type: 'OUTBOUND',
	status: 'ACTIVE' as any,
	userId: 1,
	clientId: 1,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	agents: [
		{
			id: 1,
			campaignId: 1,
			agentId: 'agent-1',
			agent: { name: 'Agent One', status: 'online', language: 'en' },
			userId: 1,
			clientId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	],
};

describe('CampaignsList', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Default mock values
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: {
				data: [sampleCampaign],
				total: 1,
				offset: 0,
				limit: 10,
			} as PaginatedResponse<Campaign>,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});

		mockUseDeleteCampaign.mockReturnValue({ mutateAsync: vi.fn() });
		mockUseGetAgent.mockReturnValue({
			data: null,
			isLoading: false,
			isError: false,
		});

		mockUsePagination.mockReturnValue(null); // Use default implementation
	});

	it('renders campaign rows when data exists', () => {
		renderComponent();
		expect(screen.getByText('Test Campaign')).toBeInTheDocument();
	});

	it('renders empty state when no campaigns', () => {
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: {
				data: [],
				total: 0,
				offset: 0,
				limit: 10,
			} as PaginatedResponse<Campaign>,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});

		renderComponent();
		expect(screen.getByText('No campaigns yet')).toBeInTheDocument();
		expect(
			screen.getByText('Launch your first campaign to reach your audience')
		).toBeInTheDocument();
	});

	it('renders empty search results', () => {
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: {
				data: [],
				total: 0,
				offset: 0,
				limit: 10,
			} as PaginatedResponse<Campaign>,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});

		mockUsePagination.mockReturnValue({
			currentPage: 1,
			itemsPerPage: 10,
			searchValue: 'search term',
			debouncedSearch: 'search term',
			setSearchValue: mockSetSearchValue,
			setCurrentPage: mockSetCurrentPage,
			setItemsPerPage: mockSetItemsPerPage,
			getApiParams: () => ({ offset: 0, limit: 10 }),
			calculateTotalPages: () => 0,
		});

		renderComponent();
		expect(screen.getByText('No campaigns found')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Try adjusting your search terms or create a new campaign'
			)
		).toBeInTheDocument();
	});

	it('renders error state', () => {
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: null,
			isLoading: false,
			isFetching: false,
			isError: true,
			error: new Error('Failed to fetch'),
			refetch: vi.fn(),
		});

		renderComponent();
		expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
	});

	it('renders loading state', () => {
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: null,
			isLoading: true,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});

		renderComponent();
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});

	it('selects campaign and sets right section when clicking row', async () => {
		renderComponent();
		const row = screen.getByText('Test Campaign');
		fireEvent.click(row);
		await waitFor(() =>
			expect(mockSelectCampaign).toHaveBeenCalledWith(
				expect.objectContaining({ id: 1 })
			)
		);
		expect(mockSetRightComponent).toHaveBeenCalled();
	});

	it('opens wizard reset when add new campaign is clicked', () => {
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: {
				data: [],
				total: 0,
				offset: 0,
				limit: 10,
			} as PaginatedResponse<Campaign>,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});
		renderComponent();
		const createButton = screen.getByRole('button', {
			name: /Create Campaign/i,
		});
		fireEvent.click(createButton);
		expect(mockResetWizard).toHaveBeenCalled();
	});

	it('opens Test Call modal when Test Call menu item is clicked', async () => {
		mockUseGetAgent.mockReturnValue({
			data: { id: 'agent-1', name: 'Agent One' },
			isLoading: false,
		});
		renderComponent();

		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);

		const testCall = await screen.findByText('Test Call');
		fireEvent.click(testCall);

		expect(await screen.findByTestId('outbound-call-form')).toBeInTheDocument();
	});

	it('shows notification when Test Call is clicked but no agents', async () => {
		const campaignNoAgents = { ...sampleCampaign, agents: [] };
		mockUseGetAllCampaignsPaginated.mockReturnValue({
			data: {
				data: [campaignNoAgents],
				total: 1,
				offset: 0,
				limit: 10,
			} as PaginatedResponse<Campaign>,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		});

		renderComponent();

		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);

		const testCall = await screen.findByText('Test Call');
		fireEvent.click(testCall);

		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'No Agents',
				color: 'yellow',
			})
		);
	});

	it('calls modals.openConfirmModal when Delete is clicked', async () => {
		renderComponent();
		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);
		const deleteItem = await screen.findByText('Delete');
		fireEvent.click(deleteItem);
		expect(mockOpenConfirm).toHaveBeenCalled();
	});

	it('calls modals.open when Clone is clicked', async () => {
		renderComponent();
		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);
		const cloneItem = await screen.findByText('Clone Campaign');
		fireEvent.click(cloneItem);
		expect(mockOpenModal).toHaveBeenCalledWith(
			expect.objectContaining({
				modalId: 'clone-campaign',
				title: 'Clone Campaign',
			})
		);
	});

	it('navigates to edit page when Edit is clicked', () => {
		renderComponent();
		const editButton = screen.getByLabelText('Edit campaign');
		fireEvent.click(editButton);
		expect(mockNavigate).toHaveBeenCalledWith(`/campaign/${sampleCampaign.id}`);
	});

	it('navigates to view page when View is clicked', () => {
		renderComponent();
		const viewButton = screen.getByLabelText('View campaign');
		fireEvent.click(viewButton);
		expect(mockNavigate).toHaveBeenCalledWith(
			`/campaign/view/${sampleCampaign.id}`
		);
	});

	it('handles delete confirmation success', async () => {
		renderComponent();
		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);
		const deleteItem = await screen.findByText('Delete');
		fireEvent.click(deleteItem);

		expect(mockOpenConfirm).toHaveBeenCalled();
		const { onConfirm } = mockOpenConfirm.mock.calls[0][0];
		await onConfirm();

		expect(mockUseDeleteCampaign().mutateAsync).toHaveBeenCalledWith('1');
		expect(mockUseGetAllCampaignsPaginated().refetch).toHaveBeenCalled();
		expect(mockSelectCampaign).toHaveBeenCalledWith(null);
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Campaign Deleted',
				color: 'green',
			})
		);
	});

	it('handles delete confirmation error', async () => {
		const mockMutateAsync = vi
			.fn()
			.mockRejectedValue(new Error('Delete failed'));
		mockUseDeleteCampaign.mockReturnValue({ mutateAsync: mockMutateAsync });

		renderComponent();
		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);
		const deleteItem = await screen.findByText('Delete');
		fireEvent.click(deleteItem);

		const { onConfirm } = mockOpenConfirm.mock.calls[0][0];
		await onConfirm();

		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error',
				color: 'red',
			})
		);
	});

	it('handles clone completion', async () => {
		// Mock modals.open to render the children immediately or provide a way to access them
		// Since we can't easily render children passed to a mock function in the same render cycle without a custom implementation,
		// we will simulate the flow by manually invoking the onComplete prop if we could access the component.
		// However, the component is rendered inside the modal.
		// A better approach for the mock is to render the children if we want to interact with them,
		// OR we can just inspect the props passed to CloneCampaignForm if we could.
		// But here we are mocking CloneCampaignForm.
		// Let's adjust the modals mock to render children.

		// We need to update the modals mock first to support rendering children for interaction
		// But since we already mocked modals.open as a spy, we can't easily change it now without affecting other tests or setup.
		// Instead, let's assume we can access the children from the mock call arguments and render them.

		renderComponent();
		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);
		const cloneItem = await screen.findByText('Clone Campaign');
		fireEvent.click(cloneItem);

		expect(mockOpenModal).toHaveBeenCalled();
		const modalContent = mockOpenModal.mock.calls[0][0].children;

		// Render the modal content in a separate render to interact with it
		const { getByText } = render(modalContent);
		fireEvent.click(getByText('Complete Clone'));

		expect(mockUseGetAllCampaignsPaginated().refetch).toHaveBeenCalled();
		expect(mockSelectCampaign).toHaveBeenCalledWith(null);
		// We can't easily check modals.close because it's a method on the object we mocked partially
		// But we can check if the logic inside onComplete was executed (refetch and selectCampaign)
	});

	it('handles test call modal interactions', async () => {
		mockUseGetAgent.mockReturnValue({
			data: { id: 'agent-1', name: 'Agent One' },
			isLoading: false,
		});
		renderComponent();

		const actions = screen.getAllByLabelText('Campaign actions');
		fireEvent.click(actions[0]);
		const testCall = await screen.findByText('Test Call');
		fireEvent.click(testCall);

		expect(await screen.findByTestId('outbound-call-form')).toBeInTheDocument();

		// Test success
		fireEvent.click(screen.getByText('Success Call'));
		await waitFor(() => {
			expect(
				screen.queryByTestId('outbound-call-form')
			).not.toBeInTheDocument();
		});

		// Re-open and test close
		fireEvent.click(actions[0]);
		fireEvent.click(testCall);
		expect(await screen.findByTestId('outbound-call-form')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Close Call'));
		await waitFor(() => {
			expect(
				screen.queryByTestId('outbound-call-form')
			).not.toBeInTheDocument();
		});
	});

	it('handles pagination items per page change', () => {
		renderComponent();
		fireEvent.click(screen.getByTestId('items-per-page-20'));
		expect(mockSetItemsPerPage).toHaveBeenCalledWith(20);
	});

	it('handles campaign wizard interactions', async () => {
		renderComponent();
		const createButton = screen.getByTestId('header-create-campaign-btn');
		fireEvent.click(createButton);

		expect(await screen.findByTestId('campaign-wizard')).toBeInTheDocument();

		// Test Complete
		fireEvent.click(screen.getByText('Complete Wizard'));
		expect(mockUseGetAllCampaignsPaginated).toHaveBeenCalled();
		expect(mockSelectCampaign).toHaveBeenCalledWith(null);
		expect(mockResetWizard).toHaveBeenCalled();

		// Re-open and test Cancel
		fireEvent.click(createButton);
		fireEvent.click(screen.getByText('Cancel Wizard'));
		expect(mockSelectCampaign).toHaveBeenCalledWith(null);
		expect(mockResetWizard).toHaveBeenCalled();

		// Re-open and test Modal Close (onClose prop)
		fireEvent.click(createButton);
		expect(await screen.findByTestId('campaign-wizard')).toBeInTheDocument();
		const closeButtons = screen.getAllByTestId('modal-close-btn');
		fireEvent.click(closeButtons[0]);
		expect(mockResetWizard).toHaveBeenCalled();
		await waitFor(() => {
			expect(screen.queryByTestId('campaign-wizard')).not.toBeInTheDocument();
		});
	});

	it('handles header actions', async () => {
		renderComponent();
		fireEvent.click(screen.getByTestId('header-refresh-btn'));
		expect(mockUseGetAllCampaignsPaginated().refetch).toHaveBeenCalled();

		fireEvent.click(screen.getByTestId('header-create-campaign-btn'));
		expect(mockResetWizard).toHaveBeenCalled();
		expect(await screen.findByTestId('campaign-wizard')).toBeInTheDocument();
	});

	it('handles filters interactions', async () => {
		renderComponent();
		fireEvent.click(screen.getByTestId('sort-name'));

		await waitFor(() => {
			expect(mockUseGetAllCampaignsPaginated).toHaveBeenLastCalledWith(
				expect.objectContaining({ sortBy: 'name' })
			);
		});

		fireEvent.click(screen.getByTestId('filter-active'));
		await waitFor(() => {
			expect(mockUseGetAllCampaignsPaginated).toHaveBeenLastCalledWith(
				expect.objectContaining({ status: 'ACTIVE' })
			);
		});
	});
});

// Mock Mantine Modal to avoid portal issues
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		Modal: ({ opened, onClose, children }: any) =>
			opened ? (
				<div>
					<button onClick={onClose} data-testid='modal-close-btn'>
						Close Modal
					</button>
					{children}
				</div>
			) : null,
	};
});
