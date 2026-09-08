import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { UserModel } from '~/models/UserModels';
import { useSessionStore } from '~/stores/sessionStore';
import { useIsSuperAdmin } from '~/hooks/useIsSuperAdmin';
import { useRoleMockStore } from '~/stores/roleMockStore';

interface TokenRolePayload {
	roles?: string[];
}

const normalizeRole = (role?: string | null) =>
	role
		? role
				.trim()
				.toUpperCase()
				.replace(/[\s_-]/g, '')
		: null;

const isQaAdminRole = (role?: string | null) =>
	normalizeRole(role) === 'QAADMIN';

/**
 * Pure QA_ADMIN check against the user's roles for the active client — matches
 * `role.code` (normalized: uppercased, separators stripped) === 'QAADMIN'.
 *
 * This does NOT include the super-admin fallback: it answers "does this user
 * genuinely hold the QA_ADMIN role on the active client?", which is the trigger
 * for the login app-chooser. For "may access the QA app" use {@link useIsQaAdmin}.
 */
export const hasQaAdminRole = (
	user: UserModel | null,
	activeClientId: number | null
): boolean =>
	user?.userRolesClient?.some((userRole) => {
		if (activeClientId && userRole.clientId !== activeClientId) {
			return false;
		}
		return isQaAdminRole(userRole.role?.code);
	}) ?? false;

/**
 * Whether the current session may access the QA app: the QA_ADMIN role on the
 * active client, OR platform super-admin (so platform admins are never locked
 * out). This is the single gate every QA surface reads — the user-menu switch,
 * the QA sidebar nav, and the /qa route guard. Anyone failing this check sees
 * nothing QA-related anywhere.
 */
export const useIsQaAdmin = (): boolean => {
	const { user, targetClient, token } = useSessionStore();
	const isSuperAdmin = useIsSuperAdmin();
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;

	return useMemo(() => {
		// Development mode bypass: allow access if running in dev/localhost
		if (import.meta.env.DEV) {
			const isDev = typeof window !== 'undefined' &&
				(window.location.hostname === 'localhost' ||
				 window.location.hostname === '127.0.0.1' ||
				 window.location.hostname.includes('localhost:'));
			if (isDev && (user?.email === 'aristides.02@gmail.com' || user?.username === 'asantana')) {
				return true;
			}
			// Also allow if no user but in dev mode (development access)
			if (isDev && !user) {
				return true;
			}
		}

		if (isSuperAdmin) {
			return true;
		}
		if (previewRole === 'supervisor') {
			return true;
		}
		if (hasQaAdminRole(user, activeClientId)) {
			return true;
		}
		if (!token) {
			return false;
		}
		try {
			const decoded = jwtDecode<TokenRolePayload>(token);
			return decoded.roles?.some(isQaAdminRole) ?? false;
		} catch {
			return false;
		}
	}, [isSuperAdmin, previewRole, user, activeClientId, token]);
};

export default useIsQaAdmin;
