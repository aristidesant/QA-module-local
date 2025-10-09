import React, { useState } from 'react';
import {
	Button,
	Group,
	Stack,
	TextInput,
	Textarea,
	Select,
	Text,
	ActionIcon,
	Checkbox,
	Modal,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import {
	useCreateCampaignContactSchema,
	useUpdateCampaignContactSchema,
} from '~/queries/campaignContactSchemasQueries';
import { useGetCampaignObjectives } from '~/queries/campaignObjectivesQueries';
import {
	CampaignContactSchema,
	CreateCampaignContactSchemaRequest,
	UpdateCampaignContactSchemaRequest,
} from '~/models/CampaignContactSchemaModel';
import styles from './CampaignSchemasForm.module.css';

interface CampaignSchemasFormProps {
	schema?: CampaignContactSchema;
	onSuccess: () => void;
	onCancel: () => void;
}

interface SchemaField {
	name: string;
	label: string;
	type:
		| 'string'
		| 'number'
		| 'boolean'
		| 'date'
		| 'email'
		| 'phone'
		| 'address';
	isArray: boolean;
}

const fieldTypeOptions = [
	{ value: 'string', label: 'Text' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'date', label: 'Date' },
];

// Helper function to generate code from name
const generateCode = (name: string) => {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '-');
};

export const CampaignSchemasForm: React.FC<CampaignSchemasFormProps> = ({
	schema,
	onSuccess,
	onCancel,
}) => {
	const isEditing = !!schema;
	const createSchema = useCreateCampaignContactSchema();
	const updateSchema = useUpdateCampaignContactSchema();

	// Get objectives for the select
	const { data: objectivesResponse } = useGetCampaignObjectives();
	const objectives = objectivesResponse?.data || [];

	// State for version creation modal
	const [showVersionModal, setShowVersionModal] = useState(false);
	const [pendingUpdateData, setPendingUpdateData] = useState<any>(null);

	const [schemaFields, setSchemaFields] = useState<SchemaField[]>(
		schema?.schemaFields || [
			{
				name: '',
				label: '',
				type: 'string',
				isArray: false,
			},
		]
	);

	const form = useForm({
		initialValues: {
			name: schema?.name || '',
			icon: schema?.icon || '',
			objectiveId: schema?.objectiveId?.toString() || '',
			description: schema?.description || '',
		},
		validate: {
			name: (value) => (!value ? 'Name is required' : null),
			objectiveId: (value) => (!value ? 'Objective is required' : null),
		},
	});

	const handleSubmit = async (values: typeof form.values) => {
		try {
			const code = generateCode(values.name);

			if (isEditing) {
				const updateData: UpdateCampaignContactSchemaRequest = {
					name: values.name,
					icon: values.icon,
					objectiveId: parseInt(values.objectiveId),
					description: values.description,
					schemaFields: schemaFields,
				};
				await updateSchema.mutateAsync({
					id: schema.id,
					data: updateData,
				});
				notifications.show({
					title: 'Success',
					message: 'Campaign schema updated successfully',
					color: 'green',
				});
				onSuccess();
			} else {
				const createData: CreateCampaignContactSchemaRequest = {
					name: values.name,
					code: code,
					icon: values.icon,
					objectiveId: parseInt(values.objectiveId),
					description: values.description,
					schemaFields: schemaFields,
				};
				await createSchema.mutateAsync(createData);
				notifications.show({
					title: 'Success',
					message: 'Campaign schema created successfully',
					color: 'green',
				});
				onSuccess();
			}
		} catch (error: any) {
			// Check if the error is due to schema being in use
			const errorMessage =
				error?.response?.data?.message || error?.message || '';
			const isSchemaInUseError =
				errorMessage.includes('in use') ||
				errorMessage.includes('being used') ||
				errorMessage.includes('assigned to') ||
				errorMessage.includes('cannot be edited') ||
				errorMessage.includes('running campaign') ||
				error?.response?.status === 409; // Conflict status

			if (isEditing && isSchemaInUseError) {
				// Store the update data to use when creating new version
				setPendingUpdateData({
					name: values.name,
					icon: values.icon,
					objectiveId: values.objectiveId,
					description: values.description,
					fields: schemaFields,
				});
				setShowVersionModal(true);
			} else {
				notifications.show({
					title: 'Error',
					message: `Failed to ${isEditing ? 'update' : 'create'} campaign schema`,
					color: 'red',
				});
			}
		}
	};

	const handleCreateNewVersion = async () => {
		if (!pendingUpdateData || !schema) return;

		try {
			// Create a new version with the updated data
			const newVersionData: CreateCampaignContactSchemaRequest = {
				name: `${pendingUpdateData.name} (v${(schema.version || 1) + 1})`,
				code:
					generateCode(pendingUpdateData.name) +
					`-v${(schema.version || 1) + 1}`,
				icon: pendingUpdateData.icon,
				objectiveId: parseInt(pendingUpdateData.objectiveId),
				description: pendingUpdateData.description,
				schemaFields: pendingUpdateData.fields,
			};

			await createSchema.mutateAsync(newVersionData);

			notifications.show({
				title: 'Success',
				message: 'New schema version created successfully',
				color: 'green',
			});

			setShowVersionModal(false);
			setPendingUpdateData(null);
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to create new schema version',
				color: 'red',
			});
		}
	};

	const isLoading = createSchema.isPending || updateSchema.isPending;

	// Transform objectives for select options - grouped by category
	const objectiveOptions = React.useMemo(() => {
		// Group objectives by category
		const grouped = objectives.reduce(
			(acc, objective) => {
				const categoryName = objective.category?.name || 'Uncategorized';
				if (!acc[categoryName]) {
					acc[categoryName] = [];
				}
				acc[categoryName].push({
					value: objective.id.toString(),
					label: objective.name,
				});
				return acc;
			},
			{} as Record<string, Array<{ value: string; label: string }>>
		);

		// Convert to Mantine grouped select format
		return Object.entries(grouped).map(([group, items]) => ({
			group,
			items,
		}));
	}, [objectives]);

	const addField = () => {
		setSchemaFields([
			...schemaFields,
			{
				name: '',
				label: '',
				type: 'string',
				isArray: false,
			},
		]);
	};

	const removeField = (index: number) => {
		if (schemaFields.length > 1) {
			setSchemaFields(schemaFields.filter((_, i) => i !== index));
		}
	};

	const updateField = (index: number, field: Partial<SchemaField>) => {
		const updated = [...schemaFields];
		updated[index] = { ...updated[index], ...field };
		setSchemaFields(updated);
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='md'>
				<TextInput
					label='Name'
					placeholder='Enter schema name'
					required
					{...form.getInputProps('name')}
				/>

				<TextInput
					label='Icon'
					placeholder='Enter icon name (e.g., credit-card)'
					{...form.getInputProps('icon')}
				/>

				<Select
					label='Objective'
					placeholder='Select an objective'
					required
					data={objectiveOptions}
					{...form.getInputProps('objectiveId')}
				/>

				<Textarea
					label='Description'
					placeholder='Enter schema description (optional)'
					rows={3}
					{...form.getInputProps('description')}
				/>

				<div>
					<Group justify='space-between' mb='sm'>
						<Text fw={500} size='sm'>
							Schema Fields
						</Text>
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							onClick={addField}
						>
							Add Field
						</Button>
					</Group>

					<Stack gap='sm'>
						{schemaFields.map((field, index) => (
							<div key={index} className={styles.fieldRow}>
								<Group gap='sm' align='flex-end'>
									<TextInput
										label='Field Name'
										placeholder='e.g., firstName'
										required
										style={{ flex: 1 }}
										value={field.name}
										onChange={(event) =>
											updateField(index, { name: event.currentTarget.value })
										}
									/>
									<TextInput
										label='Field Label'
										placeholder='e.g., First Name'
										required
										style={{ flex: 1 }}
										value={field.label}
										onChange={(event) =>
											updateField(index, { label: event.currentTarget.value })
										}
									/>
									<Select
										label='Type'
										data={fieldTypeOptions}
										required
										style={{ minWidth: 120 }}
										value={field.type}
										onChange={(value) =>
											updateField(index, { type: value as any })
										}
									/>
									<Checkbox
										label='Is Array'
										checked={field.isArray}
										onChange={(event) =>
											updateField(index, {
												isArray: event.currentTarget.checked,
											})
										}
									/>
									{schemaFields.length > 1 && (
										<ActionIcon
											color='red'
											variant='subtle'
											onClick={() => removeField(index)}
											mb='xs'
										>
											<IconTrash size={16} />
										</ActionIcon>
									)}
								</Group>
							</div>
						))}
					</Stack>
				</div>

				<Group justify='flex-end' gap='sm' className={styles.actions}>
					<Button variant='subtle' onClick={onCancel} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						type='submit'
						loading={isLoading}
						className={styles.submitButton}
					>
						{isEditing ? 'Update' : 'Create'}
					</Button>
				</Group>
			</Stack>

			{/* Version Creation Modal */}
			<Modal
				opened={showVersionModal}
				onClose={() => {
					setShowVersionModal(false);
					setPendingUpdateData(null);
				}}
				title={
					<Group gap='xs'>
						<IconAlertCircle size={20} color='var(--mantine-color-orange-6)' />
						<Text fw={600}>Schema In Use</Text>
					</Group>
				}
				size='md'
				centered
			>
				<Stack gap='md'>
					<Text size='sm' c='dimmed'>
						This schema is currently being used in an active campaign with
						assigned data and cannot be edited directly.
					</Text>
					<Text size='sm' fw={500}>
						We can create a new version of this schema with your changes. The
						new version will be available for use while the current version
						remains unchanged in the running campaign.
					</Text>

					<Group justify='flex-end' gap='sm' mt='md'>
						<Button
							variant='subtle'
							onClick={() => {
								setShowVersionModal(false);
								setPendingUpdateData(null);
							}}
							disabled={createSchema.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreateNewVersion}
							loading={createSchema.isPending}
						>
							Create New Version
						</Button>
					</Group>
				</Stack>
			</Modal>
		</form>
	);
};
