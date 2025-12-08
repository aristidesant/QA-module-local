import { useEffect, useMemo } from 'react';
import {
	Alert,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './ClientForm.module.css';
import {
	useCreateClient,
	useUpdateClient,
	useGetClient,
} from '~/queries/clientQueries';
import type {
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';

interface ClientFormProps {
	mode: 'create' | 'edit';
	clientId?: number;
	onSuccess: () => void;
	onCancel?: () => void;
}

interface ClientFormValues {
	name: string;
	identifier?: string;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	rnc?: string;
	userId?: number | null;
	countryId?: number | null;
}

const ClientForm: React.FC<ClientFormProps> = ({
	mode,
	clientId,
	onSuccess,
	onCancel,
}) => {
	const isEditMode = mode === 'edit';

	const form = useForm<ClientFormValues>({
		initialValues: {
			name: '',
			identifier: '',
			description: '',
			email: '',
			phone: '',
			address: '',
			rnc: '',
			userId: null,
			countryId: null,
		},
		validate: {
			name: (value) =>
				!value || value.trim().length === 0 ? 'Name is required' : null,
			email: (value) => {
				if (!value || value.trim().length === 0) {
					return null; // Email is optional
				}
				if (!/^\S+@\S+$/.test(value)) {
					return 'Invalid email format';
				}
				return null;
			},
		},
	});

	const createMutation = useCreateClient();
	const updateMutation = useUpdateClient();

	const {
		data: client,
		isLoading: isClientLoading,
		isError: isClientError,
		error: clientError,
	} = useGetClient(clientId || 0);

	useEffect(() => {
		if (isEditMode && client) {
			form.setValues({
				name: client.name,
				identifier: client.identifier,
				description: client.description || '',
				email: client.email || '',
				phone: client.phone || '',
				address: client.address || '',
				rnc: client.rnc || '',
				userId: client.userId,
				countryId: client.countryId,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditMode, client]);

	const isSubmitting = useMemo(
		() => createMutation.isPending || updateMutation.isPending,
		[createMutation.isPending, updateMutation.isPending]
	);

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			if (isEditMode) {
				if (!clientId) throw new Error('Missing client ID');
				const updatePayload: UpdateClientRequest = {
					name: values.name,
					description: values.description,
					email: values.email,
					phone: values.phone,
					address: values.address,
					rnc: values.rnc,
					userId: values.userId,
					countryId: values.countryId,
				};
				await updateMutation.mutateAsync({ id: clientId, data: updatePayload });
				notifications.show({
					title: 'Client updated',
					message: 'Client has been updated successfully',
					color: 'green',
				});
			} else {
				const createPayload: CreateClientRequest = {
					name: values.name,
					description: values.description,
					email: values.email,
					phone: values.phone,
					address: values.address,
					rnc: values.rnc,
					userId: values.userId,
					countryId: values.countryId,
				};
				await createMutation.mutateAsync(createPayload);
				notifications.show({
					title: 'Client created',
					message: 'New client has been added',
					color: 'green',
				});
				form.reset();
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Request failed',
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	if (isEditMode && isClientLoading) {
		return <Group p='md'>loading...</Group>; // Keeping it simple for now or could use Skeleton
	}

	if (isEditMode && isClientError) {
		return (
			<Alert
				icon={<IconInfoCircle size={18} />}
				title='Unable to load client'
				color='red'
			>
				{clientError instanceof Error ? clientError.message : 'Unknown error'}
			</Alert>
		);
	}

	return (
		<Paper
			component='form'
			withBorder
			radius='md'
			className={classes.form}
			onSubmit={handleSubmit}
		>
			<div className={classes.body}>
				<div className={classes.contentGrid}>
					<Stack gap='sm'>
						<section className={classes.section}>
							<div className={classes.sectionHeader}>
								<Text className={classes.sectionTitle}>Client Details</Text>
								<Text className={classes.sectionDescription}>
									Basic information about the client.
								</Text>
							</div>
							<div className={classes.row}>
								<TextInput
									required
									label='Name'
									placeholder='Client Name'
									{...form.getInputProps('name')}
								/>
								<TextInput
									label='Identifier'
									placeholder='Unique Identifier'
									{...form.getInputProps('identifier')}
								/>
							</div>
							<Textarea
								label='Description'
								placeholder='Client description'
								{...form.getInputProps('description')}
							/>
						</section>

						<section className={classes.section}>
							<div className={classes.sectionHeader}>
								<Text className={classes.sectionTitle}>Contact Info</Text>
								<Text className={classes.sectionDescription}>
									Address and communication details.
								</Text>
							</div>
							<div className={classes.row}>
								<TextInput
									label='Email'
									placeholder='contact@example.com'
									{...form.getInputProps('email')}
								/>
								<TextInput
									label='Phone'
									placeholder='+1234567890'
									{...form.getInputProps('phone')}
								/>
							</div>
							<div className={classes.row}>
								<TextInput
									label='Address'
									placeholder='123 Main St'
									{...form.getInputProps('address')}
								/>
								<TextInput
									label='RNC'
									placeholder='Tax ID / RNC'
									{...form.getInputProps('rnc')}
								/>
							</div>
						</section>
					</Stack>
				</div>
			</div>

			<Group justify='flex-end' className={classes.actions}>
				{onCancel && (
					<Button variant='default' onClick={onCancel} disabled={isSubmitting}>
						Cancel
					</Button>
				)}
				<Button type='submit' loading={isSubmitting}>
					{isEditMode ? 'Save Changes' : 'Create Client'}
				</Button>
			</Group>
		</Paper>
	);
};

export default ClientForm;
