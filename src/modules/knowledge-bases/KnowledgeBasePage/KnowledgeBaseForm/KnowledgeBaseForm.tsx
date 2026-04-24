import { useEffect, useMemo } from 'react';
import {
	Paper,
	TextInput,
	Textarea,
	Button,
	Stack,
	Group,
	Text,
	Badge,
	FileInput,
	Box,
	Alert,
	Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconFile,
	IconUpload,
	IconWorldWww,
	IconInfoCircle,
	IconFileText,
	IconLink,
	IconWriting,
	IconFilePencil,
} from '@tabler/icons-react';
import {
	useCreateKnowledgeBase,
	useKnowledgeBase,
	useUpdateKnowledgeBase,
} from '~/queries/knowledgeBaseQueries';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import { isValidUrl, normalizeUrl, inferType } from '../../utils';
import styles from './KnowledgeBaseForm.module.css';
import { usePermissions } from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useTranslation } from 'react-i18next';

// Re-export utils for backward compatibility with tests
export { isValidUrl, normalizeUrl, inferType } from '../../utils';

interface Props {
	id?: number;
}

type FormValues = {
	name: string;
	description: string;
	content: string;
	file: File | null;
};

const KnowledgeBaseForm = ({ id }: Props = {}) => {
	const closeDrawer = useKnowledgeBaseStore((s) => s.closeDrawer);
	const { t } = useTranslation('knowledge-bases');
	const { canPerformAction } = usePermissions();
	const createMutation = useCreateKnowledgeBase();
	const updateMutation = useUpdateKnowledgeBase();
	const { data: kb, isLoading } = useKnowledgeBase(id);

	// Track if editing an existing knowledge base
	const isEditMode = Boolean(id);
	const canCreate = canPerformAction(
		ModuleEnum.KNOWLEDGE_BASES,
		PermissionEnum.CREATE
	);
	const canUpdate = canPerformAction(
		ModuleEnum.KNOWLEDGE_BASES,
		PermissionEnum.UPDATE
	);
	const isReadOnly = isEditMode ? !canUpdate : !canCreate;

	const form = useForm<FormValues>({
		initialValues: {
			name: '',
			description: '',
			content: '',
			file: null,
		},
		validate: (values) => {
			const errors: Partial<Record<keyof FormValues, string>> = {};

			if (!values.name.trim()) {
				errors.name = t('form.fields.name.required');
			}

			// In edit mode, content is not required (existing content is preserved)
			if (!isEditMode) {
				const detectedType = inferType(values.content, values.file);
				if (!detectedType) {
					errors.content = t('form.fields.content.required');
				}
			}

			// Validate URL format if content looks like a URL
			if (values.content.trim() && isValidUrl(values.content)) {
				try {
					// Normalize URL before validating (add https:// if missing)
					new URL(normalizeUrl(values.content));
				} catch {
					errors.content = t('form.fields.content.invalidUrl');
				}
			}

			return errors;
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	// Infer type from current form values
	const detectedType = useMemo(
		() => inferType(form.values.content, form.values.file),
		[form.values.content, form.values.file]
	);

	// In edit mode, use existing type; otherwise use inferred type
	const effectiveType = isEditMode && kb?.type ? kb.type : detectedType;

	// Mutual exclusivity: disable textarea if file is selected, disable file input if content is entered
	const hasContent = Boolean(form.values.content.trim());
	const hasFile = Boolean(form.values.file);

	useEffect(() => {
		if (!kb) return;
		// Populate content based on existing type
		let initialContent = '';
		if (kb.type === KnowledgeBaseType.URL) {
			initialContent = kb.sourceUrl ?? '';
		} else if (kb.type === KnowledgeBaseType.TEXT) {
			initialContent = kb.textContent ?? '';
		}
		// For FILE type, content stays empty (file is shown in metadata)

		form.setValues({
			name: kb.name ?? '',
			description: kb.description ?? '',
			content: initialContent,
			file: null,
		});
		form.resetDirty();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [kb]);

	const parseError = (error: unknown) => {
		if (!error) return null;
		if (typeof error === 'string') return error;
		if (error instanceof Error) return error.message;
		const maybeAxios = error as {
			response?: { data?: { message?: unknown } };
		};
		if (typeof maybeAxios?.response?.data?.message === 'string') {
			return maybeAxios.response.data.message;
		}
		return t('form.alerts.saveError');
	};

	const handleFileChange = (file: File | null) => {
		form.setFieldValue('file', file);
		// Clear content when file is selected (mutual exclusivity)
		if (file) {
			form.setFieldValue('content', '');
		}
	};

	const handleContentChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		const value = event.target.value;
		form.setFieldValue('content', value);
		// Clear file when content is entered (mutual exclusivity)
		if (value.trim() && form.values.file) {
			form.setFieldValue('file', null);
		}
	};

	const handleSubmit = form.onSubmit(async (values) => {
		if (isReadOnly) return;
		try {
			const type = effectiveType || inferType(values.content, values.file);

			const payload: {
				name: string;
				description: string;
				type?: KnowledgeBaseType;
				sourceUrl?: string;
				textContent?: string;
				file?: File;
			} = {
				name: values.name.trim(),
				description: values.description.trim(),
				type: type || undefined,
			};

			// Set appropriate field based on detected type
			if (values.file) {
				payload.file = values.file;
			} else if (type === KnowledgeBaseType.URL) {
				// Normalize URL to ensure it has https:// prefix
				payload.sourceUrl = normalizeUrl(values.content);
			} else if (type === KnowledgeBaseType.TEXT) {
				payload.textContent = values.content.trim();
			}

			if (id) {
				await updateMutation.mutateAsync({
					id: Number(id),
					data: payload,
				});
			} else {
				await createMutation.mutateAsync(payload);
			}
			closeDrawer();
		} catch (err) {
			// Errors handled via mutation state and alert
		}
	});

	const isSaving =
		createMutation?.status === 'pending' ||
		updateMutation?.status === 'pending';

	// Compute status label/color for header
	const headerStatus = (() => {
		const label = (kb?.status ??
			(form.values.file ? 'PENDING' : 'INACTIVE')) as string;
		const colorMap: Record<string, string> = {
			PENDING: 'yellow',
			UPLOADING: 'blue',
			ACTIVE: 'green',
			FAILED: 'red',
			INACTIVE: 'gray',
		};
		const color = colorMap[label] ?? 'blue';
		return { label, color } as const;
	})();

	// Type indicator for visual feedback
	const typeIndicator = useMemo(() => {
		if (isEditMode && kb?.type) {
			const typeLabels: Record<
				KnowledgeBaseType,
				{ icon: React.ReactNode; label: string; color: string }
			> = {
				[KnowledgeBaseType.FILE]: {
					icon: <IconFilePencil size={14} />,
					label: t('form.typeIndicator.file'),
					color: 'blue',
				},
				[KnowledgeBaseType.URL]: {
					icon: <IconLink size={14} />,
					label: t('form.typeIndicator.url'),
					color: 'green',
				},
				[KnowledgeBaseType.TEXT]: {
					icon: <IconWriting size={14} />,
					label: t('form.typeIndicator.text'),
					color: 'gray',
				},
			};
			return typeLabels[kb.type] ?? null;
		}
		if (!detectedType) return null;
		const typeLabels: Record<
			KnowledgeBaseType,
			{ icon: React.ReactNode; label: string; color: string }
		> = {
			[KnowledgeBaseType.FILE]: {
				icon: <IconFilePencil size={14} />,
				label: t('form.typeIndicator.fileDetected'),
				color: 'blue',
			},
			[KnowledgeBaseType.URL]: {
				icon: <IconLink size={14} />,
				label: t('form.typeIndicator.urlDetected'),
				color: 'green',
			},
			[KnowledgeBaseType.TEXT]: {
				icon: <IconWriting size={14} />,
				label: t('form.typeIndicator.textDetected'),
				color: 'gray',
			},
		};
		return typeLabels[detectedType];
	}, [detectedType, isEditMode, kb?.type, t]);

	const mutationError = parseError(
		createMutation.error ?? updateMutation.error
	);

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<div className={styles.statusRow}>
				<Badge color={headerStatus.color} size='sm' variant='light'>
					{headerStatus.label}
				</Badge>
			</div>
			{mutationError && (
				<Alert
					color='red'
					icon={<IconInfoCircle size={16} />}
					className={styles.alert}
				>
					{mutationError}
				</Alert>
			)}
			{isReadOnly && (
				<Alert
					color='gray'
					icon={<IconInfoCircle size={16} />}
					className={styles.alert}
				>
					{t('form.alerts.readOnly')}
				</Alert>
			)}

			<Paper withBorder radius='md' p='md' className={styles.sectionCard}>
				<Stack gap='sm' className={styles.section}>
					<div className={styles.sectionHeader}>
						<Text className={styles.sectionTitle}>
							{t('form.sections.basics.title')}
						</Text>
					</div>
					<Text className={styles.sectionDescription}>
						{t('form.sections.basics.description')}
					</Text>
					<div className={styles.fieldGrid}>
						<TextInput
							label={t('form.fields.name.label')}
							placeholder={t('form.fields.name.placeholder')}
							required
							disabled={isLoading || isReadOnly}
							withAsterisk
							{...form.getInputProps('name')}
							size='sm'
						/>
						<Textarea
							className={styles.descriptionField}
							label={t('form.fields.description.label')}
							placeholder={t('form.fields.description.placeholder')}
							autosize
							minRows={3}
							disabled={isLoading || isReadOnly}
							{...form.getInputProps('description')}
							size='sm'
						/>
					</div>
				</Stack>
			</Paper>

			<Paper withBorder radius='md' p='md' className={styles.sectionCard}>
				<Stack gap='sm' className={styles.section}>
					<div className={styles.sectionHeader}>
						<Text className={styles.sectionTitle}>
							{t('form.sections.content.divider')}
						</Text>
						{typeIndicator && (
							<Badge
								size='sm'
								variant='light'
								color={typeIndicator.color}
								leftSection={typeIndicator.icon}
							>
								{typeIndicator.label}
							</Badge>
						)}
					</div>
					<Text className={styles.sectionDescription}>
						{t('form.sections.content.hint')}
					</Text>

					<Textarea
						label={t('form.fields.content.label')}
						placeholder={t('form.fields.content.placeholder')}
						leftSection={
							detectedType === KnowledgeBaseType.URL ? (
								<IconWorldWww size={16} />
							) : (
								<IconFileText size={16} />
							)
						}
						autosize
						minRows={4}
						disabled={isLoading || hasFile || isReadOnly}
						value={form.values.content}
						onChange={handleContentChange}
						error={form.errors.content}
						description={
							hasFile
								? t('form.fields.content.descriptionWithFile')
								: t('form.fields.content.description')
						}
						size='sm'
					/>

					{!isEditMode && (
						<Box>
							<FileInput
								label={t('form.fields.file.label')}
								placeholder={t('form.fields.file.placeholder')}
								value={form.values.file}
								onChange={handleFileChange}
								accept='.pdf,application/pdf,.txt,text/plain,.md'
								leftSection={<IconFile size={16} />}
								rightSection={<IconUpload size={16} />}
								clearable
								error={form.errors.file}
								description={
									hasContent
										? t('form.fields.file.descriptionWithContent')
										: t('form.fields.file.description')
								}
								disabled={isLoading || hasContent || isReadOnly}
								size='sm'
							/>
							{form.values.file && (
								<Text size='sm' mt='xs' c='dimmed' className={styles.fileMeta}>
									{t('form.fileMeta.selected', {
										name: form.values.file.name,
									})}
								</Text>
							)}
						</Box>
					)}

					{isEditMode && kb?.type === KnowledgeBaseType.FILE && (
						<Box className={styles.metaCard}>
							<Text className={styles.metaLabel}>
								{t('form.fileMeta.currentLabel')}
							</Text>
							<Text className={styles.metaValue}>
								{kb?.file?.name ?? t('form.fileMeta.none')}
							</Text>
						</Box>
					)}
				</Stack>
			</Paper>

			<Divider className={styles.divider} />

			<Group justify='flex-end' className={styles.actions} gap='xs'>
				<Button
					variant='default'
					onClick={closeDrawer}
					disabled={isSaving}
					size='sm'
				>
					{t('form.actions.cancel')}
				</Button>
				{!isReadOnly && (
					<Button
						type='submit'
						loading={isSaving}
						disabled={!form.isValid() || isLoading}
						size='sm'
					>
						{t('form.actions.save')}
					</Button>
				)}
			</Group>
		</form>
	);
};

export default KnowledgeBaseForm;
