import {
	Button,
	Group,
	Stack,
	Switch,
	TextInput,
	Textarea,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal as FormModal } from '@mantine/core';
import type { CreateFormPayload } from '~/models/qa';

export interface CreateFormModalProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<CreateFormPayload>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	saving: boolean;
}

export default function CreateFormModal({
	opened,
	onClose,
	form,
	onSubmit,
	saving,
}: CreateFormModalProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<FormModal
			onClose={onClose}
			opened={opened}
			size='md'
			title={t('create.title')}
		>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<TextInput
						label={t('fields.name')}
						placeholder={t('fields.namePlaceholder')}
						size='sm'
						{...form.getInputProps('name')}
					/>
					<TextInput
						label={t('fields.category')}
						placeholder={t('fields.categoryPlaceholder')}
						size='sm'
						{...form.getInputProps('category')}
					/>
					<Textarea
						autosize
						label={t('fields.description')}
						minRows={3}
						placeholder={t('fields.descriptionPlaceholder')}
						size='sm'
						{...form.getInputProps('description')}
					/>
					<Switch
						label={t('fields.active')}
						size='sm'
						{...form.getInputProps('isActive', {
							type: 'checkbox',
						})}
					/>
					<Group justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('actions.cancel')}
						</Button>
						<Button
							leftSection={<IconPlus size={16} />}
							loading={saving}
							size='sm'
							type='submit'
						>
							{t('create.submit')}
						</Button>
					</Group>
				</Stack>
			</form>
		</FormModal>
	);
}
