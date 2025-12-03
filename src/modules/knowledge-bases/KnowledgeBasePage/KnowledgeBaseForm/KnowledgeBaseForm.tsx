import { useEffect, useMemo } from 'react';
import {
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
	IconBook,
	IconInfoCircle,
	IconFileText,
} from '@tabler/icons-react';
import {
	useCreateKnowledgeBase,
	useKnowledgeBase,
	useUpdateKnowledgeBase,
} from '~/queries/knowledgeBaseQueries';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import { isValidUrl, normalizeUrl, inferType } from '../../utils';
import styles from './KnowledgeBaseForm.module.css';

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
	const clearRight = useKnowledgeBaseStore((s) => s.clearRightComponent);
	const createMutation = useCreateKnowledgeBase();
	const updateMutation = useUpdateKnowledgeBase();
	const { data: kb, isLoading } = useKnowledgeBase(id);

	// Track if editing an existing knowledge base
	const isEditMode = Boolean(id);

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
				errors.name = 'Name is required.';
			}

			// In edit mode, content is not required (existing content is preserved)
			if (!isEditMode) {
				const detectedType = inferType(values.content, values.file);
				if (!detectedType) {
					errors.content = 'Enter a URL, paste text content, or upload a file.';
				}
			}

			// Validate URL format if content looks like a URL
			if (values.content.trim() && isValidUrl(values.content)) {
				try {
					// Normalize URL before validating (add https:// if missing)
					new URL(normalizeUrl(values.content));
				} catch {
					errors.content =
						'Enter a valid URL (e.g., https://example.com/docs).';
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
		if (typeof (error as any)?.response?.data?.message === 'string') {
			return (error as any).response.data.message as string;
		}
		return 'Unable to save this knowledge base. Please try again.';
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
			clearRight();
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
			// Show existing type in edit mode
			const typeLabels: Record<
				KnowledgeBaseType,
				{ icon: string; label: string; color: string }
			> = {
				[KnowledgeBaseType.FILE]: { icon: '📄', label: 'File', color: 'blue' },
				[KnowledgeBaseType.URL]: { icon: '🔗', label: 'URL', color: 'green' },
				[KnowledgeBaseType.TEXT]: { icon: '📝', label: 'Text', color: 'gray' },
			};
			return typeLabels[kb.type] ?? null;
		}
		if (!detectedType) return null;
		const typeLabels: Record<
			KnowledgeBaseType,
			{ icon: string; label: string; color: string }
		> = {
			[KnowledgeBaseType.FILE]: {
				icon: '📄',
				label: 'File detected',
				color: 'blue',
			},
			[KnowledgeBaseType.URL]: {
				icon: '🔗',
				label: 'URL detected',
				color: 'green',
			},
			[KnowledgeBaseType.TEXT]: {
				icon: '📝',
				label: 'Text detected',
				color: 'gray',
			},
		};
		return typeLabels[detectedType];
	}, [detectedType, isEditMode, kb?.type]);

	const mutationError = parseError(
		createMutation.error ?? updateMutation.error
	);

	return (
		<RightSectionCard
			title='Knowledge Base'
			description='Add or edit a knowledge base entry for your agent.'
			icon={IconBook}
			rightSection={
				<Badge color={headerStatus.color} size='sm'>
					{headerStatus.label}
				</Badge>
			}
		>
			<form className={styles.form} onSubmit={handleSubmit}>
				{mutationError && (
					<Alert
						color='red'
						icon={<IconInfoCircle size={16} />}
						className={styles.alert}
					>
						{mutationError}
					</Alert>
				)}

				<Stack gap='sm' className={styles.section}>
					<div className={styles.sectionHeader}>
						<Text className={styles.sectionTitle}>Basics</Text>
						<Text size='xs' c='dimmed'>
							Name this knowledge base. Content type is auto-detected.
						</Text>
					</div>
					<TextInput
						label='Name'
						placeholder='e.g., Product FAQs'
						required
						disabled={isLoading}
						withAsterisk
						{...form.getInputProps('name')}
					/>
					<Textarea
						label='Description'
						placeholder='Short internal note about this knowledge base'
						autosize
						minRows={3}
						disabled={isLoading}
						{...form.getInputProps('description')}
					/>
				</Stack>

				<Divider
					label='Content source'
					labelPosition='left'
					className={styles.divider}
				/>

				<Stack gap='sm' className={styles.section}>
					<Box className={styles.hint}>
						<Group gap='xs' align='center'>
							<Text size='xs' c='dimmed'>
								Enter a URL, paste text, or upload a file. Type is detected
								automatically.
							</Text>
							{typeIndicator && (
								<Badge
									size='sm'
									variant='light'
									color={typeIndicator.color}
									leftSection={<span>{typeIndicator.icon}</span>}
								>
									{typeIndicator.label}
								</Badge>
							)}
						</Group>
					</Box>

					{/* Content textarea: URL or Text */}
					<Textarea
						label='URL or Text Content'
						placeholder='Paste a URL (https://...) or text content here...'
						leftSection={
							detectedType === KnowledgeBaseType.URL ? (
								<IconWorldWww size={16} />
							) : (
								<IconFileText size={16} />
							)
						}
						autosize
						minRows={4}
						disabled={isLoading || hasFile}
						value={form.values.content}
						onChange={handleContentChange}
						error={form.errors.content}
						description={
							hasFile
								? 'Clear the file to enter text or a URL instead.'
								: 'Enter a public URL or paste text content to train your agent.'
						}
					/>

					{/* File input: mutually exclusive with content */}
					{!isEditMode && (
						<Box>
							<FileInput
								label='Or upload a file'
								placeholder='Choose a PDF, TXT, or MD file'
								value={form.values.file}
								onChange={handleFileChange}
								accept='.pdf,application/pdf,.txt,text/plain,.md'
								leftSection={<IconFile size={16} />}
								rightSection={<IconUpload size={16} />}
								clearable
								error={form.errors.file}
								description={
									hasContent
										? 'Clear the text to upload a file instead.'
										: 'Supported: PDF, TXT, MD. Max 25MB.'
								}
								disabled={isLoading || hasContent}
							/>
							{form.values.file && (
								<Text size='sm' mt='xs' c='dimmed'>
									Selected: {form.values.file.name}
								</Text>
							)}
						</Box>
					)}

					{/* Show existing file in edit mode */}
					{isEditMode && kb?.type === KnowledgeBaseType.FILE && (
						<Box className={styles.metaCard}>
							<Text className={styles.metaLabel}>Current file</Text>
							<Text className={styles.metaValue}>
								{kb?.file?.name ?? 'No file uploaded'}
							</Text>
						</Box>
					)}
				</Stack>

				<Group justify='flex-end' className={styles.actions}>
					<Button
						variant='default'
						onClick={() => clearRight()}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						type='submit'
						loading={isSaving}
						disabled={!form.isValid() || isLoading}
					>
						Save
					</Button>
				</Group>
			</form>
		</RightSectionCard>
	);
};

export default KnowledgeBaseForm;
