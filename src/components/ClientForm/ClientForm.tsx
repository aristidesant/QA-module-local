import React from 'react';
import {
	Stack,
	TextInput,
	Textarea,
	Button,
	Group,
	NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import type { CreateClientRequest } from '~/models/ClientModel';
import { useCreateClient } from '~/queries/clientQueries';
import styles from './ClientForm.module.css';

interface ClientFormProps {
	onClose: () => void;
	onSuccess?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
	onClose,
	onSuccess,
}) => {
	const createClientMutation = useCreateClient();

	const form = useForm<CreateClientRequest>({
		initialValues: {
			name: '',
			description: '',
			email: '',
			phone: '',
			address: '',
			rnc: '',
			userId: null,
			countryId: null,
			apiKey: '',
		},
		validate: {
			name: (value) =>
				!value || value.trim().length === 0 ? 'Client name is required' : null,
			email: (value) =>
				value && !/^\S+@\S+$/.test(value) ? 'Invalid email format' : null,
		},
	});

	const handleSubmit = async (values: CreateClientRequest) => {
		try {
			await createClientMutation.mutateAsync(values);
			notifications.show({
				title: 'Success',
				message: 'Client created successfully!',
				color: 'green',
			});
			form.reset();
			onSuccess?.();
			onClose();
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: 'Failed to create client. Please try again.',
				color: 'red',
			});
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={styles.form}>
			<Stack gap='md'>
				<TextInput
					label='Client Name'
					placeholder='Enter client name'
					required
					{...form.getInputProps('name')}
				/>

				<Textarea
					label='Description'
					placeholder='Enter client description'
					rows={3}
					{...form.getInputProps('description')}
				/>

				<TextInput
					label='Email'
					placeholder='Enter client email'
					type='email'
					{...form.getInputProps('email')}
				/>

				<TextInput
					label='Phone'
					placeholder='Enter client phone'
					{...form.getInputProps('phone')}
				/>

				<Textarea
					label='Address'
					placeholder='Enter client address'
					rows={2}
					{...form.getInputProps('address')}
				/>

				<TextInput
					label='RNC'
					placeholder='Enter client RNC'
					{...form.getInputProps('rnc')}
				/>

				<NumberInput
					label='User ID'
					placeholder='Enter user ID'
					{...form.getInputProps('userId')}
				/>

				<NumberInput
					label='Country ID'
					placeholder='Enter country ID'
					{...form.getInputProps('countryId')}
				/>

				<TextInput
					label='API Key'
					placeholder='Enter API key'
					{...form.getInputProps('apiKey')}
				/>

				<Group justify='flex-end' mt='md'>
					<Button
						variant='default'
						onClick={onClose}
						leftSection={<IconX size={16} />}
					>
						Cancel
					</Button>
					<Button
						type='submit'
						loading={createClientMutation.isPending}
						leftSection={<IconDeviceFloppy size={16} />}
					>
						{createClientMutation.isPending ? 'Creating...' : 'Create Client'}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};

export default ClientForm;
