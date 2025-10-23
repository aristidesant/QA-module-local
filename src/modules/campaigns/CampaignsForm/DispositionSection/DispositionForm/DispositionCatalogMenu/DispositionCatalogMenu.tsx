import { useMemo, useEffect, useCallback } from 'react';
import styles from './DispositionCatalogMenu.module.css';
import { useDispositionBuilderStore } from '../../dispositionStore';
import { Select, Divider, Stack, Text, Box } from '@mantine/core';
import { useDispositionCatalogs } from '~/queries/dispositionCatalogQueries';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import DispositionCatalogMenuItem from './DispositionCatalogMenuItem';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { findNodeById, getDirectHierarchyTree } from '~/utils/dragDropUtils';
import { handleAddGroupWithChildren } from './dispositionCatalogHelper';

interface AvailableNode {
	node: DispositionNode;
	disabled: boolean;
	level: number;
}

const DispositionCatalogMenu: React.FC = () => {
	const { getMovedNodeIds, selectedCatalog, setSelectedCatalog } =
		useDispositionBuilderStore();
	const { addNode, addNodeToParent, isParentInFlow, flowJson } =
		useDispositionBuilderStore((state) => state);
	const movedNodeIds = getMovedNodeIds();
	const campaign = useCampaignsStore((state) => state.selectedCampaign);

	const { data: catalogs = [], isLoading } = useDispositionCatalogs({
		type: campaign?.type ?? 'OUTBOUND',
	});

	// Filter to show only active catalogs
	const activeCatalogs = useMemo(() => {
		return catalogs.filter((catalog) => catalog.isActive);
	}, [catalogs]);

	// Set default catalog if not set or if selectedCatalog is not in the list
	useEffect(() => {
		if (activeCatalogs.length > 0) {
			if (
				!selectedCatalog ||
				!activeCatalogs.some((cat) => cat.id === selectedCatalog.id)
			) {
				setSelectedCatalog(activeCatalogs[0]);
			}
		}
	}, [activeCatalogs]);

	// Helper functions
	const getAllChildIds = (node: DispositionNode): number[] => {
		if (!node.children || node.children.length === 0) return [];
		return node.children.reduce<number[]>((acc, child) => {
			// Only include active children
			if (!child.isActive) return acc;
			return [...acc, child.id, ...getAllChildIds(child)];
		}, []);
	};

	const availableNodes = useMemo((): AvailableNode[] => {
		if (!selectedCatalog?.dispositionNodes) return [];

		// Filter to show only active nodes
		const activeNodes = selectedCatalog.dispositionNodes.filter(
			(node) => node.isActive
		);

		const allNodes = activeNodes;
		const movedIds = new Set(movedNodeIds.map((id) => parseInt(id)));
		const result: AvailableNode[] = [];

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
					const childMoved = movedIds.has(child.id);
					if (!childMoved) {
						addNodeWithChildren(child, level + 1);
					}
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

	const handleAddNode = useCallback(
		(node: DispositionNode) => {
			if (!selectedCatalog) return;

			const catalogNodes = selectedCatalog.dispositionNodes ?? [];
			const currentNode = findNodeById(catalogNodes, node.id);
			if (!currentNode) return;

			// Check if this node has children
			const hasChildren =
				currentNode.children && currentNode.children.length > 0;

			if (hasChildren) {
				// If parent node, add all children
				handleAddGroupWithChildren(
					currentNode,
					catalogNodes,
					flowJson?.dispositionNodes ?? [],
					addNode,
					addNodeToParent
				);
				return;
			}

			// For leaf nodes, check if parent is in flow
			let parentNode: DispositionNode | null = null;
			if (currentNode.parentId) {
				parentNode = findNodeById(catalogNodes, currentNode.parentId);
			}

			const parentInFlow = parentNode && isParentInFlow(parentNode);
			if (parentInFlow && parentNode) {
				addNodeToParent(currentNode);
				return;
			}

			const hierarchyNode = getDirectHierarchyTree(
				catalogNodes,
				currentNode.id
			);

			if (!hierarchyNode) return;

			const existingIds = new Set(
				(flowJson?.dispositionNodes ?? []).map((n) => n.id)
			);

			if (!existingIds.has(hierarchyNode.id)) {
				addNode(hierarchyNode);
			}
		},
		[
			addNode,
			addNodeToParent,
			flowJson?.dispositionNodes,
			isParentInFlow,
			selectedCatalog,
		]
	);

	const hasNodesInFlow = (flowJson?.dispositionNodes?.length ?? 0) > 0;

	return (
		<div className={styles.container}>
			<Select
				label='Select Catalog'
				data={activeCatalogs.map((cat) => ({
					value: String(cat.id),
					label: cat.name,
				}))}
				value={selectedCatalog ? String(selectedCatalog.id) : null}
				onChange={(id) => {
					const catalog =
						activeCatalogs.find((cat) => String(cat.id) === id) || null;
					setSelectedCatalog(catalog);
				}}
				disabled={isLoading || activeCatalogs.length === 0 || hasNodesInFlow}
				description={
					hasNodesInFlow
						? 'Cannot change catalog when outcomes are already added'
						: undefined
				}
			/>
			<Divider my='md' />
			<Box className={styles.menuListWrapper}>
				{availableNodes.length === 0 ? (
					<Text c='dimmed' ta='center'>
						No dispositions available in this catalog.
					</Text>
				) : (
					<Stack gap='xs'>
						{availableNodes.map((item, idx) => (
							<div
								key={`${item.node.id}-${idx}`}
								style={{
									marginLeft: `${item.level * 16}px`,
									width: `calc(100% - ${item.level * 16}px)`,
								}}
							>
								<DispositionCatalogMenuItem
									node={item.node}
									disabled={false}
									onAdd={handleAddNode}
								/>
							</div>
						))}
					</Stack>
				)}
			</Box>
		</div>
	);
};

export default DispositionCatalogMenu;
