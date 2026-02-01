import type { FC } from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import styles from './ConditionEdge.module.css';

type WarningLevel = 'error' | 'warning' | 'none';

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

	// Use an off-DOM SVG path to compute the midpoint and a small normal
	// offset so the label sits close to (and slightly off) the path.
	if (typeof document !== 'undefined' && edgePath) {
		try {
			const pathEl = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'path'
			);
			pathEl.setAttribute('d', edgePath);
			const total = pathEl.getTotalLength();
			if (total && Number.isFinite(total)) {
				const mid = pathEl.getPointAtLength(total * 0.5);
				// sample two nearby points to compute tangent -> normal
				const eps = Math.max(1, total * 0.001);
				const p1 = pathEl.getPointAtLength(Math.max(0, total * 0.5 - eps));
				const p2 = pathEl.getPointAtLength(Math.min(total, total * 0.5 + eps));
				const tx = p2.x - p1.x;
				const ty = p2.y - p1.y;
				const mag = Math.sqrt(tx * tx + ty * ty) || 1;
				const nx = -ty / mag;
				const ny = tx / mag;
				// Use exact midpoint on the path so the label is centered and never lost.
				// Avoid an outward normal offset which may push the label off the visible canvas
				// when paths are short or extreme. Keep a tiny offset of 0 to ensure centering.
				const offset = 0;
				labelX = mid.x + nx * offset;
				labelY = mid.y + ny * offset;
			}
		} catch (err) {
			// fallback to linear midpoint already set above
		}
	}

	const label =
		typeof (data as any)?.label === 'string' ? (data as any).label : null;
	const warningLevel = ((data as any)?.warningLevel ?? 'none') as WarningLevel;
	const onEdgeClick = (data as any)?.onEdgeClick as
		| ((edgeId: string) => void)
		| undefined;

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

	// Get label style class based on warning level
	const getLabelClassName = (): string => {
		const baseClasses = `${styles.label}`;
		const warningClasses =
			warningLevel === 'error'
				? styles.labelError
				: warningLevel === 'warning'
					? styles.labelWarning
					: '';
		const clickableClasses = onEdgeClick ? styles.labelClickable : '';
		return `${baseClasses} ${warningClasses} ${clickableClasses}`.trim();
	};

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				style={{
					stroke: strokeColor,
					strokeWidth: 2,
				}}
				markerEnd={markerEnd}
			/>
			{label && (
				<EdgeLabelRenderer>
					<div
						className={getLabelClassName()}
						style={{
							// Apply translation to coordinates first, then center the label element.
							// Swapping the order avoids centering being applied in a different
							// transformed context which can push the label off the path.
							transform: `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, -50%)`,
						}}
						onClick={() => onEdgeClick?.(id)}
					>
						<span className={styles.labelPrefix}>&gt;&gt;</span>
						{label}
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default ConditionEdge;
