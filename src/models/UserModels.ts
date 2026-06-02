import type { ClientModel } from './ClientModel';
import type { RoleModel, RoleModulePermissionModel } from './RoleModel';
import { PermissionEnum } from '~/constants/PermissionEnum';

export interface UserModel {
	id: number;
	email: string;
	username: string;
	firstName?: string | null;
	lastName?: string | null;
	employeeId?: string | null;
	status: string;
	clientId: number;
	client?: Pick<
		ClientModel,
		'id' | 'name' | 'alias' | 'identifier' | 'email'
	> | null;
	createdAt: string | Date;
	updatedAt: string | Date;
	deletedAt: string | Date | null;
	mfaEnabled?: boolean;
	needToChangePassword?: boolean;
	lastLogin?: string | Date | null;
	userRolesClient?: UserRoleModel[];
}

export type UserRoleModel = {
	id?: number;
	userId: number;
	roleId: number;
	clientId: number;
	role?: RoleModel | null;
	modulePermissions?: RoleModulePermissionModel[];
};

export interface ImpersonatedClient {
	sub: number;
	email: string;
	username: string;
	clientId: number;
	roles: string[];
	permissions: PermissionEnum[];
	originalClientId: number;
	impersonatedAt: string;
	iat: number;
	exp: number;
}

export interface CreateUserPayload extends Omit<
	UserModel,
	'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'status'
> {
	status?: string;
	password?: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
