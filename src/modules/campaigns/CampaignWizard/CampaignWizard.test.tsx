import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignWizard } from './CampaignWizard';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { MantineProvider } from '@mantine/core';

// Mock the store
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

// Mock child components to isolate CampaignWizard logic
vi.mock('./StepOneGeneral', () => ({
	StepOneGeneral: ({ onNext, onCancel }: any) => (
		<div data-testid='step-one'>
			Step One
			<button onClick={onNext}>Next</button>
			<button onClick={onCancel}>Cancel</button>
		</div>
	),
}));

vi.mock('./StepTwoAgent', () => ({
	StepTwoAgent: ({ onNext }: any) => (
		<div data-testid='step-two'>
			Step Two
			<button onClick={onNext}>Next</button>
		</div>
	),
}));

vi.mock('./StepThreeOutcomes', () => ({
	StepThreeOutcomes: ({ onNext }: any) => (
		<div data-testid='step-three'>
			Step Three
			<button onClick={onNext}>Next</button>
		</div>
	),
}));

vi.mock('./StepFourParameters', () => ({
	StepFourParameters: ({ onNext }: any) => (
		<div data-testid='step-four'>
			Step Four
			<button onClick={onNext}>Next</button>
		</div>
	),
}));

vi.mock('./StepFiveSuccess', () => ({
	StepFiveSuccess: ({ onComplete }: any) => (
		<div data-testid='step-five'>
			Step Five
			<button onClick={onComplete}>Complete</button>
		</div>
	),
}));

describe('CampaignWizard', () => {
	const mockNextStep = vi.fn();
	const mockPrevStep = vi.fn();
	const mockReset = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			activeStep: 0,
			nextStep: mockNextStep,
			prevStep: mockPrevStep,
			reset: mockReset,
		});
	});

	const renderComponent = (props = {}) => {
		return render(
			<MantineProvider>
				<CampaignWizard {...props} />
			</MantineProvider>
		);
	};

	it('renders StepOneGeneral initially', () => {
		renderComponent();
		expect(screen.getByTestId('step-one')).toBeInTheDocument();
		expect(screen.queryByTestId('step-two')).not.toBeInTheDocument();
	});

	it('renders StepTwoAgent when activeStep is 1', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			activeStep: 1,
			nextStep: mockNextStep,
			prevStep: mockPrevStep,
			reset: mockReset,
		});
		renderComponent();
		expect(screen.getByTestId('step-two')).toBeInTheDocument();
	});

	it('renders StepThreeOutcomes when activeStep is 2', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			activeStep: 2,
			nextStep: mockNextStep,
			prevStep: mockPrevStep,
			reset: mockReset,
		});
		renderComponent();
		expect(screen.getByTestId('step-three')).toBeInTheDocument();
	});

	it('renders StepFourParameters when activeStep is 3', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			activeStep: 3,
			nextStep: mockNextStep,
			prevStep: mockPrevStep,
			reset: mockReset,
		});
		renderComponent();
		expect(screen.getByTestId('step-four')).toBeInTheDocument();
	});

	it('renders StepFiveSuccess when activeStep is 4', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			activeStep: 4,
			nextStep: mockNextStep,
			prevStep: mockPrevStep,
			reset: mockReset,
		});
		renderComponent();
		expect(screen.getByTestId('step-five')).toBeInTheDocument();
	});

	it('calls nextStep when Next button is clicked in StepOne', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Next'));
		expect(mockNextStep).toHaveBeenCalled();
	});

	it('calls reset and onCancel when Cancel button is clicked in StepOne', () => {
		const onCancel = vi.fn();
		renderComponent({ onCancel });
		fireEvent.click(screen.getByText('Cancel'));
		expect(mockReset).toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalled();
	});

	it('calls onComplete when Complete button is clicked in StepFive', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			activeStep: 4,
			nextStep: mockNextStep,
			prevStep: mockPrevStep,
			reset: mockReset,
		});
		const onComplete = vi.fn();
		renderComponent({ onComplete });
		// Use getByRole to specifically target the button in the mocked step-five
		const stepFive = screen.getByTestId('step-five');
		fireEvent.click(stepFive.querySelector('button')!);
		expect(onComplete).toHaveBeenCalled();
	});
});
