import React from 'react';
import {
	render,
	screen,
	fireEvent,
	within,
	waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DispositionCatalogNode from './DispositionCatalogNode';

const createNode = { mutateAsync: vi.fn(), isPending: false };
const updateNode = { mutateAsync: vi.fn(), isPending: false };
const deleteNode = { mutateAsync: vi.fn(), isPending: false };
const reactivateNode = { mutateAsync: vi.fn(), isPending: false };
const deactivateNode = { mutateAsync: vi.fn(), isPending: false };

const refetch = vi.fn();

const baseTree = [
	{
		id: 1,
		clientId: 1,
		name: 'Root Node',
		description: 'Root',
		isInvalidatesNumber: false,
		requiresReschedule: false,
		isFinal: false,
		order: 0,
		isActive: true,
		catalogId: 1,
		parentId: null,
		createdAt: '',
		updatedAt: '',
		children: [
			{
				id: 2,
				clientId: 1,
				name: 'Child Node',
				description: '',
				isInvalidatesNumber: false,
				requiresReschedule: false,
				isFinal: true,
				order: 0,
				isActive: false,
				catalogId: 1,
				parentId: 1,
				createdAt: '',
				updatedAt: '',
				children: [],
			},
		],
	},
	{
		id: 3,
		clientId: 1,
		name: 'Effective Contact',
		description: '',
		isInvalidatesNumber: false,
		requiresReschedule: false,
		isFinal: false,
		order: 0,
		isActive: true,
		catalogId: 1,
		parentId: null,
		createdAt: '',
		updatedAt: '',
		children: [],
	},
];

let treeHookValue = {
	data: baseTree,
	refetch,
	isLoading: false,
	isError: false,
	error: undefined as unknown,
};

const mockTreeHook = {
	useDispositionTreeByCatalog: () => treeHookValue,
	__setValue: (v: any) => {
		treeHookValue = v;
	},
	__reset: () => {
		treeHookValue = {
			data: baseTree,
			refetch,
			isLoading: false,
			isError: false,
			error: undefined,
		};
	},
};

vi.mock('@mantine/core', () => {
	const ActionIconComponent = ({
		children,
		onClick,
		'aria-label': ariaLabel,
	}: any) => (
		<button
			type='button'
			onClick={onClick}
			aria-label={ariaLabel}
			data-testid='action-icon'
		>
			{children}
		</button>
	);
	(ActionIconComponent as any).Group = ({
		children,
	}: {
		children: React.ReactNode;
	}) => <div data-testid='action-icon-group'>{children}</div>;

	return {
		Flex: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
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
		ActionIcon: ActionIconComponent,
		Text: ({ children }: { children: React.ReactNode }) => (
			<span>{children}</span>
		),
		Badge: ({ children }: { children: React.ReactNode }) => (
			<span>{children}</span>
		),
		Skeleton: () => <div data-testid='skeleton'>skeleton</div>,
		Menu: Object.assign(
			({ children }: { children: React.ReactNode }) => <div>{children}</div>,
			{
				Target: ({ children }: { children: React.ReactNode }) => (
					<div>{children}</div>
				),
				Dropdown: ({ children }: { children: React.ReactNode }) => (
					<div>{children}</div>
				),
				Item: ({
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
			}
		),
		Alert: ({
			children,
			title,
		}: {
			children: React.ReactNode;
			title: string;
		}) => (
			<div data-testid='alert'>
				<strong>{title}</strong>
				{children}
			</div>
		),
		Tooltip: ({
			children,
			label,
		}: {
			children: React.ReactElement;
			label: string;
		}) =>
			React.cloneElement(
				children as React.ReactElement<{ 'aria-label'?: string }>,
				{ 'aria-label': label }
			),
	};
});

vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: vi.fn(({ onConfirm }: { onConfirm?: () => void }) => {
			onConfirm?.();
		}),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('react-arborist', () => ({
	Tree: ({
		data,
		children,
	}: {
		data: any[];
		children: (nodeProps: any) => React.ReactNode;
	}) => {
		const renderChild = Array.isArray(children) ? children[0] : children;
		if (typeof renderChild !== 'function') {
			return <div data-testid='tree-root' />;
		}
		const renderNode = (node: any, level = 0) => (
			<div key={node.id} data-testid={`tree-node-${node.id}`}>
				{renderChild?.({
					node: {
						data: node,
						children: node.children || [],
						isOpen: true,
						isLeaf: !node.children || node.children.length === 0,
						level,
						toggle: vi.fn(),
					},
					style: {},
					dragHandle: () => null,
				})}
				{(node.children || []).map((child: any) =>
					renderNode(child, level + 1)
				)}
			</div>
		);
		return (
			<div data-testid='tree-root'>{data.map((node) => renderNode(node))}</div>
		);
	},
}));

vi.mock('../../../dispositionRightComponentStore', () => ({
	useDispositionStore: (selector?: (state: any) => unknown) => {
		const state = { catalog: { id: 1, type: 'OUTBOUND' } };
		return selector ? selector(state) : state;
	},
}));

vi.mock('~/components/SectionCard', () => ({
	SectionCard: ({
		children,
		title,
		description,
	}: {
		children: React.ReactNode;
		title: string;
		description: string;
	}) => (
		<div data-testid='section-card'>
			<h3>{title}</h3>
			<p>{description}</p>
			{children}
		</div>
	),
}));

vi.mock('./DispositionNodeForm', () => ({
	__esModule: true,
	default: ({
		opened,
		onClose,
		onSubmit,
		title,
		initialValues,
	}: {
		opened: boolean;
		onClose: () => void;
		onSubmit: (values: any) => void;
		title: string;
		initialValues?: any;
	}) =>
		opened ? (
			<div data-testid='node-form'>
				<span data-testid='form-title'>{title}</span>
				{initialValues && (
					<span data-testid='form-initial'>{initialValues.name}</span>
				)}
				<button type='button' onClick={() => onSubmit({ name: 'Submitted' })}>
					Submit Node
				</button>
				<button type='button' onClick={onClose}>
					Close Form
				</button>
			</div>
		) : null,
}));

vi.mock('~/queries/dispositionNodesQueries', () => ({
	useCreateDispositionNode: () => createNode,
	useUpdateDispositionNode: () => updateNode,
	useDeleteDispositionNode: () => deleteNode,
	useReactivateDispositionNode: () => reactivateNode,
	useDeactivateDispositionNode: () => deactivateNode,
	useDispositionTreeByCatalog: () => mockTreeHook.useDispositionTreeByCatalog(),
}));

describe('DispositionCatalogNode', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockTreeHook.__reset();
		createNode.mutateAsync.mockResolvedValue({});
		updateNode.mutateAsync.mockResolvedValue({});
		deleteNode.mutateAsync.mockResolvedValue({});
		reactivateNode.mutateAsync.mockResolvedValue({});
		deactivateNode.mutateAsync.mockResolvedValue({});
	});

	it('renders loading skeleton', () => {
		mockTreeHook.__setValue({
			data: [],
			refetch,
			isLoading: true,
			isError: false,
			error: undefined,
		});

		render(<DispositionCatalogNode catalogId={1} />);

		expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
	});

	it('shows error alert', () => {
		mockTreeHook.__setValue({
			data: [],
			refetch,
			isLoading: false,
			isError: true,
			error: new Error('network'),
		});

		render(<DispositionCatalogNode catalogId={1} />);

		expect(screen.getByTestId('alert')).toBeInTheDocument();
	});

	it('renders tree nodes and handles actions', async () => {
		render(<DispositionCatalogNode catalogId={1} />);

		expect(screen.getByTestId('tree-root')).toBeInTheDocument();
		expect(screen.getByText('Root Node')).toBeInTheDocument();
		expect(screen.getByText('Child Node')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Add root outcome'));
		expect(screen.getByTestId('node-form')).toBeInTheDocument();
		fireEvent.click(screen.getByText('Submit Node'));

		await waitFor(() => {
			expect(createNode.mutateAsync).toHaveBeenCalledWith({
				data: { name: 'Submitted', catalogId: 1, parentId: undefined },
			});
		});
		expect(refetch).toHaveBeenCalled();

		const childNode = screen.getByTestId('tree-node-2');

		fireEvent.click(within(childNode).getByLabelText('Reactivate node'));
		expect(reactivateNode.mutateAsync).toHaveBeenCalledWith(2);

		fireEvent.click(within(childNode).getByLabelText('Delete node'));
		expect(deleteNode.mutateAsync).toHaveBeenCalledWith(2);

		const rootNode = screen.getByTestId('tree-node-1');
		const addChildButtons =
			within(rootNode).getAllByLabelText('Add child outcome');
		fireEvent.click(addChildButtons[0]);
		fireEvent.click(screen.getByText('Submit Node'));
		await waitFor(() => {
			expect(createNode.mutateAsync).toHaveBeenCalledWith({
				data: { name: 'Submitted', catalogId: 1, parentId: 1 },
			});
		});

		fireEvent.click(within(rootNode).getByLabelText('Deactivate node'));
		expect(deactivateNode.mutateAsync).toHaveBeenCalledWith(1);
	});

	it('prevents editing protected outbound nodes', () => {
		render(<DispositionCatalogNode catalogId={1} />);

		const protectedNode = screen.getByTestId('tree-node-3');
		expect(within(protectedNode).queryByLabelText('Edit node')).toBeNull();
		expect(within(protectedNode).queryByLabelText('Delete node')).toBeNull();
	});
});
