import {
	useUpdateDispositionNode,
	useDeleteDispositionNode,
	useCreateDispositionNode,
	useReactivateDispositionNode,
	useDeactivateDispositionNode,
	useDispositionTreeByCatalog,
} from '~/queries/dispositionNodesQueries';
import { useTranslation } from 'react-i18next';

import {
	Stack,
	Button,
	ActionIcon,
	Text,
	Badge,
	Skeleton,
	Menu,
	Alert,
	Tooltip,
	Center,
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
	IconLock,
} from '@tabler/icons-react';
import { useState, type CSSProperties } from 'react';
import styles from './DispositionCatalogNode.module.css';
import DispositionNodeForm from './DispositionNodeForm';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import {
	OUTBOUND_PROTECTED_ROOT_NODE_NAMES,
	OutboundProtectedRootNodeName,
} from '../../../constants';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useDispositionStore } from '../../../dispositionRightComponentStore';
// Types for modal state
type ModalState = {
	open: boolean;
	parentId?: number;
	editNode?: DispositionNode;
	isProtected?: boolean;
};

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

type NodeRowStyle = CSSProperties & { '--connector-x'?: string };

function findNodeInTree(
	nodes: ArboristNode[],
	targetId: string
): ArboristNode | null {
	for (const node of nodes) {
		if (node.id === targetId) return node;
		const found = findNodeInTree(node.children, targetId);
		if (found) return found;
	}
	return null;
}

function collectAllDescendantIds(node: ArboristNode): number[] {
	const ids: number[] = [];
	const walk = (children: ArboristNode[]) => {
		for (const child of children) {
			ids.push(Number(child.id));
			walk(child.children);
		}
	};
	walk(node.children);
	return ids;
}

const isProtectedDefaultNode = (
	node: DispositionNode,
	catalogType?: 'INBOUND' | 'OUTBOUND'
) =>
	catalogType === 'OUTBOUND' &&
	(node.parentId === null || typeof node.parentId === 'undefined') &&
	OUTBOUND_PROTECTED_ROOT_NODE_NAMES.includes(
		node.name as OutboundProtectedRootNodeName
	);

function countNodes(nodes: ArboristNode[]): number {
	return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

const ROW_HEIGHT = 56;

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
	const treeHeight = Math.max(countNodes(treeData) * ROW_HEIGHT, ROW_HEIGHT);

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
		const isProtected = isProtectedDefaultNode(nodeData, catalogType);
		setModal({ open: true, editNode: nodeData, isProtected });
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
		const isAbandoned = Boolean(nodeData.isAbandoned);
		const contactOutcome = nodeData.contactOutcome ?? null;
		const contactOutcomeBadge = contactOutcome
			? ((
					{
						EFFECTIVE: {
							color: 'green',
							label: t('form.fields.contactOutcomeEffective'),
						},
						NOT_EFFECTIVE: {
							color: 'red',
							label: t('form.fields.contactOutcomeNotEffective'),
						},
						NO_CONTACT: {
							color: 'gray',
							label: t('form.fields.contactOutcomeNoContact'),
						},
					} as Record<string, { color: string; label: string }>
				)[contactOutcome] ?? null)
			: null;
		const nodeTypeLabel = hasChildren
			? t('catalog.nodeType.group')
			: t('catalog.nodeType.outcome');
		const isLastChild = node.parent?.children
			? node.parent.children[node.parent.children.length - 1]?.id === node.id
			: true;
		const indent = node.level * 24;
		const connectorX = node.level > 0 ? (node.level - 1) * 24 + 12 : 0;
		const rowStyle: NodeRowStyle = {
			paddingLeft: `${12 + indent}px`,
			'--connector-x': `${connectorX}px`,
		};

		return (
			<div style={style}>
				<div
					className={[
						styles.nodeRow,
						isInactive ? styles.nodeRowInactive : '',
						isProtectedNode ? styles.nodeRowProtected : '',
					]
						.filter(Boolean)
						.join(' ')}
					data-level={node.level}
					data-is-last={isLastChild ? 'true' : 'false'}
					style={rowStyle}
					tabIndex={0}
					aria-label={node.data.name}
				>
					<span
						className={styles.nodeAccent}
						data-active={nodeData.isActive !== false ? 'true' : 'false'}
					/>
					<span className={styles.nodeToggle}>
						{hasChildren ? (
							<ActionIcon
								size='xs'
								variant='subtle'
								color='gray'
								onClick={(event) => {
									event.stopPropagation();
									node.toggle();
								}}
								aria-label={
									isOpen
										? t('catalog.actions.collapse')
										: t('catalog.actions.expand')
								}
							>
								{isOpen ? (
									<IconChevronDown size={14} />
								) : (
									<IconChevronRight size={14} />
								)}
							</ActionIcon>
						) : null}
					</span>
					<span className={styles.nodeIcon}>
						{hasChildren ? (
							<IconFolder
								size={16}
								color={
									isInactive
										? 'var(--mantine-color-gray-4)'
										: 'var(--mantine-color-yellow-6)'
								}
							/>
						) : (
							<IconFileDescription
								size={16}
								color={
									isInactive
										? 'var(--mantine-color-gray-4)'
										: 'var(--mantine-color-blue-5)'
								}
							/>
						)}
					</span>
					<div className={styles.nodeBody}>
						<div className={styles.nodeNameRow}>
							<Text className={styles.nodeName} size='sm' fw={500}>
								{node.data.name}
							</Text>
							{isProtectedNode && (
								<IconLock
									size={11}
									color='var(--mantine-color-gray-4)'
									aria-label='Protected'
								/>
							)}
							{node.data.description && (
								<Tooltip label={node.data.description} withArrow>
									<span style={{ display: 'inline-flex', cursor: 'default' }}>
										<IconHelpCircle
											size={12}
											color='var(--mantine-color-gray-4)'
										/>
									</span>
								</Tooltip>
							)}
							<div className={styles.nodeBadges}>
								<Badge size='xs' variant='light' color='blue' radius='xl'>
									{nodeTypeLabel}
								</Badge>
								{isInactive && (
									<Badge size='xs' variant='light' color='gray' radius='xl'>
										{t('catalog.labels.inactive')}
									</Badge>
								)}
								{isDoNotCall && (
									<Tooltip
										label={t('catalog.labels.doNotCallTooltip')}
										withArrow
									>
										<Badge size='xs' variant='light' color='red' radius='xl'>
											{t('catalog.labels.doNotCall')}
										</Badge>
									</Tooltip>
								)}
								{isAbandoned && (
									<Badge size='xs' variant='light' color='orange' radius='xl'>
										{t('catalog.labels.abandoned')}
									</Badge>
								)}
								{contactOutcomeBadge && (
									<Badge
										size='xs'
										variant='light'
										color={contactOutcomeBadge.color}
										radius='xl'
									>
										{contactOutcomeBadge.label}
									</Badge>
								)}
							</div>
						</div>
						<Text className={styles.nodeMeta} size='xs'>
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
								<IconGripVertical size={14} />
							</div>
						)}
						<ActionIcon.Group className={styles.nodeActions}>
							{isInactive
								? canUpdate && (
										<Tooltip label={t('catalog.actions.reactivate')} withArrow>
											<ActionIcon
												size='xs'
												variant='light'
												color='green'
												onClick={(event) => {
													event.stopPropagation();
													handleReactivateNode(nodeData);
												}}
											>
												<IconRefresh size={13} />
											</ActionIcon>
										</Tooltip>
									)
								: canUpdate && (
										<Tooltip label={t('catalog.actions.deactivate')} withArrow>
											<ActionIcon
												size='xs'
												variant='subtle'
												onClick={(event) => {
													event.stopPropagation();
													handleDeactivateNode(nodeData);
												}}
											>
												<IconBan size={13} />
											</ActionIcon>
										</Tooltip>
									)}
							{canUpdate && (
								<Tooltip label={t('catalog.actions.edit')} withArrow>
									<ActionIcon
										size='xs'
										variant='subtle'
										onClick={(event) => {
											event.stopPropagation();
											handleEditNode(nodeData);
										}}
									>
										<IconPencil size={13} />
									</ActionIcon>
								</Tooltip>
							)}
							{canCreate && (
								<Tooltip label={t('catalog.actions.addChild')} withArrow>
									<ActionIcon
										size='xs'
										variant='subtle'
										onClick={(event) => {
											event.stopPropagation();
											setModal({ open: true, parentId: nodeData.id });
										}}
									>
										<IconPlus size={13} />
									</ActionIcon>
								</Tooltip>
							)}
							{!isProtectedNode && canDelete && (
								<Tooltip label={t('catalog.actions.delete')} withArrow>
									<ActionIcon
										size='xs'
										variant='light'
										color='red'
										onClick={(event) => {
											event.stopPropagation();
											handleDeleteNode(nodeData);
										}}
									>
										<IconTrash size={13} />
									</ActionIcon>
								</Tooltip>
							)}
						</ActionIcon.Group>
						<Menu shadow='md' width={180} withinPortal>
							<Menu.Target>
								<ActionIcon
									size='xs'
									variant='subtle'
									className={styles.nodeActionsMobile}
									aria-label='Open node actions'
									onClick={(event) => event.stopPropagation()}
								>
									<IconDotsVertical size={14} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown onClick={(event) => event.stopPropagation()}>
								{isInactive
									? canUpdate && (
											<Menu.Item
												leftSection={<IconRefresh size={14} />}
												onClick={() => handleReactivateNode(nodeData)}
											>
												{t('catalog.actions.reactivate')}
											</Menu.Item>
										)
									: canUpdate && (
											<Menu.Item
												leftSection={<IconBan size={14} />}
												onClick={() => handleDeactivateNode(nodeData)}
											>
												{t('catalog.actions.deactivate')}
											</Menu.Item>
										)}
								{canUpdate && (
									<Menu.Item
										leftSection={<IconPencil size={14} />}
										onClick={() => handleEditNode(nodeData)}
									>
										{t('actions.edit', { ns: 'common' })}
									</Menu.Item>
								)}
								{canCreate && (
									<Menu.Item
										leftSection={<IconPlus size={14} />}
										onClick={() =>
											setModal({ open: true, parentId: nodeData.id })
										}
									>
										{t('catalog.actions.addChild')}
									</Menu.Item>
								)}
								{!isProtectedNode && canDelete && (
									<Menu.Item
										leftSection={<IconTrash size={14} />}
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
		);
	}

	return (
		<>
			<Stack gap='xs'>
				{isError && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title={t('catalog.errorBanner')}
						color='red'
						variant='light'
					>
						{error?.message ?? t('catalog.errorDescription')}
					</Alert>
				)}
				{isLoading ? (
					<div className={styles.skeletonStack}>
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} height={48} radius='sm' animate />
						))}
					</div>
				) : treeData.length > 0 ? (
					<div className={styles.treeWrapper}>
						<Tree
							data={treeData}
							openByDefault={true}
							childrenAccessor='children'
							idAccessor='id'
							rowHeight={ROW_HEIGHT}
							height={treeHeight}
							width='100%'
							className={styles.treeRoot}
						>
							{Node}
						</Tree>
					</div>
				) : (
					<div className={styles.emptyState}>
						<Center>
							<IconFolder size={48} color='#c3cad4' />
						</Center>
						<Text size='sm' fw={600} c='dimmed' mt='xs' ta='center'>
							{t('catalog.emptyState')}
						</Text>
						<Text size='xs' c='dimmed' ta='center' mt={4}>
							{t(
								'catalog.emptyStateHint',
								'Add a root outcome node to get started.'
							)}
						</Text>
					</div>
				)}
				{canCreate && (
					<Button
						fullWidth
						variant='light'
						color='blue'
						leftSection={<IconPlus size={16} />}
						size='sm'
						onClick={() => setModal({ open: true })}
					>
						{t('catalog.addRoot')}
					</Button>
				)}
			</Stack>
			<DispositionNodeForm
				opened={modal.open}
				onClose={() => setModal({ open: false })}
				initialValues={modal.editNode}
				catalogType={catalogType}
				protectedMode={modal.isProtected}
				hasChildren={
					modal.editNode
						? (findNodeInTree(treeData, modal.editNode.id.toString())?.children
								.length ?? 0) > 0
						: false
				}
				onSubmit={async (values) => {
					if (!catalogId) return;
					const { applyContactOutcomeToDescendants, ...apiValues } = values;
					if (modal.editNode) {
						const payload = modal.isProtected
							? { contactOutcome: apiValues.contactOutcome }
							: apiValues;
						await updateNode.mutateAsync({
							id: modal.editNode.id,
							data: payload,
						});
						if (applyContactOutcomeToDescendants && apiValues.contactOutcome) {
							const targetNode = findNodeInTree(
								treeData,
								modal.editNode.id.toString()
							);
							if (targetNode) {
								const descendantIds = collectAllDescendantIds(targetNode);
								await Promise.all(
									descendantIds.map((id) =>
										updateNode.mutateAsync({
											id,
											data: { contactOutcome: apiValues.contactOutcome },
										})
									)
								);
							}
						}
						await reloadCatalogs();
					} else {
						await createNode.mutateAsync({
							data: {
								...apiValues,
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
