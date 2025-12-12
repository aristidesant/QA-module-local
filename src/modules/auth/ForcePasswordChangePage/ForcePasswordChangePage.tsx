import {
	Alert,
	Badge,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconAlertCircle, IconLockCheck } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PasswordChangeSection from '~/modules/profile/PasswordChangeSection';
import { useLogin } from '~/queries/authQueries';
import { useSessionStore } from '~/stores/sessionStore';
import { usePasswordResetStore } from '~/stores/passwordResetStore';
import { getErrorMessage } from '~/utils/httpClient';
import { logout } from '~/utils/logout';
import classes from './ForcePasswordChangePage.module.css';

type RouteState = {
	username?: string;
	loginType?: 'USER_PASS' | 'LDAP';
};

type PasswordChangeResult = {
	currentPassword: string;
	newPassword: string;
};

const DEFAULT_LOGIN_TYPE: 'USER_PASS' | 'LDAP' = 'USER_PASS';

const ForcePasswordChangePage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const loginMutation = useLogin();
	const { user } = useSessionStore();
	const { pendingUsername, pendingLoginType, clearPendingCredentials } =
		usePasswordResetStore();

	const [reauthenticating, setReauthenticating] = useState(false);
	const [reauthError, setReauthError] = useState<string | null>(null);

	const credentials = useMemo<RouteState>(() => {
		return (location.state as RouteState) ?? {};
	}, [location.state]);

	const usernameForReauth = credentials.username ?? pendingUsername ?? '';
	const loginTypeForReauth =
		credentials.loginType ?? pendingLoginType ?? DEFAULT_LOGIN_TYPE;
	const missingCredentials = !usernameForReauth;

	useEffect(() => {
		if (user && !user.needToChangePassword) {
			clearPendingCredentials();
			navigate('/', { replace: true });
		}
	}, [clearPendingCredentials, navigate, user]);

	const handlePasswordChanged = async ({
		newPassword,
	}: PasswordChangeResult) => {
		if (!usernameForReauth) {
			clearPendingCredentials();
			setReauthenticating(false);
			logout('/login');
			return;
		}

		setReauthenticating(true);
		setReauthError(null);

		try {
			await loginMutation.mutateAsync({
				username: usernameForReauth,
				password: newPassword,
				loginType: loginTypeForReauth,
			});
			// Successful login will update session store; route guard will carry them to dashboard
			clearPendingCredentials();
			navigate('/', { replace: true });
		} catch (error) {
			setReauthError(getErrorMessage(error));
			setReauthenticating(false);
		}
	};

	const handleLogout = () => {
		clearPendingCredentials();
		logout('/login');
	};

	return (
		<div className={classes.wrapper}>
			<Paper className={classes.card}>
				<Stack gap='lg'>
					<Group justify='space-between' align='flex-start'>
						<div>
							<Title order={2} className={classes.title}>
								Update Your Password
							</Title>
							<Text c='dimmed' size='sm'>
								For security reasons you must update your password before
								continuing to the dashboard.
							</Text>
						</div>
						<Badge className={classes.badge}>Security Check</Badge>
					</Group>

					{missingCredentials && (
						<Alert
							color='blue'
							variant='light'
							icon={<IconAlertCircle size={18} />}
							title='Sign-in Needed After Update'
						>
							Finish updating your password, then return to the login screen to
							sign in with your new credentials.
						</Alert>
					)}

					{reauthError && (
						<Alert
							color='red'
							variant='light'
							icon={<IconAlertCircle size={18} />}
							title='Re-authentication Failed'
						>
							{reauthError}
						</Alert>
					)}

					<PasswordChangeSection
						onSuccess={handlePasswordChanged}
						showCancelButton={false}
						submitLabel={
							reauthenticating ? 'Updating password...' : 'Save new password'
						}
						processing={reauthenticating || loginMutation.isPending}
					/>

					<Button
						className={classes.returnButton}
						onClick={handleLogout}
						disabled={reauthenticating || loginMutation.isPending}
						leftSection={<IconLockCheck size={18} />}
					>
						Return to login
					</Button>
				</Stack>
			</Paper>
		</div>
	);
};

export default ForcePasswordChangePage;
