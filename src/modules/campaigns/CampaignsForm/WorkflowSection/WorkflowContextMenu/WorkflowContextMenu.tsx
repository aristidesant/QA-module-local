import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Portal } from '@mantine/core';
import { useStore } from '@xyflow/react';
import {
	IconChevronDown,
	IconChevronUp,
	IconCopy,
	IconPalette,
	IconPencil,
	IconPhone,
	IconPlus,
	IconSquareRoundedCheck,
	IconTool,
	IconTrash,
	IconUserCircle,
	IconUserCog,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	NODE_TYPE_CONFIG,
	WORKFLOW_NODE_TYPES,
	type WorkflowNodeType,
} from '../nodeTypes';
import { useWorkflowCanvasActions } from '../WorkflowCanvas/WorkflowCanvasActionsContext';
import { useWorkflowNodeEditor } from '../WorkflowNodeEditorContext';
import type { WorkflowNodeData } from '../WorkflowNode/WorkflowNodeTypes';
import type { WorkflowContextMenuProps } from './WorkflowContextMenu.types';
import styles from './WorkflowContextMenu.module.css';

const WorkflowContextMenu = ({
	x,
	y,
	nodeId,
	edgeId,
	onClose,
	onStyleClick,
}: WorkflowContextMenuProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const [addSubmenuOpen, setAddSubmenuOpen] = useState(false);

	const {
		addNodeWithType,
		addNodeWithVariant,
		deleteNode,
		copyNode,
		openEdge,
		deleteEdge,
	} = useWorkflowCanvasActions();
	const { openNodeDrawer } = useWorkflowNodeEditor();

	// Read node from React Flow store when nodeId is provided
	const node = useStore(
		useCallback(
			(s) => (nodeId ? s.nodes.find((n) => n.id === nodeId) : undefined),
			[nodeId]
		)
	);
	const nodeData = node?.data as WorkflowNodeData | undefined;
	const nodeType = (node?.type ?? nodeData?.type) as
		| WorkflowNodeType
		| undefined;

	const menuRef = useRef<HTMLDivElement>(null);

	// Close on outside click — use pointerdown with a timeout to skip the
	// opening right-click event itself (ReactFlow may re-fire it synchronously).
	useEffect(() => {
		let active = false;
		const timer = setTimeout(() => {
			active = true;
		}, 0);

		const handler = (e: PointerEvent) => {
			if (!active) return;
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as globalThis.Node)
			) {
				onClose();
			}
		};

		document.addEventListener('pointerdown', handler, true);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('pointerdown', handler, true);
		};
	}, [onClose]);

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	// Clamp menu to viewport
	const clampedPos = useMemo(() => {
		const MENU_W = 200;
		const MENU_H = 280;
		const left = x + MENU_W > window.innerWidth ? x - MENU_W : x;
		const top = y + MENU_H > window.innerHeight ? y - MENU_H : y;
		return { left, top };
	}, [x, y]);

	// --- Node menu logic ---
	const isStartNode = nodeType === WORKFLOW_NODE_TYPES.START;
	const isEndNode = nodeType === WORKFLOW_NODE_TYPES.END;
	const isTransferAgent =
		nodeData?.uiMeta?.variant === 'transfer' ||
		!!(nodeData as { agent_id?: string })?.agent_id;
	const isPhoneTransfer = nodeType === WORKFLOW_NODE_TYPES.PHONE_NUMBER;
	const edge_order = (nodeData?.edge_order as string[] | undefined) ?? [];
	const isStartConnected = isStartNode && edge_order.length > 0;
	const config = nodeType ? NODE_TYPE_CONFIG[nodeType] : undefined;

	const canEdit = !!nodeId && !isStartNode && !isEndNode;
	const canStyle = !!nodeId && !isStartNode && !isEndNode;
	const canAdd =
		!!nodeId &&
		(config?.hasAddButton ?? false) &&
		!isTransferAgent &&
		!isPhoneTransfer &&
		!isStartConnected;
	const canClone = !!nodeId && !isStartNode;
	const canDelete = !!nodeId && !isStartNode;

	const nodePosition = nodeData?.position as
		| { x: number; y: number }
		| undefined;

	const addMenuItems = useMemo(() => {
		const items = [
			{
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				label: t('form.workflow.nodeMenu.subagent'),
				icon: IconUserCircle,
			},
			{
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				variant: 'transfer' as const,
				label: t('form.workflow.nodeMenu.agentTransfer'),
				icon: IconUserCog,
			},
			{
				type: WORKFLOW_NODE_TYPES.UPDATE_STATE,
				label: t('form.workflow.nodeMenu.updateState'),
				icon: IconPencil,
			},
			{
				type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
				label: t('form.workflow.nodeMenu.phoneNumber'),
				icon: IconPhone,
			},
			{
				type: WORKFLOW_NODE_TYPES.TOOL,
				label: t('form.workflow.nodeMenu.tool'),
				icon: IconTool,
			},
			{
				type: WORKFLOW_NODE_TYPES.END,
				label: t('form.workflow.nodeMenu.end'),
				icon: IconSquareRoundedCheck,
			},
		];
		return isStartNode ? items.slice(0, 1) : items;
	}, [isStartNode, t]);

	const handleEdit = () => {
		if (!nodeId) return;
		openNodeDrawer(nodeId);
		onClose();
	};

	const handleStyle = () => {
		if (!nodeId) return;
		const label = typeof nodeData?.label === 'string' ? nodeData.label : '';
		onStyleClick?.(nodeId, label);
		onClose();
	};

	const handleAddWithType = (type: WorkflowNodeType) => {
		if (!nodeId || !nodePosition) return;
		const newId = addNodeWithType(nodeId, nodePosition, type);
		if (type === WORKFLOW_NODE_TYPES.UPDATE_STATE && newId) {
			openNodeDrawer(newId);
		}
		onClose();
	};

	const handleAddWithVariant = (
		type: WorkflowNodeType,
		variant: 'transfer' | 'subagent'
	) => {
		if (!nodeId || !nodePosition) return;
		addNodeWithVariant(nodeId, nodePosition, { type, variant });
		onClose();
	};

	const handleClone = () => {
		if (!nodeId) return;
		copyNode(nodeId);
		onClose();
	};

	const handleDelete = () => {
		if (!nodeId) return;
		deleteNode(nodeId);
		onClose();
	};

	// --- Edge menu logic ---
	const handleEdgeEdit = () => {
		if (!edgeId) return;
		openEdge(edgeId);
		onClose();
	};

	const handleEdgeDelete = () => {
		if (!edgeId) return;
		deleteEdge(edgeId);
		onClose();
	};

	// --- Render ---
	if (!nodeId && !edgeId) return null;

	return (
		<Portal>
			<div
				ref={menuRef}
				className={styles.menu}
				// inline-style-allow: portal positioned at runtime cursor coordinates clamped to viewport; cannot use CSS alone
				style={{ left: clampedPos.left, top: clampedPos.top }}
				onContextMenu={(e) => e.preventDefault()}
			>
				{/* ---- NODE MENU ---- */}
				{nodeId && (
					<>
						<div className={styles.section}>
							{t('form.workflow.contextMenu.actions', {
								defaultValue: 'Actions',
							})}
						</div>

						{canEdit && (
							<div
								className={`${styles.item} ${styles.itemPrimary}`}
								onClick={handleEdit}
							>
								<span className={styles.itemIcon}>
									<IconPencil size={14} />
								</span>
								<span className={styles.itemLabel}>
									{t('form.workflow.actions.edit')}
								</span>
							</div>
						)}

						{canStyle && (
							<div className={styles.item} onClick={handleStyle}>
								<span className={styles.itemIcon}>
									<IconPalette size={14} />
								</span>
								<span className={styles.itemLabel}>
									{t('form.workflow.contextMenu.changeStyle', {
										defaultValue: 'Change style',
									})}
								</span>
							</div>
						)}

						{canAdd && (
							<>
								<div
									className={styles.item}
									onClick={() => setAddSubmenuOpen((v) => !v)}
								>
									<span className={styles.itemIcon}>
										<IconPlus size={14} />
									</span>
									<span className={styles.itemLabel}>
										{t('form.workflow.contextMenu.addChild', {
											defaultValue: 'Add child node',
										})}
									</span>
									<span className={styles.itemChevron}>
										{addSubmenuOpen ? (
											<IconChevronUp size={12} />
										) : (
											<IconChevronDown size={12} />
										)}
									</span>
								</div>
								{addSubmenuOpen && (
									<div className={styles.submenuList}>
										{addMenuItems.map((item) => (
											<div
												key={`${item.type}-${'variant' in item ? item.variant : ''}`}
												className={styles.submenuItem}
												onClick={() => {
													if ('variant' in item && item.variant) {
														handleAddWithVariant(item.type, item.variant);
													} else {
														handleAddWithType(item.type);
													}
												}}
											>
												<item.icon size={13} />
												{item.label}
											</div>
										))}
									</div>
								)}
							</>
						)}

						{canClone && (
							<div className={styles.item} onClick={handleClone}>
								<span className={styles.itemIcon}>
									<IconCopy size={14} />
								</span>
								<span className={styles.itemLabel}>
									{t('form.workflow.actions.clone')}
								</span>
							</div>
						)}

						{canDelete && (
							<>
								<div className={styles.divider} />
								<div className={styles.section}>
									{t('form.workflow.contextMenu.danger', {
										defaultValue: 'Danger zone',
									})}
								</div>
								<div
									className={`${styles.item} ${styles.itemDanger}`}
									onClick={handleDelete}
								>
									<span className={styles.itemIcon}>
										<IconTrash size={14} />
									</span>
									<span className={styles.itemLabel}>
										{t('form.workflow.actions.delete')}
									</span>
								</div>
							</>
						)}
					</>
				)}

				{/* ---- EDGE MENU ---- */}
				{edgeId && !nodeId && (
					<>
						<div className={styles.section}>
							{t('form.workflow.contextMenu.actions', {
								defaultValue: 'Actions',
							})}
						</div>
						<div
							className={`${styles.item} ${styles.itemPrimary}`}
							onClick={handleEdgeEdit}
						>
							<span className={styles.itemIcon}>
								<IconPencil size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.contextMenu.editCondition', {
									defaultValue: 'Edit condition',
								})}
							</span>
						</div>
						<div className={styles.divider} />
						<div className={styles.section}>
							{t('form.workflow.contextMenu.danger', {
								defaultValue: 'Danger zone',
							})}
						</div>
						<div
							className={`${styles.item} ${styles.itemDanger}`}
							onClick={handleEdgeDelete}
						>
							<span className={styles.itemIcon}>
								<IconTrash size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.contextMenu.deleteEdge', {
									defaultValue: 'Delete edge',
								})}
							</span>
						</div>
					</>
				)}
			</div>
		</Portal>
	);
};

export default WorkflowContextMenu;
