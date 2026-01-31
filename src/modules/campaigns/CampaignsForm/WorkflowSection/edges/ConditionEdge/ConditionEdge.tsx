import type { FC } from 'react';
import {
	BaseEdge,
	EdgeLabelRenderer,
	getSmoothStepPath,
	type EdgeProps,
} from '@xyflow/react';
import styles from './ConditionEdge.module.css';

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

	const label = typeof data?.label === 'string' ? data.label : null;

	return (
		<>
			<BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
			{label && (
				<EdgeLabelRenderer>
					<div
						className={styles.label}
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
