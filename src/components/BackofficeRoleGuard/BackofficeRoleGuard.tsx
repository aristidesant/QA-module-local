import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import AccessDenied from '~/components/AccessDenied/AccessDenied';
import { usePermissions } from '~/hooks/usePermissions';
import { useBackofficeRole } from '~/hooks/useBackofficeRole';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

interface BackofficeRoleGuardProps {
	children?: ReactNode;
}

const BackofficeRoleGuard = ({ children }: BackofficeRoleGuardProps) => {
	const { canPerformAction } = usePermissions();
	const { hasBackofficeRole } = useBackofficeRole();

	if (
		!canPerformAction(ModuleEnum.BACKOFFICE_CASES, PermissionEnum.READ) ||
		!hasBackofficeRole
	) {
		return <AccessDenied />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export const BackofficeAdminGuard = ({
	children,
}: BackofficeRoleGuardProps) => {
	const { canPerformAction } = usePermissions();
	const { isAdmin } = useBackofficeRole();

	if (
		!canPerformAction(ModuleEnum.BACKOFFICE_CASES, PermissionEnum.READ) ||
		!isAdmin
	) {
		return <AccessDenied />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export const BackofficeAgentGuard = ({
	children,
}: BackofficeRoleGuardProps) => {
	const { canPerformAction } = usePermissions();
	const { isAgent, isAdmin } = useBackofficeRole();

	if (isAdmin && !isAgent) {
		return <Navigate to='/backoffice/supervisor' replace />;
	}

	if (
		!canPerformAction(ModuleEnum.BACKOFFICE_CASES, PermissionEnum.READ) ||
		!isAgent
	) {
		return <AccessDenied />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export const BackofficeHomeRedirect = () => {
	const { isAdmin } = useBackofficeRole();
	return (
		<Navigate
			to={isAdmin ? '/backoffice/supervisor' : '/backoffice/cases'}
			replace
		/>
	);
};

export default BackofficeRoleGuard;
