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
import { IconFile, IconUpload, IconWorldWww } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import FormSelect from '~/components/ui/FormSelect/FormSelect';
import { useCreateKnowledgeBase } from '~/queries/knowledgeBaseQueries';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';

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
			type: '' as KnowledgeBaseType | '',
			sourceUrl: '',
			textContent: '',
		},
		validate: {
			name: (value) => (!value.trim() ? 'Name is required' : null),
			type: (value) => (!value ? 'Type is required' : null),
			sourceUrl: (value, values) => {
				if (values.type !== KnowledgeBaseType.URL) return null;
				if (!value) return 'URL is required';
				try {
					new URL(value);
					return null;
				} catch {
					return 'Enter a valid URL';
				}
			},
			textContent: (value, values) => {
				if (values.type !== KnowledgeBaseType.TEXT) return null;
				if (!value.trim() && !file) return 'Text content or file is required';
				return null;
			},
		},
	});

	const fileError = useMemo(() => {
		if (form.values.type === KnowledgeBaseType.FILE) {
			return !file ? 'Please upload a file' : null;
		}
		return null;
	}, [file, form.values.type]);

	const canSave = useMemo(() => {
		if (!form.values.name.trim() || !form.values.type) return false;
		if (form.values.type === KnowledgeBaseType.URL && form.errors.sourceUrl)
			return false;
		if (form.values.type === KnowledgeBaseType.FILE && fileError) return false;
		if (
			form.values.type === KnowledgeBaseType.TEXT &&
			form.errors.textContent &&
			!file
		)
			return false;
		return true;
	}, [form.values, form.errors, fileError, file]);

	const handleSubmit = async (values: typeof form.values) => {
		if (!canSave) return;

		try {
			const result = await createMutation.mutateAsync({
				name: values.name.trim(),
				description: values.description.trim(),
				type: values.type || undefined,
				sourceUrl: values.sourceUrl || undefined,
				textContent: values.textContent || undefined,
				file: file || undefined,
			});

			notifications.show({
				title: 'Success',
				message: 'Knowledge base created successfully',
				color: 'green',
			});

			onSuccess(result);
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to create knowledge base',
				color: 'red',
			});
		}
	};

	const handleTypeChange = (value: string | null) => {
		form.setFieldValue('type', (value as KnowledgeBaseType) ?? '');
		// Reset source-specific fields when switching type
		form.setFieldValue('sourceUrl', '');
		form.setFieldValue('textContent', '');
		setFile(null);
	};

	const isSaving = createMutation.status === 'pending';

	const handleFormSubmit = (
		event: React.FormEvent,
		values: typeof form.values
	) => {
		event.preventDefault();
		event.stopPropagation(); // Prevent event from bubbling to parent form
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
					minRows={3}
					disabled={isSaving}
				/>

				<FormSelect
					label='Type'
					placeholder='Select a content source'
					value={form.values.type ?? ''}
					onChange={handleTypeChange}
					data={[
						{ value: KnowledgeBaseType.FILE, label: 'File (PDF)' },
						{ value: KnowledgeBaseType.URL, label: 'URL' },
						{ value: KnowledgeBaseType.TEXT, label: 'Text (paste/upload)' },
					]}
					disabled={isSaving}
				/>

				{form.values.type === KnowledgeBaseType.URL && (
					<TextInput
						label='Source URL'
						placeholder='https://example.com/docs/article'
						{...form.getInputProps('sourceUrl')}
						leftSection={<IconWorldWww size={16} />}
						description='Publicly accessible page to fetch content from.'
						disabled={isSaving}
						required
					/>
				)}

				{form.values.type === KnowledgeBaseType.TEXT && (
					<Textarea
						label='Text Content'
						placeholder='Paste relevant text here...'
						{...form.getInputProps('textContent')}
						autosize
						minRows={4}
						disabled={isSaving}
					/>
				)}

				{(form.values.type === KnowledgeBaseType.FILE ||
					form.values.type === KnowledgeBaseType.TEXT) && (
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
						value={file}
						onChange={setFile}
						accept={
							form.values.type === KnowledgeBaseType.FILE
								? '.pdf,application/pdf'
								: '.txt,text/plain,.md'
						}
						leftSection={<IconFile size={16} />}
						rightSection={<IconUpload size={16} />}
						clearable
						error={fileError}
						description={
							form.values.type === KnowledgeBaseType.FILE
								? 'Supported: PDF. Max 25MB.'
								: 'Supported: TXT/MD. You can also paste text above.'
						}
						disabled={isSaving}
						required={form.values.type === KnowledgeBaseType.FILE}
					/>
				)}

				{file && (
					<Text size='sm' c='dimmed' title={file.name}>
						Selected: {file.name}
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
