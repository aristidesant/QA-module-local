import { useMemo, useEffect } from 'react';
import styles from './DispositionCatalogMenu.module.css';
import { useDispositionBuilderStore } from '../../dispositionStore';
import { Select, Divider } from '@mantine/core';
import { Droppable } from '@hello-pangea/dnd';
import { useDispositionCatalogs } from '~/queries/dispositionCatalogQueries';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import DispositionCatalogMenuItem from './DispositionCatalogMenuItem';
import { useCampaignsStore } from '~/stores/campaignsStore';

interface AvailableNode {
	node: DispositionNode;
	disabled: boolean;
	level: number;
}

const DispositionCatalogMenu: React.FC = () => {
	const { getMovedNodeIds, selectedCatalog, setSelectedCatalog } =
		useDispositionBuilderStore();
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
		return node.children.reduce<number[]>(
			(acc, child) => [...acc, child.id, ...getAllChildIds(child)],
			[]
		);
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

		// Enhanced logic: covers all edge cases for parent/child visibility and enabled state
		const addNodeWithChildren = (node: DispositionNode, level: number = 0) => {
			const hasChildren = node.children && node.children.length > 0;
			const isMoved = movedIds.has(node.id);

			// Filter children to only include active ones
			const activeChildren = hasChildren
				? node.children!.filter((child) => child.isActive)
				: [];

			const childIds = activeChildren.length > 0 ? getAllChildIds(node) : [];
			const allChildrenAndDescendantsMoved =
				childIds.length > 0 && childIds.every((id) => movedIds.has(id));

			// Case 1: Hide parent only if it and all descendants are moved
			if (isMoved && allChildrenAndDescendantsMoved) {
				return;
			}

			// Case 2: Parent node logic
			if (activeChildren.length > 0) {
				// Parent is disabled if moved or if not all children are moved
				result.push({
					node,
					disabled: isMoved || !allChildrenAndDescendantsMoved,
					level,
				});
				// Always process children, regardless of parent state
				activeChildren.forEach((child) => {
					addNodeWithChildren(child, level + 1);
				});
			} else {
				// Case 3: Leaf node logic
				// Leaf is hidden if moved, else enabled
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

	return (
		<>
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
				disabled={isLoading || activeCatalogs.length === 0}
				mb='md'
			/>
			<Divider />
			<div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
				<Droppable
					droppableId='catalog-menu'
					isDropDisabled={true}
					type='DISPOSITION_NODE'
				>
					{(provided) => (
						<div className={styles.menuListWrapper}>
							<ul ref={provided.innerRef} {...provided.droppableProps}>
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
											path={`${idx}`}
											movedNodeIds={movedNodeIds}
											disabled={item.disabled}
										/>
									</div>
								))}
								{provided.placeholder}
							</ul>
						</div>
					)}
				</Droppable>
			</div>
		</>
	);
};

export default DispositionCatalogMenu;
