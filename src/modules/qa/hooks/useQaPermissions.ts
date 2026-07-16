import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useSessionStore } from '~/stores/sessionStore';

interface TokenRolePayload {
	roles?: string[];
}

/**
 * Roles allowed to dispute evaluations. Compared after normalization, so
 * qa-backend's SUPER_ADMIN and UCXM's SUPERADMIN both match.
 */
const DISPUTE_ROLES = new Set(['SUPERADMIN', 'ADMIN', 'MANAGER']);

const normalizeRole = (role?: string | null) =>
	role
		? role
				.trim()
				.toUpperCase()
				.replace(/[\s_-]/g, '')
		: null;

/**
 * QA-feature gating on top of UCXM's session. Mirrors the QA app's
 * usePermissions: role names decide who can dispute evaluations, and users
 * without any role information stay allowed (permissive default) until
 * ModuleEnum.QA permissions land.
 */
export function useQaPermissions() {
	const { user, targetClient, token } = useSessionStore();
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;

	return useMemo(() => {
		const roles: string[] = [];

		user?.userRolesClient?.forEach((userRole) => {
			if (activeClientId && userRole.clientId !== activeClientId) {
				return;
			}

			const role =
				normalizeRole(userRole.role?.code) ??
				normalizeRole(userRole.role?.name);
			if (role) {
				roles.push(role);
			}
		});

		if (roles.length === 0 && token) {
			try {
				const decoded = jwtDecode<TokenRolePayload>(token);
				decoded.roles?.forEach((claim) => {
					const role = normalizeRole(claim);
					if (role) {
						roles.push(role);
					}
				});
			} catch {
				// Ignore malformed tokens; fall through to the permissive default.
			}
		}

		const hasRoleClaims = roles.length > 0;

		return {
			roles,
			hasRoleClaims,
			canDisputeEvaluations:
				!hasRoleClaims || roles.some((role) => DISPUTE_ROLES.has(role)),
		};
	}, [activeClientId, token, user?.userRolesClient]);
}
