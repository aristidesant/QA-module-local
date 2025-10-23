import React, { useCallback, useMemo, useState } from 'react';
import { ActionIcon, Box, Group, Text, Tooltip } from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconClock,
	IconEye,
	IconHierarchy3,
	IconPhoneX,
	IconTrash,
} from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import { cloneNodeWithChildren, findNodeById } from '~/utils/dragDropUtils';
import { useDispositionBuilderStore } from '../../../dispositionStore';
import styles from './NodeEditor.module.css';

interface NodeEditorProps {
	node: DispositionNode;
	parentNode?: DispositionNode;
	removeNode: (id: number) => void;
	level?: number;
	onNodeSelect?: (
		node: DispositionNode,
		parentNode: DispositionNode | undefined
	) => void;
	selectedNodeId?: number;
	onPopulateChildren?: (nodeId: number) => void;
	onAddMissingSiblings?: (nodeId: number) => void;
	onPreviewGroup?: (node: DispositionNode) => void;
	catalogNodes?: DispositionNode[] | undefined;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
	node,
	parentNode,
	removeNode,
	level = 0,
	onNodeSelect,
	selectedNodeId,
	onPopulateChildren,
	onAddMissingSiblings,
	onPreviewGroup,
	catalogNodes,
}) => {
	const [collapsed, setCollapsed] = useState(false);
	const { flowJson } = useDispositionBuilderStore();

	const catalogNode = useMemo(() => {
		if (!catalogNodes || catalogNodes.length === 0) return null;
		return findNodeById(catalogNodes, node.id);
	}, [catalogNodes, node.id]);

	const catalogChildren = useMemo(
		() => (catalogNode?.children || []).filter((child) => child.isActive),
		[catalogNode]
	);

	const existingChildren = node.children || [];

	const missingChildrenCount = useMemo(() => {
		if (!catalogChildren.length) return 0;
		const existingIds = new Set(existingChildren.map((child) => child.id));
		return catalogChildren.filter((child) => !existingIds.has(child.id)).length;
	}, [catalogChildren, existingChildren]);

	const missingSiblingsCount = useMemo(() => {
		if (!catalogNodes || !catalogNode?.parentId) return 0;
		const parentCatalogNode = findNodeById(catalogNodes, catalogNode.parentId);
		if (!parentCatalogNode) return 0;

		const activeSiblings = (parentCatalogNode.children || []).filter(
			(child) => child.isActive
		);

		const flowNodes = flowJson?.dispositionNodes || [];
		const parentInFlow = findNodeById(flowNodes, catalogNode.parentId);

		// If parent is not in flow, we can't add siblings to it
		if (!parentInFlow) return 0;

		const existingSiblingIds = new Set(
			(parentInFlow.children || []).map((child) => child.id)
		);
		return activeSiblings.filter(
			(sibling) => !existingSiblingIds.has(sibling.id)
		).length;
	}, [
		catalogNodes,
		catalogNode?.parentId,
		flowJson?.dispositionNodes,
		node.id,
	]);

	const hasChildren = existingChildren.length > 0;
	const hasCatalogChildren = catalogChildren.length > 0;
	const showGroupActions = hasChildren || hasCatalogChildren;
	const nodeStyle = getNodeStyle(node, level);
	const isSelected = selectedNodeId === node.id;

	const handleToggleCollapse = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
		setCollapsed((prev) => !prev);
	}, []);

	const handleSelect = useCallback(
		(event: React.MouseEvent) => {
			if (!onNodeSelect) return;
			event.stopPropagation();
			onNodeSelect(node, parentNode);
		},
		[node, onNodeSelect, parentNode]
	);

	const handleRemove = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			removeNode(node.id);
		},
		[node.id, removeNode]
	);

	const handlePopulateChildren = useCallback(
		(event: React.MouseEvent) => {
			if (!onPopulateChildren) return;
			event.stopPropagation();
			onPopulateChildren(node.id);
		},
		[node.id, onPopulateChildren]
	);

	const handlePreview = useCallback(
		(event: React.MouseEvent) => {
			if (!onPreviewGroup) return;
			event.stopPropagation();
			onPreviewGroup(cloneNodeWithChildren(node));
		},
		[node, onPreviewGroup]
	);

	const handleAddMissingSiblings = useCallback(
		(event: React.MouseEvent) => {
			if (!onAddMissingSiblings) return;
			event.stopPropagation();
			onAddMissingSiblings(node.id);
		},
		[node.id, onAddMissingSiblings]
	);

	const statusBadges = useMemo(() => {
		return [];
	}, []);

	return (
		<>
			<Box
				className={`${styles.nodeRow} ${styles[nodeStyle]} ${
					isSelected ? styles.selected : ''
				} ${onNodeSelect ? styles.clickable : ''}`}
				style={{ marginLeft: level === 0 ? 0 : level * 16 }}
				onClick={onNodeSelect ? handleSelect : undefined}
			>
				<Group gap='xs' wrap='nowrap' className={styles.rowContent}>
					{showGroupActions ? (
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={handleToggleCollapse}
							aria-label={collapsed ? 'Expand node' : 'Collapse node'}
						>
							{collapsed ? (
								<IconChevronRight size={16} />
							) : (
								<IconChevronDown size={16} />
							)}
						</ActionIcon>
					) : (
						<span className={styles.togglePlaceholder} />
					)}

					<span
						className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`}
					/>

					<Box className={styles.nodeDetails}>
						<Group justify='space-between' gap='xs' wrap='nowrap'>
							<Text
								className={styles.nodeTitle}
								fw={level === 0 ? 600 : 500}
								size={level === 0 ? 'sm' : 'xs'}
								lineClamp={1}
							>
								{node.name}
							</Text>
							<Group gap={4} className={styles.icons} wrap='nowrap'>
								{node.isInvalidatesNumber ? (
									<Tooltip label='No more call' withArrow>
										<IconPhoneX size={14} color='var(--mantine-color-red-6)' />
									</Tooltip>
								) : null}
								{node.requiresReschedule ? (
									<Tooltip label='Requires reschedule' withArrow>
										<IconClock
											size={14}
											color='var(--mantine-color-orange-5)'
										/>
									</Tooltip>
								) : null}
							</Group>
						</Group>

						{statusBadges.length > 0 ? (
							<Group gap={4} mt={4} className={styles.badges} wrap='wrap'>
								{statusBadges}
							</Group>
						) : null}
					</Box>

					<Group gap={4} wrap='nowrap' className={styles.actions}>
						{missingSiblingsCount > 0 && onAddMissingSiblings ? (
							<Tooltip
								withArrow
								label={`Add ${missingSiblingsCount} missing sibling${
									missingSiblingsCount > 1 ? 's' : ''
								}`}
							>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='violet'
									onClick={handleAddMissingSiblings}
									aria-label='Add missing siblings'
								>
									<IconHierarchy3 size={14} />
								</ActionIcon>
							</Tooltip>
						) : null}

						{missingChildrenCount > 0 && onPopulateChildren ? (
							<Tooltip
								withArrow
								label={`Add ${missingChildrenCount} missing child${
									missingChildrenCount > 1 ? 'ren' : ''
								}`}
							>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='teal'
									onClick={handlePopulateChildren}
									aria-label='Add missing children'
								>
									<IconHierarchy3 size={14} />
								</ActionIcon>
							</Tooltip>
						) : null}

						{showGroupActions && onPreviewGroup ? (
							<Tooltip withArrow label='Preview group'>
								<ActionIcon
									size='sm'
									variant='subtle'
									color='blue'
									onClick={handlePreview}
									aria-label='Preview disposition group'
								>
									<IconEye size={14} />
								</ActionIcon>
							</Tooltip>
						) : null}

						<Tooltip withArrow label='Remove'>
							<ActionIcon
								size='sm'
								variant='subtle'
								color='red'
								onClick={handleRemove}
								aria-label='Remove node'
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
			</Box>

			{!collapsed && hasChildren
				? existingChildren.map((child) => (
						<NodeEditor
							key={child.id}
							node={child}
							parentNode={node}
							removeNode={removeNode}
							level={level + 1}
							onNodeSelect={onNodeSelect}
							selectedNodeId={selectedNodeId}
							onPopulateChildren={onPopulateChildren}
							onAddMissingSiblings={onAddMissingSiblings}
							onPreviewGroup={onPreviewGroup}
							catalogNodes={catalogNodes}
						/>
					))
				: null}
		</>
	);
};

export default NodeEditor;
