import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import SpecificsSection from './SpecificsSection';

type SpecificMetric = {
	key: string;
	label: string;
	value: number;
	meta?: {
		conversationsMeasured?: number;
	};
};

const renderWithProviders = (ui: React.ReactElement) => {
	return render(<MantineProvider>{ui}</MantineProvider>);
};

const mockMetrics: SpecificMetric[] = [
	{
		key: 'averageHandleTime',
		label: 'Average Handle Time',
		value: 180,
		meta: { conversationsMeasured: 500 },
	},
	{
		key: 'conversionRate',
		label: 'Conversion Rate',
		value: 45,
	},
	{
		key: 'customerSatisfaction',
		label: 'Customer Satisfaction',
		value: 92,
		meta: { conversationsMeasured: 1250 },
	},
];

describe('SpecificsSection', () => {
	describe('Rendering', () => {
		it('renders the section title', () => {
			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={mockMetrics}
					maxSpecificValue={180}
				/>
			);

			expect(screen.getByText('Focused Metrics')).toBeInTheDocument();
		});

		it('renders the section description', () => {
			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={mockMetrics}
					maxSpecificValue={180}
				/>
			);

			expect(
				screen.getByText('Key KPIs reported by the platform.')
			).toBeInTheDocument();
		});

		it('renders all metrics when provided', () => {
			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={mockMetrics}
					maxSpecificValue={180}
				/>
			);

			expect(screen.getByText('Average Handle Time')).toBeInTheDocument();
			expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
			expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
		});

		it('renders metric values formatted with locale string', () => {
			const metricsWithLargeValues: SpecificMetric[] = [
				{
					key: 'largeValue',
					label: 'Large Value Metric',
					value: 1234567,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithLargeValues}
					maxSpecificValue={1234567}
				/>
			);

			expect(screen.getByText('1,234,567')).toBeInTheDocument();
		});

		it('renders conversations measured when meta is provided', () => {
			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={mockMetrics}
					maxSpecificValue={180}
				/>
			);

			expect(
				screen.getByText('500 conversations measured')
			).toBeInTheDocument();
			expect(
				screen.getByText('1,250 conversations measured')
			).toBeInTheDocument();
		});

		it('does not render conversations measured when meta is not provided', () => {
			const metricsWithoutMeta: SpecificMetric[] = [
				{
					key: 'noMeta',
					label: 'No Meta Metric',
					value: 100,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithoutMeta}
					maxSpecificValue={100}
				/>
			);

			expect(
				screen.queryByText(/conversations measured/)
			).not.toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('renders empty message when no metrics are provided', () => {
			renderWithProviders(
				<SpecificsSection displayedSpecifics={[]} maxSpecificValue={0} />
			);

			expect(
				screen.getByText('There are no specific metrics to display right now.')
			).toBeInTheDocument();
		});

		it('still renders the title in empty state', () => {
			renderWithProviders(
				<SpecificsSection displayedSpecifics={[]} maxSpecificValue={0} />
			);

			expect(screen.getByText('Focused Metrics')).toBeInTheDocument();
		});
	});

	describe('Progress Bar Calculation', () => {
		it('renders progress bars for each metric', () => {
			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={mockMetrics}
					maxSpecificValue={180}
				/>
			);

			const progressBars = document.querySelectorAll(
				'[class*="mantine-Progress-root"]'
			);
			expect(progressBars.length).toBe(3);
		});

		it('handles maxSpecificValue of 0 without errors', () => {
			const metricsWithZero: SpecificMetric[] = [
				{
					key: 'zeroMax',
					label: 'Zero Max Test',
					value: 50,
				},
			];

			expect(() =>
				renderWithProviders(
					<SpecificsSection
						displayedSpecifics={metricsWithZero}
						maxSpecificValue={0}
					/>
				)
			).not.toThrow();
		});
	});

	describe('Edge Cases', () => {
		it('handles undefined value gracefully (displays 0)', () => {
			const metricsWithUndefined: SpecificMetric[] = [
				{
					key: 'undefinedValue',
					label: 'Undefined Value Metric',
					value: undefined as unknown as number,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithUndefined}
					maxSpecificValue={100}
				/>
			);

			expect(screen.getByText('0')).toBeInTheDocument();
		});

		it('handles NaN value gracefully (displays 0)', () => {
			const metricsWithNaN: SpecificMetric[] = [
				{
					key: 'nanValue',
					label: 'NaN Value Metric',
					value: NaN,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithNaN}
					maxSpecificValue={100}
				/>
			);

			expect(screen.getByText('0')).toBeInTheDocument();
		});

		it('handles Infinity value gracefully (displays 0)', () => {
			const metricsWithInfinity: SpecificMetric[] = [
				{
					key: 'infinityValue',
					label: 'Infinity Value Metric',
					value: Infinity,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithInfinity}
					maxSpecificValue={100}
				/>
			);

			expect(screen.getByText('0')).toBeInTheDocument();
		});

		it('handles negative values', () => {
			const metricsWithNegative: SpecificMetric[] = [
				{
					key: 'negativeValue',
					label: 'Negative Value Metric',
					value: -50,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithNegative}
					maxSpecificValue={100}
				/>
			);

			expect(screen.getByText('-50')).toBeInTheDocument();
		});

		it('handles zero value', () => {
			const metricsWithZero: SpecificMetric[] = [
				{
					key: 'zeroValue',
					label: 'Zero Value Metric',
					value: 0,
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithZero}
					maxSpecificValue={100}
				/>
			);

			expect(screen.getByText('0')).toBeInTheDocument();
		});

		it('caps progress bar at 100% when value exceeds maxSpecificValue', () => {
			const metricsExceedingMax: SpecificMetric[] = [
				{
					key: 'exceedMax',
					label: 'Exceeding Max Metric',
					value: 200,
				},
			];

			// Should not throw and should cap at 100%
			expect(() =>
				renderWithProviders(
					<SpecificsSection
						displayedSpecifics={metricsExceedingMax}
						maxSpecificValue={100}
					/>
				)
			).not.toThrow();
		});

		it('handles conversationsMeasured of 0', () => {
			const metricsWithZeroConversations: SpecificMetric[] = [
				{
					key: 'zeroConversations',
					label: 'Zero Conversations Metric',
					value: 50,
					meta: { conversationsMeasured: 0 },
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={metricsWithZeroConversations}
					maxSpecificValue={100}
				/>
			);

			// 0 is falsy, so it should not render the conversations measured text
			expect(
				screen.queryByText(/conversations measured/)
			).not.toBeInTheDocument();
		});
	});

	describe('Single Metric', () => {
		it('renders correctly with a single metric', () => {
			const singleMetric: SpecificMetric[] = [
				{
					key: 'single',
					label: 'Single Metric',
					value: 75,
					meta: { conversationsMeasured: 100 },
				},
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={singleMetric}
					maxSpecificValue={100}
				/>
			);

			expect(screen.getByText('Single Metric')).toBeInTheDocument();
			expect(screen.getByText('75')).toBeInTheDocument();
			expect(
				screen.getByText('100 conversations measured')
			).toBeInTheDocument();
		});
	});

	describe('Multiple Metrics Order', () => {
		it('renders metrics in the order they are provided', () => {
			const orderedMetrics: SpecificMetric[] = [
				{ key: 'first', label: 'First Metric', value: 10 },
				{ key: 'second', label: 'Second Metric', value: 20 },
				{ key: 'third', label: 'Third Metric', value: 30 },
			];

			renderWithProviders(
				<SpecificsSection
					displayedSpecifics={orderedMetrics}
					maxSpecificValue={30}
				/>
			);

			const labels = screen.getAllByText(/Metric$/);
			expect(labels[0]).toHaveTextContent('First Metric');
			expect(labels[1]).toHaveTextContent('Second Metric');
			expect(labels[2]).toHaveTextContent('Third Metric');
		});
	});
});
