import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import RightSection from './RightSection';

const renderRightSection = (props: Parameters<typeof RightSection>[0]) => {
	return render(
		<MantineProvider>
			<RightSection {...props} />
		</MantineProvider>
	);
};

describe('RightSection', () => {
	describe('Rendering', () => {
		it('renders the title', () => {
			renderRightSection({
				title: 'Section Title',
				children: <div>Content</div>,
			});

			expect(
				screen.getByRole('heading', { name: 'Section Title' })
			).toBeInTheDocument();
		});

		it('renders children', () => {
			renderRightSection({
				title: 'Section',
				children: <div data-testid='section-content'>Content here</div>,
			});

			expect(screen.getByTestId('section-content')).toBeInTheDocument();
		});

		it('renders description when provided as string', () => {
			renderRightSection({
				title: 'Section',
				description: 'This is a description',
				children: <div>Content</div>,
			});

			expect(screen.getByText('This is a description')).toBeInTheDocument();
		});

		it('renders description when provided as ReactNode', () => {
			renderRightSection({
				title: 'Section',
				description: <span data-testid='custom-desc'>Custom description</span>,
				children: <div>Content</div>,
			});

			expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			const { container } = renderRightSection({
				title: 'Section',
				children: <div>Content</div>,
			});

			const description = container.querySelector(
				'[class*="sectionDescription"]'
			);
			expect(description).not.toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			const { container } = renderRightSection({
				title: 'Section',
				children: <div>Content</div>,
				className: 'custom-section',
			});

			const wrapper = container.querySelector('.custom-section');
			expect(wrapper).toBeInTheDocument();
		});

		it('handles empty className', () => {
			const { container } = renderRightSection({
				title: 'Section',
				children: <div>Content</div>,
			});

			expect(container.firstChild).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			renderRightSection({
				title: 'User Details',
				description: 'View and edit user information',
				className: 'user-details-section',
				children: (
					<>
						<div data-testid='user-name'>John Doe</div>
						<div data-testid='user-email'>john@example.com</div>
					</>
				),
			});

			expect(
				screen.getByRole('heading', { name: 'User Details' })
			).toBeInTheDocument();
			expect(
				screen.getByText('View and edit user information')
			).toBeInTheDocument();
			expect(screen.getByTestId('user-name')).toBeInTheDocument();
			expect(screen.getByTestId('user-email')).toBeInTheDocument();
		});
	});
});
