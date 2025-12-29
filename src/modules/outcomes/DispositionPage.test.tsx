import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { forwardRef, useImperativeHandle } from 'react';
import DispositionPage from './DispositionPage';

const clearCatalog = vi.fn();

let openCreateForm: () => void;
let onEditNodesFromProps: ((catalog: { id: number }) => void) | undefined;

vi.mock('@mantine/core', () => ({
	Button: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<button type='button' onClick={onClick}>
			{children}
		</button>
	),
	Modal: ({
		children,
		opened,
		title,
	}: {
		children: React.ReactNode;
		opened: boolean;
		title?: React.ReactNode;
	}) =>
		opened ? (
			<div data-testid='nodes-modal'>
				<div data-testid='nodes-modal-title'>{title}</div>
				{children}
			</div>
		) : null,
	Text: ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	),
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
	});

	it('renders embedded content without container', () => {
		render(<DispositionPage embedded />);

		expect(screen.getByTestId('catalog-list')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Open nodes'));
		expect(screen.getByTestId('nodes-modal')).toBeInTheDocument();
		expect(screen.getByTestId('catalog-node')).toHaveTextContent('Catalog 1');
		expect(screen.queryByTestId('content-container')).not.toBeInTheDocument();
	});

	it('renders container and triggers create action', () => {
		render(<DispositionPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Add New Catalog'));

		expect(openCreateForm).toHaveBeenCalled();
	});

	it('clears selected catalog on unmount', () => {
		const { unmount } = render(<DispositionPage />);

		unmount();

		expect(clearCatalog).toHaveBeenCalled();
	});
});
