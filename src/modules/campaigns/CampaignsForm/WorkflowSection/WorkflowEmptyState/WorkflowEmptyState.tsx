import { Stack, Text, Button, Center } from '@mantine/core';
import { IconGitBranch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface WorkflowEmptyStateProps {
	onCreateWorkflow?: () => void;
}

function WorkflowEmptyState({ onCreateWorkflow }: WorkflowEmptyStateProps) {
	const { t } = useTranslation('campaigns');

	return (
		<Center h={300}>
			<Stack align='center' gap='md'>
				<IconGitBranch
					size={48}
					stroke={1.5}
					color='var(--mantine-color-gray-5)'
				/>
				<Text size='lg' fw={500} c='dimmed'>
					{t('workflow.emptyState.title', 'No workflow configured')}
				</Text>
				<Text size='sm' c='dimmed' ta='center' maw={400}>
					{t(
						'workflow.emptyState.description',
						'Create a workflow to define how your agent handles conversations with branching logic and tools.'
					)}
				</Text>
				{onCreateWorkflow && (
					<Button
						onClick={onCreateWorkflow}
						leftSection={<IconGitBranch size={16} />}
					>
						{t('workflow.emptyState.createButton', 'Create Workflow')}
					</Button>
				)}
			</Stack>
		</Center>
	);
}

export default WorkflowEmptyState;
