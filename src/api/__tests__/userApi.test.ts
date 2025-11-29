import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import userApi from '../userApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CreateUserPayload, UpdateUserPayload } from '~/models/UserModels';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('userApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getUserById', () => {
		it('should fetch a user by ID', async () => {
			const userId = 1;
			const mockUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockUser));

			const api = userApi();
			const result = await api.getUserById(userId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/users/${userId}`,
				{ headers: {} }
			);
			expect(result).toEqual(mockUser);
		});

		it('should include auth headers when provided', async () => {
			const userId = 1;
			const authHeader = { Authorization: 'Bearer token' };
			const mockUser = { id: 1, username: 'testuser' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockUser));

			const api = userApi(authHeader);
			await api.getUserById(userId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/users/${userId}`,
				{ headers: authHeader }
			);
		});

		it('should throw error when user not found', async () => {
			const userId = 999;
			const error = createMockAxiosError('User not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = userApi();
			await expect(api.getUserById(userId)).rejects.toThrow('User not found');
		});
	});

	describe('getCurrentUser', () => {
		it('should fetch the current authenticated user', async () => {
			const mockUser = {
				id: 1,
				username: 'currentuser',
				email: 'current@example.com',
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockUser));

			const api = userApi();
			const result = await api.getCurrentUser();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/users/me`, {
				headers: {},
			});
			expect(result).toEqual(mockUser);
		});

		it('should throw error when not authenticated', async () => {
			const error = createMockAxiosError('Unauthorized', 401);
			(axios.get as Mock).mockRejectedValue(error);

			const api = userApi();
			await expect(api.getCurrentUser()).rejects.toThrow('Unauthorized');
		});
	});

	describe('updateUser', () => {
		it('should update a user', async () => {
			const userId = 1;
			const updateData: UpdateUserPayload = {
				firstName: 'John',
				lastName: 'Doe',
			};
			const mockResponse = { id: 1, firstName: 'John', lastName: 'Doe' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = userApi();
			const result = await api.updateUser(userId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/users/${userId}`,
				updateData,
				{ headers: {} }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateUserName', () => {
		it('should update user name by ID', async () => {
			const userId = 1;
			const firstName = 'John';
			const lastName = 'Doe';
			const mockResponse = { id: 1, firstName, lastName };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = userApi();
			const result = await api.updateUserName(userId, firstName, lastName);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/users/update-name/${userId}`,
				{ firstName, lastName },
				{ headers: {} }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCurrentUserName', () => {
		it('should update current user name', async () => {
			const firstName = 'Jane';
			const lastName = 'Smith';
			const mockResponse = { id: 1, firstName, lastName };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = userApi();
			const result = await api.updateCurrentUserName(firstName, lastName);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/users/me/update-name`,
				{ firstName, lastName },
				{ headers: {} }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteUser', () => {
		it('should delete a user', async () => {
			const userId = 1;
			(axios.delete as Mock).mockResolvedValue(createMockResponse(undefined));

			const api = userApi();
			await api.deleteUser(userId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/users/${userId}`,
				{ headers: {} }
			);
		});

		it('should throw error when deleting non-existent user', async () => {
			const userId = 999;
			const error = createMockAxiosError('User not found', 404);
			(axios.delete as Mock).mockRejectedValue(error);

			const api = userApi();
			await expect(api.deleteUser(userId)).rejects.toThrow('User not found');
		});
	});

	describe('createUser', () => {
		it('should create a new user', async () => {
			const userData: CreateUserPayload = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'password123',
				clientId: 1,
			};
			const mockResponse = {
				id: 2,
				username: 'newuser',
				email: 'new@example.com',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = userApi();
			const result = await api.createUser(userData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/users`,
				userData,
				{ headers: {} }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when username already exists', async () => {
			const userData = {
				username: 'existinguser',
				email: 'existing@example.com',
				password: 'password123',
				clientId: 1,
			} as CreateUserPayload;
			const error = createMockAxiosError('Username already exists', 409);
			(axios.post as Mock).mockRejectedValue(error);

			const api = userApi();
			await expect(api.createUser(userData)).rejects.toThrow(
				'Username already exists'
			);
		});
	});

	describe('getAllUsers', () => {
		it('should fetch all users without params', async () => {
			const mockResponse = {
				data: [
					{ id: 1, username: 'user1' },
					{ id: 2, username: 'user2' },
				],
				total: 2,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = userApi();
			const result = await api.getAllUsers();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/users`, {
				params: undefined,
				headers: {},
			});
			expect(result).toEqual(mockResponse);
		});

		it('should fetch users with pagination and filters', async () => {
			const params = {
				page: 2,
				limit: 20,
				search: 'john',
				sortBy: 'username' as const,
				sortOrder: 'ASC' as const,
			};
			const mockResponse = {
				data: [{ id: 1, username: 'john' }],
				total: 1,
				page: 2,
				limit: 20,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = userApi();
			const result = await api.getAllUsers(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/users`, {
				params,
				headers: {},
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
