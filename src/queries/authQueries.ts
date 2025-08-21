import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	authenticate,
	MFALoginResponse,
	OTPVerifyRequest,
	verifyOTP,
	type AuthRequest,
} from "~/api/authApi";
import userApi from "~/api/userApi";
import { jwtDecode } from "jwt-decode";
import { useSessionStore } from "~/stores/sessionStore";
import { getErrorMessage } from "~/utils/httpClient";

/**
 * Helper function to complete the login flow after token is received
 */
async function completeLoginFlow(
	accessToken: string,
	queryClient: any,
	setToken: (token: string | null) => void,
	setUser: (user: any) => void
) {
	// Persist token
	try {
		window.localStorage.setItem("accessToken", accessToken);
	} catch {}

	// Put token in store
	setToken(accessToken);

	// Decode token for user id
	let userId: number | undefined;
	try {
		const decoded: any = jwtDecode(accessToken);
		userId = decoded?.userId ?? decoded?.sub ?? decoded?.id;
	} catch {
		// If decoding fails, we won't fetch user by id; try /users/me instead
	}

	// Fetch current user (prefer users/me, but keep fallback by id if present)
	try {
		const api = userApi({ Authorization: `Bearer ${accessToken}` });
		const user = userId
			? await api.getUserById(Number(userId))
			: await api.getCurrentUser();
		setUser(user);
		queryClient.setQueryData(["currentUser"], user);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.warn("Failed to fetch user after login:", getErrorMessage(err));
	}
}

/**
 * Login mutation: calls /auth/login, stores token, decodes it, and fetches the user.
 * Also primes any relevant user queries in the cache.
 */
export function useLogin() {
	const queryClient = useQueryClient();
	const { setToken, setUser } = useSessionStore.getState();

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
					setUser
				);
			}
			// For OTP-enabled users, just return the response data
			// The component will handle showing the OTP modal
		},
		onError: (error: Error) => {
			// Handle error if needed, e.g., show notification
			console.log("Login mutation failed:", error.message);
		},
	});
}

export function useVerifyOTP() {
	const queryClient = useQueryClient();
	const { setToken, setUser } = useSessionStore.getState();

	return useMutation<{ accessToken: string }, Error, OTPVerifyRequest>({
		mutationFn: async (payload: OTPVerifyRequest) => {
			const res = await verifyOTP(payload);
			if (!res?.accessToken) throw new Error("No access token returned");
			return { accessToken: res.accessToken };
		},
		onSuccess: async ({ accessToken }) => {
			await completeLoginFlow(accessToken, queryClient, setToken, setUser);
		},
	});
}

export function logoutClientSide() {
	try {
		window.localStorage.removeItem("accessToken");
	} catch {}
	const { setToken, setUser } = useSessionStore.getState();
	setToken(null);
	setUser(null);
}
