import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type { UserRoleModel } from '~/models/UserModels';
import { usePermissions } from '../usePermissions';

vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

const basePermission = {
	id: 1,
	roleId: 1,
	createdAt: 'now',
	updatedAt: 'now',
} as const;

const buildRole = (
	clientId: number,
	module: ModuleEnum,
	permission: PermissionEnum
): UserRoleModel => ({
	clientId,
	roleId: clientId,
	userId: 1,
	modulePermissions: [
		{
			...basePermission,
			module,
			permission,
		},
	],
});

describe('usePermissions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns empty permissions when no user is available', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		(useSessionStore as any).mockReturnValue({
			user: null,
			targetClient: null,
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.activeClientId).toBeNull();
		expect(result.current.canAccessModule(ModuleEnum.CAMPAIGNS)).toBe(false);
	});

	it('prefers the target client over the user client', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		const targetRole = buildRole(2, ModuleEnum.TOOLS, PermissionEnum.READ);

		(useSessionStore as any).mockReturnValue({
			user: {
				clientId: 1,
				userRolesClient: [targetRole],
			},
			targetClient: { id: 2, name: 'Impersonated client' },
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.activeClientId).toBe(2);
		expect(result.current.canAccessModule(ModuleEnum.TOOLS)).toBe(true);
		expect(
			result.current.canPerformAction(ModuleEnum.TOOLS, PermissionEnum.UPDATE)
		).toBe(false);
	});

	it('treats MANAGE as full access for the module', async () => {
		const { useSessionStore } = await import('~/stores/sessionStore');
		const manageRole = buildRole(3, ModuleEnum.SETTINGS, PermissionEnum.MANAGE);

		(useSessionStore as any).mockReturnValue({
			user: {
				clientId: 3,
				userRolesClient: [manageRole],
			},
			targetClient: null,
		});

		const { result } = renderHook(() => usePermissions());

		expect(result.current.hasAnyPermission(ModuleEnum.SETTINGS, [])).toBe(true);
		expect(
			result.current.hasAllPermissions(ModuleEnum.SETTINGS, [
				PermissionEnum.CREATE,
				PermissionEnum.DELETE,
			])
		).toBe(true);
	});
});
