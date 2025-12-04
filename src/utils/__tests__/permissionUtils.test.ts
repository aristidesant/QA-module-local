import { describe, expect, it } from 'vitest';
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
import type { UserRoleModel } from '~/models/UserModels';
import {
	buildPermissionMapFromRoles,
	buildPermissionMapFromUser,
	canAccessModule,
	canPerformAction,
	hasAllPermissions,
	hasAnyPermission,
} from '../permissionUtils';

const basePermission = {
	id: 1,
	roleId: 1,
	createdAt: 'now',
	updatedAt: 'now',
} as const;

const createRole = (
	clientId: number,
	module: ModuleEnum,
	permission: PermissionEnum
): UserRoleModel => ({
	clientId,
	userId: 1,
	roleId: clientId * 10,
	modulePermissions: [
		{
			...basePermission,
			module,
			permission,
		},
	],
});

describe('permissionUtils', () => {
	it('builds permission map for the active client only', () => {
		const roles: UserRoleModel[] = [
			createRole(1, ModuleEnum.CAMPAIGNS, PermissionEnum.READ),
			createRole(2, ModuleEnum.CONTACTS, PermissionEnum.CREATE),
		];

		const map = buildPermissionMapFromRoles(roles, 1);

		expect(canAccessModule(map, ModuleEnum.CAMPAIGNS)).toBe(true);
		expect(canAccessModule(map, ModuleEnum.CONTACTS)).toBe(false);
	});

	it('treats MANAGE as full access within the module', () => {
		const roles: UserRoleModel[] = [
			createRole(3, ModuleEnum.TOOLS, PermissionEnum.MANAGE),
		];

		const map = buildPermissionMapFromRoles(roles, 3);

		expect(canPerformAction(map, ModuleEnum.TOOLS, PermissionEnum.READ)).toBe(
			true
		);
		expect(
			hasAnyPermission(map, ModuleEnum.TOOLS, [
				PermissionEnum.CREATE,
				PermissionEnum.DELETE,
			])
		).toBe(true);
		expect(
			hasAllPermissions(map, ModuleEnum.TOOLS, [
				PermissionEnum.CREATE,
				PermissionEnum.DELETE,
			])
		).toBe(true);
	});

	it('merges permissions from multiple roles within the same module', () => {
		const roles: UserRoleModel[] = [
			createRole(5, ModuleEnum.CONVERSATIONS, PermissionEnum.READ),
			createRole(5, ModuleEnum.CONVERSATIONS, PermissionEnum.UPDATE),
		];

		const map = buildPermissionMapFromRoles(roles, 5);

		expect(
			hasAllPermissions(map, ModuleEnum.CONVERSATIONS, [
				PermissionEnum.READ,
				PermissionEnum.UPDATE,
			])
		).toBe(true);
	});

	it('ignores unknown permissions and empty modules', () => {
		const roles: UserRoleModel[] = [
			{
				clientId: 7,
				roleId: 99,
				userId: 1,
				modulePermissions: [
					{
						...basePermission,
						module: ModuleEnum.USERS,
						permission: 'UNKNOWN' as PermissionEnum,
					},
					{
						...basePermission,
						module: '' as ModuleEnum,
						permission: PermissionEnum.READ,
					},
				],
			},
		];

		const map = buildPermissionMapFromRoles(roles, 7);

		expect(canAccessModule(map, ModuleEnum.USERS)).toBe(false);
	});

	it('builds from user object using userRolesClient', () => {
		const user = {
			clientId: 9,
			userRolesClient: [
				createRole(9, ModuleEnum.REPORTS, PermissionEnum.EXPORT),
			],
		} as any;

		const map = buildPermissionMapFromUser(user, 9);

		expect(
			canPerformAction(map, ModuleEnum.REPORTS, PermissionEnum.EXPORT)
		).toBe(true);
	});
});
