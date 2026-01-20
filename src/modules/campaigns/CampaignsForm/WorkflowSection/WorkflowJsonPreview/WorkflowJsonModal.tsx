import {
	Modal,
	Textarea,
	Button,
	Group,
	CopyButton,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useWorkflowState } from '../WorkflowStateContext';

interface WorkflowJsonModalProps {
	opened: boolean;
	onClose: () => void;
}

const WorkflowJsonModal = ({ opened, onClose }: WorkflowJsonModalProps) => {
	const { t } = useTranslation('campaigns');
	const { workflowJson } = useWorkflowState();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.workflow.json.title', {
				defaultValue: 'Workflow JSON Preview',
			})}
			size='lg'
			centered
		>
			<Group justify='flex-end' mb='xs'>
				<CopyButton value={workflowJson} timeout={2000}>
					{({ copied, copy }) => (
						<Tooltip
							label={copied ? 'Copied' : 'Copy'}
							withArrow
							position='right'
						>
							<ActionIcon
								color={copied ? 'teal' : 'blue'}
								variant='light'
								onClick={copy}
							>
								{copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
							</ActionIcon>
						</Tooltip>
					)}
				</CopyButton>
			</Group>
			<Textarea
				value={workflowJson}
				readOnly
				minRows={10}
				maxRows={20}
				autosize
				size='xs'
				styles={{
					input: {
						fontFamily: 'monospace',
						backgroundColor: 'var(--mantine-color-gray-0)',
					},
				}}
			/>
			<Group justify='flex-end' mt='md'>
				<Button onClick={onClose} size='sm' variant='light'>
					{t('common.close', { ns: 'common', defaultValue: 'Close' })}
				</Button>
			</Group>
		</Modal>
	);
};

export default WorkflowJsonModal;
