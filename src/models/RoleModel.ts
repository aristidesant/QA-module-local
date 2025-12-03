/**
 * Full RoleModulePermission model as returned by the API
 */
export interface RoleModulePermissionModel {
	id: number;
	roleId: number;
	module: string;
	permission: string;
	createdAt: string | Date;
	updatedAt: string | Date;
	deletedAt?: string | Date | null;
}

/**
 * Payload for creating/updating module permissions
 * - id is optional: include it when updating an existing permission
 * - omit id when creating a new permission
 */
export interface RoleModulePermissionPayload {
	id?: number;
	module: string;
	permission: string;
}

/**
 * Form value representation for module permissions
 * Used internally in forms to track permissions with optional IDs
 */
export interface ModulePermissionFormValue {
	id?: number;
	module: string;
	permission: string;
}

/**
 * Full Role model as returned by the API
 */
export interface RoleModel {
	id: number;
	name: string;
	code: string;
	description?: string | null;
	isSystem: boolean;
	isActive: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
	deletedAt?: string | Date | null;
	modulePermissions?: RoleModulePermissionModel[];
}

/**
 * Payload for creating a new role
 */
export interface CreateRolePayload {
	name: string;
	code: string;
	description?: string;
	isSystem: boolean;
	isActive: boolean;
	modulePermissions?: RoleModulePermissionPayload[];
}

/**
 * Payload for updating an existing role
 */
export interface UpdateRolePayload {
	name?: string;
	code?: string;
	description?: string;
	isActive?: boolean;
	modulePermissions?: RoleModulePermissionPayload[];
}
