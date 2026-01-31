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
		switch (warningLevel) {
			case 'error':
				return `${styles.label} ${styles.labelError}`;
			case 'warning':
				return `${styles.label} ${styles.labelWarning}`;
			default:
				return styles.label;
		}
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
