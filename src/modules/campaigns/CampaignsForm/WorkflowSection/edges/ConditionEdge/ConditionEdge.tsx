import type { FC, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
	ActionIcon,
	Group,
	Paper,
	Portal,
	ScrollArea,
	Text,
} from '@mantine/core';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import {
	IconArrowLeft,
	IconArrowRight,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	ConditionEdgeData,
	StructuredConditionEdgeLabel,
	WarningLevel,
} from './ConditionEdge.types';
import {
	useIsEdgeActionsOpen,
	useWorkflowCanvasActions,
} from '../../WorkflowCanvas/WorkflowCanvasActionsContext';
import styles from './ConditionEdge.module.css';

const truncateEdgePrompt = (value: string, maxLength = 12): string => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength).trimEnd()}...`;
};

const FULL_TEXT_THRESHOLD = 20;

interface ChipWithPopoverProps {
	fullText: string;
	children: ReactNode;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChipClick?: (e: ReactMouseEvent<any>) => void;
}

/**
 * Wraps a chip with a click-to-reveal dropdown showing the full text.
 * Uses a document-level `mousedown` listener so the dropdown closes even when
 * the user clicks anywhere on the React Flow canvas (which stops propagation
 * at the pointer-events level, breaking Mantine Popover's outside-click).
 */
const ChipWithPopover: FC<ChipWithPopoverProps> = ({
	fullText,
	children,
	onChipClick,
}) => {
	const [opened, setOpened] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const needsPopover = fullText.length > FULL_TEXT_THRESHOLD;

	// Close on any mousedown outside the trigger + dropdown.
	// We use mousedown (not click) so it fires before React Flow's
	// stopPropagation handlers cancel further event bubbling.
	useEffect(() => {
		if (!opened) return;
		const handleMouseDown = (e: MouseEvent) => {
			const target = e.target as Node;
			if (
				triggerRef.current?.contains(target) ||
				dropdownRef.current?.contains(target)
			) {
				return;
			}
			setOpened(false);
		};
		document.addEventListener('mousedown', handleMouseDown, true);
		return () => {
			document.removeEventListener('mousedown', handleMouseDown, true);
		};
	}, [opened]);

	if (!needsPopover) {
		return (
			<div
				onClick={onChipClick}
				// inline-style-allow: inline-flex wrapper for clickable chip — no scoped CSS class available for anonymous wrapper
				style={{ display: 'inline-flex', alignItems: 'center' }}
			>
				{children}
			</div>
		);
	}

	// Compute fixed-position coordinates from the trigger element's bounding rect
	// so the dropdown stays correctly placed regardless of canvas transforms.
	const getDropdownStyle = (): React.CSSProperties => {
		const rect = triggerRef.current?.getBoundingClientRect();
		if (!rect) return { position: 'fixed', top: 0, left: 0 };
		return {
			position: 'fixed',
			// Place above the chip with an 8px gap
			bottom: window.innerHeight - rect.top + 8,
			left: rect.left + rect.width / 2,
			transform: 'translateX(-50%)',
			zIndex: 9999,
			minWidth: 220,
			maxWidth: 300,
		};
	};

	return (
		<>
			{/* inline-style-allow: trigger div needs inline-flex and cursor — anonymous wrapper with no viable CSS Modules alternative */}
			<div
				ref={triggerRef}
				onClick={(e) => {
					e.stopPropagation();
					setOpened((prev) => !prev);
				}}
				// inline-style-allow: trigger div needs inline-flex and cursor — anonymous wrapper with no viable CSS Modules alternative
				style={{
					cursor: 'pointer',
					display: 'inline-flex',
					alignItems: 'center',
				}}
			>
				{children}
			</div>
			{opened && (
				<Portal>
					<Paper
						ref={dropdownRef}
						shadow='md'
						radius='sm'
						p='xs'
						withBorder
						// inline-style-allow: dropdown position is computed at runtime from getBoundingClientRect — cannot be expressed in static CSS
						style={getDropdownStyle()}
						onClick={(e) => e.stopPropagation()}
					>
						<ScrollArea.Autosize mah={180} scrollbarSize={6}>
							<Text
								size='xs'
								// inline-style-allow: whiteSpace and wordBreak have no Mantine Text prop equivalent
								style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
							>
								{fullText}
							</Text>
						</ScrollArea.Autosize>
					</Paper>
				</Portal>
			)}
		</>
	);
};

const ConditionEdge: FC<EdgeProps> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	data,
	markerEnd,
}) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const { openEdge, deleteEdge, toggleEdgeActions } =
		useWorkflowCanvasActions();
	const isActionsOpen = useIsEdgeActionsOpen(id);
	// Build a smooth cubic Bezier path between source and target.
	// This keeps the edge visually smooth and lets us compute exact
	// positions along the curve using the SVG path API.
	const curvature = 0.5; // fraction of dx used for control points
	const dx = targetX - sourceX;
	const dy = targetY - sourceY;
	// reference positions to satisfy linter (they may be useful later)
	void sourcePosition;
	void targetPosition;

	const cx1 = sourceX + dx * curvature;
	const cy1 = sourceY;
	const cx2 = targetX - dx * curvature;
	const cy2 = targetY;

	const edgePath = `M ${sourceX},${sourceY} C ${cx1},${cy1} ${cx2},${cy2} ${targetX},${targetY}`;

	// Default label position is the midpoint between source and target.
	// We'll try to compute a better position using the path midpoint below.
	let labelX = sourceX + dx * 0.5;
	let labelY = sourceY + dy * 0.5;

	// Compute midpoint and tangent directly from cubic Bezier control points.
	// This avoids any DOM/SVG coordinate mismatches and is deterministic.
	try {
		const t = 0.5;
		const mt = 1 - t;

		// Cubic Bezier point at t: B(t) = (1-t)^3 * P0 + 3(1-t)^2 t * P1 + 3(1-t)t^2 * P2 + t^3 * P3
		const midX =
			mt * mt * mt * sourceX +
			3 * mt * mt * t * cx1 +
			3 * mt * t * t * cx2 +
			t * t * t * targetX;
		const midY =
			mt * mt * mt * sourceY +
			3 * mt * mt * t * cy1 +
			3 * mt * t * t * cy2 +
			t * t * t * targetY;

		// Derivative B'(t) gives tangent vector: B'(t) = 3(1-t)^2 (P1-P0) + 6(1-t)t (P2-P1) + 3 t^2 (P3-P2)
		const tx =
			3 * mt * mt * (cx1 - sourceX) +
			6 * mt * t * (cx2 - cx1) +
			3 * t * t * (targetX - cx2);
		const ty =
			3 * mt * mt * (cy1 - sourceY) +
			6 * mt * t * (cy2 - cy1) +
			3 * t * t * (targetY - cy2);
		const mag = Math.sqrt(tx * tx + ty * ty) || 1;
		const nx = -ty / mag;
		const ny = tx / mag;

		const offset = 0; // keep label exactly on the path midpoint
		labelX = midX + nx * offset;
		labelY = midY + ny * offset;
	} catch (err) {
		// fallback to linear midpoint already set above
	}

	const edgeData = (data ?? {}) as ConditionEdgeData;
	const label = typeof edgeData.label === 'string' ? edgeData.label : null;
	const structuredLabel =
		edgeData.label && typeof edgeData.label === 'object'
			? (edgeData.label as StructuredConditionEdgeLabel)
			: null;
	const hasStructuredLabel =
		!!structuredLabel?.forwardLabel && !!structuredLabel?.backwardLabel;
	const forwardCondition = edgeData.forwardCondition;
	const backwardCondition = edgeData.backwardCondition;
	const hasForwardCondition = edgeData.forwardCondition !== undefined;
	const hasBackwardCondition = edgeData.backwardCondition !== undefined;
	const hasSingleCondition = hasForwardCondition !== hasBackwardCondition;
	const singleConditionDirection = hasSingleCondition
		? hasForwardCondition
			? 'forward'
			: 'backward'
		: null;
	const warningLevel = (edgeData.warningLevel ?? 'none') as WarningLevel;
	const suppressLabel = edgeData.sourceNodeType === 'start';
	const isInteractive = true;
	const promptLabel =
		forwardCondition?.type === 'llm' &&
		typeof forwardCondition.condition === 'string' &&
		!forwardCondition.label
			? forwardCondition.condition.trim()
			: backwardCondition?.type === 'llm' &&
				  typeof backwardCondition.condition === 'string' &&
				  !backwardCondition.label
				? backwardCondition.condition.trim()
				: null;
	const displayLabel =
		hasStructuredLabel || suppressLabel
			? null
			: promptLabel
				? truncateEdgePrompt(promptLabel)
				: label;

	const handleEdgeClick = (
		event: ReactMouseEvent<SVGPathElement | HTMLDivElement>
	) => {
		event.stopPropagation();
		toggleEdgeActions(id);
	};

	// Get stroke color based on warning level
	const getStrokeColor = (): string => {
		switch (warningLevel) {
			case 'error':
				return '#d9480f'; // Mantine red-6
			case 'warning':
				return '#ff922b'; // Mantine orange-6
			default:
				return '#868e96'; // Default gray
		}
	};

	const strokeColor = getStrokeColor();
	const shouldUseDirectionalLabel = hasStructuredLabel || hasSingleCondition;
	const isSourceBeforeTarget =
		sourceX < targetX || (sourceX === targetX && sourceY <= targetY);
	const ForwardIcon = isSourceBeforeTarget ? IconArrowRight : IconArrowLeft;
	const BackwardIcon = isSourceBeforeTarget ? IconArrowLeft : IconArrowRight;
	const forwardMarker = isSourceBeforeTarget ? markerEnd : markerEnd;
	const backwardMarker = isSourceBeforeTarget ? markerEnd : markerEnd;
	const startMarker =
		hasForwardCondition && hasBackwardCondition
			? backwardMarker
			: hasBackwardCondition
				? backwardMarker
				: undefined;
	const endMarker =
		hasForwardCondition && hasBackwardCondition
			? forwardMarker
			: hasForwardCondition
				? forwardMarker
				: undefined;

	// Get label style class based on warning level
	const getLabelClassName = (): string => {
		const baseClasses = [
			styles.label,
			shouldUseDirectionalLabel ? styles.labelStructured : '',
		];
		const warningClasses =
			warningLevel === 'error'
				? styles.labelError
				: warningLevel === 'warning'
					? styles.labelWarning
					: '';
		const clickableClasses = isInteractive ? styles.labelClickable : '';
		return [...baseClasses, warningClasses, clickableClasses]
			.filter(Boolean)
			.join(' ');
	};

	return (
		<>
			{isInteractive && (
				<path
					d={edgePath}
					fill='none'
					stroke='transparent'
					strokeWidth={16}
					className={styles.edgeInteraction}
					onClick={handleEdgeClick}
				/>
			)}
			<BaseEdge
				id={id}
				path={edgePath}
				style={{
					stroke: strokeColor,
					strokeWidth: 2,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
				}}
				markerStart={startMarker}
				markerEnd={endMarker}
			/>
			{isActionsOpen && (
				<EdgeLabelRenderer>
					<Group
						gap={4}
						wrap='nowrap'
						className={styles.actions}
						style={{
							zIndex: 220,
							transform: `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, calc(-100% - 8px))`,
						}}
						onClick={(event) => event.stopPropagation()}
					>
						<ActionIcon
							size='sm'
							variant='light'
							color='gray'
							radius='sm'
							title={t('common:actions.edit', { defaultValue: 'Edit' })}
							className={styles.actionButton}
							onClick={(event) => {
								event.stopPropagation();
								openEdge(id);
							}}
						>
							<IconPencil size={13} />
						</ActionIcon>
						<ActionIcon
							size='sm'
							variant='light'
							color='red'
							radius='sm'
							title={t('common:actions.delete', { defaultValue: 'Delete' })}
							className={styles.actionButton}
							onClick={(event) => {
								event.stopPropagation();
								deleteEdge(id);
							}}
						>
							<IconTrash size={13} />
						</ActionIcon>
					</Group>
				</EdgeLabelRenderer>
			)}
			{!suppressLabel && (displayLabel || shouldUseDirectionalLabel) && (
				<EdgeLabelRenderer>
					<div
						className={getLabelClassName()}
						style={{
							zIndex: 160,
							// Apply translation to coordinates first, then center the label element.
							// Swapping the order avoids centering being applied in a different
							// transformed context which can push the label off the path.
							transform: `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, -50%)`,
						}}
					>
						{hasStructuredLabel ? (
							<div className={styles.labelStack}>
								<ChipWithPopover
									fullText={structuredLabel?.forwardLabel ?? ''}
									onChipClick={isInteractive ? handleEdgeClick : undefined}
								>
									<div className={styles.labelChip}>
										<ForwardIcon className={styles.labelIcon} size={12} />
										<span className={styles.labelText}>
											{structuredLabel?.forwardLabel}
										</span>
									</div>
								</ChipWithPopover>
								<ChipWithPopover
									fullText={structuredLabel?.backwardLabel ?? ''}
									onChipClick={isInteractive ? handleEdgeClick : undefined}
								>
									<div className={styles.labelChip}>
										<BackwardIcon className={styles.labelIcon} size={12} />
										<span className={styles.labelText}>
											{structuredLabel?.backwardLabel}
										</span>
									</div>
								</ChipWithPopover>
							</div>
						) : shouldUseDirectionalLabel ? (
							<ChipWithPopover
								fullText={promptLabel || displayLabel || ''}
								onChipClick={isInteractive ? handleEdgeClick : undefined}
							>
								<div className={styles.labelChip}>
									{singleConditionDirection === 'backward' ? (
										<BackwardIcon className={styles.labelIcon} size={12} />
									) : (
										<ForwardIcon className={styles.labelIcon} size={12} />
									)}
									<span className={styles.labelText}>
										{displayLabel ??
											t('form.workflow.edge.notConfigured', {
												defaultValue: 'Not configured',
											})}
									</span>
								</div>
							</ChipWithPopover>
						) : (
							<ChipWithPopover
								fullText={promptLabel || displayLabel || ''}
								onChipClick={isInteractive ? handleEdgeClick : undefined}
							>
								<span>{displayLabel}</span>
							</ChipWithPopover>
						)}
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default ConditionEdge;
