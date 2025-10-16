import { useUpdateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useDeleteDispositionNode } from '~/queries/dispositionNodesQueries';
import { useCreateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useReactivateDispositionNode } from '~/queries/dispositionNodesQueries';

import { Box, Flex, Button, ActionIcon, Text, Badge } from '@mantine/core';
import { Tree } from 'react-arborist';
import {
	IconPlus,
	IconTrash,
	IconPencil,
	IconFolder,
	IconFileDescription,
	IconChevronUp,
	IconChevronRight,
	IconRefresh,
} from '@tabler/icons-react';
import { useState } from 'react';
import styles from './DispositionCatalogNode.module.css';
import DispositionNodeForm from './DispositionNodeForm';
import { notifications } from '@mantine/notifications';
// Types for modal state
type ModalState = {
	open: boolean;
	parentId?: number;
	editNode?: DispositionNode;
};
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { useDispositionTreeByCatalog } from '~/queries/dispositionNodesQueries';
import { modals } from '@mantine/modals';

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

const DispositionCatalogForm: React.FC<DispositionCatalogFormProps> = ({
	catalogId,
}) => {
	const { data, refetch: reloadCatalogs } =
		useDispositionTreeByCatalog(catalogId);
	const [modal, setModal] = useState<ModalState>({ open: false });
	const createNode = useCreateDispositionNode();
	const updateNode = useUpdateDispositionNode();
	const deleteNode = useDeleteDispositionNode();
	const reactivateNode = useReactivateDispositionNode();

	if (!catalogId) return null;
	const treeData = data ? mapDispositionNodesToArborist(data) : [];

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

	// React Arborist custom node renderer
	function Node({ node, style, dragHandle }: any) {
		const nodeData: DispositionNode = node.data.original;
		const isOpen = node.isOpen;
		const hasChildren = node.children && node.children.length > 0;
		const isInactive = nodeData.isActive === false;

		return (
			<div
				style={style}
				className={styles.nodeContainer}
				ref={dragHandle}
				tabIndex={0}
				aria-label={node.data.name}
				data-has-children={hasChildren}
				data-expanded={isOpen}
				data-inactive={isInactive}
			>
				<div className={styles.nodeContent}>
					<div className={styles.nodeLeftSection}>
						{hasChildren ? (
							<ActionIcon
								size='sm'
								variant='transparent'
								className={styles.chevronIcon}
								aria-label={isOpen ? 'Collapse' : 'Expand'}
								onClick={(e) => {
									e.stopPropagation();
									node.toggle();
								}}
							>
								{isOpen ? (
									<IconChevronUp size={18} />
								) : (
									<IconChevronRight size={18} />
								)}
							</ActionIcon>
						) : (
							<span className={styles.chevronPlaceholder} />
						)}
						<span className={styles.nodeIcon} aria-hidden='true'>
							{node.isLeaf ? (
								<IconFileDescription
									size={18}
									color={
										isInactive
											? 'var(--mantine-color-gray-5)'
											: 'var(--mantine-color-gray-6)'
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
					</div>
					<span className={styles.nodeLabel}>{node.data.name}</span>
					<div className={styles.statusBadge}>
						{nodeData.isActive !== undefined && (
							<Badge
								size='md'
								variant='light'
								color={nodeData.isActive ? 'green' : 'gray'}
								radius='sm'
								styles={{
									root: {
										textTransform: 'none',
										fontWeight: 500,
										minWidth: '70px',
									},
								}}
							>
								{nodeData.isActive ? 'Active' : 'Inactive'}
							</Badge>
						)}
					</div>
				</div>
				<div className={styles.nodeActions}>
					{isInactive && (
						<ActionIcon
							size='md'
							variant='light'
							color='green'
							aria-label='Reactivate node'
							className={styles.reactivateActionIcon}
							onClick={(e) => {
								e.stopPropagation();
								handleReactivateNode(nodeData);
							}}
							title='Reactivate this outcome node'
						>
							<IconRefresh size={18} stroke={2} />
						</ActionIcon>
					)}
					<ActionIcon
						size='md'
						variant='transparent'
						aria-label='Edit node'
						className={styles.actionIcon}
						onClick={(e) => {
							e.stopPropagation();
							setModal({ open: true, editNode: nodeData });
						}}
					>
						<IconPencil size={16} />
					</ActionIcon>
					<ActionIcon
						size='md'
						variant='transparent'
						aria-label='Add child'
						className={styles.actionIcon}
						onClick={(e) => {
							e.stopPropagation();
							setModal({ open: true, parentId: nodeData.id });
						}}
					>
						<IconPlus size={16} />
					</ActionIcon>
					<ActionIcon
						size='md'
						variant='transparent'
						aria-label='Remove node'
						className={styles.deleteActionIcon}
						onClick={async (e) => {
							e.stopPropagation();
							modals.openConfirmModal({
								title: 'Confirm Delete',
								labels: {
									confirm: 'Delete',
									cancel: 'Cancel',
								},
								children: (
									<Text>Are you sure you want to delete this node?</Text>
								),
								onConfirm: async () => {
									await deleteNode.mutateAsync(nodeData.id);
									await reloadCatalogs();
								},
							});
						}}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</div>
			</div>
		);
	}

	return (
		<>
			<Box>
				{treeData.length > 0 && (
					<div className={styles.treeWrapper}>
						<Tree
							data={treeData}
							openByDefault={true}
							childrenAccessor='children'
							idAccessor='id'
							rowHeight={56}
							width='100%'
							className={styles.treeRoot}
						>
							{Node}
						</Tree>
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
			</Box>
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
