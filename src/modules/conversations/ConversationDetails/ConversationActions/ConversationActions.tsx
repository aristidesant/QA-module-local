import { Center, ActionIcon, Tooltip, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconArrowRight, IconRefresh } from '@tabler/icons-react';
import {
	useFailAndPauseConversation,
	useFetchAndProcessConversation,
} from '~/queries/conversationsQueries';
import RightSectionCard from '~/components/RightSectionCard';
import { ConversationsModel } from '~/models/ConversationsModels';

interface ConversationActionsProps {
	conversation: ConversationsModel;
	onReload?: () => void;
}

export function ConversationActions({
	conversation,
	onReload,
}: ConversationActionsProps) {
	const failAndPauseMutation = useFailAndPauseConversation();
	const fetchAndProcessMutation = useFetchAndProcessConversation();

	const handleReprocessEvent = () => {
		modals.openConfirmModal({
			title: 'Confirm Action',
			children:
				'Are you sure you want to reprocess this event? This action cannot be undone.',
			labels: { confirm: 'Yes, Reprocess Event', cancel: 'Cancel' },
			onConfirm: () => {
				failAndPauseMutation.mutate(`${conversation.id}`, {
					onSuccess: () => {
						if (onReload) {
							onReload();
						}
					},
				});
			},
		});
	};

	const handleFetchAndProcess = () => {
		modals.openConfirmModal({
			title: 'Confirm Action',
			children:
				'Are you sure you want to fetch and process this conversation? This action cannot be undone.',
			labels: { confirm: 'Yes, Fetch and Process', cancel: 'Cancel' },
			onConfirm: () => {
				fetchAndProcessMutation.mutate(`${conversation.id}`, {
					onSuccess: () => {
						if (onReload) {
							onReload();
						}
					},
				});
			},
		});
	};

	return (
		<RightSectionCard
			title='Actions'
			description='Actions that can be performed on this conversation.'
		>
			<Center>
				<Group gap='md'>
					{conversation.status === 'initiated' && (
						<Tooltip label='Reprocess Event'>
							<ActionIcon
								size='lg'
								variant='light'
								onClick={handleReprocessEvent}
								loading={failAndPauseMutation.isPending}
							>
								<IconArrowRight size={20} />
							</ActionIcon>
						</Tooltip>
					)}
					{conversation.status !== 'initiated' && (
						<Tooltip label='Fetch and Process'>
							<ActionIcon
								size='lg'
								variant='light'
								onClick={handleFetchAndProcess}
								loading={fetchAndProcessMutation.isPending}
							>
								<IconRefresh size={20} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</Center>
		</RightSectionCard>
	);
}

export default ConversationActions;
