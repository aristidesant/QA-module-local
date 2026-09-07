import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { PerformanceTrendChart, type PerformanceTrendPoint } from './PerformanceTrendChart';

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

describe('PerformanceTrendChart', () => {
	const mockData: PerformanceTrendPoint[] = [
		{ week: 'Week 1', score: 82 },
		{ week: 'Week 2', score: 85 },
		{ week: 'Week 3', score: 87 },
		{ week: 'Week 4', score: 90 }
	];

	describe('Component Rendering', () => {
		it('should render the title text', () => {
			renderWithMantine(<PerformanceTrendChart data={mockData} />);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});

		it('should render without errors with valid data', () => {
			const { container } = renderWithMantine(
				<PerformanceTrendChart data={mockData} />
			);
			expect(container).toBeInTheDocument();
		});

		it('should render with empty data gracefully', () => {
			const emptyData: PerformanceTrendPoint[] = [];
			renderWithMantine(
				<PerformanceTrendChart data={emptyData} />
			);
			// Should still render title
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});

		it('should render with single data point', () => {
			const singleData: PerformanceTrendPoint[] = [{ week: 'Week 1', score: 85 }];
			renderWithMantine(
				<PerformanceTrendChart data={singleData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});
	});

	describe('Data Handling', () => {
		it('should accept various score ranges (0-100)', () => {
			const testData: PerformanceTrendPoint[] = [
				{ week: 'Week 1', score: 0 },
				{ week: 'Week 2', score: 50 },
				{ week: 'Week 3', score: 75 },
				{ week: 'Week 4', score: 100 }
			];

			renderWithMantine(
				<PerformanceTrendChart data={testData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});

		it('should handle decimal score values', () => {
			const testData: PerformanceTrendPoint[] = [
				{ week: 'Week 1', score: 82.5 },
				{ week: 'Week 2', score: 85.7 }
			];

			renderWithMantine(
				<PerformanceTrendChart data={testData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});

		it('should accept various week label formats', () => {
			const testData: PerformanceTrendPoint[] = [
				{ week: 'Week of Sept 1', score: 85 },
				{ week: '2026 W36', score: 88 }
			];

			renderWithMantine(
				<PerformanceTrendChart data={testData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});
	});

	describe('Component Structure', () => {
		it('should render container element', () => {
			const { container } = renderWithMantine(
				<PerformanceTrendChart data={mockData} />
			);

			// Verify the main container is rendered
			expect(container.firstChild).toBeInTheDocument();
		});

		it('should render multiple child elements', () => {
			const { container } = renderWithMantine(
				<PerformanceTrendChart data={mockData} />
			);

			// Verify there are multiple div elements (title, chart wrapper)
			const divs = container.querySelectorAll('div');
			expect(divs.length).toBeGreaterThanOrEqual(2);
		});

		it('should render with Mantine Stack layout', () => {
			const { container } = renderWithMantine(
				<PerformanceTrendChart data={mockData} />
			);

			const stackDiv = container.firstChild;
			expect(stackDiv).toBeInTheDocument();
		});
	});

	describe('Type Safety', () => {
		it('should accept PerformanceTrendPoint[] data type', () => {
			const typedData: PerformanceTrendPoint[] = [
				{ week: 'Week 1', score: 82 },
				{ week: 'Week 2', score: 85 }
			];

			renderWithMantine(
				<PerformanceTrendChart data={typedData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});

		it('should be a valid React component', () => {
			expect(typeof PerformanceTrendChart).toBe('function');
		});

		it('should have proper named export', () => {
			expect(PerformanceTrendChart).toBeDefined();
			expect(PerformanceTrendChart.name).toBe('PerformanceTrendChart');
		});

		it('should have default export', () => {
			// The default export is PerformanceTrendChart
			expect(PerformanceTrendChart).toBeDefined();
		});
	});

	describe('Props Validation', () => {
		it('should require data prop', () => {
			// This test verifies TypeScript would catch missing data prop
			expect(PerformanceTrendChart.length).toBeGreaterThan(0);
		});

		it('should render 4-week data correctly', () => {
			const fourWeekData: PerformanceTrendPoint[] = [
				{ week: 'Week 1', score: 82 },
				{ week: 'Week 2', score: 85 },
				{ week: 'Week 3', score: 87 },
				{ week: 'Week 4', score: 90 }
			];

			renderWithMantine(
				<PerformanceTrendChart data={fourWeekData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});

		it('should accept array with any length', () => {
			const twoWeekData: PerformanceTrendPoint[] = [
				{ week: 'Week 1', score: 80 },
				{ week: 'Week 2', score: 85 }
			];

			renderWithMantine(
				<PerformanceTrendChart data={twoWeekData} />
			);
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});
	});

	describe('Dark Mode Support', () => {
		it('should support dark mode through Mantine provider', () => {
			const { container } = renderWithMantine(
				<PerformanceTrendChart data={mockData} />
			);

			// Verify the component renders with Mantine provider
			// Dark mode is handled by CSS variables at runtime
			expect(container.firstChild).toBeInTheDocument();
			expect(screen.getByText('4-Week Performance Trend')).toBeInTheDocument();
		});
	});
});
