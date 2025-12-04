import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
import type { RoleModulePermissionModel } from '~/models/RoleModel';
import type { UserModel, UserRoleModel } from '~/models/UserModels';

export type PermissionMap = Partial<Record<ModuleEnum, Set<PermissionEnum>>>;

const VALID_PERMISSIONS = new Set(Object.values(PermissionEnum));
const VALID_MODULES = new Set(Object.values(ModuleEnum));

type PermissionCarrier =
	| RoleModulePermissionModel
	| {
			module?: string | null;
			permission?: string | null;
	  };

const normalizeModule = (module?: string | null) => {
	if (!module || !VALID_MODULES.has(module as ModuleEnum)) return null;
	return module as ModuleEnum;
};

const normalizePermission = (permission?: string | null) => {
	if (!permission || !VALID_PERMISSIONS.has(permission as PermissionEnum)) {
		return null;
	}
	return permission as PermissionEnum;
};

const getModulePermissionsFromRole = (role?: UserRoleModel | null) => {
	if (!role) return [] as PermissionCarrier[];

	if (role.modulePermissions?.length) {
		return role.modulePermissions;
	}

	if (role.role?.modulePermissions?.length) {
		return role.role.modulePermissions;
	}

	return [];
};

export const buildPermissionMapFromRoles = (
	roles: UserRoleModel[] | undefined | null,
	activeClientId: number | null
): PermissionMap => {
	if (!roles || !roles.length || !activeClientId) {
		return {};
	}

	return roles.reduce<PermissionMap>((map, role) => {
		if (!role || role.clientId !== activeClientId) return map;

		const permissions = getModulePermissionsFromRole(role);

		permissions.forEach((item) => {
			const module = normalizeModule(item.module);
			const permission = normalizePermission(item.permission);

			if (!module || !permission) return;

			if (!map[module]) {
				map[module] = new Set<PermissionEnum>();
			}

			map[module]?.add(permission);
		});

		return map;
	}, {});
};

export const buildPermissionMapFromUser = (
	user: UserModel | null,
	activeClientId: number | null
): PermissionMap => {
	if (!user || !activeClientId) return {};

	return buildPermissionMapFromRoles(user.userRolesClient, activeClientId);
};

export const canAccessModule = (
	permissionMap: PermissionMap,
	module: ModuleEnum
) => {
	const permissions = permissionMap[module];
	return Boolean(permissions && permissions.size > 0);
};

export const canPerformAction = (
	permissionMap: PermissionMap,
	module: ModuleEnum,
	requiredPermission: PermissionEnum
) => {
	const permissions = permissionMap[module];
	if (!permissions) return false;
	if (permissions.has(PermissionEnum.MANAGE)) return true;
	return permissions.has(requiredPermission);
};

export const hasAnyPermission = (
	permissionMap: PermissionMap,
	module: ModuleEnum,
	requiredPermissions: PermissionEnum[]
) => {
	const permissions = permissionMap[module];
	if (!permissions) return false;
	if (permissions.has(PermissionEnum.MANAGE)) return true;

	return requiredPermissions.some((permission) => permissions.has(permission));
};

export const hasAllPermissions = (
	permissionMap: PermissionMap,
	module: ModuleEnum,
	requiredPermissions: PermissionEnum[]
) => {
	const permissions = permissionMap[module];
	if (!permissions) return false;
	if (permissions.has(PermissionEnum.MANAGE)) return true;

	return requiredPermissions.every((permission) => permissions.has(permission));
};
