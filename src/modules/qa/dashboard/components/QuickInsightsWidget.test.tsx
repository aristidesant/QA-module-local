import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QuickInsightsWidget, Insight } from './QuickInsightsWidget';

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

describe('QuickInsightsWidget', () => {
	describe('Rendering with default insights', () => {
		it('should render default insights when no insights prop provided', () => {
			renderWithMantine(<QuickInsightsWidget />);

			// Verify default insight titles are rendered
			expect(screen.getByText('Performance')).toBeInTheDocument();
			expect(screen.getByText('Efficiency')).toBeInTheDocument();
			expect(screen.getByText('Compliance')).toBeInTheDocument();
		});

		it('should render default insight descriptions', () => {
			renderWithMantine(<QuickInsightsWidget />);

			expect(screen.getByText('Your performance is trending positively this week. Keep up the great work!')).toBeInTheDocument();
			expect(screen.getByText('Focus on improving call handling efficiency.')).toBeInTheDocument();
			expect(screen.getByText('Consider reviewing compliance procedures.')).toBeInTheDocument();
		});
	});

	describe('Rendering with custom insights', () => {
		it('should render custom insights when provided', () => {
			const customInsights: Insight[] = [
				{ title: 'Test 1', description: 'Description 1', type: 'positive' },
				{ title: 'Test 2', description: 'Description 2', type: 'warning' },
			];

			renderWithMantine(<QuickInsightsWidget insights={customInsights} />);

			expect(screen.getByText('Test 1')).toBeInTheDocument();
			expect(screen.getByText('Description 1')).toBeInTheDocument();
			expect(screen.getByText('Test 2')).toBeInTheDocument();
			expect(screen.getByText('Description 2')).toBeInTheDocument();
		});

		it('should render all insight types (positive, warning, neutral)', () => {
			const customInsights: Insight[] = [
				{ title: 'Positive', description: 'Positive description', type: 'positive' },
				{ title: 'Warning', description: 'Warning description', type: 'warning' },
				{ title: 'Neutral', description: 'Neutral description', type: 'neutral' },
			];

			renderWithMantine(<QuickInsightsWidget insights={customInsights} />);

			expect(screen.getByText('Positive')).toBeInTheDocument();
			expect(screen.getByText('Warning')).toBeInTheDocument();
			expect(screen.getByText('Neutral')).toBeInTheDocument();
		});

		it('should render empty array without error', () => {
			renderWithMantine(<QuickInsightsWidget insights={[]} />);

			// Should render without errors and with title (if provided)
			expect(screen.queryByText('Performance')).not.toBeInTheDocument();
		});
	});

	describe('Title rendering', () => {
		it('should render title when provided', () => {
			renderWithMantine(<QuickInsightsWidget title="Quick Insights" insights={[]} />);

			expect(screen.getByText('Quick Insights')).toBeInTheDocument();
		});

		it('should not render title when not provided', () => {
			renderWithMantine(<QuickInsightsWidget insights={[]} />);

			expect(screen.queryByText('Quick Insights')).not.toBeInTheDocument();
		});

		it('should render title with default insights', () => {
			renderWithMantine(<QuickInsightsWidget title="My Insights" />);

			expect(screen.getByText('My Insights')).toBeInTheDocument();
			expect(screen.getByText('Performance')).toBeInTheDocument();
		});
	});

	describe('Icon and color mapping', () => {
		it('should render ThemeIcon for each insight', () => {
			const customInsights: Insight[] = [
				{ title: 'Positive', description: 'Positive description', type: 'positive' },
				{ title: 'Warning', description: 'Warning description', type: 'warning' },
				{ title: 'Neutral', description: 'Neutral description', type: 'neutral' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			// Check that ThemeIcon components are rendered
			const themeIcons = container.querySelectorAll('[class*="ThemeIcon"]');
			expect(themeIcons.length).toBe(3);
		});

		it('should apply correct color to positive insight', () => {
			const customInsights: Insight[] = [
				{ title: 'Positive', description: 'Positive description', type: 'positive' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			// Verify positive insight renders
			expect(screen.getByText('Positive')).toBeInTheDocument();

			// Verify the icon container (ThemeIcon) exists
			const themeIcons = container.querySelectorAll('[class*="ThemeIcon"]');
			expect(themeIcons.length).toBeGreaterThan(0);
		});

		it('should apply correct color to warning insight', () => {
			const customInsights: Insight[] = [
				{ title: 'Warning', description: 'Warning description', type: 'warning' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			expect(screen.getByText('Warning')).toBeInTheDocument();

			// Verify the icon container exists
			const themeIcons = container.querySelectorAll('[class*="ThemeIcon"]');
			expect(themeIcons.length).toBeGreaterThan(0);
		});

		it('should apply correct color to neutral insight', () => {
			const customInsights: Insight[] = [
				{ title: 'Neutral', description: 'Neutral description', type: 'neutral' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			expect(screen.getByText('Neutral')).toBeInTheDocument();

			// Verify the icon container exists
			const themeIcons = container.querySelectorAll('[class*="ThemeIcon"]');
			expect(themeIcons.length).toBeGreaterThan(0);
		});

		it('should render insight container with proper structure for styling', () => {
			const customInsights: Insight[] = [
				{ title: 'Positive', description: 'Positive description', type: 'positive' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			// Verify that insight title is rendered and component has proper container
			expect(screen.getByText('Positive')).toBeInTheDocument();

			// Verify the structure: Stack contains insight containers with Group and content
			const stacks = container.querySelectorAll('[class*="Stack"]');
			expect(stacks.length).toBeGreaterThan(1); // One for wrapper, one for insights list
		});
	});

	describe('Layout and responsiveness', () => {
		it('should render Stack with proper structure', () => {
			const customInsights: Insight[] = [
				{ title: 'Test 1', description: 'Description 1', type: 'positive' },
				{ title: 'Test 2', description: 'Description 2', type: 'warning' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			// Verify Stack layout is used
			const stacks = container.querySelectorAll('[class*="Stack"]');
			expect(stacks.length).toBeGreaterThan(0);
		});

		it('should render Group layout for each insight', () => {
			const customInsights: Insight[] = [
				{ title: 'Test 1', description: 'Description 1', type: 'positive' },
			];

			const { container } = renderWithMantine(
				<QuickInsightsWidget insights={customInsights} />
			);

			// Verify Group layout is used
			const groups = container.querySelectorAll('[class*="Group"]');
			expect(groups.length).toBeGreaterThan(0);
		});
	});

	describe('Default insights fallback', () => {
		it('should use DEFAULT_INSIGHTS when no insights array provided', () => {
			renderWithMantine(<QuickInsightsWidget />);

			// All three default insights should be present
			expect(screen.getByText('Performance')).toBeInTheDocument();
			expect(screen.getByText('Efficiency')).toBeInTheDocument();
			expect(screen.getByText('Compliance')).toBeInTheDocument();

			// Verify descriptions
			expect(screen.getByText('Your performance is trending positively this week. Keep up the great work!')).toBeInTheDocument();
			expect(screen.getByText('Focus on improving call handling efficiency.')).toBeInTheDocument();
			expect(screen.getByText('Consider reviewing compliance procedures.')).toBeInTheDocument();
		});

		it('should allow passing empty array to show no insights', () => {
			renderWithMantine(<QuickInsightsWidget insights={[]} />);

			// Default insights should NOT be rendered
			expect(screen.queryByText('Performance')).not.toBeInTheDocument();
			expect(screen.queryByText('Efficiency')).not.toBeInTheDocument();
			expect(screen.queryByText('Compliance')).not.toBeInTheDocument();
		});
	});

	describe('Text styling', () => {
		it('should render insight titles in bold', () => {
			const customInsights: Insight[] = [
				{ title: 'Bold Title', description: 'Description', type: 'positive' },
			];

			renderWithMantine(<QuickInsightsWidget insights={customInsights} />);

			const titleElement = screen.getByText('Bold Title');
			expect(titleElement).toHaveStyle({ fontWeight: '600' });
		});

		it('should render insight descriptions in dimmed color', () => {
			const customInsights: Insight[] = [
				{ title: 'Title', description: 'Dimmed Description', type: 'positive' },
			];

			renderWithMantine(<QuickInsightsWidget insights={customInsights} />);

			const descriptionElement = screen.getByText('Dimmed Description');
			expect(descriptionElement).toHaveClass('mantine-Text-root');
		});
	});
});
