import React from 'react';
import { Button, Group, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import AppDrawer from '~/components/AppDrawer';
import type {
	ForwardCondition,
	WorkflowEdge,
} from '~/models/AgentWorkflowModel';
import type { WorkflowNodeType } from '../../nodeTypes';
import {
	EdgeConditionModalProvider,
	useEdgeConditionModal,
} from './EdgeConditionModalContext';
import EdgeConditionTabs from './EdgeConditionTabs';

interface EdgeConditionModalProps {
	opened: boolean;
	edgeId?: string;
	edge?: WorkflowEdge;
	sourceLabel?: string;
	targetLabel?: string;
	sourceNodeType?: WorkflowNodeType;
	targetNodeType?: WorkflowNodeType;
	onClose: () => void;
	onSave: (
		edgeId: string,
		forwardCondition?: ForwardCondition,
		backwardCondition?: ForwardCondition
	) => void;
}

const ModalContent = () => {
	const { t } = useTranslation('campaigns');
	const { handleSave, onClose } = useEdgeConditionModal();

	return (
		<Stack gap='md'>
			<EdgeConditionTabs />
			<Group justify='flex-end' gap='sm'>
				<Button variant='outline' onClick={onClose}>
					{t('common:form.actions.cancel', { defaultValue: 'Cancel' })}
				</Button>
				<Button onClick={handleSave}>
					{t('common:form.actions.save', { defaultValue: 'Save' })}
				</Button>
			</Group>
		</Stack>
	);
};

export const EdgeConditionModal: React.FC<EdgeConditionModalProps> = (
	props
) => {
	const { t } = useTranslation('campaigns');
	const edgeTitle =
		props.sourceLabel && props.targetLabel
			? `${props.sourceLabel} → ${props.targetLabel}`
			: t('form.workflow.edge.title', { defaultValue: 'Edge condition' });

	return (
		<EdgeConditionModalProvider {...props}>
			<AppDrawer
				opened={props.opened}
				onClose={props.onClose}
				title={edgeTitle}
				size='lg'
				keepMounted
				zIndex={330}
				transitionProps={{
					transition: 'slide-left',
					duration: 250,
					timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
				}}
			>
				<ModalContent />
			</AppDrawer>
		</EdgeConditionModalProvider>
	);
};

export default EdgeConditionModal;
