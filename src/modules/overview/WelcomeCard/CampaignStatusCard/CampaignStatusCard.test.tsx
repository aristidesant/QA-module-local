import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import CampaignStatusCard from './CampaignStatusCard';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('CampaignStatusCard', () => {
	it('renders heading and legend items', () => {
		renderWithProviders(<CampaignStatusCard />);

		expect(screen.getByText('Campaign status')).toBeInTheDocument();
		expect(screen.getByText('Campaigns')).toBeInTheDocument();
		expect(screen.getByText('Running')).toBeInTheDocument();
		expect(screen.getByText('Active')).toBeInTheDocument();
		expect(screen.getByText('Paused')).toBeInTheDocument();
		expect(screen.getByText('Warning')).toBeInTheDocument();
		// total number
		expect(screen.getByText('254')).toBeInTheDocument();
	});
});
