import { screen, fireEvent, waitFor } from '@testing-library/react';
import { StepFourParameters } from './StepFourParameters';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import {
	renderWithProviders,
	testI18n,
} from '~/test-utils/renderWithProviders';

// Mock stores and hooks
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useSetCampaignDraft: vi.fn(),
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

	const mockStore = {
		createdCampaign: { id: 1, workingHours: {} },
	};

	beforeEach(async () => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);

		const { useSetCampaignDraft } = await import('~/queries/campaignsQueries');
		(useSetCampaignDraft as any).mockReturnValue({
			mutateAsync: vi.fn().mockResolvedValue({}),
		});
	});

	const renderComponent = () => {
		return renderWithProviders(<StepFourParameters onNext={mockOnNext} />);
	};

	it('renders correctly', () => {
		renderComponent();
		expect(
			screen.getByText(
				testI18n.t('wizard.steps.parameters.workingHoursTitle', {
					ns: 'campaigns',
				})
			)
		).toBeInTheDocument();
		expect(screen.getByTestId('parameters-section')).toBeInTheDocument();
	});

	it('shows loading if no campaign', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			createdCampaign: null,
		});
		renderComponent();
		expect(
			screen.getByText(
				testI18n.t('wizard.steps.parameters.loading', { ns: 'campaigns' })
			)
		).toBeInTheDocument();
	});

	it('continues to next step on save', async () => {
		renderComponent();

		const saveButton = screen.getByText(
			testI18n.t('wizard.steps.parameters.submit', { ns: 'campaigns' })
		);
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockOnNext).toHaveBeenCalled();
		});
	});
});
