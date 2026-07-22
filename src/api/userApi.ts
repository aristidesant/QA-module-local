import axios from 'axios';
import type {
	UserModel,
	CreateUserPayload,
	UpdateUserPayload,
	UserRoleModel,
} from '~/models/UserModels';
import type { Paginator } from '~/models/Paginator';
import { useSessionStore } from '~/stores/sessionStore';
import { DEFAULT_API_URL } from './config';

const getClientHeaders = (): Record<string, string> => {
	const { user, targetClient } = useSessionStore.getState();
	const clientId = targetClient?.id ?? user?.clientId ?? user?.client?.id;
	return clientId ? { 'x-client-id': String(clientId) } : {};
};

export interface SimpleUser {
	id: number;
	firstName: string | null;
	lastName: string | null;
}

export interface GetAllUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	sortBy?:
		| 'id'
		| 'username'
		| 'email'
		| 'firstName'
		| 'lastName'
		| 'status'
		| 'createdAt'
		| 'updatedAt';
	sortOrder?: 'ASC' | 'DESC';
	clientId?: number;
}

interface UserApiClient {
	getUserById: (id: number) => Promise<UserModel>;
	getCurrentUser: () => Promise<UserModel>;
	updateUser: (id: number, userData: UpdateUserPayload) => Promise<UserModel>;
	updateUserName: (
		id: number,
		firstName: string,
		lastName: string
	) => Promise<UserModel>;
	updateCurrentUserName: (
		firstName: string,
		lastName: string
	) => Promise<UserModel>;
	deleteUser: (id: number) => Promise<void>;
	createUser: (userData: CreateUserPayload) => Promise<UserModel>;
	getAllUsers: (params?: GetAllUsersParams) => Promise<Paginator<UserModel>>;
	getSimpleUsers: (clientId: number) => Promise<SimpleUser[]>;
	getUserRoles: (userId: number) => Promise<UserRoleModel[]>;
}

// User API client (uses global axios interceptors for auth)
const userApi = (_authHeader: Record<string, string> = {}): UserApiClient => {
	return {
		// Get user by ID
		getUserById: async (id: number): Promise<UserModel> => {
			const response = await axios.get<UserModel>(
				`${DEFAULT_API_URL}/users/${id}`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Get current authenticated user
		getCurrentUser: async (): Promise<UserModel> => {
			const response = await axios.get<UserModel>(
				`${DEFAULT_API_URL}/users/me`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Update user
		updateUser: async (
			id: number,
			userData: UpdateUserPayload
		): Promise<UserModel> => {
			const response = await axios.patch<UserModel>(
				`${DEFAULT_API_URL}/users/${id}`,
				userData,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Update user name by ID
		updateUserName: async (
			id: number,
			firstName: string,
			lastName: string
		): Promise<UserModel> => {
			const response = await axios.patch<UserModel>(
				`${DEFAULT_API_URL}/users/update-name/${id}`,
				{ firstName, lastName },
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Update current user's name
		updateCurrentUserName: async (
			firstName: string,
			lastName: string
		): Promise<UserModel> => {
			const response = await axios.patch<UserModel>(
				`${DEFAULT_API_URL}/users/me/update-name`,
				{ firstName, lastName },
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Delete user
		deleteUser: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/users/${id}`, {
				headers: { ..._authHeader },
			});
		},

		// Create user
		createUser: async (userData: CreateUserPayload): Promise<UserModel> => {
			const response = await axios.post<UserModel>(
				`${DEFAULT_API_URL}/users`,
				userData,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Get all users with pagination
		getAllUsers: async (
			params?: GetAllUsersParams
		): Promise<Paginator<UserModel>> => {
			const response = await axios.get<Paginator<UserModel>>(
				`${DEFAULT_API_URL}/users`,
				{
					params,
					headers: { ..._authHeader },
				}
			);
			return response.data;
		},

		// Get simple users list (id, firstName, lastName) by client
		getSimpleUsers: async (clientId: number): Promise<SimpleUser[]> => {
			const response = await axios.get<SimpleUser[]>(
				`${DEFAULT_API_URL}/users/simple`,
				{
					params: { clientId },
					headers: { ..._authHeader },
				}
			);
			return response.data;
		},

		getUserRoles: async (userId: number): Promise<UserRoleModel[]> => {
			const response = await axios.get<UserRoleModel[]>(
				`${DEFAULT_API_URL}/users/${userId}/roles`,
				{ headers: { ...getClientHeaders(), ..._authHeader } }
			);
			return response.data;
		},
	};
};

export default userApi;
