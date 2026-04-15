import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from 'react';
import {
	NodeResizer,
	Panel,
	useReactFlow,
	type NodeProps,
} from '@xyflow/react';
import {
	ActionIcon,
	Menu,
	Popover,
	ScrollArea,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconCopy,
	IconEdit,
	IconPackageImport,
	IconPhone,
	IconPlus,
	IconSearch,
	IconSquareRoundedCheck,
	IconTool,
	IconTrash,
	IconUnlink,
	IconUserCircle,
	IconUserCog,
} from '@tabler/icons-react';
import { useWorkflowCanvasActions } from '../../WorkflowCanvas/WorkflowCanvasActionsContext';
import { WORKFLOW_NODE_TYPES } from '../../nodeTypes';
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
	const { setNodes, getNodes } = useReactFlow();
	const nodeData = props.data as {
		label?: string;
		color?: string;
		type?: string;
		[key: string]: unknown;
	};
	const colorVars = buildGroupColorVars(nodeData.color || undefined);
	const label = nodeData.label || t('form.workflow.group.defaultLabel');

	// ── Inline rename ──
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(label);
	const inputRef = useRef<HTMLInputElement>(null);

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
	const newNodeMenuItems = useMemo(
		() => [
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

	// ── Add-existing searchable picker state ──
	const [addExistingOpened, setAddExistingOpened] = useState(false);
	const [addExistingSearch, setAddExistingSearch] = useState('');
	const searchInputRef = useRef<HTMLInputElement>(null);

	const filteredNodes = useMemo(() => {
		const query = addExistingSearch.toLowerCase().trim();
		if (!query) return availableNodes;
		return availableNodes.filter((n) => {
			const nodeLabel = (n.data as { label?: string }).label || n.type || n.id;
			return nodeLabel.toLowerCase().includes(query);
		});
	}, [availableNodes, addExistingSearch]);

	// Auto-focus search input when the popover opens
	useEffect(() => {
		if (addExistingOpened) {
			requestAnimationFrame(() => searchInputRef.current?.focus());
		} else {
			setAddExistingSearch('');
		}
	}, [addExistingOpened]);

	const handleLabelKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
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
						<Tooltip
							label={t('form.workflow.group.renameHint')}
							withArrow
							openDelay={500}
						>
							<Text
								size='xs'
								className={styles.labelText}
								lineClamp={1}
								onDoubleClick={() => setIsEditing(true)}
							>
								{label}
							</Text>
						</Tooltip>
					)}
				</Panel>

				{props.selected && (
					<div className={`${styles.sideActions} nodrag nopan`}>
						{/* ── New Node (submenu) ── */}
						<Menu position='right-start' withinPortal>
							<Menu.Target>
								<Tooltip
									label={t('form.workflow.group.addNewNode')}
									withArrow
									position='left'
								>
									<ActionIcon
										size='sm'
										variant='light'
										color='blue'
										radius='sm'
										className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
									>
										<IconPlus size={13} />
									</ActionIcon>
								</Tooltip>
							</Menu.Target>
							<Menu.Dropdown className={styles.menuDropdown}>
								<Menu.Label>{t('form.workflow.group.addNewNode')}</Menu.Label>
								{newNodeMenuItems.map((item) => (
									<Menu.Item
										key={`${item.type}-${item.label}`}
										leftSection={<item.icon size={16} />}
										onClick={() =>
											addNewNodeToGroup(props.id, item.type, item.variant)
										}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu.Dropdown>
						</Menu>

						{/* ── Add Existing Node (searchable picker) ── */}
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
								<Tooltip
									label={t('form.workflow.group.addExistingNode')}
									withArrow
									position='left'
								>
									<ActionIcon
										size='sm'
										variant='light'
										color='teal'
										radius='sm'
										onClick={() => setAddExistingOpened((o) => !o)}
										className={`${styles.actionButton} ${styles.actionButtonTeal}`}
									>
										<IconPackageImport size={13} />
									</ActionIcon>
								</Tooltip>
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

						{/* ── Color ── */}
						<GroupColorPopover
							nodeId={props.id}
							currentColor={nodeData.color || undefined}
						/>

						<div className={styles.actionDivider} />

						{/* ── Clone ── */}
						<Tooltip
							label={t('form.workflow.group.cloneGroup')}
							withArrow
							position='left'
						>
							<ActionIcon
								size='sm'
								variant='light'
								color='gray'
								radius='sm'
								onClick={() => cloneGroup(props.id)}
								className={styles.actionButton}
							>
								<IconCopy size={13} />
							</ActionIcon>
						</Tooltip>

						{/* ── Rename ── */}
						<Tooltip
							label={t('form.workflow.group.rename')}
							withArrow
							position='left'
						>
							<ActionIcon
								size='sm'
								variant='light'
								color='gray'
								radius='sm'
								onClick={() => setIsEditing(true)}
								className={styles.actionButton}
							>
								<IconEdit size={13} />
							</ActionIcon>
						</Tooltip>

						{/* ── Ungroup ── */}
						<Tooltip
							label={t('form.workflow.group.ungroup')}
							withArrow
							position='left'
						>
							<ActionIcon
								size='sm'
								variant='light'
								color='gray'
								radius='sm'
								onClick={() => ungroupNodes(props.id)}
								className={styles.actionButton}
							>
								<IconUnlink size={13} />
							</ActionIcon>
						</Tooltip>

						<div className={styles.actionDivider} />

						{/* ── Delete ── */}
						<Tooltip
							label={t('form.workflow.actions.delete')}
							withArrow
							position='left'
						>
							<ActionIcon
								size='sm'
								variant='light'
								color='red'
								radius='sm'
								onClick={() => deleteNode(props.id)}
								className={`${styles.actionButton} ${styles.actionButtonDanger}`}
							>
								<IconTrash size={13} />
							</ActionIcon>
						</Tooltip>
					</div>
				)}
			</div>
		</>
	);
};

export default memo(GroupNode);
