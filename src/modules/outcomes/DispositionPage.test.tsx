import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { forwardRef, useImperativeHandle } from 'react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import DispositionPage from './DispositionPage';

const clearCatalog = vi.fn();

let openCreateForm: () => void;
let onEditNodesFromProps: ((catalog: { id: number }) => void) | undefined;

const mockCanPerformAction = vi.fn(
	(_module: ModuleEnum, _permission: PermissionEnum) => true
);
const mockCanAccessModule = vi.fn((_module: ModuleEnum) => true);

vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
		canAccessModule: mockCanAccessModule,
	}),
}));

vi.mock('./dispositionRightComponentStore', () => ({
	useDispositionStore: (selector: any) =>
		selector({
			catalog: { id: 1, name: 'Catalog A' },
			clearCatalog,
		}),
}));

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({
		children,
		titleRight,
	}: {
		children: React.ReactNode;
		titleRight?: React.ReactNode;
	}) => (
		<div data-testid='content-container'>
			<div data-testid='title-right'>{titleRight}</div>
			{children}
		</div>
	),
}));

vi.mock('./components/DispositionCatalogList', () => ({
	__esModule: true,
	default: forwardRef(
		(props: { onEditNodes?: (catalog: { id: number }) => void }, ref) => {
			onEditNodesFromProps = props.onEditNodes;
			openCreateForm = vi.fn();
			useImperativeHandle(ref, () => ({
				openCreateForm,
			}));
			return (
				<div data-testid='catalog-list'>
					<button
						type='button'
						onClick={() => onEditNodesFromProps?.({ id: 1 })}
					>
						Open nodes
					</button>
				</div>
			);
		}
	),
}));

vi.mock('./components/DispositionCatalogForm/DispositionCatalogNode', () => ({
	__esModule: true,
	default: ({ catalogId }: { catalogId: number }) => (
		<div data-testid='catalog-node'>Catalog {catalogId}</div>
	),
}));

describe('DispositionPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCanPerformAction.mockReturnValue(true);
		mockCanAccessModule.mockReturnValue(true);
	});

	it('renders embedded content without container', async () => {
		renderWithProviders(<DispositionPage embedded />);

		expect(screen.getByTestId('catalog-list')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Open nodes'));

		expect(await screen.findByText('Edit outcomes')).toBeInTheDocument();
		expect(await screen.findByText('Catalog 1')).toBeInTheDocument();
		expect(screen.queryByTestId('content-container')).not.toBeInTheDocument();
	});

	it('renders container and triggers create action when user has CREATE permission', () => {
		mockCanPerformAction.mockImplementation(
			(module: ModuleEnum, permission: PermissionEnum) => {
				return (
					module === ModuleEnum.SETTINGS && permission === PermissionEnum.CREATE
				);
			}
		);

		renderWithProviders(<DispositionPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();
		expect(screen.getByText('Add New Catalog')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Add New Catalog'));

		expect(openCreateForm).toHaveBeenCalled();
	});

	it('hides "Add New Catalog" button when user lacks CREATE permission', () => {
		mockCanPerformAction.mockImplementation(
			(module: ModuleEnum, permission: PermissionEnum) => {
				if (
					module === ModuleEnum.SETTINGS &&
					permission === PermissionEnum.CREATE
				) {
					return false;
				}
				return true;
			}
		);

		renderWithProviders(<DispositionPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();
		expect(screen.queryByText('Add New Catalog')).not.toBeInTheDocument();
	});

	it('clears selected catalog on unmount', () => {
		const { unmount } = renderWithProviders(<DispositionPage />);

		unmount();

		expect(clearCatalog).toHaveBeenCalled();
	});
});
