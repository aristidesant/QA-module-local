import { Modal, TextInput, Checkbox, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
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
	title = 'Outcome Node',
}) => {
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
		<Modal opened={opened} onClose={onClose} title={title} centered>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<TextInput
					label='Name'
					required
					size='sm'
					{...form.getInputProps('name')}
					mb='sm'
				/>
				<TextInput
					label='Description'
					size='sm'
					{...form.getInputProps('description')}
					mb='sm'
				/>
				<Checkbox
					label='Invalidates Number'
					size='sm'
					{...form.getInputProps('isInvalidatesNumber', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Do not call'
					description='If selected, this client should not be called again after this outcome.'
					size='sm'
					{...form.getInputProps('doNotCall', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Requires Reschedule'
					size='sm'
					{...form.getInputProps('requiresReschedule', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Is Final'
					size='sm'
					{...form.getInputProps('isFinal', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Is Voice Mail'
					size='sm'
					{...form.getInputProps('isVoiceMail', { type: 'checkbox' })}
					mb='md'
				/>
				<Group justify='flex-end' gap='xs'>
					<Button size='sm' variant='default' onClick={onClose} type='button'>
						Cancel
					</Button>
					<Button size='sm' type='submit'>
						Save
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default DispositionNodeForm;
