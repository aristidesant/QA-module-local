import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import StatCard from './StatCard';

const renderStatCard = (props: Parameters<typeof StatCard>[0]) => {
	return render(
		<MantineProvider>
			<StatCard {...props} />
		</MantineProvider>
	);
};

describe('StatCard', () => {
	describe('Rendering', () => {
		it('renders the title', () => {
			renderStatCard({ title: 'Total Users', value: 100 });

			expect(screen.getByText('Total Users')).toBeInTheDocument();
		});

		it('renders numeric value', () => {
			renderStatCard({ title: 'Users', value: 1234 });

			expect(screen.getByText('1234')).toBeInTheDocument();
		});

		it('renders string value', () => {
			renderStatCard({ title: 'Status', value: 'Active' });

			expect(screen.getByText('Active')).toBeInTheDocument();
		});

		it('renders ReactNode value', () => {
			renderStatCard({
				title: 'Custom',
				value: <span data-testid='custom-value'>$1,234.56</span>,
			});

			expect(screen.getByTestId('custom-value')).toBeInTheDocument();
		});

		it('renders subtitle when provided as string', () => {
			renderStatCard({
				title: 'Users',
				value: 100,
				subtitle: '+10% from last month',
			});

			expect(screen.getByText('+10% from last month')).toBeInTheDocument();
		});

		it('renders subtitle when provided as ReactNode', () => {
			renderStatCard({
				title: 'Users',
				value: 100,
				subtitle: <span data-testid='custom-subtitle'>Custom subtitle</span>,
			});

			expect(screen.getByTestId('custom-subtitle')).toBeInTheDocument();
		});

		it('does not render subtitle when not provided', () => {
			const { container } = renderStatCard({ title: 'Users', value: 100 });

			const subtitle = container.querySelector('[class*="subtitle"]');
			expect(subtitle).not.toBeInTheDocument();
		});

		it('renders icon when provided', () => {
			renderStatCard({
				title: 'Users',
				value: 100,
				icon: <IconUsers data-testid='users-icon' />,
			});

			expect(screen.getByTestId('users-icon')).toBeInTheDocument();
		});

		it('does not render icon wrapper when icon is not provided', () => {
			const { container } = renderStatCard({ title: 'Users', value: 100 });

			const iconWrapper = container.querySelector('[class*="iconWrapper"]');
			expect(iconWrapper).not.toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom color to value', () => {
			const { container } = renderStatCard({
				title: 'Users',
				value: 100,
				color: 'rgb(0, 128, 0)',
			});

			const value = container.querySelector('[class*="value"]');
			expect(value).toHaveStyle({ color: 'rgb(0, 128, 0)' });
		});

		it('applies custom className', () => {
			const { container } = renderStatCard({
				title: 'Users',
				value: 100,
				className: 'custom-stat-card',
			});

			const card = container.querySelector('.custom-stat-card');
			expect(card).toBeInTheDocument();
		});
	});

	describe('Variants', () => {
		it('renders default variant', () => {
			const { container } = renderStatCard({
				title: 'Users',
				value: 100,
				variant: 'default',
			});

			const card = container.querySelector('[class*="card"]');
			expect(card?.className).not.toContain('compact');
		});

		it('renders compact variant', () => {
			const { container } = renderStatCard({
				title: 'Users',
				value: 100,
				variant: 'compact',
			});

			const card = container.querySelector('[class*="card"]');
			expect(card?.className).toContain('compact');
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			renderStatCard({
				title: 'Active Users',
				value: 1234,
				subtitle: '+15% increase',
				icon: <IconUsers data-testid='icon' />,
				color: 'green',
				className: 'active-users-stat',
				variant: 'default',
			});

			expect(screen.getByText('Active Users')).toBeInTheDocument();
			expect(screen.getByText('1234')).toBeInTheDocument();
			expect(screen.getByText('+15% increase')).toBeInTheDocument();
			expect(screen.getByTestId('icon')).toBeInTheDocument();
		});
	});
});
