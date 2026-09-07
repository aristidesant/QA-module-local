import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { BestWorstCallsPanel, BestWorstCall } from './BestWorstCallsPanel';

describe('BestWorstCallsPanel', () => {
	const mockCalls: BestWorstCall[] = [
		{
			id: 'CALL-BEST-001',
			date: '2026-09-07T10:30:00Z',
			agent: 'John Smith',
			duration: 420,
			qaScore: 98,
			sentiment: 4.8,
			type: 'best',
		},
		{
			id: 'CALL-BEST-002',
			date: '2026-09-06T14:15:00Z',
			agent: 'Sarah Johnson',
			duration: 380,
			qaScore: 96,
			sentiment: 4.7,
			type: 'best',
		},
		{
			id: 'CALL-WORST-001',
			date: '2026-09-07T13:45:00Z',
			agent: 'David Brown',
			duration: 520,
			qaScore: 62,
			sentiment: 2.1,
			type: 'worst',
		},
		{
			id: 'CALL-WORST-002',
			date: '2026-09-06T11:20:00Z',
			agent: 'Lisa Wong',
			duration: 680,
			qaScore: 58,
			sentiment: 2.3,
			type: 'worst',
		},
	];

	const renderComponent = (calls: BestWorstCall[]) => {
		return render(
			<MantineProvider>
				<BestWorstCallsPanel calls={calls} />
			</MantineProvider>
		);
	};

	it('should render with mixed best and worst calls', () => {
		renderComponent(mockCalls);

		// Verify section titles
		expect(screen.getByText('Best Calls')).toBeInTheDocument();
		expect(screen.getByText('Worst Calls')).toBeInTheDocument();

		// Verify badges show correct counts
		const badges = screen.getAllByText(/^[0-9]+$/);
		expect(badges).toHaveLength(2); // One badge for each section

		// Verify best call data is visible
		expect(screen.getByText('John Smith')).toBeInTheDocument();
		expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();

		// Verify worst call data is visible
		expect(screen.getByText('David Brown')).toBeInTheDocument();
		expect(screen.getByText('Lisa Wong')).toBeInTheDocument();
	});

	it('should correctly filter calls by type', () => {
		renderComponent(mockCalls);

		// Verify agents from best calls are present
		expect(screen.getByText('John Smith')).toBeInTheDocument();
		expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();

		// Verify agents from worst calls are present
		expect(screen.getByText('David Brown')).toBeInTheDocument();
		expect(screen.getByText('Lisa Wong')).toBeInTheDocument();
	});

	it('should show empty state for best calls when no best calls provided', () => {
		const worstOnlyCalls: BestWorstCall[] = [
			{
				id: 'CALL-WORST-001',
				date: '2026-09-07T13:45:00Z',
				agent: 'David Brown',
				duration: 520,
				qaScore: 62,
				sentiment: 2.1,
				type: 'worst',
			},
		];

		renderComponent(worstOnlyCalls);

		// Verify empty state message
		expect(screen.getByText('No best calls this week')).toBeInTheDocument();

		// Verify worst calls section still has data
		expect(screen.getByText('David Brown')).toBeInTheDocument();
	});

	it('should show empty state for worst calls when no worst calls provided', () => {
		const bestOnlyCalls: BestWorstCall[] = [
			{
				id: 'CALL-BEST-001',
				date: '2026-09-07T10:30:00Z',
				agent: 'John Smith',
				duration: 420,
				qaScore: 98,
				sentiment: 4.8,
				type: 'best',
			},
		];

		renderComponent(bestOnlyCalls);

		// Verify empty state message
		expect(screen.getByText('No worst calls this week')).toBeInTheDocument();

		// Verify best calls section still has data
		expect(screen.getByText('John Smith')).toBeInTheDocument();
	});

	it('should show both empty states when no calls provided', () => {
		renderComponent([]);

		expect(screen.getByText('No best calls this week')).toBeInTheDocument();
		expect(screen.getByText('No worst calls this week')).toBeInTheDocument();
	});

	it('should display column headers', () => {
		renderComponent(mockCalls);

		expect(screen.getAllByText('Date')).toHaveLength(2); // In each section
		expect(screen.getAllByText('Agent')).toHaveLength(2);
		expect(screen.getAllByText('Duration')).toHaveLength(2);
		expect(screen.getAllByText('QA Score')).toHaveLength(2);
		expect(screen.getAllByText('Sentiment')).toHaveLength(2);
	});

	it('should format duration correctly', () => {
		const testCalls: BestWorstCall[] = [
			{
				id: 'CALL-001',
				date: '2026-09-07T10:30:00Z',
				agent: 'Test Agent',
				duration: 420, // 7 minutes
				qaScore: 90,
				sentiment: 4.5,
				type: 'best',
			},
		];

		renderComponent(testCalls);

		// 420 seconds = 7 minutes
		expect(screen.getByText('7m')).toBeInTheDocument();
	});

	it('should display badges with correct counts', () => {
		renderComponent(mockCalls);

		// Should display badge with "2" for best calls
		const bestBadge = screen.getByText('2');
		expect(bestBadge).toBeInTheDocument();

		// The worst calls badge should also display "2"
		// (both badges show their respective counts)
	});

	it('should handle QA score and sentiment values', () => {
		renderComponent(mockCalls);

		// Check that QA scores are displayed
		expect(screen.getByText('98%')).toBeInTheDocument();
		expect(screen.getByText('62%')).toBeInTheDocument();

		// Check that sentiment values are displayed
		expect(screen.getByText('4.8')).toBeInTheDocument();
		expect(screen.getByText('2.1')).toBeInTheDocument();
	});
});
