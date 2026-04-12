import {
	Modal,
	TextInput,
	Switch,
	Button,
	Group,
	Stack,
	Divider,
} from '@mantine/core';
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
	isAbandoned: boolean;
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
			isAbandoned: false,
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
			isAbandoned: initialValues?.isAbandoned ?? false,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialValues]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={title || t('form.defaultTitle')}
			centered
			size='lg'
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap='md'>
					<Stack gap='xs'>
						<TextInput
							label={t('form.fields.name')}
							required
							{...form.getInputProps('name')}
						/>
						<TextInput
							label={t('form.fields.description')}
							{...form.getInputProps('description')}
						/>
					</Stack>
					<Divider />
					<Stack gap='xs'>
						<Switch
							label={t('form.fields.doNotCall')}
							description={t('form.fields.doNotCallDescription')}
							{...form.getInputProps('doNotCall', { type: 'checkbox' })}
						/>
						<Switch
							label={t('form.fields.isAbandoned')}
							description={t('form.fields.isAbandonedDescription')}
							{...form.getInputProps('isAbandoned', { type: 'checkbox' })}
						/>
						<Switch
							label={t('form.fields.invalidatesNumber')}
							{...form.getInputProps('isInvalidatesNumber', {
								type: 'checkbox',
							})}
						/>
						<Switch
							label={t('form.fields.requiresReschedule')}
							{...form.getInputProps('requiresReschedule', {
								type: 'checkbox',
							})}
						/>
					</Stack>
					<Divider />
					<Stack gap='xs'>
						<Switch
							label={t('form.fields.isFinal')}
							{...form.getInputProps('isFinal', { type: 'checkbox' })}
						/>
						<Switch
							label={t('form.fields.isVoiceMail')}
							{...form.getInputProps('isVoiceMail', { type: 'checkbox' })}
						/>
					</Stack>
					<Group justify='flex-end' gap='xs'>
						<Button size='sm' variant='default' onClick={onClose} type='button'>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
						<Button size='sm' type='submit'>
							{t('actions.save', { ns: 'common' })}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default DispositionNodeForm;
