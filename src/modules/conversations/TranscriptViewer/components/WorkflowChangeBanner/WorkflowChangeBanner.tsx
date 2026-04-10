import { Box, Group, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type { WorkflowTransition } from '../../helpers/types';
import { formatTime, formatWorkflowNodeName } from '../../helpers/formatUtils';
import styles from './WorkflowChangeBanner.module.css';

interface WorkflowChangeBannerProps {
	timeInCallSecs: number | undefined;
	transition: WorkflowTransition;
	nodeLabels?: Record<string, string>;
}

export const WorkflowChangeBanner = ({
	timeInCallSecs,
	transition,
	nodeLabels,
}: WorkflowChangeBannerProps) => {
	const fromNodeId = transition.from.workflow_node_id;
	const fromNodeName =
		(fromNodeId && nodeLabels?.[fromNodeId]) ??
		formatWorkflowNodeName(fromNodeId);

	const toNodeId = transition.to.workflow_node_id;
	const toNodeName =
		(toNodeId && nodeLabels?.[toNodeId]) ?? formatWorkflowNodeName(toNodeId);

	return (
		<Box className={styles.wrapper}>
			{timeInCallSecs !== undefined && (
				<Text size='xs' c='dimmed' className={styles.timestamp}>
					{formatTime(timeInCallSecs)}
				</Text>
			)}
			<Group gap={8} align='center' wrap='nowrap' className={styles.flow}>
				<Text size='xs' fw={500} c='dimmed' span className={styles.node}>
					{fromNodeName}
				</Text>

				<IconArrowRight
					size={14}
					color='var(--mantine-color-gray-5)'
					stroke={2}
					className={styles.arrow}
				/>

				<Text size='xs' fw={600} c='gray.8' span className={styles.node}>
					{toNodeName}
				</Text>
			</Group>
		</Box>
	);
};
