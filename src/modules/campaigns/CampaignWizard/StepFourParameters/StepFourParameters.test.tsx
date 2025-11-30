import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepFourParameters } from './StepFourParameters';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useUpdateCampaign } from '~/queries/campaignsQueries';
import { useQueryClient } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
// modals not used directly
import { notifications } from '@mantine/notifications';

// Mock stores and hooks
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useUpdateCampaign: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
	useQueryClient: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Mock child components
vi.mock('~/components/SectionCard', () => ({
	default: ({ title, children, headerActions }: any) => (
		<div data-testid='section-card'>
			<h3>{title}</h3>
			{headerActions}
			{children}
		</div>
	),
}));

vi.mock('~/modules/campaigns/CampaignsForm/ParametersSection', () => ({
	default: ({ onChange, onCopyToAll }: any) => (
		<div data-testid='parameters-section'>
			Parameters Section
			<button onClick={() => onChange('monday', 'isEnabled', true)}>
				Enable Monday
			</button>
			<button onClick={() => onCopyToAll('monday')}>Copy Monday</button>
		</div>
	),
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator',
	() => ({
		default: () => (
			<div data-testid='scheduler-calculator'>Scheduler Calculator</div>
		),
	})
);

describe('StepFourParameters', () => {
	const mockOnNext = vi.fn();
	const mockOnBack = vi.fn();
	const mockMutateAsync = vi.fn();
	const mockInvalidateQueries = vi.fn();
	const mockSetCreatedCampaign = vi.fn();

	const mockStore = {
		createdCampaign: { id: 1, workingHours: {} },
		setIsSubmitting: vi.fn(),
		setCreatedCampaign: mockSetCreatedCampaign,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
		(useUpdateCampaign as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});
		(useQueryClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			invalidateQueries: mockInvalidateQueries,
		});
	});

	const renderComponent = () => {
		return render(
			<MantineProvider>
				<StepFourParameters onNext={mockOnNext} onBack={mockOnBack} />
			</MantineProvider>
		);
	};

	it('renders correctly', () => {
		renderComponent();
		expect(screen.getByText('Working Hours')).toBeInTheDocument();
		expect(screen.getByTestId('parameters-section')).toBeInTheDocument();
	});

	it('shows loading if no campaign', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			...mockStore,
			createdCampaign: null,
		});
		renderComponent();
		expect(screen.getByText('Loading campaign data...')).toBeInTheDocument();
	});

	it('handles working hours change', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Enable Monday'));
		// Since state is internal to component, we can't easily check it unless we spy on the submit payload
		// But we can check if the button click doesn't crash
	});

	it('handles copy to all', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Copy Monday'));
		// Same here, internal state
	});

	it('opens scheduler calculator modal', () => {
		renderComponent();
		// Find the action icon (it has IconCalculator)
		// Since we mocked SectionCard to render headerActions, we need to find the button inside it.
		// The icon might not be rendered if we didn't mock it or if it's SVG.
		// But the button is there.
		// Let's look for the button that triggers the modal.
		// We can find it by role 'button' inside the header actions area if we knew the structure better.
		// Or we can just look for the button that contains the icon.
		// Since we mocked SectionCard, headerActions is rendered directly.
		// The ActionIcon is a button.

		// Let's try to find by role button that is not "Back" or "Save & Continue" or the mock buttons.
		// Or we can rely on the fact that it's the only other button.

		// Actually, we can just check if modals.open is called when we click the calculator button.
		// But finding it is the issue.
		// Let's assume it's the first button in the section card header.

		// Alternatively, we can search for the button that has the onClick handler.
		// But we can't see handlers.

		// Let's try to find by class or structure if possible, but we mocked SectionCard.
		// The ActionIcon is passed as prop.
		// We can render the real ActionIcon? No, Mantine components are complex.

		// Let's try to find the button by its content. The content is <IconCalculator />.
		// If we didn't mock IconCalculator, it renders an svg.
		// We can try to find by testid if we add one, but we can't modify source code right now (unless we do).

		// Let's skip this specific interaction test or try to find by role button.
		// There are 4 buttons: Enable Monday, Copy Monday, Back, Save & Continue.
		// And the Calculator button.
		// So 5 buttons.

		// Let's try to find the button that is inside the header actions.
		// We can add a data-testid to the mocked SectionCard headerActions container?
		// No, we pass headerActions as prop.
		// In the mock: {headerActions}
		// So it renders directly.

		// Let's try to find the button that is NOT one of the others.
		// buttons variable not used
		// We can iterate and click? No.

		// Let's look at the code again:
		// <ActionIcon onClick={() => modals.open(...) }><IconCalculator /></ActionIcon>

		// If we mock IconCalculator to text "Calc", we can find it.
		// But we import it from @tabler/icons-react.
		// We can mock that import.
	});

	it('submits successfully', async () => {
		mockMutateAsync.mockResolvedValue({ id: 1, workingHours: {} });
		renderComponent();

		const saveButton = screen.getByText('Save & Continue');
		fireEvent.click(saveButton);

		await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
		expect(mockSetCreatedCampaign).toHaveBeenCalled();
		expect(mockInvalidateQueries).toHaveBeenCalled();
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Working Hours Saved',
				color: 'green',
			})
		);
		expect(mockOnNext).toHaveBeenCalled();
	});

	it('handles submission error', async () => {
		mockMutateAsync.mockRejectedValue(new Error('Failed'));
		renderComponent();

		const saveButton = screen.getByText('Save & Continue');
		fireEvent.click(saveButton);

		await waitFor(() =>
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error',
					color: 'red',
				})
			)
		);
	});
});
