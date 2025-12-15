import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAvailableDispositionNodes } from './useAvailableDispositionNodes';
import type { DispositionNode } from '~/models/DispositionNodeModel';

const createMockNode = (
	overrides: Partial<DispositionNode> = {}
): DispositionNode => ({
	id: 1,
	clientId: 1,
	name: 'Test Node',
	isInvalidatesNumber: false,
	requiresReschedule: false,
	isFinal: false,
	order: 1,
	isActive: true,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
	...overrides,
});

describe('useAvailableDispositionNodes', () => {
	describe('when selectedCatalog is null', () => {
		it('should return an empty array', () => {
			const { result } = renderHook(() =>
				useAvailableDispositionNodes(null, [])
			);

			expect(result.current).toEqual([]);
		});
	});

	describe('when selectedCatalog has no dispositionNodes', () => {
		it('should return an empty array', () => {
			const { result } = renderHook(() => useAvailableDispositionNodes({}, []));

			expect(result.current).toEqual([]);
		});

		it('should return an empty array when dispositionNodes is undefined', () => {
			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: undefined }, [])
			);

			expect(result.current).toEqual([]);
		});
	});

	describe('when selectedCatalog has dispositionNodes', () => {
		it('should return only active nodes', () => {
			const activeNode = createMockNode({
				id: 1,
				name: 'Active Node',
				isActive: true,
			});
			const inactiveNode = createMockNode({
				id: 2,
				name: 'Inactive Node',
				isActive: false,
			});

			const { result } = renderHook(() =>
				useAvailableDispositionNodes(
					{ dispositionNodes: [activeNode, inactiveNode] },
					[]
				)
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].node.name).toBe('Active Node');
		});

		it('should return nodes with level 0 for root nodes', () => {
			const node = createMockNode({ id: 1, name: 'Root Node' });

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [node] }, [])
			);

			expect(result.current[0].level).toBe(0);
		});

		it('should not disable nodes by default', () => {
			const node = createMockNode({ id: 1, name: 'Test Node' });

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [node] }, [])
			);

			expect(result.current[0].disabled).toBe(false);
		});
	});

	describe('when movedNodeIds contains node IDs', () => {
		it('should not include leaf nodes that have been moved', () => {
			const node1 = createMockNode({ id: 1, name: 'Node 1' });
			const node2 = createMockNode({ id: 2, name: 'Node 2' });

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [node1, node2] }, [
					'1',
				])
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].node.id).toBe(2);
		});

		it('should handle string IDs conversion to numbers', () => {
			const node = createMockNode({ id: 123, name: 'Test Node' });

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [node] }, ['123'])
			);

			expect(result.current).toHaveLength(0);
		});
	});

	describe('when nodes have children', () => {
		it('should include parent and children with correct levels', () => {
			const childNode = createMockNode({
				id: 2,
				name: 'Child Node',
				isActive: true,
			});
			const parentNode = createMockNode({
				id: 1,
				name: 'Parent Node',
				children: [childNode],
			});

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [parentNode] }, [])
			);

			expect(result.current).toHaveLength(2);
			expect(result.current[0].node.name).toBe('Parent Node');
			expect(result.current[0].level).toBe(0);
			expect(result.current[1].node.name).toBe('Child Node');
			expect(result.current[1].level).toBe(1);
		});

		it('should hide parent when all children are moved', () => {
			const childNode1 = createMockNode({
				id: 2,
				name: 'Child 1',
				isActive: true,
			});
			const childNode2 = createMockNode({
				id: 3,
				name: 'Child 2',
				isActive: true,
			});
			const parentNode = createMockNode({
				id: 1,
				name: 'Parent Node',
				children: [childNode1, childNode2],
			});

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [parentNode] }, [
					'2',
					'3',
				])
			);

			expect(result.current).toHaveLength(0);
		});

		it('should show parent and remaining children when some children are moved', () => {
			const childNode1 = createMockNode({
				id: 2,
				name: 'Child 1',
				isActive: true,
			});
			const childNode2 = createMockNode({
				id: 3,
				name: 'Child 2',
				isActive: true,
			});
			const parentNode = createMockNode({
				id: 1,
				name: 'Parent Node',
				children: [childNode1, childNode2],
			});

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [parentNode] }, ['2'])
			);

			expect(result.current).toHaveLength(2);
			expect(result.current[0].node.name).toBe('Parent Node');
			expect(result.current[1].node.name).toBe('Child 2');
		});

		it('should filter out inactive children', () => {
			const activeChild = createMockNode({
				id: 2,
				name: 'Active Child',
				isActive: true,
			});
			const inactiveChild = createMockNode({
				id: 3,
				name: 'Inactive Child',
				isActive: false,
			});
			const parentNode = createMockNode({
				id: 1,
				name: 'Parent Node',
				children: [activeChild, inactiveChild],
			});

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [parentNode] }, [])
			);

			expect(result.current).toHaveLength(2);
			expect(
				result.current.find((n) => n.node.name === 'Inactive Child')
			).toBeUndefined();
		});

		it('should handle deeply nested nodes', () => {
			const grandchildNode = createMockNode({
				id: 3,
				name: 'Grandchild',
				isActive: true,
			});
			const childNode = createMockNode({
				id: 2,
				name: 'Child',
				isActive: true,
				children: [grandchildNode],
			});
			const parentNode = createMockNode({
				id: 1,
				name: 'Parent',
				children: [childNode],
			});

			const { result } = renderHook(() =>
				useAvailableDispositionNodes({ dispositionNodes: [parentNode] }, [])
			);

			expect(result.current).toHaveLength(3);
			expect(result.current[0].level).toBe(0);
			expect(result.current[1].level).toBe(1);
			expect(result.current[2].level).toBe(2);
		});
	});

	describe('memoization', () => {
		it('should return the same reference when inputs do not change', () => {
			const node = createMockNode({ id: 1, name: 'Test Node' });
			const catalog = { dispositionNodes: [node] };
			const movedIds: string[] = [];

			const { result, rerender } = renderHook(() =>
				useAvailableDispositionNodes(catalog, movedIds)
			);

			const firstResult = result.current;
			rerender();
			const secondResult = result.current;

			expect(firstResult).toBe(secondResult);
		});
	});
	describe('when dealing with partial grandchildren', () => {
		it('should show parent when a grandchild is NOT in the flow, even if child is', () => {
			const grandchildNode = createMockNode({
				id: 3,
				name: 'Grandchild',
				isActive: true,
			});
			const childNode = createMockNode({
				id: 2,
				name: 'Child',
				isActive: true,
				children: [grandchildNode],
			});
			const parentNode = createMockNode({
				id: 1,
				name: 'Parent',
				children: [childNode],
			});

			// Flow contains Parent(1) and Child(2), but NOT Grandchild(3)
			// Parent should be visible (enabled or disabled dep on logic, but visible)
			// Child should be visible to allow selecting Grandchild
			const movedIds = ['1', '2'];

			const { result } = renderHook(() =>
				useAvailableDispositionNodes(
					{ dispositionNodes: [parentNode] },
					movedIds
				)
			);

			// We expect:
			// Parent Node (level 0) - should be present because deep children are missing
			// Child Node (level 1) - should be present because its child (Grandchild) is missing
			// Grandchild Node (level 2) - should be present because it is missing

			// Currently, the bug causes recursion to stop at Child because Child is in movedIds.

			const parent = result.current.find((n) => n.node.id === 1);
			expect(parent).toBeDefined();

			const child = result.current.find((n) => n.node.id === 2);
			expect(child).toBeDefined();

			const grandchild = result.current.find((n) => n.node.id === 3);
			expect(grandchild).toBeDefined();
		});
	});
});
