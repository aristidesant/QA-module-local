import { useEffect, useMemo } from 'react';
import {
	Alert,
	Badge,
	Button,
	Divider,
	Group,
	Loader,
	Paper,
	PasswordInput,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import classes from './UserForm.module.css';
import {
	useCreateUser,
	useUpdateUser,
	useGetUser,
} from '~/queries/userQueries';
import { useGetAllClients } from '~/queries/clientQueries';
import type { CreateUserPayload, UpdateUserPayload } from '~/models/UserModels';

interface UserFormProps {
	mode: 'create' | 'edit';
	userId?: number;
	onSuccess: () => void;
}

interface UserFormValues {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	clientId: string | null;
	password: string;
}

const UserForm: React.FC<UserFormProps> = ({ mode, userId, onSuccess }) => {
	const isEditMode = mode === 'edit';

	const form = useForm<UserFormValues>({
		initialValues: {
			email: '',
			username: '',
			firstName: '',
			lastName: '',
			clientId: null,
			password: '',
		},
		validate: {
			email: (value) =>
				/\S+@\S+/.test(value) ? null : 'Please enter a valid email address',
			username: (value) => (value.trim() ? null : 'Username is required'),
			firstName: (value) => (value.trim() ? null : 'First name is required'),
			lastName: (value) => (value.trim() ? null : 'Last name is required'),
			clientId: (value) =>
				value && Number(value) > 0
					? null
					: 'Client ID must be greater than zero',
		},
	});

	const createMutation = useCreateUser();
	const updateMutation = useUpdateUser();

	const {
		data: user,
		isLoading: isUserLoading,
		isError: isUserError,
		error: userError,
	} = useGetUser(userId ?? 0);

	const { data: clients = [], isLoading: isClientsLoading } =
		useGetAllClients();

	const clientOptions = useMemo(
		() =>
			clients.map((client) => ({
				value: String(client.id),
				label: client.name,
			})),
		[clients]
	);

	useEffect(() => {
		if (isEditMode && user) {
			form.setValues({
				email: user.email,
				username: user.username,
				firstName: user.firstName ?? '',
				lastName: user.lastName ?? '',
				clientId: String(user.clientId),
				password: '',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditMode, user]);

	const isSubmitting = useMemo(
		() => createMutation.isPending || updateMutation.isPending,
		[createMutation.isPending, updateMutation.isPending]
	);

	const isLoading = useMemo(
		() => (isEditMode && isUserLoading) || isClientsLoading,
		[isEditMode, isUserLoading, isClientsLoading]
	);

	const handleSubmit = form.onSubmit(async (values) => {
		const basePayload: CreateUserPayload = {
			email: values.email,
			username: values.username,
			firstName: values.firstName || undefined,
			lastName: values.lastName || undefined,
			clientId: Number(values.clientId) as number,
		};

		if (values.password.trim()) {
			basePayload.password = values.password;
		}

		try {
			if (isEditMode) {
				if (!userId) {
					throw new Error('Missing user identifier.');
				}
				const updatePayload: UpdateUserPayload = {
					...basePayload,
				};
				await updateMutation.mutateAsync({ id: userId, data: updatePayload });
				notifications.show({
					title: 'User updated',
					message: `${values.email} has been updated`,
					color: 'green',
				});
			} else {
				await createMutation.mutateAsync(basePayload);
				notifications.show({
					title: 'User created',
					message: `${values.email} has been added`,
					color: 'green',
				});
				form.reset();
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: 'Request failed',
				message: error instanceof Error ? error.message : 'Unknown error',
				color: 'red',
			});
		}
	});

	if (isEditMode && isUserLoading) {
		return <Loader size='sm' />;
	}

	if (isLoading) {
		return <Loader size='sm' />;
	}

	if (isEditMode && isUserError) {
		return (
			<Alert
				icon={<IconInfoCircle size={18} />}
				title='Unable to load user'
				color='red'
			>
				{userError instanceof Error ? userError.message : 'Unknown error'}
			</Alert>
		);
	}

	return (
		<Paper
			component='form'
			withBorder={false}
			className={classes.form}
			onSubmit={handleSubmit}
		>
			<div className={classes.header}>
				<div>
					<Title order={4} className={classes.title}>
						{isEditMode ? 'Edit user' : 'Create new user'}
					</Title>
					<Text className={classes.subtitle}>
						Manage account access, profile information, and security settings in
						one place.
					</Text>
				</div>
				{!isEditMode && (
					<Badge variant='light' color='blue' className={classes.statusBadge}>
						Draft
					</Badge>
				)}
			</div>

			<Divider />

			<Stack gap='lg'>
				<section className={classes.section}>
					<Text className={classes.sectionTitle}>Account</Text>
					<div className={classes.row}>
						<TextInput
							required
							label='Email'
							placeholder='user@example.com'
							className={classes.field}
							{...form.getInputProps('email')}
						/>
						<TextInput
							required
							label='Username'
							placeholder='work-user'
							className={classes.field}
							{...form.getInputProps('username')}
						/>
					</div>
					<div
						className={
							isEditMode
								? classes.row
								: `${classes.row} ${classes.singleColumnRow}`
						}
					>
						<Select
							label='Client'
							placeholder='Assign client'
							data={clientOptions}
							className={classes.field}
							value={form.values.clientId}
							onChange={(value) => form.setFieldValue('clientId', value)}
							withAsterisk
							searchable
						/>
					</div>
				</section>

				<section className={classes.section}>
					<Text className={classes.sectionTitle}>Profile</Text>
					<div className={classes.row}>
						<TextInput
							required
							label='First name'
							placeholder='First name'
							className={classes.field}
							{...form.getInputProps('firstName')}
						/>
						<TextInput
							required
							label='Last name'
							placeholder='Last name'
							className={classes.field}
							{...form.getInputProps('lastName')}
						/>
					</div>
				</section>

				<section className={classes.section}>
					<Text className={classes.sectionTitle}>Security</Text>
					<div className={classes.row}>
						<PasswordInput
							label={isEditMode ? 'Password (optional)' : 'Password'}
							placeholder={
								isEditMode ? 'Update password if needed' : 'Temporary password'
							}
							value={form.values.password}
							onChange={(event) =>
								form.setFieldValue('password', event.currentTarget.value)
							}
							className={classes.field}
						/>
						<div className={`${classes.helperCard} ${classes.field}`}>
							<Text className={classes.helperTitle}>Password guidance</Text>
							<Text className={classes.helperText}>
								{isEditMode
									? 'Update credentials only when a security review requires it.'
									: 'Leave this blank and the user will receive a secure reset link.'}
							</Text>
						</div>
					</div>
				</section>
			</Stack>

			<Divider />

			<Group justify='flex-end' className={classes.actions}>
				<Button type='submit' loading={isSubmitting} disabled={isSubmitting}>
					{isEditMode ? 'Save changes' : 'Create user'}
				</Button>
			</Group>
		</Paper>
	);
};

export default UserForm;
