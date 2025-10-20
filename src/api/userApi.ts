import axios from 'axios';
import type { UserModel } from '~/models/UserModels';
import { DEFAULT_API_URL } from './config';

interface UserApiClient {
	getUserById: (id: number) => Promise<UserModel>;
	getCurrentUser: () => Promise<UserModel>;
	updateUser: (id: number, userData: Partial<UserModel>) => Promise<UserModel>;
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
	createUser: (userData: UserModel) => Promise<UserModel>;
	getAllUsers: () => Promise<UserModel[]>;
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
			userData: Partial<UserModel>
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
				`${DEFAULT_API_URL}/users/${id}/name`,
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
		createUser: async (userData: UserModel): Promise<UserModel> => {
			const response = await axios.post<UserModel>(
				`${DEFAULT_API_URL}/users`,
				userData,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Get all users
		getAllUsers: async (): Promise<UserModel[]> => {
			const { data } = await axios.get<UserModel[]>(
				`${DEFAULT_API_URL}/users`,
				{ headers: { ..._authHeader } }
			);
			return data;
		},
	};
};

export default userApi;
