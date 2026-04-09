import type { FC, MouseEvent as ReactMouseEvent } from 'react';
import { ActionIcon, Group } from '@mantine/core';
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
						onClick={isInteractive ? handleEdgeClick : undefined}
					>
						{hasStructuredLabel ? (
							<div className={styles.labelStack}>
								<div className={styles.labelChip}>
									<ForwardIcon className={styles.labelIcon} size={12} />
									<span className={styles.labelText}>
										{structuredLabel?.forwardLabel}
									</span>
								</div>
								<div className={styles.labelChip}>
									<BackwardIcon className={styles.labelIcon} size={12} />
									<span className={styles.labelText}>
										{structuredLabel?.backwardLabel}
									</span>
								</div>
							</div>
						) : shouldUseDirectionalLabel ? (
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
						) : (
							<>{displayLabel}</>
						)}
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default ConditionEdge;
