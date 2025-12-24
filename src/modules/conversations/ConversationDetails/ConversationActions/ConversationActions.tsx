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
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useTranslation } from 'react-i18next';
import styles from './ConversationActions.module.css';

interface ConversationActionsProps {
	conversation: ConversationsModel;
	onReload?: () => void;
}

export function ConversationActions({
	conversation,
	onReload,
}: ConversationActionsProps) {
	const { t } = useTranslation();
	const failAndPauseMutation = useFailAndPauseConversation();
	const fetchAndProcessMutation = useFetchAndProcessConversation();
	const { canPerformAction } = usePermissions();
	const canExecuteConversations = canPerformAction(
		ModuleEnum.CONVERSATIONS,
		PermissionEnum.EXECUTE
	);

	if (!canExecuteConversations) {
		return null;
	}

	const handleReprocessEvent = () => {
		modals.openConfirmModal({
			title: t('conversations.actions.confirmTitle'),
			children: t('conversations.actions.reprocess.confirmMessage'),
			labels: {
				confirm: t('conversations.actions.reprocess.confirmLabel'),
				cancel: t('common.cancel'),
			},
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
			title: t('conversations.actions.confirmTitle'),
			children: t('conversations.actions.fetchAndProcess.confirmMessage'),
			labels: {
				confirm: t('conversations.actions.fetchAndProcess.confirmLabel'),
				cancel: t('common.cancel'),
			},
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
					label: t('conversations.actions.reprocess.label'),
					hint: t('conversations.actions.reprocess.hint'),
					onClick: handleReprocessEvent,
					loading: failAndPauseMutation.isPending,
					tooltip: t('conversations.actions.reprocess.tooltip'),
				}
			: {
					icon: IconRefresh,
					label: t('conversations.actions.fetchAndProcess.label'),
					hint: t('conversations.actions.fetchAndProcess.hint'),
					onClick: handleFetchAndProcess,
					loading: fetchAndProcessMutation.isPending,
					tooltip: t('conversations.actions.fetchAndProcess.tooltip'),
				};

	const ActiveActionIcon = currentAction.icon;

	return (
		<RightSectionCard
			title={t('conversations.actions.title')}
			description={t('conversations.actions.description')}
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
