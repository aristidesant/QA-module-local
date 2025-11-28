import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CampaignPromptTypesForm from './CampaignPromptTypesForm';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import * as campaignPromptTypeQueries from '~/queries/campaignPromptTypeQueries';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

import { notifications } from '@mantine/notifications';

describe('CampaignPromptTypesForm', () => {
	const mockOnSuccess = vi.fn();
	const mockOnCancel = vi.fn();
	const mockCreateMutateAsync = vi.fn();
	const mockUpdateMutateAsync = vi.fn();

	const mockPromptType: CampaignPromptTypeModel = {
		id: 1,
		name: 'Test Prompt Type',
		icon: 'IconSparkles',
		order: 1,
		createdAt: '2024-01-01T00:00:00.000Z',
	};

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(
			campaignPromptTypeQueries,
			'useCreateCampaignPromptType'
		).mockReturnValue({
			mutateAsync: mockCreateMutateAsync,
			isPending: false,
		} as any);

		vi.spyOn(
			campaignPromptTypeQueries,
			'useUpdateCampaignPromptType'
		).mockReturnValue({
			mutateAsync: mockUpdateMutateAsync,
			isPending: false,
		} as any);
	});

	describe('Rendering', () => {
		it('renders create form correctly', () => {
			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Icon/i)).toBeInTheDocument();
			expect(screen.queryByLabelText(/Order/i)).not.toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Create/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Cancel/i })
			).toBeInTheDocument();
		});

		it('renders edit form with order field', () => {
			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByLabelText(/Name/i)).toHaveValue('Test Prompt Type');
			expect(screen.getByLabelText(/Icon/i)).toHaveValue('IconSparkles');
			expect(screen.getByLabelText(/Order/i)).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Update/i })
			).toBeInTheDocument();
		});
	});

	describe('Validation', () => {
		it('shows validation error for empty name field', async () => {
			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /Create/i });
			const form = submitButton.closest('form');

			if (form) {
				fireEvent.submit(form);
			}

			expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
			expect(mockCreateMutateAsync).not.toHaveBeenCalled();
		});

		it('shows validation error for empty icon field', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.type(screen.getByLabelText(/Name/i), 'Test Name');

			const submitButton = screen.getByRole('button', { name: /Create/i });
			const form = submitButton.closest('form');

			if (form) {
				fireEvent.submit(form);
			}

			expect(await screen.findByText(/Icon is required/i)).toBeInTheDocument();
			expect(mockCreateMutateAsync).not.toHaveBeenCalled();
		});
	});

	describe('Create Mode', () => {
		it('calls create mutation with correct values on submit', async () => {
			const user = userEvent.setup();
			mockCreateMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.type(screen.getByLabelText(/Name/i), 'New Prompt Type');
			await user.type(screen.getByLabelText(/Icon/i), 'IconStar');

			await user.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'New Prompt Type',
					icon: 'IconStar',
				});
			});
		});

		it('shows success notification on successful create', async () => {
			const user = userEvent.setup();
			mockCreateMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.type(screen.getByLabelText(/Name/i), 'New Prompt Type');
			await user.type(screen.getByLabelText(/Icon/i), 'IconStar');

			await user.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Success',
					message: 'Campaign prompt type created successfully',
					color: 'green',
				});
				expect(mockOnSuccess).toHaveBeenCalled();
			});
		});

		it('displays API error message on create failure', async () => {
			const user = userEvent.setup();
			const errorMessage =
				'A campaign prompt type with this name already exists.';
			mockCreateMutateAsync.mockRejectedValue({
				response: {
					data: {
						message: errorMessage,
						error: 'Conflict',
						statusCode: 409,
					},
				},
			});

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.type(screen.getByLabelText(/Name/i), 'Existing Type');
			await user.type(screen.getByLabelText(/Icon/i), 'IconStar');

			await user.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Error',
					message: errorMessage,
					color: 'red',
				});
				expect(mockOnSuccess).not.toHaveBeenCalled();
			});
		});

		it('displays generic error message when API error has no message', async () => {
			const user = userEvent.setup();
			mockCreateMutateAsync.mockRejectedValue(new Error('Network error'));

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.type(screen.getByLabelText(/Name/i), 'New Type');
			await user.type(screen.getByLabelText(/Icon/i), 'IconStar');

			await user.click(screen.getByRole('button', { name: /Create/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Error',
					message: 'Network error',
					color: 'red',
				});
				expect(mockOnSuccess).not.toHaveBeenCalled();
			});
		});
	});

	describe('Edit Mode', () => {
		it('calls update mutation with correct values on submit', async () => {
			const user = userEvent.setup();
			mockUpdateMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.clear(screen.getByLabelText(/Name/i));
			await user.type(screen.getByLabelText(/Name/i), 'Updated Name');

			await user.click(screen.getByRole('button', { name: /Update/i }));

			await waitFor(() => {
				expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
					id: mockPromptType.id,
					data: {
						name: 'Updated Name',
						icon: 'IconSparkles',
						order: 1,
					},
				});
			});
		});

		it('shows success notification on successful update', async () => {
			const user = userEvent.setup();
			mockUpdateMutateAsync.mockResolvedValue({});

			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: /Update/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Success',
					message: 'Campaign prompt type updated successfully',
					color: 'green',
				});
				expect(mockOnSuccess).toHaveBeenCalled();
			});
		});

		it('displays API error message on update failure with order conflict', async () => {
			const user = userEvent.setup();
			const errorMessage =
				'A campaign prompt type with order 2 already exists. Please choose a different order.';
			mockUpdateMutateAsync.mockRejectedValue({
				response: {
					data: {
						message: errorMessage,
						error: 'Conflict',
						statusCode: 409,
					},
				},
			});

			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: /Update/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Error',
					message: errorMessage,
					color: 'red',
				});
				expect(mockOnSuccess).not.toHaveBeenCalled();
			});
		});

		it('displays array of error messages from validation errors', async () => {
			const user = userEvent.setup();
			const errorMessages = ['Name is too short', 'Icon is invalid'];
			mockUpdateMutateAsync.mockRejectedValue({
				response: {
					data: {
						message: errorMessages,
						error: 'Bad Request',
						statusCode: 400,
					},
				},
			});

			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: /Update/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Error',
					message: 'Name is too short, Icon is invalid',
					color: 'red',
				});
				expect(mockOnSuccess).not.toHaveBeenCalled();
			});
		});

		it('displays fallback error message for unknown errors', async () => {
			const user = userEvent.setup();
			mockUpdateMutateAsync.mockRejectedValue({});

			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: /Update/i }));

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Error',
					message: 'An unexpected error occurred',
					color: 'red',
				});
				expect(mockOnSuccess).not.toHaveBeenCalled();
			});
		});
	});

	describe('Cancel Action', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: /Cancel/i }));

			expect(mockOnCancel).toHaveBeenCalled();
		});
	});

	describe('Loading State', () => {
		it('disables buttons when create is pending', () => {
			vi.spyOn(
				campaignPromptTypeQueries,
				'useCreateCampaignPromptType'
			).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				isPending: true,
			} as any);

			renderWithProviders(
				<CampaignPromptTypesForm
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
		});

		it('disables buttons when update is pending', () => {
			vi.spyOn(
				campaignPromptTypeQueries,
				'useUpdateCampaignPromptType'
			).mockReturnValue({
				mutateAsync: mockUpdateMutateAsync,
				isPending: true,
			} as any);

			renderWithProviders(
				<CampaignPromptTypesForm
					promptType={mockPromptType}
					onSuccess={mockOnSuccess}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
		});
	});
});
