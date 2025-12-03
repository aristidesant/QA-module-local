import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import rolesApi from '../rolesApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { RoleModel } from '~/models/RoleModel';
import type { Paginator } from '~/models/Paginator';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('rolesApi', () => {
	let api: ReturnType<typeof rolesApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = rolesApi();
	});

	describe('getAllRoles', () => {
		it('should get all roles successfully', async () => {
			const mockData: Paginator<RoleModel> = {
				data: [
					{
						id: 1,
						name: 'Admin',
						code: 'ADMIN',
						description: 'Administrator role',
						isSystem: false,
						isActive: true,
						createdAt: '2025-01-01T00:00:00Z',
						updatedAt: '2025-01-01T00:00:00Z',
						deletedAt: null,
						modulePermissions: [],
					},
				],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};

			(axios.get as any).mockResolvedValue(createMockResponse(mockData));

			const result = await api.getAllRoles({ page: 1, limit: 10 });

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/roles`, {
				params: { page: 1, limit: 10 },
				headers: {},
			});
			expect(result).toEqual(mockData);
		});

		it('should throw error when request fails', async () => {
			const error = createMockAxiosError('Server error', 500);
			(axios.get as any).mockRejectedValue(error);

			await expect(api.getAllRoles()).rejects.toThrow('Server error');
		});
	});

	describe('getRoleById', () => {
		it('should get role by ID', async () => {
			const id = 1;
			const mockRole: RoleModel = {
				id: 1,
				name: 'Admin',
				code: 'ADMIN',
				description: 'Administrator role',
				isSystem: false,
				isActive: true,
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
				deletedAt: null,
				modulePermissions: [],
			};
			(axios.get as any).mockResolvedValue(createMockResponse(mockRole));

			const result = await api.getRoleById(id);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/roles/${id}`, {
				headers: {},
			});
			expect(result).toEqual(mockRole);
		});
	});

	describe('createRole', () => {
		it('should create a role successfully', async () => {
			const payload = {
				name: 'Support',
				code: 'SUPPORT',
				description: 'Support role',
				isSystem: false,
				isActive: true,
				modulePermissions: [],
			};
			const mockResult: RoleModel = {
				id: 2,
				...payload,
				createdAt: '2025-01-02T00:00:00Z',
				updatedAt: '2025-01-02T00:00:00Z',
				deletedAt: null,
			} as RoleModel;

			(axios.post as any).mockResolvedValue(createMockResponse(mockResult));

			const result = await api.createRole(payload as any);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/roles`,
				payload,
				{ headers: {} }
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe('updateRole', () => {
		it('should update a role successfully', async () => {
			const id = 1;
			const payload = { name: 'Admin Updated' };
			const mockResult: RoleModel = {
				id: 1,
				name: 'Admin Updated',
				code: 'ADMIN',
				description: 'Administrator role updated',
				isSystem: false,
				isActive: true,
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-03T00:00:00Z',
				deletedAt: null,
				modulePermissions: [],
			};
			(axios.patch as any).mockResolvedValue(createMockResponse(mockResult));

			const result = await api.updateRole(id, payload as any);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/roles/${id}`,
				payload,
				{ headers: {} }
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe('deleteRole', () => {
		it('should delete a role successfully', async () => {
			const id = 1;
			const mockResponse = { message: 'Role deleted' };
			(axios.delete as any).mockResolvedValue(createMockResponse(mockResponse));

			await api.deleteRole(id);

			expect(axios.delete).toHaveBeenCalledWith(`${TEST_API_URL}/roles/${id}`, {
				headers: {},
			});
		});
	});
});
