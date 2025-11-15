import { Center, ActionIcon, Tooltip, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconArrowRight,
	IconRefresh,
	type TablerIcon,
} from '@tabler/icons-react';
import {
	useFailAndPauseConversation,
	useFetchAndProcessConversation,
} from '~/queries/conversationsQueries';
import RightSectionCard from '~/components/RightSectionCard';
import { ConversationsModel } from '~/models/ConversationsModels';
import styles from './ConversationActions.module.css';

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

	const currentAction: {
		icon: TablerIcon;
		label: string;
		hint: string;
		onClick: () => void;
		loading: boolean;
		tooltip: string;
	} =
		conversation.status === 'initiated'
			? {
					icon: IconArrowRight,
					label: 'Reprocess Event',
					hint: 'Retry the current event to get the conversation back on track.',
					onClick: handleReprocessEvent,
					loading: failAndPauseMutation.isPending,
					tooltip: 'Reprocess Event',
				}
			: {
					icon: IconRefresh,
					label: 'Fetch and Process',
					hint: 'Grab the latest data and let the pipeline run again.',
					onClick: handleFetchAndProcess,
					loading: fetchAndProcessMutation.isPending,
					tooltip: 'Fetch and Process',
				};

	const ActiveActionIcon = currentAction.icon;

	return (
		<RightSectionCard
			title='Actions'
			description='Actions that can be performed on this conversation.'
		>
			<Center className={styles.actions}>
				<div className={styles.actionItem}>
					<Tooltip label={currentAction.tooltip} position='top'>
						<ActionIcon
							size='lg'
							variant='light'
							onClick={currentAction.onClick}
							loading={currentAction.loading}
							className={styles.actionIcon}
							aria-label={currentAction.label}
						>
							<ActiveActionIcon size={20} />
						</ActionIcon>
					</Tooltip>
					<div className={styles.copy}>
						<Text className={styles.actionLabel}>{currentAction.label}</Text>
						<Text className={styles.actionHint}>{currentAction.hint}</Text>
					</div>
				</div>
			</Center>
		</RightSectionCard>
	);
}

export default ConversationActions;
