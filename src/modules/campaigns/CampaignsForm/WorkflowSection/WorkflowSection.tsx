import { Button, Group, Stack } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowEmptyState from './WorkflowEmptyState';
import WorkflowHeader from './WorkflowHeader';
import WorkflowStateProvider from './WorkflowStateProvider';
import { useWorkflowState } from './WorkflowStateContext';

const WorkflowContent = () => {
	const { isEmptyState, hasWorkflow } = useWorkflowState();

	return (
		<>
			{isEmptyState && <WorkflowEmptyState />}
			{hasWorkflow && <WorkflowCanvas />}
		</>
	);
};

const WorkflowSection = () => (
	<SectionCard
		title='Workflow'
		description='Build the agent flow and connect nodes based on the workflow schema.'
		contentSpacing='xs'
		padding='sm'
	>
		<WorkflowStateProvider>
			<Stack gap='xs'>
				<WorkflowHeader />
				<WorkflowContent />
				<Group justify='flex-end'>
					<Button
						type='submit'
						size='sm'
						leftSection={<IconDeviceFloppy size={16} />}
					>
						Save
					</Button>
				</Group>
			</Stack>
		</WorkflowStateProvider>
	</SectionCard>
);

export default WorkflowSection;
