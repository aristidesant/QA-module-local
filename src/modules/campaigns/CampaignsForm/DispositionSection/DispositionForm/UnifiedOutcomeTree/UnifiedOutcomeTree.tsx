import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Group,
	ScrollArea,
	Select,
	Stack,
	Switch,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconClock,
	IconFileDescription,
	IconFolder,
	IconLayoutList,
	IconLayoutRows,
	IconPhonePause,
	IconPhoneOff,
	IconPhoneX,
	IconSearch,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionBuilderStore } from '../../dispositionStore';
import { useDispositionCatalogs } from '~/queries/dispositionCatalogQueries';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { findNodeById, getDirectHierarchyTree } from '~/utils/dragDropUtils';
import { handleAddGroupWithChildren } from '../DispositionCatalogMenu/dispositionCatalogHelper';
import { getNodeStyle, isLeafNode } from '~/utils/dispositionNodeStyles';
import styles from './UnifiedOutcomeTree.module.css';

function shouldRenderNode(node: DispositionNode, query: string): boolean {
	if (!query.trim()) return true;
	const q = query.toLowerCase().trim();
	if (node.name.toLowerCase().includes(q)) return true;
	return node.children?.some((child) => shouldRenderNode(child, q)) ?? false;
}

interface TreeNodeProps {
	node: DispositionNode;
	level: number;
	branchTone: string;
	searchQuery: string;
	expandAll: boolean;
	collapseAll: boolean;
	flowNodes: DispositionNode[];
	catalogNodes: DispositionNode[];
	selectedNodeId?: number;
	parentNode?: DispositionNode;
	onToggle: (
		node: DispositionNode,
		checked: boolean,
		parent?: DispositionNode
	) => void;
	onSelect: (node: DispositionNode, parent?: DispositionNode) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
	node,
	level,
	branchTone,
	searchQuery,
	expandAll,
	collapseAll,
	flowNodes,
	catalogNodes,
	selectedNodeId,
	parentNode,
	onToggle,
	onSelect,
}) => {
	const isLeaf = isLeafNode(node);
	const hasChildren = !isLeaf;
	const tone = level === 0 ? getNodeStyle(node, 0) : branchTone;
	const [isExpanded, setIsExpanded] = useState(true);

	useEffect(() => {
		if (collapseAll) setIsExpanded(false);
	}, [collapseAll]);

	useEffect(() => {
		if (expandAll) setIsExpanded(true);
	}, [expandAll]);

	// Auto-expand when searching
	const effectivelyExpanded = searchQuery.trim() ? true : isExpanded;

	const isIncluded = Boolean(findNodeById(flowNodes, node.id));
	const flowNode = findNodeById(flowNodes, node.id);
	const isSelected = selectedNodeId === node.id;

	const isDoNotCall = flowNode
		? Boolean(flowNode.doNotCall ?? flowNode.do_not_call)
		: false;
	const isAbandoned = flowNode ? Boolean(flowNode.isAbandoned) : false;
	const isInvalidates = flowNode
		? Boolean(flowNode.isInvalidatesNumber)
		: false;
	const isReschedule = flowNode ? Boolean(flowNode.requiresReschedule) : false;
	const hasAnyFlag =
		isDoNotCall || isAbandoned || isInvalidates || isReschedule;

	const { t } = useTranslation(['campaign.form.outcomes', 'common']);

	const activeChildren = useMemo(
		() => (node.children ?? []).filter((c) => c.isActive !== false),
		[node.children]
	);
	const visibleChildren = useMemo(
		() => activeChildren.filter((c) => shouldRenderNode(c, searchQuery)),
		[activeChildren, searchQuery]
	);

	if (!shouldRenderNode(node, searchQuery)) return null;

	return (
		<div className={styles.nodeShell}>
			<div
				className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
				data-tone={tone}
				data-clickable='true'
				onClick={() => onSelect(node, parentNode)}
			>
				<Switch
					checked={isIncluded}
					size='xs'
					color='green'
					className={styles.toggle}
					onClick={(e) => e.stopPropagation()}
					onChange={(e) => {
						e.stopPropagation();
						onToggle(node, e.currentTarget.checked, parentNode);
					}}
					aria-label={isIncluded ? 'Remove from flow' : 'Add to flow'}
				/>

				<div className={styles.rowToggle}>
					{hasChildren ? (
						<ActionIcon
							size='xs'
							variant='subtle'
							className={styles.chevron}
							onClick={(e) => {
								e.stopPropagation();
								setIsExpanded((v) => !v);
							}}
							aria-label={
								effectivelyExpanded
									? t('disposition.nodeEditor.collapse')
									: t('disposition.nodeEditor.expand')
							}
						>
							{effectivelyExpanded ? (
								<IconChevronDown size={13} />
							) : (
								<IconChevronRight size={13} />
							)}
						</ActionIcon>
					) : (
						<span className={styles.chevronSpacer} />
					)}
				</div>

				<span className={styles.icon} data-tone={tone} aria-hidden='true'>
					{isLeaf ? (
						<IconFileDescription size={13} stroke={1.9} />
					) : (
						<IconFolder size={13} stroke={1.9} />
					)}
				</span>

				<Text
					className={styles.name}
					size='xs'
					fw={level === 0 ? 600 : 500}
					data-included={isIncluded ? 'true' : 'false'}
				>
					{node.name}
				</Text>

				<div className={styles.rowAside}>
					{isIncluded && hasAnyFlag && (
						<div className={styles.flags}>
							{isDoNotCall && (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.doNotCall')}
								>
									<IconPhoneX size={13} color='var(--mantine-color-red-6)' />
								</Tooltip>
							)}
							{isAbandoned && (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.abandoned')}
								>
									<IconPhonePause
										size={13}
										color='var(--mantine-color-orange-6)'
									/>
								</Tooltip>
							)}
							{isInvalidates && (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.invalidatesNumber')}
								>
									<IconPhoneOff size={13} color='var(--mantine-color-red-6)' />
								</Tooltip>
							)}
							{isReschedule && (
								<Tooltip
									withArrow
									label={t('disposition.nodeEditor.requiresReschedule')}
								>
									<IconClock size={13} color='var(--mantine-color-orange-6)' />
								</Tooltip>
							)}
						</div>
					)}

					<div className={styles.hoverMeta}>
						{hasChildren && (
							<Badge size='xs' variant='light' color='gray' radius='sm'>
								{activeChildren.length}
							</Badge>
						)}
					</div>
				</div>
			</div>

			{effectivelyExpanded && visibleChildren.length > 0 && (
				<div className={styles.nodeChildren} data-tone={tone}>
					{visibleChildren.map((child) => (
						<TreeNode
							key={child.id}
							node={child}
							level={level + 1}
							branchTone={tone}
							searchQuery={searchQuery}
							expandAll={expandAll}
							collapseAll={collapseAll}
							flowNodes={flowNodes}
							catalogNodes={catalogNodes}
							selectedNodeId={selectedNodeId}
							parentNode={node}
							onToggle={onToggle}
							onSelect={onSelect}
						/>
					))}
				</div>
			)}
		</div>
	);
};

interface UnifiedOutcomeTreeProps {
	onNodeSelect: (
		node: DispositionNode | null,
		parent?: DispositionNode
	) => void;
	selectedNodeId?: number;
}

const UnifiedOutcomeTree: React.FC<UnifiedOutcomeTreeProps> = ({
	onNodeSelect,
	selectedNodeId,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes', 'common']);
	const {
		flowJson,
		addNode,
		addNodeToParent,
		removeNode,
		isParentInFlow,
		selectedCatalog,
		setSelectedCatalog,
	} = useDispositionBuilderStore();

	const wizardCampaignType = useCampaignWizardStore((s) => s.campaignType);
	const campaignType = wizardCampaignType ?? 'OUTBOUND';
	const catalogType = campaignType === 'HYBRID' ? 'OUTBOUND' : campaignType;

	const { data: catalogs = [] } = useDispositionCatalogs({ type: catalogType });
	const activeCatalogs = useMemo(
		() => catalogs.filter((c) => c.isActive),
		[catalogs]
	);

	useEffect(() => {
		if (activeCatalogs.length > 0) {
			if (
				!selectedCatalog ||
				!activeCatalogs.some((c) => c.id === selectedCatalog.id)
			) {
				setSelectedCatalog(activeCatalogs[0]);
			}
		}
	}, [activeCatalogs]);

	const [searchQuery, setSearchQuery] = useState('');
	const [collapseKey, setCollapseKey] = useState(0);
	const [expandKey, setExpandKey] = useState(0);

	const catalogNodes: DispositionNode[] =
		selectedCatalog?.dispositionNodes ?? [];
	const flowNodes: DispositionNode[] = flowJson?.dispositionNodes ?? [];

	const includedCount = useMemo(() => {
		let count = 0;
		const walk = (nodes: DispositionNode[]) => {
			nodes.forEach((n) => {
				if (findNodeById(flowNodes, n.id)) count++;
				if (n.children) walk(n.children);
			});
		};
		walk(catalogNodes);
		return count;
	}, [catalogNodes, flowNodes]);

	const handleToggle = useCallback(
		(
			node: DispositionNode,
			checked: boolean,
			_parentNode?: DispositionNode
		) => {
			if (checked) {
				const currentNode = findNodeById(catalogNodes, node.id);
				if (!currentNode) return;
				const hasChildren =
					currentNode.children && currentNode.children.length > 0;
				if (hasChildren) {
					handleAddGroupWithChildren(
						currentNode,
						catalogNodes,
						flowNodes,
						addNode,
						addNodeToParent
					);
				} else {
					const parentCatalog = currentNode.parentId
						? findNodeById(catalogNodes, currentNode.parentId)
						: null;
					const parentInFlow = parentCatalog && isParentInFlow(parentCatalog);
					if (parentInFlow && parentCatalog) {
						addNodeToParent(currentNode);
					} else {
						const hierarchyNode = getDirectHierarchyTree(
							catalogNodes,
							currentNode.id
						);
						if (hierarchyNode) {
							const existingIds = new Set(flowNodes.map((n) => n.id));
							if (!existingIds.has(hierarchyNode.id)) addNode(hierarchyNode);
						}
					}
				}
			} else {
				removeNode(node.id);
				// Deselect if the removed node was selected
				onNodeSelect(null);
			}
		},
		[
			catalogNodes,
			flowNodes,
			addNode,
			addNodeToParent,
			removeNode,
			isParentInFlow,
			onNodeSelect,
		]
	);

	const rootNodes = useMemo(
		() => catalogNodes.filter((n) => n.isActive !== false),
		[catalogNodes]
	);

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				<Select
					data={activeCatalogs.map((c) => ({
						value: String(c.id),
						label: c.name,
					}))}
					value={selectedCatalog ? String(selectedCatalog.id) : null}
					onChange={(id) => {
						const catalog =
							activeCatalogs.find((c) => String(c.id) === id) ?? null;
						setSelectedCatalog(catalog);
					}}
					size='xs'
					className={styles.catalogSelect}
				/>
				<Group gap={4} wrap='nowrap'>
					{includedCount > 0 && (
						<Badge size='xs' variant='light' color='green'>
							{includedCount}
						</Badge>
					)}
					<Tooltip label={t('disposition.builder.collapseAll')} withArrow>
						<ActionIcon
							size='xs'
							variant='subtle'
							onClick={() => setCollapseKey((k) => k + 1)}
						>
							<IconLayoutList size={13} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('disposition.builder.expandAll')} withArrow>
						<ActionIcon
							size='xs'
							variant='subtle'
							onClick={() => setExpandKey((k) => k + 1)}
						>
							<IconLayoutRows size={13} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</div>

			<TextInput
				size='xs'
				leftSection={<IconSearch size={13} />}
				placeholder='Search outcomes...'
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.currentTarget.value)}
				className={styles.searchInput}
			/>

			<ScrollArea className={styles.scrollArea} type='hover' scrollbarSize={5}>
				{rootNodes.length === 0 ? (
					<Stack align='center' gap='xs' py='xl'>
						<Text size='xs' c='dimmed'>
							{t('disposition.catalog.noDispositions')}
						</Text>
					</Stack>
				) : (
					<div className={styles.tree}>
						{rootNodes.map((node) => (
							<TreeNode
								key={node.id}
								node={node}
								level={0}
								branchTone={getNodeStyle(node, 0)}
								searchQuery={searchQuery}
								expandAll={expandKey > 0}
								collapseAll={collapseKey > 0}
								flowNodes={flowNodes}
								catalogNodes={catalogNodes}
								selectedNodeId={selectedNodeId}
								onToggle={handleToggle}
								onSelect={onNodeSelect}
							/>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	);
};

export default UnifiedOutcomeTree;
