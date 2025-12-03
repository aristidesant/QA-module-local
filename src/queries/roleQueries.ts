import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import rolesApi, { type GetAllRolesParams } from '~/api/rolesApi';
import type {
	RoleModel,
	CreateRolePayload,
	UpdateRolePayload,
} from '~/models/RoleModel';

/**
 * Query to get all roles
 */
export function useGetAllRoles(params?: GetAllRolesParams) {
	return useQuery<RoleModel[]>({
		queryKey: ['roles', params],
		queryFn: async () => {
			const api = rolesApi();
			return api.getAllRoles(params);
		},
	});
}

/**
 * Query to get role by ID
 */
export function useGetRole(id: number) {
	return useQuery<RoleModel>({
		queryKey: ['role', id],
		queryFn: async () => {
			const api = rolesApi();
			return api.getRoleById(id);
		},
		enabled: !!id,
	});
}

/**
 * Mutation to create a role
 */
export function useCreateRole() {
	const queryClient = useQueryClient();

	return useMutation<RoleModel, Error, CreateRolePayload>({
		mutationFn: async (payload: CreateRolePayload) => {
			const api = rolesApi();
			return api.createRole(payload);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['roles'] });
			queryClient.setQueryData(['role', data.id], data);
		},
	});
}

/**
 * Mutation to update a role
 */
export function useUpdateRole() {
	const queryClient = useQueryClient();

	return useMutation<RoleModel, Error, { id: number; data: UpdateRolePayload }>(
		{
			mutationFn: async ({ id, data }) => {
				const api = rolesApi();
				return api.updateRole(id, data);
			},
			onSuccess: (data, variables) => {
				queryClient.setQueryData(['role', variables.id], data);
				queryClient.invalidateQueries({ queryKey: ['roles'] });
			},
		}
	);
}

/**
 * Mutation to delete a role
 */
export function useDeleteRole() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: async (id: number) => {
			const api = rolesApi();
			return api.deleteRole(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['roles'] });
			queryClient.invalidateQueries({ queryKey: ['role', id] });
		},
	});
}
