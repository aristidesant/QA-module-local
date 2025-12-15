import { useMemo } from 'react';
import type { DispositionNode } from '~/models/DispositionNodeModel';

export interface AvailableNode {
	node: DispositionNode;
	disabled: boolean;
	level: number;
}

export const useAvailableDispositionNodes = (
	selectedCatalog: { dispositionNodes?: DispositionNode[] } | null,
	movedNodeIds: string[]
): AvailableNode[] => {
	return useMemo((): AvailableNode[] => {
		if (!selectedCatalog?.dispositionNodes) return [];

		// Filter to show only active nodes
		const activeNodes = selectedCatalog.dispositionNodes.filter(
			(node) => node.isActive
		);

		const allNodes = activeNodes;
		const movedIds = new Set(movedNodeIds.map((id) => parseInt(id)));
		const result: AvailableNode[] = [];

		// Helper function
		const getAllChildIds = (node: DispositionNode): number[] => {
			if (!node.children || node.children.length === 0) return [];
			return node.children.reduce<number[]>((acc, child) => {
				// Only include active children
				if (!child.isActive) return acc;
				return [...acc, child.id, ...getAllChildIds(child)];
			}, []);
		};

		// Logic: Show parent and children unless all children are added
		const addNodeWithChildren = (node: DispositionNode, level: number = 0) => {
			const hasChildren = node.children && node.children.length > 0;

			// Filter children to only include active ones
			const activeChildren = hasChildren
				? node.children!.filter((child) => child.isActive)
				: [];

			const childIds = activeChildren.length > 0 ? getAllChildIds(node) : [];
			const allChildrenMoved =
				childIds.length > 0 && childIds.every((id) => movedIds.has(id));

			// Case 1: Parent node with children
			if (activeChildren.length > 0) {
				// Hide parent only if ALL children are in the flow
				if (allChildrenMoved) {
					return;
				}

				// Show parent (always enabled)
				result.push({
					node,
					disabled: false,
					level,
				});

				// Process children - only show children that are NOT moved
				activeChildren.forEach((child) => {
					addNodeWithChildren(child, level + 1);
				});
			} else {
				// Case 2: Leaf node - show only if not moved
				const isMoved = movedIds.has(node.id);
				if (!isMoved) {
					result.push({
						node,
						disabled: false,
						level,
					});
				}
			}
		};

		allNodes.forEach((node) => {
			addNodeWithChildren(node, 0);
		});

		return result;
	}, [selectedCatalog, movedNodeIds]);
};
