import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import EmptyState from './EmptyState';

const renderEmptyState = (props: Parameters<typeof EmptyState>[0]) => {
	return render(
		<MantineProvider>
			<EmptyState {...props} />
		</MantineProvider>
	);
};

describe('EmptyState', () => {
	describe('Rendering', () => {
		it('renders the message', () => {
			renderEmptyState({ message: 'No items found' });

			expect(screen.getByText('No items found')).toBeInTheDocument();
		});

		it('renders the icon when provided', () => {
			renderEmptyState({
				message: 'No items',
				icon: <IconInbox data-testid='empty-icon' />,
			});

			expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
		});

		it('does not render icon wrapper when icon is not provided', () => {
			const { container } = renderEmptyState({ message: 'No items' });

			const iconWrapper = container.querySelector('[class*="iconWrapper"]');
			expect(iconWrapper).not.toBeInTheDocument();
		});

		it('renders description when provided as string', () => {
			renderEmptyState({
				message: 'No items',
				description: 'Try adding some items to get started',
			});

			expect(
				screen.getByText('Try adding some items to get started')
			).toBeInTheDocument();
		});

		it('renders description when provided as ReactNode', () => {
			renderEmptyState({
				message: 'No items',
				description: (
					<span data-testid='custom-description'>Custom content</span>
				),
			});

			expect(screen.getByTestId('custom-description')).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			const { container } = renderEmptyState({ message: 'No items' });

			const description = container.querySelector('[class*="description"]');
			expect(description).not.toBeInTheDocument();
		});

		it('renders action when provided', () => {
			renderEmptyState({
				message: 'No items',
				action: <button data-testid='action-button'>Add Item</button>,
			});

			expect(screen.getByTestId('action-button')).toBeInTheDocument();
		});

		it('does not render action when not provided', () => {
			const { container } = renderEmptyState({ message: 'No items' });

			const action = container.querySelector('[class*="action"]');
			expect(action).not.toBeInTheDocument();
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			const { container } = renderEmptyState({
				message: 'No items',
				className: 'custom-class',
			});

			const wrapper = container.querySelector('.custom-class');
			expect(wrapper).toBeInTheDocument();
		});

		it('handles undefined className gracefully', () => {
			const { container } = renderEmptyState({ message: 'No items' });

			const wrapper = container.firstChild;
			expect(wrapper).toBeInTheDocument();
		});
	});

	describe('Complete Example', () => {
		it('renders all elements together', () => {
			renderEmptyState({
				message: 'Your inbox is empty',
				description: 'Messages will appear here',
				icon: <IconInbox data-testid='inbox-icon' />,
				action: <button>Refresh</button>,
				className: 'inbox-empty-state',
			});

			expect(screen.getByText('Your inbox is empty')).toBeInTheDocument();
			expect(screen.getByText('Messages will appear here')).toBeInTheDocument();
			expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: 'Refresh' })
			).toBeInTheDocument();
		});
	});
});
