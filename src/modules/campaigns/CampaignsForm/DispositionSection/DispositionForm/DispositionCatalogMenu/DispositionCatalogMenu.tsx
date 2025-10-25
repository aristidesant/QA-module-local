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
import { useAvailableDispositionNodes } from '~/hooks/useAvailableDispositionNodes';

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

	const availableNodes = useAvailableDispositionNodes(
		selectedCatalog,
		movedNodeIds
	);

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
				size='xs'
			/>
			<Divider my='xs' />
			<Box className={styles.menuListWrapper}>
				{availableNodes.length === 0 ? (
					<Text c='dimmed' ta='center' size='xs'>
						No dispositions available in this catalog.
					</Text>
				) : (
					<Stack gap={4}>
						{availableNodes.map((item, idx) => (
							<div
								key={`${item.node.id}-${idx}`}
								style={{
									marginLeft: `${item.level * 12}px`,
									width: `calc(100% - ${item.level * 12}px)`,
								}}
							>
								<DispositionCatalogMenuItem
									node={item.node}
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
