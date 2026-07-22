import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userApi, {
	type GetAllUsersParams,
	type SimpleUser,
} from '~/api/userApi';
import {
	changePassword,
	enableMFA,
	verifyAndEnableMFA,
	disableMFA,
	type ChangePasswordPayload,
	type VerifyMFAPayload,
	type EnableMFAResponse,
} from '~/api/authApi';
import {
	type UserModel,
	type CreateUserPayload,
	type UpdateUserPayload,
} from '~/models/UserModels';
import type { Paginator } from '~/models/Paginator';
import { useSessionStore } from '~/stores/sessionStore';

/**
 * Query to get all users with pagination
 */
export function useGetAllUsers(params?: GetAllUsersParams) {
	return useQuery<Paginator<UserModel>>({
		queryKey: ['users', params],
		queryFn: async () => {
			const api = userApi();
			return api.getAllUsers(params);
		},
		enabled: params != null,
	});
}

/**
 * Query to get simple users list (id, firstName, lastName) by client
 */
export function useGetSimpleUsers(clientId: number | undefined) {
	return useQuery<SimpleUser[]>({
		queryKey: ['usersSimple', clientId],
		queryFn: async () => {
			const api = userApi();
			return api.getSimpleUsers(clientId!);
		},
		enabled: !!clientId,
	});
}

/**
 * Query to get all roles assigned to a user.
 */
export function useGetUserRoles(userId: number | undefined) {
	return useQuery({
		queryKey: ['user-roles', userId],
		queryFn: async () => {
			const api = userApi();
			return api.getUserRoles(userId!);
		},
		enabled: Boolean(userId),
	});
}

/**
 * Query to get user by ID
 */
export function useGetUser(id: number) {
	return useQuery<UserModel>({
		queryKey: ['user', id],
		queryFn: async () => {
			const api = userApi();
			return api.getUserById(id);
		},
		enabled: !!id,
	});
}

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
	return useMutation<EnableMFAResponse, Error, { password: string }>({
		mutationFn: async (payload: { password: string }) => {
			return enableMFA(payload);
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

/**
 * Mutation to update a user's name by ID
 */
export function useUpdateUserName() {
	const queryClient = useQueryClient();

	return useMutation<
		UserModel,
		Error,
		{ id: number; firstName: string; lastName: string }
	>({
		mutationFn: async ({ id, firstName, lastName }) => {
			const api = userApi();
			return api.updateUserName(id, firstName, lastName);
		},
		onSuccess: (data, variables) => {
			// Update cache for the specific user
			queryClient.setQueryData(['user', variables.id], data);
			// Invalidate users list if it exists
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});
}

/**
 * Mutation to update current user's name
 */
export function useUpdateCurrentUserName() {
	const queryClient = useQueryClient();
	const { setUser } = useSessionStore();

	return useMutation<UserModel, Error, { firstName: string; lastName: string }>(
		{
			mutationFn: async ({ firstName, lastName }) => {
				const api = userApi();
				return api.updateCurrentUserName(firstName, lastName);
			},
			onSuccess: (updatedUser) => {
				// Update session store with new user data
				setUser(updatedUser);
				// Update current user cache
				queryClient.setQueryData(['currentUser'], updatedUser);
				queryClient.invalidateQueries({ queryKey: ['currentUser'] });
			},
		}
	);
}

/**
 * Mutation to create a new user
 */
export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation<UserModel, Error, CreateUserPayload>({
		mutationFn: async (userData: CreateUserPayload) => {
			const api = userApi();
			return api.createUser(userData);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.setQueryData(['user', data.id], data);
		},
	});
}

/**
 * Mutation to update a user
 */
export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation<UserModel, Error, { id: number; data: UpdateUserPayload }>(
		{
			mutationFn: async ({ id, data }) => {
				const api = userApi();
				return api.updateUser(id, data);
			},
			onSuccess: (data, variables) => {
				queryClient.setQueryData(['user', variables.id], data);
				queryClient.invalidateQueries({ queryKey: ['users'] });
			},
		}
	);
}

/**
 * Mutation to delete a user
 */
export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: async (id: number) => {
			const api = userApi();
			return api.deleteUser(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['user', id] });
		},
	});
}
