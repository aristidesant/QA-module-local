import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { IconSquareRoundedCheck } from '@tabler/icons-react';
import type { EndNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import styles from './EndNode.module.css';

const EndNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as EndNode;
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const fallbackLabel = t('form.workflow.nodes.end');

	return (
		<WorkflowNodeWrapper {...props}>
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
