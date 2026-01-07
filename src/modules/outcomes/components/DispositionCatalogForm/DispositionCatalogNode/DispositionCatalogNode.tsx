import { useUpdateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useDeleteDispositionNode } from '~/queries/dispositionNodesQueries';
import { useCreateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useReactivateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useDeactivateDispositionNode } from '~/queries/dispositionNodesQueries';
import { useTranslation } from 'react-i18next';

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
	OutboundProtectedRootNodeName,
} from '../../../constants';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useDispositionStore } from '../../../dispositionRightComponentStore';

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

	const { t } = useTranslation('outcomes');
	const { canPerformAction } = usePermissions();
	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);
	const canUpdate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.UPDATE
	);
	const canDelete = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.DELETE
	);

	if (!catalogId) return null;
	const treeData = data ? mapDispositionNodesToArborist(data) : [];

	// Handler for deactivating node
	const handleDeactivateNode = (nodeData: DispositionNode) => {
		modals.openConfirmModal({
			title: t('catalog.modals.deactivate.title'),
			labels: {
				confirm: t('catalog.modals.deactivate.confirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			children: <Text size='sm'>{t('catalog.modals.deactivate.message')}</Text>,
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deactivateNode.mutateAsync(nodeData.id);
					await reloadCatalogs();
					notifications.show({
						title: t('catalog.notifications.nodeDeactivated'),
						message: t('catalog.notifications.deactivateSuccess'),
						color: 'blue',
					});
				} catch (error: any) {
					notifications.show({
						title: t('catalog.notifications.deactivationFailed'),
						message:
							error?.message || t('catalog.notifications.deactivateError'),
						color: 'red',
					});
				}
			},
		});
	};

	// Handler for reactivating node
	const handleReactivateNode = (nodeData: DispositionNode) => {
		modals.openConfirmModal({
			title: t('catalog.modals.reactivate.title'),
			labels: {
				confirm: t('catalog.modals.reactivate.confirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			children: <Text size='sm'>{t('catalog.modals.reactivate.message')}</Text>,
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					await reactivateNode.mutateAsync(nodeData.id);
					await reloadCatalogs();
					notifications.show({
						title: t('catalog.notifications.nodeReactivated'),
						message: t('catalog.notifications.reactivateSuccess'),
						color: 'green',
					});
				} catch (error: any) {
					notifications.show({
						title: t('catalog.notifications.reactivationFailed'),
						message:
							error?.message || t('catalog.notifications.reactivateError'),
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
			title: t('catalog.modals.delete.title'),
			labels: {
				confirm: t('catalog.modals.delete.confirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			children: <Text size='sm'>{t('catalog.modals.delete.message')}</Text>,
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
		const isDoNotCall = Boolean(nodeData.doNotCall ?? nodeData.do_not_call);
		const nodeTypeLabel = hasChildren
			? t('catalog.nodeType.group')
			: t('catalog.nodeType.outcome');
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
										aria-label={
											isOpen
												? t('catalog.actions.collapse')
												: t('catalog.actions.expand')
										}
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
									{isDoNotCall && (
										<Tooltip
											label={t('catalog.labels.doNotCallTooltip')}
											withArrow
										>
											<Badge size='xs' variant='light' color='red' radius='sm'>
												{t('catalog.labels.doNotCall')}
											</Badge>
										</Tooltip>
									)}
								</div>
							</div>
							<Text className={styles.nodeMetaText} size='xs'>
								{hasChildren
									? t('catalog.nodeType.child', { count: childCount })
									: t('catalog.nodeType.terminal')}
							</Text>
						</div>

						<div className={styles.nodeAside}>
							{canUpdate && (
								<div
									className={styles.dragHandle}
									ref={dragHandle}
									role='button'
									tabIndex={-1}
									aria-label={t('catalog.actions.reorder')}
								>
									<IconGripVertical size={16} />
								</div>
							)}
							<div className={styles.nodeActionsDesktop}>
								<ActionIcon.Group>
									{isInactive
										? canUpdate && (
												<Tooltip
													label={t('catalog.actions.reactivate')}
													withArrow
												>
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
											)
										: canUpdate && (
												<Tooltip
													label={t('catalog.actions.deactivate')}
													withArrow
												>
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
									{!isProtectedNode && canUpdate && (
										<Tooltip label={t('catalog.actions.edit')} withArrow>
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
									{canCreate && (
										<Tooltip label={t('catalog.actions.addChild')} withArrow>
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
									)}
									{!isProtectedNode && canDelete && (
										<Tooltip label={t('catalog.actions.delete')} withArrow>
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
									{isInactive
										? canUpdate && (
												<Menu.Item
													leftSection={<IconRefresh size={16} />}
													onClick={() => handleReactivateNode(nodeData)}
												>
													{t('catalog.actions.reactivate')}
												</Menu.Item>
											)
										: canUpdate && (
												<Menu.Item
													leftSection={<IconBan size={16} />}
													onClick={() => handleDeactivateNode(nodeData)}
												>
													{t('catalog.actions.deactivate')}
												</Menu.Item>
											)}
									{!isProtectedNode && canUpdate && (
										<Menu.Item
											leftSection={<IconPencil size={16} />}
											onClick={() => handleEditNode(nodeData)}
										>
											{t('actions.edit', { ns: 'common' })}
										</Menu.Item>
									)}
									{canCreate && (
										<Menu.Item
											leftSection={<IconPlus size={16} />}
											onClick={() =>
												setModal({ open: true, parentId: nodeData.id })
											}
										>
											{t('catalog.actions.addChild')}
										</Menu.Item>
									)}
									{!isProtectedNode && canDelete && (
										<Menu.Item
											leftSection={<IconTrash size={16} />}
											color='red'
											onClick={() => handleDeleteNode(nodeData)}
										>
											{t('actions.delete', { ns: 'common' })}
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
				title={t('catalog.title')}
				description={t('catalog.description')}
				contentSpacing='sm'
				backgroundColor='var(--mantine-color-gray-0)'
			>
				{isError && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title={t('catalog.errorBanner')}
						color='red'
						variant='light'
						className={styles.errorBanner}
					>
						{error?.message ?? t('catalog.errorDescription')}
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
							{t('catalog.emptyState')}
						</Text>
					</div>
				)}
				<Flex justify='end' align='center' className={styles.addButtonRow}>
					{canCreate && (
						<Button
							fullWidth
							variant='light'
							color='blue'
							leftSection={<IconPlus size={18} />}
							size='md'
							className={styles.addButton}
							onClick={() => setModal({ open: true })}
							aria-label={t('catalog.addRoot')}
						>
							{t('catalog.addRoot')}
						</Button>
					)}
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
				title={modal.editNode ? t('form.titleEdit') : t('form.titleCreate')}
			/>
		</>
	);
};

export default DispositionCatalogForm;
