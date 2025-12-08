import { useEffect, useMemo } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Textarea,
	Grid,
	Divider,
	Skeleton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './ClientForm.module.css';
import SectionCard from '~/components/SectionCard';
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
		return (
			<Paper withBorder radius='md' className={classes.form}>
				<Stack gap='xs'>
					<Skeleton height={10} width='30%' radius='xl' />
					<Skeleton height={24} radius='sm' />
					<Skeleton height={10} radius='xl' />
				</Stack>
				<Divider />
				<Grid gutter='xs'>
					{Array.from({ length: 3 }).map((_, index) => (
						<Grid.Col span={{ base: 12, md: 6, lg: 4 }} key={index}>
							<Stack gap='xs'>
								<Skeleton height={12} radius='xl' />
								<Skeleton height={80} radius='sm' />
							</Stack>
						</Grid.Col>
					))}
				</Grid>
			</Paper>
		);
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
			<div className={classes.header}>
				<Stack gap={4} className={classes.headerCopy}>
					<Group gap='xs' className={classes.badgeRow}>
						<Badge
							variant='light'
							color='blue'
							className={classes.statusBadge}
							size='sm'
						>
							{isEditMode ? 'Editing client' : 'Create client'}
						</Badge>
						{!isEditMode && (
							<Badge variant='outline' color='gray' size='sm'>
								Draft
							</Badge>
						)}
					</Group>
					<Text className={classes.title}>
						{isEditMode ? 'Update client profile' : 'Add a new client'}
					</Text>
					<Text size='xs' c='dimmed'>
						Keep contact, address, and billing details tidy so teams can move
						fast.
					</Text>
				</Stack>
			</div>

			<Divider />

			<div className={classes.body}>
				<Stack gap='xs'>
					<Grid gutter='sm'>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<SectionCard
								title='Profile'
								description='Name and context for this client.'
								contentSpacing='sm'
								padding='md'
							>
								<TextInput
									required
									label='Name'
									placeholder='Acme Corporation'
									size='sm'
									{...form.getInputProps('name')}
								/>
								<Textarea
									label='Description'
									placeholder='Short mission statement or notes'
									size='sm'
									minRows={3}
									{...form.getInputProps('description')}
								/>
							</SectionCard>
						</Grid.Col>

						<Grid.Col span={{ base: 12, md: 6 }}>
							<SectionCard
								title='Contact'
								description='Primary inbox and phone for outreach.'
								contentSpacing='sm'
								padding='md'
							>
								<div className={classes.row}>
									<TextInput
										label='Email'
										placeholder='team@acme.com'
										size='sm'
										{...form.getInputProps('email')}
									/>
									<TextInput
										label='Phone'
										placeholder='+1 (555) 123-4567'
										size='sm'
										{...form.getInputProps('phone')}
									/>
								</div>
							</SectionCard>
						</Grid.Col>
					</Grid>

					<SectionCard
						title='Location & Tax'
						description='Where the client operates and how they bill.'
						contentSpacing='sm'
						padding='md'
					>
						<div className={classes.row}>
							<TextInput
								label='Address'
								placeholder='123 Market Street'
								size='sm'
								{...form.getInputProps('address')}
							/>
							<TextInput
								label='RNC'
								placeholder='Tax ID / RNC'
								size='sm'
								{...form.getInputProps('rnc')}
							/>
						</div>
					</SectionCard>
				</Stack>
			</div>

			<Group justify='space-between' className={classes.actions}>
				<Text size='xs' c='dimmed'>
					All changes are saved securely when you submit.
				</Text>
				<Group gap='xs'>
					{onCancel && (
						<Button
							variant='default'
							onClick={onCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					)}
					<Button type='submit' loading={isSubmitting}>
						{isEditMode ? 'Save changes' : 'Create client'}
					</Button>
				</Group>
			</Group>
		</Paper>
	);
};

export default ClientForm;
