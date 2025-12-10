import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ClientConfigsPage from './ClientConfigsPage';
import * as hooks from '../hooks';

vi.mock('../hooks', () => ({
	useFilteredClientConfigs: vi.fn(() => ({
		configs: [],
		totalConfigs: 0,
		allConfigsCount: 0,
		isLoading: false,
	})),
	useClientConfigsColumns: vi.fn(() => []),
}));

describe('ClientConfigsPage', () => {
	describe('Rendering', () => {
		it('renders page title and description', () => {
			renderWithProviders(<ClientConfigsPage />);

			expect(screen.getByText('Client Configurations')).toBeInTheDocument();
			expect(
				screen.getByText('Manage client configuration settings')
			).toBeInTheDocument();
		});

		it('renders create configuration button in header', () => {
			renderWithProviders(<ClientConfigsPage />);

			const createButtons = screen.getAllByRole('button', {
				name: /Create Configuration/i,
			});
			// There may be multiple create buttons (header + empty state)
			expect(createButtons.length).toBeGreaterThanOrEqual(1);
		});

		it('renders ClientConfigsContent component', () => {
			renderWithProviders(<ClientConfigsPage />);

			// The empty state should be visible since we mock no configs
			expect(screen.getByText(/No configurations found/i)).toBeInTheDocument();
		});
	});

	describe('Create Modal', () => {
		it('opens create modal when header create button is clicked', async () => {
			renderWithProviders(<ClientConfigsPage />);

			const user = userEvent.setup();
			// Get the first create button (from header)
			const createButtons = screen.getAllByRole('button', {
				name: /Create Configuration/i,
			});

			await user.click(createButtons[0]);

			// Modal should open - check for modal title text
			expect(
				await screen.findByText('Create Client Configuration')
			).toBeInTheDocument();
		});
	});

	describe('With Data', () => {
		it('renders table when configs exist', () => {
			vi.mocked(hooks.useFilteredClientConfigs).mockReturnValue({
				configs: [
					{
						id: 1,
						name: 'test_config',
						description: 'Test description',
						type: 'string',
						value: 'test_value',
						clientId: 1,
						userId: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						deletedAt: null,
					},
				],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			});

			// Provide a minimal column definition so the table renders rows
			vi.mocked(hooks.useClientConfigsColumns).mockReturnValue([
				{
					accessorKey: 'name',
					header: 'Name',
					cell: ({ row }: any) => <div>{row.original.name}</div>,
				},
				{
					accessorKey: 'description',
					header: 'Description',
					cell: ({ row }: any) => <div>{row.original.description}</div>,
				},
				{
					accessorKey: 'type',
					header: 'Type',
					cell: ({ row }: any) => <div>{row.original.type}</div>,
				},
				{
					accessorKey: 'value',
					header: 'Value',
					cell: ({ row }: any) => <div>{row.original.value}</div>,
				},
			] as any);

			renderWithProviders(<ClientConfigsPage />);

			expect(screen.getByText('test_config')).toBeInTheDocument();
		});
	});
});
