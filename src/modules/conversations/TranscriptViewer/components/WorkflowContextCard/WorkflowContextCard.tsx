import { Box, Text, Tooltip } from '@mantine/core';
import { Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentMetadata } from '~/models/ConversationsModels';
import { formatWorkflowNodeName } from '../../helpers/formatUtils';
import styles from './WorkflowContextCard.module.css';

interface WorkflowContextCardProps {
	title: string;
	metadata: AgentMetadata;
	nodeLabels?: Record<string, string>;
	nodeMissions?: Record<string, string>;
}

export const WorkflowContextCard = ({
	title,
	metadata,
	nodeLabels,
	nodeMissions,
}: WorkflowContextCardProps) => {
	const { t } = useTranslation(['conversations', 'common']);
	const nodeId = metadata.workflow_node_id;
	const nodeName =
		(nodeId && nodeLabels?.[nodeId]) ?? formatWorkflowNodeName(nodeId);
	const mission = nodeId ? nodeMissions?.[nodeId] : undefined;

	return (
		<Box className={styles.workflowContextCard}>
			<Text size='xs' c='dimmed' fw={500} className={styles.workflowCardTitle}>
				{title}
			</Text>
			<Tooltip
				label={
					<Stack gap={4}>
						{mission && (
							<Text size='xs' className={styles.tooltipMission}>
								{t('transcript.technical.mission')}: {mission}
							</Text>
						)}
						{metadata.workflow_node_id && (
							<Text size='xs' className={styles.tooltipMonoText}>
								{t('transcript.technical.workflowNode')}:{' '}
								{metadata.workflow_node_id}
							</Text>
						)}
						<Text size='xs' className={styles.tooltipMonoText}>
							{t('transcript.technical.agentId')}: {metadata.agent_id}
						</Text>
					</Stack>
				}
				position='top'
				withArrow
				multiline
				w={320}
				openDelay={200}
			>
				<Text
					size='xs'
					fw={600}
					c='gray.8'
					className={styles.workflowNodeName}
					span
				>
					{nodeName}
				</Text>
			</Tooltip>
		</Box>
	);
};
