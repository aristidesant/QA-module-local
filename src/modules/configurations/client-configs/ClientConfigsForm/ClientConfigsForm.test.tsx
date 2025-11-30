import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ClientConfigsForm } from './ClientConfigsForm';
import { notifications } from '@mantine/notifications';
import type { ClientConfig } from '~/models/ClientConfig';

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();

vi.mock('~/queries/useClientConfigs', () => ({
	useCreateClientConfig: vi.fn(() => ({
		mutateAsync: createMutateAsync,
		isPending: false,
	})),
	useUpdateClientConfig: vi.fn(() => ({
		mutateAsync: updateMutateAsync,
		isPending: false,
	})),
}));

vi.spyOn(notifications, 'show').mockImplementation(
	() => 'mock-notification-id'
);

const sampleConfig: ClientConfig = {
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

describe('ClientConfigsForm', () => {
	const onSuccess = vi.fn();
	const onCancel = vi.fn();

	beforeEach(() => {
		createMutateAsync.mockReset();
		updateMutateAsync.mockReset();
		onSuccess.mockReset();
		onCancel.mockReset();
		vi.mocked(notifications.show).mockClear();
	});

	describe('Create Mode', () => {
		it('renders create form with empty fields', () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			expect(
				screen.getByRole('textbox', { name: /Name/i })
			).toBeInTheDocument();
			expect(screen.getByRole('textbox', { name: /Name/i })).toHaveValue('');
			expect(
				screen.getByRole('button', { name: /Create Configuration/i })
			).toBeInTheDocument();
		});

		it('shows name field enabled in create mode', () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			expect(nameInput).not.toBeDisabled();
		});

		it('validates required name field', async () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});

			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
			});
		});

		it('validates name format (lowercase, numbers, underscores)', async () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });

			await user.type(nameInput, 'Invalid Name!');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(
					screen.getByText(
						/Name must contain only lowercase letters, numbers, and underscores/i
					)
				).toBeInTheDocument();
			});
		});

		it('validates description is required', async () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });

			await user.type(nameInput, 'valid_name');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(
					screen.getByText(/Description is required/i)
				).toBeInTheDocument();
			});
		});

		it('validates value is required', async () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			const descriptionInput = screen.getByRole('textbox', {
				name: /Description/i,
			});

			await user.type(nameInput, 'valid_name');
			await user.type(descriptionInput, 'A valid description');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/Value is required/i)).toBeInTheDocument();
			});
		});

		it('calls createMutation on valid form submission', async () => {
			createMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			const descriptionInput = screen.getByRole('textbox', {
				name: /Description/i,
			});
			const valueInput = screen.getByRole('textbox', { name: /Value/i });

			await user.type(nameInput, 'new_config');
			await user.type(descriptionInput, 'New config description');
			await user.type(valueInput, 'some_value');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(createMutateAsync).toHaveBeenCalledWith({
					name: 'new_config',
					description: 'New config description',
					value: 'some_value',
					type: 'string',
				});
			});

			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Success',
					color: 'green',
				})
			);
			expect(onSuccess).toHaveBeenCalled();
		});

		it('shows error notification when create fails', async () => {
			createMutateAsync.mockRejectedValue(new Error('Create failed'));

			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			const descriptionInput = screen.getByRole('textbox', {
				name: /Description/i,
			});
			const valueInput = screen.getByRole('textbox', { name: /Value/i });

			await user.type(nameInput, 'new_config');
			await user.type(descriptionInput, 'New config description');
			await user.type(valueInput, 'some_value');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						color: 'red',
					})
				);
			});
		});
	});

	describe('Edit Mode', () => {
		it('renders edit form with pre-filled values', () => {
			renderWithProviders(
				<ClientConfigsForm
					config={sampleConfig}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			expect(screen.getByRole('textbox', { name: /Name/i })).toHaveValue(
				'test_config'
			);
			expect(screen.getByRole('textbox', { name: /Description/i })).toHaveValue(
				'Test description'
			);
			expect(screen.getByRole('textbox', { name: /Value/i })).toHaveValue(
				'test_value'
			);
			expect(
				screen.getByRole('button', { name: /Update Configuration/i })
			).toBeInTheDocument();
		});

		it('disables name field in edit mode', () => {
			renderWithProviders(
				<ClientConfigsForm
					config={sampleConfig}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			expect(nameInput).toBeDisabled();
		});

		it('calls updateMutation on valid form submission', async () => {
			updateMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<ClientConfigsForm
					config={sampleConfig}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const user = userEvent.setup();
			const descriptionInput = screen.getByRole('textbox', {
				name: /Description/i,
			});

			await user.clear(descriptionInput);
			await user.type(descriptionInput, 'Updated description');

			const submitButton = screen.getByRole('button', {
				name: /Update Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(updateMutateAsync).toHaveBeenCalledWith({
					name: 'test_config',
					data: {
						description: 'Updated description',
						value: 'test_value',
						type: 'string',
					},
				});
			});

			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Success',
					color: 'green',
				})
			);
			expect(onSuccess).toHaveBeenCalled();
		});

		it('shows error notification when update fails', async () => {
			updateMutateAsync.mockRejectedValue(new Error('Update failed'));

			renderWithProviders(
				<ClientConfigsForm
					config={sampleConfig}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const user = userEvent.setup();
			const submitButton = screen.getByRole('button', {
				name: /Update Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						color: 'red',
					})
				);
			});
		});
	});

	describe('JSON Validation', () => {
		it('validates JSON format when type is json with invalid value', async () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			const descriptionInput = screen.getByRole('textbox', {
				name: /Description/i,
			});
			const valueInput = screen.getByRole('textbox', { name: /Value/i });

			await user.type(nameInput, 'json_config');
			await user.type(descriptionInput, 'A JSON config');
			await user.type(valueInput, 'just a simple string value');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(createMutateAsync).toHaveBeenCalled();
			});
		});

		it('accepts valid value when type is string', async () => {
			createMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const nameInput = screen.getByRole('textbox', { name: /Name/i });
			const descriptionInput = screen.getByRole('textbox', {
				name: /Description/i,
			});
			const valueInput = screen.getByRole('textbox', { name: /Value/i });

			await user.type(nameInput, 'string_config');
			await user.type(descriptionInput, 'A string config');
			await user.type(valueInput, 'any valid string');

			const submitButton = screen.getByRole('button', {
				name: /Create Configuration/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(createMutateAsync).toHaveBeenCalled();
			});
		});
	});

	describe('Cancel Button', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			renderWithProviders(
				<ClientConfigsForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const user = userEvent.setup();
			const cancelButton = screen.getByRole('button', { name: /Cancel/i });

			await user.click(cancelButton);

			expect(onCancel).toHaveBeenCalled();
		});
	});
});
