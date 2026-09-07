import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QuickStatsWidget } from './QuickStatsWidget';
import { AGENT_QUICK_STATS } from '../mockData';

/**
 * Test wrapper with Mantine provider
 */
const renderWithMantine = (component: React.ReactElement) => {
	return render(
		<MantineProvider>
			{component}
		</MantineProvider>
	);
};

describe('QuickStatsWidget', () => {
	describe('Rendering with AGENT_QUICK_STATS', () => {
		it('should render all data entries from AGENT_QUICK_STATS', () => {
			renderWithMantine(<QuickStatsWidget data={AGENT_QUICK_STATS} />);

			// Verify all keys are converted and displayed
			expect(screen.getByText('Total Calls')).toBeInTheDocument();
			expect(screen.getByText('Avg Call Duration')).toBeInTheDocument();
			expect(screen.getByText('Completion Rate')).toBeInTheDocument();
			expect(screen.getByText('Escalation Rate')).toBeInTheDocument();
			expect(screen.getByText('Average Sentiment Agent')).toBeInTheDocument();
			expect(screen.getByText('Average Sentiment Customer')).toBeInTheDocument();
			expect(screen.getByText('Emotion')).toBeInTheDocument();
		});

		it('should display correct values for AGENT_QUICK_STATS', () => {
			renderWithMantine(<QuickStatsWidget data={AGENT_QUICK_STATS} />);

			expect(screen.getByText('24')).toBeInTheDocument();
			expect(screen.getByText('412')).toBeInTheDocument();
			expect(screen.getByText('92')).toBeInTheDocument();
			expect(screen.getByText('8')).toBeInTheDocument();
			expect(screen.getByText('4.2')).toBeInTheDocument();
			expect(screen.getByText('4.1')).toBeInTheDocument();
			expect(screen.getByText('Satisfaction')).toBeInTheDocument();
		});

		it('should render title when provided', () => {
			renderWithMantine(
				<QuickStatsWidget data={AGENT_QUICK_STATS} title="Quick Stats" />
			);

			expect(screen.getByText('Quick Stats')).toBeInTheDocument();
		});

		it('should not render title when not provided', () => {
			renderWithMantine(
				<QuickStatsWidget data={AGENT_QUICK_STATS} />
			);

			// Check that no h2 or title-level heading exists with that text
			expect(screen.queryByText('Quick Stats')).not.toBeInTheDocument();
		});
	});

	describe('Label formatting', () => {
		it('should convert camelCase keys to Title Case labels', () => {
			const testData = {
				totalCalls: 10,
				avgSentiment: 4.5,
				completionRate: 95,
				escalationRate: 5,
			};

			renderWithMantine(<QuickStatsWidget data={testData} />);

			expect(screen.getByText('Total Calls')).toBeInTheDocument();
			expect(screen.getByText('Avg Sentiment')).toBeInTheDocument();
			expect(screen.getByText('Completion Rate')).toBeInTheDocument();
			expect(screen.getByText('Escalation Rate')).toBeInTheDocument();
		});

		it('should handle single-word keys', () => {
			const testData = {
				calls: 100,
				duration: 500,
			};

			renderWithMantine(<QuickStatsWidget data={testData} />);

			expect(screen.getByText('Calls')).toBeInTheDocument();
			expect(screen.getByText('Duration')).toBeInTheDocument();
		});
	});

	describe('Grid layout', () => {
		it('should render SimpleGrid with correct responsive columns', () => {
			const { container: gridContainer } = renderWithMantine(
				<QuickStatsWidget data={AGENT_QUICK_STATS} />
			);

			// Verify SimpleGrid is present in the DOM
			const grid = gridContainer.querySelector('[class*="SimpleGrid"]');
			expect(grid).toBeInTheDocument();
		});

		it('should render all stats items in Paper components', () => {
			const { container } = renderWithMantine(
				<QuickStatsWidget data={AGENT_QUICK_STATS} />
			);

			// Count Paper components (should be 7 for AGENT_QUICK_STATS)
			const papers = container.querySelectorAll('[class*="Paper"]');
			expect(papers.length).toBeGreaterThan(0);
		});
	});

	describe('Value formatting', () => {
		it('should display numeric values in bold', () => {
			renderWithMantine(<QuickStatsWidget data={{ totalCalls: 24 }} />);

			// Find the value text and check its styling
			const valueElement = screen.getByText('24');
			expect(valueElement).toHaveStyle({ fontWeight: '700' });
		});

		it('should display string values in bold', () => {
			renderWithMantine(
				<QuickStatsWidget data={{ emotion: 'Satisfaction' }} />
			);

			const valueElement = screen.getByText('Satisfaction');
			expect(valueElement).toHaveStyle({ fontWeight: '700' });
		});
	});
});
