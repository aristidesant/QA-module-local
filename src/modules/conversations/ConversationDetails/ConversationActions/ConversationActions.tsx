import { Button, Group, Text, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
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

type ConversationActionConfig = {
	icon: TablerIcon;
	label: string;
	hint: string;
	confirmMessage: string;
	confirmLabel: string;
	onConfirm: () => void;
	loading: boolean;
	notice: string;
};

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

	const handleMutationSuccess = () => {
		onReload?.();
	};

	const openActionConfirm = ({
		confirmMessage,
		confirmLabel,
		onConfirm,
	}: Pick<
		ConversationActionConfig,
		'confirmMessage' | 'confirmLabel' | 'onConfirm'
	>) => {
		modals.openConfirmModal({
			title: t('actions.confirmTitle'),
			children: confirmMessage,
			labels: {
				confirm: confirmLabel,
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			onConfirm,
		});
	};

	const currentAction: ConversationActionConfig =
		conversation.status === 'initiated'
			? {
					icon: IconArrowRight,
					label: t('actions.reprocess.label'),
					hint: t('actions.reprocess.hint'),
					confirmMessage: t('actions.reprocess.confirmMessage'),
					confirmLabel: t('actions.reprocess.confirmLabel'),
					onConfirm: () => {
						failAndPauseMutation.mutate(`${conversation.id}`, {
							onSuccess: handleMutationSuccess,
						});
					},
					loading: failAndPauseMutation.isPending,
					notice: t('actions.notice.irreversible'),
				}
			: {
					icon: IconRefresh,
					label: t('actions.fetchAndProcess.label'),
					hint: t('actions.fetchAndProcess.hint'),
					confirmMessage: t('actions.fetchAndProcess.confirmMessage'),
					confirmLabel: t('actions.fetchAndProcess.confirmLabel'),
					onConfirm: () => {
						fetchAndProcessMutation.mutate(`${conversation.id}`, {
							onSuccess: handleMutationSuccess,
						});
					},
					loading: fetchAndProcessMutation.isPending,
					notice: t('actions.notice.irreversible'),
				};

	const ActiveActionIcon = currentAction.icon;

	return (
		<RightSectionCard
			title={t('actions.title')}
			description={t('actions.description')}
		>
			<div className={styles.panel}>
				<Group
					className={styles.cardHeader}
					gap='xs'
					align='flex-start'
					wrap='nowrap'
				>
					<div className={styles.iconBadge}>
						<ActiveActionIcon size={18} />
					</div>
					<Stack gap='xs' className={styles.copy}>
						<Text size='sm' fw={600} className={styles.label}>
							{currentAction.label}
						</Text>
						<Text size='xs' c='dimmed' className={styles.hint}>
							{currentAction.hint}
						</Text>
					</Stack>
				</Group>
				<Button
					fullWidth
					variant='filled'
					color='blue'
					size='sm'
					leftSection={<ActiveActionIcon size={16} />}
					onClick={() => openActionConfirm(currentAction)}
					loading={currentAction.loading}
					className={styles.cta}
				>
					{currentAction.label}
				</Button>
				<Group gap={6} className={styles.notice} wrap='nowrap'>
					<IconAlertTriangle size={14} className={styles.noticeIcon} />
					<Text size='xs' className={styles.noticeText}>
						{currentAction.notice}
					</Text>
				</Group>
			</div>
		</RightSectionCard>
	);
}

export default ConversationActions;
