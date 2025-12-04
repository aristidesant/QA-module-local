import { useCallback, useMemo } from 'react';
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
import { useSessionStore } from '~/stores/sessionStore';
import {
	buildPermissionMapFromUser,
	canAccessModule,
	canPerformAction,
	hasAllPermissions,
	hasAnyPermission,
	type PermissionMap,
} from '~/utils/permissionUtils';

export interface PermissionEvaluator {
	activeClientId: number | null;
	permissionMap: PermissionMap;
	canAccessModule: (module: ModuleEnum) => boolean;
	canPerformAction: (
		module: ModuleEnum,
		requiredPermission: PermissionEnum
	) => boolean;
	hasAnyPermission: (
		module: ModuleEnum,
		requiredPermissions: PermissionEnum[]
	) => boolean;
	hasAllPermissions: (
		module: ModuleEnum,
		requiredPermissions: PermissionEnum[]
	) => boolean;
}

/**
 * Derive a deterministic permission evaluator for the current session.
 *
 * How it works (aligned with Permission Architecture Guidelines):
 * - Determines the active client from `targetClient` when impersonating, otherwise the user's own client.
 * - Builds a permission map from the user's roles filtered by the active client.
 * - Treats MANAGE as elevated access for a module (any action is allowed when present).
 * - Exposes helpers to check module visibility and action-level permissions in a unified way.
 *
 * Typical usage:
 * const { canAccessModule, canPerformAction, hasAnyPermission, hasAllPermissions } = usePermissions();
 * if (!canAccessModule(ModuleEnum.CONTACTS)) return <NoAccess />;
 * const canEdit = canPerformAction(ModuleEnum.CONTACTS, PermissionEnum.UPDATE);
 */
export const usePermissions = (): PermissionEvaluator => {
	const { user, targetClient } = useSessionStore();
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;

	const permissionMap = useMemo(
		() => buildPermissionMapFromUser(user, activeClientId),
		[user, activeClientId]
	);

	const handleModuleAccess = useCallback(
		(module: ModuleEnum) => canAccessModule(permissionMap, module),
		[permissionMap]
	);

	const handleActionPermission = useCallback(
		(module: ModuleEnum, requiredPermission: PermissionEnum) =>
			canPerformAction(permissionMap, module, requiredPermission),
		[permissionMap]
	);

	const handleHasAny = useCallback(
		(module: ModuleEnum, requiredPermissions: PermissionEnum[]) =>
			hasAnyPermission(permissionMap, module, requiredPermissions),
		[permissionMap]
	);

	const handleHasAll = useCallback(
		(module: ModuleEnum, requiredPermissions: PermissionEnum[]) =>
			hasAllPermissions(permissionMap, module, requiredPermissions),
		[permissionMap]
	);

	return {
		activeClientId,
		permissionMap,
		canAccessModule: handleModuleAccess,
		canPerformAction: handleActionPermission,
		hasAnyPermission: handleHasAny,
		hasAllPermissions: handleHasAll,
	};
};

export default usePermissions;
