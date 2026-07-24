import { describe, it, expect } from 'vitest';
import { computeLandingPath } from './computeLandingPath';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

describe('computeLandingPath', () => {
	it('should return / when user has DASHBOARD access', () => {
		const permissionMap = {
			[ModuleEnum.DASHBOARD]: new Set([PermissionEnum.READ]),
			[ModuleEnum.CAMPAIGNS]: new Set([PermissionEnum.READ]),
		};

		const result = computeLandingPath(permissionMap);

		expect(result).toBe('/');
	});

	it('should return /campaigns when user has only CAMPAIGNS access', () => {
		const permissionMap = {
			[ModuleEnum.CAMPAIGNS]: new Set([PermissionEnum.READ]),
		};

		const result = computeLandingPath(permissionMap);

		expect(result).toBe('/campaigns');
	});

	it('should return /conversations when user has CONVERSATIONS and KNOWLEDGE_BASES (no dashboard)', () => {
		const permissionMap = {
			[ModuleEnum.CONVERSATIONS]: new Set([PermissionEnum.READ]),
			[ModuleEnum.KNOWLEDGE_BASES]: new Set([PermissionEnum.READ]),
		};

		const result = computeLandingPath(permissionMap);

		expect(result).toBe('/conversations');
	});

	it('should return /backoffice when user has only BACKOFFICE_CASES access', () => {
		const permissionMap = {
			[ModuleEnum.BACKOFFICE_CASES]: new Set([PermissionEnum.READ]),
		};

		const result = computeLandingPath(permissionMap);

		expect(result).toBe('/backoffice');
	});

	it('should return / when user has no module access', () => {
		const permissionMap = {};

		const result = computeLandingPath(permissionMap);

		expect(result).toBe('/');
	});
});
