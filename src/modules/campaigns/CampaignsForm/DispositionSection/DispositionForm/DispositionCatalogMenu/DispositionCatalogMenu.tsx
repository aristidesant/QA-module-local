import { useMemo, useEffect, useCallback, useState } from 'react';
import styles from './DispositionCatalogMenu.module.css';
import { useDispositionBuilderStore } from '../../dispositionStore';
import { Select, Divider, Stack, Text, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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

	// Track collapsed state for parent nodes (collapsed by default)
	const [collapsedNodes, setCollapsedNodes] = useState<Set<number>>(new Set());

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

	// Collect all parent node IDs from available nodes
	const parentNodeIds = useMemo(() => {
		const ids = new Set<number>();
		availableNodes.forEach((item) => {
			if (item.node.children && item.node.children.length > 0) {
				ids.add(item.node.id);
			}
		});
		return ids;
	}, [availableNodes]);

	// Initialize all parent nodes as collapsed when catalog changes
	useEffect(() => {
		setCollapsedNodes(new Set(parentNodeIds));
	}, [selectedCatalog?.id]);

	// Toggle collapse state for a node
	const toggleCollapse = useCallback((nodeId: number) => {
		setCollapsedNodes((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(nodeId)) {
				newSet.delete(nodeId);
			} else {
				newSet.add(nodeId);
			}
			return newSet;
		});
	}, []);

	// Filter visible nodes based on collapsed state
	const visibleNodes = useMemo(() => {
		// Build a map of node id to parent id from available nodes
		const nodeParentMap = new Map<number, number | null>();
		availableNodes.forEach((item) => {
			nodeParentMap.set(item.node.id, item.node.parentId ?? null);
		});

		// Check if any ancestor is collapsed
		const hasCollapsedAncestor = (nodeId: number): boolean => {
			const parentId = nodeParentMap.get(nodeId);
			if (!parentId) return false;
			if (collapsedNodes.has(parentId)) return true;
			return hasCollapsedAncestor(parentId);
		};

		return availableNodes.filter((item) => {
			// Always show root level nodes (level 0) and nodes without collapsed ancestors
			return !hasCollapsedAncestor(item.node.id);
		});
	}, [availableNodes, collapsedNodes]);

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

	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const hasNodesInFlow = (flowJson?.dispositionNodes?.length ?? 0) > 0;

	return (
		<div className={styles.container}>
			<Select
				label={t('disposition.catalog.selectCatalog')}
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
						? t('disposition.catalog.catalogChangeDisabled')
						: undefined
				}
				size='xs'
			/>
			<Divider my='xs' />
			<Box className={styles.menuListWrapper}>
				{visibleNodes.length === 0 ? (
					<Text c='dimmed' ta='center' size='xs'>
						{t('disposition.catalog.noDispositions')}
					</Text>
				) : (
					<Stack gap={4}>
						{visibleNodes.map((item, idx) => {
							const hasChildren =
								item.node.children && item.node.children.length > 0;
							const isCollapsed = collapsedNodes.has(item.node.id);

							return (
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
										isCollapsible={hasChildren}
										isCollapsed={isCollapsed}
										onToggleCollapse={() => toggleCollapse(item.node.id)}
									/>
								</div>
							);
						})}
					</Stack>
				)}
			</Box>
		</div>
	);
};

export default DispositionCatalogMenu;
