import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useRoleMockStore } from '~/stores/roleMockStore';
import type { PreviewRole } from '~/constants/previewRole';

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
		// Only redirect if on a dashboard route
		if (!location.pathname.includes('/qa/dashboards/')) {
			return;
		}

		// Determine which dashboard the user should see
		let targetDashboard: string;

		switch (previewRole) {
			case 'agent':
				targetDashboard = '/qa/dashboards/agent';
				break;
			case 'supervisor':
				targetDashboard = '/qa/dashboards/supervisor';
				break;
			case 'operationManager':
				targetDashboard = '/qa/dashboards/operation-manager';
				break;
			case 'superAdmin':
				// Super admin defaults to QA Manager dashboard
				targetDashboard = '/qa/dashboards/qa-manager';
				break;
			default:
				// If no preview role set, don't redirect
				return;
		}

		// Only redirect if not already on the correct dashboard
		if (location.pathname !== targetDashboard) {
			navigate(targetDashboard, { replace: true });
		}
	}, [previewRole, location.pathname, navigate]);
};
