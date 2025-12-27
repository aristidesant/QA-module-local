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
	Switch,
	Text,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconCheck,
	IconInfoCircle,
	IconShieldLock,
	IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '~/utils/httpClient';
import { useTranslation } from 'react-i18next';
import classes from './UserForm.module.css';
import {
	useCreateUser,
	useUpdateUser,
	useGetUser,
} from '~/queries/userQueries';
import { useGetAllClients } from '~/queries/clientQueries';
import type {
	CreateUserPayload,
	UpdateUserPayload,
	UserRoleModel,
} from '~/models/UserModels';
import UserFormSkeleton from './UserFormSkeleton';
import UserClientRoles from './UserClientRoles';

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
	userRoles: UserRoleModel[];
	mfaEnabled: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ mode, userId, onSuccess }) => {
	const { t } = useTranslation('users');
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
			userRoles: [],
			mfaEnabled: false,
		},
		validate: {
			email: (value) =>
				/\S+@\S+/.test(value) ? null : t('form.validation.invalidEmail'),
			username: (value) =>
				value.trim() ? null : t('form.validation.usernameRequired'),
			firstName: (value) =>
				value.trim() ? null : t('form.validation.firstNameRequired'),
			lastName: (value) =>
				value.trim() ? null : t('form.validation.lastNameRequired'),
			clientId: (value) =>
				value && Number(value) > 0
					? null
					: t('form.validation.clientIdInvalid'),
			password: (value) => {
				if (!isEditMode) {
					if (!value || value.trim().length === 0) {
						return t('form.validation.passwordRequired');
					}
					if (value.length < 8) {
						return t('form.validation.passwordMinLength');
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
				userRoles: user.userRolesClient ?? [],
				mfaEnabled: Boolean(user.mfaEnabled),
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
			// Prepare userRoles: remove ID for new entries, keep ID for existing ones
			const preparedUserRoles = values.userRoles.map((role) => ({
				...(role.id ? { id: role.id } : {}),
				userId: role.userId,
				clientId: role.clientId,
				roleId: role.roleId,
			}));

			if (isEditMode) {
				if (!userId) {
					throw new Error(t('form.validation.missingUserId'));
				}
				// In edit mode, do not send a password update
				const updatePayload: UpdateUserPayload = {
					email: values.email,
					username: values.username,
					firstName: values.firstName || undefined,
					lastName: values.lastName || undefined,
					clientId: Number(values.clientId) as number,
					userRolesClient: preparedUserRoles,
					mfaEnabled: values.mfaEnabled,
				};
				await updateMutation.mutateAsync({ id: userId, data: updatePayload });
				notifications.show({
					title: t('notifications.updatedTitle'),
					message: t('notifications.updatedMessage', { email: values.email }),
					color: 'green',
				});
			} else {
				// In creation mode, password is required
				const createPayload: CreateUserPayload = {
					email: values.email,
					username: values.username,
					firstName: values.firstName || undefined,
					lastName: values.lastName || undefined,
					clientId: Number(values.clientId) as number,
					password: values.password,
					userRolesClient: preparedUserRoles,
					mfaEnabled: values.mfaEnabled,
				};
				await createMutation.mutateAsync(createPayload);
				notifications.show({
					title: t('notifications.createdTitle'),
					message: t('notifications.createdMessage', { email: values.email }),
					color: 'green',
				});
				form.reset();
			}
			onSuccess();
		} catch (error) {
			notifications.show({
				title: t('notifications.requestFailedTitle'),
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
				title={t('form.loadErrorTitle')}
				color='red'
			>
				{userError instanceof Error
					? userError.message
					: t('list.unknownError')}
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
					<Stack gap='sm' className={classes.formColumn}>
						<div className={classes.meta}>
							<Group
								justify='space-between'
								align='center'
								gap='xs'
								className={classes.metaHeader}
							>
								<Group gap='xs'>
									<Badge
										variant='light'
										color='blue'
										className={classes.statusBadge}
										size='sm'
									>
										{isEditMode
											? t('form.badges.editing')
											: t('form.badges.creating')}
									</Badge>
									{!isEditMode && (
										<Badge variant='outline' color='gray' size='sm'>
											{t('form.badges.draft')}
										</Badge>
									)}
								</Group>
								<Text size='xs' className={classes.metaHint}>
									{t('form.metaHint')}
								</Text>
							</Group>
							<Text className={classes.subtitle}>{t('form.subtitle')}</Text>
						</div>
						<section className={classes.section}>
							<div className={classes.sectionHeader}>
								<Text className={classes.sectionTitle}>
									{t('form.sections.account.title')}
								</Text>
								<Text className={classes.sectionDescription}>
									{t('form.sections.account.description')}
								</Text>
							</div>
							<div className={classes.row}>
								<TextInput
									required
									label={t('form.fields.email.label')}
									placeholder={t('form.fields.email.placeholder')}
									size='sm'
									className={classes.field}
									{...form.getInputProps('email')}
								/>
								<TextInput
									required
									label={t('form.fields.username.label')}
									placeholder={t('form.fields.username.placeholder')}
									size='sm'
									className={classes.field}
									{...form.getInputProps('username')}
								/>
							</div>
							{!isEditMode && (
								<div className={classes.helperRow}>
									<div className={classes.field}>
										<Select
											label={t('form.fields.client.label')}
											placeholder={t('form.fields.client.placeholder')}
											data={clientOptions}
											size='sm'
											value={form.values.clientId}
											onChange={(value) =>
												form.setFieldValue('clientId', value)
											}
											withAsterisk
											searchable
										/>
									</div>
									<div className={classes.helper}>
										<Text size='xs' fw={600} c='var(--mantine-color-gray-8)'>
											{t('form.fields.client.helperTitle')}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('form.fields.client.helperDescription')}
										</Text>
									</div>
								</div>
							)}
							{!isEditMode && (
								<div className={classes.passwordCard}>
									<div className={classes.passwordField}>
										<PasswordInput
											required
											label={t('form.fields.password.label')}
											placeholder={t('form.fields.password.placeholder')}
											size='sm'
											className={classes.field}
											{...form.getInputProps('password')}
											onChange={(event) => {
												form.setFieldValue(
													'password',
													event.currentTarget.value
												);
												checkPasswordStrength(event.currentTarget.value);
											}}
										/>
										{!form.values.password && (
											<Text
												size='xs'
												c='dimmed'
												className={classes.passwordHint}
											>
												{t('form.fields.password.hint')}
											</Text>
										)}
									</div>
									{form.values.password && (
										<Stack gap='xs' className={classes.passwordStrengthWrapper}>
											<Group gap='xs' align='center'>
												<Progress
													value={passwordProgress}
													color={progressColor}
													size='sm'
													className={classes.passwordProgressBar}
												/>
												<Text
													size='xs'
													c='dimmed'
													className={classes.passwordStrengthLabel}
												>
													{passwordProgress === 100
														? t('form.passwordStrength.strong')
														: passwordProgress >= 60
															? t('form.passwordStrength.medium')
															: t('form.passwordStrength.weak')}
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
														<IconX
															size={14}
															color='var(--mantine-color-red-6)'
														/>
													)}
													<Text
														size='xs'
														c={passwordStrength.minLength ? 'green' : 'dimmed'}
													>
														{t('form.passwordChecks.minLength')}
													</Text>
												</Group>
												<Group gap='xs'>
													{passwordStrength.hasUppercase ? (
														<IconCheck
															size={14}
															color='var(--mantine-color-green-6)'
														/>
													) : (
														<IconX
															size={14}
															color='var(--mantine-color-red-6)'
														/>
													)}
													<Text
														size='xs'
														c={
															passwordStrength.hasUppercase ? 'green' : 'dimmed'
														}
													>
														{t('form.passwordChecks.uppercase')}
													</Text>
												</Group>
												<Group gap='xs'>
													{passwordStrength.hasLowercase ? (
														<IconCheck
															size={14}
															color='var(--mantine-color-green-6)'
														/>
													) : (
														<IconX
															size={14}
															color='var(--mantine-color-red-6)'
														/>
													)}
													<Text
														size='xs'
														c={
															passwordStrength.hasLowercase ? 'green' : 'dimmed'
														}
													>
														{t('form.passwordChecks.lowercase')}
													</Text>
												</Group>
												<Group gap='xs'>
													{passwordStrength.hasNumber ? (
														<IconCheck
															size={14}
															color='var(--mantine-color-green-6)'
														/>
													) : (
														<IconX
															size={14}
															color='var(--mantine-color-red-6)'
														/>
													)}
													<Text
														size='xs'
														c={passwordStrength.hasNumber ? 'green' : 'dimmed'}
													>
														{t('form.passwordChecks.number')}
													</Text>
												</Group>
												<Group gap='xs'>
													{passwordStrength.hasSymbol ? (
														<IconCheck
															size={14}
															color='var(--mantine-color-green-6)'
														/>
													) : (
														<IconX
															size={14}
															color='var(--mantine-color-red-6)'
														/>
													)}
													<Text
														size='xs'
														c={passwordStrength.hasSymbol ? 'green' : 'dimmed'}
													>
														{t('form.passwordChecks.symbol')}
													</Text>
												</Group>
											</Stack>
										</Stack>
									)}
								</div>
							)}

							<div className={classes.securityCard}>
								<div className={classes.securityHeader}>
									<Group gap='xs'>
										<ThemeIcon
											size='sm'
											variant='light'
											color={form.values.mfaEnabled ? 'teal' : 'gray'}
											radius='md'
										>
											<IconShieldLock size={14} />
										</ThemeIcon>
										<div className={classes.securityTitle}>
											<Text size='sm' fw={600} lh={1.2}>
												{t('form.mfa.title')}
											</Text>
											<Text size='xs' c='dimmed'>
												{t('form.mfa.subtitle')}
											</Text>
										</div>
									</Group>
									<Badge
										size='sm'
										color={form.values.mfaEnabled ? 'teal' : 'gray'}
										variant='light'
										className={classes.securityStatus}
									>
										{form.values.mfaEnabled
											? t('details.values.enabled')
											: t('details.values.disabled')}
									</Badge>
								</div>
								<div className={classes.securityControls}>
									<Text size='xs' c='dimmed'>
										{t('form.mfa.description')}
									</Text>
									<Switch
										size='sm'
										color='teal'
										checked={form.values.mfaEnabled}
										onChange={(event) =>
											form.setFieldValue(
												'mfaEnabled',
												event.currentTarget.checked
											)
										}
										aria-label={t('form.mfa.toggleAria')}
									/>
								</div>
							</div>
						</section>

						<section className={classes.section}>
							<div className={classes.sectionHeader}>
								<Text className={classes.sectionTitle}>
									{t('form.sections.profile.title')}
								</Text>
								<Text className={classes.sectionDescription}>
									{t('form.sections.profile.description')}
								</Text>
							</div>
							<div className={classes.rowTight}>
								<TextInput
									required
									label={t('form.fields.firstName.label')}
									placeholder={t('form.fields.firstName.placeholder')}
									size='sm'
									className={classes.field}
									{...form.getInputProps('firstName')}
								/>
								<TextInput
									required
									label={t('form.fields.lastName.label')}
									placeholder={t('form.fields.lastName.placeholder')}
									size='sm'
									className={classes.field}
									{...form.getInputProps('lastName')}
								/>
							</div>
						</section>
					</Stack>

					<section className={`${classes.section} ${classes.rolesSection}`}>
						<div className={classes.sectionHeader}>
							<Text className={classes.sectionTitle}>
								{t('form.sections.roles.title')}
							</Text>
							<Text className={classes.sectionDescription}>
								{t('form.sections.roles.description')}
							</Text>
						</div>
						<UserClientRoles
							value={form.values.userRoles}
							onChange={(roles) => form.setFieldValue('userRoles', roles)}
							disabled={isSubmitting}
							userId={user?.id ?? userId}
						/>
					</section>
				</div>
			</div>

			<Group justify='flex-end' className={classes.actions}>
				<Button
					type='submit'
					loading={isSubmitting}
					disabled={isSubmitting}
					size='sm'
				>
					{isEditMode
						? t('form.actions.saveChanges')
						: t('form.actions.createUser')}
				</Button>
			</Group>
		</Paper>
	);
};

export default UserForm;
