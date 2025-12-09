import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ModuleGuard from './ModuleGuard';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import '@testing-library/jest-dom';

// Mock explicit components to avoid import issues or complex rendering
vi.mock('~/components/AccessDenied/AccessDenied', () => ({
	default: () => <div data-testid='access-denied'>Access Denied</div>,
}));

// Mock the permissions hook
const mockUseIsMasterClient = vi.fn();

vi.mock('~/hooks/useIsMasterClient', () => ({
	useIsMasterClient: () => mockUseIsMasterClient(),
}));

vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: vi.fn(),
}));

describe('ModuleGuard', () => {
	const mockCanAccessModule = vi.fn();
	const mockCanPerformAction = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(usePermissions as Mock).mockReturnValue({
			canAccessModule: mockCanAccessModule,
			canPerformAction: mockCanPerformAction,
		});
		mockUseIsMasterClient.mockReturnValue(true);
	});

	it('renders children when user has module access (no permission specified)', () => {
		mockCanAccessModule.mockReturnValue(true);

		renderWithProviders(
			<MemoryRouter>
				<ModuleGuard module={ModuleEnum.SETTINGS}>
					<div data-testid='child-content'>Child Content</div>
				</ModuleGuard>
			</MemoryRouter>
		);

		expect(screen.getByTestId('child-content')).toBeInTheDocument();
		expect(mockCanAccessModule).toHaveBeenCalledWith(ModuleEnum.SETTINGS);
	});

	it('renders AccessDenied when user lacks module access (no permission specified)', () => {
		mockCanAccessModule.mockReturnValue(false);

		renderWithProviders(
			<MemoryRouter>
				<ModuleGuard module={ModuleEnum.SETTINGS}>
					<div data-testid='child-content'>Child Content</div>
				</ModuleGuard>
			</MemoryRouter>
		);

		expect(screen.getByTestId('access-denied')).toBeInTheDocument();
		expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
		expect(mockCanAccessModule).toHaveBeenCalledWith(ModuleEnum.SETTINGS);
	});

	it('renders children when user has specific permission', () => {
		mockCanPerformAction.mockReturnValue(true);

		renderWithProviders(
			<MemoryRouter>
				<ModuleGuard
					module={ModuleEnum.SETTINGS}
					permission={PermissionEnum.MANAGE}
				>
					<div data-testid='child-content'>Child Content</div>
				</ModuleGuard>
			</MemoryRouter>
		);

		expect(screen.getByTestId('child-content')).toBeInTheDocument();
		expect(mockCanPerformAction).toHaveBeenCalledWith(
			ModuleEnum.SETTINGS,
			PermissionEnum.MANAGE
		);
		// Should not check generic module access if specific permission is requested
		expect(mockCanAccessModule).not.toHaveBeenCalled();
	});

	it('renders AccessDenied when user lacks specific permission', () => {
		mockCanPerformAction.mockReturnValue(false);

		renderWithProviders(
			<MemoryRouter>
				<ModuleGuard
					module={ModuleEnum.SETTINGS}
					permission={PermissionEnum.MANAGE}
				>
					<div data-testid='child-content'>Child Content</div>
				</ModuleGuard>
			</MemoryRouter>
		);

		expect(screen.getByTestId('access-denied')).toBeInTheDocument();
		expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
		expect(mockCanPerformAction).toHaveBeenCalledWith(
			ModuleEnum.SETTINGS,
			PermissionEnum.MANAGE
		);
	});

	it('renders Outlet when no children are provided and access is granted', () => {
		mockCanAccessModule.mockReturnValue(true);

		renderWithProviders(
			<MemoryRouter initialEntries={['/protected']}>
				<Routes>
					<Route
						path='/protected'
						element={<ModuleGuard module={ModuleEnum.SETTINGS} />}
					>
						<Route
							index
							element={<div data-testid='outlet-content'>Outlet Content</div>}
						/>
					</Route>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
	});

	it('renders AccessDenied when masterOnly is true and user is not master client', () => {
		mockUseIsMasterClient.mockReturnValue(false);
		mockCanAccessModule.mockReturnValue(true);

		renderWithProviders(
			<MemoryRouter>
				<ModuleGuard module={ModuleEnum.SETTINGS} masterOnly>
					<div data-testid='child-content'>Child Content</div>
				</ModuleGuard>
			</MemoryRouter>
		);

		expect(screen.getByTestId('access-denied')).toBeInTheDocument();
		expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
		expect(mockCanAccessModule).not.toHaveBeenCalled();
	});

	it('renders children when masterOnly is true and user is master client', () => {
		mockUseIsMasterClient.mockReturnValue(true);
		mockCanAccessModule.mockReturnValue(true);

		renderWithProviders(
			<MemoryRouter>
				<ModuleGuard module={ModuleEnum.SETTINGS} masterOnly>
					<div data-testid='child-content'>Child Content</div>
				</ModuleGuard>
			</MemoryRouter>
		);

		expect(screen.getByTestId('child-content')).toBeInTheDocument();
		expect(mockCanAccessModule).toHaveBeenCalledWith(ModuleEnum.SETTINGS);
	});
});
