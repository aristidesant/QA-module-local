import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import KnowledgeBasePage from './KnowledgeBasePage';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

const mockCanPerformAction = vi.fn();

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: () => ({
		activeClientId: 1,
		permissionMap: {},
		canAccessModule: vi.fn(() => true),
		canPerformAction: (...args: unknown[]) => mockCanPerformAction(...args),
		hasAnyPermission: vi.fn(() => true),
		hasAllPermissions: vi.fn(() => true),
	}),
}));

vi.mock('./KnowledgeBaseList/KnowledgeBaseList', () => ({
	__esModule: true,
	default: () => <div data-testid='kb-list' />,
}));

const mockSetRightComponent = vi.fn();

vi.mock('./store/knowledgeBaseStore', () => ({
	__esModule: true,
	default: (selector: any) =>
		selector({
			rightComponent: null,
			setRightComponent: mockSetRightComponent,
			clearRightComponent: vi.fn(),
		}),
}));

describe('KnowledgeBasePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('hides the create button when CREATE permission is missing', () => {
		mockCanPerformAction.mockImplementation(
			(module: ModuleEnum, permission: PermissionEnum) => {
				if (
					module === ModuleEnum.KNOWLEDGE_BASES &&
					permission === PermissionEnum.CREATE
				)
					return false;
				return true;
			}
		);

		renderWithProviders(<KnowledgeBasePage />);

		expect(screen.queryByText('New Knowledge Base')).not.toBeInTheDocument();
	});

	it('shows the create button when CREATE permission exists', () => {
		mockCanPerformAction.mockImplementation(
			(module: ModuleEnum, permission: PermissionEnum) => {
				if (
					module === ModuleEnum.KNOWLEDGE_BASES &&
					permission === PermissionEnum.CREATE
				)
					return true;
				return true;
			}
		);

		renderWithProviders(<KnowledgeBasePage />);

		expect(screen.getByText('New Knowledge Base')).toBeInTheDocument();
	});
});

export {};
