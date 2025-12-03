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

interface KnowledgeBaseWizardFormProps {
	onSuccess: (createdKb: KnowledgeBaseModel) => void;
	onCancel: () => void;
}

const KnowledgeBaseWizardForm: React.FC<KnowledgeBaseWizardFormProps> = ({
	onSuccess,
	onCancel,
}) => {
	const createMutation = useCreateKnowledgeBase();
	const [file, setFile] = useState<File | null>(null);

	const form = useForm({
		initialValues: {
			name: '',
			description: '',
			content: '',
		},
		validate: {
			name: (value) => (!value.trim() ? 'Name is required' : null),
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
			return { label: 'File selected', type: 'file' as const };
		}
		if (isValidUrl(form.values.content)) {
			return { label: 'URL detected', type: 'url' as const };
		}
		if (form.values.content.trim()) {
			return { label: 'Text content', type: 'text' as const };
		}
		return null;
	}, [form.values.content, file]);

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
				title: 'Success',
				message: 'Knowledge base created successfully',
				color: 'green',
			});

			onSuccess(result);
		} catch {
			notifications.show({
				title: 'Error',
				message: 'Failed to create knowledge base',
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
			<Stack gap='sm'>
				<TextInput
					label='Name'
					placeholder='e.g., Product FAQs'
					{...form.getInputProps('name')}
					required
					disabled={isSaving}
				/>

				<Textarea
					label='Description'
					placeholder='Short internal note about this knowledge base'
					{...form.getInputProps('description')}
					autosize
					minRows={2}
					disabled={isSaving}
				/>

				<Textarea
					label='Content'
					placeholder='Paste a URL or text content here...'
					{...form.getInputProps('content')}
					autosize
					minRows={4}
					disabled={isSaving || !!file}
					description={
						file
							? 'Remove the file above to enter text or URL instead'
							: 'Paste a URL to fetch content from a webpage, or enter text directly'
					}
				/>

				<FileInput
					label='Or upload a file'
					placeholder='Choose a PDF file or drop it here'
					value={file}
					onChange={handleFileChange}
					accept='.pdf,application/pdf'
					leftSection={<IconFile size={16} />}
					rightSection={<IconUpload size={16} />}
					clearable
					description={
						form.values.content.trim()
							? 'Clear the text above to upload a file instead'
							: 'Supported: PDF. Max 25MB.'
					}
					disabled={isSaving || !!form.values.content.trim()}
				/>

				{contentInfo && (
					<Text size='sm' c='dimmed'>
						{contentInfo.type === 'file' && file && (
							<>
								📄 <strong>File:</strong> {file.name}
							</>
						)}
						{contentInfo.type === 'url' && (
							<>
								🔗 <strong>URL detected:</strong> Content will be fetched from
								the provided link
							</>
						)}
						{contentInfo.type === 'text' && (
							<>
								📝 <strong>Text content:</strong> Will be used as-is
							</>
						)}
					</Text>
				)}
			</Stack>

			<Group justify='flex-end' mt='md'>
				<Button variant='default' onClick={onCancel} disabled={isSaving}>
					Cancel
				</Button>
				<Button type='submit' loading={isSaving} disabled={!canSave}>
					Create Knowledge Base
				</Button>
			</Group>
		</form>
	);
};

export default KnowledgeBaseWizardForm;
