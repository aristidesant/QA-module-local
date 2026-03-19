import { useRef, useState } from 'react';
import {
	ActionIcon,
	Anchor,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	BulkUploadCsvResult,
	CreateDictionaryParams,
} from '~/models/PronunciationDictionaryModel';
import { useCreateDictionary } from '~/queries/pronunciationDictionaryQueries';
import { bulkUploadCsvRules } from '~/api/pronunciationDictionaryApi';
import CsvResultsModal from '../CsvResultsModal';
import styles from './CsvUploadModal.module.css';

const CSV_TEMPLATE_HEADERS =
	'grapheme,ruleType,phoneme,alias,locale,description,category\n';

const CSV_TEMPLATE_EXAMPLE = [
	'José,ALIAS,,Ho-seh,es-MX,Spanish given name,NAME',
	'García,ALIAS,,Gar-see-ah,es-MX,Spanish surname,LAST_NAME',
	'Jalisco,ALIAS,,Ha-lees-koh,es-MX,Mexican state,PROVINCE',
].join('\n');

function downloadCsvTemplate() {
	const content = CSV_TEMPLATE_HEADERS + CSV_TEMPLATE_EXAMPLE;
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'pronunciation-rules-template.csv';
	link.click();
	URL.revokeObjectURL(url);
}

export type CsvUploadMode = 'create-and-upload' | 'upload-only';

interface CsvUploadModalProps {
	mode: CsvUploadMode;
	dictionaryId?: number;
	opened: boolean;
	onClose: () => void;
	onSuccess: (createdDictionaryId?: number) => void;
}

interface UploadFormValues {
	name: string;
	description: string;
	file: File | null;
}

export default function CsvUploadModal({
	mode,
	dictionaryId,
	opened,
	onClose,
	onSuccess,
}: CsvUploadModalProps) {
	const { t } = useTranslation('dictionary-rules');
	const createDictionary = useCreateDictionary();
	const [isUploading, setIsUploading] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const [uploadResult, setUploadResult] = useState<BulkUploadCsvResult | null>(
		null
	);
	const [resultsOpened, setResultsOpened] = useState(false);
	const createdDictionaryIdRef = useRef<number | undefined>(undefined);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<UploadFormValues>({
		initialValues: { name: '', description: '', file: null },
		validate: {
			name: (value) =>
				mode === 'create-and-upload' && !value.trim()
					? t('dictionary.nameRequired')
					: null,
			file: (value) => (!value ? t('upload.fileRequired') : null),
		},
	});

	// ── Dropzone handlers ──

	const handleDropzoneClick = () => fileInputRef.current?.click();

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => setIsDragOver(false);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			form.setFieldValue('file', file);
			form.clearFieldError('file');
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		form.setFieldValue('file', file);
		if (file) form.clearFieldError('file');
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleClearFile = (e: React.MouseEvent) => {
		e.stopPropagation();
		form.setFieldValue('file', null);
	};

	// ── Form handlers ──

	const handleClose = () => {
		form.reset();
		onClose();
	};

	const handleSubmit = async (values: UploadFormValues) => {
		if (!values.file) return;

		setIsUploading(true);
		try {
			let targetId = dictionaryId;

			if (mode === 'create-and-upload') {
				const dictParams: CreateDictionaryParams = {
					name: values.name.trim(),
					...(values.description
						? { description: values.description.trim() }
						: {}),
				};
				const created = await createDictionary.mutateAsync(dictParams);
				targetId = created.id;
				createdDictionaryIdRef.current = created.id;
			}

			if (!targetId) {
				notifications.show({
					title: t('upload.notifications.createError'),
					message: t('upload.notifications.createError'),
					color: 'red',
				});
				return;
			}

			const result = await bulkUploadCsvRules(targetId, values.file);
			setUploadResult(result);
			setResultsOpened(true);
			form.reset();
			onClose();
		} catch {
			notifications.show({
				title: t('upload.notifications.uploadError'),
				message: t('upload.notifications.uploadError'),
				color: 'red',
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleResultsClose = () => {
		setResultsOpened(false);
		setUploadResult(null);
		onSuccess(createdDictionaryIdRef.current);
		createdDictionaryIdRef.current = undefined;
	};

	const handleNavigateToDictionary = () => {
		handleResultsClose();
	};

	const isCreateMode = mode === 'create-and-upload';
	const title = isCreateMode
		? t('upload.createTitle')
		: t('upload.uploadTitle');
	const submitLabel = isCreateMode
		? t('upload.createAndUpload')
		: t('upload.submit');

	const dropzoneClass = [
		styles.dropzone,
		isDragOver ? styles.dropzoneDragOver : '',
		form.errors.file ? styles.dropzoneError : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<>
			<Modal opened={opened} onClose={handleClose} title={title} size='md'>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack gap='sm'>
						{isCreateMode && (
							<>
								<TextInput
									label={t('dictionary.name')}
									placeholder={t('dictionary.namePlaceholder')}
									required
									size='sm'
									key={form.key('name')}
									{...form.getInputProps('name')}
								/>
								<Textarea
									label={t('dictionary.descriptionLabel')}
									placeholder={t('dictionary.descriptionPlaceholder')}
									size='sm'
									autosize
									minRows={2}
									key={form.key('description')}
									{...form.getInputProps('description')}
								/>
							</>
						)}

						{/* Dropzone */}
						<input
							ref={fileInputRef}
							type='file'
							accept='.csv'
							className={styles.hiddenInput}
							onChange={handleFileInputChange}
						/>
						<div
							className={dropzoneClass}
							onClick={handleDropzoneClick}
							onDragOver={handleDragOver}
							onDragEnter={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							role='button'
							tabIndex={0}
							onKeyDown={(e) => e.key === 'Enter' && handleDropzoneClick()}
						>
							{form.values.file ? (
								<div className={styles.selectedFile}>
									<IconFile size={20} color='var(--mantine-color-blue-6)' />
									<Text size='sm' fw={500}>
										{form.values.file.name}
									</Text>
									<ActionIcon
										variant='subtle'
										color='gray'
										size='sm'
										onClick={handleClearFile}
										aria-label='Remove file'
									>
										<IconX size={14} />
									</ActionIcon>
								</div>
							) : (
								<div className={styles.dropzoneInner}>
									<IconUpload
										size={32}
										stroke={1.5}
										color='var(--mantine-color-gray-6)'
									/>
									<Text size='sm' fw={600} c='dark'>
										{t('upload.dropzoneTitle')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('upload.dropzoneSubtitle')}
									</Text>
								</div>
							)}
						</div>
						{form.errors.file && (
							<Text size='xs' c='red'>
								{form.errors.file}
							</Text>
						)}

						{/* Hints */}
						<Text size='xs' c='dimmed'>
							{t('upload.formatHint')}
						</Text>
						<Anchor
							component='button'
							type='button'
							size='xs'
							className={styles.templateLink}
							onClick={downloadCsvTemplate}
						>
							<Group gap={4} align='center'>
								<IconDownload size={12} />
								{t('upload.downloadTemplate')}
							</Group>
						</Anchor>

						<Group justify='flex-end' mt='xs'>
							<Button
								variant='default'
								size='sm'
								type='button'
								onClick={handleClose}
							>
								{t('upload.cancel')}
							</Button>
							<Button
								type='submit'
								size='sm'
								loading={isUploading || createDictionary.isPending}
							>
								{submitLabel}
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>

			{uploadResult && (
				<CsvResultsModal
					result={uploadResult}
					opened={resultsOpened}
					onClose={handleResultsClose}
					onNavigate={isCreateMode ? handleNavigateToDictionary : undefined}
				/>
			)}
		</>
	);
}
