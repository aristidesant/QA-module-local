import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useSessionStore } from '~/stores/sessionStore';

interface TokenRolePayload {
	roles?: string[];
}

const isSuperAdminRole = (role?: string | null) => {
	if (!role) return false;
	const normalizedRole = role
		.trim()
		.toUpperCase()
		.replace(/[\s_-]/g, '');
	return normalizedRole === 'SUPERADMIN';
};

export const useIsSuperAdmin = () => {
	const { user, targetClient, token } = useSessionStore();
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;

	return useMemo(() => {
		const hasActiveClientRole = user?.userRolesClient?.some((userRole) => {
			if (activeClientId && userRole.clientId !== activeClientId) {
				return false;
			}

			return (
				isSuperAdminRole(userRole.role?.code) ||
				isSuperAdminRole(userRole.role?.name)
			);
		});

		if (hasActiveClientRole) {
			return true;
		}

		if (!token) {
			return false;
		}

		try {
			const decoded = jwtDecode<TokenRolePayload>(token);
			return decoded.roles?.some(isSuperAdminRole) ?? false;
		} catch {
			return false;
		}
	}, [activeClientId, token, user?.userRolesClient]);
};

export default useIsSuperAdmin;
