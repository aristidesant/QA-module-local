import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DispositionNode } from '~/models/DispositionNodeModel';

import {
	collectActiveDescendants,
	collectAllNodeIdsRecursive,
	getAllFlowNodeIds,
	findNodeInFlow,
	handleAddGroupWithChildren,
} from './dispositionCatalogHelper';

const mockFindNodeById = vi.fn();
const mockGetDirectHierarchyTree = vi.fn();
const mockCloneNodeWithChildren = vi.fn();

vi.mock('~/utils/dragDropUtils', () => ({
	findNodeById: (...args: any[]) => mockFindNodeById(...args),
	getDirectHierarchyTree: (...args: any[]) =>
		mockGetDirectHierarchyTree(...args),
	cloneNodeWithChildren: (...args: any[]) => mockCloneNodeWithChildren(...args),
}));

describe('dispositionCatalogHelper', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('collectActiveDescendants returns only active descendants recursively', () => {
		const node = {
			id: 1,
			children: [
				{ id: 2, isActive: true, children: [{ id: 5, isActive: false }] },
				{ id: 3, isActive: false, children: [{ id: 6, isActive: true }] },
				{ id: 4, isActive: true, children: [{ id: 7, isActive: true }] },
			],
		} as unknown as DispositionNode;

		const result = collectActiveDescendants(node);

		// Should include 2, 4 and 7 (5 is inactive, 3 and 6 are under an inactive parent)
		expect(result.map((n) => n.id)).toEqual([2, 4, 7]);
	});

	it('collectAllNodeIdsRecursive returns all ids including children', () => {
		const node = {
			id: 10,
			children: [{ id: 11, children: [{ id: 12 }] }, { id: 13 }],
		} as unknown as DispositionNode;

		const ids = collectAllNodeIdsRecursive(node);
		expect(ids).toEqual([10, 11, 12, 13]);
	});

	it('getAllFlowNodeIds returns a set with all nested ids', () => {
		const flowNodes = [
			{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
			{ id: 4 },
		] as unknown as DispositionNode[];

		const ids = getAllFlowNodeIds(flowNodes);
		expect(Array.from(ids).sort()).toEqual([1, 2, 3, 4]);
	});

	it('findNodeInFlow finds nested node by id', () => {
		const flowNodes = [
			{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
			{ id: 4 },
		] as unknown as DispositionNode[];

		const found = findNodeInFlow(flowNodes, 3);
		expect(found?.id).toBe(3);
		expect(findNodeInFlow(flowNodes, 99)).toBe(null);
	});

	describe('handleAddGroupWithChildren', () => {
		it('adds the full hierarchy when target node not in flow', () => {
			const targetNode = {
				id: 2,
				children: [
					{ id: 20, isActive: true },
					{ id: 21, isActive: false },
				],
			} as unknown as DispositionNode;
			const catalogNodes = [
				{ id: 2, children: [] },
			] as unknown as DispositionNode[];
			const flowNodes: DispositionNode[] = [];

			const addNode = vi.fn();
			const addNodeToParent = vi.fn();

			// make the hierarchy return the target node as root so we can assert modified children
			const hierarchyNode = {
				id: 2,
				children: [],
			} as unknown as DispositionNode;
			mockGetDirectHierarchyTree.mockReturnValue(hierarchyNode);

			// clone should return a basic clone object
			mockCloneNodeWithChildren.mockImplementation((n: any) => ({
				...n,
				cloned: true,
			}));

			handleAddGroupWithChildren(
				targetNode,
				catalogNodes,
				flowNodes,
				addNode,
				addNodeToParent
			);

			expect(mockGetDirectHierarchyTree).toHaveBeenCalledWith(
				catalogNodes,
				targetNode.id
			);
			expect(addNode).toHaveBeenCalledTimes(1);
			const added = addNode.mock.calls[0][0] as DispositionNode;
			// should only have active children cloned
			expect(added.children?.map((c) => (c as any).id)).toEqual([20]);
			expect((added.children?.[0] as any).cloned).toBeTruthy();
			expect(addNodeToParent).not.toHaveBeenCalled();
		});

		it('handles a hierarchy where target is nested and uses traversal to set children', () => {
			const targetNode = {
				id: 3,
				children: [{ id: 30, isActive: true }],
			} as unknown as DispositionNode;
			const catalogNodes = [
				{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
			] as unknown as DispositionNode[];
			const flowNodes: DispositionNode[] = [];

			const addNode = vi.fn();
			const addNodeToParent = vi.fn();

			const hierarchyNode = {
				id: 1,
				children: [{ id: 2, children: [{ id: 3, children: [] }] }],
			} as unknown as DispositionNode;
			mockGetDirectHierarchyTree.mockReturnValue(hierarchyNode);
			mockCloneNodeWithChildren.mockImplementation((n: any) => ({
				...n,
				cloned: true,
			}));

			handleAddGroupWithChildren(
				targetNode,
				catalogNodes,
				flowNodes,
				addNode,
				addNodeToParent
			);

			// After running, the nested child with id 3 should have its children set and be cloned
			const nestedChild = hierarchyNode.children?.[0].children?.[0];
			expect(nestedChild?.children?.[0].id).toBe(30);
			expect((nestedChild?.children?.[0] as any).cloned).toBeTruthy();
			expect(addNode).toHaveBeenCalledWith(hierarchyNode);
		});

		it('returns early when hierarchy not found', () => {
			const targetNode = {
				id: 100,
				children: [{ id: 101, isActive: true }],
			} as unknown as DispositionNode;
			const catalogNodes: DispositionNode[] = [];
			const flowNodes: DispositionNode[] = [];

			const addNode = vi.fn();
			const addNodeToParent = vi.fn();

			mockGetDirectHierarchyTree.mockReturnValue(null as any);
			handleAddGroupWithChildren(
				targetNode,
				catalogNodes,
				flowNodes,
				addNode,
				addNodeToParent
			);
			expect(addNode).not.toHaveBeenCalled();
			expect(addNodeToParent).not.toHaveBeenCalled();
		});

		it('does nothing when all descendants already exist in flow', () => {
			const targetNode = {
				id: 2,
				children: [{ id: 20, isActive: true }],
			} as unknown as DispositionNode;
			const catalogNodes = [{ id: 20 }] as unknown as DispositionNode[];
			const flowNodes: DispositionNode[] = [{ id: 2 }, { id: 20 } as any];

			const addNode = vi.fn();
			const addNodeToParent = vi.fn();

			mockGetDirectHierarchyTree.mockReturnValue(null as any);
			mockFindNodeById.mockImplementation((nodes, id) =>
				nodes.find((n: any) => n.id === id)
			);
			mockCloneNodeWithChildren.mockImplementation((n: any) => ({
				...n,
				cloned: true,
			}));

			handleAddGroupWithChildren(
				targetNode,
				catalogNodes as any,
				flowNodes,
				addNode,
				addNodeToParent
			);

			expect(addNode).not.toHaveBeenCalled();
			expect(addNodeToParent).not.toHaveBeenCalled();
		});

		it('adds only missing descendants when node exists in flow', () => {
			const targetNode = {
				id: 2,
				children: [
					{ id: 20, isActive: true },
					{ id: 21, isActive: true },
				],
			} as unknown as DispositionNode;
			const catalogNodes = [
				{ id: 20 },
				{ id: 21 },
			] as unknown as DispositionNode[];
			const flowNodes: DispositionNode[] = [{ id: 2 } as any];

			const addNode = vi.fn();
			const addNodeToParent = vi.fn();

			// not used when target already in flow
			mockGetDirectHierarchyTree.mockReturnValue(null as any);

			mockFindNodeById.mockImplementation((nodes, id) =>
				nodes.find((n: any) => n.id === id)
			);
			mockCloneNodeWithChildren.mockImplementation((n: any) => ({
				...n,
				cloned: true,
			}));

			handleAddGroupWithChildren(
				targetNode,
				catalogNodes as any,
				flowNodes,
				addNode,
				addNodeToParent
			);

			// Should not call addNode since target exists
			expect(addNode).not.toHaveBeenCalled();
			// Should call addNodeToParent once per missing descendant
			expect(addNodeToParent).toHaveBeenCalledTimes(2);
			// And the nodes passed should be clones
			const addedIds = addNodeToParent.mock.calls.map((c) => c[0].id).sort();
			expect(addedIds).toEqual([20, 21]);
			expect(addNodeToParent.mock.calls[0][0].cloned).toBeTruthy();
		});
	});
});

export {};
