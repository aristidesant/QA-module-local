import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { notifications } from '@mantine/notifications';
import { StepThreeOutcomes } from './StepThreeOutcomes';

// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

// Mock React Query client
const mockInvalidateQueries = vi.fn();
const mockSetQueryData = vi.fn();
vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual<any>('@tanstack/react-query');
	return {
		...actual,
		useQueryClient: () => ({
			invalidateQueries: mockInvalidateQueries,
			setQueryData: mockSetQueryData,
		}),
	};
});

// Mock disposition flow queries
const mockCreateDispositionFlow = vi.fn();
const mockCampaignsWithFlows = vi.fn();
const mockCopyDispositionFlow = vi.fn();
const mockDispositionFlow = vi.fn();
const mockDeleteDispositionFlow = vi.fn();
let mockExistingFlow: {
	id: number;
	flowJson?: Record<string, unknown>;
} | null = null;

vi.mock('~/queries/dispositionFlowQueries', () => ({
	useCreateDispositionFlow: () => mockCreateDispositionFlow(),
	useCampaignsWithDispositionFlow: (enabled: boolean) =>
		mockCampaignsWithFlows(enabled),
	useCopyDispositionFlow: () => mockCopyDispositionFlow(),
	useDispositionFlow: (id?: number) => mockDispositionFlow(id),
	useDeleteDispositionFlow: () => mockDeleteDispositionFlow(),
	useDispositionFlowsByCampaignPath: () => ({
		data: mockExistingFlow,
		isLoading: false,
		refetch: vi
			.fn()
			.mockImplementation(async () => ({ data: mockExistingFlow })),
	}),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useSetCampaignDraft: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
	}),
}));

// Mock campaignWizardStore
const mockSetIsSubmitting = vi.fn();
const mockSetHasOutcomeFlow = vi.fn();
const mockCreatedCampaign = { id: 1, name: 'Test Campaign' };

vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: () => ({
		createdCampaign: mockCreatedCampaign,
		setIsSubmitting: mockSetIsSubmitting,
		setHasOutcomeFlow: mockSetHasOutcomeFlow,
	}),
}));

// Mock dispositionBuilderStore
const mockSetDispositionFlow = vi.fn();
const mockSetFlowJson = vi.fn();
const mockSetCampaignId = vi.fn();
let mockFlowJson: Record<string, any> = {};

vi.mock(
	'~/modules/campaigns/CampaignsForm/DispositionSection/dispositionStore',
	() => ({
		useDispositionBuilderStore: () => ({
			flowJson: mockFlowJson,
			setDispositionFlow: mockSetDispositionFlow,
			setFlowJson: mockSetFlowJson,
			setCampaignId: mockSetCampaignId,
		}),
	})
);

// Mock useDispositionLabel hook
vi.mock('~/hooks/useDispositionLabel', () => ({
	default: () => (text: string) => text,
}));

// Mock child components
vi.mock(
	'~/modules/campaigns/CampaignsForm/DispositionSection/DispositionForm',
	() => ({
		default: ({ onCancel, onComplete }: any) => (
			<div data-testid='disposition-form'>
				<button onClick={onCancel} data-testid='disposition-form-cancel'>
					Cancel
				</button>
				<button onClick={onComplete} data-testid='disposition-form-complete'>
					Complete
				</button>
			</div>
		),
	})
);

vi.mock(
	'~/modules/campaigns/CampaignsForm/DispositionSection/DispositionViewer',
	() => ({
		default: ({ flow }: any) => (
			<div data-testid='disposition-viewer'>
				Flow Name: {flow?.flowJson?.name || 'Unknown'}
			</div>
		),
	})
);

// Mock Mantine Modal to simplify testing
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		Modal: ({ opened, onClose, children, title }: any) =>
			opened ? (
				<div data-testid={`modal-${title?.replace(/\s+/g, '-').toLowerCase()}`}>
					<button onClick={onClose} data-testid='modal-close-btn'>
						Close Modal
					</button>
					{children}
				</div>
			) : null,
	};
});

describe('StepThreeOutcomes', () => {
	const mockOnNext = vi.fn();

	const defaultQueryMocks = () => {
		mockCreateDispositionFlow.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
			isPending: false,
		});

		mockCampaignsWithFlows.mockReturnValue({
			data: [],
			isLoading: false,
			isFetching: false,
			refetch: vi.fn(),
		});

		mockCopyDispositionFlow.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			}),
			isPending: false,
		});

		mockDispositionFlow.mockReturnValue({
			data: null,
			isLoading: false,
		});

		mockDeleteDispositionFlow.mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
			isPending: false,
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockFlowJson = {};
		mockExistingFlow = null;
		defaultQueryMocks();
	});

	describe('Initial Rendering', () => {
		it('renders the component with proper header and description', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			expect(screen.getByText('Design the flow')).toBeInTheDocument();
			expect(screen.getByText('Outcome Configuration')).toBeInTheDocument();
			expect(
				screen.getByText(/Set up call outcomes for this campaign/)
			).toBeInTheDocument();
		});

		it('renders create/import segmented control', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			expect(screen.getByText('Create New')).toBeInTheDocument();
			expect(screen.getByText('Import from Campaign')).toBeInTheDocument();
		});

		it('renders Save & Continue button', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			expect(screen.getByText('Continue')).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		// Note: Testing loading state when createdCampaign is null requires
		// resetting the mock at module level. This is covered by the component's
		// conditional rendering logic. The mock setup ensures createdCampaign
		// is always available in other tests.
		it('renders component when campaign data is available', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			expect(screen.getByText('Outcome Configuration')).toBeInTheDocument();
		});
	});

	describe('Create Flow Mode', () => {
		it('shows create flow interface by default', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			expect(
				screen.getByText('No outcome flow configured')
			).toBeInTheDocument();
			expect(screen.getByText('Create Outcome Flow')).toBeInTheDocument();
		});

		it('opens disposition form modal when Create Outcome Flow is clicked', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Create Outcome Flow'));

			expect(screen.getByTestId('disposition-form')).toBeInTheDocument();
		});

		it('initializes disposition builder when opening modal', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Create Outcome Flow'));

			expect(mockSetDispositionFlow).toHaveBeenCalledWith({});
			expect(mockSetFlowJson).toHaveBeenCalledWith({});
			expect(mockSetCampaignId).toHaveBeenCalledWith(1);
		});

		it('closes modal when cancel is clicked in disposition form', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Create Outcome Flow'));
			expect(screen.getByTestId('disposition-form')).toBeInTheDocument();

			fireEvent.click(screen.getByTestId('disposition-form-cancel'));
			expect(screen.queryByTestId('disposition-form')).not.toBeInTheDocument();
		});

		it('shows success state when flow is completed', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Create Outcome Flow'));
			fireEvent.click(screen.getByTestId('disposition-form-complete'));

			expect(
				screen.getByText('Outcome flow created successfully')
			).toBeInTheDocument();
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Outcome Flow Created',
					color: 'green',
				})
			);
		});
	});

	describe('Existing Flow Behavior', () => {
		it('shows already configured message when campaign already has a flow', async () => {
			mockExistingFlow = { id: 999, flowJson: { dispositionNodes: [] } };

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			await waitFor(() => {
				expect(
					screen.getByText('Outcome flow already configured')
				).toBeInTheDocument();
			});
			expect(screen.queryByText('Imported')).not.toBeInTheDocument();
		});
	});

	describe('Import Flow Mode', () => {
		const campaignsWithFlowsData = [
			{
				id: 10,
				name: 'Campaign with Flow',
				flowId: 50,
				dispositionFlow: { id: 50, name: 'Test Flow' },
				dispositionCatalog: null,
			},
			{
				id: 20,
				name: 'Another Campaign',
				flowId: 60,
				dispositionFlow: { id: 60, name: 'Another Flow' },
				dispositionCatalog: { type: 'OUTBOUND' },
			},
		];

		beforeEach(() => {
			mockCampaignsWithFlows.mockReturnValue({
				data: campaignsWithFlowsData,
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});
		});

		it('switches to import mode when Import from Campaign is clicked', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			expect(
				screen.getByPlaceholderText('Search campaigns...')
			).toBeInTheDocument();
		});

		it('displays list of campaigns with flows', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			expect(screen.getByText('Campaign with Flow')).toBeInTheDocument();
			expect(screen.getByText('Another Campaign')).toBeInTheDocument();
		});

		it('filters campaigns based on search query', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			const searchInput = screen.getByPlaceholderText('Search campaigns...');
			fireEvent.change(searchInput, { target: { value: 'Another' } });

			expect(screen.queryByText('Campaign with Flow')).not.toBeInTheDocument();
			expect(screen.getByText('Another Campaign')).toBeInTheDocument();
		});

		it('shows empty state when no campaigns match search', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			const searchInput = screen.getByPlaceholderText('Search campaigns...');
			fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

			expect(
				screen.getByText('No campaigns match your search')
			).toBeInTheDocument();
		});

		it('shows loading state when fetching campaigns', () => {
			mockCampaignsWithFlows.mockReturnValue({
				data: [],
				isLoading: true,
				isFetching: false,
				refetch: vi.fn(),
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			// Loader is rendered in import mode when loading
			expect(screen.queryByText('Campaign with Flow')).not.toBeInTheDocument();
			expect(
				screen.queryByText('No campaigns match your search')
			).not.toBeInTheDocument();
		});

		it('calls refetch when Refresh button is clicked', () => {
			const mockRefetch = vi.fn();
			mockCampaignsWithFlows.mockReturnValue({
				data: campaignsWithFlowsData,
				isLoading: false,
				isFetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Refresh'));

			expect(mockRefetch).toHaveBeenCalled();
		});
	});

	describe('Preview Flow Functionality', () => {
		const campaignsWithFlowsData = [
			{
				id: 10,
				name: 'Campaign with Flow',
				flowId: 50,
				dispositionFlow: { id: 50, name: 'Test Flow' },
				dispositionCatalog: null,
			},
		];

		beforeEach(() => {
			mockCampaignsWithFlows.mockReturnValue({
				data: campaignsWithFlowsData,
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});

			mockDispositionFlow.mockReturnValue({
				data: {
					id: 50,
					flowJson: { name: 'Preview Flow', dispositionNodes: [] },
				},
				isLoading: false,
			});
		});

		it('opens preview modal when preview button is clicked', async () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			// Find and click the preview button (eye icon)
			const previewButton = screen.getByLabelText('Preview flow');
			fireEvent.click(previewButton);

			await waitFor(() => {
				expect(
					screen.getByTestId('modal-outcome-flow-preview')
				).toBeInTheDocument();
			});
		});

		it('displays DispositionViewer in preview modal', async () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			const previewButton = screen.getByLabelText('Preview flow');
			fireEvent.click(previewButton);

			await waitFor(() => {
				expect(screen.getByTestId('disposition-viewer')).toBeInTheDocument();
			});
		});

		it('closes preview modal when close button is clicked', async () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));

			const previewButton = screen.getByLabelText('Preview flow');
			fireEvent.click(previewButton);

			await waitFor(() => {
				expect(
					screen.getByTestId('modal-outcome-flow-preview')
				).toBeInTheDocument();
			});

			fireEvent.click(screen.getByTestId('modal-close-btn'));

			await waitFor(() => {
				expect(
					screen.queryByTestId('modal-outcome-flow-preview')
				).not.toBeInTheDocument();
			});
		});
	});

	describe('Use Flow (Copy Flow) Functionality', () => {
		const campaignsWithFlowsData = [
			{
				id: 10,
				name: 'Source Campaign',
				flowId: 50,
				dispositionFlow: { id: 50, name: 'Test Flow' },
				dispositionCatalog: null,
			},
		];

		beforeEach(() => {
			mockCampaignsWithFlows.mockReturnValue({
				data: campaignsWithFlowsData,
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});
		});

		it('copies flow when Use flow button is clicked', async () => {
			const mockMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith({
					sourceFlowId: 50,
					targetCampaignId: 1,
				});
			});
		});

		it('shows success notification after successful import', async () => {
			const mockMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Outcome Flow Imported',
						color: 'green',
					})
				);
			});
		});

		it('shows success state with imported badge after import', async () => {
			const mockMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(
					screen.getByText('Outcome flow imported successfully')
				).toBeInTheDocument();
				expect(screen.getByText('Imported')).toBeInTheDocument();
				expect(screen.getByText('From: Source Campaign')).toBeInTheDocument();
			});
		});

		it('shows Preview Flow button after successful import', async () => {
			const mockMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(screen.getByText('Preview Flow')).toBeInTheDocument();
			});
		});

		it('shows error notification when import fails', async () => {
			const mockMutateAsync = vi
				.fn()
				.mockRejectedValue(new Error('Import failed'));

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Import Failed',
						color: 'red',
					})
				);
			});
		});

		it('changes button to Continue after successful import', async () => {
			const mockMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(screen.getByText('Continue')).toBeInTheDocument();
			});
		});
	});

	describe('Start Over Functionality', () => {
		it('shows Start Over button after flow is created', () => {
			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Create Outcome Flow'));
			fireEvent.click(screen.getByTestId('disposition-form-complete'));

			expect(screen.getByText('Start Over')).toBeInTheDocument();
		});

		it('deletes existing campaign flow when Start Over is clicked after create', async () => {
			mockExistingFlow = null;
			const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});
			mockDeleteDispositionFlow.mockReturnValue({
				mutateAsync: mockDeleteMutateAsync,
				isPending: false,
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);
			fireEvent.click(screen.getByText('Create Outcome Flow'));
			fireEvent.click(screen.getByTestId('disposition-form-complete'));

			// Flow exists in the backend after creation; simulate it becoming available
			// for the refetch used by Start Over.
			mockExistingFlow = { id: 321, flowJson: { dispositionNodes: [] } };

			await waitFor(() => {
				expect(screen.getByText('Start Over')).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText('Start Over'));

			await waitFor(() => {
				expect(mockDeleteMutateAsync).toHaveBeenCalledWith(321);
			});
		});

		it('deletes copied flow when Start Over is clicked after import', async () => {
			const mockCopyMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});
			const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockCopyMutateAsync,
				isPending: false,
			});

			mockDeleteDispositionFlow.mockReturnValue({
				mutateAsync: mockDeleteMutateAsync,
				isPending: false,
			});

			mockCampaignsWithFlows.mockReturnValue({
				data: [
					{
						id: 10,
						name: 'Source Campaign',
						flowId: 50,
						dispositionFlow: { id: 50 },
						dispositionCatalog: null,
					},
				],
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			// Import a flow first
			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(screen.getByText('Start Over')).toBeInTheDocument();
			});

			// Click Start Over
			fireEvent.click(screen.getByText('Start Over'));

			await waitFor(() => {
				expect(mockDeleteMutateAsync).toHaveBeenCalledWith(100);
			});
		});

		it('shows notification after successful deletion', async () => {
			const mockCopyMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});
			const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockCopyMutateAsync,
				isPending: false,
			});

			mockDeleteDispositionFlow.mockReturnValue({
				mutateAsync: mockDeleteMutateAsync,
				isPending: false,
			});

			mockCampaignsWithFlows.mockReturnValue({
				data: [
					{
						id: 10,
						name: 'Source Campaign',
						flowId: 50,
						dispositionFlow: { id: 50 },
						dispositionCatalog: null,
					},
				],
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(screen.getByText('Start Over')).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText('Start Over'));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Flow Removed',
						color: 'blue',
					})
				);
			});
		});

		it('shows error notification when deletion fails', async () => {
			const mockCopyMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});
			const mockDeleteMutateAsync = vi
				.fn()
				.mockRejectedValue(new Error('Delete failed'));

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockCopyMutateAsync,
				isPending: false,
			});

			mockDeleteDispositionFlow.mockReturnValue({
				mutateAsync: mockDeleteMutateAsync,
				isPending: false,
			});

			mockCampaignsWithFlows.mockReturnValue({
				data: [
					{
						id: 10,
						name: 'Source Campaign',
						flowId: 50,
						dispositionFlow: { id: 50 },
						dispositionCatalog: null,
					},
				],
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(screen.getByText('Start Over')).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText('Start Over'));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						message: expect.any(String),
						color: 'red',
					})
				);
			});
		});

		it('resets to initial state after successful Start Over', async () => {
			const mockCopyMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});
			const mockDeleteMutateAsync = vi.fn().mockResolvedValue({});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockCopyMutateAsync,
				isPending: false,
			});

			mockDeleteDispositionFlow.mockReturnValue({
				mutateAsync: mockDeleteMutateAsync,
				isPending: false,
			});

			mockCampaignsWithFlows.mockReturnValue({
				data: [
					{
						id: 10,
						name: 'Source Campaign',
						flowId: 50,
						dispositionFlow: { id: 50 },
						dispositionCatalog: null,
					},
				],
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(
					screen.getByText('Outcome flow imported successfully')
				).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText('Start Over'));

			await waitFor(() => {
				expect(mockDeleteMutateAsync).toHaveBeenCalledWith(100);
			});

			await waitFor(() => {
				expect(screen.getByText('Create New')).toBeInTheDocument();
				expect(screen.getByText('Import from Campaign')).toBeInTheDocument();
			});
		});
	});

	describe('Navigation', () => {
		it('calls onNext directly when Continue is clicked after import', async () => {
			const mockMutateAsync = vi.fn().mockResolvedValue({
				flow: { id: 100 },
				campaign: { id: 1 },
			});

			mockCopyDispositionFlow.mockReturnValue({
				mutateAsync: mockMutateAsync,
				isPending: false,
			});

			mockCampaignsWithFlows.mockReturnValue({
				data: [
					{
						id: 10,
						name: 'Source Campaign',
						flowId: 50,
						dispositionFlow: { id: 50 },
						dispositionCatalog: null,
					},
				],
				isLoading: false,
				isFetching: false,
				refetch: vi.fn(),
			});

			renderWithProviders(<StepThreeOutcomes onNext={mockOnNext} />);

			fireEvent.click(screen.getByText('Import from Campaign'));
			fireEvent.click(screen.getByText('Use flow'));

			await waitFor(() => {
				expect(screen.getByText('Continue')).toBeInTheDocument();
			});

			fireEvent.click(screen.getByText('Continue'));

			await waitFor(() => {
				expect(mockOnNext).toHaveBeenCalled();
			});
		});
	});
});
