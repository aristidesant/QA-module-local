import { describe, it, beforeEach, expect } from 'vitest';
import { useDispositionBuilderStore } from './dispositionStore';
import type { DispositionNode } from '~/models/DispositionNodeModel';

function createNode(overrides: Partial<DispositionNode> = {}): DispositionNode {
	const now = new Date().toISOString();
	return {
		id: overrides.id ?? Math.floor(Math.random() * 10000) + 1,
		clientId: overrides.clientId ?? 1,
		name: overrides.name ?? 'Node',
		description: overrides.description ?? undefined,
		isInvalidatesNumber: overrides.isInvalidatesNumber ?? false,
		requiresReschedule: overrides.requiresReschedule ?? false,
		isFinal: overrides.isFinal ?? false,
		order: overrides.order ?? 0,
		isActive: overrides.isActive ?? true,
		catalogId: overrides.catalogId,
		parentId: overrides.parentId ?? undefined,
		children: overrides.children ?? [],
		createdAt: now,
		updatedAt: now,
	} as DispositionNode;
}

describe('Disposition Builder Store', () => {
	beforeEach(() => {
		// Reset state to defaults used by tests
		useDispositionBuilderStore.setState({
			flowJson: {},
			selectedCatalog: null,
			dispositionFlow: undefined,
			campaignId: undefined,
			previewNode: null,
		});
	});

	it('exposes setter functions and basic set/get behavior', () => {
		const {
			setFlowJson,
			setCampaignId,
			setSelectedCatalog,
			setDispositionFlow,
			setPreviewNode,
		} = useDispositionBuilderStore.getState();

		setFlowJson({ dispositionNodes: [] });
		expect(
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes
		).toHaveLength(0);

		setCampaignId(123);
		expect(useDispositionBuilderStore.getState().campaignId).toBe(123);

		const catalog = {
			id: 5,
			clientId: 1,
			name: 'Catalog',
			isActive: true,
			isDefault: false,
			dispositionNodes: [],
			createdAt: '',
			updatedAt: '',
		};
		setSelectedCatalog(catalog as any);
		expect(useDispositionBuilderStore.getState().selectedCatalog?.id).toBe(5);

		setDispositionFlow({
			id: 1,
			clientId: 1,
			userId: 1,
			campaignId: 12,
			flowJson: {},
		} as any);
		expect(useDispositionBuilderStore.getState().dispositionFlow?.id).toBe(1);

		const preview = createNode({ id: 999 });
		setPreviewNode(preview);
		expect(useDispositionBuilderStore.getState().previewNode?.id).toBe(999);
	});

	it('adds a node to the builder and avoids duplicates', () => {
		const node = createNode({ id: 100, name: 'Root' });
		useDispositionBuilderStore.getState().addNode(node);

		expect(
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes?.[0].id
		).toBe(100);
		// Try adding again - should not create duplicates
		useDispositionBuilderStore.getState().addNode(node);
		expect(
			useDispositionBuilderStore
				.getState()
				.flowJson?.dispositionNodes?.filter((n) => n.id === 100)
		).toHaveLength(1);
	});

	it('adds multiple nodes and filters out existing ones', () => {
		const n1 = createNode({ id: 200 });
		const n2 = createNode({ id: 201 });
		useDispositionBuilderStore.getState().addMultipleNodes([n1]);
		// Add both, but only one new should be appended
		useDispositionBuilderStore.getState().addMultipleNodes([n1, n2]);

		const nodes =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		expect(nodes.map((n) => n.id)).toEqual(expect.arrayContaining([200, 201]));
	});

	it('adds a node and ancestors to the builder via addNodeToParent', () => {
		const root = createNode({ id: 301, name: 'Root', parentId: undefined });
		const child = createNode({ id: 302, name: 'Child', parentId: 301 });
		const grand = createNode({
			id: 303,
			name: 'GrandChild',
			parentId: 302,
			children: [{ ...createNode({ id: 304, parentId: 303 }) }],
		});

		// set catalog with nodes
		const catalog = {
			id: 10,
			clientId: 1,
			name: 'Cat',
			dispositionNodes: [root, { ...child, children: [grand] }],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any;
		useDispositionBuilderStore.getState().setSelectedCatalog(catalog);

		// add grand child to builder; function should add parent chain
		useDispositionBuilderStore.getState().addNodeToParent(grand);

		const builderNodes =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		// There should be root present, with proper nested children
		const rootInBuilder = builderNodes.find((n) => n.id === 301);
		expect(rootInBuilder).toBeDefined();
		expect(rootInBuilder?.children?.length).toBeGreaterThan(0);
		// Ensure grandchild was added under the correct parent
		const foundGrand = builderNodes
			.flatMap((b) => b.children || [])
			.flatMap((c) => c.children || [])
			.find((n) => n.id === 303);
		expect(foundGrand).toBeDefined();
	});

	it('populates a node with children from the catalog', () => {
		const root = createNode({ id: 401, name: 'Root', children: [] });
		const childFromCatalog = createNode({ id: 402, parentId: 401 });
		const catalog = {
			id: 20,
			clientId: 1,
			name: 'Cat2',
			dispositionNodes: [{ ...root, children: [childFromCatalog] }],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any;

		useDispositionBuilderStore.getState().setSelectedCatalog(catalog);
		// existing flow has root but without children
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [{ ...root }] });

		useDispositionBuilderStore.getState().populateNodeWithChildren(401);
		const flowNodes =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		const rootNode = flowNodes.find((n) => n.id === 401);
		expect(rootNode?.children?.[0].id).toBe(402);
	});

	it('populateNodeWithChildren leaves node unchanged when no updates are needed', () => {
		const root = createNode({ id: 403, name: 'ReadyRoot', children: [] });
		const childFromCatalog = createNode({ id: 404, parentId: 403 });
		const catalog = {
			id: 22,
			clientId: 1,
			name: 'CatX',
			dispositionNodes: [{ ...root, children: [childFromCatalog] }],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any;

		useDispositionBuilderStore.getState().setSelectedCatalog(catalog);
		// existing flow has root with the same child already present
		useDispositionBuilderStore.getState().setFlowJson({
			dispositionNodes: [{ ...root, children: [childFromCatalog] }],
		});

		const beforeState = useDispositionBuilderStore.getState().flowJson;
		useDispositionBuilderStore.getState().populateNodeWithChildren(403);
		const after = useDispositionBuilderStore.getState().flowJson;
		expect(after).toEqual(beforeState);
	});

	it('does not add missing siblings when none are missing', () => {
		const parentCatalog = createNode({
			id: 601,
			name: 'ParentA',
			children: [],
		});
		const activeChild1 = createNode({ id: 602, parentId: 601 });
		const activeChild2 = createNode({ id: 603, parentId: 601 });
		parentCatalog.children = [activeChild1, activeChild2];

		const catalog = {
			id: 23,
			clientId: 1,
			name: 'Cat4',
			dispositionNodes: [parentCatalog],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any;
		useDispositionBuilderStore.getState().setSelectedCatalog(catalog);

		// Add parent with both children already present in flow
		useDispositionBuilderStore.getState().setFlowJson({
			dispositionNodes: [
				{ ...parentCatalog, children: [activeChild1, activeChild2] },
			],
		});

		const before = useDispositionBuilderStore.getState().flowJson;
		useDispositionBuilderStore.getState().addMissingSiblingsToParent(602);
		const after = useDispositionBuilderStore.getState().flowJson;
		expect(after).toEqual(before);
	});

	it('addMultipleNodes filters nodes already in builder based on children ids', () => {
		const nested = createNode({
			id: 701,
			children: [createNode({ id: 702, parentId: 701 })],
		});
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [nested] });

		// Attempt to add node that contains an existing child id 702
		const incoming = createNode({
			id: 703,
			children: [createNode({ id: 702 })],
		});
		useDispositionBuilderStore.getState().addMultipleNodes([incoming]);
		const nodes =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		// 703 is added even though it contains child 702, because existingIds only checks top-level nodes
		expect(nodes.some((n) => n.id === 703)).toBe(true);

		// But adding a node with the same top-level id should be filtered out
		const incomingDuplicate = createNode({ id: 701 });
		useDispositionBuilderStore.getState().addMultipleNodes([incomingDuplicate]);
		const nodesAfter =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		expect(nodesAfter.filter((n) => n.id === 701)).toHaveLength(1);
	});

	it('updateNode updates nested children properly', () => {
		const inner = createNode({ id: 801, name: 'OldInner' });
		const outer = createNode({ id: 800, children: [inner] });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [outer] });

		useDispositionBuilderStore
			.getState()
			.updateNode({ ...inner, name: 'NewInner' });
		const updatedInner =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes?.[0]
				.children?.[0];
		expect(updatedInner?.name).toBe('NewInner');
	});

	it('removeMultipleNodes removes a parent and its children', () => {
		const child = createNode({ id: 901 });
		const parent = createNode({ id: 900, children: [child] });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [parent] });
		useDispositionBuilderStore.getState().removeMultipleNodes([900]);
		expect(
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes
		).toHaveLength(0);
	});

	it('add root node to builder when parentless via addNodeToParent', () => {
		const root = createNode({ id: 1001, parentId: undefined, children: [] });
		// Use a catalog so addNodeToParent can find node
		useDispositionBuilderStore.getState().setSelectedCatalog({
			id: 99,
			clientId: 1,
			name: 'cat',
			dispositionNodes: [root],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any);
		// Add root via addNodeToParent - this should push root to top-level
		useDispositionBuilderStore.getState().addNodeToParent(root);
		const nodes =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		expect(nodes.some((n) => n.id === 1001)).toBe(true);
	});

	it('addNodeToParent when parentInBuilder has no children adds child', () => {
		const parent = createNode({ id: 1100 });
		// Put only the parent in the builder with no children defined
		useDispositionBuilderStore.getState().setFlowJson({
			dispositionNodes: [
				{
					id: parent.id,
					clientId: parent.clientId,
					name: parent.name,
					order: parent.order,
					isActive: parent.isActive,
					isFinal: parent.isFinal,
					requiresReschedule: parent.requiresReschedule,
					isInvalidatesNumber: parent.isInvalidatesNumber,
					createdAt: parent.createdAt,
					updatedAt: parent.updatedAt,
				},
			],
		});
		const child = createNode({ id: 1101, parentId: 1100 });
		// Catalog contains both parent and child
		useDispositionBuilderStore.getState().setSelectedCatalog({
			id: 100,
			clientId: 1,
			name: 'cat2',
			dispositionNodes: [{ ...parent, children: [child] }],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any);
		useDispositionBuilderStore.getState().addNodeToParent(child);
		const parentInFlow = useDispositionBuilderStore
			.getState()
			.flowJson?.dispositionNodes?.find((n) => n.id === 1100);
		expect(parentInFlow?.children?.some((c) => c.id === 1101)).toBe(true);
	});

	it('addNodeToParent no-op when parent not in catalog', () => {
		const child = createNode({ id: 1201, parentId: 1200 });
		// catalog doesn't contain parent1200 intentionally
		useDispositionBuilderStore.getState().setSelectedCatalog({
			id: 101,
			clientId: 1,
			name: 'cat3',
			dispositionNodes: [],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any);
		useDispositionBuilderStore.getState().addNodeToParent(child);
		const after = useDispositionBuilderStore.getState().flowJson;
		// Flow now has an empty dispositionNodes array; ensure nothing was added for this child
		expect(after?.dispositionNodes).toHaveLength(0);
		expect(after?.dispositionNodes?.some((n) => n.id === 1201)).toBe(false);
	});

	it('populateNodeWithChildren merges and removes orphan children when needed', () => {
		// Existing flow has parent with an orphan child that doesn't exist in catalog
		const parent = createNode({ id: 1300 });
		const orphan = createNode({ id: 1301, parentId: 1300 });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [{ ...parent, children: [orphan] }] });
		// Catalog has parent with a different child, so orphan should move to orphanChildren
		const catalogChild = createNode({ id: 1302, parentId: 1300 });
		useDispositionBuilderStore.getState().setSelectedCatalog({
			id: 200,
			clientId: 1,
			name: 'cat4',
			dispositionNodes: [{ ...parent, children: [catalogChild] }],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any);
		useDispositionBuilderStore.getState().populateNodeWithChildren(1300);
		const parentInFlow = useDispositionBuilderStore
			.getState()
			.flowJson?.dispositionNodes?.find((n) => n.id === 1300);
		expect(parentInFlow?.children?.some((c) => c.id === 1302)).toBe(true);
	});

	it('isParentInFlow returns false for invalid node objects', () => {
		expect(
			useDispositionBuilderStore.getState().isParentInFlow(null as any)
		).toBe(false);
		expect(
			useDispositionBuilderStore.getState().isParentInFlow({} as any)
		).toBe(false);
		expect(
			useDispositionBuilderStore
				.getState()
				.isParentInFlow({ id: 'not-a-number' } as any)
		).toBe(false);
	});

	it('adds missing siblings to parent when requested', () => {
		const parentCatalog = createNode({ id: 501, name: 'Parent', children: [] });
		const activeChild1 = createNode({ id: 502, parentId: 501 });
		const activeChild2 = createNode({ id: 503, parentId: 501 });
		parentCatalog.children = [activeChild1, activeChild2];

		const catalog = {
			id: 21,
			clientId: 1,
			name: 'Cat3',
			dispositionNodes: [parentCatalog],
			isActive: true,
			isDefault: false,
			createdAt: '',
			updatedAt: '',
		} as any;
		useDispositionBuilderStore.getState().setSelectedCatalog(catalog);

		// Add parent with only one child to flow
		useDispositionBuilderStore.getState().setFlowJson({
			dispositionNodes: [{ ...parentCatalog, children: [activeChild1] }],
		});

		// call addMissingSiblingsToParent with one of the child ids
		useDispositionBuilderStore.getState().addMissingSiblingsToParent(502);
		const flow =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		const parentInFlow = flow.find((n) => n.id === 501);
		// parent should now have two children (both activeChild1 and activeChild2)
		expect(parentInFlow?.children?.map((c) => c.id).sort()).toEqual([502, 503]);
	});

	it('updates a node properly', () => {
		const root = createNode({ id: 601, name: 'OldName' });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [root] });
		useDispositionBuilderStore
			.getState()
			.updateNode({ ...root, name: 'NewName' });
		const updated = useDispositionBuilderStore
			.getState()
			.flowJson?.dispositionNodes?.find((n) => n.id === 601);
		expect(updated?.name).toBe('NewName');
	});

	it('removes node and removes multiple nodes', () => {
		const child = createNode({ id: 701 });
		const parent = createNode({ id: 702, children: [child] });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [parent] });

		// remove child
		useDispositionBuilderStore.getState().removeNode(701);
		const afterRemove =
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes || [];
		expect(afterRemove[0].children).toHaveLength(0);

		// add multiple nodes then remove multiple by ids
		const n1 = createNode({ id: 711 });
		const n2 = createNode({ id: 712 });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [n1, n2] });
		useDispositionBuilderStore.getState().removeMultipleNodes([711, 712]);
		expect(
			useDispositionBuilderStore.getState().flowJson?.dispositionNodes
		).toHaveLength(0);
	});

	it('returns moved node ids as strings', () => {
		const child = createNode({ id: 801 });
		const parent = createNode({ id: 802, children: [child] });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [parent] });
		const ids = useDispositionBuilderStore.getState().getMovedNodeIds();
		expect(ids.sort()).toEqual(['801', '802'].sort());
	});

	it('checks parent in flow correctly', () => {
		const parent = createNode({ id: 901 });
		const child = createNode({ id: 902, parentId: 901 });
		useDispositionBuilderStore
			.getState()
			.setFlowJson({ dispositionNodes: [parent] });
		useDispositionBuilderStore
			.getState()
			.setSelectedCatalog({ dispositionNodes: [parent, child] } as any);
		expect(useDispositionBuilderStore.getState().isParentInFlow(child)).toBe(
			true
		);
		// a node not in flow should return false
		expect(
			useDispositionBuilderStore
				.getState()
				.isParentInFlow(createNode({ id: 9999 }))
		).toBe(false);
	});
});

export {};
