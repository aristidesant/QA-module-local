import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

const formatModuleName = (module: string): string => {
	return module
		.split('_')
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(' ');
};

const getDefaultActionLabel = (permission: PermissionEnum): string => {
	switch (permission) {
		case PermissionEnum.CREATE:
			return 'create new items';
		case PermissionEnum.READ:
			return 'view and list items';
		case PermissionEnum.UPDATE:
			return 'edit existing items';
		case PermissionEnum.DELETE:
			return 'delete items';
		case PermissionEnum.EXPORT:
			return 'export data';
		case PermissionEnum.IMPORT:
			return 'import data';
		case PermissionEnum.EXECUTE:
			return 'run actions';
		case PermissionEnum.MANAGE:
			return 'manage everything';
		default:
			return 'perform actions';
	}
};

export const getPermissionTooltip = (
	module: string,
	permission: string
): string => {
	const permissionEnum = permission as PermissionEnum;
	const moduleEnum = module as ModuleEnum;

	if (
		moduleEnum === ModuleEnum.DASHBOARD &&
		permissionEnum === PermissionEnum.READ
	) {
		return 'Access the Overview dashboard (home page).';
	}

	if (moduleEnum === ModuleEnum.CAMPAIGNS) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return 'View the campaigns list and campaign details (`/campaigns`, `/campaign/view/:id`).';
			case PermissionEnum.CREATE:
				return 'Create new campaigns and clone existing ones from the campaigns list.';
			case PermissionEnum.UPDATE:
				return 'Edit campaigns (`/campaign/:id`) and use edit actions in the campaigns list.';
			case PermissionEnum.DELETE:
				return 'Delete campaigns from the campaigns list.';
			case PermissionEnum.EXPORT:
				return 'Export campaign-related data when export actions are available.';
			default:
				break;
		}
	}

	if (moduleEnum === ModuleEnum.CONVERSATIONS) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return 'View the conversations list (`/conversations`).';
			case PermissionEnum.EXPORT:
				return 'Export conversations and download transcripts (PDF).';
			default:
				break;
		}
	}

	if (moduleEnum === ModuleEnum.SETTINGS) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return 'Access Settings module features (for example, Campaign Management). Some configuration areas may require MANAGE.';
			default:
				break;
		}
	}

	if (
		moduleEnum === ModuleEnum.SETTINGS &&
		permissionEnum === PermissionEnum.MANAGE
	) {
		return 'Access configuration and administration pages (Configurations, Clients, and Scheduler).';
	}

	if (moduleEnum === ModuleEnum.ROLES) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return 'View roles and their assigned permissions in the Roles module.';
			case PermissionEnum.CREATE:
				return 'Create new roles.';
			case PermissionEnum.UPDATE:
				return 'Edit existing roles and their permissions.';
			case PermissionEnum.DELETE:
				return 'Delete roles.';
			default:
				break;
		}
	}

	if (permissionEnum === PermissionEnum.MANAGE) {
		return `Grants full access to ${formatModuleName(module)} (all actions), and makes the module visible in navigation.`;
	}

	const actionLabel = getDefaultActionLabel(permissionEnum);
	return `Allows the user to ${actionLabel} in ${formatModuleName(module)}.`;
};
