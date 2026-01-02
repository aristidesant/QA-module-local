import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignSchemasForm from './CampaignSchemasForm';
import { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

vi.mock(
	'~/modules/campaign-management/CampaignManagementPage/components/ObjectivePickerPanel',
	() => ({
		default: ({
			onSelect,
		}: {
			onSelect: (objective: { id: number; name: string }) => void;
		}) => (
			<button
				type='button'
				onClick={() => onSelect({ id: 1, name: 'Objective 1' })}
			>
				Pick Objective 1
			</button>
		),
	})
);

// Mock notifications
const mockNotificationsShow = vi.fn();
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: (params: Record<string, unknown>) => mockNotificationsShow(params),
	},
}));

// Mock queries
const mockCreateSchema = vi.fn();
const mockUpdateSchema = vi.fn();
vi.mock('~/queries/campaignContactSchemasQueries', () => ({
	useCreateCampaignContactSchema: () => ({
		mutateAsync: mockCreateSchema,
		isPending: false,
	}),
	useUpdateCampaignContactSchema: () => ({
		mutateAsync: mockUpdateSchema,
		isPending: false,
	}),
}));

vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useGetCampaignObjectives: () => ({
		data: {
			data: [
				{ id: 1, name: 'Objective 1', category: { name: 'Category A' } },
				{ id: 2, name: 'Objective 2', category: { name: 'Category B' } },
			],
		},
	}),
}));

const mockSchema: CampaignContactSchema = {
	id: 1,
	name: 'Test Schema',
	code: 'test-schema',
	icon: 'credit-card',
	objectiveId: 1,
	objective: { id: 1, name: 'Objective 1' },
	description: 'Test description',
	schemaFields: [
		{ name: 'firstName', label: 'First Name', type: 'string', isArray: false },
	],
	isActive: true,
	version: 1,
	userId: 1,
	clientId: 1,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('CampaignSchemasForm', () => {
	const onSuccess = vi.fn();
	const onCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateSchema.mockResolvedValue({});
		mockUpdateSchema.mockResolvedValue({});
	});

	beforeAll(() => {
		Element.prototype.scrollIntoView = vi.fn();
	});

	const fillBaseForm = () => {
		fireEvent.change(screen.getByPlaceholderText('Enter schema name'), {
			target: { value: 'New Schema' },
		});
		fireEvent.change(
			screen.getByPlaceholderText('Enter schema description (optional)'),
			{
				target: { value: 'Some description' },
			}
		);
		const objectiveInput = screen.getByPlaceholderText('Select an objective');
		fireEvent.click(objectiveInput);
		fireEvent.click(screen.getByText('Pick Objective 1'));
		fireEvent.change(screen.getByPlaceholderText('e.g., firstName'), {
			target: { value: 'firstName' },
		});
		fireEvent.change(screen.getByPlaceholderText('e.g., First Name'), {
			target: { value: 'First Name' },
		});
	};

	describe('Create mode', () => {
		it('renders form with Create button', () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			expect(
				screen.getByPlaceholderText('Enter schema name')
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /create/i })
			).toBeInTheDocument();
		});

		it('has required name field with placeholder', () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const nameInput = screen.getByPlaceholderText('Enter schema name');
			expect(nameInput).toBeInTheDocument();
			expect(nameInput).toHaveValue('');
		});

		it('calls onCancel when cancel button is clicked', () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const cancelButton = screen.getByRole('button', { name: /cancel/i });
			fireEvent.click(cancelButton);

			expect(onCancel).toHaveBeenCalled();
		});

		it('submits create flow and shows success notification', async () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			fillBaseForm();

			fireEvent.click(screen.getByRole('button', { name: /create/i }));

			await waitFor(() => {
				expect(mockCreateSchema).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'New Schema',
						code: 'new-schema',
						objectiveId: 1,
						schemaFields: [
							expect.objectContaining({
								name: 'firstName',
								label: 'First Name',
								type: 'string',
								isArray: false,
							}),
						],
					})
				);
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Success',
						message: 'Campaign schema created successfully',
					})
				);
				expect(onSuccess).toHaveBeenCalled();
			});
		});

		it('shows notification when field names are invalid and stops submit', async () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			fireEvent.change(screen.getByPlaceholderText('Enter schema name'), {
				target: { value: 'Bad Fields Schema' },
			});
			const objectiveInput = screen.getByPlaceholderText('Select an objective');
			fireEvent.click(objectiveInput);
			fireEvent.click(screen.getByText('Pick Objective 1'));
			fireEvent.change(screen.getByPlaceholderText('e.g., firstName'), {
				target: { value: 'InvalidName' },
			});
			fireEvent.change(screen.getByPlaceholderText('e.g., First Name'), {
				target: { value: 'First Name' },
			});

			fireEvent.click(screen.getByRole('button', { name: /create/i }));

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Invalid Field Names',
					})
				);
			});

			expect(mockCreateSchema).not.toHaveBeenCalled();
		});

		it('shows error notification when create mutation fails', async () => {
			mockCreateSchema.mockRejectedValueOnce(new Error('create failed'));

			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			fillBaseForm();

			fireEvent.click(screen.getByRole('button', { name: /create/i }));

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						message: 'create failed',
					})
				);
				expect(onSuccess).not.toHaveBeenCalled();
			});
		});
	});

	describe('Edit mode', () => {
		it('renders form with pre-filled name in edit mode', () => {
			renderWithProviders(
				<CampaignSchemasForm
					schema={mockSchema}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			expect(screen.getByPlaceholderText('Enter schema name')).toHaveValue(
				'Test Schema'
			);
			expect(
				screen.getByRole('button', { name: /update/i })
			).toBeInTheDocument();
		});

		it('shows Update button instead of Create in edit mode', () => {
			renderWithProviders(
				<CampaignSchemasForm
					schema={mockSchema}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			expect(
				screen.getByRole('button', { name: /update/i })
			).toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: /^create$/i })
			).not.toBeInTheDocument();
		});

		it('calls update mutation when form is submitted in edit mode', async () => {
			renderWithProviders(
				<CampaignSchemasForm
					schema={mockSchema}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			const submitButton = screen.getByRole('button', { name: /update/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockUpdateSchema).toHaveBeenCalled();
			});
		});

		it('shows notification when update mutation fails for non in-use error', async () => {
			mockUpdateSchema.mockRejectedValueOnce(new Error('update failed'));

			renderWithProviders(
				<CampaignSchemasForm
					schema={mockSchema}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			fireEvent.click(screen.getByRole('button', { name: /update/i }));

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						message: 'update failed',
					})
				);
			});

			expect(screen.queryByText(/Schema In Use/i)).not.toBeInTheDocument();
			expect(onSuccess).not.toHaveBeenCalled();
		});

		it('shows version modal on in-use error and creates new version', async () => {
			mockUpdateSchema.mockRejectedValueOnce({
				response: { data: { message: 'schema in use' }, status: 409 },
			});

			renderWithProviders(
				<CampaignSchemasForm
					schema={mockSchema}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			fireEvent.change(screen.getByPlaceholderText('Enter schema name'), {
				target: { value: 'Updated Schema' },
			});

			fireEvent.click(screen.getByRole('button', { name: /update/i }));

			await waitFor(() =>
				expect(screen.getByText(/Schema In Use/i)).toBeInTheDocument()
			);

			fireEvent.click(
				screen.getByRole('button', { name: /create new version/i })
			);

			await waitFor(() => {
				expect(mockCreateSchema).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'Updated Schema (v2)',
						code: 'updated-schema-v2',
						objectiveId: 1,
					})
				);
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Success',
						message: 'New schema version created successfully',
					})
				);
				expect(onSuccess).toHaveBeenCalled();
			});
		});

		it('shows error notification when creating a new version fails', async () => {
			mockUpdateSchema.mockRejectedValueOnce({
				response: { data: { message: 'schema in use' }, status: 409 },
			});
			mockCreateSchema.mockRejectedValueOnce(new Error('version failed'));

			renderWithProviders(
				<CampaignSchemasForm
					schema={mockSchema}
					onSuccess={onSuccess}
					onCancel={onCancel}
				/>
			);

			fireEvent.click(screen.getByRole('button', { name: /update/i }));

			await waitFor(() =>
				expect(screen.getByText(/Schema In Use/i)).toBeInTheDocument()
			);

			fireEvent.click(
				screen.getByRole('button', { name: /create new version/i })
			);

			await waitFor(() => {
				expect(mockNotificationsShow).toHaveBeenCalledWith(
					expect.objectContaining({
						title: 'Error',
						message: 'Failed to create new schema version',
					})
				);
				expect(onSuccess).not.toHaveBeenCalled();
			});
		});
	});

	describe('Schema fields management', () => {
		it('renders one field by default in create mode', () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const fieldNameInputs = screen.getAllByPlaceholderText('e.g., firstName');
			expect(fieldNameInputs).toHaveLength(1);
		});

		it('adds a new field when Add Field button is clicked', () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const addFieldButton = screen.getByRole('button', { name: /add field/i });
			fireEvent.click(addFieldButton);

			const fieldNameInputs = screen.getAllByPlaceholderText('e.g., firstName');
			expect(fieldNameInputs).toHaveLength(2);
		});

		it('validates camelCase format for field names', async () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			// Fill in the field name with invalid format
			const fieldNameInput = screen.getByPlaceholderText('e.g., firstName');
			fireEvent.change(fieldNameInput, { target: { value: 'InvalidName' } });

			// Should show validation error for camelCase
			await waitFor(() => {
				expect(screen.getByText('Must be camelCase')).toBeInTheDocument();
			});
		});

		it('removes a field when the remove button is clicked', () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			const addFieldButton = screen.getByRole('button', { name: /add field/i });
			fireEvent.click(addFieldButton);

			expect(screen.getAllByPlaceholderText('e.g., firstName')).toHaveLength(2);

			const removeButtons = screen.getAllByRole('button', {
				name: 'Remove field',
			});
			fireEvent.click(removeButtons[0]);

			expect(screen.getAllByPlaceholderText('e.g., firstName')).toHaveLength(1);
		});

		it('updates field type and array flag before submitting', async () => {
			renderWithProviders(
				<CampaignSchemasForm onSuccess={onSuccess} onCancel={onCancel} />
			);

			fillBaseForm();

			const typeSelect = screen.getByLabelText('Field type');
			fireEvent.click(typeSelect);
			fireEvent.click(screen.getByText('Number'));

			const arrayCheckbox = screen.getByLabelText('Is Array');
			fireEvent.click(arrayCheckbox);

			fireEvent.click(screen.getByRole('button', { name: /create/i }));

			await waitFor(() => {
				expect(mockCreateSchema).toHaveBeenCalledWith(
					expect.objectContaining({
						schemaFields: [
							expect.objectContaining({
								type: 'number',
								isArray: true,
							}),
						],
					})
				);
			});
		});
	});
});
