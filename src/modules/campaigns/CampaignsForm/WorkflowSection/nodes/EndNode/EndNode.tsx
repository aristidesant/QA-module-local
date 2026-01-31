import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconSquareRoundedCheck } from '@tabler/icons-react';
import type { EndNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeWrapper from '../../WorkflowNode';
import styles from './EndNode.module.css';

const EndNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as EndNode;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t('form.workflow.nodes.end');

	return (
		<WorkflowNodeWrapper {...props}>
			<div className={styles.node}>
				<Group gap='xs'>
					<IconSquareRoundedCheck size={18} className={styles.icon} />
					<Text size='sm' fw={500}>
						{nodeData.label || fallbackLabel}
					</Text>
				</Group>
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(EndNodeComponent);
