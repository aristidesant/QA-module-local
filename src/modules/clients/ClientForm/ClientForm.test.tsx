import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ClientForm from './ClientForm';
import {
	useCreateClient,
	useUpdateClient,
	useGetClient,
} from '~/queries/clientQueries';
import { vi } from 'vitest';
import type { ClientModel } from '~/models/ClientModel';

// Mock queries
vi.mock('~/queries/clientQueries', () => ({
	useCreateClient: vi.fn(),
	useUpdateClient: vi.fn(),
	useGetClient: vi.fn(),
}));

describe('ClientForm', () => {
	const mockOnSuccess = vi.fn();
	const mockOnCancel = vi.fn();
	const mockCreateMutate = vi.fn();
	const mockUpdateMutate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useCreateClient as any).mockReturnValue({
			mutateAsync: mockCreateMutate,
			isPending: false,
		});
		(useUpdateClient as any).mockReturnValue({
			mutateAsync: mockUpdateMutate,
			isPending: false,
		});
		(useGetClient as any).mockReturnValue({
			data: undefined,
			isLoading: false,
		});
	});

	it('renders create form correctly', () => {
		renderWithProviders(
			<ClientForm
				mode='create'
				onSuccess={mockOnSuccess}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByText('Client Details')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Client Name')).toBeInTheDocument();
		expect(screen.getByText('Create Client')).toBeInTheDocument();
	});

	it('submits form with valid data', async () => {
		renderWithProviders(
			<ClientForm
				mode='create'
				onSuccess={mockOnSuccess}
				onCancel={mockOnCancel}
			/>
		);

		await userEvent.type(
			screen.getByPlaceholderText('Client Name'),
			'New Client'
		);
		await userEvent.click(screen.getByText('Create Client'));

		await waitFor(() => {
			expect(mockCreateMutate).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'New Client',
				})
			);
			expect(mockOnSuccess).toHaveBeenCalled();
		});
	});

	it('renders edit form correctly with data', () => {
		const mockClient: ClientModel = {
			id: 1,
			name: 'Existing Client',
			identifier: 'EX1',
			email: 'existing@example.com',
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		};

		(useGetClient as any).mockReturnValue({
			data: mockClient,
			isLoading: false,
		});

		renderWithProviders(
			<ClientForm
				mode='edit'
				clientId={1}
				onSuccess={mockOnSuccess}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByDisplayValue('Existing Client')).toBeInTheDocument();
		expect(screen.getByDisplayValue('EX1')).toBeInTheDocument();
		expect(screen.getByText('Save Changes')).toBeInTheDocument();
	});
});
