import React from 'react';
import {
	Box,
	Button,
	Grid,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import type { CreateClientRequest } from '~/models/ClientModel';
import { useCreateClient } from '~/queries/clientQueries';
import { useGetCountries } from '~/queries/countryQueries';
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
	const { data: countries, isLoading: isCountriesLoading } = useGetCountries();

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
			email: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Email is required';
				}
				if (!/^\S+@\S+$/.test(value)) {
					return 'Invalid email format';
				}
				return null;
			},
			apiKey: (value) =>
				!value || value.trim().length === 0 ? 'API Key is required' : null,
			description: (value) =>
				!value || value.trim().length === 0 ? 'Description is required' : null,
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
			<Grid gutter='xl' className={styles.columns}>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Box className={styles.section}>
						<div className={styles.sectionHeader}>
							<Text className={styles.sectionTitle}>Required Information</Text>
							<Text className={styles.sectionDescription}>
								Fill in the essentials to create the client profile.
							</Text>
						</div>

						<Stack gap='md'>
							<TextInput
								label='Client Name'
								placeholder='Enter client name'
								required
								{...form.getInputProps('name')}
							/>

							<TextInput
								label='Email'
								placeholder='client@example.com'
								type='email'
								required
								{...form.getInputProps('email')}
							/>

							<TextInput
								label='API Key'
								placeholder='Enter API key'
								required
								{...form.getInputProps('apiKey')}
							/>

							<Textarea
								label='Description'
								placeholder='Enter a brief description of the client'
								minRows={6}
								required
								className={styles.descriptionInput}
								{...form.getInputProps('description')}
							/>
						</Stack>
					</Box>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<Box className={styles.section}>
						<div className={styles.sectionHeader}>
							<Text className={styles.sectionTitle}>Additional Details</Text>
							<Text className={styles.sectionDescription}>
								Optional contact information and identifiers.
							</Text>
						</div>

						<Stack gap='md'>
							<TextInput
								label='Phone'
								placeholder='+1 (555) 000-0000'
								{...form.getInputProps('phone')}
							/>

							<TextInput
								label='RNC'
								placeholder='Enter client RNC'
								{...form.getInputProps('rnc')}
							/>

							<Textarea
								label='Address'
								placeholder='Enter client address'
								minRows={3}
								{...form.getInputProps('address')}
							/>

							<Select
								label='Country'
								placeholder='Select country'
								required
								data={
									countries?.map((country) => ({
										value: country.id.toString(),
										label: country.name,
									})) ?? []
								}
								disabled={isCountriesLoading}
								searchable
								nothingFoundMessage='No countries found'
								value={
									form.values.countryId !== null
										? form.values.countryId?.toString()
										: null
								}
								onChange={(value) => {
									form.setFieldValue('countryId', value ? Number(value) : null);
								}}
								error={form.errors.countryId}
							/>
						</Stack>
					</Box>
				</Grid.Col>

				<Grid.Col span={12}>
					<Group justify='space-between' className={styles.actions}>
						<Text className={styles.actionsHint}>
							Check the information before saving to avoid manual corrections
							later.
						</Text>

						<Group gap='sm'>
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
								{createClientMutation.isPending
									? 'Creating...'
									: 'Create Client'}
							</Button>
						</Group>
					</Group>
				</Grid.Col>
			</Grid>
		</form>
	);
};

export default ClientForm;
