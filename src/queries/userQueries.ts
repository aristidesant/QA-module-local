import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userApi from '~/api/userApi';
import {
	changePassword,
	enableMFA,
	verifyAndEnableMFA,
	disableMFA,
	type ChangePasswordPayload,
	type VerifyMFAPayload,
	type EnableMFAResponse,
} from '~/api/authApi';
import { type UserModel } from '~/models/UserModels';
import { useSessionStore } from '~/stores/sessionStore';

/**
 * Query to get current user
 */
export function useCurrentUser() {
	return useQuery<UserModel>({
		queryKey: ['currentUser'],
		queryFn: async () => {
			const api = userApi();
			return api.getCurrentUser();
		},
	});
}

/**
 * Mutation to change password
 */
export function useChangePassword() {
	const queryClient = useQueryClient();

	return useMutation<{ message: string }, Error, ChangePasswordPayload>({
		mutationFn: async (payload: ChangePasswordPayload) => {
			return changePassword(payload);
		},
		onSuccess: () => {
			// Optionally invalidate or refetch user data
			queryClient.invalidateQueries({ queryKey: ['currentUser'] });
		},
	});
}

/**
 * Mutation to initiate MFA setup (get QR code)
 */
export function useEnableMFA() {
	return useMutation<EnableMFAResponse, Error, void>({
		mutationFn: async () => {
			return enableMFA();
		},
	});
}

/**
 * Mutation to verify and complete MFA setup
 */
export function useVerifyAndEnableMFA() {
	const queryClient = useQueryClient();
	const { setUser } = useSessionStore();

	return useMutation<{ message: string }, Error, VerifyMFAPayload>({
		mutationFn: async (payload: VerifyMFAPayload) => {
			return verifyAndEnableMFA(payload);
		},
		onSuccess: async () => {
			// Refresh current user to get updated MFA status
			const api = userApi();
			const updatedUser = await api.getCurrentUser();
			setUser(updatedUser);
			queryClient.setQueryData(['currentUser'], updatedUser);
			queryClient.invalidateQueries({ queryKey: ['currentUser'] });
		},
	});
}

/**
 * Mutation to disable MFA
 */
export function useDisableMFA() {
	const queryClient = useQueryClient();
	const { setUser } = useSessionStore();

	return useMutation<{ message: string }, Error, { password: string }>({
		mutationFn: async (payload: { password: string }) => {
			return disableMFA(payload);
		},
		onSuccess: async () => {
			// Refresh current user to get updated MFA status
			const api = userApi();
			const updatedUser = await api.getCurrentUser();
			setUser(updatedUser);
			queryClient.setQueryData(['currentUser'], updatedUser);
			queryClient.invalidateQueries({ queryKey: ['currentUser'] });
		},
	});
}
