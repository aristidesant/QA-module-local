import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionIcon, Badge, Box, Group, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import {
	IconChevronDown,
	IconChevronRight,
	IconClock,
	IconHierarchy3,
	IconPhonePause,
	IconPhoneOff,
	IconPhoneX,
	IconTrash,
} from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import { findNodeById } from '~/utils/dragDropUtils';
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
	catalogNodes?: DispositionNode[] | undefined;
	collapseAllKey?: number;
	expandAllKey?: number;
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
	catalogNodes,
	collapseAllKey,
	expandAllKey,
}) => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const [collapsed, setCollapsed] = useState(false);
	const { flowJson } = useDispositionBuilderStore();

	useEffect(() => {
		if (collapseAllKey) setCollapsed(true);
	}, [collapseAllKey]);

	useEffect(() => {
		if (expandAllKey) setCollapsed(false);
	}, [expandAllKey]);

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
	const isDoNotCall = Boolean(node.doNotCall ?? node.do_not_call);
	const isAbandoned = Boolean(node.isAbandoned);

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
			if (hasChildren) {
				modals.openConfirmModal({
					title: t('disposition.nodeEditor.confirmDeleteTitle'),
					children: (
						<Text size='sm'>
							{t('disposition.nodeEditor.confirmDeleteMessage', {
								count: existingChildren.length,
							})}
						</Text>
					),
					labels: {
						confirm: t('actions.delete', { ns: 'common' }),
						cancel: t('actions.cancel', { ns: 'common' }),
					},
					confirmProps: { color: 'red' },
					onConfirm: () => removeNode(node.id),
				});
			} else {
				removeNode(node.id);
			}
		},
		[node.id, removeNode, hasChildren, existingChildren.length, t]
	);

	const handlePopulateChildren = useCallback(
		(event: React.MouseEvent) => {
			if (!onPopulateChildren) return;
			event.stopPropagation();
			onPopulateChildren(node.id);
		},
		[node.id, onPopulateChildren]
	);

	const handleAddMissingSiblings = useCallback(
		(event: React.MouseEvent) => {
			if (!onAddMissingSiblings) return;
			event.stopPropagation();
			onAddMissingSiblings(node.id);
		},
		[node.id, onAddMissingSiblings]
	);

	return (
		<>
			<Box
				className={`${styles.nodeRow} ${styles[nodeStyle]} ${
					isSelected ? styles.selected : ''
				} ${onNodeSelect ? styles.clickable : ''}`}
				data-tone={nodeStyle}
				data-selected={isSelected ? 'true' : 'false'}
				data-has-children={showGroupActions ? 'true' : 'false'}
				data-collapsed={collapsed ? 'true' : 'false'}
				style={{ marginLeft: level === 0 ? 0 : level * 12 }}
				onClick={onNodeSelect ? handleSelect : undefined}
			>
				<Group gap={4} wrap='nowrap' className={styles.rowContent}>
					{showGroupActions ? (
						<ActionIcon
							size='xs'
							variant='subtle'
							onClick={handleToggleCollapse}
							aria-label={
								collapsed
									? t('disposition.nodeEditor.expand')
									: t('disposition.nodeEditor.collapse')
							}
						>
							{collapsed ? (
								<IconChevronRight size={12} />
							) : (
								<IconChevronDown size={12} />
							)}
						</ActionIcon>
					) : (
						<span className={styles.togglePlaceholder} />
					)}

					<span
						className={`${styles.statusDot} ${styles[`${nodeStyle}Dot`]}`}
					/>

					<Box className={styles.nodeDetails}>
						<Group justify='space-between' gap={4} wrap='nowrap'>
							<Group
								gap={4}
								wrap='nowrap'
								// inline-style-allow: flex layout values needed on Mantine Group to prevent text overflow in constrained row
								style={{ minWidth: 0, flex: 1 }}
							>
								<Text
									className={styles.nodeTitle}
									fw={level === 0 ? 600 : 500}
									size={level === 0 ? 'sm' : 'xs'}
									lineClamp={1}
								>
									{node.name}
								</Text>
								{hasChildren && (
									<Badge
										size='xs'
										variant='light'
										color='gray'
										// inline-style-allow: prevents Badge from shrinking in a tight flex row; no Mantine prop equivalent
										style={{ flexShrink: 0 }}
									>
										{existingChildren.length}
									</Badge>
								)}
							</Group>
							<Group gap={2} className={styles.icons} wrap='nowrap'>
								{isDoNotCall ? (
									<Tooltip
										label={t('disposition.nodeEditor.doNotCall')}
										withArrow
									>
										<IconPhoneX
											size={12}
											color='var(--mantine-color-red-6)'
											aria-label={t('disposition.nodeEditor.doNotCall')}
										/>
									</Tooltip>
								) : null}
								{isAbandoned ? (
									<Tooltip
										label={t('disposition.nodeEditor.abandoned')}
										withArrow
									>
										<IconPhonePause
											size={12}
											color='var(--mantine-color-orange-6)'
											aria-label={t('disposition.nodeEditor.abandoned')}
										/>
									</Tooltip>
								) : null}
								{node.isInvalidatesNumber ? (
									<Tooltip
										label={t('disposition.nodeEditor.invalidatesNumber')}
										withArrow
									>
										<IconPhoneOff
											size={12}
											color='var(--mantine-color-red-6)'
											aria-label={t('disposition.nodeEditor.invalidatesNumber')}
										/>
									</Tooltip>
								) : null}
								{node.requiresReschedule ? (
									<Tooltip
										label={t('disposition.nodeEditor.requiresReschedule')}
										withArrow
									>
										<IconClock
											size={12}
											color='var(--mantine-color-orange-5)'
											aria-label={t(
												'disposition.nodeEditor.requiresReschedule'
											)}
										/>
									</Tooltip>
								) : null}
							</Group>
						</Group>
					</Box>

					<Group gap={2} wrap='nowrap' className={styles.actions}>
						{missingSiblingsCount > 0 && onAddMissingSiblings ? (
							<Tooltip
								withArrow
								label={t('disposition.nodeEditor.addSiblings', {
									count: missingSiblingsCount,
								})}
							>
								<Box
									pos='relative'
									// inline-style-allow: inline-flex needed on Box to size it to the ActionIcon for absolute badge positioning
									style={{ display: 'inline-flex' }}
								>
									<ActionIcon
										size='xs'
										variant='subtle'
										color='green'
										onClick={handleAddMissingSiblings}
										aria-label={t(
											'disposition.nodeEditor.addMissingSiblingsAria'
										)}
									>
										<IconHierarchy3 size={12} />
									</ActionIcon>
									<Badge
										size='xs'
										variant='filled'
										color='green'
										// inline-style-allow: absolute badge overlay with pixel offsets; no Mantine prop covers this positioning pattern
										style={{
											position: 'absolute',
											top: -5,
											right: -5,
											minWidth: 14,
											padding: '0 2px',
											fontSize: 9,
											lineHeight: '14px',
											pointerEvents: 'none',
										}}
									>
										{missingSiblingsCount}
									</Badge>
								</Box>
							</Tooltip>
						) : null}

						{missingChildrenCount > 0 && onPopulateChildren ? (
							<Tooltip
								withArrow
								label={t('disposition.nodeEditor.addChildren', {
									count: missingChildrenCount,
								})}
							>
								<Box
									pos='relative'
									// inline-style-allow: inline-flex needed on Box to size it to the ActionIcon for absolute badge positioning
									style={{ display: 'inline-flex' }}
								>
									<ActionIcon
										size='xs'
										variant='subtle'
										color='blue'
										onClick={handlePopulateChildren}
										aria-label={t(
											'disposition.nodeEditor.addMissingChildrenAria'
										)}
									>
										<IconHierarchy3 size={12} />
									</ActionIcon>
									<Badge
										size='xs'
										variant='filled'
										color='blue'
										// inline-style-allow: absolute badge overlay with pixel offsets; no Mantine prop covers this positioning pattern
										style={{
											position: 'absolute',
											top: -5,
											right: -5,
											minWidth: 14,
											padding: '0 2px',
											fontSize: 9,
											lineHeight: '14px',
											pointerEvents: 'none',
										}}
									>
										{missingChildrenCount}
									</Badge>
								</Box>
							</Tooltip>
						) : null}

						<Tooltip withArrow label={t('disposition.nodeEditor.remove')}>
							<ActionIcon
								size='xs'
								variant='subtle'
								color='red'
								onClick={handleRemove}
								aria-label={t('disposition.nodeEditor.removeAria')}
							>
								<IconTrash size={12} />
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
							catalogNodes={catalogNodes}
							collapseAllKey={collapseAllKey}
							expandAllKey={expandAllKey}
						/>
					))
				: null}
		</>
	);
};

export default NodeEditor;
