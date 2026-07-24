export type PreviewRole =
	| 'agent'
	| 'supervisor'
	| 'operationManager'
	| 'superAdmin';

export interface PreviewRoleOption {
	key: PreviewRole;
	labelKey: string;
}

export const PREVIEW_ROLES: PreviewRoleOption[] = [
	{ key: 'agent', labelKey: 'userMenu.rolePreview.roles.agent' },
	{ key: 'supervisor', labelKey: 'userMenu.rolePreview.roles.supervisor' },
	{
		key: 'operationManager',
		labelKey: 'userMenu.rolePreview.roles.operationManager',
	},
	{ key: 'superAdmin', labelKey: 'userMenu.rolePreview.roles.superAdmin' },
];
