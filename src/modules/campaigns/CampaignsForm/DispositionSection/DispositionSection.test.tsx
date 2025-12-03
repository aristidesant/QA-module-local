import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import DispositionSection from './DispositionSection';

const {
	mockUseDispositionFlowsByCampaignPath,
	mockModalsOpen,
	mockModalsClose,
	mockUseCampaignsStore,
	mockUseDispositionBuilderStore,
	mockSetDispositionFlow,
	mockSetFlowJson,
	mockSetCampaignId,
	mockNotificationsShow,
} = vi.hoisted(() => ({
	mockUseDispositionFlowsByCampaignPath: vi.fn(),
	mockModalsOpen: vi.fn(),
	mockModalsClose: vi.fn(),
	mockUseCampaignsStore: vi.fn(),
	mockUseDispositionBuilderStore: vi.fn(),
	mockSetDispositionFlow: vi.fn(),
	mockSetFlowJson: vi.fn(),
	mockSetCampaignId: vi.fn(),
	mockNotificationsShow: vi.fn(),
}));

vi.mock('~/queries/dispositionFlowQueries', () => ({
	useDispositionFlowsByCampaignPath: (...args: unknown[]) =>
		mockUseDispositionFlowsByCampaignPath(...(args as any)),
}));

vi.mock('@mantine/modals', () => ({
	modals: { open: mockModalsOpen, close: mockModalsClose },
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (selector?: any) => {
		if (!selector) return mockUseCampaignsStore();
		return mockUseCampaignsStore(selector);
	},
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/DispositionSection/dispositionStore',
	() => ({
		useDispositionBuilderStore: (selector?: any) =>
			selector
				? selector(mockUseDispositionBuilderStore())
				: mockUseDispositionBuilderStore(),
	})
);

vi.mock('@mantine/notifications', () => ({
	notifications: { show: mockNotificationsShow },
}));

vi.mock('~/hooks/useDispositionLabel', () => ({
	__esModule: true,
	default: () => (label: string) => `lbl: ${label}`,
}));

vi.mock('./DispositionViewer', () => ({
	__esModule: true,
	default: () => <div>Disposition Viewer</div>,
}));

describe('DispositionSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCampaignsStore.mockReturnValue({
			selectedCampaign: { id: 1 },
			setRightComponent: vi.fn(),
		});
		// default builder store
		mockUseDispositionBuilderStore.mockReturnValue({
			setDispositionFlow: mockSetDispositionFlow,
			setFlowJson: mockSetFlowJson,
			setCampaignId: mockSetCampaignId,
		});
	});

	it('renders empty state when no flow is present', () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithProviders(<DispositionSection />);

		expect(screen.getByText(/No outcome flow configured/i)).toBeVisible();
		expect(screen.getByText(/Outcome Configuration/i)).toBeInTheDocument();
	});

	it('renders viewer and opens edit modal when flow exists', () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: { id: 1, flowJson: { dispositionNodes: [{ id: 1, name: 'foo' }] } },
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithProviders(<DispositionSection />);

		expect(screen.getByText('Disposition Viewer')).toBeInTheDocument();

		// Click edit button
		const editButton = screen.getByRole('button');
		fireEvent.click(editButton);
		expect(mockModalsOpen).toHaveBeenCalled();
	});

	it('opens add modal and populates builder store when no flow', () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithProviders(<DispositionSection />);
		const addButton = screen.getByRole('button');
		fireEvent.click(addButton);

		expect(mockSetDispositionFlow).toHaveBeenCalledWith({});
		expect(mockSetFlowJson).toHaveBeenCalledWith({});
		expect(mockSetCampaignId).toHaveBeenCalledWith(1);
		expect(mockModalsOpen).toHaveBeenCalled();
	});

	it('renders viewer when a flow is present but no nodes and shows Add tooltip', async () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: { id: 7, flowJson: { dispositionNodes: [] } },
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithProviders(<DispositionSection />);

		expect(screen.getByText('Disposition Viewer')).toBeInTheDocument();
		const addButton = screen.getByRole('button');
		// Hover to show tooltip
		const user = userEvent.setup();
		await user.hover(addButton);
		await screen.findByText('lbl: Add outcome');
		// Click add should open modal and reset builder store
		fireEvent.click(addButton);
		expect(mockSetDispositionFlow).toHaveBeenCalledWith({});
		expect(mockSetFlowJson).toHaveBeenCalledWith({});
		expect(mockSetCampaignId).toHaveBeenCalledWith(1);
		expect(mockModalsOpen).toHaveBeenCalled();
	});

	it('shows loading state on edit button when isLoading true', async () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: { id: 9, flowJson: { dispositionNodes: [{ id: 1, name: 'foo' }] } },
			isLoading: true,
			refetch: vi.fn(),
		});

		renderWithProviders(<DispositionSection />);

		const editButton = screen.getByRole('button');
		// The action icon uses data-loading attribute when loading is true
		expect(editButton).toHaveAttribute('data-loading', 'true');
		const user = userEvent.setup();
		await user.hover(editButton);
		await screen.findByText('lbl: Edit outcome');
	});

	it('populates builder store when editing an existing flow', () => {
		const flow = {
			id: 42,
			flowJson: {
				dispositionNodes: [{ id: 99, name: 'bar' }],
				name: 'My Flow',
			},
		} as any;
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: flow,
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithProviders(<DispositionSection />);
		const editButton = screen.getByRole('button');
		fireEvent.click(editButton);

		expect(mockSetDispositionFlow).toHaveBeenCalledWith(flow);
		expect(mockSetFlowJson).toHaveBeenCalledWith(flow.flowJson);
		expect(mockSetCampaignId).toHaveBeenCalledWith(1);
		expect(mockModalsOpen).toHaveBeenCalled();
	});

	it('cleans up right component on unmount', () => {
		const setRightComponent = vi.fn();
		mockUseCampaignsStore.mockReturnValue({
			selectedCampaign: { id: 1 },
			setRightComponent,
		});

		const { unmount } = renderWithProviders(<DispositionSection />);
		unmount();

		expect(setRightComponent).toHaveBeenCalledWith(null);
	});

	it('modal onComplete triggers refetch, close and success notification', () => {
		const mockRefetch = vi.fn();
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: {
				id: 11,
				flowJson: { dispositionNodes: [{ id: 1, name: 'foo' }] },
			},
			isLoading: false,
			refetch: mockRefetch,
		});

		renderWithProviders(<DispositionSection />);
		const editButton = screen.getByRole('button');
		fireEvent.click(editButton);

		// Grab the modal args passed to modals.open and call the onComplete
		const modalArgs = mockModalsOpen.mock.calls[0][0] as any;
		// The children prop is a React element; extract its props.onComplete
		const onComplete = modalArgs.children.props.onComplete as () => void;
		onComplete();

		expect(mockRefetch).toHaveBeenCalled();
		expect(mockModalsClose).toHaveBeenCalledWith('disposition-form');
		expect(mockNotificationsShow).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Success',
				message: 'lbl: Outcome flow saved successfully.',
				color: 'green',
			})
		);
	});

	it('modal onClose resets builder store values and campaign id', () => {
		// Simulate open add modal
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(<DispositionSection />);
		const addButton = screen.getByRole('button');
		fireEvent.click(addButton);

		const modalArgs = mockModalsOpen.mock.calls[0][0] as any;
		// Call the onClose callback to simulate closing the modal
		modalArgs.onClose();

		expect(mockSetCampaignId).toHaveBeenCalledWith(undefined);
		expect(mockSetDispositionFlow).toHaveBeenCalledWith({});
		expect(mockSetFlowJson).toHaveBeenCalledWith({});
	});

	it('edit with currentDispositionFlow without id should only set campaignId', () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: {
				flowJson: { dispositionNodes: [{ id: 1, name: 'foo' }], name: 'No ID' },
			},
			isLoading: false,
			refetch: vi.fn(),
		} as any);
		// Reset spies
		mockSetDispositionFlow.mockClear();
		mockSetFlowJson.mockClear();
		mockSetCampaignId.mockClear();

		renderWithProviders(<DispositionSection />);
		const editButton = screen.getByRole('button');
		fireEvent.click(editButton);

		expect(mockSetDispositionFlow).not.toHaveBeenCalled();
		expect(mockSetFlowJson).not.toHaveBeenCalled();
		expect(mockSetCampaignId).toHaveBeenCalledWith(1);
	});

	it('renders description text using disposition label', () => {
		mockUseDispositionFlowsByCampaignPath.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(<DispositionSection />);

		expect(
			screen.getByText(
				/Set up call outcomes for this campaign. Drag items from the catalog to build your outcome structure./i
			)
		).toBeInTheDocument();
		// Because we prefixed labels with 'lbl: ', the description title should include it
		expect(screen.getByText('lbl: Outcome Configuration')).toBeInTheDocument();
	});
});

export {};
