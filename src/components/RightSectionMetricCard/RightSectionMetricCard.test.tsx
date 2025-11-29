import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import {
	IconChartBar,
	IconUsers,
	IconClock,
	IconTrendingUp,
} from '@tabler/icons-react';
import RightSectionMetricCard from './RightSectionMetricCard';

const defaultProps = {
	title: 'Performance Metrics',
	description: 'Overview of key metrics',
	icon: IconChartBar,
	iconColor: 'blue',
	metaItems: [
		{
			label: 'Total Users',
			value: '1,234',
			icon: <IconUsers size={16} />,
		},
		{
			label: 'Avg Time',
			value: '3.5 min',
			icon: <IconClock size={16} />,
		},
	],
};

const renderRightSectionMetricCard = (
	props: Partial<Parameters<typeof RightSectionMetricCard>[0]> = {}
) => {
	return render(
		<MantineProvider>
			<RightSectionMetricCard {...defaultProps} {...props} />
		</MantineProvider>
	);
};

describe('RightSectionMetricCard', () => {
	describe('Rendering', () => {
		it('renders the title', () => {
			renderRightSectionMetricCard();

			expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
		});

		it('renders the description', () => {
			renderRightSectionMetricCard();

			expect(screen.getByText('Overview of key metrics')).toBeInTheDocument();
		});

		it('renders meta items labels', () => {
			renderRightSectionMetricCard();

			expect(screen.getByText('Total Users')).toBeInTheDocument();
			expect(screen.getByText('Avg Time')).toBeInTheDocument();
		});

		it('renders meta items values', () => {
			renderRightSectionMetricCard();

			expect(screen.getByText('1,234')).toBeInTheDocument();
			expect(screen.getByText('3.5 min')).toBeInTheDocument();
		});

		it('renders icon from RightSectionCard', () => {
			const { container } = renderRightSectionMetricCard();

			const themeIcon = container.querySelector('[class*="ThemeIcon"]');
			expect(themeIcon).toBeInTheDocument();
		});
	});

	describe('Meta Items', () => {
		it('renders correct number of meta items', () => {
			const { container } = renderRightSectionMetricCard();

			const metaItems = container.querySelectorAll('[class*="metaItem"]');
			expect(metaItems.length).toBe(2);
		});

		it('renders meta item icons', () => {
			const { container } = renderRightSectionMetricCard();

			const metaIcons = container.querySelectorAll('[class*="metaIcon"]');
			expect(metaIcons.length).toBe(2);
		});

		it('renders many meta items', () => {
			const manyMetaItems = [
				{ label: 'Metric 1', value: '100', icon: <IconUsers size={16} /> },
				{ label: 'Metric 2', value: '200', icon: <IconClock size={16} /> },
				{ label: 'Metric 3', value: '300', icon: <IconTrendingUp size={16} /> },
				{ label: 'Metric 4', value: '400', icon: <IconChartBar size={16} /> },
			];

			renderRightSectionMetricCard({ metaItems: manyMetaItems });

			expect(screen.getByText('Metric 1')).toBeInTheDocument();
			expect(screen.getByText('Metric 2')).toBeInTheDocument();
			expect(screen.getByText('Metric 3')).toBeInTheDocument();
			expect(screen.getByText('Metric 4')).toBeInTheDocument();
		});

		it('renders empty meta items array', () => {
			const { container } = renderRightSectionMetricCard({ metaItems: [] });

			const metaItems = container.querySelectorAll('[class*="metaItem"]');
			expect(metaItems.length).toBe(0);
		});
	});

	describe('Props Passed to RightSectionCard', () => {
		it('passes title to RightSectionCard', () => {
			renderRightSectionMetricCard({ title: 'Custom Title' });

			expect(screen.getByText('Custom Title')).toBeInTheDocument();
		});

		it('passes description to RightSectionCard', () => {
			renderRightSectionMetricCard({ description: 'Custom description' });

			expect(screen.getByText('Custom description')).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			const metaItems = [
				{ label: 'Calls', value: '500', icon: <IconUsers size={16} /> },
				{ label: 'Duration', value: '2h 30m', icon: <IconClock size={16} /> },
				{
					label: 'Success Rate',
					value: '85%',
					icon: <IconTrendingUp size={16} />,
				},
			];

			renderRightSectionMetricCard({
				title: 'Call Statistics',
				description: "Today's call metrics",
				icon: IconChartBar,
				iconColor: 'green',
				metaItems,
			});

			expect(screen.getByText('Call Statistics')).toBeInTheDocument();
			expect(screen.getByText("Today's call metrics")).toBeInTheDocument();
			expect(screen.getByText('Calls')).toBeInTheDocument();
			expect(screen.getByText('500')).toBeInTheDocument();
			expect(screen.getByText('Duration')).toBeInTheDocument();
			expect(screen.getByText('2h 30m')).toBeInTheDocument();
			expect(screen.getByText('Success Rate')).toBeInTheDocument();
			expect(screen.getByText('85%')).toBeInTheDocument();
		});
	});
});
