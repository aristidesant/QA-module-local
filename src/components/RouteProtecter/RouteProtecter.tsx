import { Outlet, useLoaderData, Navigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { useSessionStore } from '~/stores/sessionStore';
import type { UserModel } from '~/models/UserModels';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import ImpersonationLoadingOverlay from '~/components/ImpersonationLoadingOverlay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import userApi from '~/api/userApi';
import { logout } from '~/utils/logout';
import { LoadingOverlay } from '@mantine/core';
import classes from './RouteProtecter.module.css';
import { useSessionExpirationWatcher } from '~/hooks/useSessionExpirationWatcher';

type LoaderData = {
	token: string | null;
	user: UserModel | null;
};

const ACCESS_TOKEN_KEY = 'accessToken';

// Client loader to check session from sessionStorage (token only)
export async function clientLoader(): Promise<LoaderData> {
	let token: string | null = null;

	if (typeof window !== 'undefined') {
		try {
			token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
		} catch {
			// ignore storage errors
		}
	}

	if (!token) return { token: null, user: null };

	try {
		// Just validate token expiration
		const decoded: unknown = jwtDecode(token);
		const expSeconds = (decoded as { exp?: number | string } | null)?.exp;
		const now = dayjs();
		const expMillis =
			typeof expSeconds === 'number'
				? expSeconds * 1000
				: Number(expSeconds) * 1000;

		if (
			!Number.isFinite(expMillis) ||
			dayjs(expMillis).isBefore(now) ||
			dayjs(expMillis).isSame(now)
		) {
			try {
				window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
			} catch {}
			return { token: null, user: null };
		}

		// Return token only - let the store handle user data
		return { token, user: null };
	} catch (error) {
		try {
			window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
		} catch {}
		return { token: null, user: null };
	}
}

export const RouteProtecter = () => {
	const { token: loaderToken } = useLoaderData<typeof clientLoader>();
	const queryClient = useQueryClient();
	const { setToken, token: storeToken, user, setUser } = useSessionStore();
	const path = useLocation().pathname;

	useSessionExpirationWatcher();

	// Sync token from loader to store ONLY on initial load (when store is empty)
	// The store is the source of truth during the session - don't overwrite it
	useEffect(() => {
		if (!storeToken && loaderToken) {
			// Initial load: hydrate store from sessionStorage via loader
			setToken(loaderToken);
		} else if (!loaderToken && !storeToken) {
			// No token anywhere - ensure user is cleared
			setUser(null);
			queryClient.removeQueries({ queryKey: ['currentUser'] });
		}
	}, [queryClient, setToken, setUser, storeToken, loaderToken]);

	// Use store token as primary, fallback to loader token for initial render
	const authToken = storeToken ?? loaderToken;

	const meQuery = useQuery<UserModel>({
		queryKey: ['currentUser'],
		queryFn: async () => {
			const api = userApi();
			return api.getCurrentUser();
		},
		enabled: Boolean(authToken),
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		retry: false,
	});
	const refetchMe = meQuery.refetch;

	useEffect(() => {
		if (!authToken) return;
		if (meQuery.data) setUser(meQuery.data);
	}, [authToken, meQuery.data, setUser]);

	useEffect(() => {
		if (!authToken) return;

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				refetchMe();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [authToken, refetchMe]);

	useEffect(() => {
		if (!authToken) return;
		if (!meQuery.isError) return;

		const status = (meQuery.error as any)?.response?.status;
		if (status === 401) {
			logout('/login', { reason: 'expired' });
		}
	}, [authToken, meQuery.error, meQuery.isError]);

	if (!authToken && path !== '/login') {
		return <Navigate to='/login' replace />;
	}

	if (authToken && path === '/login') {
		return <Navigate to='/' replace />;
	}

	const needsPasswordUpdate = Boolean(authToken) && user?.needToChangePassword;

	if (needsPasswordUpdate && path !== '/force-password-change') {
		return <Navigate to='/force-password-change' replace />;
	}

	if (!needsPasswordUpdate && path === '/force-password-change') {
		return <Navigate to='/' replace />;
	}

	if (Boolean(authToken) && !user) {
		return (
			<div className={classes.root}>
				<LoadingOverlay
					visible={true}
					overlayProps={{ color: 'white', opacity: 0.75 }}
					loaderProps={{ type: 'dots' }}
				/>
				<ImpersonationLoadingOverlay />
			</div>
		);
	}

	return (
		<div className={classes.root}>
			<LoadingOverlay
				visible={Boolean(authToken) && !user && meQuery.isPending}
				overlayProps={{ color: 'white', opacity: 0.75 }}
				loaderProps={{ type: 'dots' }}
			/>
			<Outlet />
			<ImpersonationLoadingOverlay />
		</div>
	);
};

export const useToken = () => {
	const { token, user } = useSessionStore();

	return {
		token,
		user,
	};
};

export default RouteProtecter;
