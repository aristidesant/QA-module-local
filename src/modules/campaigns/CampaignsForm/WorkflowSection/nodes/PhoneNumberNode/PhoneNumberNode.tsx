import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeType } from '../../nodeTypes';
import { Text, Box } from '@mantine/core';
import { IconPhoneCall } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PhoneNumberTransferNode } from '~/models/AgentWorkflowModel';
import WorkflowNodeActions from '../../WorkflowNodeActions';
import WorkflowNodeDrawer from '../../WorkflowNodeDrawer';
import WorkflowNodeHeader from '../../WorkflowNodeHeader';
import WorkflowNodeWrapper from '../../WorkflowNode';
import type { WorkflowNodeData } from '../../WorkflowNode/WorkflowNodeTypes';
import workflowNodeStyles from '../../WorkflowNode/WorkflowNode.module.css';
import styles from './PhoneNumberNode.module.css';

const PhoneNumberNode = (props: NodeProps) => {
	const { t } = useTranslation('campaigns');
	const nodeData = props.data as unknown as PhoneNumberTransferNode;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;

	const destination = nodeData.transferDestination;
	const value = destination
		? 'phoneNumber' in destination
			? destination.phoneNumber
			: 'sipUri' in destination
				? destination.sipUri
				: ''
		: '';

	const hasError = !value || value.trim() === '';

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
				<Box
					className={`${workflowNodeStyles.nodeSurface} ${styles.node} ${hasError ? styles.error : ''}`}
				>
					<WorkflowNodeHeader
						className={styles.header}
						icon={<IconPhoneCall size={18} className={styles.icon} />}
						title={t('form.workflow.nodes.phone_number', {
							defaultValue: 'Transfer',
						})}
						subtitle={t('form.workflow.nodeStatus.destination')}
					/>
					<Text
						size='xs'
						c='dimmed'
						lineClamp={1}
						className={styles.destination}
					>
						{value || t('form.workflow.forms.phone.destinationEmpty')}
					</Text>
				</Box>
			</WorkflowNodeWrapper>
			<WorkflowNodeDrawer nodeId={props.id} />
		</>
	);
};

export default memo(PhoneNumberNode);
