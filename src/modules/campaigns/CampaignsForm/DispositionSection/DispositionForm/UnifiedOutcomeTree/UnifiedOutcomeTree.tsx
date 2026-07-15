import React, { useEffect, useMemo, useState } from 'react';
import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Checkbox,
	Group,
	ScrollArea,
	Select,
	Skeleton,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertCircle,
	IconChevronDown,
	IconChevronRight,
	IconEraser,
	IconExternalLink,
	IconFileDescription,
	IconFolder,
	IconFolderOff,
	IconLayoutList,
	IconLayoutRows,
	IconSearch,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionBuilderStore } from '../../dispositionStore';
import { useDispositionCatalogs } from '~/queries/dispositionCatalogQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { findNodeById } from '~/utils/dragDropUtils';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';
import OutcomeNodeFlags from '../../OutcomeNodeFlags';
import {
	getActiveChildren,
	getActiveLeafIds,
	getAllActiveLeafIds,
	getSelectedLeafIds,
	getTreeSelectionState,
} from '../../dispositionSelection';
import styles from './UnifiedOutcomeTree.module.css';

const EMPTY_CATALOG_NODES: DispositionNode[] = [];

function shouldRenderNode(node: DispositionNode, query: string): boolean {
	if (!query.trim()) return true;
	const normalizedQuery = query.toLocaleLowerCase().trim();
	if (node.name.toLocaleLowerCase().includes(normalizedQuery)) return true;
	return getActiveChildren(node).some((child) =>
		shouldRenderNode(child, normalizedQuery)
	);
}

interface TreeNodeProps {
	node: DispositionNode;
	level: number;
	branchTone: string;
	searchQuery: string;
	expandSignal: number;
	collapseSignal: number;
	flowNodes: DispositionNode[];
	selectedLeafIds: Set<number>;
	selectedNodeId?: number;
	parentNode?: DispositionNode;
	onToggle: (node: DispositionNode, checked: boolean) => void;
	onSelect: (node: DispositionNode, parent?: DispositionNode) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
	node,
	level,
	branchTone,
	searchQuery,
	expandSignal,
	collapseSignal,
	flowNodes,
	selectedLeafIds,
	selectedNodeId,
	parentNode,
	onToggle,
	onSelect,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const activeChildren = useMemo(() => getActiveChildren(node), [node]);
	const isLeaf = activeChildren.length === 0;
	const hasChildren = activeChildren.length > 0;
	const tone = level === 0 ? getNodeStyle(node, 0) : branchTone;
	const [isExpanded, setIsExpanded] = useState(true);

	useEffect(() => {
		if (collapseSignal > 0) setIsExpanded(false);
	}, [collapseSignal]);

	useEffect(() => {
		if (expandSignal > 0) setIsExpanded(true);
	}, [expandSignal]);

	const effectivelyExpanded = searchQuery.trim() ? true : isExpanded;
	const selectionState = getTreeSelectionState(node, selectedLeafIds);
	const isIncluded = selectionState !== 'unchecked';
	const flowNode = findNodeById(flowNodes, node.id);
	const isSelected = selectedNodeId === node.id;
	const visibleChildren = useMemo(
		() =>
			activeChildren.filter((child) => shouldRenderNode(child, searchQuery)),
		[activeChildren, searchQuery]
	);
	const leafIds = useMemo(() => getActiveLeafIds(node), [node]);
	const selectedDescendantCount = leafIds.filter((id) =>
		selectedLeafIds.has(id)
	).length;

	if (!shouldRenderNode(node, searchQuery)) return null;

	const toggleSelection = () => {
		onToggle(node, selectionState !== 'checked');
	};

	return (
		<div className={styles.nodeShell} role='none'>
			<div
				className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
				data-tone={tone}
				data-included={isIncluded ? 'true' : 'false'}
				role='treeitem'
				aria-level={level + 1}
				aria-selected={isSelected}
				aria-checked={
					selectionState === 'indeterminate'
						? 'mixed'
						: selectionState === 'checked'
				}
				aria-expanded={hasChildren ? effectivelyExpanded : undefined}
				tabIndex={0}
				onClick={() => onSelect(node, parentNode)}
				onKeyDown={(event) => {
					if (event.target !== event.currentTarget) return;
					if (event.key === 'Enter') onSelect(node, parentNode);
					if (event.key === ' ') {
						event.preventDefault();
						toggleSelection();
					}
					if (event.key === 'ArrowRight' && hasChildren) {
						event.preventDefault();
						setIsExpanded(true);
					}
					if (event.key === 'ArrowLeft' && hasChildren) {
						event.preventDefault();
						setIsExpanded(false);
					}
				}}
			>
				<Checkbox
					checked={selectionState === 'checked'}
					indeterminate={selectionState === 'indeterminate'}
					size='sm'
					color='green'
					className={styles.checkbox}
					onClick={(event) => event.stopPropagation()}
					onChange={toggleSelection}
					aria-label={t(
						selectionState === 'checked'
							? 'disposition.tree.removeNodeAria'
							: 'disposition.tree.addNodeAria',
						{ name: node.name }
					)}
				/>

				<div className={styles.rowToggle}>
					{hasChildren ? (
						<ActionIcon
							size='sm'
							variant='subtle'
							className={styles.chevron}
							onClick={(event) => {
								event.stopPropagation();
								setIsExpanded((value) => !value);
							}}
							aria-label={t(
								effectivelyExpanded
									? 'disposition.nodeEditor.collapse'
									: 'disposition.nodeEditor.expand'
							)}
						>
							{effectivelyExpanded ? (
								<IconChevronDown size={15} />
							) : (
								<IconChevronRight size={15} />
							)}
						</ActionIcon>
					) : (
						<span className={styles.chevronSpacer} />
					)}
				</div>

				<span className={styles.icon} aria-hidden='true'>
					{isLeaf ? (
						<IconFileDescription size={15} stroke={1.9} />
					) : (
						<IconFolder size={15} stroke={1.9} />
					)}
				</span>

				<div className={styles.nodeIdentity}>
					<Text className={styles.name} size='sm' fw={level === 0 ? 650 : 500}>
						{node.name}
					</Text>
					{node.description && (
						<Text className={styles.description} size='xs' lineClamp={1}>
							{node.description}
						</Text>
					)}
				</div>

				<div className={styles.rowAside}>
					{flowNode && <OutcomeNodeFlags node={flowNode} />}
					{hasChildren ? (
						<Badge
							size='sm'
							variant='light'
							color={selectedDescendantCount > 0 ? 'green' : 'gray'}
							radius='sm'
						>
							{t('disposition.tree.branchSelection', {
								selected: selectedDescendantCount,
								total: leafIds.length,
							})}
						</Badge>
					) : isIncluded ? (
						<Badge size='sm' variant='light' color='green' radius='sm'>
							{t('disposition.tree.included')}
						</Badge>
					) : null}
				</div>
			</div>

			{effectivelyExpanded && visibleChildren.length > 0 && (
				<div className={styles.nodeChildren} data-tone={tone} role='group'>
					{visibleChildren.map((child) => (
						<TreeNode
							key={child.id}
							node={child}
							level={level + 1}
							branchTone={tone}
							searchQuery={searchQuery}
							expandSignal={expandSignal}
							collapseSignal={collapseSignal}
							flowNodes={flowNodes}
							selectedLeafIds={selectedLeafIds}
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
	selectionError?: string;
}

const UnifiedOutcomeTree: React.FC<UnifiedOutcomeTreeProps> = ({
	onNodeSelect,
	selectedNodeId,
	selectionError,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const {
		flowJson,
		selectSubtree,
		deselectSubtree,
		clearSelection,
		selectedCatalog,
		setSelectedCatalog,
	} = useDispositionBuilderStore();
	const selectedCampaignType = useCampaignsStore(
		(state) => state.selectedCampaign?.type
	);
	const campaignType = flowJson.type ?? selectedCampaignType ?? 'OUTBOUND';
	const catalogType = campaignType === 'HYBRID' ? 'OUTBOUND' : campaignType;
	const {
		data: catalogs = [],
		isLoading,
		isError,
		refetch,
	} = useDispositionCatalogs({ type: catalogType });
	const activeCatalogs = useMemo(
		() => catalogs.filter((catalog) => catalog.isActive),
		[catalogs]
	);
	const flowNodes = useMemo(
		() => flowJson.dispositionNodes ?? [],
		[flowJson.dispositionNodes]
	);

	useEffect(() => {
		if (activeCatalogs.length === 0) return;

		const findCatalogId = (nodes: DispositionNode[]): number | undefined => {
			for (const node of nodes) {
				if (node.catalogId) return node.catalogId;
				const childCatalogId = findCatalogId(node.children ?? []);
				if (childCatalogId) return childCatalogId;
			}
			return undefined;
		};
		const catalogIdFromFlow = flowJson.id ?? findCatalogId(flowNodes);
		const matchingCatalog = activeCatalogs.find(
			(catalog) => catalog.id === catalogIdFromFlow
		);

		if (matchingCatalog && matchingCatalog.id !== selectedCatalog?.id) {
			setSelectedCatalog(matchingCatalog);
			return;
		}
		if (!matchingCatalog && !selectedCatalog) {
			setSelectedCatalog(activeCatalogs[0]);
		}
	}, [
		activeCatalogs,
		flowJson.id,
		flowNodes,
		selectedCatalog,
		setSelectedCatalog,
	]);

	const [searchQuery, setSearchQuery] = useState('');
	const [collapseSignal, setCollapseSignal] = useState(0);
	const [expandSignal, setExpandSignal] = useState(0);
	const catalogNodes = selectedCatalog?.dispositionNodes ?? EMPTY_CATALOG_NODES;
	const selectedLeafIds = useMemo(
		() => getSelectedLeafIds(catalogNodes, flowNodes),
		[catalogNodes, flowNodes]
	);
	const totalLeafCount = useMemo(
		() => getAllActiveLeafIds(catalogNodes).length,
		[catalogNodes]
	);
	const rootNodes = useMemo(
		() => catalogNodes.filter((node) => node.isActive !== false),
		[catalogNodes]
	);
	const visibleRootNodes = useMemo(
		() => rootNodes.filter((node) => shouldRenderNode(node, searchQuery)),
		[rootNodes, searchQuery]
	);

	const handleClearSelection = () => {
		modals.openConfirmModal({
			title: t('disposition.tree.clearConfirmTitle'),
			children: (
				<Text size='sm'>{t('disposition.tree.clearConfirmDescription')}</Text>
			),
			labels: {
				confirm: t('disposition.tree.clearSelection'),
				cancel: t('disposition.tree.keepSelection'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				clearSelection();
				onNodeSelect(null);
			},
		});
	};

	if (isLoading) {
		return (
			<Stack gap='xs' p='xs' aria-label={t('disposition.tree.loading')}>
				<Skeleton height={36} radius='sm' />
				<Skeleton height={36} radius='sm' />
				{Array.from({ length: 7 }).map((_, index) => (
					<Skeleton key={index} height={44} radius='sm' />
				))}
			</Stack>
		);
	}

	if (isError) {
		return (
			<Alert
				icon={<IconAlertCircle size={18} />}
				title={t('disposition.tree.loadErrorTitle')}
				color='red'
				variant='light'
			>
				<Stack gap='sm'>
					<Text size='sm'>{t('disposition.tree.loadErrorDescription')}</Text>
					<Button
						variant='light'
						color='red'
						size='xs'
						onClick={() => refetch()}
					>
						{t('disposition.tree.retry')}
					</Button>
				</Stack>
			</Alert>
		);
	}

	if (activeCatalogs.length === 0) {
		return (
			<div className={styles.emptyState}>
				<ThemeIcon size={48} radius='xl' variant='light' color='gray'>
					<IconFolderOff size={24} />
				</ThemeIcon>
				<Stack gap={4} align='center'>
					<Text fw={600}>{t('disposition.catalog.noCatalogsTitle')}</Text>
					<Text size='sm' c='dimmed' ta='center' maw={440}>
						{t('disposition.tree.noCatalogsDescription')}
					</Text>
				</Stack>
				<Button
					component='a'
					href='/outcomes'
					target='_blank'
					rel='noreferrer'
					variant='light'
					leftSection={<IconExternalLink size={16} />}
				>
					{t('disposition.tree.manageCatalogs')}
				</Button>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.toolbar}>
				<Select
					data={activeCatalogs.map((catalog) => ({
						value: String(catalog.id),
						label: catalog.name,
					}))}
					value={selectedCatalog ? String(selectedCatalog.id) : null}
					onChange={(id) => {
						const catalog =
							activeCatalogs.find((item) => String(item.id) === id) ?? null;
						setSelectedCatalog(catalog);
						onNodeSelect(null);
					}}
					disabled={selectedLeafIds.size > 0}
					size='sm'
					className={styles.catalogSelect}
					aria-label={t('disposition.catalog.selectCatalog')}
				/>
				<TextInput
					size='sm'
					leftSection={<IconSearch size={15} />}
					placeholder={t('disposition.tree.searchPlaceholder')}
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.currentTarget.value)}
					className={styles.searchInput}
				/>
				<Group gap={4} wrap='nowrap' className={styles.toolbarActions}>
					<Badge size='lg' variant='light' color='green' radius='sm'>
						{t('disposition.tree.selectionCount', {
							selected: selectedLeafIds.size,
							total: totalLeafCount,
						})}
					</Badge>
					<Tooltip label={t('disposition.builder.collapseAll')} withArrow>
						<ActionIcon
							size='lg'
							variant='subtle'
							onClick={() => setCollapseSignal((value) => value + 1)}
							aria-label={t('disposition.builder.collapseAll')}
						>
							<IconLayoutList size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('disposition.builder.expandAll')} withArrow>
						<ActionIcon
							size='lg'
							variant='subtle'
							onClick={() => setExpandSignal((value) => value + 1)}
							aria-label={t('disposition.builder.expandAll')}
						>
							<IconLayoutRows size={16} />
						</ActionIcon>
					</Tooltip>
					{selectedLeafIds.size > 0 && (
						<Button
							variant='subtle'
							color='gray'
							size='xs'
							leftSection={<IconEraser size={15} />}
							onClick={handleClearSelection}
						>
							{t('disposition.tree.clearSelection')}
						</Button>
					)}
				</Group>
			</div>

			{selectedLeafIds.size > 0 && (
				<Text className={styles.catalogLockHint} size='xs'>
					{t('disposition.tree.catalogLocked')}
				</Text>
			)}

			{selectionError && (
				<Alert color='red' variant='light' className={styles.selectionError}>
					{selectionError}
				</Alert>
			)}

			<div className={styles.treeHeader} aria-hidden='true'>
				<span>{t('disposition.tree.outcomeColumn')}</span>
				<span>{t('disposition.tree.statusColumn')}</span>
			</div>

			<ScrollArea className={styles.scrollArea} type='hover' scrollbarSize={7}>
				{rootNodes.length === 0 ? (
					<div className={styles.emptyTree}>
						<Text size='sm' fw={600}>
							{t('disposition.tree.emptyCatalogTitle')}
						</Text>
						<Text size='sm' c='dimmed'>
							{t('disposition.catalog.noDispositions')}
						</Text>
					</div>
				) : visibleRootNodes.length === 0 ? (
					<div className={styles.emptyTree}>
						<Text size='sm' fw={600}>
							{t('disposition.tree.noSearchResultsTitle')}
						</Text>
						<Text size='sm' c='dimmed'>
							{t('disposition.tree.noSearchResultsDescription', {
								query: searchQuery,
							})}
						</Text>
					</div>
				) : (
					<div
						className={styles.tree}
						role='tree'
						aria-label={t('disposition.tree.ariaLabel')}
					>
						{visibleRootNodes.map((node) => (
							<TreeNode
								key={node.id}
								node={node}
								level={0}
								branchTone={getNodeStyle(node, 0)}
								searchQuery={searchQuery}
								expandSignal={expandSignal}
								collapseSignal={collapseSignal}
								flowNodes={flowNodes}
								selectedLeafIds={selectedLeafIds}
								selectedNodeId={selectedNodeId}
								onToggle={(selectedNode, checked) => {
									if (checked) selectSubtree(selectedNode.id);
									else deselectSubtree(selectedNode.id);
								}}
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
