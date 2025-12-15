import { describe, it, expect } from 'vitest';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { getPermissionTooltip } from './getPermissionTooltip';

describe('getPermissionTooltip', () => {
	it('returns dashboard read tooltip', () => {
		expect(
			getPermissionTooltip(ModuleEnum.DASHBOARD, PermissionEnum.READ)
		).toBe('Access the Overview dashboard (home page).');
	});

	it('returns campaigns tooltips for all defined permissions', () => {
		expect(
			getPermissionTooltip(ModuleEnum.CAMPAIGNS, PermissionEnum.READ)
		).toBe(
			'View the campaigns list and campaign details (`/campaigns`, `/campaign/view/:id`).'
		);
		expect(
			getPermissionTooltip(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE)
		).toBe(
			'Create new campaigns and clone existing ones from the campaigns list.'
		);
		expect(
			getPermissionTooltip(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE)
		).toBe(
			'Edit campaigns (`/campaign/:id`) and use edit actions in the campaigns list.'
		);
		expect(
			getPermissionTooltip(ModuleEnum.CAMPAIGNS, PermissionEnum.DELETE)
		).toBe('Delete campaigns from the campaigns list.');
		expect(
			getPermissionTooltip(ModuleEnum.CAMPAIGNS, PermissionEnum.EXPORT)
		).toBe('Export campaign-related data when export actions are available.');
	});

	it('returns conversations tooltips', () => {
		expect(
			getPermissionTooltip(ModuleEnum.CONVERSATIONS, PermissionEnum.READ)
		).toBe('View the conversations list (`/conversations`).');
		expect(
			getPermissionTooltip(ModuleEnum.CONVERSATIONS, PermissionEnum.EXPORT)
		).toBe('Export conversations and download transcripts (PDF).');
	});

	it('returns settings tooltips including manage special case', () => {
		expect(getPermissionTooltip(ModuleEnum.SETTINGS, PermissionEnum.READ)).toBe(
			'Access Settings module features (for example, Campaign Management). Some configuration areas may require MANAGE.'
		);
		expect(
			getPermissionTooltip(ModuleEnum.SETTINGS, PermissionEnum.MANAGE)
		).toBe(
			'Access configuration and administration pages (Configurations, Clients, and Scheduler).'
		);
	});

	it('returns roles tooltips', () => {
		expect(getPermissionTooltip(ModuleEnum.ROLES, PermissionEnum.READ)).toBe(
			'View roles and their assigned permissions in the Roles module.'
		);
		expect(getPermissionTooltip(ModuleEnum.ROLES, PermissionEnum.CREATE)).toBe(
			'Create new roles.'
		);
		expect(getPermissionTooltip(ModuleEnum.ROLES, PermissionEnum.UPDATE)).toBe(
			'Edit existing roles and their permissions.'
		);
		expect(getPermissionTooltip(ModuleEnum.ROLES, PermissionEnum.DELETE)).toBe(
			'Delete roles.'
		);
	});

	it('returns generic MANAGE tooltip and formats module names', () => {
		expect(getPermissionTooltip(ModuleEnum.USERS, PermissionEnum.MANAGE)).toBe(
			'Grants full access to Users (all actions), and makes the module visible in navigation.'
		);

		expect(
			getPermissionTooltip(ModuleEnum.KNOWLEDGE_BASES, PermissionEnum.EXECUTE)
		).toBe('Allows the user to run actions in Knowledge Bases.');
	});

	it('returns fallback tooltip when permission is unknown', () => {
		// passing an unknown permission string should fall back to "perform actions"
		expect(getPermissionTooltip(ModuleEnum.TOOLS, 'FOO')).toBe(
			'Allows the user to perform actions in Tools.'
		);
	});
});
