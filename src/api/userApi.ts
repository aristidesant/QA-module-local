import axios from 'axios';
import type {
	UserModel,
	CreateUserPayload,
	UpdateUserPayload,
} from '~/models/UserModels';
import type { Paginator } from '~/models/Paginator';
import { DEFAULT_API_URL } from './config';

export interface GetAllUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	sortBy?: 'username' | 'email' | 'createdAt' | 'updatedAt';
	sortOrder?: 'ASC' | 'DESC';
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
	};
};

export default userApi;
