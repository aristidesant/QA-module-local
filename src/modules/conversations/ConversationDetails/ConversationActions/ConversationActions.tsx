import { Center, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconArrowRight } from '@tabler/icons-react';
import { useFailAndPauseConversation } from '~/queries/conversationsQueries';
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

	const handleFailAndPause = () => {
		modals.openConfirmModal({
			title: 'Confirm Action',
			children:
				'Are you sure you want to fail and pause this conversation? This action cannot be undone.',
			labels: { confirm: 'Yes, Fail and Pause', cancel: 'Cancel' },
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

	return (
		<RightSectionCard
			title='Actions'
			description='Actions that can be performed on this conversation.'
		>
			<Center>
				{['initiated'].includes(conversation.status) && (
					<Button
						leftSection={<IconArrowRight size={16} />}
						onClick={handleFailAndPause}
						loading={failAndPauseMutation.isPending}
						variant='light'
					>
						Fail and Pause
					</Button>
				)}
			</Center>
		</RightSectionCard>
	);
}

export default ConversationActions;
