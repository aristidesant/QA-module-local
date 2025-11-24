import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActiveCallsTable, ActiveCall } from './ActiveCallsTable';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('ActiveCallsTable', () => {
	const mockCalls: ActiveCall[] = [
		{
			station: 'Station 1',
			user: 'User 1',
			sessionId: '123',
			status: 'INCALL',
			pause: '0',
			mmss: '05:00',
			campaign: 'Campaign 1',
			calls: 10,
			hold: '0',
			inGroup: 'Group 1',
		},
		{
			station: 'Station 2',
			user: 'User 2',
			sessionId: '456',
			status: 'PAUSED',
			pause: '10',
			mmss: '02:00',
			campaign: 'Campaign 1',
			calls: 5,
			hold: '0',
			inGroup: 'Group 1',
		},
	];

	it('renders table headers correctly', () => {
		renderWithProviders(<ActiveCallsTable calls={[]} />);
		expect(screen.getByText('Station')).toBeInTheDocument();
		expect(screen.getByText('User')).toBeInTheDocument();
		expect(screen.getByText('Session ID')).toBeInTheDocument();
		expect(screen.getByText('Status')).toBeInTheDocument();
	});

	it('renders calls correctly', () => {
		renderWithProviders(<ActiveCallsTable calls={mockCalls} />);

		expect(screen.getByText('Station 1')).toBeInTheDocument();
		expect(screen.getByText('User 1')).toBeInTheDocument();
		expect(screen.getByText('123')).toBeInTheDocument();
		expect(screen.getByText('INCALL')).toBeInTheDocument();

		expect(screen.getByText('Station 2')).toBeInTheDocument();
		expect(screen.getByText('User 2')).toBeInTheDocument();
		expect(screen.getByText('456')).toBeInTheDocument();
		expect(screen.getByText('PAUSED')).toBeInTheDocument();
	});

	it('renders empty state when no calls', () => {
		renderWithProviders(<ActiveCallsTable calls={[]} />);
		expect(screen.getByText('No active calls')).toBeInTheDocument();
	});
});
