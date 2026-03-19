import { create } from 'zustand';
// Helper: Recursively sort nodes by 'order'
function sortNodesByOrder(nodes: DispositionNode[] = []): DispositionNode[] {
	return nodes
		.slice()
		.sort((a, b) => a.order - b.order)
		.map((node) => ({
			...node,
			children: node.children ? sortNodesByOrder(node.children) : [],
		}));
}
import type { DispositionCatalogModel } from '~/models/DispositionCatalogModels';
import type { DispositionFlowModel } from '~/models/DispositionFlowModel';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import {
	collectAllNodeIds,
	findNodeById,
	cloneNodeWithChildren,
} from '~/utils/dragDropUtils';

interface DispositionBuilderState {
	dispositionFlow?: Partial<DispositionFlowModel>;
	flowJson: Partial<DispositionCatalogModel>;
	campaignId?: number;
	setFlowJson: (flowJson: Partial<DispositionCatalogModel>) => void;
	setCampaignId: (id?: number) => void;
	addNode: (node: DispositionNode) => void;
	addNodeToParent: (node: DispositionNode) => void;
	isParentInFlow: (parentNode: DispositionNode) => boolean;
	addMultipleNodes: (nodes: DispositionNode[]) => void;
	removeNode: (nodeId: number) => void;
	removeMultipleNodes: (nodeIds: number[]) => void;
	getMovedNodeIds: () => string[];
	setDispositionFlow: (flow: Partial<DispositionFlowModel>) => void;
	selectedCatalog:
		| import('~/models/DispositionCatalogModels').DispositionCatalogModel
		| null;
	setSelectedCatalog: (
		catalog:
			| import('~/models/DispositionCatalogModels').DispositionCatalogModel
			| null
	) => void;
	updateNode: (node: DispositionNode) => void;
	previewNode: DispositionNode | null;
	setPreviewNode: (node: DispositionNode | null) => void;
	populateNodeWithChildren: (nodeId: number) => void;
	addMissingSiblingsToParent: (nodeId: number) => void;
}

export const useDispositionBuilderStore = create<DispositionBuilderState>(
	(set, get) => ({
		flowJson: {},
		builderNodes: [],
		campaignId: undefined,
		selectedCatalog: null,
		setFlowJson: (flowJson) => set({ flowJson }),
		setCampaignId: (id) => set({ campaignId: id }),
		setSelectedCatalog: (catalog) => set({ selectedCatalog: catalog }),
		setDispositionFlow: (flow) => set({ dispositionFlow: flow }),
		previewNode: null,
		setPreviewNode: (node) => set({ previewNode: node }),
		populateNodeWithChildren: (nodeId) => {
			const state = get();
			const catalogNodes = state.selectedCatalog?.dispositionNodes || [];
			if (!catalogNodes.length) return;

			const catalogNode = findNodeById(catalogNodes, nodeId);
			if (!catalogNode) return;

			function mergeChildren(
				existingChildren: DispositionNode[] = [],
				catalogChildren: DispositionNode[] = []
			): { children: DispositionNode[]; changed: boolean } {
				const existingMap = new Map<number, DispositionNode>();
				existingChildren.forEach((child) => existingMap.set(child.id, child));

				let changed = false;

				const filteredCatalogChildren = (catalogChildren || []).filter(
					(child) => child.isActive
				);

				const mergedChildren = filteredCatalogChildren.map((catalogChild) => {
					const existingChild = existingMap.get(catalogChild.id);

					if (existingChild) {
						const { children: mergedGrandChildren, changed: childChanged } =
							mergeChildren(
								existingChild.children || [],
								catalogChild.children || []
							);

						if (childChanged) {
							changed = true;
							return {
								...existingChild,
								children: mergedGrandChildren,
							};
						}

						return existingChild;
					}

					changed = true;
					return cloneNodeWithChildren(catalogChild);
				});

				const catalogIds = new Set(mergedChildren.map((child) => child.id));
				const orphanChildren = existingChildren.filter((child) => {
					const keep = !catalogIds.has(child.id);
					if (!keep) {
						changed = true;
					}
					return keep;
				});

				const merged = [...mergedChildren, ...orphanChildren];

				if (!changed) {
					if (merged.length !== existingChildren.length) {
						changed = true;
					} else {
						for (let i = 0; i < merged.length; i += 1) {
							if (merged[i] !== existingChildren[i]) {
								changed = true;
								break;
							}
						}
					}
				}

				if (!changed) {
					return { children: existingChildren, changed: false };
				}

				return { children: sortNodesByOrder(merged), changed: true };
			}

			const activeCatalogChildren = (catalogNode.children || []).filter(
				(child) => child.isActive
			);

			let updated = false;

			function populate(nodes: DispositionNode[] = []): DispositionNode[] {
				return nodes.map((currentNode) => {
					if (currentNode.id === nodeId) {
						const { children, changed } = mergeChildren(
							currentNode.children || [],
							activeCatalogChildren
						);

						if (!changed) {
							return currentNode;
						}

						updated = true;
						return {
							...currentNode,
							children,
						};
					}

					if (currentNode.children && currentNode.children.length > 0) {
						const childResult = populate(currentNode.children);
						if (childResult !== currentNode.children) {
							updated = true;
							return {
								...currentNode,
								children: childResult,
							};
						}
					}

					return currentNode;
				});
			}

			const existingNodes = state.flowJson?.dispositionNodes || [];
			const populatedNodes = populate(existingNodes);

			if (!updated) {
				return;
			}

			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: populatedNodes,
				},
			});
		},
		addMissingSiblingsToParent: (nodeId: number) => {
			const state = get();
			const catalogNodes = state.selectedCatalog?.dispositionNodes || [];
			if (!catalogNodes.length) return;

			const catalogNode = findNodeById(catalogNodes, nodeId);
			if (!catalogNode || !catalogNode.parentId) return;

			const parentCatalogNode = findNodeById(
				catalogNodes,
				catalogNode.parentId
			);
			if (!parentCatalogNode) return;

			const activeSiblings = (parentCatalogNode.children || []).filter(
				(child) => child.isActive
			);

			let updated = false;

			function addSiblingsToParent(
				nodes: DispositionNode[] = []
			): DispositionNode[] {
				return nodes.map((currentNode) => {
					if (currentNode.id === catalogNode?.parentId) {
						const existingChildren = currentNode.children || [];
						const existingIds = new Set(
							existingChildren.map((child) => child.id)
						);

						const missingSiblings = activeSiblings
							.filter((sibling) => !existingIds.has(sibling.id))
							.map((sibling) => cloneNodeWithChildren(sibling));

						if (missingSiblings.length > 0) {
							updated = true;
							return {
								...currentNode,
								children: sortNodesByOrder([
									...existingChildren,
									...missingSiblings,
								]),
							};
						}
						return currentNode;
					}

					if (currentNode.children && currentNode.children.length > 0) {
						const childResult = addSiblingsToParent(currentNode.children);
						if (childResult !== currentNode.children) {
							updated = true;
							return {
								...currentNode,
								children: childResult,
							};
						}
					}

					return currentNode;
				});
			}

			const existingNodes = state.flowJson?.dispositionNodes || [];
			const updatedNodes = addSiblingsToParent(existingNodes);

			if (!updated) {
				return;
			}

			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: updatedNodes,
				},
			});
		},
		// Helper: Recursively sort nodes by 'order'
		// Update a node in the builder tree
		updateNode: (updatedNode: DispositionNode) => {
			const state = get();
			function updateNodeRecursive(
				nodes: DispositionNode[] = []
			): DispositionNode[] {
				return nodes.map((node) => {
					if (node.id === updatedNode.id) {
						return {
							...node,
							...updatedNode,
							children: node.children ? updateNodeRecursive(node.children) : [],
						};
					}
					return {
						...node,
						children: node.children ? updateNodeRecursive(node.children) : [],
					};
				});
			}
			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: updateNodeRecursive(
						state.flowJson?.dispositionNodes || []
					),
				},
			});
		},

		// Add a node to a parent, but only the dragged node (not all siblings)
		addNodeToParent: (node: DispositionNode) => {
			if (!node) return;
			const state = get();
			const catalogNodes = state.selectedCatalog?.dispositionNodes || [];
			let builderNodes = [...(state.flowJson?.dispositionNodes || [])];

			// Build ancestor chain from root to node (excluding siblings)
			const ancestorChain: DispositionNode[] = [];
			let currentNode: DispositionNode | undefined = node;
			while (currentNode) {
				// Only push the ancestor node itself, not its siblings
				ancestorChain.unshift({
					...currentNode,
					children: [], // Only keep children if it's the dragged node
				});
				if (!currentNode.parentId) break;
				const foundParent = findNodeById(catalogNodes, currentNode.parentId);
				currentNode = foundParent === null ? undefined : foundParent;
			}

			// Helper to add node to builder tree at correct place
			function addToBuilderTree(
				nodeToAdd: DispositionNode,
				isDraggedNode: boolean
			) {
				// If root (no parentId), add to root if not present
				if (!nodeToAdd.parentId) {
					if (!findNodeById(builderNodes, nodeToAdd.id)) {
						builderNodes.push({
							...nodeToAdd,
							children: isDraggedNode
								? nodeToAdd.children
									? [...nodeToAdd.children]
									: []
								: [],
						});
					}
					return;
				}
				// Otherwise, find parent in builder tree
				const parentInBuilder = findNodeById(builderNodes, nodeToAdd.parentId);
				if (parentInBuilder) {
					if (!parentInBuilder.children) parentInBuilder.children = [];
					if (
						!parentInBuilder.children.find((child) => child.id === nodeToAdd.id)
					) {
						parentInBuilder.children.push({
							...nodeToAdd,
							children: isDraggedNode
								? nodeToAdd.children
									? [...nodeToAdd.children]
									: []
								: [],
						});
						parentInBuilder.children = sortNodesByOrder(
							parentInBuilder.children
						);
					}
				} else {
					// Parent not in builder, recursively add parent first
					const parentNode = findNodeById(catalogNodes, nodeToAdd.parentId);
					if (parentNode) {
						addToBuilderTree({ ...parentNode, children: [] }, false);
						// Now parent is in builder, add node as child
						addToBuilderTree(nodeToAdd, isDraggedNode);
					}
				}
			}

			// Add each ancestor in order, only the dragged node keeps its children
			ancestorChain.forEach((ancestor, idx) => {
				const isDraggedNode = idx === ancestorChain.length - 1;
				addToBuilderTree(ancestor, isDraggedNode);
			});

			// Update state
			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: sortNodesByOrder(builderNodes),
				},
			});
		},
		isParentInFlow: (parentNode: DispositionNode) => {
			if (!parentNode) return false;
			const state = get();
			const nodes = state.flowJson?.dispositionNodes || [];
			// Recursively check if any ancestor is in the flow
			function isNodeInFlow(node: DispositionNode | null): boolean {
				if (!node || typeof node !== 'object' || typeof node.id !== 'number')
					return false;
				// Is this node in the builder?
				const found = findNodeById(nodes, node.id);
				if (found) return true;
				// If not, check its parent recursively
				if (node.parentId) {
					const parent = findNodeById(
						state.selectedCatalog?.dispositionNodes || [],
						node.parentId
					);
					return isNodeInFlow(parent);
				}
				return false;
			}
			return isNodeInFlow(parentNode);
		},
		addNode: (node) => {
			const state = get();
			const existingIds = new Set(
				state.flowJson?.dispositionNodes?.map((n) => n.id) || []
			);

			// Check if node already exists to prevent duplicates
			if (existingIds.has(node.id)) {
				return;
			}

			// Create a deep copy of the node to avoid mutations
			const nodeToAdd = {
				...node,
				children: node.children ? [...node.children] : [],
			};

			// Add the node directly to the flow
			const updatedNodes = [
				...(state.flowJson?.dispositionNodes || []),
				nodeToAdd,
			];

			// Recursively sort all nodes after addition
			const sortedNodes = sortNodesByOrder(updatedNodes);

			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: sortedNodes,
				},
			});
		},

		addMultipleNodes: (nodes) => {
			const state = get();
			const existingIds = new Set(
				state.flowJson?.dispositionNodes?.map((n) => n.id) || []
			);

			// Filter out nodes that are already in the builder (including their children)
			const newNodes = nodes.filter((n) => {
				const nodeIds = collectAllNodeIds(n);
				return !nodeIds.some((id) => existingIds.has(id));
			});

			if (newNodes.length > 0) {
				set({
					flowJson: {
						...state.flowJson,
						dispositionNodes: [
							...(state.flowJson?.dispositionNodes || []),
							...newNodes,
						],
					},
				});
			}
		},

		removeNode: (nodeId) => {
			const state = get();
			// Helper to recursively remove node from tree
			function removeNodeRecursive(
				nodes: DispositionNode[] = []
			): DispositionNode[] {
				return nodes
					.filter((node) => node.id !== nodeId)
					.map((node) => ({
						...node,
						children: node.children ? removeNodeRecursive(node.children) : [],
					}));
			}

			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: removeNodeRecursive(
						state.flowJson?.dispositionNodes || []
					),
				},
			});
		},

		removeMultipleNodes: (nodeIds) => {
			const state = get();
			const allIdsToRemove = new Set<number>();

			// Collect all IDs including children for each node to remove
			nodeIds.forEach((nodeId) => {
				const nodeToRemove = state.flowJson?.dispositionNodes?.find(
					(n) => n.id === nodeId
				);
				if (nodeToRemove) {
					const idsToRemove = collectAllNodeIds(nodeToRemove);
					idsToRemove.forEach((id) => allIdsToRemove.add(id));
				}
			});

			set({
				flowJson: {
					...state.flowJson,
					dispositionNodes: state.flowJson?.dispositionNodes?.filter(
						(n) => !allIdsToRemove.has(n.id)
					),
				},
			});
		},

		getMovedNodeIds: () => {
			const state = get();
			const allMovedIds: string[] = [];

			state.flowJson?.dispositionNodes?.forEach((node) => {
				const idsForNode = collectAllNodeIds(node);
				allMovedIds.push(...idsForNode.map((id) => String(id)));
			});

			return allMovedIds;
		},
	})
);
