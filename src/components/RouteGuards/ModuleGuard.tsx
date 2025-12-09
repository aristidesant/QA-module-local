import { Outlet } from 'react-router';
import { usePermissions } from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import AccessDenied from '~/components/AccessDenied/AccessDenied';

import { ReactNode } from 'react';

interface ModuleGuardProps {
	module: ModuleEnum;
	permission?: PermissionEnum;
	children?: ReactNode;
}

const ModuleGuard = ({ module, permission, children }: ModuleGuardProps) => {
	const { canAccessModule, canPerformAction } = usePermissions();

	const hasAccess = permission
		? canPerformAction(module, permission)
		: canAccessModule(module);

	if (!hasAccess) {
		return <AccessDenied />;
	}

	return children ? <>{children}</> : <Outlet />;
};

export default ModuleGuard;
