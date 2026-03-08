import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { useTranslation } from 'react-i18next';
import { IconSquareRoundedCheck } from '@tabler/icons-react';
import type { EndNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import styles from './EndNode.module.css';

const EndNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as EndNode;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t('form.workflow.nodes.end');

	return (
		<WorkflowNodeWrapper
			{...props}
			sideActions={
				<WorkflowNodeActions
					nodeId={props.id}
					nodeData={props.data as WorkflowNodeData}
					nodeType={nodeType}
				/>
			}
		>
			<div className={`${workflowNodeStyles.nodeSurface} ${styles.node}`}>
				<WorkflowNodeHeader
					className={styles.header}
					icon={<IconSquareRoundedCheck size={18} className={styles.icon} />}
					title={nodeData.label || fallbackLabel}
				/>
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(EndNodeComponent);
