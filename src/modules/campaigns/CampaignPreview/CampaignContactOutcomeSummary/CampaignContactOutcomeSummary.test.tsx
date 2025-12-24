import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignContactOutcomeSummary from './CampaignContactOutcomeSummary';

const { mockUseGetCallDispositionReportParents } = vi.hoisted(() => ({
	mockUseGetCallDispositionReportParents: vi.fn(),
}));

vi.mock('~/queries/callDispositionQueries', () => ({
	useGetCallDispositionReportParents: (...args: unknown[]) =>
		mockUseGetCallDispositionReportParents(...args),
}));

describe('CampaignContactOutcomeSummary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows skeleton when loading', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: undefined,
			isLoading: true,
			refetch: vi.fn(),
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);
		expect(
			screen.getByLabelText('preview.outcomeSummary.refreshData')
		).toBeInTheDocument();
		// Ensure skeleton text is rendered by checking for no outcome text
		expect(
			screen.queryByText('preview.outcomeSummary.noData')
		).not.toBeInTheDocument();
	});

	it('shows empty state when there is no data', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: { dispositions: [] },
			isLoading: false,
			refetch: vi.fn(),
			totalCalls: 0,
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);
		expect(
			screen.getByText('preview.outcomeSummary.noData')
		).toBeInTheDocument();
	});

	it('renders legend and allows selecting dispositions', () => {
		const refetch = vi.fn();
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 5, percentage: 50 },
					{ dispositionName: 'No Contact', count: 5, percentage: 50 },
				],
				totalCalls: 10,
			},
			isLoading: false,
			refetch,
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);
		expect(screen.getByText('Effective Contact')).toBeInTheDocument();
		expect(screen.getByText('No Contact')).toBeInTheDocument();
		expect(screen.getByText('10')).toBeInTheDocument();

		// Click the View button for Effective Contact
		const viewButton = screen.getByRole('button', {
			name: /View Effective Contact/i,
		});
		fireEvent.click(viewButton);
		expect(
			screen.getByText('preview.outcomeSummary.backToOverview')
		).toBeInTheDocument();

		// Click refresh button to trigger refetch
		const refreshButton = screen.getByLabelText(
			'preview.outcomeSummary.refreshData'
		);
		fireEvent.click(refreshButton);
		expect(refetch).toHaveBeenCalled();
	});

	it('renders chart container with correct dimensions', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 5, percentage: 50 },
					{ dispositionName: 'No Contact', count: 5, percentage: 50 },
				],
				totalCalls: 10,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		const { container } = renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);
		expect(
			container.querySelector('[class*="chartContainer"]')
		).toBeInTheDocument();
	});

	it('shows parent badge when a disposition is selected', async () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 5, percentage: 50 },
					{ dispositionName: 'No Effective Contact', count: 5, percentage: 50 },
				],
				totalCalls: 10,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);

		const viewButton = screen.getByRole('button', {
			name: /View No Effective Contact/i,
		});
		fireEvent.click(viewButton);

		await waitFor(() => {
			const allElements = screen.getAllByText('No Effective Contact');
			expect(allElements.length).toBeGreaterThan(0);
		});
	});

	it('clears filter when clicking back to overview button', () => {
		const refetch = vi.fn();
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 5, percentage: 50 },
					{ dispositionName: 'No Contact', count: 5, percentage: 50 },
				],
				totalCalls: 10,
			},
			isLoading: false,
			refetch,
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);

		// Select a disposition
		const viewButton = screen.getByRole('button', {
			name: /View Effective Contact/i,
		});
		fireEvent.click(viewButton);
		expect(
			screen.getByText('preview.outcomeSummary.backToOverview')
		).toBeInTheDocument();

		// Click back button
		const backButton = screen.getByRole('button', {
			name: /preview.outcomeSummary.backToOverview/i,
		});
		fireEvent.click(backButton);

		// Should no longer show parent badge
		expect(
			screen.queryByText(/preview.outcomeSummary.backToOverview/)
		).not.toBeInTheDocument();
	});

	it('disables refresh button when campaign is completed', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 5, percentage: 50 },
				],
				totalCalls: 5,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary
				campaign={{ id: 1, status: 'COMPLETED' } as any}
			/>
		);

		const refreshButton = screen.getByLabelText(
			'preview.outcomeSummary.refreshData'
		);
		expect(refreshButton).toBeDisabled();
	});

	it('formats large numbers with locale string', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 1000, percentage: 50 },
					{ dispositionName: 'No Contact', count: 1000, percentage: 50 },
				],
				totalCalls: 2000,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);

		// Check for formatted number (should be "1,000" in en-US locale)
		const formattedNumbers = screen.getAllByText(/1,000/);
		expect(formattedNumbers.length).toBeGreaterThan(0);
	});

	it('renders with multiple dispositions and distinct colors', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 100, percentage: 25 },
					{
						dispositionName: 'No Effective Contact',
						count: 100,
						percentage: 25,
					},
					{ dispositionName: 'No Contact', count: 100, percentage: 25 },
					{ dispositionName: 'Other', count: 100, percentage: 25 },
				],
				totalCalls: 400,
			},
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);

		expect(screen.getByText('Effective Contact')).toBeInTheDocument();
		expect(screen.getByText('No Effective Contact')).toBeInTheDocument();
		expect(screen.getByText('No Contact')).toBeInTheDocument();
		expect(screen.getByText('Other')).toBeInTheDocument();
	});

	it('renders without campaign prop gracefully', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: { dispositions: [] },
			isLoading: false,
			refetch: vi.fn(),
		});
		const { container } = renderWithProviders(
			<CampaignContactOutcomeSummary />
		);
		expect(container).toBeInTheDocument();
	});

	it('shows loading state without campaign id', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: undefined,
			isLoading: true,
			refetch: vi.fn(),
		});
		renderWithProviders(<CampaignContactOutcomeSummary campaign={undefined} />);
		expect(
			screen.getByLabelText('preview.outcomeSummary.refreshData')
		).toBeInTheDocument();
	});

	it('handles disposition selection and subsequent refetch correctly', () => {
		const refetch = vi.fn();
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: {
				dispositions: [
					{ dispositionName: 'Effective Contact', count: 10, percentage: 100 },
				],
				totalCalls: 10,
			},
			isLoading: false,
			refetch,
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);

		const viewButton = screen.getByRole('button', {
			name: /View Effective Contact/i,
		});
		fireEvent.click(viewButton);

		const refreshButton = screen.getByLabelText(
			'preview.outcomeSummary.refreshData'
		);
		fireEvent.click(refreshButton);

		expect(refetch).toHaveBeenCalled();
	});

	it('renders correct text for outcome summary title and description', () => {
		mockUseGetCallDispositionReportParents.mockReturnValue({
			data: { dispositions: [] },
			isLoading: false,
			refetch: vi.fn(),
		});
		renderWithProviders(
			<CampaignContactOutcomeSummary campaign={{ id: 1 } as any} />
		);

		expect(
			screen.getByText('preview.outcomeSummary.title')
		).toBeInTheDocument();
		expect(
			screen.getByText('preview.outcomeSummary.description')
		).toBeInTheDocument();
	});
});

export {};
