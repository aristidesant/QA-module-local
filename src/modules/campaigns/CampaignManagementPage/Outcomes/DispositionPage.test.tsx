import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { forwardRef, useImperativeHandle } from 'react';
import DispositionPage from './DispositionPage';

const setRightComponent = vi.fn();
const clearRightComponent = vi.fn();
const setCatalog = vi.fn();

let openCreateForm: () => void;

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
}));

vi.mock('./dispositionRightComponentStore', () => ({
	useDispositionStore: vi.fn(() => ({
		rightComponent: null,
		catalog: { id: 1, name: 'Catalog A' },
		setRightComponent,
		clearRightComponent,
		setCatalog,
	})),
}));

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({
		children,
		titleRight,
		rightSection,
	}: {
		children: React.ReactNode;
		titleRight?: React.ReactNode;
		rightSection?: React.ReactNode;
	}) => (
		<div data-testid='content-container'>
			<div data-testid='title-right'>{titleRight}</div>
			<div data-testid='right-section'>{rightSection}</div>
			{children}
		</div>
	),
}));

vi.mock('~/components/FallbackRightComponent', () => ({
	default: ({
		title,
		description,
		actionText,
	}: {
		title: string;
		description: string;
		actionText: string;
	}) => (
		<div data-testid='fallback'>
			<span>{title}</span>
			<span>{description}</span>
			<span>{actionText}</span>
		</div>
	),
}));

vi.mock('./components/DispositionCatalogList', () => ({
	__esModule: true,
	default: forwardRef((_, ref) => {
		openCreateForm = vi.fn();
		useImperativeHandle(ref, () => ({
			openCreateForm,
		}));
		return <div data-testid='catalog-list'>Catalog List</div>;
	}),
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
		expect(screen.getByTestId('catalog-node')).toHaveTextContent('Catalog 1');
		expect(screen.queryByTestId('content-container')).not.toBeInTheDocument();
	});

	it('renders container with fallback and triggers create action', () => {
		render(<DispositionPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();
		expect(screen.getByTestId('fallback')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Add New Catalog'));

		expect(openCreateForm).toHaveBeenCalled();
	});

	it('clears right component on unmount', () => {
		const { unmount } = render(<DispositionPage />);

		unmount();

		expect(setRightComponent).toHaveBeenCalledWith(null);
	});
});
