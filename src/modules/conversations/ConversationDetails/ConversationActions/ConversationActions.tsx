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
	const { t } = useTranslation(['conversations', 'common']);
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
			title: t('actions.confirmTitle'),
			children: t('actions.reprocess.confirmMessage'),
			labels: {
				confirm: t('actions.reprocess.confirmLabel'),
				cancel: t('actions.cancel', { ns: 'common' }),
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
			title: t('actions.confirmTitle'),
			children: t('actions.fetchAndProcess.confirmMessage'),
			labels: {
				confirm: t('actions.fetchAndProcess.confirmLabel'),
				cancel: t('actions.cancel', { ns: 'common' }),
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
					label: t('actions.reprocess.label'),
					hint: t('actions.reprocess.hint'),
					onClick: handleReprocessEvent,
					loading: failAndPauseMutation.isPending,
					tooltip: t('actions.reprocess.tooltip'),
				}
			: {
					icon: IconRefresh,
					label: t('actions.fetchAndProcess.label'),
					hint: t('actions.fetchAndProcess.hint'),
					onClick: handleFetchAndProcess,
					loading: fetchAndProcessMutation.isPending,
					tooltip: t('actions.fetchAndProcess.tooltip'),
				};

	const ActiveActionIcon = currentAction.icon;

	return (
		<RightSectionCard
			title={t('actions.title')}
			description={t('actions.description')}
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
