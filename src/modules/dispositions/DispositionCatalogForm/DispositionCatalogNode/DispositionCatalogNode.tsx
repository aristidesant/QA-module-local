import { useUpdateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useDeleteDispositionNode } from '~/queries/dispositionNodesQueries';
import { useCreateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useReactivateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useDeactivateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useDispositionStore } from '~/modules/dispositions/dispositionRightComponentStore';

import {
	Flex,
	Button,
	ActionIcon,
	Text,
	Badge,
	Skeleton,
	Menu,
	Alert,
	Tooltip,
} from '@mantine/core';
import { Tree } from 'react-arborist';
import {
	IconPlus,
	IconTrash,
	IconPencil,
	IconFolder,
	IconFileDescription,
	IconChevronDown,
	IconChevronRight,
	IconRefresh,
	IconBan,
	IconDotsVertical,
	IconGripVertical,
	IconAlertCircle,
	IconHelpCircle,
} from '@tabler/icons-react';
import { useState, type MouseEvent, type CSSProperties } from 'react';
import styles from './DispositionCatalogNode.module.css';
import DispositionNodeForm from './DispositionNodeForm';
import { notifications } from '@mantine/notifications';
import { SectionCard } from '~/components/SectionCard';
// Types for modal state
type ModalState = {
	open: boolean;
	parentId?: number;
	editNode?: DispositionNode;
};
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionTreeByCatalog } from '~/queries/dispositionNodesQueries';
import { modals } from '@mantine/modals';
import {
	OUTBOUND_PROTECTED_ROOT_NODE_NAMES,
	type OutboundProtectedRootNodeName,
} from '~/modules/dispositions/constants';

type DispositionCatalogFormProps = {
	catalogId: number;
};

// Utility to map DispositionNode[] to Arborist tree data
function mapDispositionNodesToArborist(
	nodes: DispositionNode[]
): ArboristNode[] {
	return nodes.map((node) => ({
		id: node.id.toString(),
		name: node.name,
		description: node.description,
		isLeaf: !node.children || node.children.length === 0,
		children: node.children ? mapDispositionNodesToArborist(node.children) : [],
		original: node,
	}));
}

type ArboristNode = {
	id: string;
	name: string;
	description?: string;
	isLeaf: boolean;
	children: ArboristNode[];
	original: DispositionNode;
};

type NodeInnerStyle = CSSProperties & { '--node-indent'?: string };
type NodeCardStyle = CSSProperties & { '--node-offset'?: string };

const isProtectedDefaultNode = (
	node: DispositionNode,
	catalogType?: 'INBOUND' | 'OUTBOUND'
) =>
	catalogType === 'OUTBOUND' &&
	(node.parentId === null || typeof node.parentId === 'undefined') &&
	OUTBOUND_PROTECTED_ROOT_NODE_NAMES.includes(
		node.name as OutboundProtectedRootNodeName
	);

const DispositionCatalogForm: React.FC<DispositionCatalogFormProps> = ({
	catalogId,
}) => {
	const {
		data,
		refetch: reloadCatalogs,
		isLoading,
		isError,
		error,
	} = useDispositionTreeByCatalog(catalogId);
	const [modal, setModal] = useState<ModalState>({ open: false });
	const catalogType = useDispositionStore((state) => state.catalog?.type);
	const createNode = useCreateDispositionNode();
	const updateNode = useUpdateDispositionNode();
	const deleteNode = useDeleteDispositionNode();
	const reactivateNode = useReactivateDispositionNode();
	const deactivateNode = useDeactivateDispositionNode();

	if (!catalogId) return null;
	const treeData = data ? mapDispositionNodesToArborist(data) : [];

	// Handler for deactivating node
	const handleDeactivateNode = (nodeData: DispositionNode) => {
		modals.openConfirmModal({
			title: 'Deactivate Outcome Node',
			labels: {
				confirm: 'Deactivate',
				cancel: 'Cancel',
			},
			children: (
				<Text size='sm'>
					Are you sure you want to deactivate this outcome node? It will no
					longer be available for campaign configuration.
				</Text>
			),
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deactivateNode.mutateAsync(nodeData.id);
					await reloadCatalogs();
					notifications.show({
						title: 'Node deactivated',
						message: 'Outcome node was deactivated successfully.',
						color: 'blue',
					});
				} catch (error: any) {
					notifications.show({
						title: 'Deactivation failed',
						message: error?.message || 'Failed to deactivate outcome node.',
						color: 'red',
					});
				}
			},
		});
	};

	// Handler for reactivating node
	const handleReactivateNode = (nodeData: DispositionNode) => {
		modals.openConfirmModal({
			title: 'Reactivate Outcome Node',
			labels: {
				confirm: 'Reactivate',
				cancel: 'Cancel',
			},
			children: (
				<Text size='sm'>
					Are you sure you want to reactivate this outcome node? It will become
					available for campaign configuration again.
				</Text>
			),
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					await reactivateNode.mutateAsync(nodeData.id);
					await reloadCatalogs();
					notifications.show({
						title: 'Node reactivated',
						message: 'Outcome node was reactivated successfully.',
						color: 'green',
					});
				} catch (error: any) {
					notifications.show({
						title: 'Reactivation failed',
						message: error?.message || 'Failed to reactivate outcome node.',
						color: 'red',
					});
				}
			},
		});
	};

	const handleEditNode = (nodeData: DispositionNode) => {
		if (isProtectedDefaultNode(nodeData, catalogType)) {
			return;
		}
		setModal({ open: true, editNode: nodeData });
	};

	const handleDeleteNode = (nodeData: DispositionNode) => {
		if (isProtectedDefaultNode(nodeData, catalogType)) {
			return;
		}

		modals.openConfirmModal({
			title: 'Confirm Delete',
			labels: {
				confirm: 'Delete',
				cancel: 'Cancel',
			},
			children: (
				<Text size='sm'>Are you sure you want to delete this node?</Text>
			),
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteNode.mutateAsync(nodeData.id);
				await reloadCatalogs();
			},
		});
	};

	// React Arborist custom node renderer
	function Node({ node, style, dragHandle }: any) {
		const nodeData: DispositionNode = node.data.original;
		const hasChildren = node.children && node.children.length > 0;
		const isOpen = node.isOpen;
		const childCount = node.children ? node.children.length : 0;
		const isInactive = nodeData.isActive === false;
		const isProtectedNode = isProtectedDefaultNode(nodeData, catalogType);
		const nodeTypeLabel = hasChildren ? 'Group' : 'Outcome';
		const levelIndent = node.level * 16;
		const cardOffset = node.level > 0 ? Math.min(levelIndent, 80) : 0;
		const cardStyle: NodeCardStyle = cardOffset
			? { '--node-offset': `${cardOffset}px` }
			: {};
		const innerStyle: NodeInnerStyle = {
			'--node-indent': `${Math.max(cardOffset - 12, 0)}px`,
		};

		const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			if (hasChildren) {
				node.toggle();
			}
		};

		return (
			<div style={style}>
				<div
					className={`${styles.nodeCard} ${isInactive ? styles.inactiveNode : ''}`}
					tabIndex={0}
					aria-label={node.data.name}
					data-has-children={hasChildren}
					data-expanded={isOpen}
					data-level={node.level}
					style={cardStyle}
				>
					<div className={styles.nodeInner} style={innerStyle}>
						<div className={styles.nodeLead}>
							<span
								className={styles.statusPill}
								data-status={nodeData.isActive ? 'active' : 'inactive'}
								aria-hidden='true'
							/>
							<div className={styles.nodeToggleArea}>
								{hasChildren ? (
									<ActionIcon
										size='sm'
										variant='subtle'
										className={styles.chevronIcon}
										aria-label={isOpen ? 'Collapse node' : 'Expand node'}
										onClick={handleToggle}
									>
										{isOpen ? (
											<IconChevronDown size={18} />
										) : (
											<IconChevronRight size={18} />
										)}
									</ActionIcon>
								) : (
									<span className={styles.chevronPlaceholder} />
								)}
							</div>
						</div>

						<div className={styles.nodeContent}>
							<div className={styles.nodeHeader}>
								<div className={styles.nodeTitle}>
									<span className={styles.nodeIcon} aria-hidden='true'>
										{node.isLeaf ? (
											<IconFileDescription
												size={18}
												color={
													isInactive
														? 'var(--mantine-color-gray-5)'
														: 'var(--mantine-color-blue-6)'
												}
											/>
										) : (
											<IconFolder
												size={18}
												color={
													isInactive
														? 'var(--mantine-color-gray-5)'
														: 'var(--mantine-color-yellow-7)'
												}
											/>
										)}
									</span>
									<Text className={styles.nodeName} size='sm' fw={600}>
										{node.data.name}
									</Text>
									{node.data.description && (
										<Tooltip label={node.data.description} withArrow>
											<ActionIcon
												size='xs'
												variant='subtle'
												className={styles.descriptionIcon}
											>
												<IconHelpCircle
													size={14}
													color='var(--mantine-color-gray-6)'
												/>
											</ActionIcon>
										</Tooltip>
									)}
								</div>
								<div className={styles.nodeBadges}>
									<Badge size='xs' variant='light' color='blue' radius='sm'>
										{nodeTypeLabel}
									</Badge>
								</div>
							</div>
							<Text className={styles.nodeMetaText} size='xs'>
								{hasChildren
									? `${childCount} ${childCount === 1 ? 'child outcome' : 'child outcomes'}`
									: 'Terminal outcome'}
							</Text>
						</div>

						<div className={styles.nodeAside}>
							<div
								className={styles.dragHandle}
								ref={dragHandle}
								role='button'
								tabIndex={-1}
								aria-label='Drag to reorder'
							>
								<IconGripVertical size={16} />
							</div>
							<div className={styles.nodeActionsDesktop}>
								<ActionIcon.Group>
									{isInactive ? (
										<Tooltip label='Reactivate node' withArrow>
											<ActionIcon
												size='sm'
												variant='light'
												color='green'
												onClick={(event) => {
													event.stopPropagation();
													handleReactivateNode(nodeData);
												}}
											>
												<IconRefresh size={16} />
											</ActionIcon>
										</Tooltip>
									) : (
										<Tooltip label='Deactivate node' withArrow>
											<ActionIcon
												size='sm'
												variant='subtle'
												onClick={(event) => {
													event.stopPropagation();
													handleDeactivateNode(nodeData);
												}}
											>
												<IconBan size={16} />
											</ActionIcon>
										</Tooltip>
									)}
									{!isProtectedNode && (
										<Tooltip label='Edit node' withArrow>
											<ActionIcon
												size='sm'
												variant='subtle'
												onClick={(event) => {
													event.stopPropagation();
													handleEditNode(nodeData);
												}}
											>
												<IconPencil size={16} />
											</ActionIcon>
										</Tooltip>
									)}
									<Tooltip label='Add child outcome' withArrow>
										<ActionIcon
											size='sm'
											variant='subtle'
											onClick={(event) => {
												event.stopPropagation();
												setModal({ open: true, parentId: nodeData.id });
											}}
										>
											<IconPlus size={16} />
										</ActionIcon>
									</Tooltip>
									{!isProtectedNode && (
										<Tooltip label='Delete node' withArrow>
											<ActionIcon
												size='sm'
												variant='light'
												color='red'
												onClick={(event) => {
													event.stopPropagation();
													handleDeleteNode(nodeData);
												}}
											>
												<IconTrash size={16} />
											</ActionIcon>
										</Tooltip>
									)}
								</ActionIcon.Group>
							</div>
							<Menu shadow='md' width={180} withinPortal>
								<Menu.Target>
									<ActionIcon
										size='sm'
										variant='subtle'
										className={styles.nodeActionsMobile}
										aria-label='Open node actions'
										onClick={(event) => event.stopPropagation()}
									>
										<IconDotsVertical size={16} />
									</ActionIcon>
								</Menu.Target>
								<Menu.Dropdown onClick={(event) => event.stopPropagation()}>
									{isInactive ? (
										<Menu.Item
											leftSection={<IconRefresh size={16} />}
											onClick={() => handleReactivateNode(nodeData)}
										>
											Reactivate
										</Menu.Item>
									) : (
										<Menu.Item
											leftSection={<IconBan size={16} />}
											onClick={() => handleDeactivateNode(nodeData)}
										>
											Deactivate
										</Menu.Item>
									)}
									{!isProtectedNode && (
										<Menu.Item
											leftSection={<IconPencil size={16} />}
											onClick={() => handleEditNode(nodeData)}
										>
											Edit
										</Menu.Item>
									)}
									<Menu.Item
										leftSection={<IconPlus size={16} />}
										onClick={() =>
											setModal({ open: true, parentId: nodeData.id })
										}
									>
										Add child
									</Menu.Item>
									{!isProtectedNode && (
										<Menu.Item
											leftSection={<IconTrash size={16} />}
											color='red'
											onClick={() => handleDeleteNode(nodeData)}
										>
											Delete
										</Menu.Item>
									)}
								</Menu.Dropdown>
							</Menu>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<SectionCard
				icon={IconFolder}
				title='Outcomes'
				description='Manage outcome nodes and build your disposition tree'
				contentSpacing='sm'
				backgroundColor='var(--mantine-color-gray-0)'
			>
				{isError && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title='Unable to load outcomes'
						color='red'
						variant='light'
						className={styles.errorBanner}
					>
						{error?.message ??
							'An unexpected error occurred while loading the catalog.'}
					</Alert>
				)}
				{isLoading ? (
					<div className={styles.treeWrapper}>
						<div className={styles.skeletonStack}>
							{Array.from({ length: 4 }).map((_, index) => (
								<Skeleton key={index} height={88} radius='md' animate />
							))}
						</div>
					</div>
				) : treeData.length > 0 ? (
					<div className={styles.treeWrapper}>
						<Tree
							data={treeData}
							openByDefault={true}
							childrenAccessor='children'
							idAccessor='id'
							rowHeight={84}
							width='100%'
							className={styles.treeRoot}
						>
							{Node}
						</Tree>
					</div>
				) : (
					<div className={`${styles.treeWrapper} ${styles.emptyState}`}>
						<Text size='sm' c='dimmed'>
							No outcomes yet. Start by adding a root outcome for this catalog.
						</Text>
					</div>
				)}
				<Flex justify='end' align='center' className={styles.addButtonRow}>
					<Button
						fullWidth
						variant='light'
						color='blue'
						leftSection={<IconPlus size={18} />}
						size='md'
						className={styles.addButton}
						onClick={() => setModal({ open: true })}
						aria-label='Add outcome to catalog'
					>
						Add root outcome
					</Button>
				</Flex>
			</SectionCard>
			<DispositionNodeForm
				opened={modal.open}
				onClose={() => setModal({ open: false })}
				initialValues={modal.editNode}
				onSubmit={async (values) => {
					if (!catalogId) return;
					if (modal.editNode) {
						await updateNode.mutateAsync({
							id: modal.editNode.id,
							data: values,
						});
						await reloadCatalogs();
					} else {
						await createNode.mutateAsync({
							data: {
								...values,
								catalogId: Number(catalogId),
								parentId: modal.parentId,
							},
						});
						await reloadCatalogs();
					}
					setModal({ open: false });
				}}
				title={modal.editNode ? 'Edit Outcome' : 'Add Outcome'}
			/>
		</>
	);
};

export default DispositionCatalogForm;
