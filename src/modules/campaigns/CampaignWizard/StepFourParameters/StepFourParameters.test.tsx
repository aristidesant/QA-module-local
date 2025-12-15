import { render, screen, fireEvent } from '@testing-library/react';
import { StepFourParameters } from './StepFourParameters';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { MantineProvider } from '@mantine/core';

// Mock stores and hooks
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
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
	default: () => <div data-testid='parameters-section'>Parameters Section</div>,
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator',
	() => ({
		default: () => (
			<div data-testid='scheduler-calculator'>Scheduler Calculator</div>
		),
	})
);

// Mock modals
vi.mock('@mantine/modals', () => ({
	modals: {
		open: vi.fn(),
	},
}));

describe('StepFourParameters', () => {
	const mockOnNext = vi.fn();
	const mockOnBack = vi.fn();

	const mockStore = {
		createdCampaign: { id: 1, workingHours: {} },
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
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
			createdCampaign: null,
		});
		renderComponent();
		expect(screen.getByText('Loading campaign data...')).toBeInTheDocument();
	});

	it('continues to next step on save', () => {
		renderComponent();

		const saveButton = screen.getByText('Save & Continue');
		fireEvent.click(saveButton);

		expect(mockOnNext).toHaveBeenCalled();
	});

	it('goes back on back button click', () => {
		renderComponent();

		const backButton = screen.getByText('Back');
		fireEvent.click(backButton);

		expect(mockOnBack).toHaveBeenCalled();
	});
});
