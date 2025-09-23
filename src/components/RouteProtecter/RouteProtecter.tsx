import { Outlet, useLoaderData, Navigate, useLocation } from 'react-router';
import { ModalsProvider } from '@mantine/modals';
import { useEffect } from 'react';
import { useSessionStore } from '~/stores/sessionStore';
import type { UserModel } from '~/models/UserModels';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import ImpersonationLoadingOverlay from '~/components/ImpersonationLoadingOverlay';

type LoaderData = {
	token: string | null;
	user: UserModel | null;
};

// Client loader to check session from localStorage - simplified to only validate token
export async function clientLoader(): Promise<LoaderData> {
	// Try to get token from the persisted store first, fallback to legacy accessToken
	let token: string | null = null;

	if (typeof window !== 'undefined') {
		try {
			// Try to get from persisted store
			const sessionStorage = window.localStorage.getItem('session-storage');
			if (sessionStorage) {
				const parsed = JSON.parse(sessionStorage);
				token = parsed?.state?.token || null;
			}

			// Fallback to legacy accessToken for backward compatibility
			if (!token) {
				token = window.localStorage.getItem('accessToken');
			}
		} catch {
			// If parsing fails, try legacy accessToken
			token = window.localStorage.getItem('accessToken');
		}
	}

	if (!token) return { token: null, user: null };

	try {
		// Just validate token expiration
		const decoded: any = jwtDecode(token);
		const now = dayjs();
		const expMillis =
			typeof decoded?.exp === 'number'
				? decoded.exp * 1000
				: Number(decoded?.exp) * 1000;

		if (
			!Number.isFinite(expMillis) ||
			dayjs(expMillis).isBefore(now) ||
			dayjs(expMillis).isSame(now)
		) {
			console.debug('JWT token expired');
			return { token: null, user: null };
		}

		// Return token only - let the store handle user data
		return { token, user: null };
	} catch (error) {
		return { token: null, user: null };
	}
}

export const RouteProtecter = () => {
	const { token } = useLoaderData<typeof clientLoader>();
	const { setToken, token: storeToken, _hasHydrated } = useSessionStore();
	const path = useLocation().pathname;

	useEffect(() => {
		// Only update store after hydration is complete
		if (!_hasHydrated) return;

		// Only set token if it's different from what's already in store
		if (token && token !== storeToken) {
			setToken(token);
		}

		// The loader no longer fetches user data, so we don't need to sync user from loader
		// User data is now managed entirely by the auth mutations and persist store
	}, [token, setToken, storeToken, _hasHydrated]);

	// Handle authentication redirects - use store token if hydrated, otherwise use loader token
	const authToken = _hasHydrated ? storeToken : token;

	if (!authToken && path !== '/login') {
		return <Navigate to='/login' replace />;
	}

	if (authToken && path === '/login') {
		return <Navigate to='/' replace />;
	}

	return (
		<ModalsProvider modalProps={{ withinPortal: false }}>
			<Outlet />
			<ImpersonationLoadingOverlay />
		</ModalsProvider>
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
