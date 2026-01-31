import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconFlag } from '@tabler/icons-react';
import type { StartNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeWrapper from '../../WorkflowNode';
import styles from './StartNode.module.css';

const StartNodeComponent = (props: NodeProps) => {
	const nodeData = props.data as unknown as StartNode;
	const { t } = useTranslation('campaigns');
	const fallbackLabel = t('form.workflow.nodes.start');

	return (
		<WorkflowNodeWrapper {...props}>
			<div className={styles.node}>
				<Group gap='xs'>
					<IconFlag size={18} className={styles.icon} />
					<Text size='sm' fw={500}>
						{nodeData.label || fallbackLabel}
					</Text>
				</Group>
			</div>
		</WorkflowNodeWrapper>
	);
};

export default memo(StartNodeComponent);
