import { Modal, TextInput, Checkbox, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useEffect } from 'react';

export type DispositionNodeFormValues = {
	name: string;
	description?: string;
	isInvalidatesNumber: boolean;
	doNotCall: boolean;
	requiresReschedule: boolean;
	isFinal: boolean;
	isVoiceMail: boolean;
};

interface DispositionNodeFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: DispositionNodeFormValues) => void;
	initialValues?: Partial<DispositionNode>;
	title?: string;
}

const DispositionNodeForm: React.FC<DispositionNodeFormProps> = ({
	opened,
	onClose,
	onSubmit,
	initialValues,
	title,
}) => {
	const { t } = useTranslation('outcomes');
	const form = useForm<DispositionNodeFormValues>({
		initialValues: {
			name: '',
			description: '',
			isInvalidatesNumber: false,
			doNotCall: false,
			requiresReschedule: false,
			isFinal: false,
			isVoiceMail: false,
			...initialValues,
		},
	});

	useEffect(() => {
		form.setValues({
			name: initialValues?.name || '',
			description: initialValues?.description || '',
			isInvalidatesNumber: initialValues?.isInvalidatesNumber || false,
			doNotCall:
				initialValues?.doNotCall ?? initialValues?.do_not_call ?? false,
			requiresReschedule: initialValues?.requiresReschedule || false,
			isFinal: initialValues?.isFinal || false,
			isVoiceMail:
				initialValues?.isVoiceMail ?? initialValues?.is_voice_mail ?? false,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialValues]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={title || t('form.defaultTitle')}
			centered
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<TextInput
					label={t('form.fields.name')}
					required
					size='sm'
					{...form.getInputProps('name')}
					mb='sm'
				/>
				<TextInput
					label={t('form.fields.description')}
					size='sm'
					{...form.getInputProps('description')}
					mb='sm'
				/>
				<Checkbox
					label={t('form.fields.invalidatesNumber')}
					size='sm'
					{...form.getInputProps('isInvalidatesNumber', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label={t('form.fields.doNotCall')}
					description={t('form.fields.doNotCallDescription')}
					size='sm'
					{...form.getInputProps('doNotCall', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label={t('form.fields.requiresReschedule')}
					size='sm'
					{...form.getInputProps('requiresReschedule', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label={t('form.fields.isFinal')}
					size='sm'
					{...form.getInputProps('isFinal', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label={t('form.fields.isVoiceMail')}
					size='sm'
					{...form.getInputProps('isVoiceMail', { type: 'checkbox' })}
					mb='md'
				/>
				<Group justify='flex-end' gap='xs'>
					<Button size='sm' variant='default' onClick={onClose} type='button'>
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button size='sm' type='submit'>
						{t('actions.save', { ns: 'common' })}
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default DispositionNodeForm;
