import {
	type FC,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from 'react';
import { useEffect } from 'react';
import { Paper, Portal, ScrollArea, Text } from '@mantine/core';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import {
	IconAlertTriangle,
	IconArrowLeft,
	IconArrowRight,
	IconMaximize,
} from '@tabler/icons-react';
import type {
	ConditionEdgeData,
	StructuredConditionEdgeLabel,
	WarningLevel,
} from './ConditionEdge.types';
import { useWorkflowCanvasActions } from '../../WorkflowCanvas/WorkflowCanvasActionsContext';
import styles from './ConditionEdge.module.css';

const truncateEdgePrompt = (value: string, maxLength = 12): string => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength).trimEnd()}...`;
};

const FULL_TEXT_THRESHOLD = 20;

interface ChipWithPopoverProps {
	fullText: string;
	children: ReactNode;
}

const ChipWithPopover: FC<ChipWithPopoverProps> = ({ fullText, children }) => {
	const [opened, setOpened] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const needsPopover = fullText.length > FULL_TEXT_THRESHOLD;

	const openPopover = () => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
		setOpened(true);
	};

	const closePopover = () => {
		hoverTimeoutRef.current = setTimeout(() => setOpened(false), 150);
	};

	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
		};
	}, []);

	if (!needsPopover) {
		return <div className={styles.chipTriggerSimple}>{children}</div>;
	}

	const getDropdownStyle = (): React.CSSProperties => {
		const rect = triggerRef.current?.getBoundingClientRect();
		if (!rect) return { position: 'fixed', top: 0, left: 0 };
		return {
			position: 'fixed',
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
			<div
				ref={triggerRef}
				onMouseEnter={openPopover}
				onMouseLeave={closePopover}
				className={styles.chipTrigger}
			>
				{children}
				<span
					className={styles.expandIcon}
					onClick={(e) => {
						e.stopPropagation(); // keep stopPropagation so expand doesn't trigger edge interaction path
						setOpened((prev) => !prev);
					}}
				>
					<IconMaximize size={10} />
				</span>
			</div>
			{opened && (
				<Portal>
					<Paper
						ref={dropdownRef}
						shadow='md'
						radius='sm'
						p='xs'
						withBorder
						style={getDropdownStyle()}
						onClick={(e) => e.stopPropagation()}
						onMouseEnter={openPopover}
						onMouseLeave={closePopover}
					>
						<ScrollArea.Autosize mah={180} scrollbarSize={6}>
							<Text size='xs' className={styles.popoverText}>
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
	const { t } = useTranslation(['campaign.form.workflow']);
	const { openEdge, openEdgeContextMenu } = useWorkflowCanvasActions();

	const curvature = 0.5;
	const dx = targetX - sourceX;
	const dy = targetY - sourceY;
	void sourcePosition;
	void targetPosition;

	const cx1 = sourceX + dx * curvature;
	const cy1 = sourceY;
	const cx2 = targetX - dx * curvature;
	const cy2 = targetY;

	const edgePath = `M ${sourceX},${sourceY} C ${cx1},${cy1} ${cx2},${cy2} ${targetX},${targetY}`;

	let labelX = sourceX + dx * 0.5;
	let labelY = sourceY + dy * 0.5;

	try {
		const t = 0.5;
		const mt = 1 - t;

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

		labelX = midX + nx * 0;
		labelY = midY + ny * 0;
	} catch (err) {
		// fallback to linear midpoint
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
	const hasNoCondition = !hasForwardCondition && !hasBackwardCondition;
	const hasSingleCondition = hasForwardCondition !== hasBackwardCondition;
	const singleConditionDirection = hasSingleCondition
		? hasForwardCondition
			? 'forward'
			: 'backward'
		: null;
	const warningLevel = (edgeData.warningLevel ?? 'none') as WarningLevel;
	const suppressLabel = edgeData.sourceNodeType === 'start';
	const isIncomplete = warningLevel === 'error';

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
		hasStructuredLabel || suppressLabel || hasNoCondition || isIncomplete
			? null
			: promptLabel
				? truncateEdgePrompt(promptLabel)
				: label;

	const handleEdgeClick = useCallback(
		(_event: ReactMouseEvent<SVGPathElement | HTMLDivElement>) => {
			openEdge(id);
		},
		[id, openEdge]
	);

	const handleEdgeContextMenu = useCallback(
		(event: ReactMouseEvent<SVGPathElement | HTMLDivElement>) => {
			event.preventDefault();
			openEdgeContextMenu(id, { x: event.clientX, y: event.clientY });
		},
		[id, openEdgeContextMenu]
	);

	const getStrokeColor = (): string => {
		if (isIncomplete) {
			return 'var(--mantine-color-orange-7)';
		}
		return 'var(--workflow-shell-control-text, var(--mantine-color-gray-6))';
	};

	const getStrokeDasharray = (): string | undefined => {
		if (hasNoCondition) return '4 4';
		return undefined;
	};

	const getStrokeWidth = (): number => {
		if (hasNoCondition) return 1.5;
		return 2;
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

	const getLabelClassName = (): string => {
		const classes = [
			styles.label,
			styles.labelClickable,
			shouldUseDirectionalLabel ? styles.labelStructured : '',
		];
		return classes.filter(Boolean).join(' ');
	};

	return (
		<>
			{/* Visible edge path rendered first (lower SVG z-order) so it never
			    captures pointer events over the interaction path above it. */}
			<BaseEdge
				id={id}
				path={edgePath}
				interactionWidth={0}
				style={{
					stroke: strokeColor,
					strokeWidth: getStrokeWidth(),
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: getStrokeDasharray(),
					transition: 'stroke 120ms ease, stroke-width 120ms ease',
				}}
				markerStart={startMarker}
				markerEnd={endMarker}
				className={styles.visibleEdge}
			/>
			{/* Transparent wide path kept for hover cursor only — clicks are
			    handled by the EdgeLabelRenderer label divs below. */}
			<path
				d={edgePath}
				fill='none'
				stroke='transparent'
				strokeWidth={20}
				className={`${styles.edgeInteraction} ${styles.edgeInteractionDisabled}`}
			/>
			{/* Warning icon for incomplete edges */}
			{isIncomplete && !suppressLabel && (
				<EdgeLabelRenderer>
					<div
						className={styles.warningIcon}
						style={{
							transform: `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, -50%)`,
						}}
						onClick={handleEdgeClick}
						onContextMenu={handleEdgeContextMenu}
					>
						<IconAlertTriangle size={16} stroke={1.5} />
					</div>
				</EdgeLabelRenderer>
			)}
			{/* "None" badge for unconfigured edges — pointer-events:none so
			    clicks fall through to the interaction path above */}
			{hasNoCondition && !suppressLabel && (
				<EdgeLabelRenderer>
					<div
						className={`${styles.noneLabel} ${styles.labelClickable}`}
						// inline-style-allow: EdgeLabelRenderer requires runtime transform coordinates derived from edge geometry
						style={{
							transform: `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, -50%)`,
						}}
						onClick={handleEdgeClick}
						onContextMenu={handleEdgeContextMenu}
					>
						{t('form.workflow.edge.noneLabel', { defaultValue: 'None' })}
					</div>
				</EdgeLabelRenderer>
			)}
			{/* Label for configured edges — click/right-click on the label
			    opens the drawer / context menu respectively. */}
			{!suppressLabel &&
				!hasNoCondition &&
				!isIncomplete &&
				(displayLabel || shouldUseDirectionalLabel) && (
					<EdgeLabelRenderer>
						<div
							className={getLabelClassName()}
							style={{
								zIndex: 160,
								transform: `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, -50%)`,
							}}
							onClick={handleEdgeClick}
							onContextMenu={handleEdgeContextMenu}
						>
							{hasStructuredLabel ? (
								<div className={styles.labelStack}>
									<ChipWithPopover
										fullText={structuredLabel?.forwardLabel ?? ''}
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
								<ChipWithPopover fullText={promptLabel || displayLabel || ''}>
									<div className={styles.labelChip}>
										{singleConditionDirection === 'backward' ? (
											<BackwardIcon className={styles.labelIcon} size={12} />
										) : (
											<ForwardIcon className={styles.labelIcon} size={12} />
										)}
										<span className={styles.labelText}>{displayLabel}</span>
									</div>
								</ChipWithPopover>
							) : (
								<ChipWithPopover fullText={promptLabel || displayLabel || ''}>
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
