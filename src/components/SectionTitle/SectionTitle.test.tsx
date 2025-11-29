import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import SectionTitle from './SectionTitle';

const renderSectionTitle = (props: Parameters<typeof SectionTitle>[0]) => {
	return render(
		<MantineProvider>
			<SectionTitle {...props} />
		</MantineProvider>
	);
};

describe('SectionTitle', () => {
	describe('Rendering', () => {
		it('renders the title as string', () => {
			renderSectionTitle({ title: 'Settings' });

			expect(
				screen.getByRole('heading', { name: 'Settings' })
			).toBeInTheDocument();
		});

		it('renders the title as ReactNode', () => {
			renderSectionTitle({
				title: <span data-testid='custom-title'>Custom Title</span>,
			});

			expect(screen.getByTestId('custom-title')).toBeInTheDocument();
		});

		it('renders description when provided as string', () => {
			renderSectionTitle({
				title: 'Settings',
				description: 'Configure your preferences',
			});

			expect(
				screen.getByText('Configure your preferences')
			).toBeInTheDocument();
		});

		it('renders description when provided as ReactNode', () => {
			renderSectionTitle({
				title: 'Settings',
				description: <span data-testid='custom-desc'>Custom description</span>,
			});

			expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			const { container } = renderSectionTitle({ title: 'Settings' });

			const description = container.querySelector(
				'[class*="sectionDescription"]'
			);
			expect(description).not.toBeInTheDocument();
		});

		it('renders icon when provided', () => {
			renderSectionTitle({
				title: 'Settings',
				icon: <IconSettings data-testid='settings-icon' />,
			});

			expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
		});

		it('does not render icon wrapper when icon is not provided', () => {
			const { container } = renderSectionTitle({ title: 'Settings' });

			const iconWrapper = container.querySelector('[class*="iconWrapper"]');
			expect(iconWrapper).not.toBeInTheDocument();
		});
	});

	describe('Title Order', () => {
		it('uses default order of 6', () => {
			renderSectionTitle({ title: 'Settings' });

			const heading = screen.getByRole('heading', { level: 6 });
			expect(heading).toBeInTheDocument();
		});

		it('respects custom order prop', () => {
			renderSectionTitle({ title: 'Settings', order: 3 });

			const heading = screen.getByRole('heading', { level: 3 });
			expect(heading).toBeInTheDocument();
		});
	});

	describe('Accent Line', () => {
		it('renders accent line by default', () => {
			const { container } = renderSectionTitle({ title: 'Settings' });

			const line = container.querySelector('[class*="sectionLine"]');
			expect(line).toBeInTheDocument();
		});

		it('hides accent line when withLine is false', () => {
			const { container } = renderSectionTitle({
				title: 'Settings',
				withLine: false,
			});

			const line = container.querySelector('[class*="sectionLine"]');
			expect(line).not.toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			const { container } = renderSectionTitle({
				title: 'Settings',
				className: 'custom-section-title',
			});

			const wrapper = container.querySelector('.custom-section-title');
			expect(wrapper).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			const { container } = renderSectionTitle({
				title: 'Account Settings',
				description: 'Manage your account preferences',
				icon: <IconSettings data-testid='icon' />,
				order: 4,
				withLine: true,
				className: 'account-settings',
			});

			expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
			expect(screen.getByText('Account Settings')).toBeInTheDocument();
			expect(
				screen.getByText('Manage your account preferences')
			).toBeInTheDocument();
			expect(screen.getByTestId('icon')).toBeInTheDocument();
			expect(
				container.querySelector('[class*="sectionLine"]')
			).toBeInTheDocument();
		});
	});
});
