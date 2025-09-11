import { Modal, TextInput, Checkbox, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useEffect } from 'react';

export type DispositionNodeFormValues = {
	name: string;
	description?: string;
	isInvalidatesNumber: boolean;
	requiresReschedule: boolean;
	isFinal: boolean;
	isActive: boolean;
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
			requiresReschedule: false,
			isFinal: false,
			isActive: true,
			isVoiceMail: false,
			...initialValues,
		},
	});

	useEffect(() => {
		form.setValues({
			name: initialValues?.name || '',
			description: initialValues?.description || '',
			isInvalidatesNumber: initialValues?.isInvalidatesNumber || false,
			requiresReschedule: initialValues?.requiresReschedule || false,
			isFinal: initialValues?.isFinal || false,
			isActive: initialValues?.isActive ?? true,
			isVoiceMail:
				(initialValues as any)?.isVoiceMail ??
				(initialValues as any)?.is_voice_mail ??
				false,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialValues]);

	return (
		<Modal opened={opened} onClose={onClose} title={title} centered>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<TextInput
					label='Name'
					required
					{...form.getInputProps('name')}
					mb='sm'
				/>
				<TextInput
					label='Description'
					{...form.getInputProps('description')}
					mb='sm'
				/>
				<Checkbox
					label='Invalidates Number'
					{...form.getInputProps('isInvalidatesNumber', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Requires Reschedule'
					{...form.getInputProps('requiresReschedule', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Is Final'
					{...form.getInputProps('isFinal', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Is Voice Mail'
					{...form.getInputProps('isVoiceMail', { type: 'checkbox' })}
					mb='xs'
				/>
				<Checkbox
					label='Active'
					{...form.getInputProps('isActive', { type: 'checkbox' })}
					mb='md'
				/>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose} type='button'>
						Cancel
					</Button>
					<Button type='submit'>Save</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default DispositionNodeForm;
