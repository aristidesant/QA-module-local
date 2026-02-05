import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { useTranslation } from 'react-i18next';
import { IconFlag } from '@tabler/icons-react';
import type { StartNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import styles from './StartNode.module.css';

const StartNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StartNode;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t('form.workflow.nodes.start');

	return (
		<WorkflowNodeWrapper {...props}>
			<div className={styles.node}>
				<WorkflowNodeHeader
					className={styles.header}
					icon={<IconFlag size={16} className={styles.icon} />}
					title={nodeData.label || fallbackLabel}
				/>
				<div className={styles.footer}>
					<WorkflowNodeActions
						nodeId={props.id}
						nodeData={props.data as WorkflowNodeData}
						nodeType={nodeType}
					/>
				</div>
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(StartNodeComponent);
