import {
	Button,
	Group,
	NumberInput,
	Stack,
	TextInput,
	Textarea,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal as FormModal } from '@mantine/core';
import type { CreateFormGroupPayload } from '~/models/qa';
import classes from './GroupFormModal.module.css';

export interface GroupFormModalProps {
	opened: boolean;
	onClose: () => void;
	title: string;
	form: UseFormReturnType<CreateFormGroupPayload>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	saving: boolean;
}

export default function GroupFormModal({
	opened,
	onClose,
	title,
	form,
	onSubmit,
	saving,
}: GroupFormModalProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<FormModal onClose={onClose} opened={opened} size='md' title={title}>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<TextInput
						label={t('fields.groupName')}
						size='sm'
						{...form.getInputProps('name')}
					/>
					<Textarea
						autosize
						label={t('fields.groupDescription')}
						minRows={3}
						size='sm'
						{...form.getInputProps('description')}
					/>
					<NumberInput
						label={t('fields.sortOrder')}
						min={0}
						size='sm'
						{...form.getInputProps('sortOrder')}
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
