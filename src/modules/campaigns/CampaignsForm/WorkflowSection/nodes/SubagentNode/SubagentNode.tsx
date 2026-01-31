import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Group, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconBook, IconTool, IconUserCircle } from '@tabler/icons-react';
import type { StandaloneAgentNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeWrapper from '../../WorkflowNode';
import styles from './SubagentNode.module.css';

const SubagentNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StandaloneAgentNode;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t(`form.workflow.nodes.${nodeData.type}`, {
		defaultValue: t('form.workflow.nodes.standalone_agent'),
	});
	const promptPreviewLimit = 120;
	const toolCount =
		nodeData.subagent?.toolIds?.length ??
		nodeData.additionalToolIds?.length ??
		0;
	const knowledgeBaseCount =
		nodeData.subagent?.knowledgeBaseIds?.length ??
		nodeData.additionalKnowledgeBase?.length ??
		0;
	const promptPreview =
		nodeData.subagent?.prompt?.trim() ||
		nodeData.additionalPrompt?.trim() ||
		nodeData.transferMessage?.trim();
	const truncatedPrompt = promptPreview
		? promptPreview.length > promptPreviewLimit
			? `${promptPreview.slice(0, promptPreviewLimit)}...`
			: promptPreview
		: undefined;

	return (
		<WorkflowNodeWrapper {...props}>
			<div className={styles.node}>
				<Group gap='xs' className={styles.header} wrap='nowrap'>
					<IconUserCircle size={18} className={styles.icon} />
					<Text size='sm' fw={500} lineClamp={1} className={styles.title}>
						{nodeData.label || fallbackLabel}
					</Text>
				</Group>
				<Text
					size='xs'
					c={promptPreview ? 'dimmed' : 'gray'}
					lineClamp={2}
					className={promptPreview ? styles.prompt : styles.promptEmpty}
				>
					{truncatedPrompt ||
						t('form.workflow.subagent.promptPreviewPlaceholder')}
				</Text>
				{(toolCount > 0 || knowledgeBaseCount > 0) && (
					<Group gap='xs' className={styles.badges}>
						{toolCount > 0 && (
							<Tooltip
								label={t('form.workflow.subagent.toolsCount', {
									count: toolCount,
								})}
								withArrow
							>
								<Group gap={4} className={styles.badge} wrap='nowrap'>
									<IconTool size={14} className={styles.badgeIcon} />
									<Text size='xs' fw={500} className={styles.badgeLabel}>
										{t('form.workflow.subagent.countBadge', {
											count: toolCount,
										})}
									</Text>
								</Group>
							</Tooltip>
						)}
						{knowledgeBaseCount > 0 && (
							<Tooltip
								label={t('form.workflow.subagent.knowledgeBaseCount', {
									count: knowledgeBaseCount,
								})}
								withArrow
							>
								<Group gap={4} className={styles.badge} wrap='nowrap'>
									<IconBook size={14} className={styles.badgeIcon} />
									<Text size='xs' fw={500} className={styles.badgeLabel}>
										{t('form.workflow.subagent.countBadge', {
											count: knowledgeBaseCount,
										})}
									</Text>
								</Group>
							</Tooltip>
						)}
					</Group>
				)}
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(SubagentNodeComponent);
