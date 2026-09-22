import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { PendingLearningItem } from './CoachingLearningWidget';

interface CommitLearningModalProps {
	item: PendingLearningItem | null;
	opened: boolean;
	onClose: () => void;
	onCommit: () => void;
}

/**
 * Confirms the agent's commitment to a due date before opening pending
 * material from the dashboard — the supervisor set the date, so clicking
 * through shouldn't silently open the content without that acknowledgment.
 */
export function CommitLearningModal({
	item,
	opened,
	onClose,
	onCommit,
}: CommitLearningModalProps) {
	if (!item) return null;
	const { assignment, content } = item;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Commit to this material'
			centered
		>
			<Stack gap='sm'>
				<Text fw={600}>{content?.title ?? assignment.contentId}</Text>
				<Group gap={6}>
					<IconCalendarEvent size={16} />
					<Text size='sm'>
						Due {dayjs(assignment.dueDate).format('D MMM YYYY')}
					</Text>
				</Group>
				<Text size='xs' c='dimmed'>
					Assigned by {assignment.assignedBy}
				</Text>
				<Text size='sm'>
					By continuing, you're committing to complete this by the date your
					supervisor set.
				</Text>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						Not yet
					</Button>
					<Button onClick={onCommit}>I commit — open material</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

export default CommitLearningModal;
