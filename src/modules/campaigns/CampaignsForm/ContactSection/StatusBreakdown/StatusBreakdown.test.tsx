import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { StatusBreakdown } from './StatusBreakdown';
import { vi } from 'vitest';
import { useGetContactSummaryGroups } from '~/queries/contactsQueries';

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: vi.fn(() => ({
		selectedCampaign: { id: 1, name: 'Test Campaign' },
	})),
}));

vi.mock('~/queries/contactsQueries', () => ({
	useGetContactSummaryGroups: vi.fn(() => ({
		data: {
			statusBreakdown: [
				{ status: 'PENDING', count: 10 },
				{ status: 'COMPLETED', count: 5 },
			],
			totalContacts: 15,
		},
		isLoading: false,
	})),
}));

describe('StatusBreakdown', () => {
	it('renders the title from translations', () => {
		renderWithProviders(<StatusBreakdown />);

		expect(screen.getByText('Status breakdown')).toBeInTheDocument();
	});

	it('renders the subtitle from translations', () => {
		renderWithProviders(<StatusBreakdown />);

		expect(
			screen.getByText('Contact distribution by status.')
		).toBeInTheDocument();
	});

	it('displays total contacts count', () => {
		renderWithProviders(<StatusBreakdown />);

		expect(screen.getByText('15')).toBeInTheDocument();
	});

	it('shows loading skeletons when data is loading', () => {
		vi.mocked(useGetContactSummaryGroups).mockReturnValue({
			data: null,
			isLoading: true,
		} as any);

		const { container } = renderWithProviders(<StatusBreakdown />);

		const skeletons = container.querySelectorAll('[class*="Skeleton"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('shows no data message when there is no data', () => {
		vi.mocked(useGetContactSummaryGroups).mockReturnValue({
			data: {
				statusBreakdown: [],
				totalContacts: 0,
			},
			isLoading: false,
		} as any);

		renderWithProviders(<StatusBreakdown />);

		expect(screen.getByText('No data available')).toBeInTheDocument();
	});
});
