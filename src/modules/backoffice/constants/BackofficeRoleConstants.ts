export const BACKOFFICE_AGENT_ROLE = 'BACKOFFICE_AGENT' as const;
export const BACKOFFICE_ADMIN_ROLE = 'BACKOFFICE_ADMIN' as const;

export const BACKOFFICE_ROLE_CODES = [
	BACKOFFICE_AGENT_ROLE,
	BACKOFFICE_ADMIN_ROLE,
] as const;

export type BackofficeRoleCode = (typeof BACKOFFICE_ROLE_CODES)[number];
