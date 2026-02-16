import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	authenticate,
	MFALoginResponse,
	OTPVerifyRequest,
	verifyOTP,
	impersonateClient,
	endImpersonation,
	ImpersonateClientRequest,
	ImpersonateClientResponse,
	EndImpersonationResponse,
	type AuthRequest,
	signUp,
	type SignUpRequest,
	selectClient,
	SelectClientRequest,
	SelectClientResponse,
	getAvailableClients,
	changeClient,
	ChangeClientRequest,
	ChangeClientResponse,
} from '~/api/authApi';
import userApi from '~/api/userApi';
import { useSessionStore } from '~/stores/sessionStore';
import { useImpersonationLoadingStore } from '~/stores/impersonationLoadingStore';
import { getErrorMessage } from '~/utils/httpClient';

/**
 * Helper function to complete the login flow after token is received
 */
async function completeLoginFlow(
	accessToken: string,
	queryClient: any,
	setToken: (token: string | null) => void,
	setUser: (user: any) => void,
	userFromResponse?: any // Optional user data from API response
) {
	// Persist token (sessionStorage only)
	try {
		window.sessionStorage.setItem('accessToken', accessToken);
	} catch {}

	// Put token in store
	setToken(accessToken);

	// If user data is provided from API response, use it directly
	if (userFromResponse) {
		setUser(userFromResponse);
		queryClient.setQueryData(['currentUser'], userFromResponse);
		return;
	}

	// Otherwise, fetch user data using /users/me endpoint (more reliable than decoding JWT)
	try {
		const api = userApi({ Authorization: `Bearer ${accessToken}` });
		const user = await api.getCurrentUser();
		setUser(user);
		queryClient.setQueryData(['currentUser'], user);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.warn('Failed to fetch user after login:', getErrorMessage(err));
	}
}

/**
 * Login mutation: calls /auth/login, stores token, decodes it, and fetches the user.
 * Also primes any relevant user queries in the cache.
 */
export function useLogin() {
	const queryClient = useQueryClient();
	const { setToken, setUser } = useSessionStore();

	return useMutation<MFALoginResponse, Error, AuthRequest>({
		mutationFn: async (payload: AuthRequest) => {
			const res: MFALoginResponse = await authenticate(payload);
			return res;
		},
		onSuccess: async (data: MFALoginResponse) => {
			if (!data?.otpEnabled && data?.accessToken) {
				// Complete login flow for non-OTP users
				await completeLoginFlow(
					data.accessToken,
					queryClient,
					setToken,
					setUser,
					data.user
				);
			}
			// For OTP-enabled users, just return the response data
			// The component will handle showing the OTP modal
		},
		onError: (error: Error) => {
			// Handle error if needed, e.g., show notification
			console.log('Login mutation failed:', error.message);
		},
	});
}

/**
 * Sign up mutation: calls /auth/sign-up to create a new user account
 */
export function useSignUp() {
	return useMutation<{ message: string; userId: number }, Error, SignUpRequest>(
		{
			mutationFn: async (payload: SignUpRequest) => {
				const res = await signUp(payload);
				return res;
			},
			onSuccess: (data) => {
				// Handle successful registration, e.g., show notification
				console.log(
					'Sign up successful:',
					data.message,
					'User ID:',
					data.userId
				);
			},
			onError: (error: Error) => {
				// Handle error if needed, e.g., show notification
				console.log('Sign up mutation failed:', error.message);
			},
		}
	);
}

export function useVerifyOTP() {
	const queryClient = useQueryClient();
	const { setToken, setUser } = useSessionStore();

	return useMutation<{ accessToken: string }, Error, OTPVerifyRequest>({
		mutationFn: async (payload: OTPVerifyRequest) => {
			const res = await verifyOTP(payload);
			if (!res?.accessToken) throw new Error('No access token returned');
			return { accessToken: res.accessToken };
		},
		onSuccess: async ({ accessToken }) => {
			await completeLoginFlow(accessToken, queryClient, setToken, setUser);
		},
	});
}

/**
 * Select client mutation: used when user has access to multiple clients.
 * Calls /auth/select-client with preAuthToken and selected clientId.
 */
export function useSelectClient() {
	const queryClient = useQueryClient();
	const { setToken, setUser } = useSessionStore();

	return useMutation<SelectClientResponse, Error, SelectClientRequest>({
		mutationFn: async (payload: SelectClientRequest) => {
			const res = await selectClient(payload);
			return res;
		},
		onSuccess: async (data: SelectClientResponse) => {
			// Only complete login flow if we received an access token
			// If otpRequired is true, the component will handle showing the OTP input
			if (data?.accessToken) {
				await completeLoginFlow(
					data.accessToken,
					queryClient,
					setToken,
					setUser
				);
			}
		},
		onError: (error: Error) => {
			console.error('Client selection failed:', error.message);
		},
	});
}

export function useImpersonateClient() {
	const queryClient = useQueryClient();
	const { setToken, setUser, setTargetClient } = useSessionStore();
	const { setLoading } = useImpersonationLoadingStore.getState();

	return useMutation<
		ImpersonateClientResponse,
		Error,
		ImpersonateClientRequest
	>({
		mutationFn: async (payload: ImpersonateClientRequest) => {
			setLoading(true, 'Switching to client...');
			const res = await impersonateClient(payload);
			if (!res?.accessToken) throw new Error('No access token returned');
			return res;
		},
		onSuccess: async (data: ImpersonateClientResponse) => {
			// Store target client information
			setTargetClient(data.targetClient);

			// Complete login flow with the new impersonated token and user data
			await completeLoginFlow(
				data.accessToken,
				queryClient,
				setToken,
				setUser,
				data.user // Use user data from API response
			);

			// Invalidate all queries to refresh data for the new client context
			queryClient.invalidateQueries();

			// Clear loading state
			setLoading(false);
		},
		onError: (error: Error) => {
			// eslint-disable-next-line no-console
			console.error('Client impersonation failed:', error.message);
			setLoading(false);
		},
	});
}

export function useEndImpersonation() {
	const queryClient = useQueryClient();
	const { setToken, setUser, setTargetClient } = useSessionStore();
	const { setLoading } = useImpersonationLoadingStore.getState();

	return useMutation<EndImpersonationResponse, Error, void>({
		mutationFn: async () => {
			setLoading(true, 'Returning to master client...');
			const res = await endImpersonation();
			if (!res?.accessToken) throw new Error('No access token returned');
			return res;
		},
		onSuccess: async (data: EndImpersonationResponse) => {
			// Clear target client information
			setTargetClient(null);

			// Complete login flow with the original user token and user data
			await completeLoginFlow(
				data.accessToken,
				queryClient,
				setToken,
				setUser,
				data.user // Use user data from API response
			);

			// Invalidate all queries to refresh data for the original client context
			queryClient.invalidateQueries();

			// Clear loading state
			setLoading(false);
		},
		onError: (error: Error) => {
			// eslint-disable-next-line no-console
			console.error('End impersonation failed:', error.message);
			setLoading(false);
		},
	});
}

/**
 * Query to fetch the list of clients the current user can switch to.
 * Only enabled when explicitly requested (enabled option).
 */
export function useAvailableClients(enabled = false) {
	return useQuery({
		queryKey: ['availableClients'],
		queryFn: () => getAvailableClients(),
		enabled,
		staleTime: 30_000,
	});
}

/**
 * Mutation to switch the current session to a different client.
 * Revokes the current token and issues a new one scoped to the selected client.
 * If MFA is enabled, returns otpRequired and the caller must re-invoke with the OTP.
 */
export function useChangeClient() {
	const queryClient = useQueryClient();
	const { setToken, setUser } = useSessionStore();
	const { setLoading } = useImpersonationLoadingStore.getState();

	return useMutation<ChangeClientResponse, Error, ChangeClientRequest>({
		mutationFn: async (payload: ChangeClientRequest) => {
			if (!payload.otp) {
				setLoading(true, 'Switching client...');
			}
			const res = await changeClient(payload);
			return res;
		},
		onSuccess: async (data: ChangeClientResponse) => {
			if (data.otpRequired || !data.accessToken) {
				// MFA flow — caller handles OTP prompt
				setLoading(false);
				return;
			}

			// Use the EXACT same flow as impersonation:
			// 1. Complete login flow (sets token + fetches user)
			await completeLoginFlow(
				data.accessToken,
				queryClient,
				setToken,
				setUser
				// Note: change-client doesn't return user data, so completeLoginFlow will fetch it
			);

			// 2. Invalidate all queries to refresh data for the new client context
			queryClient.invalidateQueries();

			// 3. Clear loading state
			setLoading(false);
		},
		onError: (error: Error) => {
			console.error('Client change failed:', error.message);
			setLoading(false);
		},
	});
}

export function logoutClientSide() {
	try {
		window.sessionStorage.removeItem('accessToken');
	} catch {}
	const { setToken, setUser, setTargetClient } = useSessionStore.getState();
	setToken(null);
	setUser(null);
	setTargetClient(null);
}
