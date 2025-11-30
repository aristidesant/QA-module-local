import { render, screen, fireEvent } from '@testing-library/react';
import { StepFiveSuccess } from './StepFiveSuccess';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useNavigate } from 'react-router';
import { MantineProvider } from '@mantine/core';

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
		return render(
			<MantineProvider>
				<StepFiveSuccess onComplete={mockOnComplete} />
			</MantineProvider>
		);
	};

	it('renders campaign details correctly', () => {
		renderComponent();
		expect(screen.getByText('Test Campaign')).toBeInTheDocument();
		expect(screen.getByText('INBOUND')).toBeInTheDocument();
		expect(screen.getByText('ACTIVE')).toBeInTheDocument();
		expect(screen.getByText('$1,000')).toBeInTheDocument();
	});

	it('handles view campaign action', () => {
		renderComponent();
		fireEvent.click(screen.getByText('View campaign'));
		expect(mockReset).toHaveBeenCalled();
		expect(mockNavigate).toHaveBeenCalledWith('/campaign/1');
	});

	it('handles close wizard action', () => {
		renderComponent();
		fireEvent.click(screen.getByText('Close wizard'));
		expect(mockReset).toHaveBeenCalled();
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
				'Your campaign is configured. Review the summary or jump straight to the campaign overview.'
			)
		).toBeInTheDocument();

		// Check for dashes in summary
		const dashes = screen.getAllByText('—');
		expect(dashes.length).toBeGreaterThan(0);
	});
});
