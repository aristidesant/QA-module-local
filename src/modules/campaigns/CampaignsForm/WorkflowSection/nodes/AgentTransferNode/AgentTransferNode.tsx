import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconUserCog } from '@tabler/icons-react';
import type { StandaloneAgentNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import styles from './AgentTransferNode.module.css';

const AgentTransferNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StandaloneAgentNode;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t('form.workflow.nodes.agent_transfer', {
		defaultValue: t('form.workflow.nodes.standalone_agent'),
	});
	const agentId = nodeData.agentId?.trim();
	const delayMs = nodeData.delayMs ?? 0;
	const transferMessage = nodeData.transferMessage?.trim();
	const targetLabel = agentId || t('form.workflow.transferNode.emptyAgent');

	return (
		<WorkflowNodeWrapper {...props}>
			<div className={styles.node}>
				<WorkflowNodeHeader
					className={styles.header}
					icon={<IconUserCog size={18} className={styles.icon} />}
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
				<div className={styles.details}>
					<div className={styles.detailRow}>
						<Text size='xs' className={styles.metaLabel}>
							{t('form.workflow.transferNode.to')}
						</Text>
						<Text
							size='xs'
							fw={500}
							className={styles.metaValue}
							title={targetLabel}
						>
							{targetLabel}
						</Text>
					</div>
					<div className={styles.detailRow}>
						<Text size='xs' className={styles.metaLabel}>
							{t('form.workflow.transferNode.delay')}
						</Text>
						<Text size='xs' fw={500} className={styles.metaValue}>
							{t('form.workflow.transferNode.delayValue', {
								value: delayMs,
							})}
						</Text>
					</div>
				</div>
				{transferMessage && (
					<div className={styles.message}>
						<Text size='xs' lineClamp={2} className={styles.messageText}>
							{transferMessage}
						</Text>
					</div>
				)}
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(AgentTransferNodeComponent);
