import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import React from 'react';
import * as roleQueries from '../roleQueries';
import rolesApi from '~/api/rolesApi';
import type { CreateRolePayload, UpdateRolePayload } from '~/models/RoleModel';
import type { RoleModel } from '~/models/RoleModel';
import type { Paginator } from '~/models/Paginator';

vi.mock('~/api/rolesApi');

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

const wrapper =
	(queryClient: QueryClient) =>
	({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

describe('roleQueries', () => {
	let mockGetAllRoles: Mock;
	let mockGetRoleById: Mock;
	let mockCreateRole: Mock;
	let mockUpdateRole: Mock;
	let mockDeleteRole: Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetAllRoles = vi.fn();
		mockGetRoleById = vi.fn();
		mockCreateRole = vi.fn();
		mockUpdateRole = vi.fn();
		mockDeleteRole = vi.fn();
		(rolesApi as unknown as Mock).mockReturnValue({
			getAllRoles: mockGetAllRoles,
			getRoleById: mockGetRoleById,
			createRole: mockCreateRole,
			updateRole: mockUpdateRole,
			deleteRole: mockDeleteRole,
		});
	});

	it('useGetAllRoles returns roles data', async () => {
		const mockData: Paginator<RoleModel> = {
			data: [
				{
					id: 1,
					name: 'Admin',
					code: 'ADMIN',
					description: 'Admin role',
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

		mockGetAllRoles.mockResolvedValue(mockData);

		const queryClient = createQueryClient();
		const { result } = renderHook(() => roleQueries.useGetAllRoles(), {
			wrapper: wrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

		expect(mockGetAllRoles).toHaveBeenCalled();
		expect(result.current.data).toEqual(mockData);
	});

	it('useGetRole returns role data', async () => {
		const mockRole: RoleModel = {
			id: 2,
			name: 'Support',
			code: 'SUPPORT',
			description: 'Support role',
			isSystem: false,
			isActive: true,
			createdAt: '2025-01-02T00:00:00Z',
			updatedAt: '2025-01-02T00:00:00Z',
			deletedAt: null,
			modulePermissions: [],
		};

		mockGetRoleById.mockResolvedValue(mockRole);
		const queryClient = createQueryClient();
		const { result } = renderHook(() => roleQueries.useGetRole(2), {
			wrapper: wrapper(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

		expect(mockGetRoleById).toHaveBeenCalledWith(2);
		expect(result.current.data).toEqual(mockRole);
	});

	it('useCreateRole calls API and invalidates roles cache', async () => {
		const payload: CreateRolePayload = {
			name: 'New Role',
			code: 'NEW_ROLE',
			description: 'New Role',
			isSystem: false,
			isActive: true,
			modulePermissions: [],
		};

		const mockResult: RoleModel = {
			id: 10,
			...payload,
			createdAt: '2025-01-05T00:00:00Z',
			updatedAt: '2025-01-05T00:00:00Z',
			deletedAt: null,
		} as RoleModel;

		mockCreateRole.mockResolvedValue(mockResult);

		const queryClient = createQueryClient();
		const spyInvalidate = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => roleQueries.useCreateRole(), {
			wrapper: wrapper(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync(payload);
		});

		expect(mockCreateRole).toHaveBeenCalledWith(payload);
		expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['roles'] });
	});

	it('useUpdateRole calls API and updates cache', async () => {
		const payload: UpdateRolePayload = { name: 'Updated Role' };
		const mockResult: RoleModel = {
			id: 3,
			name: 'Updated Role',
			code: 'ROLE3',
			description: 'Updated role',
			isSystem: false,
			isActive: true,
			createdAt: '2025-01-01T00:00:00Z',
			updatedAt: '2025-01-06T00:00:00Z',
			deletedAt: null,
			modulePermissions: [],
		};
		mockUpdateRole.mockResolvedValue(mockResult);

		const queryClient = createQueryClient();
		const spyInvalidate = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => roleQueries.useUpdateRole(), {
			wrapper: wrapper(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync({ id: 3, data: payload });
		});

		expect(mockUpdateRole).toHaveBeenCalledWith(3, payload);
		expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['roles'] });
	});

	it('useDeleteRole calls API and invalidates cache', async () => {
		mockDeleteRole.mockResolvedValue(undefined as unknown as void);

		const queryClient = createQueryClient();
		const spyInvalidate = vi.spyOn(queryClient, 'invalidateQueries');

		const { result } = renderHook(() => roleQueries.useDeleteRole(), {
			wrapper: wrapper(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync(5);
		});

		expect(mockDeleteRole).toHaveBeenCalledWith(5);
		expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['roles'] });
		expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['role', 5] });
	});
});
