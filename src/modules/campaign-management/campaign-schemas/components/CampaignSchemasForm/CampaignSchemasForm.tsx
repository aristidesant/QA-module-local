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
	Collapse,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconPlus,
	IconTrash,
	IconAlertCircle,
	IconChevronRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
import ObjectivePickerPanel from '~/modules/campaign-management/CampaignManagementPage/components/ObjectivePickerPanel';
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

// Helper function to generate code from name
const generateCode = (name: string) => {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '-');
};

const CampaignSchemasForm: React.FC<CampaignSchemasFormProps> = ({
	schema,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation('campaign-management');
	const isEditing = !!schema;
	const createSchema = useCreateCampaignContactSchema();
	const updateSchema = useUpdateCampaignContactSchema();
	const [objectivePickerOpen, setObjectivePickerOpen] = useState(false);

	// Get objectives for the select
	const { data: objectivesResponse } = useGetCampaignObjectives();
	const objectives = objectivesResponse?.data || [];

	// State for version creation modal
	const [showVersionModal, setShowVersionModal] = useState(false);
	const [pendingUpdateData, setPendingUpdateData] = useState<null | {
		name: string;
		icon: string;
		objectiveId: string;
		description: string;
		fields: SchemaField[];
	}>(null);

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

	const fieldTypeOptions = [
		{ value: 'string', label: t('setup.schemas.form.fieldTypes.text') },
		{ value: 'number', label: t('setup.schemas.form.fieldTypes.number') },
		{ value: 'boolean', label: t('setup.schemas.form.fieldTypes.boolean') },
		{ value: 'date', label: t('setup.schemas.form.fieldTypes.date') },
	];

	const form = useForm({
		initialValues: {
			name: schema?.name || '',
			icon: schema?.icon || '',
			objectiveId: schema?.objectiveId?.toString() || '',
			description: schema?.description || '',
		},
		validate: {
			name: (value) =>
				!value ? t('setup.schemas.form.validation.nameRequired') : null,
			objectiveId: (value) =>
				!value ? t('setup.schemas.form.validation.objectiveRequired') : null,
		},
	});

	const validateFieldNames = () => {
		const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
		const invalidFields: string[] = [];

		schemaFields.forEach((field, index) => {
			if (!field.name) {
				invalidFields.push(
					t('setup.schemas.form.validation.fieldNameRequired', {
						index: index + 1,
					})
				);
			} else if (!camelCaseRegex.test(field.name)) {
				invalidFields.push(
					t('setup.schemas.form.validation.fieldNameFormat', {
						index: index + 1,
						name: field.name,
					})
				);
			}
		});

		return invalidFields;
	};

	const getErrorMessage = (error: unknown) => {
		if (!error || typeof error !== 'object') return '';
		const response = (error as { response?: { data?: { message?: string } } })
			.response;
		if (response?.data?.message) return response.data.message;
		if (
			'message' in error &&
			typeof (error as { message?: string }).message === 'string'
		) {
			return (error as { message?: string }).message ?? '';
		}
		return '';
	};

	const handleSubmit = async (values: typeof form.values) => {
		// Validate field names before submission
		const fieldNameErrors = validateFieldNames();
		if (fieldNameErrors.length > 0) {
			notifications.show({
				title: t('setup.schemas.form.validation.invalidFieldNamesTitle'),
				message: (
					<div>
						{fieldNameErrors.map((error, idx) => (
							<div key={idx}>{error}</div>
						))}
					</div>
				),
				color: 'red',
				autoClose: 8000,
			});
			return;
		}

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
					title: t('status.success', { ns: 'common' }),
					message: t('setup.schemas.notifications.updateSuccess'),
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
					title: t('status.success', { ns: 'common' }),
					message: t('setup.schemas.notifications.createSuccess'),
					color: 'green',
				});
				onSuccess();
			}
		} catch (error: unknown) {
			// Check if the error is due to schema being in use
			const errorMessage = getErrorMessage(error);
			const isSchemaInUseError =
				errorMessage.includes('in use') ||
				errorMessage.includes('being used') ||
				errorMessage.includes('assigned to') ||
				errorMessage.includes('cannot be edited') ||
				errorMessage.includes('running campaign') ||
				errorMessage.includes('existing contact data') ||
				(error as { response?: { status?: number } })?.response?.status === 409; // Conflict status

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
					title: t('status.error', { ns: 'common' }),
					message:
						errorMessage ||
						t(
							isEditing
								? 'setup.schemas.notifications.updateError'
								: 'setup.schemas.notifications.createError'
						),
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
				title: t('status.success', { ns: 'common' }),
				message: t('setup.schemas.notifications.versionSuccess'),
				color: 'green',
			});

			setShowVersionModal(false);
			setPendingUpdateData(null);
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('setup.schemas.notifications.versionError'),
				color: 'red',
			});
		}
	};

	const isLoading = createSchema.isPending || updateSchema.isPending;

	const selectedObjectiveName =
		objectives.find(
			(objective) => objective.id.toString() === form.values.objectiveId
		)?.name || '';

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

	const isFieldNameValid = (name: string) => {
		if (!name) return true; // Empty is handled by required validation
		const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
		return camelCaseRegex.test(name);
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='md'>
				<TextInput
					label={t('setup.schemas.form.name.label')}
					placeholder={t('setup.schemas.form.name.placeholder')}
					required
					{...form.getInputProps('name')}
				/>

				<TextInput
					label={t('setup.schemas.form.icon.label')}
					placeholder={t('setup.schemas.form.icon.placeholder')}
					{...form.getInputProps('icon')}
				/>

				<TextInput
					label={t('setup.schemas.form.objective.label')}
					placeholder={t('setup.schemas.form.objective.placeholder')}
					required
					readOnly
					value={selectedObjectiveName}
					error={form.errors.objectiveId}
					rightSection={
						<ActionIcon
							variant='subtle'
							size='sm'
							type='button'
							aria-label={t('setup.schemas.form.objective.browseAria')}
							onClick={() => setObjectivePickerOpen((v) => !v)}
						>
							<IconChevronRight size={16} />
						</ActionIcon>
					}
					onClick={() => setObjectivePickerOpen(true)}
				/>

				<Collapse in={objectivePickerOpen}>
					<ObjectivePickerPanel
						selectedObjectiveId={
							form.values.objectiveId
								? parseInt(form.values.objectiveId, 10)
								: null
						}
						onSelect={(objective) => {
							form.setFieldValue('objectiveId', objective.id.toString());
							setObjectivePickerOpen(false);
						}}
						onClose={() => setObjectivePickerOpen(false)}
					/>
				</Collapse>

				<Textarea
					label={t('setup.schemas.form.description.label')}
					placeholder={t('setup.schemas.form.description.placeholder')}
					rows={3}
					{...form.getInputProps('description')}
				/>

				<div>
					<Group justify='space-between' mb='sm'>
						<Text fw={500} size='sm'>
							{t('setup.schemas.form.fields.title')}
						</Text>
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							type='button'
							onClick={addField}
						>
							{t('setup.schemas.form.fields.add')}
						</Button>
					</Group>

					<Stack gap='xs'>
						{schemaFields.map((field, index) => (
							<div key={index} className={styles.fieldRow}>
								<Group gap='sm' align='flex-start' wrap='nowrap'>
									<div className={styles.fieldCol}>
										<TextInput
											label={t('setup.schemas.form.fields.name.label')}
											placeholder={t(
												'setup.schemas.form.fields.name.placeholder'
											)}
											required
											value={field.name}
											onChange={(event) =>
												updateField(index, { name: event.currentTarget.value })
											}
											error={
												field.name && !isFieldNameValid(field.name)
													? t('setup.schemas.form.fields.name.error')
													: undefined
											}
										/>
									</div>
									<div className={styles.fieldCol}>
										<TextInput
											label={t('setup.schemas.form.fields.label.label')}
											placeholder={t(
												'setup.schemas.form.fields.label.placeholder'
											)}
											required
											value={field.label}
											onChange={(event) =>
												updateField(index, { label: event.currentTarget.value })
											}
										/>
									</div>
									<div className={styles.typeSelect}>
										<Select
											label={t('setup.schemas.form.fields.type.label')}
											data={fieldTypeOptions}
											required
											aria-label={t('setup.schemas.form.fields.type.ariaLabel')}
											value={field.type}
											onChange={(value) =>
												updateField(index, { type: value as any })
											}
										/>
									</div>
									<div className={styles.checkboxWrapper}>
										<Checkbox
											label={t('setup.schemas.form.fields.isArray')}
											checked={field.isArray}
											onChange={(event) =>
												updateField(index, {
													isArray: event.currentTarget.checked,
												})
											}
										/>
									</div>
									{schemaFields.length > 1 && (
										<div className={styles.deleteButtonWrapper}>
											<ActionIcon
												color='red'
												variant='subtle'
												aria-label={t('setup.schemas.form.fields.removeField')}
												onClick={() => removeField(index)}
											>
												<IconTrash size={16} />
											</ActionIcon>
										</div>
									)}
								</Group>
							</div>
						))}
					</Stack>
				</div>

				<Group justify='flex-end' gap='sm' className={styles.actions}>
					<Button
						variant='subtle'
						type='button'
						onClick={onCancel}
						disabled={isLoading}
					>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button
						type='submit'
						loading={isLoading}
						className={styles.submitButton}
					>
						{t(
							isEditing
								? 'setup.schemas.form.actions.update'
								: 'setup.schemas.form.actions.create'
						)}
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
						<Text fw={600}>{t('setup.schemas.form.versionModal.title')}</Text>
					</Group>
				}
				size='md'
				centered
			>
				<Stack gap='md'>
					<Text size='sm' c='dimmed'>
						{t('setup.schemas.form.versionModal.description')}
					</Text>
					<Text size='sm' fw={500}>
						{t('setup.schemas.form.versionModal.details')}
					</Text>

					<Group justify='flex-end' gap='sm' mt='md'>
						<Button
							variant='subtle'
							type='button'
							onClick={() => {
								setShowVersionModal(false);
								setPendingUpdateData(null);
							}}
							disabled={createSchema.isPending}
						>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
						<Button
							type='button'
							onClick={handleCreateNewVersion}
							loading={createSchema.isPending}
						>
							{t('setup.schemas.form.versionModal.create')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</form>
	);
};

export default CampaignSchemasForm;
