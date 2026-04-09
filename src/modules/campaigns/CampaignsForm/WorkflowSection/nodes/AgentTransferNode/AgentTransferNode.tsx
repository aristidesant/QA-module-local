import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconUserCog } from '@tabler/icons-react';
import type { StandaloneAgentNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeDrawer from '../../WorkflowNodeDrawer';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import { getWorkflowNodeToneStyle } from '../../utils/workflowNodeColors';
import { resolveWorkflowIcon } from '../../utils/workflowIconRegistry';
import { useNodeStyle } from '../../NodeStylesContext';
import styles from './AgentTransferNode.module.css';

const AgentTransferNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StandaloneAgentNode;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const fallbackLabel = t('form.workflow.nodes.agent_transfer', {
		defaultValue: t('form.workflow.nodes.standalone_agent'),
	});
	const persistedStyle = useNodeStyle(props.id);
	const nodeSurfaceStyle = getWorkflowNodeToneStyle(
		nodeData.label || fallbackLabel,
		persistedStyle
	);
	const CustomIcon = resolveWorkflowIcon(persistedStyle?.iconName);
	const nodeIcon = CustomIcon ? (
		<CustomIcon size={18} className={styles.icon} />
	) : (
		<IconUserCog size={18} className={styles.icon} />
	);
	const agentId = nodeData.agentId?.trim();
	const delayMs = nodeData.delayMs ?? 0;
	const transferMessage = nodeData.transferMessage?.trim();
	const targetLabel = agentId || t('form.workflow.transferNode.emptyAgent');

	return (
		<>
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
									value: delayMs,
								})}
							</Text>
						</div>
					</div>
					{transferMessage && (
						<div className={styles.footer}>
							<Text size='xs' lineClamp={2} className={styles.footerText}>
								{transferMessage}
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
