import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { useTranslation } from 'react-i18next';
import { IconTool } from '@tabler/icons-react';
import type { ToolNode as ToolNodeModel } from '~/models/AgentWorkflowModel';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import styles from './ToolNode.module.css';

const ToolNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as ToolNodeModel;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t('form.workflow.nodes.tool');
	const toolCount = nodeData.tools?.length ?? 0;

	return (
		<WorkflowNodeWrapper {...props}>
			<div className={styles.node}>
				<WorkflowNodeHeader
					className={styles.header}
					icon={<IconTool size={18} className={styles.icon} />}
					title={nodeData.label || fallbackLabel}
					titleClassName={styles.title}
					actions={
						<WorkflowNodeActions
							nodeId={props.id}
							nodeData={props.data as WorkflowNodeData}
							nodeType={nodeType}
						/>
					}
				/>
				{toolCount > 0 && (
					<div className={styles.toolsSection}>
						<div className={styles.toolsList}>
							{nodeData.tools.map((tool, index) => (
								<span
									key={`${tool.toolId}-${index}`}
									className={styles.toolBadge}
								>
									{tool.toolId}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(ToolNodeComponent);
