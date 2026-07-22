import {
	Button,
	Group,
	Stack,
	Switch,
	TextInput,
	Textarea,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal as FormModal } from '@mantine/core';
import type { ErrorTypeFormValues } from '../../ErrorTypesPage.types';
import classes from './ErrorTypeFormModal.module.css';

export interface ErrorTypeFormModalProps {
	opened: boolean;
	onClose: () => void;
	title: string;
	form: UseFormReturnType<ErrorTypeFormValues>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	saving: boolean;
}

export default function ErrorTypeFormModal({
	opened,
	onClose,
	title,
	form,
	onSubmit,
	saving,
}: ErrorTypeFormModalProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<FormModal onClose={onClose} opened={opened} size='md' title={title}>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<TextInput
						label={t('errorTypes.fields.code')}
						maxLength={50}
						placeholder={t('errorTypes.fields.codePlaceholder')}
						size='sm'
						{...form.getInputProps('code')}
						onChange={(event) =>
							form.setFieldValue(
								'code',
								event.currentTarget.value.toUpperCase()
							)
						}
					/>
					<TextInput
						label={t('errorTypes.fields.label')}
						maxLength={150}
						size='sm'
						{...form.getInputProps('label')}
					/>
					<Textarea
						autosize
						label={t('errorTypes.fields.description')}
						maxLength={500}
						minRows={3}
						size='sm'
						{...form.getInputProps('description')}
					/>
					<Switch
						label={t('errorTypes.fields.active')}
						size='sm'
						{...form.getInputProps('isActive', { type: 'checkbox' })}
					/>
					<Group className={classes.drawerFooter} justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('actions.cancel')}
						</Button>
						<Button loading={saving} size='sm' type='submit'>
							{t('actions.save')}
						</Button>
					</Group>
				</Stack>
			</form>
		</FormModal>
	);
}
