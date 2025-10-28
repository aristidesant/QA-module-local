import { useEffect, useMemo } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './UserForm.module.css';
import {
	useCreateUser,
	useUpdateUser,
	useGetUser,
} from '~/queries/userQueries';
import { useGetAllClients } from '~/queries/clientQueries';
import type { CreateUserPayload, UpdateUserPayload } from '~/models/UserModels';
import UserFormSkeleton from './UserFormSkeleton';

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
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	if (isEditMode && isUserLoading) {
		return <UserFormSkeleton />;
	}

	if (isLoading) {
		return <UserFormSkeleton />;
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
			<Stack gap='md'>
				<div className={classes.meta}>
					{!isEditMode && (
						<Badge variant='light' color='blue' className={classes.statusBadge}>
							Draft
						</Badge>
					)}
					<Text className={classes.subtitle}>
						Manage account access, profile information, and security settings in
						one place.
					</Text>
				</div>
				<section className={classes.section}>
					<div className={classes.sectionHeader}>
						<Text className={classes.sectionTitle}>Account</Text>
						<Text className={classes.sectionDescription}>
							Access credentials and ownership details.
						</Text>
					</div>
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
					<div className={`${classes.row} ${classes.rowSingle}`}>
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
					<div className={classes.sectionHeader}>
						<Text className={classes.sectionTitle}>Profile</Text>
						<Text className={classes.sectionDescription}>
							Basic details used across the app.
						</Text>
					</div>
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

				<Group justify='flex-end' className={classes.actions}>
					<Button type='submit' loading={isSubmitting} disabled={isSubmitting}>
						{isEditMode ? 'Save changes' : 'Create user'}
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
};

export default UserForm;
