import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type MouseEvent as ReactMouseEvent,
	type RefObject,
} from 'react';
import {
	NodeResizer,
	Panel,
	useReactFlow,
	type NodeProps,
} from '@xyflow/react';
import { Popover, Portal, ScrollArea, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconCopy,
	IconChevronDown,
	IconChevronUp,
	IconEdit,
	IconPackageImport,
	IconPhone,
	IconPlus,
	IconPalette,
	IconSearch,
	IconSquareRoundedCheck,
	IconTool,
	IconTrash,
	IconUnlink,
	IconUserCircle,
	IconUserCog,
} from '@tabler/icons-react';
import { useWorkflowCanvasActions } from '../../WorkflowCanvas/WorkflowCanvasActionsContext';
import { useWorkflowNodeEditor } from '../../WorkflowNodeEditorContext';
import { WORKFLOW_NODE_TYPES, type WorkflowNodeType } from '../../nodeTypes';
import GroupColorPopover from './GroupColorPopover';
import styles from './GroupNode.module.css';

/**
 * Convert a hex color string to an rgba() value with the given alpha.
 * Handles both 3-char (#abc) and 6-char (#aabbcc) hex formats.
 */
const hexToRgba = (hex: string, alpha: number): string => {
	const cleaned = hex.replace('#', '');
	const fullHex =
		cleaned.length === 3
			? cleaned
					.split('')
					.map((c) => c + c)
					.join('')
			: cleaned;
	const r = parseInt(fullHex.slice(0, 2), 16);
	const g = parseInt(fullHex.slice(2, 4), 16);
	const b = parseInt(fullHex.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Compute relative luminance and return white or dark text for contrast.
 */
const getContrastTextForHex = (hex: string): string => {
	const cleaned = hex.replace('#', '');
	const full =
		cleaned.length === 3
			? cleaned
					.split('')
					.map((c) => c + c)
					.join('')
			: cleaned;
	const r = parseInt(full.slice(0, 2), 16) / 255;
	const g = parseInt(full.slice(2, 4), 16) / 255;
	const b = parseInt(full.slice(4, 6), 16) / 255;
	const luminance =
		0.2126 * (r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4) +
		0.7152 * (g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4) +
		0.0722 * (b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4);
	return luminance > 0.4 ? 'rgba(0, 0, 0, 0.85)' : '#ffffff';
};

/**
 * Derive CSS custom properties for a group node from its persisted color.
 * Uses rgba() for proper alpha blending in both light and dark mode.
 * Label badge gets a high-opacity background so text is always readable.
 */
const buildGroupColorVars = (bgColor?: string): CSSProperties | undefined => {
	if (!bgColor) return undefined;

	return {
		'--workflow-group-bg': hexToRgba(bgColor, 0.07),
		'--workflow-group-border': hexToRgba(bgColor, 0.45),
		'--workflow-group-border-selected': hexToRgba(bgColor, 0.7),
		'--workflow-group-ring': hexToRgba(bgColor, 0.15),
		'--workflow-group-label-bg': hexToRgba(bgColor, 0.88),
		'--workflow-group-label-border': hexToRgba(bgColor, 0.55),
		'--workflow-group-label-text': getContrastTextForHex(bgColor),
		'--workflow-group-text': bgColor,
	} as CSSProperties;
};

const GroupNode = (props: NodeProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const {
		deleteNode,
		ungroupNodes,
		cloneGroup,
		addNewNodeToGroup,
		addExistingNodeToGroup,
	} = useWorkflowCanvasActions();
	const { openNodeDrawer } = useWorkflowNodeEditor();
	const { setNodes, getNodes } = useReactFlow();
	const nodeData = props.data as {
		label?: string;
		color?: string;
		type?: string;
		[key: string]: unknown;
	};
	const colorVars = buildGroupColorVars(nodeData.color || undefined);
	const label = nodeData.label || t('form.workflow.group.defaultLabel');
	type NewNodeMenuItemTone = 'blue' | 'teal' | 'orange' | 'gray' | 'green';
	type NewNodeMenuItem = {
		type: WorkflowNodeType;
		label: string;
		tone: NewNodeMenuItemTone;
		icon: typeof IconUserCircle;
		variant?: 'transfer' | 'subagent';
	};

	// ── Inline rename ──
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(label);
	const inputRef = useRef<HTMLInputElement>(null);

	// ── Right-click action menu ──
	const [contextMenuPosition, setContextMenuPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const contextMenuRef = useRef<HTMLDivElement>(
		null
	) as RefObject<HTMLDivElement | null>;

	// ── Add-existing searchable picker state ──
	const [addSubmenuOpen, setAddSubmenuOpen] = useState(false);
	const [addExistingOpened, setAddExistingOpened] = useState(false);
	const [addExistingSearch, setAddExistingSearch] = useState('');
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Sync editValue when external label changes (e.g. undo)
	useEffect(() => {
		if (!isEditing) setEditValue(label);
	}, [label, isEditing]);

	// Focus input when entering edit mode
	useEffect(() => {
		if (isEditing) {
			// Small delay for the DOM to mount the input
			requestAnimationFrame(() => inputRef.current?.select());
		}
	}, [isEditing]);

	useEffect(() => {
		if (!contextMenuPosition) {
			setAddExistingOpened(false);
			setAddExistingSearch('');
			return;
		}

		let active = false;
		const timer = window.setTimeout(() => {
			active = true;
		}, 0);

		const handler = (event: PointerEvent) => {
			if (!active) return;
			const target = event.target as HTMLElement | null;
			if (
				target?.closest(
					'[data-group-node-context-menu], .mantine-Menu-dropdown, .mantine-Popover-dropdown'
				)
			) {
				return;
			}
			if (
				contextMenuRef.current &&
				!contextMenuRef.current.contains(event.target as globalThis.Node)
			) {
				setContextMenuPosition(null);
			}
		};

		document.addEventListener('pointerdown', handler, true);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener('pointerdown', handler, true);
		};
	}, [contextMenuPosition]);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setContextMenuPosition(null);
			}
		};

		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	const commitRename = useCallback(() => {
		const trimmed = editValue.trim();
		const finalLabel = trimmed || t('form.workflow.group.defaultLabel');
		setNodes((nodes) =>
			nodes.map((n) =>
				n.id === props.id ? { ...n, data: { ...n.data, label: finalLabel } } : n
			)
		);
		setIsEditing(false);
	}, [editValue, props.id, setNodes, t]);

	const cancelRename = useCallback(() => {
		setEditValue(label);
		setIsEditing(false);
	}, [label]);

	// ── New-node submenu items (same pattern as WorkflowNodeActions) ──
	const newNodeMenuItems = useMemo<NewNodeMenuItem[]>(
		() => [
			{
				type: WORKFLOW_NODE_TYPES.OVERRIDE_AGENT,
				label: t('form.workflow.nodeMenu.agent'),
				tone: 'blue' as const,
				icon: IconUserCircle,
			},
			{
				type: WORKFLOW_NODE_TYPES.STANDALONE_AGENT,
				variant: 'transfer' as const,
				label: t('form.workflow.nodeMenu.agentTransfer'),
				tone: 'teal' as const,
				icon: IconUserCog,
			},
			{
				type: WORKFLOW_NODE_TYPES.UPDATE_STATE,
				label: t('form.workflow.nodeMenu.updateState'),
				tone: 'blue' as const,
				icon: IconEdit,
			},
			{
				type: WORKFLOW_NODE_TYPES.PHONE_NUMBER,
				label: t('form.workflow.nodeMenu.phoneNumber'),
				tone: 'orange' as const,
				icon: IconPhone,
			},
			{
				type: WORKFLOW_NODE_TYPES.TOOL,
				label: t('form.workflow.nodeMenu.tool'),
				tone: 'gray' as const,
				icon: IconTool,
			},
			{
				type: WORKFLOW_NODE_TYPES.END,
				label: t('form.workflow.nodeMenu.end'),
				tone: 'green' as const,
				icon: IconSquareRoundedCheck,
			},
		],
		[t]
	);

	// ── Available ungrouped nodes for "Add existing" menu ──
	const availableNodes = useMemo(() => {
		const allNodes = getNodes();
		const EXCLUDED: Set<string> = new Set([
			WORKFLOW_NODE_TYPES.START,
			WORKFLOW_NODE_TYPES.END,
			WORKFLOW_NODE_TYPES.GROUP,
		]);
		return allNodes.filter((n) => !n.parentId && !EXCLUDED.has(n.type ?? ''));
	}, [getNodes]);

	const filteredNodes = useMemo(() => {
		const query = addExistingSearch.toLowerCase().trim();
		if (!query) return availableNodes;
		return availableNodes.filter((n) => {
			const nodeLabel = (n.data as { label?: string }).label || n.type || n.id;
			return nodeLabel.toLowerCase().includes(query);
		});
	}, [availableNodes, addExistingSearch]);

	useEffect(() => {
		if (addExistingOpened) {
			requestAnimationFrame(() => searchInputRef.current?.focus());
		} else {
			setAddExistingSearch('');
		}
	}, [addExistingOpened]);

	const handleLabelKeyDown = useCallback(
		(e: ReactKeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				commitRename();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				cancelRename();
			}
		},
		[commitRename, cancelRename]
	);

	const closeContextMenu = useCallback(() => {
		setContextMenuPosition(null);
		setAddExistingOpened(false);
		setAddSubmenuOpen(false);
	}, []);

	const handleContextMenu = useCallback((event: ReactMouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		setContextMenuPosition({ x: event.clientX, y: event.clientY });
	}, []);

	const contextMenuStyle = useMemo(() => {
		if (!contextMenuPosition) return undefined;
		const width = 280;
		const height = 320;
		const left = Math.min(
			contextMenuPosition.x,
			window.innerWidth - width - 12
		);
		const top = Math.min(
			contextMenuPosition.y,
			window.innerHeight - height - 12
		);
		return {
			left: Math.max(12, left),
			top: Math.max(12, top),
		};
	}, [contextMenuPosition]);

	const getToneClass = (tone: NewNodeMenuItemTone) => {
		switch (tone) {
			case 'blue':
				return styles.submenuItemBlue;
			case 'teal':
				return styles.submenuItemTeal;
			case 'orange':
				return styles.submenuItemOrange;
			case 'green':
				return styles.submenuItemGreen;
			case 'gray':
			default:
				return styles.submenuItemGray;
		}
	};

	return (
		<>
			<NodeResizer
				isVisible={props.selected ?? false}
				minWidth={200}
				minHeight={120}
				handleClassName={styles.resizeHandle}
			/>
			<div
				className={styles.groupNode}
				onContextMenu={handleContextMenu}
				// inline-style-allow: group color vars must be set inline from persisted NodeStyle
				style={colorVars}
			>
				<Panel position='top-left' className={styles.labelBadge}>
					{isEditing ? (
						<TextInput
							ref={inputRef}
							size='xs'
							variant='unstyled'
							value={editValue}
							onChange={(e) => setEditValue(e.currentTarget.value)}
							onBlur={commitRename}
							onKeyDown={handleLabelKeyDown}
							placeholder={t('form.workflow.group.renamePlaceholder')}
							className={`${styles.labelInput} nodrag nopan`}
							classNames={{ input: styles.labelInputField }}
						/>
					) : (
						<Text size='xs' className={styles.labelText} lineClamp={1}>
							{label}
						</Text>
					)}
				</Panel>
			</div>

			{contextMenuPosition && (
				<Portal>
					<div
						ref={contextMenuRef}
						data-group-node-context-menu
						className={`${styles.menu} nodrag nopan`}
						// inline-style-allow: positioned at the cursor and clamped in runtime
						style={contextMenuStyle}
						onContextMenu={(event) => event.preventDefault()}
					>
						<div className={styles.section}>
							{t('form.workflow.contextMenu.actions', {
								defaultValue: 'Actions',
							})}
						</div>

						<button
							type='button'
							className={`${styles.item} ${styles.itemPrimary}`}
							onClick={() => setAddSubmenuOpen((value) => !value)}
						>
							<span className={styles.itemIcon}>
								<IconPlus size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.group.addNewNode')}
							</span>
							<span className={styles.itemChevron}>
								{addSubmenuOpen ? (
									<IconChevronUp size={12} />
								) : (
									<IconChevronDown size={12} />
								)}
							</span>
						</button>

						{addSubmenuOpen && (
							<div className={styles.submenuPanel}>
								<div className={styles.submenuGrid}>
									{newNodeMenuItems.map((item) => {
										const toneClass = getToneClass(item.tone);

										return (
											<button
												key={`${item.type}-${item.label}`}
												type='button'
												className={`${styles.submenuItem} ${toneClass}`}
												onClick={() => {
													const newNodeId = addNewNodeToGroup(
														props.id,
														item.type,
														item.variant
													);
													if (
														item.type === WORKFLOW_NODE_TYPES.UPDATE_STATE &&
														newNodeId
													) {
														openNodeDrawer(newNodeId);
													}
													closeContextMenu();
												}}
											>
												<span className={styles.submenuItemIcon}>
													<item.icon size={14} />
												</span>
												<span className={styles.submenuItemLabel}>
													{item.label}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						)}

						<Popover
							opened={addExistingOpened}
							onChange={setAddExistingOpened}
							position='right-start'
							withinPortal
							shadow='md'
							radius='md'
							width={260}
							offset={6}
							trapFocus
						>
							<Popover.Target>
								<button
									type='button'
									className={styles.item}
									onClick={() => setAddExistingOpened((o) => !o)}
								>
									<span className={styles.itemIcon}>
										<IconPackageImport size={14} />
									</span>
									<span className={styles.itemLabel}>
										{t('form.workflow.group.addExistingNode')}
									</span>
								</button>
							</Popover.Target>
							<Popover.Dropdown
								className={styles.menuDropdown}
								onClick={(e) => e.stopPropagation()}
							>
								<TextInput
									ref={searchInputRef}
									size='xs'
									placeholder={t('form.workflow.group.searchNodes')}
									leftSection={<IconSearch size={14} />}
									value={addExistingSearch}
									onChange={(e) => setAddExistingSearch(e.currentTarget.value)}
									mb={6}
									radius='sm'
									className='nodrag nopan'
								/>
								<ScrollArea.Autosize mah={200} type='scroll' scrollbarSize={6}>
									{filteredNodes.length === 0 ? (
										<Text size='xs' c='dimmed' ta='center' py='xs'>
											{t('form.workflow.group.noAvailableNodes')}
										</Text>
									) : (
										filteredNodes.map((node) => (
											<button
												key={node.id}
												type='button'
												className={styles.nodePickerItem}
												onClick={() => {
													addExistingNodeToGroup(props.id, node.id);
													setAddExistingOpened(false);
													closeContextMenu();
												}}
											>
												<Text size='xs' fw={500} truncate>
													{(node.data as { label?: string }).label ||
														node.type ||
														node.id}
												</Text>
												<Text size='xs' c='dimmed'>
													{node.type}
												</Text>
											</button>
										))
									)}
								</ScrollArea.Autosize>
							</Popover.Dropdown>
						</Popover>

						<GroupColorPopover
							nodeId={props.id}
							currentColor={nodeData.color || undefined}
							trigger={
								<button type='button' className={styles.item}>
									<span className={styles.itemIcon}>
										<IconPalette size={14} />
									</span>
									<span className={styles.itemLabel}>
										{t('form.workflow.contextMenu.changeStyle', {
											defaultValue: 'Change color',
										})}
									</span>
								</button>
							}
						/>

						<div className={styles.divider} />

						<button
							type='button'
							className={styles.item}
							onClick={() => {
								cloneGroup(props.id);
								closeContextMenu();
							}}
						>
							<span className={styles.itemIcon}>
								<IconCopy size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.group.cloneGroup')}
							</span>
						</button>

						<button
							type='button'
							className={styles.item}
							onClick={() => {
								setIsEditing(true);
								closeContextMenu();
							}}
						>
							<span className={styles.itemIcon}>
								<IconEdit size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.group.rename')}
							</span>
						</button>

						<button
							type='button'
							className={styles.item}
							onClick={() => {
								ungroupNodes(props.id);
								closeContextMenu();
							}}
						>
							<span className={styles.itemIcon}>
								<IconUnlink size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.group.ungroup')}
							</span>
						</button>

						<div className={styles.divider} />

						<button
							type='button'
							className={`${styles.item} ${styles.itemDanger}`}
							onClick={() => {
								deleteNode(props.id);
								closeContextMenu();
							}}
						>
							<span className={styles.itemIcon}>
								<IconTrash size={14} />
							</span>
							<span className={styles.itemLabel}>
								{t('form.workflow.actions.delete')}
							</span>
						</button>
					</div>
				</Portal>
			)}
		</>
	);
};

export default memo(GroupNode);
