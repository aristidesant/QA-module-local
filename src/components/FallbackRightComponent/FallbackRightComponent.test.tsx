import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { IconFolder, IconSearch } from '@tabler/icons-react';
import FallbackRightComponent from './FallbackRightComponent';

const renderFallbackRightComponent = (
	props: Partial<Parameters<typeof FallbackRightComponent>[0]> = {}
) => {
	return render(
		<MantineProvider>
			<FallbackRightComponent {...props} />
		</MantineProvider>
	);
};

describe('FallbackRightComponent', () => {
	describe('Default Rendering', () => {
		it('renders default title', () => {
			renderFallbackRightComponent();

			expect(screen.getByText('Nothing selected')).toBeInTheDocument();
		});

		it('renders default description', () => {
			renderFallbackRightComponent();

			expect(
				screen.getByText(
					'No item selected. Pick an entry from the list or create a new one to see details and actions.'
				)
			).toBeInTheDocument();
		});

		it('renders default action text', () => {
			renderFallbackRightComponent();

			expect(
				screen.getByText('Choose or create an item to get started')
			).toBeInTheDocument();
		});

		it('renders default icon', () => {
			const { container } = renderFallbackRightComponent();

			// Default icon is IconInfoCircle
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});
	});

	describe('Custom Props', () => {
		it('renders custom title', () => {
			renderFallbackRightComponent({ title: 'Select a Campaign' });

			expect(screen.getByText('Select a Campaign')).toBeInTheDocument();
		});

		it('renders custom description as string', () => {
			renderFallbackRightComponent({
				description: 'Please select a campaign from the list',
			});

			expect(
				screen.getByText('Please select a campaign from the list')
			).toBeInTheDocument();
		});

		it('renders custom description as ReactNode', () => {
			renderFallbackRightComponent({
				description: <span data-testid='custom-desc'>Custom content</span>,
			});

			expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
		});

		it('renders custom action text', () => {
			renderFallbackRightComponent({ actionText: 'Click to add a new item' });

			expect(screen.getByText('Click to add a new item')).toBeInTheDocument();
		});

		it('renders custom icon', () => {
			const { container } = renderFallbackRightComponent({ Icon: IconFolder });

			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			expect(svg?.classList.toString()).toContain('tabler-icon-folder');
		});

		it('does not render action text when empty string', () => {
			renderFallbackRightComponent({ actionText: '' });

			expect(
				screen.queryByText('Choose or create an item to get started')
			).not.toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			const { container } = renderFallbackRightComponent({
				className: 'custom-fallback',
			});

			const wrapper = container.querySelector('.custom-fallback');
			expect(wrapper).toBeInTheDocument();
		});

		it('applies root class', () => {
			const { container } = renderFallbackRightComponent();

			const wrapper = container.querySelector('[class*="root"]');
			expect(wrapper).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all custom props together', () => {
			const { container } = renderFallbackRightComponent({
				Icon: IconSearch,
				title: 'No Results Found',
				description: 'Try adjusting your search criteria',
				actionText: 'Clear filters to see all items',
				className: 'search-fallback',
			});

			expect(screen.getByText('No Results Found')).toBeInTheDocument();
			expect(
				screen.getByText('Try adjusting your search criteria')
			).toBeInTheDocument();
			expect(
				screen.getByText('Clear filters to see all items')
			).toBeInTheDocument();

			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('tabler-icon-search');
		});
	});
});
