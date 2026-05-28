import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconUserCog } from '@tabler/icons-react';
import type { StandaloneAgentNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeDrawer from '../../WorkflowNodeDrawer';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import { resolveWorkflowIcon } from '../../utils/workflowIconRegistry';
import { useNodeStyle } from '../../NodeStylesContext';
import { useWorkflowNodeToneStyle } from '../../utils/workflowNodeColors';
import styles from './AgentTransferNode.module.css';

const AgentTransferNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StandaloneAgentNode;
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const fallbackLabel = t('form.workflow.nodes.agent_transfer', {
		defaultValue: t('form.workflow.nodes.standalone_agent'),
	});
	const persistedStyle = useNodeStyle(props.id);
	const nodeSurfaceStyle = useWorkflowNodeToneStyle(
		nodeData.label || fallbackLabel,
		persistedStyle
	);
	const CustomIcon = resolveWorkflowIcon(persistedStyle?.iconName);
	const nodeIcon = CustomIcon ? (
		<CustomIcon size={18} className={styles.icon} />
	) : (
		<IconUserCog size={18} className={styles.icon} />
	);
	const agent_id = nodeData.agent_id?.trim();
	const delay_ms = nodeData.delay_ms ?? 0;
	const transfer_message = nodeData.transfer_message?.trim();
	const targetLabel = agent_id || t('form.workflow.transferNode.emptyAgent');

	return (
		<>
			<WorkflowNodeWrapper {...props}>
				{/* inline-style-allow: nodeSurfaceStyle sets CSS custom properties for node theming — must be applied inline */}
				<div
					className={`${workflowNodeStyles.nodeSurface} ${styles.node}`}
					// inline-style-allow: nodeSurfaceStyle sets CSS custom properties for node theming — must be applied inline
					style={nodeSurfaceStyle}
				>
					<WorkflowNodeHeader
						className={styles.header}
						icon={nodeIcon}
						title={nodeData.label || fallbackLabel}
						subtitle={t('form.workflow.nodeStatus.transferTarget')}
						titleClassName={styles.title}
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
									value: delay_ms,
								})}
							</Text>
						</div>
					</div>
					{transfer_message && (
						<div className={styles.footer}>
							<Text size='xs' lineClamp={2} className={styles.footerText}>
								{transfer_message}
							</Text>
						</div>
					)}
				</div>
			</WorkflowNodeWrapper>
			<WorkflowNodeDrawer nodeId={props.id} />
		</>
	);
};

export default memo(AgentTransferNodeComponent);
