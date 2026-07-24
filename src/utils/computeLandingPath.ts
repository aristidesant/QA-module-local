import { ModuleEnum } from '~/constants/ModuleEnum';
import { canAccessModule } from '~/utils/permissionUtils';
import type { PermissionMap } from '~/utils/permissionUtils';

const MODULE_PRIORITY: Array<{ module: ModuleEnum; path: string }> = [
	{ module: ModuleEnum.CAMPAIGNS, path: '/campaigns' },
	{ module: ModuleEnum.CONVERSATIONS, path: '/conversations' },
	{ module: ModuleEnum.KNOWLEDGE_BASES, path: '/knowledge-bases' },
	{ module: ModuleEnum.REPORTS, path: '/report-templates' },
	{ module: ModuleEnum.SETTINGS, path: '/campaign-management' },
	{ module: ModuleEnum.USERS, path: '/users' },
	{ module: ModuleEnum.ROLES, path: '/roles' },
	{ module: ModuleEnum.BILLING, path: '/billing/invoices' },
	{ module: ModuleEnum.TOOLS, path: '/tools' },
	// Backoffice-only users (no UCXM modules, no DASHBOARD) land in their own
	// app; the /backoffice index then splits admin (supervisor) vs agent (cases).
	{ module: ModuleEnum.BACKOFFICE_CASES, path: '/backoffice' },
];

export const computeLandingPath = (permissionMap: PermissionMap): string => {
	if (canAccessModule(permissionMap, ModuleEnum.DASHBOARD)) {
		return '/';
	}

	for (const { module, path } of MODULE_PRIORITY) {
		if (canAccessModule(permissionMap, module)) {
			return path;
		}
	}

	return '/';
};
