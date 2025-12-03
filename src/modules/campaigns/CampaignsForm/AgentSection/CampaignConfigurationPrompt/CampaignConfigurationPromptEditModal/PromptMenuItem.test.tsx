import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import PromptMenuItem from './PromptMenuItem';

describe('PromptMenuItem', () => {
	const mockOnClick = vi.fn();
	const defaultProps = {
		typeId: 1,
		label: 'Test Prompt',
		isActive: false,
		onClick: mockOnClick,
		isDrafted: false,
		lines: 5,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders the label correctly', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			expect(screen.getByText('Test Prompt')).toBeInTheDocument();
		});

		it('renders with correct test id based on typeId', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} typeId={42} />);

			expect(screen.getByTestId('prompt-menu-item-42')).toBeInTheDocument();
		});

		it('renders as a button element', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});

		it('sets aria-pressed to false when not active', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isActive={false} />
			);

			expect(screen.getByRole('button')).toHaveAttribute(
				'aria-pressed',
				'false'
			);
		});

		it('sets aria-pressed to true when active', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} isActive={true} />);

			expect(screen.getByRole('button')).toHaveAttribute(
				'aria-pressed',
				'true'
			);
		});
	});

	describe('Active State', () => {
		it('sets data-active to false when not active', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isActive={false} />
			);

			expect(screen.getByTestId('prompt-menu-item-1')).toHaveAttribute(
				'data-active',
				'false'
			);
		});

		it('sets data-active to true when active', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} isActive={true} />);

			expect(screen.getByTestId('prompt-menu-item-1')).toHaveAttribute(
				'data-active',
				'true'
			);
		});
	});

	describe('Status Dot', () => {
		it('renders status dot with data-filled=false when not drafted', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isDrafted={false} />
			);

			const statusDot = document.querySelector('[data-filled]');
			expect(statusDot).toHaveAttribute('data-filled', 'false');
		});

		it('renders status dot with data-filled=true when drafted', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isDrafted={true} />
			);

			const statusDot = document.querySelector('[data-filled]');
			expect(statusDot).toHaveAttribute('data-filled', 'true');
		});
	});

	describe('Drafted Badge', () => {
		it('does not show Drafted badge when isDrafted is false', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isDrafted={false} />
			);

			expect(screen.queryByText('Drafted')).not.toBeInTheDocument();
		});

		it('shows Drafted badge when isDrafted is true', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isDrafted={true} />
			);

			expect(screen.getByText('Drafted')).toBeInTheDocument();
		});
	});

	describe('Click Handler', () => {
		it('calls onClick when clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			await user.click(screen.getByRole('button'));

			expect(mockOnClick).toHaveBeenCalledTimes(1);
		});

		it('calls onClick multiple times on multiple clicks', async () => {
			const user = userEvent.setup();
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			const button = screen.getByRole('button');
			await user.click(button);
			await user.click(button);
			await user.click(button);

			expect(mockOnClick).toHaveBeenCalledTimes(3);
		});
	});

	describe('Props Variations', () => {
		it('renders with different labels', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} label='First Label' />
			);
			expect(screen.getByText('First Label')).toBeInTheDocument();
		});

		it('renders second label correctly', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} label='Second Label' />
			);
			expect(screen.getByText('Second Label')).toBeInTheDocument();
		});

		it('renders with different typeIds', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} typeId={100} />);
			expect(screen.getByTestId('prompt-menu-item-100')).toBeInTheDocument();
		});

		it('renders with another typeId', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} typeId={200} />);
			expect(screen.getByTestId('prompt-menu-item-200')).toBeInTheDocument();
		});

		it('handles empty label', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} label='' />);

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});

		it('handles long label text', () => {
			const longLabel =
				'This is a very long label that might wrap or truncate depending on styling';
			renderWithProviders(
				<PromptMenuItem {...defaultProps} label={longLabel} />
			);

			expect(screen.getByText(longLabel)).toBeInTheDocument();
		});

		it('handles zero typeId', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} typeId={0} />);

			expect(screen.getByTestId('prompt-menu-item-0')).toBeInTheDocument();
		});

		it('handles negative typeId', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} typeId={-1} />);

			expect(screen.getByTestId('prompt-menu-item--1')).toBeInTheDocument();
		});

		it('handles zero lines prop', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} lines={0} />);

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});

		it('handles large lines prop', () => {
			renderWithProviders(<PromptMenuItem {...defaultProps} lines={1000} />);

			const button = screen.getByRole('button');
			expect(button).toBeInTheDocument();
		});
	});

	describe('Combined States', () => {
		it('renders active and drafted state together', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isActive={true} isDrafted={true} />
			);

			const menuItem = screen.getByTestId('prompt-menu-item-1');
			expect(menuItem).toHaveAttribute('data-active', 'true');
			expect(screen.getByText('Drafted')).toBeInTheDocument();
		});

		it('renders inactive and not drafted state together', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isActive={false} isDrafted={false} />
			);

			const menuItem = screen.getByTestId('prompt-menu-item-1');
			expect(menuItem).toHaveAttribute('data-active', 'false');
			expect(screen.queryByText('Drafted')).not.toBeInTheDocument();
		});

		it('renders active and not drafted state together', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isActive={true} isDrafted={false} />
			);

			const menuItem = screen.getByTestId('prompt-menu-item-1');
			expect(menuItem).toHaveAttribute('data-active', 'true');
			expect(screen.queryByText('Drafted')).not.toBeInTheDocument();
		});

		it('renders inactive and drafted state together', () => {
			renderWithProviders(
				<PromptMenuItem {...defaultProps} isActive={false} isDrafted={true} />
			);

			const menuItem = screen.getByTestId('prompt-menu-item-1');
			expect(menuItem).toHaveAttribute('data-active', 'false');
			expect(screen.getByText('Drafted')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('is focusable via keyboard', async () => {
			const user = userEvent.setup();
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			await user.tab();

			expect(screen.getByRole('button')).toHaveFocus();
		});

		it('can be activated with Enter key', async () => {
			const user = userEvent.setup();
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			await user.tab();
			await user.keyboard('{Enter}');

			expect(mockOnClick).toHaveBeenCalledTimes(1);
		});

		it('can be activated with Space key', async () => {
			const user = userEvent.setup();
			renderWithProviders(<PromptMenuItem {...defaultProps} />);

			await user.tab();
			await user.keyboard(' ');

			expect(mockOnClick).toHaveBeenCalledTimes(1);
		});
	});
});
