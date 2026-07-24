import { useMemo } from 'react';
import type { UserModel, UserRoleModel } from '~/models/UserModels';
import { useSessionStore } from '~/stores/sessionStore';
import type { BackofficeRoleCode } from '~/modules/backoffice/constants/BackofficeRoleConstants';

type UserRoleWithCode = UserRoleModel & {
	roleCode?: string | null;
};

const getRoleCode = (role: UserRoleWithCode): string | null =>
	role.role?.code ?? role.roleCode ?? null;

export const hasActiveClientRoleCode = (
	user: UserModel | null | undefined,
	activeClientId: number | null,
	roleCode: string
): boolean => {
	if (!user || !activeClientId) return false;

	return Boolean(
		user.userRolesClient?.some((userRole) => {
			const role = userRole as UserRoleWithCode;
			return (
				role.clientId === activeClientId &&
				getRoleCode(role) === roleCode &&
				role.role?.isActive !== false
			);
		})
	);
};

export const hasAnyActiveClientRoleCode = (
	user: UserModel | null | undefined,
	activeClientId: number | null,
	roleCodes: readonly string[]
) =>
	roleCodes.some((roleCode) =>
		hasActiveClientRoleCode(user, activeClientId, roleCode)
	);

export const useBackofficeRole = () => {
	const { user, targetClient } = useSessionStore();
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;

	return useMemo(
		() => ({
			activeClientId,
			isAgent: hasActiveClientRoleCode(
				user,
				activeClientId,
				'BACKOFFICE_AGENT'
			),
			isAdmin: hasActiveClientRoleCode(
				user,
				activeClientId,
				'BACKOFFICE_ADMIN'
			),
			hasBackofficeRole: hasAnyActiveClientRoleCode(user, activeClientId, [
				'BACKOFFICE_AGENT',
				'BACKOFFICE_ADMIN',
			]),
		}),
		[user, activeClientId]
	);
};

export type { BackofficeRoleCode };
