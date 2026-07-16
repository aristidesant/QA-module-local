import {
	Alert,
	Button,
	FileInput,
	Group,
	Stack,
	Textarea,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertTriangle, IconFileImport } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal as FormModal } from '@mantine/core';
import type { ImportTemplateFormValues } from '../../FormsListPage.types';

export interface ImportTemplateModalProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<ImportTemplateFormValues>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onFileChange: (file: File | null) => void;
	errorTypesError: boolean;
	errorTypesLoading: boolean;
	importing: boolean;
}

export default function ImportTemplateModal({
	opened,
	onClose,
	form,
	onSubmit,
	onFileChange,
	errorTypesError,
	errorTypesLoading,
	importing,
}: ImportTemplateModalProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<FormModal
			onClose={onClose}
			opened={opened}
			size='lg'
			title={t('template.importTitle')}
		>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<Alert
						color='blue'
						icon={<IconFileImport size={16} />}
						variant='light'
					>
						{t('template.importDescription')}
					</Alert>
					{errorTypesError ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={16} />}
							variant='light'
						>
							{t('errorTypes.states.importUnavailable')}
						</Alert>
					) : null}
					<FileInput
						accept='application/json,.json'
						clearable
						error={form.errors.templateFile}
						label={t('template.fields.file')}
						onChange={onFileChange}
						placeholder={t('template.fields.filePlaceholder')}
						size='sm'
						value={form.values.templateFile}
					/>
					<Textarea
						autosize
						error={form.errors.templateJson}
						label={t('template.fields.json')}
						minRows={12}
						onChange={(event) =>
							form.setFieldValue('templateJson', event.currentTarget.value)
						}
						placeholder={t('template.fields.jsonPlaceholder')}
						size='sm'
						value={form.values.templateJson}
					/>
					<Group justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('actions.cancel')}
						</Button>
						<Button
							disabled={errorTypesError}
							leftSection={<IconFileImport size={16} />}
							loading={importing || errorTypesLoading}
							size='sm'
							type='submit'
						>
							{t('template.importSubmit')}
						</Button>
					</Group>
				</Stack>
			</form>
		</FormModal>
	);
}
