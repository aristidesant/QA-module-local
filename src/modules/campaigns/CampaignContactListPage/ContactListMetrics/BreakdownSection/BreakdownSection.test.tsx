import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import renderWithProviders from '~/test-utils/renderWithProviders';
import BreakdownSection from './BreakdownSection';

const sampleCards = [
	{
		key: 'connected',
		title: 'Connected Calls',
		subtitle: 'Reasons for successful connections',
		color: 'blue',
		reasons: [
			{ label: 'Answered', count: 1234, percentage: '65%' },
			{ label: 'Transferred', count: 56, percentage: '10%' },
			{ label: 'Voicemail', count: 0, percentage: '0%' },
		],
	},
	{
		key: 'not-connected',
		title: 'Not Connected',
		subtitle: 'Reasons for missed calls',
		color: 'red',
		reasons: [
			{ label: 'No Answer', count: 7890, percentage: '120%' }, // will be clamped visually, we assert text only
			{
				label: 'Busy',
				count: Number.NaN as unknown as number,
				percentage: '—',
			}, // invalid count -> formatted as 0
		],
	},
];

describe('BreakdownSection', () => {
	it('renders breakdown cards with titles and subtitles', () => {
		renderWithProviders(<BreakdownSection breakdownCards={sampleCards} />);
		// Card headers
		expect(screen.getByText('Connected Calls')).toBeInTheDocument();
		expect(
			screen.getByText('Reasons for successful connections')
		).toBeInTheDocument();
		expect(screen.getByText('Not Connected')).toBeInTheDocument();
		expect(screen.getByText('Reasons for missed calls')).toBeInTheDocument();
	});

	it('renders reasons labels, percentages and counts with locale formatting', () => {
		renderWithProviders(<BreakdownSection breakdownCards={sampleCards} />);
		// Labels
		expect(screen.getByText('Answered')).toBeInTheDocument();
		expect(screen.getByText('Transferred')).toBeInTheDocument();
		expect(screen.getByText('Voicemail')).toBeInTheDocument();
		expect(screen.getByText('No Answer')).toBeInTheDocument();
		expect(screen.getByText('Busy')).toBeInTheDocument();

		// Percentages (rendered as plain text)
		expect(screen.getByText('65%')).toBeInTheDocument();
		expect(screen.getByText('10%')).toBeInTheDocument();
		expect(screen.getByText('0%')).toBeInTheDocument();
		// The component displays whatever percentage string is provided
		expect(screen.getByText('120%')).toBeInTheDocument();
		expect(screen.getByText('—')).toBeInTheDocument();

		// Counts (formatted and suffixed by "calls")
		expect(screen.getByText('1,234 calls')).toBeInTheDocument();
		expect(screen.getByText('56 calls')).toBeInTheDocument();
		expect(screen.getByText('7,890 calls')).toBeInTheDocument();
		// Multiple zero-count reasons are expected
		expect(screen.getAllByText('0 calls').length).toBeGreaterThan(1);
	});

	it('shows empty state message when a card has no reasons', () => {
		const emptyCards = [
			{
				key: 'empty',
				title: 'Empty',
				subtitle: 'No data',
				color: 'gray',
				reasons: [],
			},
		];
		renderWithProviders(<BreakdownSection breakdownCards={emptyCards} />);
		expect(
			screen.getByText('No breakdown data available for this range.')
		).toBeInTheDocument();
	});
});
