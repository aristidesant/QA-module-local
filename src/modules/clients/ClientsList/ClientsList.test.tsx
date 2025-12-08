import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ClientsList from './ClientsList';
import { useGetAllClients } from '~/queries/clientQueries';
import { vi } from 'vitest';

// Mock the queries
vi.mock('~/queries/clientQueries', () => ({
	useGetAllClients: vi.fn(),
}));

describe('ClientsList', () => {
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders clients list correctly', () => {
		const mockClients = [
			{
				id: 1,
				name: 'Test Client 1',
				identifier: 'TC1',
				email: 'test1@example.com',
				phone: '1234567890',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
		];

		(useGetAllClients as any).mockReturnValue({
			data: mockClients,
			isLoading: false,
			isError: false,
		});

		renderWithProviders(
			<ClientsList search='' onEdit={mockOnEdit} onDelete={mockOnDelete} />
		);

		expect(screen.getByText('Test Client 1')).toBeInTheDocument();
	});

	it('renders empty state when no clients', () => {
		(useGetAllClients as any).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(
			<ClientsList search='' onEdit={mockOnEdit} onDelete={mockOnDelete} />
		);

		expect(screen.getByText('No clients found.')).toBeInTheDocument();
	});

	it('filters clients by search term', () => {
		const mockClients = [
			{
				id: 1,
				name: 'Alpha Client',
				identifier: 'AC1',
				email: 'alpha@example.com',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
			{
				id: 2,
				name: 'Beta Client',
				identifier: 'BC1',
				email: 'beta@example.com',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
			},
		];

		(useGetAllClients as any).mockReturnValue({
			data: mockClients,
			isLoading: false,
			isError: false,
		});

		renderWithProviders(
			<ClientsList search='alpha' onEdit={mockOnEdit} onDelete={mockOnDelete} />
		);

		expect(screen.getByText('Alpha Client')).toBeInTheDocument();
		expect(screen.queryByText('Beta Client')).not.toBeInTheDocument();
	});
});
