import React, { useState, useMemo } from 'react';
import {
	TextInput,
	Textarea,
	Button,
	Stack,
	Group,
	Text,
	FileInput,
} from '@mantine/core';
import { IconFile, IconUpload } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCreateKnowledgeBase } from '~/queries/knowledgeBaseQueries';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import {
	isValidUrl,
	normalizeUrl,
	inferType,
} from '~/modules/knowledge-bases/utils';
import { useTranslation } from 'react-i18next';

interface KnowledgeBaseWizardFormProps {
	onSuccess: (createdKb: KnowledgeBaseModel) => void;
	onCancel: () => void;
}

const KnowledgeBaseWizardForm: React.FC<KnowledgeBaseWizardFormProps> = ({
	onSuccess,
	onCancel,
}) => {
	const createMutation = useCreateKnowledgeBase();
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
	const [file, setFile] = useState<File | null>(null);

	const form = useForm({
		initialValues: {
			name: '',
			description: '',
			content: '',
		},
		validate: {
			name: (value) =>
				!value.trim()
					? t('wizard.knowledgeBase.form.name.errorRequired')
					: null,
		},
	});

	// Infer the type based on current input
	const inferredType = useMemo(
		() => inferType(form.values.content, file),
		[form.values.content, file]
	);

	// Determine what the content represents based on inferred type
	const contentInfo = useMemo(() => {
		if (file) {
			return {
				label: t('wizard.knowledgeBase.contentInfo.fileLabel'),
				type: 'file' as const,
			};
		}
		if (isValidUrl(form.values.content)) {
			return {
				label: t('wizard.knowledgeBase.contentInfo.urlDetected'),
				type: 'url' as const,
			};
		}
		if (form.values.content.trim()) {
			return {
				label: t('wizard.knowledgeBase.contentInfo.textLabel'),
				type: 'text' as const,
			};
		}
		return null;
	}, [form.values.content, file, t]);

	const canSave = useMemo(() => {
		if (!form.values.name.trim()) return false;
		// Need either file or content
		if (!file && !form.values.content.trim()) return false;
		return true;
	}, [form.values.name, form.values.content, file]);

	const handleSubmit = async (values: typeof form.values) => {
		if (!canSave || !inferredType) return;

		try {
			const isUrl = inferredType === KnowledgeBaseType.URL;

			const result = await createMutation.mutateAsync({
				name: values.name.trim(),
				description: values.description.trim(),
				type: inferredType,
				// Normalize URL by adding https:// if missing
				sourceUrl: isUrl ? normalizeUrl(values.content) : undefined,
				textContent:
					inferredType === KnowledgeBaseType.TEXT
						? values.content.trim()
						: undefined,
				file: file || undefined,
			});

			notifications.show({
				title: t('wizard.knowledgeBase.notifications.successTitle'),
				message: t('wizard.knowledgeBase.notifications.successMessage'),
				color: 'green',
			});

			onSuccess(result);
		} catch {
			notifications.show({
				title: t('wizard.knowledgeBase.notifications.errorTitle'),
				message: t('wizard.knowledgeBase.notifications.errorMessage'),
				color: 'red',
			});
		}
	};

	const handleFileChange = (newFile: File | null) => {
		setFile(newFile);
		// If a file is selected, clear the text content since file takes priority
		if (newFile) {
			form.setFieldValue('content', '');
		}
	};

	const isSaving = createMutation.status === 'pending';

	const handleFormSubmit = (
		event: React.FormEvent,
		values: typeof form.values
	) => {
		event.preventDefault();
		event.stopPropagation();
		handleSubmit(values);
	};

	return (
		<form
			onSubmit={(event) =>
				form.onSubmit((values) => handleFormSubmit(event, values))(event)
			}
		>
			<Stack gap='xs'>
				<TextInput
					label={t('wizard.knowledgeBase.form.name.label')}
					placeholder={t('wizard.knowledgeBase.form.name.placeholder')}
					{...form.getInputProps('name')}
					required
					disabled={isSaving}
					size='sm'
				/>

				<Textarea
					label={t('wizard.knowledgeBase.form.description.label')}
					placeholder={t('wizard.knowledgeBase.form.description.placeholder')}
					{...form.getInputProps('description')}
					autosize
					minRows={2}
					disabled={isSaving}
					size='sm'
				/>

				<Textarea
					label={t('wizard.knowledgeBase.form.content.label')}
					placeholder={t('wizard.knowledgeBase.form.content.placeholder')}
					{...form.getInputProps('content')}
					autosize
					minRows={4}
					disabled={isSaving || !!file}
					description={
						file
							? t('wizard.knowledgeBase.form.content.descriptionWithFile')
							: t('wizard.knowledgeBase.form.content.description')
					}
					size='sm'
				/>

				<FileInput
					label={t('wizard.knowledgeBase.form.file.label')}
					placeholder={t('wizard.knowledgeBase.form.file.placeholder')}
					value={file}
					onChange={handleFileChange}
					accept='.pdf,application/pdf'
					leftSection={<IconFile size={16} />}
					rightSection={<IconUpload size={16} />}
					clearable
					description={
						form.values.content.trim()
							? t('wizard.knowledgeBase.form.file.descriptionWithContent')
							: t('wizard.knowledgeBase.form.file.description')
					}
					disabled={isSaving || !!form.values.content.trim()}
					size='sm'
				/>

				{contentInfo && (
					<Text size='sm' c='dimmed'>
						{contentInfo.type === 'file' && file && (
							<>
								📄{' '}
								<strong>
									{t('wizard.knowledgeBase.contentInfo.fileLabel')}:
								</strong>{' '}
								{file.name}
							</>
						)}
						{contentInfo.type === 'url' && (
							<>
								🔗{' '}
								<strong>
									{t('wizard.knowledgeBase.contentInfo.urlDetected')}:
								</strong>{' '}
								{t('wizard.knowledgeBase.contentInfo.urlDescription')}
							</>
						)}
						{contentInfo.type === 'text' && (
							<>
								📝{' '}
								<strong>
									{t('wizard.knowledgeBase.contentInfo.textLabel')}:
								</strong>{' '}
								{t('wizard.knowledgeBase.contentInfo.textDescription')}
							</>
						)}
					</Text>
				)}
			</Stack>

			<Group justify='flex-end' mt='sm' gap='xs'>
				<Button
					variant='default'
					onClick={onCancel}
					disabled={isSaving}
					size='sm'
				>
					{t('wizard.knowledgeBase.actions.cancel')}
				</Button>
				<Button type='submit' loading={isSaving} disabled={!canSave} size='sm'>
					{t('wizard.knowledgeBase.actions.create')}
				</Button>
			</Group>
		</form>
	);
};

export default KnowledgeBaseWizardForm;
