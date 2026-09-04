import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useRoleMockStore } from '~/stores/roleMockStore';

/**
 * Redirects users to the correct dashboard based on their role
 * Maps role to dashboard route:
 * - agent → /qa/dashboards/agent
 * - supervisor → /qa/dashboards/supervisor
 * - operationManager → /qa/dashboards/operation-manager
 * - superAdmin → /qa/dashboards/qa-manager (default to QA Manager)
 */
export const useDashboardRoleRedirect = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const previewRole = useRoleMockStore(s => s.previewRole);

	useEffect(() => {
		// Map role to target dashboard
		const getRoleDashboard = () => {
			switch (previewRole) {
				case 'agent':
					return '/qa/dashboards/agent';
				case 'supervisor':
					return '/qa/dashboards/supervisor';
				case 'operationManager':
					return '/qa/dashboards/operation-manager';
				case 'superAdmin':
					return '/qa/dashboards/qa-manager';
				default:
					return null;
			}
		};

		// Check if we're on any dashboard route
		const isDashboardRoute = location.pathname.includes('/qa/dashboards/');
		if (!isDashboardRoute || !previewRole) {
			return;
		}

		const targetDashboard = getRoleDashboard();
		if (!targetDashboard) {
			return;
		}

		// Redirect if not on the correct dashboard for this role
		if (location.pathname !== targetDashboard) {
			navigate(targetDashboard, { replace: true });
		}
	}, [previewRole, location.pathname, navigate]);
};
