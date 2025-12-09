import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import useUsersColumns from './useUsersColumns';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { UserModel } from '~/models/UserModels';

// Mock timeAgo utility
vi.mock('~/utils/dateUtils', () => ({
	timeAgo: vi.fn(),
}));

import { timeAgo } from '~/utils/dateUtils';

const mockTimeAgo = vi.mocked(timeAgo);

// Test component to use the hook
const TestComponent = ({
	onView,
	onEdit,
	onDelete,
}: {
	onView: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (user: UserModel) => void;
}) => {
	const columns = useUsersColumns({ onView, onEdit, onDelete });

	// Render a sample cell for testing
	const sampleUser: UserModel = {
		id: 1,
		firstName: 'John',
		lastName: 'Doe',
		username: 'johndoe',
		email: 'john@example.com',
		status: 'ACTIVE',
		client: {
			id: 10,
			name: 'Test Client',
			identifier: 'TC',
			email: 'client@example.com',
		},
		clientId: 10,
		lastLogin: '2023-01-01T00:00:00Z',
		updatedAt: '2023-01-02T00:00:00Z',
		createdAt: '2023-01-01T00:00:00Z',
		deletedAt: null,
	};

	const mockRow = { original: sampleUser };

	return (
		<div>
			{/* Name column */}
			<div data-testid='name-cell'>
				{(columns[0] as any).cell({ row: mockRow })}
			</div>
			{/* Client column */}
			<div data-testid='client-cell'>
				{(columns[1] as any).cell({ row: mockRow })}
			</div>
			{/* Last Login column */}
			<div data-testid='last-login-cell'>
				{(columns[2] as any).cell({ getValue: () => sampleUser.lastLogin })}
			</div>
			{/* Updated column */}
			<div data-testid='updated-cell'>
				{(columns[3] as any).cell({ getValue: () => sampleUser.updatedAt })}
			</div>
			{/* Actions column */}
			<div data-testid='actions-cell'>
				{(columns[4] as any).cell({ row: mockRow })}
			</div>
		</div>
	);
};

describe('useUsersColumns', () => {
	const mockOnView = vi.fn();
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockTimeAgo.mockReturnValue('2 days ago');
	});

	it('renders name column with hover card and combined name', () => {
		renderWithProviders(
			<TestComponent
				onView={mockOnView}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByTestId('name-cell')).toBeInTheDocument();
	});

	it('renders client column with client name and hover card', () => {
		renderWithProviders(
			<TestComponent
				onView={mockOnView}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>
		);

		expect(screen.getByText('Test Client')).toBeInTheDocument();
		expect(screen.getByTestId('client-cell')).toBeInTheDocument();

		// Check that the hover target is present
		expect(screen.getByText('Test Client')).toBeInTheDocument();
	});

	it('renders client column with fallback when client is missing', () => {
		const TestComponentFallback = () => {
			const columns = useUsersColumns({
				onView: mockOnView,
				onEdit: mockOnEdit,
				onDelete: mockOnDelete,
			});
			const sampleUser: UserModel = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				username: 'johndoe',
				email: 'john@example.com',
				status: 'ACTIVE',
				client: undefined,
				clientId: 20,
				lastLogin: null,
				updatedAt: '2023-01-01T00:00:00Z',
				createdAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			const mockRow = { original: sampleUser };

			return (
				<div data-testid='client-cell-fallback'>
					{(columns[1] as any).cell({ row: mockRow })}
				</div>
			);
		};

		renderWithProviders(<TestComponentFallback />);

		expect(screen.getByText('#20')).toBeInTheDocument();
	});

	it('renders last login and updated columns with timeAgo or dash', () => {
		renderWithProviders(
			<TestComponent
				onView={mockOnView}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>
		);

		expect(screen.getAllByText('2 days ago')).toHaveLength(2);

		expect(mockTimeAgo).toHaveBeenCalledWith('2023-01-01T00:00:00Z');
		expect(mockTimeAgo).toHaveBeenCalledWith('2023-01-02T00:00:00Z');
	});

	it('renders actions column with view, edit, delete buttons', async () => {
		renderWithProviders(
			<TestComponent
				onView={mockOnView}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
			/>
		);

		const viewButton = screen.getByRole('button', { name: /view user/i });
		const editButton = screen.getByRole('button', { name: /edit user/i });
		const deleteButton = screen.getByRole('button', { name: /delete user/i });

		expect(viewButton).toBeInTheDocument();
		expect(editButton).toBeInTheDocument();
		expect(deleteButton).toBeInTheDocument();

		await userEvent.click(viewButton);
		expect(mockOnView).toHaveBeenCalledWith(1);

		await userEvent.click(editButton);
		expect(mockOnEdit).toHaveBeenCalledWith(1);

		await userEvent.click(deleteButton);
		expect(mockOnDelete).toHaveBeenCalledWith({
			id: 1,
			firstName: 'John',
			lastName: 'Doe',
			username: 'johndoe',
			email: 'john@example.com',
			status: 'ACTIVE',
			client: {
				id: 10,
				name: 'Test Client',
				identifier: 'TC',
				email: 'client@example.com',
			},
			clientId: 10,
			lastLogin: '2023-01-01T00:00:00Z',
			updatedAt: '2023-01-02T00:00:00Z',
			createdAt: '2023-01-01T00:00:00Z',
			deletedAt: null,
		});
	});

	it('renders dash for invalid dates in lastLogin and updatedAt', () => {
		mockTimeAgo.mockReturnValue('—');

		const TestComponentInvalid = () => {
			const columns = useUsersColumns({
				onView: mockOnView,
				onEdit: mockOnEdit,
				onDelete: mockOnDelete,
			});
			return (
				<div>
					<div data-testid='last-login-invalid'>
						{(columns[2] as any).cell({ getValue: () => null })}
					</div>
					<div data-testid='updated-invalid'>
						{(columns[3] as any).cell({ getValue: () => undefined })}
					</div>
				</div>
			);
		};

		renderWithProviders(<TestComponentInvalid />);

		expect(screen.getAllByText('—')).toHaveLength(2);
	});
});
