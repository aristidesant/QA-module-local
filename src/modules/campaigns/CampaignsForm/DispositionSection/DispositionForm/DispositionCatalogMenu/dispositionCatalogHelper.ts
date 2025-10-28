import type { DispositionNode } from '~/models/DispositionNodeModel';
import {
	findNodeById,
	getDirectHierarchyTree,
	cloneNodeWithChildren,
} from '~/utils/dragDropUtils';

/**
 * Collects all active descendants recursively from a node
 */
export const collectActiveDescendants = (
	node: DispositionNode
): DispositionNode[] => {
	if (!node.children || node.children.length === 0) return [];

	const activeChildren = node.children.filter((child) => child.isActive);
	const descendants: DispositionNode[] = [];

	activeChildren.forEach((child) => {
		descendants.push(child);
		descendants.push(...collectActiveDescendants(child));
	});

	return descendants;
};

/**
 * Collects all node IDs recursively including the node itself and all descendants
 */
export const collectAllNodeIdsRecursive = (node: DispositionNode): number[] => {
	const ids = [node.id];
	if (node.children && node.children.length > 0) {
		node.children.forEach((child) => {
			ids.push(...collectAllNodeIdsRecursive(child));
		});
	}
	return ids;
};

/**
 * Gets all node IDs that exist in the flow recursively
 */
export const getAllFlowNodeIds = (
	flowNodes: DispositionNode[]
): Set<number> => {
	const ids = new Set<number>();

	const traverse = (nodes: DispositionNode[]) => {
		nodes.forEach((node) => {
			ids.add(node.id);
			if (node.children && node.children.length > 0) {
				traverse(node.children);
			}
		});
	};

	traverse(flowNodes);
	return ids;
};

/**
 * Finds a node in the flow tree by its ID, searching recursively
 */
export const findNodeInFlow = (
	flowNodes: DispositionNode[],
	nodeId: number
): DispositionNode | null => {
	for (const node of flowNodes) {
		if (node.id === nodeId) {
			return node;
		}
		if (node.children && node.children.length > 0) {
			const found = findNodeInFlow(node.children, nodeId);
			if (found) return found;
		}
	}
	return null;
};

/**
 * Handles adding a group and all its descendants to the flow
 * @param targetNode - The node to add with all its children
 * @param catalogNodes - All nodes from the catalog
 * @param flowNodes - Current nodes in the flow
 * @param addNode - Function to add a node to the flow
 * @param addNodeToParent - Function to add a node to an existing parent in the flow
 */
export const handleAddGroupWithChildren = (
	targetNode: DispositionNode,
	catalogNodes: DispositionNode[],
	flowNodes: DispositionNode[],
	addNode: (node: DispositionNode) => void,
	addNodeToParent: (node: DispositionNode) => void
): void => {
	// Get all existing IDs in the flow (including nested children)
	const existingIds = getAllFlowNodeIds(flowNodes);

	// If the node itself is not in the flow, add it with full hierarchy
	if (!existingIds.has(targetNode.id)) {
		const hierarchyNode = getDirectHierarchyTree(catalogNodes, targetNode.id);
		if (!hierarchyNode) return;

		// Attach full children set to the target node within the hierarchy chain
		let cursor: DispositionNode = hierarchyNode;
		while (cursor.children && cursor.children.length > 0) {
			const child = cursor.children[0];
			if (child.id === targetNode.id) {
				child.children = targetNode.children
					? targetNode.children
							.filter((c) => c.isActive)
							.map((childNode) => cloneNodeWithChildren(childNode))
					: [];
				break;
			}
			cursor = child;
		}

		if (hierarchyNode.id === targetNode.id) {
			hierarchyNode.children = targetNode.children
				? targetNode.children
						.filter((c) => c.isActive)
						.map((childNode) => cloneNodeWithChildren(childNode))
				: [];
		}

		addNode(hierarchyNode);
	} else {
		// Node is already in flow, add only missing descendants
		const allDescendants = collectActiveDescendants(targetNode);

		// Filter to get only the missing ones
		const missingDescendants = allDescendants.filter(
			(desc) => !existingIds.has(desc.id)
		);

		// Get the full node structure from catalog for each missing descendant
		missingDescendants.forEach((descendant) => {
			const fullDescendant = findNodeById(catalogNodes, descendant.id);
			if (fullDescendant) {
				// Clone with all its children to add the complete subtree
				const nodeWithChildren = cloneNodeWithChildren(fullDescendant);
				addNodeToParent(nodeWithChildren);
			}
		});
	}
};
