import axios from 'axios';
import type {
	RoleModel,
	CreateRolePayload,
	UpdateRolePayload,
} from '~/models/RoleModel';
import { DEFAULT_API_URL } from './config';

export interface GetAllRolesParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
	sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
	sortOrder?: 'ASC' | 'DESC';
}

interface RolesApiClient {
	getRoleById: (id: number) => Promise<RoleModel>;
	createRole: (payload: CreateRolePayload) => Promise<RoleModel>;
	updateRole: (id: number, payload: UpdateRolePayload) => Promise<RoleModel>;
	deleteRole: (id: number) => Promise<void>;
	getAllRoles: (params?: GetAllRolesParams) => Promise<RoleModel[]>;
}

const rolesApi = (_authHeader: Record<string, string> = {}): RolesApiClient => {
	return {
		getRoleById: async (id: number): Promise<RoleModel> => {
			const response = await axios.get<RoleModel>(
				`${DEFAULT_API_URL}/roles/${id}`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		createRole: async (payload: CreateRolePayload): Promise<RoleModel> => {
			const response = await axios.post<RoleModel>(
				`${DEFAULT_API_URL}/roles`,
				payload,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		updateRole: async (
			id: number,
			payload: UpdateRolePayload
		): Promise<RoleModel> => {
			const response = await axios.patch<RoleModel>(
				`${DEFAULT_API_URL}/roles/${id}`,
				payload,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		deleteRole: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/roles/${id}`, {
				headers: { ..._authHeader },
			});
		},

		getAllRoles: async (params?: GetAllRolesParams): Promise<RoleModel[]> => {
			const response = await axios.get<RoleModel[]>(
				`${DEFAULT_API_URL}/roles`,
				{ params, headers: { ..._authHeader } }
			);
			return response.data;
		},
	};
};

export default rolesApi;
