import { screen, fireEvent, waitFor } from '@testing-library/react';
import { NameChangeSection } from './NameChangeSection';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	useCurrentUser,
	useUpdateCurrentUserName,
} from '~/queries/userQueries';
import { notifications } from '@mantine/notifications';

// Mock dependencies
vi.mock('~/queries/userQueries', () => ({
	useCurrentUser: vi.fn(),
	useUpdateCurrentUserName: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('~/components/SectionCard/SectionCard', () => ({
	SectionCard: ({ title, children }: any) => (
		<div data-testid='SectionCard'>
			<h2>{title}</h2>
			{children}
		</div>
	),
}));

describe('NameChangeSection', () => {
	const mockMutateAsync = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useUpdateCurrentUserName as any).mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
		});
	});

	it('renders correctly with user data', () => {
		(useCurrentUser as any).mockReturnValue({
			data: { firstName: 'John', lastName: 'Doe' },
		});

		renderWithProviders(<NameChangeSection />);

		expect(screen.getByText('Display Name')).toBeInTheDocument();
		expect(screen.getByDisplayValue('John')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
		expect(screen.getByText('Edit Name')).toBeInTheDocument();
	});

	it('enables editing when "Edit Name" is clicked', () => {
		(useCurrentUser as any).mockReturnValue({
			data: { firstName: 'John', lastName: 'Doe' },
		});

		renderWithProviders(<NameChangeSection />);

		fireEvent.click(screen.getByText('Edit Name'));

		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.getByText('Save Changes')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Enter your first name')
		).not.toBeDisabled();
	});

	it('validates input and submits form', async () => {
		(useCurrentUser as any).mockReturnValue({
			data: { firstName: 'John', lastName: 'Doe' },
		});

		renderWithProviders(<NameChangeSection />);

		fireEvent.click(screen.getByText('Edit Name'));

		const firstNameInput = screen.getByPlaceholderText('Enter your first name');
		const lastNameInput = screen.getByPlaceholderText('Enter your last name');

		fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
		fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

		fireEvent.click(screen.getByText('Save Changes'));

		await waitFor(() => {
			expect(mockMutateAsync).toHaveBeenCalledWith({
				firstName: 'Jane',
				lastName: 'Smith',
			});
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Success',
				})
			);
		});
	});

	it('handles submission error', async () => {
		(useCurrentUser as any).mockReturnValue({
			data: { firstName: 'John', lastName: 'Doe' },
		});
		mockMutateAsync.mockRejectedValue({
			response: { data: { message: 'Update failed' } },
		});

		renderWithProviders(<NameChangeSection />);

		fireEvent.click(screen.getByText('Edit Name'));
		fireEvent.click(screen.getByText('Save Changes'));

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error',
					message: 'Update failed',
				})
			);
		});
	});

	it('cancels editing and resets values', () => {
		(useCurrentUser as any).mockReturnValue({
			data: { firstName: 'John', lastName: 'Doe' },
		});

		renderWithProviders(<NameChangeSection />);

		fireEvent.click(screen.getByText('Edit Name'));

		const firstNameInput = screen.getByPlaceholderText('Enter your first name');
		fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

		fireEvent.click(screen.getByText('Cancel'));

		expect(screen.getByText('Edit Name')).toBeInTheDocument();
		expect(screen.getByDisplayValue('John')).toBeInTheDocument();
	});
});
