import {
	BaseEdge,
	EdgeLabelRenderer,
	getBezierPath,
	type EdgeProps,
} from '@xyflow/react';
import { IconChevronRight, IconCornerUpLeft } from '@tabler/icons-react';
import clsx from 'clsx';
import type { WorkflowEdgeData } from '../WorkflowSection.types';
import { useWorkflowState } from '../WorkflowStateContext';
import styles from './WorkflowEdge.module.css';

const WorkflowEdge = (props: EdgeProps) => {
	const {
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		style = {},
		markerEnd,
		selected,
	} = props;
	const { onEdgeClick } = useWorkflowState();
	const data = props.data as WorkflowEdgeData | undefined;
	const forward = data?.forward;
	const backward = data?.backward;

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const isUnconditional = forward?.conditionType === 'unconditional';
	const hideLabel = isUnconditional || (!forward && !backward);

	return (
		<>
			<BaseEdge
				path={edgePath}
				markerEnd={markerEnd}
				style={{
					...style,
					strokeDasharray: backward && !forward ? '5,5' : 'none',
					strokeOpacity: backward && !forward ? 0.6 : 1,
				}}
			/>
			{!hideLabel && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: 'absolute',
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							pointerEvents: 'all',
							display: 'flex',
							flexDirection: 'column',
							gap: '4px',
							alignItems: 'center',
						}}
						className='nodrag nopan'
					>
						{forward && (
							<div
								className={clsx(styles.edgeLabel, {
									[styles.selected]: selected,
								})}
								onClick={(e) => onEdgeClick(e as any, props as any, 'forward')}
							>
								<IconChevronRight size={12} stroke={3} />
								{forward.label}
							</div>
						)}
						{backward && (
							<div
								className={clsx(styles.edgeLabel, styles.backward, {
									[styles.selected]: selected,
								})}
								onClick={(e) => onEdgeClick(e as any, props as any, 'backward')}
							>
								<IconCornerUpLeft size={12} stroke={3} />
								{backward.label}
							</div>
						)}
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default WorkflowEdge;
