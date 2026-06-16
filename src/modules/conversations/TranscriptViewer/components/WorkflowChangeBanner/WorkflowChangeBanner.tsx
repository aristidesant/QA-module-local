import { Box, Group, Text } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type {
	WorkflowNodeLabels,
	WorkflowNodeLabelsByAgent,
	WorkflowTransition,
} from '../../helpers/types';
import { formatTime } from '../../helpers/formatUtils';
import { resolveWorkflowNodeName } from '../../helpers/transcriptHelpers';
import styles from './WorkflowChangeBanner.module.css';

interface WorkflowChangeBannerProps {
	timeInCallSecs: number | undefined;
	transition: WorkflowTransition;
	nodeLabels?: WorkflowNodeLabels;
	nodeLabelsByAgent?: WorkflowNodeLabelsByAgent;
}

export const WorkflowChangeBanner = ({
	timeInCallSecs,
	transition,
	nodeLabels,
	nodeLabelsByAgent,
}: WorkflowChangeBannerProps) => {
	const fromNodeName = resolveWorkflowNodeName(
		transition.from,
		nodeLabels,
		nodeLabelsByAgent
	);
	const toNodeName = resolveWorkflowNodeName(
		transition.to,
		nodeLabels,
		nodeLabelsByAgent
	);

	return (
		<Box className={styles.wrapper}>
			{timeInCallSecs !== undefined && (
				<Text size='xs' c='dimmed' className={styles.timestamp}>
					{formatTime(timeInCallSecs)}
				</Text>
			)}
			<Group gap={8} align='center' wrap='nowrap' className={styles.flow}>
				<Text size='xs' fw={500} span className={styles.node}>
					{fromNodeName}
				</Text>

				<IconArrowRight size={14} stroke={2} className={styles.arrow} />

				<Text
					size='xs'
					fw={600}
					span
					className={`${styles.node} ${styles.nodeTarget}`}
				>
					{toNodeName}
				</Text>
			</Group>
		</Box>
	);
};
