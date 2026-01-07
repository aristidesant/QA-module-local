import { screen, fireEvent } from '@testing-library/react';
import { StepFiveSuccess } from './StepFiveSuccess';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useNavigate } from 'react-router';
import {
	renderWithProviders,
	testI18n,
} from '~/test-utils/renderWithProviders';

// Mock store and router
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
}));

describe('StepFiveSuccess', () => {
	const mockOnComplete = vi.fn();
	const mockReset = vi.fn();
	const mockNavigate = vi.fn();

	const mockCampaign = {
		id: 1,
		name: 'Test Campaign',
		type: 'INBOUND',
		status: 'ACTIVE',
		budget: 1000,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			createdCampaign: mockCampaign,
			reset: mockReset,
		});
		(useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			mockNavigate
		);
	});

	const renderComponent = () => {
		return renderWithProviders(<StepFiveSuccess onComplete={mockOnComplete} />);
	};

	it('renders campaign details correctly', () => {
		renderComponent();
		expect(screen.getByText('Test Campaign')).toBeInTheDocument();
		expect(screen.getByText('INBOUND')).toBeInTheDocument();
		expect(screen.getByText('ACTIVE')).toBeInTheDocument();
		// Mantine formatting might add currency symbol or use different decimal separators
		expect(screen.getByText(/1,000/)).toBeInTheDocument();
	});

	it('handles view campaign action', () => {
		renderComponent();
		fireEvent.click(
			screen.getByText(
				testI18n.t('wizard.steps.complete.viewCampaign', { ns: 'campaigns' })
			)
		);
		expect(mockNavigate).toHaveBeenCalledWith('/campaign/1');
		expect(mockOnComplete).toHaveBeenCalled();
	});

	it('handles close wizard action', () => {
		renderComponent();
		fireEvent.click(
			screen.getByText(
				testI18n.t('wizard.steps.complete.closeWizard', { ns: 'campaigns' })
			)
		);
		expect(mockOnComplete).toHaveBeenCalled();
	});

	it('handles missing campaign data gracefully', () => {
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			createdCampaign: null,
			reset: mockReset,
		});
		renderComponent();

		// Should show placeholders or default text
		expect(
			screen.getByText(
				testI18n.t('wizard.steps.complete.descriptionText', { ns: 'campaigns' })
			)
		).toBeInTheDocument();

		// Check for dashes in summary
		const dashes = screen.getAllByText('—');
		expect(dashes.length).toBeGreaterThan(0);
	});
});
