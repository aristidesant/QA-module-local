import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignCategoriesForm } from './CampaignCategoriesForm';
import { CampaignCategory } from '~/models/CampaignCategoryModel';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock usePermissions
const mockCanPerformAction = vi.fn(() => true);
vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
	}),
}));

// Mock notifications
const mockNotificationsShow = vi.fn();
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: (params: Record<string, unknown>) => mockNotificationsShow(params),
	},
}));

// Mock queries
const mockCreateCategory = vi.fn();
const mockUpdateCategory = vi.fn();
vi.mock('~/queries/campaignCategoriesQueries', () => ({
	useCreateCampaignCategory: () => ({
		mutateAsync: mockCreateCategory,
		isPending: false,
	}),
	useUpdateCampaignCategory: () => ({
		mutateAsync: mockUpdateCategory,
		isPending: false,
	}),
}));

const mockCategory: CampaignCategory = {
	id: 1,
	name: 'Test Category',
	code: 'test-category',
	description: 'Test description',
	active: true,
	userId: 1,
	clientId: 1,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('CampaignCategoriesForm', () => {
	const onSuccess = vi.fn();
	const onCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateCategory.mockResolvedValue({});
		mockUpdateCategory.mockResolvedValue({});
	});

	describe('Create mode', () => {
		it('renders form with empty fields in create mode', () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			expect(screen.getByPlaceholderText('Enter category name')).toHaveValue(
				''
			);
			expect(
				screen.getByPlaceholderText('Enter category description (optional)')
			).toHaveValue('');
			expect(
				screen.getByRole('button', { name: 'Create' })
			).toBeInTheDocument();
		});

		it('renders active switch defaulting to true in create mode', () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const activeSwitch = screen.getByRole('switch', {
				name: 'Active When enabled, this category will be available for use',
			});
			expect(activeSwitch).toBeChecked();
		});

		it('has required name field', () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const nameInput = screen.getByPlaceholderText('Enter category name');

			expect(nameInput).toBeInTheDocument();
		});

		it('calls onCancel when cancel button is clicked', () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const cancelButton = screen.getByRole('button', { name: 'Cancel' });
			fireEvent.click(cancelButton);

			expect(onCancel).toHaveBeenCalled();
		});

		it('submits the form with valid data', async () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			// Fill in required fields
			fireEvent.change(screen.getByPlaceholderText('Enter category name'), {
				target: { value: 'New Category' },
			});
			// Submit form
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockCreateCategory).toHaveBeenCalledWith({
					name: 'New Category',
					description: '',
					active: true,
				});
			});
		});

		it('calls onSuccess after successful creation', async () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			// Fill in required fields
			fireEvent.change(screen.getByPlaceholderText('Enter category name'), {
				target: { value: 'New Category' },
			});
			// Submit form
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalled();
			});
		});
	});

	describe('Edit mode', () => {
		it('renders form with pre-filled values in edit mode', () => {
			renderWithProviders(
				<CampaignCategoriesForm
					category={mockCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			expect(screen.getByPlaceholderText('Enter category name')).toHaveValue(
				'Test Category'
			);
			expect(
				screen.getByRole('button', { name: 'Update' })
			).toBeInTheDocument();
		});

		it('shows Update button instead of Create in edit mode', () => {
			renderWithProviders(
				<CampaignCategoriesForm
					category={mockCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			expect(
				screen.getByRole('button', { name: 'Update' })
			).toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Create' })
			).not.toBeInTheDocument();
		});

		it('calls update mutation when form is submitted in edit mode', async () => {
			renderWithProviders(
				<CampaignCategoriesForm
					category={mockCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const submitButton = screen.getByRole('button', { name: 'Update' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateCategory).toHaveBeenCalledWith({
					id: 1,
					data: {
						name: 'Test Category',
						description: 'Test description',
						active: true,
					},
				});
			});
		});

		it('pre-fills the description field in edit mode', () => {
			renderWithProviders(
				<CampaignCategoriesForm
					category={mockCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			expect(
				screen.getByPlaceholderText('Enter category description (optional)')
			).toHaveValue('Test description');
		});

		it('pre-fills the active switch in edit mode', () => {
			renderWithProviders(
				<CampaignCategoriesForm
					category={mockCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const activeSwitch = screen.getByRole('switch', {
				name: 'Active When enabled, this category will be available for use',
			});
			expect(activeSwitch).toBeChecked();
		});

		it('pre-fills inactive category correctly', () => {
			const inactiveCategory = { ...mockCategory, active: false };
			renderWithProviders(
				<CampaignCategoriesForm
					category={inactiveCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const activeSwitch = screen.getByRole('switch', {
				name: 'Active When enabled, this category will be available for use',
			});
			expect(activeSwitch).not.toBeChecked();
		});
	});

	describe('Success and error handling', () => {
		it('shows success notification on successful create', async () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			// Fill required fields
			fireEvent.change(screen.getByPlaceholderText('Enter category name'), {
				target: { value: 'New Category' },
			});
			// Submit form
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Success',
						message: 'Campaign category created successfully',
						color: 'green',
					})
				);
			});
		});

		it('shows error notification on failed create', async () => {
			mockCreateCategory.mockRejectedValueOnce(new Error('Failed to create'));

			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			// Fill required fields
			fireEvent.change(screen.getByPlaceholderText('Enter category name'), {
				target: { value: 'New Category' },
			});
			// Submit form
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						message: 'Failed to create',
						color: 'red',
					})
				);
			});
		});

		it('shows success notification on successful update', async () => {
			renderWithProviders(
				<CampaignCategoriesForm
					category={mockCategory}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const submitButton = screen.getByRole('button', { name: 'Update' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Success',
						message: 'Campaign category updated successfully',
						color: 'green',
					})
				);
			});
		});
	});

	describe('Form fields', () => {
		it('allows toggling the active switch', () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const activeSwitch = screen.getByRole('switch', {
				name: 'Active When enabled, this category will be available for use',
			});
			expect(activeSwitch).toBeChecked();

			fireEvent.click(activeSwitch);
			expect(activeSwitch).not.toBeChecked();

			fireEvent.click(activeSwitch);
			expect(activeSwitch).toBeChecked();
		});

		it('allows entering description', () => {
			renderWithProviders(
				<CampaignCategoriesForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const descriptionField = screen.getByPlaceholderText(
				'Enter category description (optional)'
			);
			fireEvent.change(descriptionField, {
				target: { value: 'Test description' },
			});

			expect(descriptionField).toHaveValue('Test description');
		});
	});
});
