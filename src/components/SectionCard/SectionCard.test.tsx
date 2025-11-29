import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { IconSettings, IconUser } from '@tabler/icons-react';
import SectionCard from './SectionCard';

const renderSectionCard = (props: Parameters<typeof SectionCard>[0] = {}) => {
	return render(
		<MantineProvider>
			<SectionCard {...props} />
		</MantineProvider>
	);
};

describe('SectionCard', () => {
	describe('Rendering', () => {
		it('renders with data-testid', () => {
			renderSectionCard({ title: 'Test' });

			expect(screen.getByTestId('section-card')).toBeInTheDocument();
		});

		it('renders title as string', () => {
			renderSectionCard({ title: 'Settings' });

			expect(
				screen.getByRole('heading', { name: 'Settings' })
			).toBeInTheDocument();
		});

		it('renders title as ReactNode', () => {
			renderSectionCard({
				title: <span data-testid='custom-title'>Custom Title</span>,
			});

			expect(screen.getByTestId('custom-title')).toBeInTheDocument();
		});

		it('renders description when provided', () => {
			renderSectionCard({
				title: 'Settings',
				description: 'Configure your preferences',
			});

			expect(
				screen.getByText('Configure your preferences')
			).toBeInTheDocument();
		});

		it('renders icon when provided', () => {
			renderSectionCard({
				title: 'Settings',
				icon: IconSettings,
			});

			const iconWrapper = screen
				.getByTestId('section-card')
				.querySelector('[class*="iconBadge"]');
			expect(iconWrapper).toBeInTheDocument();
		});

		it('renders children', () => {
			renderSectionCard({
				title: 'Settings',
				children: <div data-testid='card-content'>Card content</div>,
			});

			expect(screen.getByTestId('card-content')).toBeInTheDocument();
		});

		it('renders footer when provided', () => {
			renderSectionCard({
				title: 'Settings',
				footer: <button data-testid='footer-button'>Save</button>,
			});

			expect(screen.getByTestId('footer-button')).toBeInTheDocument();
		});

		it('renders headerActions when provided', () => {
			renderSectionCard({
				title: 'Settings',
				headerActions: <button data-testid='header-action'>Edit</button>,
			});

			expect(screen.getByTestId('header-action')).toBeInTheDocument();
		});
	});

	describe('Optional Header', () => {
		it('does not render header when no title, description, icon, or headerActions', () => {
			const { container } = renderSectionCard({
				children: <div>Content only</div>,
			});

			const header = container.querySelector('[class*="sectionHeader"]');
			expect(header).not.toBeInTheDocument();
		});

		it('renders header when only icon is provided', () => {
			const { container } = renderSectionCard({
				icon: IconUser,
			});

			const header = container.querySelector('[class*="sectionHeader"]');
			expect(header).toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			renderSectionCard({
				title: 'Test',
				className: 'custom-card',
			});

			const card = screen.getByTestId('section-card');
			expect(card).toHaveClass('custom-card');
		});

		it('applies custom id', () => {
			renderSectionCard({
				title: 'Test',
				id: 'settings-card',
			});

			expect(document.getElementById('settings-card')).toBeInTheDocument();
		});

		it('applies custom backgroundColor', () => {
			renderSectionCard({
				title: 'Test',
				backgroundColor: 'rgb(240, 240, 240)',
			});

			const card = screen.getByTestId('section-card');
			expect(card).toHaveStyle({ backgroundColor: 'rgb(240, 240, 240)' });
		});
	});

	describe('Content Spacing', () => {
		it('applies default md spacing', () => {
			const { container } = renderSectionCard({
				children: <div>Content</div>,
			});

			const content = container.querySelector('[class*="content"]');
			expect(content).toHaveStyle({ gap: '1rem' });
		});

		it('applies xs spacing', () => {
			const { container } = renderSectionCard({
				children: <div>Content</div>,
				contentSpacing: 'xs',
			});

			const content = container.querySelector('[class*="content"]');
			expect(content).toHaveStyle({ gap: '0.5rem' });
		});

		it('applies numeric spacing', () => {
			const { container } = renderSectionCard({
				children: <div>Content</div>,
				contentSpacing: 24,
			});

			const content = container.querySelector('[class*="content"]');
			expect(content).toHaveStyle({ gap: '24px' });
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			renderSectionCard({
				id: 'user-settings',
				title: 'User Settings',
				description: 'Manage user preferences',
				icon: IconUser,
				headerActions: <button data-testid='edit-btn'>Edit</button>,
				footer: <button data-testid='save-btn'>Save</button>,
				children: <div data-testid='settings-content'>Settings form</div>,
				className: 'user-settings-card',
			});

			expect(
				screen.getByRole('heading', { name: 'User Settings' })
			).toBeInTheDocument();
			expect(screen.getByText('Manage user preferences')).toBeInTheDocument();
			expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
			expect(screen.getByTestId('save-btn')).toBeInTheDocument();
			expect(screen.getByTestId('settings-content')).toBeInTheDocument();
		});
	});
});
