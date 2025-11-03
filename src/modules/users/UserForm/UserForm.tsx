import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Paper,
	PasswordInput,
	Progress,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
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
	password?: string;
}

const UserForm: React.FC<UserFormProps> = ({ mode, userId, onSuccess }) => {
	const isEditMode = mode === 'edit';
	const [passwordStrength, setPasswordStrength] = useState({
		minLength: false,
		hasUppercase: false,
		hasLowercase: false,
		hasNumber: false,
		hasSymbol: false,
	});

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
			password: (value) => {
				if (!isEditMode) {
					if (!value || value.trim().length === 0) {
						return 'Password is required';
					}
					if (value.length < 8) {
						return 'Password must be at least 8 characters';
					}
				}
				return null;
			},
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

	// Calculate password strength
	const checkPasswordStrength = (password: string) => {
		const strength = {
			minLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumber: /[0-9]/.test(password),
			hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		};
		setPasswordStrength(strength);
		return strength;
	};

	// Calculate progress percentage
	const passwordProgress = useMemo(() => {
		const checks = Object.values(passwordStrength).filter(Boolean).length;
		return (checks / 5) * 100;
	}, [passwordStrength]);

	// Get progress color
	const progressColor = useMemo(() => {
		if (passwordProgress === 100) return 'green';
		if (passwordProgress >= 60) return 'yellow';
		return 'red';
	}, [passwordProgress]);

	const handleSubmit = form.onSubmit(async (values) => {
		try {
			if (isEditMode) {
				if (!userId) {
					throw new Error('Missing user identifier.');
				}
				// En modo edición, NUNCA incluir password
				const updatePayload: UpdateUserPayload = {
					email: values.email,
					username: values.username,
					firstName: values.firstName || undefined,
					lastName: values.lastName || undefined,
					clientId: Number(values.clientId) as number,
				};
				await updateMutation.mutateAsync({ id: userId, data: updatePayload });
				notifications.show({
					title: 'User updated',
					message: `${values.email} has been updated`,
					color: 'green',
				});
			} else {
				// En modo creación, SIEMPRE incluir password
				const createPayload: CreateUserPayload = {
					email: values.email,
					username: values.username,
					firstName: values.firstName || undefined,
					lastName: values.lastName || undefined,
					clientId: Number(values.clientId) as number,
					password: values.password,
				};
				await createMutation.mutateAsync(createPayload);
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
					{!isEditMode && (
						<div className={`${classes.row} ${classes.rowSingle}`}>
							<PasswordInput
								required
								label='Password'
								placeholder='Enter password'
								className={classes.field}
								{...form.getInputProps('password')}
								onChange={(event) => {
									form.setFieldValue('password', event.currentTarget.value);
									checkPasswordStrength(event.currentTarget.value);
								}}
							/>
							{form.values.password && (
								<Stack gap='xs' style={{ marginTop: '8px' }}>
									<Group gap='xs' align='center'>
										<Progress
											value={passwordProgress}
											color={progressColor}
											size='sm'
											style={{ flex: 1 }}
										/>
										<Text size='xs' c='dimmed' style={{ minWidth: '60px' }}>
											{passwordProgress === 100
												? 'Strong'
												: passwordProgress >= 60
													? 'Medium'
													: 'Weak'}
										</Text>
									</Group>
									<Stack gap={4}>
										<Group gap='xs'>
											{passwordStrength.minLength ? (
												<IconCheck
													size={14}
													color='var(--mantine-color-green-6)'
												/>
											) : (
												<IconX size={14} color='var(--mantine-color-red-6)' />
											)}
											<Text
												size='xs'
												c={passwordStrength.minLength ? 'green' : 'dimmed'}
											>
												At least 8 characters
											</Text>
										</Group>
										<Group gap='xs'>
											{passwordStrength.hasUppercase ? (
												<IconCheck
													size={14}
													color='var(--mantine-color-green-6)'
												/>
											) : (
												<IconX size={14} color='var(--mantine-color-red-6)' />
											)}
											<Text
												size='xs'
												c={passwordStrength.hasUppercase ? 'green' : 'dimmed'}
											>
												At least 1 uppercase letter
											</Text>
										</Group>
										<Group gap='xs'>
											{passwordStrength.hasLowercase ? (
												<IconCheck
													size={14}
													color='var(--mantine-color-green-6)'
												/>
											) : (
												<IconX size={14} color='var(--mantine-color-red-6)' />
											)}
											<Text
												size='xs'
												c={passwordStrength.hasLowercase ? 'green' : 'dimmed'}
											>
												At least 1 lowercase letter
											</Text>
										</Group>
										<Group gap='xs'>
											{passwordStrength.hasNumber ? (
												<IconCheck
													size={14}
													color='var(--mantine-color-green-6)'
												/>
											) : (
												<IconX size={14} color='var(--mantine-color-red-6)' />
											)}
											<Text
												size='xs'
												c={passwordStrength.hasNumber ? 'green' : 'dimmed'}
											>
												At least 1 number
											</Text>
										</Group>
										<Group gap='xs'>
											{passwordStrength.hasSymbol ? (
												<IconCheck
													size={14}
													color='var(--mantine-color-green-6)'
												/>
											) : (
												<IconX size={14} color='var(--mantine-color-red-6)' />
											)}
											<Text
												size='xs'
												c={passwordStrength.hasSymbol ? 'green' : 'dimmed'}
											>
												At least 1 special character (!@#$%^&*...)
											</Text>
										</Group>
									</Stack>
								</Stack>
							)}
						</div>
					)}
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
