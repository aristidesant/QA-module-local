import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import RightSectionCard from './RightSectionCard';

const renderRightSectionCard = (
	props: Parameters<typeof RightSectionCard>[0]
) => {
	return render(
		<MantineProvider>
			<RightSectionCard {...props} />
		</MantineProvider>
	);
};

describe('RightSectionCard', () => {
	describe('Rendering', () => {
		it('renders the title', () => {
			renderRightSectionCard({
				title: 'Card Title',
				children: <div>Content</div>,
			});

			expect(screen.getByText('Card Title')).toBeInTheDocument();
		});

		it('renders children', () => {
			renderRightSectionCard({
				title: 'Card',
				children: <div data-testid='card-content'>Card content</div>,
			});

			expect(screen.getByTestId('card-content')).toBeInTheDocument();
		});

		it('renders description when provided', () => {
			renderRightSectionCard({
				title: 'Card',
				description: 'Card description',
				children: <div>Content</div>,
			});

			expect(screen.getByText('Card description')).toBeInTheDocument();
		});

		it('renders description as ReactNode', () => {
			renderRightSectionCard({
				title: 'Card',
				description: <span data-testid='custom-desc'>Custom</span>,
				children: <div>Content</div>,
			});

			expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
		});

		it('renders icon when provided', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				icon: IconSettings,
				children: <div>Content</div>,
			});

			const themeIcon = container.querySelector('[class*="ThemeIcon"]');
			expect(themeIcon).toBeInTheDocument();
		});

		it('renders rightSection when provided', () => {
			renderRightSectionCard({
				title: 'Card',
				rightSection: <button data-testid='right-btn'>Action</button>,
				children: <div>Content</div>,
			});

			expect(screen.getByTestId('right-btn')).toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom style', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				style: { backgroundColor: 'rgb(240, 240, 240)' },
				children: <div>Content</div>,
			});

			const card = container.querySelector('[class*="card"]');
			expect(card).toHaveStyle({ backgroundColor: 'rgb(240, 240, 240)' });
		});

		it('applies withIcon class when icon is provided', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				icon: IconSettings,
				children: <div>Content</div>,
			});

			const header = container.querySelector('[class*="header"]');
			expect(header?.className).toContain('withIcon');
		});

		it('applies withRight class when rightSection is provided', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				rightSection: <span>Right</span>,
				children: <div>Content</div>,
			});

			const header = container.querySelector('[class*="header"]');
			expect(header?.className).toContain('withRight');
		});
	});

	describe('Click Handler', () => {
		it('calls onClick when card is clicked', () => {
			const onClick = vi.fn();
			const { container } = renderRightSectionCard({
				title: 'Card',
				onClick,
				children: <div>Content</div>,
			});

			const card = container.querySelector('[class*="card"]');
			fireEvent.click(card!);

			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it('does not error when onClick is not provided', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				children: <div>Content</div>,
			});

			const card = container.querySelector('[class*="card"]');
			expect(() => fireEvent.click(card!)).not.toThrow();
		});
	});

	describe('Icon Color', () => {
		it('uses default icon color', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				icon: IconSettings,
				children: <div>Content</div>,
			});

			const themeIcon = container.querySelector('[class*="ThemeIcon"]');
			expect(themeIcon).toBeInTheDocument();
		});

		it('applies custom icon color', () => {
			const { container } = renderRightSectionCard({
				title: 'Card',
				icon: IconSettings,
				iconColor: 'blue',
				children: <div>Content</div>,
			});

			const themeIcon = container.querySelector('[class*="ThemeIcon"]');
			expect(themeIcon).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			const onClick = vi.fn();

			renderRightSectionCard({
				title: 'Settings Card',
				description: 'Manage your settings',
				icon: IconSettings,
				iconColor: 'grape',
				rightSection: <button data-testid='action'>Edit</button>,
				style: { minHeight: '200px' },
				onClick,
				children: (
					<>
						<div data-testid='setting-1'>Setting 1</div>
						<div data-testid='setting-2'>Setting 2</div>
					</>
				),
			});

			expect(screen.getByText('Settings Card')).toBeInTheDocument();
			expect(screen.getByText('Manage your settings')).toBeInTheDocument();
			expect(screen.getByTestId('action')).toBeInTheDocument();
			expect(screen.getByTestId('setting-1')).toBeInTheDocument();
			expect(screen.getByTestId('setting-2')).toBeInTheDocument();
		});
	});
});
