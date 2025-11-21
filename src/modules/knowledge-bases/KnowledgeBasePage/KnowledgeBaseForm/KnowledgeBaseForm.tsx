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
} from '@tabler/icons-react';
import FormSelect from '~/components/ui/FormSelect/FormSelect';
import {
	useCreateKnowledgeBase,
	useKnowledgeBase,
	useUpdateKnowledgeBase,
} from '~/queries/knowledgeBaseQueries';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
import styles from './KnowledgeBaseForm.module.css';

interface Props {
	id?: number;
}

type FormValues = {
	name: string;
	description: string;
	type: KnowledgeBaseType | '';
	sourceUrl: string;
	textContent: string;
	file: File | null;
};

const KnowledgeBaseForm = ({ id }: Props = {}) => {
	const clearRight = useKnowledgeBaseStore((s) => s.clearRightComponent);
	const createMutation = useCreateKnowledgeBase();
	const updateMutation = useUpdateKnowledgeBase();
	const { data: kb, isLoading } = useKnowledgeBase(id);

	const hasExistingFile = useMemo(
		() => Boolean(kb?.file || kb?.fileId),
		[kb?.file, kb?.fileId]
	);
	const hasExistingText = useMemo(
		() => Boolean(kb?.textContent?.trim()),
		[kb?.textContent]
	);

	const form = useForm<FormValues>({
		initialValues: {
			name: '',
			description: '',
			type: '',
			sourceUrl: '',
			textContent: '',
			file: null,
		},
		validate: (values) => {
			const errors: Partial<Record<keyof FormValues, string>> = {};

			if (!values.name.trim()) {
				errors.name = 'Name is required.';
			}

			if (!values.type) {
				errors.type = 'Select how you will provide content.';
			}

			if (values.type === KnowledgeBaseType.URL) {
				if (!values.sourceUrl) {
					errors.sourceUrl = 'Please enter a URL.';
				} else {
					try {
						// eslint-disable-next-line no-new
						new URL(values.sourceUrl);
					} catch {
						errors.sourceUrl =
							'Enter a valid URL (e.g., https://example.com/docs).';
					}
				}
			}

			if (values.type === KnowledgeBaseType.FILE && !hasExistingFile) {
				if (!values.file) {
					errors.file = 'Upload a PDF to continue.';
				}
			}

			if (values.type === KnowledgeBaseType.TEXT && !hasExistingText) {
				if (!values.textContent.trim() && !values.file) {
					errors.textContent = 'Add text or upload a .txt/.md file.';
				}
			}

			return errors;
		},
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (!kb) return;
		form.setValues({
			name: kb.name ?? '',
			description: kb.description ?? '',
			type: kb.type ?? '',
			sourceUrl: kb.sourceUrl ?? '',
			textContent: kb.textContent ?? '',
			file: null,
		});
		form.resetDirty();
		// Do not set file from server value; file is only for new upload
		// form object is stable; dependency on form triggers unnecessary reruns
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

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			const payload = {
				name: values.name.trim(),
				description: values.description.trim(),
				type: values.type || undefined,
				sourceUrl: values.sourceUrl || undefined,
				textContent: values.textContent || undefined,
				file: values.file || undefined,
			};

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

	// compute status label/color to show on top header as requested
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
							Name this base and choose how its content will be ingested.
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

					<FormSelect
						label='Type'
						placeholder='Select a content source'
						value={form.values.type ?? ''}
						onChange={(v) => {
							const nextType = (v as KnowledgeBaseType) ?? '';
							form.setFieldValue('type', nextType);
							form.setFieldValue('sourceUrl', '');
							form.setFieldValue('textContent', '');
							form.setFieldValue('file', null);
						}}
						data={[
							{ value: KnowledgeBaseType.FILE, label: 'File (PDF)' },
							{ value: KnowledgeBaseType.URL, label: 'URL' },
							{ value: KnowledgeBaseType.TEXT, label: 'Text (paste/upload)' },
						]}
						disabled={isLoading}
						error={form.errors.type}
						className={styles.fullWidth}
					/>
				</Stack>

				<Divider
					label='Content source'
					labelPosition='left'
					className={styles.divider}
				/>

				<Stack gap='sm' className={styles.section}>
					<Box className={styles.hint}>
						<Text size='xs' c='dimmed'>
							Use a live URL for public docs, upload a PDF, or paste text to
							train your agent. Choose the option that best matches your
							content.
						</Text>
					</Box>

					{form.values.type === KnowledgeBaseType.URL && (
						<TextInput
							label='Source URL'
							placeholder='https://example.com/docs/article'
							leftSection={<IconWorldWww size={16} />}
							description='Publicly accessible page to fetch content from.'
							disabled={isLoading}
							{...form.getInputProps('sourceUrl')}
						/>
					)}

					{form.values.type === KnowledgeBaseType.TEXT && (
						<Textarea
							label='Text Content'
							placeholder='Paste relevant text here...'
							autosize
							minRows={4}
							disabled={isLoading}
							{...form.getInputProps('textContent')}
						/>
					)}

					{!id &&
						(form.values.type === KnowledgeBaseType.FILE ||
							form.values.type === KnowledgeBaseType.TEXT) && (
							<Box>
								<FileInput
									label={
										form.values.type === KnowledgeBaseType.FILE
											? 'Upload file'
											: 'Optional: Upload text file'
									}
									placeholder={
										form.values.type === KnowledgeBaseType.FILE
											? 'Choose a file or drop it here'
											: 'Attach a .txt or .md (optional)'
									}
									value={form.values.file}
									onChange={(value) => form.setFieldValue('file', value)}
									accept={
										form.values.type === KnowledgeBaseType.FILE
											? '.pdf,application/pdf'
											: '.txt,text/plain,.md'
									}
									leftSection={<IconFile size={16} />}
									rightSection={<IconUpload size={16} />}
									clearable
									error={form.errors.file}
									description={
										form.values.type === KnowledgeBaseType.FILE
											? 'Supported: PDF. Max 25MB.'
											: 'Supported: TXT/MD. You can also paste text above.'
									}
									disabled={isLoading}
								/>
								{form.values.file && (
									<Text size='sm' mt='xs' c='dimmed'>
										Selected: {form.values.file.name}
									</Text>
								)}
							</Box>
						)}
				</Stack>

				<Divider
					label='Notes'
					labelPosition='left'
					className={styles.divider}
				/>

				<Textarea
					label='Description'
					placeholder='Short internal note about this knowledge base'
					autosize
					minRows={3}
					disabled={isLoading}
					{...form.getInputProps('description')}
				/>

				{id && kb?.type === KnowledgeBaseType.FILE && (
					<Box className={styles.metaCard}>
						<Text className={styles.metaLabel}>Current file</Text>
						<Text className={styles.metaValue}>
							{form.values.file?.name ?? kb?.file?.name ?? 'No file uploaded'}
						</Text>
					</Box>
				)}

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
