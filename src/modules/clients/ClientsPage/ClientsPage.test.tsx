import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ClientsPage from './ClientsPage';
import { useGetAllClients } from '~/queries/clientQueries';
import { vi } from 'vitest';

// Mock the queries
vi.mock('~/queries/clientQueries', () => ({
	useGetAllClients: vi.fn(),
	useDeleteClient: vi.fn(() => ({
		mutateAsync: vi.fn(),
	})),
}));

describe('ClientsPage', () => {
	it('renders clients list correctly', () => {
		// Mock data
		const mockClients = [
			{
				id: 1,
				name: 'Test Client 1',
				identifier: 'TC1',
				email: 'test1@example.com',
				phone: '1234567890',
				description: 'Description 1',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			{
				id: 2,
				name: 'Test Client 2',
				identifier: 'TC2',
				email: 'test2@example.com',
				phone: '0987654321',
				description: 'Description 2',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		];

		(useGetAllClients as any).mockReturnValue({
			data: mockClients,
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<ClientsPage />);

		// Check if title is rendered
		expect(screen.getByText('Clients')).toBeInTheDocument();
		expect(
			screen.getByText('Manage clients and their configurations')
		).toBeInTheDocument();

		// Check if clients are rendered
		expect(screen.getByText('Test Client 1')).toBeInTheDocument();
		expect(screen.getByText('Test Client 2')).toBeInTheDocument();
	});

	it('renders empty state correctly', () => {
		(useGetAllClients as any).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		});

		renderWithProviders(<ClientsPage />);
		expect(screen.getByText('No clients found.')).toBeInTheDocument();
	});
});
