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
import { getWorkflowNodeToneStyle } from '../../utils/workflowNodeColors';
import { resolveWorkflowIcon } from '../../utils/workflowIconRegistry';
import { useNodeStyle } from '../../NodeStylesContext';
import styles from './PhoneNumberNode.module.css';

const PhoneNumberNode = (props: NodeProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const nodeData = props.data as unknown as PhoneNumberTransferNode;
	const nodeType = (props.type ?? nodeData.type) as WorkflowNodeType;
	const nodeTitle = t('form.workflow.nodes.phone_number', {
		defaultValue: 'Transfer',
	});
	const persistedStyle = useNodeStyle(props.id);
	const CustomIcon = resolveWorkflowIcon(persistedStyle?.iconName);
	const nodeIcon = CustomIcon ? (
		<CustomIcon size={18} className={styles.icon} />
	) : (
		<IconPhoneCall size={18} className={styles.icon} />
	);
	const destination = nodeData.transferDestination;
	const value = destination
		? 'phoneNumber' in destination
			? destination.phoneNumber
			: 'sipUri' in destination
				? destination.sipUri
				: ''
		: '';

	const hasError = !value || value.trim() === '';
	const nodeSurfaceStyle = hasError
		? {
				'--workflow-node-accent': 'var(--mantine-color-red-7)',
				'--workflow-node-selected-border': 'var(--mantine-color-red-4)',
				'--workflow-node-selected-ring': 'rgba(239, 68, 68, 0.14)',
				'--workflow-node-header-bg': 'var(--mantine-color-red-0)',
				'--workflow-node-surface-selected': 'var(--mantine-color-red-0)',
				backgroundColor: 'var(--mantine-color-red-0)',
				borderColor: 'var(--mantine-color-red-4)',
			}
		: getWorkflowNodeToneStyle(nodeTitle, persistedStyle);

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
					style={nodeSurfaceStyle}
				>
					<WorkflowNodeHeader
						className={styles.header}
						icon={nodeIcon}
						title={nodeTitle}
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
