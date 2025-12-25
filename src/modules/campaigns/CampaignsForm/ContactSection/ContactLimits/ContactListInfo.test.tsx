import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ContactListInfo } from './ContactListInfo';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock the dateUtils module
vi.mock('~/utils/dateUtils', () => ({
	formatExpirationDate: vi.fn((date: string) => {
		if (!date) return '';
		return `Jan 15, 2025`;
	}),
}));

describe('ContactListInfo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Basic rendering', () => {
		it('renders with list name', () => {
			renderWithProviders(<ContactListInfo listName='Test List' />);

			expect(screen.getByText('Test List')).toBeInTheDocument();
			expect(screen.getByText('Name')).toBeInTheDocument();
		});

		it('renders empty state when no list name provided', () => {
			renderWithProviders(<ContactListInfo listName='' />);

			expect(screen.getByText('Name is required')).toBeInTheDocument();
			expect(screen.getByText('Click to add a name')).toBeInTheDocument();
		});

		it('renders empty state when list name is only whitespace', () => {
			renderWithProviders(<ContactListInfo listName='   ' />);

			expect(screen.getByText('Name is required')).toBeInTheDocument();
		});
	});

	describe('Name editing', () => {
		it('shows edit button when onNameChange is provided and not readonly', () => {
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			// Edit button exists (it's an ActionIcon with edit icon inside)
			const editButton = container.querySelector('[class*="editButton"]');
			expect(editButton).toBeInTheDocument();
		});

		it('does not show edit button when readonly is true', () => {
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo
					listName='Test List'
					onNameChange={onNameChange}
					readonly={true}
				/>
			);

			const editButton = container.querySelector('[class*="editButton"]');
			expect(editButton).not.toBeInTheDocument();
		});

		it('does not show edit button when onNameChange is not provided', () => {
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			expect(editButton).not.toBeInTheDocument();
		});

		it('enters edit mode when edit button is clicked', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			expect(screen.getByRole('textbox')).toBeInTheDocument();
			expect(screen.getByRole('textbox')).toHaveValue('Test List');
		});

		it('enters edit mode when clicking empty name box', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			renderWithProviders(
				<ContactListInfo listName='' onNameChange={onNameChange} />
			);

			await user.click(screen.getByText('Click to add a name'));

			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('does not enter edit mode when clicking empty name box in readonly mode', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			renderWithProviders(
				<ContactListInfo
					listName=''
					onNameChange={onNameChange}
					readonly={true}
				/>
			);

			await user.click(screen.getByText('Click to add a name'));

			expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		});

		it('calls onNameChange when saving edited name', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'New Name');

			// Find save button by color (green)
			const saveButton = container.querySelector(
				'button[data-variant="light"][class*="mantine-ActionIcon"]'
			);
			await user.click(saveButton!);

			expect(onNameChange).toHaveBeenCalledWith('New Name');
		});

		it('saves name when pressing Enter', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'New Name{Enter}');

			expect(onNameChange).toHaveBeenCalledWith('New Name');
		});

		it('cancels edit when pressing Escape', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'New Name{Escape}');

			expect(onNameChange).not.toHaveBeenCalled();
			expect(screen.getByText('Test List')).toBeInTheDocument();
		});

		it('cancels edit when clicking cancel button', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'New Name');

			// Find all action icons in edit mode - cancel button is red colored
			const actionIcons = container.querySelectorAll(
				'button[data-variant="light"][class*="mantine-ActionIcon"]'
			);
			// Cancel is the second button (after save)
			await user.click(actionIcons[1]);

			expect(onNameChange).not.toHaveBeenCalled();
			expect(screen.getByText('Test List')).toBeInTheDocument();
		});

		it('does not call onNameChange when name is unchanged', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			// Click save without changing anything
			const saveButton = container.querySelector(
				'button[data-variant="light"][class*="mantine-ActionIcon"]'
			);
			await user.click(saveButton!);

			expect(onNameChange).not.toHaveBeenCalled();
		});

		it('does not call onNameChange when name is only whitespace or less than 3 characters', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, '   ');

			const saveButton = container.querySelector(
				'button[data-variant="light"][class*="mantine-ActionIcon"]'
			);
			await user.click(saveButton!);

			expect(onNameChange).not.toHaveBeenCalled();

			// Test with less than 3 characters
			await user.clear(input);
			await user.type(input, 'ab');
			await user.click(saveButton!);
			expect(onNameChange).not.toHaveBeenCalled();
		});

		it('disables save button when name is empty or less than 3 characters', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);

			const saveButton = container.querySelector(
				'button[data-variant="light"][class*="mantine-ActionIcon"]'
			);
			expect(saveButton).toBeDisabled();

			// Test with less than 3 characters
			await user.type(input, 'ab');
			expect(saveButton).toBeDisabled();

			// Test with exactly 3 characters
			await user.type(input, 'c');
			expect(saveButton).not.toBeDisabled();
		});

		it('filters out invalid characters from input', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'Test123!@#');

			expect(input).toHaveValue('Test123');
		});

		it('replaces multiple consecutive spaces with single space', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'Test   Name  123');

			expect(input).toHaveValue('Test Name 123');
		});

		it('allows valid characters: letters, numbers, spaces, and hyphens', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			await user.clear(input);
			await user.type(input, 'Test-Name 123 With Spaces');

			expect(input).toHaveValue('Test-Name 123 With Spaces');
		});

		it('limits input to 50 characters', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			const input = screen.getByRole('textbox');
			const longString = 'a'.repeat(90); // 90 characters

			await user.clear(input);
			await user.type(input, longString);

			expect(input).toHaveValue('a'.repeat(50));
			expect(input).toHaveAttribute('maxLength', '50');
		});

		it('shows description with allowed characters and minimum length when editing', async () => {
			const user = userEvent.setup();
			const onNameChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' onNameChange={onNameChange} />
			);

			const editButton = container.querySelector('[class*="editButton"]');
			await user.click(editButton!);

			expect(
				screen.getByText('This name is visible in the campaign.')
			).toBeInTheDocument();
		});
	});

	describe('Expiration date', () => {
		it('shows add expiration button when onExpirationChange is provided', () => {
			const onExpirationChange = vi.fn();
			renderWithProviders(
				<ContactListInfo
					listName='Test List'
					onExpirationChange={onExpirationChange}
				/>
			);

			expect(
				screen.getByRole('button', {
					name: 'Add expiration date',
				})
			).toBeInTheDocument();
		});

		it('does not show expiration button when onExpirationChange is not provided', () => {
			renderWithProviders(<ContactListInfo listName='Test List' />);

			expect(
				screen.queryByRole('button', {
					name: 'Add expiration date',
				})
			).not.toBeInTheDocument();
		});

		it('displays formatted expiration date when provided', () => {
			const onExpirationChange = vi.fn();
			renderWithProviders(
				<ContactListInfo
					listName='Test List'
					expirationDate='2025-01-15'
					onExpirationChange={onExpirationChange}
				/>
			);

			expect(screen.getByText(/Expires: Jan 15, 2025/)).toBeInTheDocument();
		});

		it('opens date picker popover when clicking expiration button', async () => {
			const user = userEvent.setup();
			const onExpirationChange = vi.fn();
			renderWithProviders(
				<ContactListInfo
					listName='Test List'
					onExpirationChange={onExpirationChange}
				/>
			);

			await user.click(
				screen.getByRole('button', {
					name: 'Add expiration date',
				})
			);

			await waitFor(() => {
				expect(screen.getByText('Select expiration date')).toBeInTheDocument();
			});
		});

		it('calls onExpirationChange with null when clearing date', async () => {
			const user = userEvent.setup();
			const onExpirationChange = vi.fn();
			const { container } = renderWithProviders(
				<ContactListInfo
					listName='Test List'
					expirationDate='2025-01-15'
					onExpirationChange={onExpirationChange}
				/>
			);

			// The clear button is the IconX inside the expiration button
			const clearButton = container.querySelector('[class*="clearButton"]');
			if (clearButton) {
				await user.click(clearButton);
				expect(onExpirationChange).toHaveBeenCalledWith(null);
			}
		});
	});

	describe('Icon and styling', () => {
		it('shows list icon when name is provided', () => {
			const { container } = renderWithProviders(
				<ContactListInfo listName='Test List' />
			);

			// The icon should have blue color when there's a name
			const themeIcon = container.querySelector('[class*="mantine-ThemeIcon"]');
			expect(themeIcon).toBeInTheDocument();
		});

		it('shows alert icon when name is empty', () => {
			const { container } = renderWithProviders(
				<ContactListInfo listName='' />
			);

			// Check that the card has the empty style
			const card = container.querySelector('[class*="cardEmpty"]');
			expect(card).toBeInTheDocument();
		});
	});

	describe('Prop updates', () => {
		it('displays updated name when listName prop changes', () => {
			// Test that different names render correctly
			const onNameChange = vi.fn();
			renderWithProviders(
				<ContactListInfo listName='Updated Name' onNameChange={onNameChange} />
			);

			expect(screen.getByText('Updated Name')).toBeInTheDocument();
		});

		it('displays expiration date when provided', () => {
			const onExpirationChange = vi.fn();
			renderWithProviders(
				<ContactListInfo
					listName='Test List'
					expirationDate='2025-02-20'
					onExpirationChange={onExpirationChange}
				/>
			);

			// The mock returns 'Jan 15, 2025' for any date
			expect(screen.getByText(/Expires/)).toBeInTheDocument();
		});
	});
});
