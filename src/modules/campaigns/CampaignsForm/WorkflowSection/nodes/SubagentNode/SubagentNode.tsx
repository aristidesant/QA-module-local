import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconBook,
	IconPlugConnected,
	IconTool,
	IconUserCircle,
} from '@tabler/icons-react';
import type { StandaloneAgentNode } from '~/models/AgentWorkflowModel';
import { WORKFLOW_NODE_TYPES, type WorkflowNodeType } from '../../nodeTypes';
import WorkflowNodeDrawer from '../../WorkflowNodeDrawer';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import { resolveWorkflowIcon } from '../../utils/workflowIconRegistry';
import { useNodeStyle } from '../../NodeStylesContext';
import { useWorkflowNodeToneStyle } from '../../utils/workflowNodeColors';
import styles from './SubagentNode.module.css';

const SubagentNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StandaloneAgentNode;
	const nodeType = nodeData.type as WorkflowNodeType;
	const isOverride = nodeType === WORKFLOW_NODE_TYPES.OVERRIDE_AGENT;
	const isTransfer =
		nodeType === WORKFLOW_NODE_TYPES.STANDALONE_AGENT && !!nodeData.agentId;
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const persistedStyle = useNodeStyle(props.id);
	const fallbackLabel = t(`form.workflow.nodes.${nodeData.type}`, {
		defaultValue: t('form.workflow.nodes.standalone_agent'),
	});
	const nodeSurfaceStyle = useWorkflowNodeToneStyle(
		nodeData.label || fallbackLabel,
		persistedStyle
	);

	// Resolve custom icon from persisted style, falling back to defaults
	const CustomIcon = resolveWorkflowIcon(persistedStyle?.iconName);
	const defaultIcon =
		isOverride || isTransfer ? (
			<IconPlugConnected size={18} className={styles.icon} />
		) : (
			<IconUserCircle size={18} className={styles.icon} />
		);
	const nodeIcon = CustomIcon ? (
		<CustomIcon size={18} className={styles.icon} />
	) : (
		defaultIcon
	);
	const toolCount =
		nodeData.subagent?.toolIds?.length ??
		nodeData.additionalToolIds?.length ??
		0;
	const knowledgeBaseCount =
		nodeData.subagent?.knowledgeBaseIds?.length ??
		nodeData.additionalKnowledgeBase?.length ??
		0;
	const hasMetadata = toolCount > 0 || knowledgeBaseCount > 0;
	const conversationConfig = (nodeData as any).conversationConfig ?? {};
	const agentConfig = conversationConfig?.agent ?? {};
	const promptConfig = agentConfig?.prompt ?? {};
	const overridePromptValue = (promptConfig.prompt as string | null) ?? '';
	const additionalPrompt = nodeData.additionalPrompt ?? '';
	const hasAdditionalPrompt = additionalPrompt.trim().length > 0;
	const hasOverridePrompt = (overridePromptValue ?? '').trim().length > 0;
	const hasDefinedOverridePrompt =
		typeof nodeData.subagent?.overridePrompt === 'boolean';
	const effectiveOverridePrompt = hasDefinedOverridePrompt
		? (nodeData.subagent?.overridePrompt as boolean)
		: hasAdditionalPrompt
			? false
			: hasOverridePrompt
				? true
				: false;

	const promptPreview = effectiveOverridePrompt
		? (overridePromptValue ?? '').trim()
		: (additionalPrompt ?? '').trim();
	const subtitle = isTransfer
		? t('form.workflow.nodeStatus.transferStyle')
		: isOverride
			? t('form.workflow.nodeStatus.overrideStyle')
			: t('form.workflow.nodeStatus.subagentStyle');

	return (
		<>
			<WorkflowNodeWrapper {...props}>
				<div
					className={`${workflowNodeStyles.nodeSurface} ${styles.node}`}
					style={nodeSurfaceStyle}
				>
					<WorkflowNodeHeader
						className={styles.header}
						icon={nodeIcon}
						title={nodeData.label || fallbackLabel}
						subtitle={subtitle}
						titleClassName={styles.title}
					/>
					{promptPreview && (
						<div className={styles.promptSection}>
							<Text
								size='xs'
								className={styles.promptText}
								title={promptPreview}
							>
								{promptPreview}
							</Text>
						</div>
					)}
					{hasMetadata && (
						<div className={styles.footer}>
							<div className={styles.metadataList}>
								{toolCount > 0 && (
									<Tooltip
										label={t('form.workflow.subagent.toolsCount', {
											count: toolCount,
										})}
										withArrow
									>
										<span className={styles.metadataBadge}>
											<IconTool size={14} className={styles.metadataIcon} />
											{t('form.workflow.subagent.countBadge', {
												count: toolCount,
											})}
										</span>
									</Tooltip>
								)}
								{knowledgeBaseCount > 0 && (
									<Tooltip
										label={t('form.workflow.subagent.knowledgeBaseCount', {
											count: knowledgeBaseCount,
										})}
										withArrow
									>
										<span className={styles.metadataBadge}>
											<IconBook size={14} className={styles.metadataIcon} />
											{t('form.workflow.subagent.countBadge', {
												count: knowledgeBaseCount,
											})}
										</span>
									</Tooltip>
								)}
							</div>
						</div>
					)}
				</div>
			</WorkflowNodeWrapper>
			<WorkflowNodeDrawer nodeId={props.id} />
		</>
	);
};

export default memo(SubagentNodeComponent);
