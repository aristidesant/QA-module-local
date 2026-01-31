import type { FC } from 'react';
import {
	BaseEdge,
	EdgeLabelRenderer,
	getSmoothStepPath,
	type EdgeProps,
} from '@xyflow/react';
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
	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});
	const labelT = 0.35;
	const labelX = sourceX + (targetX - sourceX) * labelT;
	const labelY = sourceY + (targetY - sourceY) * labelT;

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
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
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
