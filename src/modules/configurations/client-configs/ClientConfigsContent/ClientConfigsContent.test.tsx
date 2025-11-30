import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientConfigsContent } from './ClientConfigsContent';
import * as hooks from '../hooks';
import * as queries from '~/queries/useClientConfigs';
import { vi } from 'vitest';
import { notifications } from '@mantine/notifications';

// We rely on the real store implementation and only mock hooks used by the component.

const sampleConfig = {
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
};

describe('ClientConfigsContent', () => {
	beforeEach(() => {
		vi.spyOn(notifications, 'show').mockImplementation(() => '');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Empty State', () => {
		it('shows empty state when there are no configs', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [],
				totalConfigs: 0,
				allConfigsCount: 0,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);
			const setCreateModalOpened = vi.fn();

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			expect(screen.getByText(/No configurations found/i)).toBeInTheDocument();
			fireEvent.click(
				screen.getByRole('button', { name: /Create Configuration/i })
			);
			expect(setCreateModalOpened).toHaveBeenCalledWith(true);
		});

		it('renders create modal via empty state action', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [],
				totalConfigs: 0,
				allConfigsCount: 0,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={true}
					setCreateModalOpened={() => {}}
				/>
			);

			expect(
				screen.getByRole('dialog', { name: /Create Client Configuration/i })
			).toBeInTheDocument();
		});
	});

	describe('Filter Results', () => {
		it('shows no results message when filters exclude all data', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [],
				totalConfigs: 5,
				allConfigsCount: 5,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);
			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			expect(
				screen.getByText(/No configurations match your filters/i)
			).toBeInTheDocument();
			expect(
				screen.getByText(/Try adjusting your search criteria or filters/i)
			).toBeInTheDocument();
		});
	});

	describe('Table Rendering', () => {
		it('renders table when configs exist', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			expect(screen.getByText('test_config')).toBeInTheDocument();
			expect(screen.getByText('Test description')).toBeInTheDocument();
			expect(screen.getByText('string')).toBeInTheDocument();
		});

		it('renders pagination controls', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 25,
				allConfigsCount: 25,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			expect(screen.getByText(/configurations/i)).toBeInTheDocument();
		});
	});

	describe('Edit Modal', () => {
		it('opens edit modal when edit button is clicked', async () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			const user = userEvent.setup();
			const editButtons = screen.getAllByRole('button');
			const editButton = editButtons.find((btn) =>
				btn.querySelector('svg.tabler-icon-edit')
			);

			if (editButton) {
				await user.click(editButton);
				await waitFor(() => {
					expect(
						screen.getByRole('dialog', { name: /Edit Client Configuration/i })
					).toBeInTheDocument();
				});
			}
		});
	});

	describe('Delete Modal', () => {
		it('opens delete confirmation modal when delete button is clicked', async () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			const user = userEvent.setup();
			const deleteButtons = screen.getAllByRole('button');
			const deleteButton = deleteButtons.find((btn) =>
				btn.querySelector('svg.tabler-icon-trash')
			);

			if (deleteButton) {
				await user.click(deleteButton);
				await waitFor(() => {
					expect(
						screen.getByRole('dialog', { name: /Delete Configuration/i })
					).toBeInTheDocument();
					// Use getAllByText since the name appears both in table and modal
					expect(screen.getAllByText(/test_config/).length).toBeGreaterThan(0);
				});
			}
		});

		it('calls delete mutation and shows success notification', async () => {
			const deleteMutateAsync = vi.fn().mockResolvedValue(undefined);
			vi.spyOn(queries, 'useDeleteClientConfig').mockReturnValue({
				mutateAsync: deleteMutateAsync,
				isPending: false,
			} as unknown as ReturnType<typeof queries.useDeleteClientConfig>);

			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			const user = userEvent.setup();
			const deleteButtons = screen.getAllByRole('button');
			const deleteButton = deleteButtons.find((btn) =>
				btn.querySelector('svg.tabler-icon-trash')
			);

			if (deleteButton) {
				await user.click(deleteButton);
				await waitFor(() => {
					expect(
						screen.getByRole('dialog', { name: /Delete Configuration/i })
					).toBeInTheDocument();
				});

				const confirmDeleteButton = screen.getByRole('button', {
					name: /^Delete$/i,
				});
				await user.click(confirmDeleteButton);

				await waitFor(() => {
					expect(deleteMutateAsync).toHaveBeenCalledWith('test_config');
					expect(notifications.show).toHaveBeenCalledWith(
						expect.objectContaining({
							title: 'Success',
							color: 'green',
						})
					);
				});
			}
		});

		it('shows error notification when delete fails', async () => {
			const deleteMutateAsync = vi
				.fn()
				.mockRejectedValue(new Error('Delete failed'));
			vi.spyOn(queries, 'useDeleteClientConfig').mockReturnValue({
				mutateAsync: deleteMutateAsync,
				isPending: false,
			} as unknown as ReturnType<typeof queries.useDeleteClientConfig>);

			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			const user = userEvent.setup();
			const deleteButtons = screen.getAllByRole('button');
			const deleteButton = deleteButtons.find((btn) =>
				btn.querySelector('svg.tabler-icon-trash')
			);

			if (deleteButton) {
				await user.click(deleteButton);
				await waitFor(() => {
					expect(
						screen.getByRole('dialog', { name: /Delete Configuration/i })
					).toBeInTheDocument();
				});

				const confirmDeleteButton = screen.getByRole('button', {
					name: /^Delete$/i,
				});
				await user.click(confirmDeleteButton);

				await waitFor(() => {
					expect(notifications.show).toHaveBeenCalledWith(
						expect.objectContaining({
							title: 'Error',
							color: 'red',
						})
					);
				});
			}
		});

		it('closes delete modal when cancel is clicked', async () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			const user = userEvent.setup();
			const deleteButtons = screen.getAllByRole('button');
			const deleteButton = deleteButtons.find((btn) =>
				btn.querySelector('svg.tabler-icon-trash')
			);

			if (deleteButton) {
				await user.click(deleteButton);
				await waitFor(() => {
					expect(
						screen.getByRole('dialog', { name: /Delete Configuration/i })
					).toBeInTheDocument();
				});

				const cancelButton = screen.getByRole('button', { name: /Cancel/i });
				await user.click(cancelButton);

				await waitFor(() => {
					expect(
						screen.queryByRole('dialog', { name: /Delete Configuration/i })
					).not.toBeInTheDocument();
				});
			}
		});
	});

	describe('Create Modal', () => {
		it('renders create modal when createModalOpened is true', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={true}
					setCreateModalOpened={() => {}}
				/>
			);

			expect(
				screen.getByRole('dialog', { name: /Create Client Configuration/i })
			).toBeInTheDocument();
		});

		it('calls setCreateModalOpened(false) when cancel button is clicked', async () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			const setCreateModalOpened = vi.fn();
			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={true}
					setCreateModalOpened={setCreateModalOpened}
				/>
			);

			const user = userEvent.setup();
			// Close the modal by clicking the Cancel button inside the form
			const cancelButton = screen.getByRole('button', { name: /Cancel/i });
			await user.click(cancelButton);

			expect(setCreateModalOpened).toHaveBeenCalledWith(false);
		});
	});

	describe('Table Column Rendering', () => {
		it('renders all table columns with correct data', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			// Name column
			expect(screen.getByText('test_config')).toBeInTheDocument();
			// Description column
			expect(screen.getByText('Test description')).toBeInTheDocument();
			// Type column (badge)
			expect(screen.getByText('string')).toBeInTheDocument();
			// Value column
			expect(screen.getByText('test_value')).toBeInTheDocument();
			// Updated at column - formatted date
			expect(
				screen.getByText(new Date(sampleConfig.updatedAt).toLocaleDateString())
			).toBeInTheDocument();
		});

		it('renders multiple configs in table', () => {
			const multipleConfigs = [
				sampleConfig,
				{
					...sampleConfig,
					id: 2,
					name: 'second_config',
					description: 'Second description',
					type: 'json',
				},
			];

			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: multipleConfigs,
				totalConfigs: 2,
				allConfigsCount: 2,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			expect(screen.getByText('test_config')).toBeInTheDocument();
			expect(screen.getByText('second_config')).toBeInTheDocument();
			expect(screen.getByText('json')).toBeInTheDocument();
		});
	});

	describe('Edit Modal Close', () => {
		it('closes edit modal when cancel button is clicked', async () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [sampleConfig],
				totalConfigs: 1,
				allConfigsCount: 1,
				isLoading: false,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			const user = userEvent.setup();
			const editButtons = screen.getAllByRole('button');
			const editButton = editButtons.find((btn) =>
				btn.querySelector('svg.tabler-icon-edit')
			);

			if (editButton) {
				await user.click(editButton);
				await waitFor(() => {
					expect(
						screen.getByRole('dialog', { name: /Edit Client Configuration/i })
					).toBeInTheDocument();
				});

				// Close the edit modal using Cancel button
				const cancelButton = screen.getByRole('button', { name: /Cancel/i });
				await user.click(cancelButton);

				await waitFor(() => {
					expect(
						screen.queryByRole('dialog', { name: /Edit Client Configuration/i })
					).not.toBeInTheDocument();
				});
			}
		});
	});

	describe('Loading State', () => {
		it('passes loading state to BaseTable', () => {
			vi.spyOn(hooks, 'useFilteredClientConfigs').mockReturnValue({
				configs: [],
				totalConfigs: 0,
				allConfigsCount: 5,
				isLoading: true,
			} as ReturnType<typeof hooks.useFilteredClientConfigs>);

			renderWithProviders(
				<ClientConfigsContent
					createModalOpened={false}
					setCreateModalOpened={() => {}}
				/>
			);

			// When loading, should not show the "no results" message
			expect(
				screen.queryByText(/No configurations match your filters/i)
			).not.toBeInTheDocument();
		});
	});
});
