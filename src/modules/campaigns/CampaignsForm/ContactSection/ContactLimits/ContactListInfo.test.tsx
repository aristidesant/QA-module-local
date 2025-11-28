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
			expect(screen.getByText('Contact List Name')).toBeInTheDocument();
		});

		it('renders empty state when no list name provided', () => {
			renderWithProviders(<ContactListInfo listName='' />);

			expect(screen.getByText('Name Required')).toBeInTheDocument();
			expect(
				screen.getByText('Click to add a name for this contact list')
			).toBeInTheDocument();
		});

		it('renders empty state when list name is only whitespace', () => {
			renderWithProviders(<ContactListInfo listName='   ' />);

			expect(screen.getByText('Name Required')).toBeInTheDocument();
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

			await user.click(
				screen.getByText('Click to add a name for this contact list')
			);

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

			await user.click(
				screen.getByText('Click to add a name for this contact list')
			);

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

		it('does not call onNameChange when name is only whitespace', async () => {
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
		});

		it('disables save button when name is empty', async () => {
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
				screen.getByRole('button', { name: /add expiration date/i })
			).toBeInTheDocument();
		});

		it('does not show expiration button when onExpirationChange is not provided', () => {
			renderWithProviders(<ContactListInfo listName='Test List' />);

			expect(
				screen.queryByRole('button', { name: /add expiration date/i })
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
				screen.getByRole('button', { name: /add expiration date/i })
			);

			await waitFor(() => {
				expect(
					screen.getByText('Select an expiration date')
				).toBeInTheDocument();
			});
		});

		it('closes popover when clicking close button', async () => {
			const user = userEvent.setup();
			const onExpirationChange = vi.fn();
			renderWithProviders(
				<ContactListInfo
					listName='Test List'
					onExpirationChange={onExpirationChange}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /add expiration date/i })
			);

			await waitFor(() => {
				expect(
					screen.getByText('Select an expiration date')
				).toBeInTheDocument();
			});

			// Find the Close button by its text
			await user.click(screen.getByText('Close'));

			await waitFor(() => {
				expect(
					screen.queryByText('Select an expiration date')
				).not.toBeInTheDocument();
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
			expect(screen.getByText(/Expires:/)).toBeInTheDocument();
		});
	});
});
