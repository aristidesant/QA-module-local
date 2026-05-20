import { Outlet } from 'react-router';
import { usePermissions } from '~/hooks/usePermissions';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useIsSuperAdmin } from '~/hooks/useIsSuperAdmin';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import AccessDenied from '~/components/AccessDenied/AccessDenied';

import { ReactNode } from 'react';

interface ModuleGuardProps {
	module: ModuleEnum;
	permission?: PermissionEnum;
	children?: ReactNode;
	masterOnly?: boolean;
	superAdminOnly?: boolean;
}

const ModuleGuard = ({
	module,
	permission,
	children,
	masterOnly = false,
	superAdminOnly = false,
}: ModuleGuardProps) => {
	const { canAccessModule, canPerformAction } = usePermissions();
	const isMasterClient = useIsMasterClient();
	const isSuperAdmin = useIsSuperAdmin();

	if (masterOnly && !isMasterClient) {
		return <AccessDenied />;
	}

	if (superAdminOnly && !isSuperAdmin) {
		return <AccessDenied />;
	}

	const hasAccess = permission
		? canPerformAction(module, permission)
		: canAccessModule(module);

	if (!hasAccess) {
		return <AccessDenied />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export default ModuleGuard;
