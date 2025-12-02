import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import NodeEditor from './NodeEditor';

const mockUseDispositionBuilderStore = vi.fn();

vi.mock('~/stores/campaignsStore', () => ({ useCampaignsStore: () => ({}) }));
vi.mock('../../../dispositionStore', () => ({
	useDispositionBuilderStore: () => mockUseDispositionBuilderStore(),
}));

describe('NodeEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default store values
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: { dispositionNodes: [] },
		});
	});

	it('renders node title and remove button and triggers removeNode', () => {
		const removeNode = vi.fn();
		const node = { id: 1, name: 'Root', children: [] } as any;

		renderWithProviders(<NodeEditor node={node} removeNode={removeNode} />);

		expect(screen.getByText('Root')).toBeVisible();
		const removeBtn = screen.getByLabelText('Remove node');
		expect(removeBtn).toBeInTheDocument();
		fireEvent.click(removeBtn);
		expect(removeNode).toHaveBeenCalledWith(1);
	});

	it('calls onNodeSelect when clicked', () => {
		const removeNode = vi.fn();
		const onNodeSelect = vi.fn();
		const node = { id: 1, name: 'Root', children: [] } as any;

		renderWithProviders(
			<NodeEditor
				node={node}
				removeNode={removeNode}
				onNodeSelect={onNodeSelect}
			/>
		);

		fireEvent.click(screen.getByText('Root'));
		expect(onNodeSelect).toHaveBeenCalled();
	});

	it('renders children and can collapse/expand', () => {
		const removeNode = vi.fn();
		const node = {
			id: 1,
			name: 'Root',
			children: [{ id: 2, name: 'Child' }],
		} as any;

		renderWithProviders(<NodeEditor node={node} removeNode={removeNode} />);

		// Child should be visible initially
		expect(screen.getByText('Child')).toBeVisible();

		// There should be a collapse button
		const collapseBtn = screen.getByLabelText('Collapse node');
		expect(collapseBtn).toBeInTheDocument();

		// Click to collapse — should hide the child and update aria-label
		fireEvent.click(collapseBtn);
		expect(screen.queryByText('Child')).toBeNull();
		expect(screen.getByLabelText('Expand node')).toBeInTheDocument();
	});

	it('shows icons for invalidates number and requires reschedule', () => {
		const removeNode = vi.fn();
		const node = {
			id: 3,
			name: 'Icons Node',
			children: [],
			isInvalidatesNumber: true,
			requiresReschedule: true,
		} as any;

		renderWithProviders(<NodeEditor node={node} removeNode={removeNode} />);

		// Find the node container
		const nodeText = screen.getByText('Icons Node');
		const nodeContainer = nodeText.closest('div');
		// Check there are at least two svgs in the node (the two icons)
		const svgs = nodeContainer?.querySelectorAll('svg') || [];
		expect(svgs.length).toBeGreaterThanOrEqual(2);
	});

	it('shows add missing children button and handles click', () => {
		const removeNode = vi.fn();
		const onPopulateChildren = vi.fn();
		const node = { id: 4, name: 'Populate Node', children: [] } as any;

		const catalogNodes = [
			{ id: 4, name: 'Populate Node', children: [{ id: 5, isActive: true }] },
		] as any;

		renderWithProviders(
			<NodeEditor
				node={node}
				removeNode={removeNode}
				onPopulateChildren={onPopulateChildren}
				catalogNodes={catalogNodes}
			/>
		);

		const addChildrenBtn = screen.getByLabelText('Add missing children');
		expect(addChildrenBtn).toBeInTheDocument();
		fireEvent.click(addChildrenBtn);
		expect(onPopulateChildren).toHaveBeenCalledWith(4);
	});

	it('shows add missing siblings button and handles click', () => {
		const removeNode = vi.fn();
		const onAddMissingSiblings = vi.fn();
		const node = { id: 1, name: 'Sibling Node', children: [] } as any;

		// Catalog has parentId 10 with two active children (1 and 2)
		const catalogNodes = [
			{
				id: 10,
				name: 'Parent Catalog',
				parentId: undefined,
				children: [
					{ id: 1, isActive: true, parentId: 10 },
					{ id: 2, isActive: true, parentId: 10 },
				],
			},
		] as any;

		// flowJson has parent 10 with only child 1 — so sibling 2 is missing
		mockUseDispositionBuilderStore.mockReturnValueOnce({
			flowJson: { dispositionNodes: [{ id: 10, children: [{ id: 1 }] }] },
		});

		renderWithProviders(
			<NodeEditor
				node={node}
				removeNode={removeNode}
				onAddMissingSiblings={onAddMissingSiblings}
				catalogNodes={catalogNodes}
			/>
		);

		const addSiblingsBtn = screen.getByLabelText('Add missing siblings');
		expect(addSiblingsBtn).toBeInTheDocument();
		fireEvent.click(addSiblingsBtn);
		expect(onAddMissingSiblings).toHaveBeenCalledWith(1);
	});
});

it('renders toggle placeholder when no children and no catalog children', () => {
	const removeNode = vi.fn();
	const node = { id: 10, name: 'Solo Node', children: [] } as any;

	const { container } = renderWithProviders(
		<NodeEditor node={node} removeNode={removeNode} />
	);
	// There should be no collapse/expand ActionIcon
	expect(screen.queryByLabelText('Collapse node')).toBeNull();
	expect(screen.queryByLabelText('Expand node')).toBeNull();
	// Ensure the placeholder span exists
	const togglePlaceholder = container.querySelector('span');
	expect(togglePlaceholder).toBeTruthy();
});

it('does not show add missing siblings when parent is not in flow', () => {
	const removeNode = vi.fn();
	const node = { id: 1, name: 'Sibling Node', children: [] } as any;
	const catalogNodes = [
		{
			id: 10,
			name: 'Parent Catalog',
			parentId: undefined,
			children: [
				{ id: 1, isActive: true, parentId: 10 },
				{ id: 2, isActive: true, parentId: 10 },
			],
		},
	] as any;

	// flowJson does not contain parent 10
	mockUseDispositionBuilderStore.mockReturnValueOnce({
		flowJson: { dispositionNodes: [] },
	});

	renderWithProviders(
		<NodeEditor
			node={node}
			removeNode={removeNode}
			catalogNodes={catalogNodes}
			onAddMissingSiblings={vi.fn()}
		/>
	);

	expect(screen.queryByLabelText('Add missing siblings')).toBeNull();
});

it('does not show add missing siblings when parent catalog node missing', () => {
	const removeNode = vi.fn();
	const node = { id: 1, name: 'Orphan Child', children: [] } as any;
	const catalogNodes = [
		{ id: 1, name: 'Orphan Child', parentId: 999, children: [] },
		// parent 999 not included here on purpose
	] as any;

	// flowJson has parent 999 in flow — even if parent exists in flow, the absence of parentCatalogNode should prevent showing siblings
	mockUseDispositionBuilderStore.mockReturnValueOnce({
		flowJson: { dispositionNodes: [{ id: 999, children: [{ id: 1 }] }] },
	});

	renderWithProviders(
		<NodeEditor
			node={node}
			removeNode={removeNode}
			catalogNodes={catalogNodes}
			onAddMissingSiblings={vi.fn()}
		/>
	);

	expect(screen.queryByLabelText('Add missing siblings')).toBeNull();
});

it('applies selected styles when selectedNodeId matches', () => {
	const removeNode = vi.fn();
	const node = { id: 111, name: 'Selected Node', children: [] } as any;
	renderWithProviders(
		<NodeEditor node={node} removeNode={removeNode} selectedNodeId={111} />
	);

	const nodeText = screen.getByText('Selected Node');
	// find the closest ancestor with class including _nodeRow_
	let nodeRowElement: Element | null = nodeText;
	while (
		nodeRowElement &&
		!(nodeRowElement as HTMLElement).className.includes('_nodeRow_')
	) {
		nodeRowElement = nodeRowElement.parentElement as Element | null;
	}
	expect(nodeRowElement).toBeTruthy();
	// the node row element should also have the selected class marker when selected
	expect((nodeRowElement as HTMLElement).className).toContain('_selected_');
});

export {};
