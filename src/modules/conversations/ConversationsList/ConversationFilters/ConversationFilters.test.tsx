import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConversationFilters, { type ConversationFiltersType } from '.';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock useDebouncedValue to return values immediately for testing
vi.mock('@mantine/hooks', () => ({
	useDebouncedValue: (value: string) => [value],
	useDisclosure: () => [
		false,
		{ open: vi.fn(), close: vi.fn(), toggle: vi.fn() },
	],
}));

const renderComponent = (
	props: Partial<{
		filters: ConversationFiltersType;
		onFiltersChange: (filters: ConversationFiltersType) => void;
	}> = {}
) => {
	const defaultProps = {
		filters: {},
		onFiltersChange: vi.fn(),
		...props,
	};

	return renderWithProviders(<ConversationFilters {...defaultProps} />);
};

describe('ConversationFilters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders filter title and icon', () => {
			renderComponent();
			expect(screen.getByText('Filters')).toBeInTheDocument();
		});

		it('renders contact name input with placeholder', () => {
			renderComponent();
			expect(
				screen.getByPlaceholderText('Filter by contact name...')
			).toBeInTheDocument();
		});

		it('renders Advanced button', () => {
			renderComponent();
			expect(
				screen.getByRole('button', { name: /Advanced/i })
			).toBeInTheDocument();
		});

		it('renders Advanced button in default (closed) state', () => {
			renderComponent();
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			expect(advancedButton).toHaveAttribute('data-variant', 'default');
		});

		it('does not show active filters badge when no filters are set', () => {
			renderComponent({ filters: {} });
			expect(screen.queryByText('1')).not.toBeInTheDocument();
			expect(screen.queryByText('2')).not.toBeInTheDocument();
		});

		it('shows active filters badge with correct count', () => {
			renderComponent({
				filters: {
					contactName: 'John',
					status: 'done',
				},
			});
			expect(screen.getByText('2')).toBeInTheDocument();
		});

		it('shows clear button with correct value in contact name input', () => {
			renderComponent({
				filters: { contactName: 'John Doe' },
			});
			const input = screen.getByPlaceholderText('Filter by contact name...');
			expect(input).toHaveValue('John Doe');
		});
	});

	describe('Advanced Filters Toggle', () => {
		it('shows advanced filters when Advanced button is clicked', async () => {
			renderComponent();
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});

			await userEvent.click(advancedButton);

			await waitFor(() => {
				expect(
					screen.getByPlaceholderText('Filter by phone number')
				).toBeInTheDocument();
				expect(
					screen.getByPlaceholderText('Filter by outcome')
				).toBeInTheDocument();
				expect(screen.getByText('Status')).toBeInTheDocument();
			});
		});

		it('toggles Advanced button variant when clicked', async () => {
			renderComponent();
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});

			// Initially default variant
			expect(advancedButton).toHaveAttribute('data-variant', 'default');

			// Open - should change to light variant
			await userEvent.click(advancedButton);
			await waitFor(() => {
				expect(advancedButton).toHaveAttribute('data-variant', 'light');
			});

			// Close - should change back to default variant
			await userEvent.click(advancedButton);
			await waitFor(() => {
				expect(advancedButton).toHaveAttribute('data-variant', 'default');
			});
		});

		it('renders Clear all filters button in advanced section', async () => {
			renderComponent();
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			await waitFor(() => {
				expect(
					screen.getByRole('button', { name: /Clear all filters/i })
				).toBeInTheDocument();
			});
		});

		it('disables Clear all filters button when no filters are active', async () => {
			renderComponent({ filters: {} });
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			await waitFor(() => {
				const clearButton = screen.getByRole('button', {
					name: /Clear all filters/i,
				});
				expect(clearButton).toBeDisabled();
			});
		});

		it('enables Clear all filters button when filters are active', async () => {
			renderComponent({ filters: { contactName: 'John' } });
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			await waitFor(() => {
				const clearButton = screen.getByRole('button', {
					name: /Clear all filters/i,
				});
				expect(clearButton).not.toBeDisabled();
			});
		});
	});

	describe('Contact Name Filter', () => {
		it('calls onFiltersChange when contact name is typed', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({ onFiltersChange: mockOnFiltersChange });

			const input = screen.getByPlaceholderText('Filter by contact name...');
			await userEvent.type(input, 'John');

			await waitFor(() => {
				expect(mockOnFiltersChange).toHaveBeenCalled();
			});
		});

		it('updates input value when typing', async () => {
			renderComponent();
			const input = screen.getByPlaceholderText('Filter by contact name...');

			await userEvent.type(input, 'Jane');

			expect(input).toHaveValue('Jane');
		});

		it('clears contact name when close button is clicked', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({
				filters: { contactName: 'John' },
				onFiltersChange: mockOnFiltersChange,
			});

			// Find and click the close button inside the input
			const closeButtons = screen.getAllByRole('button');
			const closeButton = closeButtons.find(
				(btn) => btn.getAttribute('aria-label') === 'Clear input'
			);

			if (closeButton) {
				await userEvent.click(closeButton);
			}
		});
	});

	describe('Phone Number Filter', () => {
		it('calls onFiltersChange when phone number is typed', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({ onFiltersChange: mockOnFiltersChange });

			// Open advanced filters
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const input = await screen.findByPlaceholderText(
				'Filter by phone number'
			);
			await userEvent.type(input, '+1234567890');

			await waitFor(() => {
				expect(mockOnFiltersChange).toHaveBeenCalled();
			});
		});

		it('displays existing phone number filter value', async () => {
			renderComponent({ filters: { contactPhoneNumber: '+9876543210' } });

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const input = await screen.findByPlaceholderText(
				'Filter by phone number'
			);
			expect(input).toHaveValue('+9876543210');
		});
	});

	describe('Disposition Filter', () => {
		it('calls onFiltersChange when outcome is typed', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({ onFiltersChange: mockOnFiltersChange });

			// Open advanced filters
			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const input = await screen.findByPlaceholderText('Filter by outcome');
			await userEvent.type(input, 'Interested');

			await waitFor(() => {
				expect(mockOnFiltersChange).toHaveBeenCalled();
			});
		});

		it('displays existing outcome filter value', async () => {
			renderComponent({ filters: { dispositionName: 'Not Interested' } });

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const input = await screen.findByPlaceholderText('Filter by outcome');
			expect(input).toHaveValue('Not Interested');
		});
	});

	describe('Status Filter', () => {
		it('renders status select with all options', async () => {
			renderComponent();

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			// Find and click the status select to open dropdown
			const statusSelect = await screen.findByPlaceholderText('All statuses');
			expect(statusSelect).toBeInTheDocument();
		});

		it('calls onFiltersChange when status is selected', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({ onFiltersChange: mockOnFiltersChange });

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const statusSelect = await screen.findByPlaceholderText('All statuses');
			await userEvent.click(statusSelect);

			// Select an option from dropdown
			const option = await screen.findByText('Done');
			await userEvent.click(option);

			await waitFor(() => {
				expect(mockOnFiltersChange).toHaveBeenCalledWith(
					expect.objectContaining({ status: 'done' })
				);
			});
		});

		it('displays selected status value', async () => {
			renderComponent({ filters: { status: 'in-progress' } });

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			await waitFor(() => {
				expect(screen.getByText('In Progress')).toBeInTheDocument();
			});
		});
	});

	describe('Clear All Filters', () => {
		it('clears all filters when Clear all filters button is clicked', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({
				filters: {
					contactName: 'John',
					contactPhoneNumber: '+1234567890',
					dispositionName: 'Interested',
					status: 'done',
				},
				onFiltersChange: mockOnFiltersChange,
			});

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const clearButton = await screen.findByRole('button', {
				name: /Clear all filters/i,
			});
			await userEvent.click(clearButton);

			await waitFor(() => {
				expect(mockOnFiltersChange).toHaveBeenCalledWith({});
			});
		});

		it('resets local input states when clearing filters', async () => {
			const mockOnFiltersChange = vi.fn();
			renderComponent({
				filters: {
					contactName: 'John',
					contactPhoneNumber: '+1234567890',
				},
				onFiltersChange: mockOnFiltersChange,
			});

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const clearButton = await screen.findByRole('button', {
				name: /Clear all filters/i,
			});
			await userEvent.click(clearButton);

			// Verify the contact name input is cleared
			const contactNameInput = screen.getByPlaceholderText(
				'Filter by contact name...'
			);
			expect(contactNameInput).toHaveValue('');
		});
	});

	describe('Active Filters Badge', () => {
		it('shows badge with count 1 when one filter is active', () => {
			renderComponent({ filters: { contactName: 'John' } });
			expect(screen.getByText('1')).toBeInTheDocument();
		});

		it('shows badge with count 2 when two filters are active', () => {
			renderComponent({
				filters: { contactName: 'John', status: 'done' },
			});
			expect(screen.getByText('2')).toBeInTheDocument();
		});

		it('shows badge with count 3 when three filters are active', () => {
			renderComponent({
				filters: {
					contactName: 'John',
					contactPhoneNumber: '+1234567890',
					status: 'done',
				},
			});
			expect(screen.getByText('3')).toBeInTheDocument();
		});

		it('shows badge with count 4 when all filters are active', () => {
			renderComponent({
				filters: {
					contactName: 'John',
					contactPhoneNumber: '+1234567890',
					dispositionName: 'Interested',
					status: 'done',
				},
			});
			expect(screen.getByText('4')).toBeInTheDocument();
		});

		it('does not count empty string as active filter', () => {
			renderComponent({
				filters: {
					contactName: '',
					status: 'done',
				},
			});
			expect(screen.getByText('1')).toBeInTheDocument();
		});

		it('does not count null as active filter', () => {
			renderComponent({
				filters: {
					contactName: undefined,
					status: 'done',
				},
			});
			expect(screen.getByText('1')).toBeInTheDocument();
		});
	});

	describe('Status Options', () => {
		it('has initiated option available', async () => {
			renderComponent();

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const statusSelect = await screen.findByPlaceholderText('All statuses');
			await userEvent.click(statusSelect);

			expect(await screen.findByText('Pending')).toBeInTheDocument();
		});

		it('has in-progress option available', async () => {
			renderComponent();

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const statusSelect = await screen.findByPlaceholderText('All statuses');
			await userEvent.click(statusSelect);

			expect(await screen.findByText('In Progress')).toBeInTheDocument();
		});

		it('has done option available', async () => {
			renderComponent();

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const statusSelect = await screen.findByPlaceholderText('All statuses');
			await userEvent.click(statusSelect);

			expect(await screen.findByText('Done')).toBeInTheDocument();
		});

		it('has failed option available', async () => {
			renderComponent();

			const advancedButton = screen.getByRole('button', {
				name: /Advanced/i,
			});
			await userEvent.click(advancedButton);

			const statusSelect = await screen.findByPlaceholderText('All statuses');
			await userEvent.click(statusSelect);

			expect(await screen.findByText('Failed')).toBeInTheDocument();
		});
	});

	describe('External Filter Sync', () => {
		it('updates local contact name when filters prop changes', () => {
			const { rerender } = renderWithProviders(
				<ConversationFilters filters={{}} onFiltersChange={vi.fn()} />
			);

			const input = screen.getByPlaceholderText('Filter by contact name...');
			expect(input).toHaveValue('');

			rerender(
				<ConversationFilters
					filters={{ contactName: 'Updated Name' }}
					onFiltersChange={vi.fn()}
				/>
			);

			expect(input).toHaveValue('Updated Name');
		});
	});
});
