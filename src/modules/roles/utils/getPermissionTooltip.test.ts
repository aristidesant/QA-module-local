import { describe, it, expect } from 'vitest';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { getPermissionTooltip } from './getPermissionTooltip';
import { testI18n } from '~/test-utils/renderWithProviders';

const t = testI18n.getFixedT('en', 'roles');

describe('getPermissionTooltip', () => {
	it('returns dashboard read tooltip', () => {
		expect(
			getPermissionTooltip(t, ModuleEnum.DASHBOARD, PermissionEnum.READ)
		).toBe('Access the Overview dashboard (home page).');
	});

	it('returns campaigns tooltips for all defined permissions', () => {
		expect(
			getPermissionTooltip(t, ModuleEnum.CAMPAIGNS, PermissionEnum.READ)
		).toBe('View campaigns and related configuration.');
		expect(
			getPermissionTooltip(t, ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE)
		).toBe('Create new campaigns.');
		expect(
			getPermissionTooltip(t, ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE)
		).toBe('Edit existing campaigns.');
		expect(
			getPermissionTooltip(t, ModuleEnum.CAMPAIGNS, PermissionEnum.DELETE)
		).toBe('Delete campaigns.');
		expect(
			getPermissionTooltip(t, ModuleEnum.CAMPAIGNS, PermissionEnum.EXPORT)
		).toBe('Export campaign data.');
	});

	it('returns conversations tooltips', () => {
		expect(
			getPermissionTooltip(t, ModuleEnum.CONVERSATIONS, PermissionEnum.READ)
		).toBe('View conversations and transcripts.');
		expect(
			getPermissionTooltip(t, ModuleEnum.CONVERSATIONS, PermissionEnum.EXPORT)
		).toBe('Export conversations.');
	});

	it('returns settings tooltips including manage special case', () => {
		expect(
			getPermissionTooltip(t, ModuleEnum.SETTINGS, PermissionEnum.READ)
		).toBe('View settings.');
		expect(
			getPermissionTooltip(t, ModuleEnum.SETTINGS, PermissionEnum.MANAGE)
		).toBe('Manage global settings for this client.');
	});

	it('returns roles tooltips', () => {
		expect(getPermissionTooltip(t, ModuleEnum.ROLES, PermissionEnum.READ)).toBe(
			'View roles and permissions.'
		);
		expect(
			getPermissionTooltip(t, ModuleEnum.ROLES, PermissionEnum.CREATE)
		).toBe('Create new roles.');
		expect(
			getPermissionTooltip(t, ModuleEnum.ROLES, PermissionEnum.UPDATE)
		).toBe('Edit existing roles.');
		expect(
			getPermissionTooltip(t, ModuleEnum.ROLES, PermissionEnum.DELETE)
		).toBe('Delete roles.');
	});

	it('returns generic MANAGE tooltip and formats module names', () => {
		expect(
			getPermissionTooltip(t, ModuleEnum.USERS, PermissionEnum.MANAGE)
		).toBe('Full access to Users.');

		expect(
			getPermissionTooltip(
				t,
				ModuleEnum.KNOWLEDGE_BASES,
				PermissionEnum.EXECUTE
			)
		).toBe('EXECUTE access for Knowledge Bases.');
	});

	it('returns fallback tooltip when permission is unknown', () => {
		expect(getPermissionTooltip(t, ModuleEnum.TOOLS, 'FOO')).toBe(
			'FOO access for Tools.'
		);
	});
});
