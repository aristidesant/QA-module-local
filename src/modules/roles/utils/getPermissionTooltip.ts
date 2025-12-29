import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type { TFunction } from 'i18next';

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
	t: TFunction<'roles'>,
	module: string,
	permission: string,
	options?: { moduleLabel?: string }
): string => {
	const permissionEnum = permission as PermissionEnum;
	const moduleEnum = module as ModuleEnum;
	const moduleLabel = options?.moduleLabel ?? formatModuleName(module);
	const defaultActionLabel =
		permissionEnum in PermissionEnum
			? getDefaultActionLabel(permissionEnum)
			: 'perform actions';
	const actionLabel = t(`form.permissions.actionLabels.${permission}`, {
		defaultValue: t('form.permissions.actionLabels.default', {
			permission,
			defaultValue: defaultActionLabel,
		}),
	});

	if (
		moduleEnum === ModuleEnum.DASHBOARD &&
		permissionEnum === PermissionEnum.READ
	) {
		return t('form.permissions.tooltips.dashboard.read');
	}

	if (moduleEnum === ModuleEnum.CAMPAIGNS) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return t('form.permissions.tooltips.campaigns.read');
			case PermissionEnum.CREATE:
				return t('form.permissions.tooltips.campaigns.create');
			case PermissionEnum.UPDATE:
				return t('form.permissions.tooltips.campaigns.update');
			case PermissionEnum.DELETE:
				return t('form.permissions.tooltips.campaigns.delete');
			case PermissionEnum.EXPORT:
				return t('form.permissions.tooltips.campaigns.export');
			default:
				break;
		}
	}

	if (moduleEnum === ModuleEnum.CONVERSATIONS) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return t('form.permissions.tooltips.conversations.read');
			case PermissionEnum.EXPORT:
				return t('form.permissions.tooltips.conversations.export');
			default:
				break;
		}
	}

	if (moduleEnum === ModuleEnum.SETTINGS) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return t('form.permissions.tooltips.settings.read');
			default:
				break;
		}
	}

	if (
		moduleEnum === ModuleEnum.SETTINGS &&
		permissionEnum === PermissionEnum.MANAGE
	) {
		return t('form.permissions.tooltips.settings.manage');
	}

	if (moduleEnum === ModuleEnum.ROLES) {
		switch (permissionEnum) {
			case PermissionEnum.READ:
				return t('form.permissions.tooltips.roles.read');
			case PermissionEnum.CREATE:
				return t('form.permissions.tooltips.roles.create');
			case PermissionEnum.UPDATE:
				return t('form.permissions.tooltips.roles.update');
			case PermissionEnum.DELETE:
				return t('form.permissions.tooltips.roles.delete');
			default:
				break;
		}
	}

	if (permissionEnum === PermissionEnum.MANAGE) {
		return t('form.permissions.tooltips.manage', {
			module: moduleLabel,
		});
	}

	return t('form.permissions.tooltips.generic', {
		module: moduleLabel,
		action: actionLabel,
	});
};
