import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { IconSettings } from '@tabler/icons-react';
import ContentContainer from './ContentContainer';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('ContentContainer', () => {
	describe('Basic rendering', () => {
		it('renders children content', () => {
			renderWithProviders(
				<ContentContainer>
					<div data-testid='child-content'>Child Content</div>
				</ContentContainer>
			);

			expect(screen.getByTestId('child-content')).toBeInTheDocument();
			expect(screen.getByText('Child Content')).toBeInTheDocument();
		});

		it('renders without optional props', () => {
			const { container } = renderWithProviders(
				<ContentContainer>
					<span>Content</span>
				</ContentContainer>
			);

			expect(container.firstChild).toBeInTheDocument();
			expect(screen.getByText('Content')).toBeInTheDocument();
		});
	});

	describe('Title section', () => {
		it('renders title when provided', () => {
			renderWithProviders(
				<ContentContainer title='Test Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByText('Test Title')).toBeInTheDocument();
		});

		it('renders title as ReactNode', () => {
			renderWithProviders(
				<ContentContainer
					title={<span data-testid='custom-title'>Custom Title</span>}
				>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByTestId('custom-title')).toBeInTheDocument();
		});

		it('renders titleIcon when provided', () => {
			renderWithProviders(
				<ContentContainer
					title='Test Title'
					titleIcon={<IconSettings data-testid='title-icon' />}
				>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByTestId('title-icon')).toBeInTheDocument();
		});

		it('does not render titleIcon when not provided', () => {
			renderWithProviders(
				<ContentContainer title='Test Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.queryByTestId('title-icon')).not.toBeInTheDocument();
		});

		it('renders titleRight when provided', () => {
			renderWithProviders(
				<ContentContainer
					title='Test Title'
					titleRight={<button data-testid='title-right-btn'>Action</button>}
				>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByTestId('title-right-btn')).toBeInTheDocument();
		});

		it('does not render titleRight when not provided', () => {
			renderWithProviders(
				<ContentContainer title='Test Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.queryByTestId('title-right-btn')).not.toBeInTheDocument();
		});
	});

	describe('Description', () => {
		it('renders description when provided', () => {
			renderWithProviders(
				<ContentContainer description='Test description text'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByText('Test description text')).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			renderWithProviders(
				<ContentContainer title='Title Only'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(
				screen.queryByText('Test description text')
			).not.toBeInTheDocument();
		});

		it('renders both title and description together', () => {
			renderWithProviders(
				<ContentContainer
					title='Main Title'
					description='Supporting description'
				>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByText('Main Title')).toBeInTheDocument();
			expect(screen.getByText('Supporting description')).toBeInTheDocument();
		});
	});

	describe('Back button', () => {
		it('renders back button when showBackButton is true', () => {
			renderWithProviders(
				<ContentContainer showBackButton title='Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
		});

		it('does not render back button when showBackButton is false', () => {
			renderWithProviders(
				<ContentContainer showBackButton={false} title='Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(
				screen.queryByRole('button', { name: /back/i })
			).not.toBeInTheDocument();
		});

		it('does not render back button by default', () => {
			renderWithProviders(
				<ContentContainer title='Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(
				screen.queryByRole('button', { name: /back/i })
			).not.toBeInTheDocument();
		});

		it('calls onBackClick when back button is clicked', async () => {
			const user = userEvent.setup();
			const handleBackClick = vi.fn();

			renderWithProviders(
				<ContentContainer
					showBackButton
					title='Title'
					onBackClick={handleBackClick}
				>
					<div>Content</div>
				</ContentContainer>
			);

			const backButton = screen.getByRole('button', { name: /back/i });
			await user.click(backButton);

			expect(handleBackClick).toHaveBeenCalledTimes(1);
		});
	});

	describe('Header visibility', () => {
		it('renders header section when title is provided', () => {
			const { container } = renderWithProviders(
				<ContentContainer title='Title'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(container.querySelector('[class*="header"]')).toBeInTheDocument();
		});

		it('renders header section when description is provided', () => {
			const { container } = renderWithProviders(
				<ContentContainer description='Description'>
					<div>Content</div>
				</ContentContainer>
			);

			expect(container.querySelector('[class*="header"]')).toBeInTheDocument();
		});

		it('renders header section when showBackButton is true', () => {
			const { container } = renderWithProviders(
				<ContentContainer showBackButton>
					<div>Content</div>
				</ContentContainer>
			);

			expect(container.querySelector('[class*="header"]')).toBeInTheDocument();
		});

		it('does not render header section when no title, description, or back button', () => {
			const { container } = renderWithProviders(
				<ContentContainer>
					<div>Content</div>
				</ContentContainer>
			);

			expect(
				container.querySelector('[class*="header"]')
			).not.toBeInTheDocument();
		});
	});

	describe('Right section', () => {
		it('renders right section when rightSection is provided', () => {
			renderWithProviders(
				<ContentContainer
					rightSection={<div data-testid='right-content'>Right Content</div>}
				>
					<div>Main Content</div>
				</ContentContainer>
			);

			expect(screen.getByTestId('right-content')).toBeInTheDocument();
			expect(screen.getByText('Right Content')).toBeInTheDocument();
		});

		it('does not render right section when rightSection is not provided', () => {
			renderWithProviders(
				<ContentContainer>
					<div>Main Content</div>
				</ContentContainer>
			);

			expect(screen.queryByTestId('right-content')).not.toBeInTheDocument();
		});

		it('renders rightSectionTitle when provided along with rightSection', () => {
			renderWithProviders(
				<ContentContainer
					rightSection={<div>Right Content</div>}
					rightSectionTitle={<h3 data-testid='right-title'>Right Title</h3>}
				>
					<div>Main Content</div>
				</ContentContainer>
			);

			expect(screen.getByTestId('right-title')).toBeInTheDocument();
			expect(screen.getByText('Right Title')).toBeInTheDocument();
		});

		it('does not render rightSectionTitle when rightSection is not provided', () => {
			renderWithProviders(
				<ContentContainer
					rightSectionTitle={<h3 data-testid='right-title'>Right Title</h3>}
				>
					<div>Main Content</div>
				</ContentContainer>
			);

			expect(screen.queryByTestId('right-title')).not.toBeInTheDocument();
		});
	});

	describe('Main scroll behavior', () => {
		it('applies default scroll class when mainScroll is true (default)', () => {
			const { container } = renderWithProviders(
				<ContentContainer>
					<div>Content</div>
				</ContentContainer>
			);

			const contentDiv = container.querySelector('[class*="content"]');
			expect(contentDiv).toBeInTheDocument();
			expect(contentDiv?.className).not.toContain('noMainScroll');
		});

		it('applies noMainScroll class when mainScroll is false', () => {
			const { container } = renderWithProviders(
				<ContentContainer mainScroll={false}>
					<div>Content</div>
				</ContentContainer>
			);

			const contentDiv = container.querySelector('[class*="content"]');
			expect(contentDiv).toBeInTheDocument();
		});

		it('does not apply noMainScroll class when mainScroll is true', () => {
			const { container } = renderWithProviders(
				<ContentContainer mainScroll={true}>
					<div>Content</div>
				</ContentContainer>
			);

			const contentDiv = container.querySelector('[class*="content"]');
			expect(contentDiv?.className).not.toContain('noMainScroll');
		});
	});

	describe('Complete component integration', () => {
		it('renders all elements together correctly', async () => {
			const user = userEvent.setup();
			const handleBackClick = vi.fn();

			renderWithProviders(
				<ContentContainer
					title='Full Title'
					description='Full description'
					titleIcon={<IconSettings data-testid='full-icon' />}
					titleRight={
						<button data-testid='full-title-right'>Title Action</button>
					}
					showBackButton
					onBackClick={handleBackClick}
					rightSection={<div data-testid='full-right'>Right Panel</div>}
					rightSectionTitle={
						<h3 data-testid='full-right-title'>Panel Title</h3>
					}
					mainScroll={false}
				>
					<div data-testid='full-content'>Main Content</div>
				</ContentContainer>
			);

			// Verify all elements are present
			expect(screen.getByText('Full Title')).toBeInTheDocument();
			expect(screen.getByText('Full description')).toBeInTheDocument();
			expect(screen.getByTestId('full-icon')).toBeInTheDocument();
			expect(screen.getByTestId('full-title-right')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
			expect(screen.getByTestId('full-right')).toBeInTheDocument();
			expect(screen.getByTestId('full-right-title')).toBeInTheDocument();
			expect(screen.getByTestId('full-content')).toBeInTheDocument();

			// Test back button interaction
			await user.click(screen.getByRole('button', { name: /back/i }));
			expect(handleBackClick).toHaveBeenCalledTimes(1);
		});
	});
});
