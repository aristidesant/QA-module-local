import React from 'react';
import { useDashboardRoleRedirect } from '~/hooks/useDashboardRoleRedirect';

interface DashboardRoleGuardProps {
	children: React.ReactNode;
}

/**
 * Wraps dashboard components to enforce role-based access.
 * Automatically redirects users to their role-appropriate dashboard.
 */
export const DashboardRoleGuard: React.FC<DashboardRoleGuardProps> = ({
	children,
}) => {
	useDashboardRoleRedirect();

	return <>{children}</>;
};

export default DashboardRoleGuard;
