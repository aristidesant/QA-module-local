import type { KeyboardEvent, MouseEvent } from 'react';
import { ActionIcon, Badge, Loader, Text, Tooltip } from '@mantine/core';
import {
	IconChevronRight,
	IconPlayerTrackNext,
	IconRefresh,
	IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import { useTranslation } from 'react-i18next';
import type { ConversationsModel } from '~/models/ConversationsModels';
import { getConversationActionDefinition } from '~/modules/conversations/ConversationDetails/ConversationActions/ConversationActions.helpers';
import styles from './ConversationListItem.module.css';

dayjs.extend(relativeTime);
dayjs.extend(timezone);

type ConversationListItemProps = {
	conversation: ConversationsModel;
	userTimezone: string;
	onClick: () => void;
	canExecute?: boolean;
	onActionClick?: (
		event: MouseEvent<HTMLButtonElement>,
		conversation: ConversationsModel
	) => void;
	isActionLoading?: boolean;
};

const resolveStatus = (status?: string | null) => {
	const normalized = (status ?? '').toLowerCase();

	if (
		normalized.includes('complete') ||
		normalized.includes('success') ||
		normalized.includes('done')
	) {
		return { color: 'green', key: 'done' } as const;
	}
	if (normalized.includes('progress') || normalized.includes('running')) {
		return { color: 'blue', key: 'inProgress' } as const;
	}
	if (
		normalized.includes('failed') ||
		normalized.includes('error') ||
		normalized.includes('cancel')
	) {
		return { color: 'red', key: 'failed' } as const;
	}
	if (
		normalized.includes('pending') ||
		normalized.includes('queued') ||
		normalized.includes('waiting') ||
		normalized.includes('initiated')
	) {
		return { color: 'yellow', key: 'pending' } as const;
	}

	return { color: 'gray', key: 'unknown' } as const;
};

export default function ConversationListItem({
	conversation,
	userTimezone,
	onClick,
	canExecute = false,
	onActionClick,
	isActionLoading = false,
}: ConversationListItemProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const status = resolveStatus(conversation.status);
	const action = getConversationActionDefinition(conversation, t);
	const ActionIconComponent =
		action.key === 'reprocess' ? IconPlayerTrackNext : IconRefresh;
	const contactName = conversation.contactName || t('list.unknownContact');
	const startedAt = conversation.startDate || conversation.createdAt;
	const zonedDate = startedAt ? dayjs.utc(startedAt).tz(userTimezone) : null;
	const disposition = conversation.dispositions?.dispositionName;

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClick();
		}
	};

	return (
		<div
			className={styles.item}
			role='button'
			tabIndex={0}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			aria-label={t('list.openConversation', { contact: contactName })}
		>
			<div className={styles.avatar} aria-hidden='true'>
				<IconUser size={18} />
			</div>

			<div className={styles.content}>
				<div className={styles.titleRow}>
					<div className={styles.contact}>
						<Text size='sm' fw={650} lineClamp={1}>
							{contactName}
						</Text>
						<Text size='xs' className={styles.phone} lineClamp={1}>
							{conversation.contactPhoneNumber ||
								t('overview.fallbacks.noPhone')}
						</Text>
					</div>
					<Badge color={status.color} variant='light' size='sm' radius='xl'>
						{t(`list.status.${status.key}`)}
					</Badge>
				</div>

				<div className={styles.meta}>
					<Text size='xs' lineClamp={1}>
						{disposition || t('overview.fallbacks.na')}
					</Text>
					<span className={styles.metaDivider} aria-hidden='true' />
					<Text size='xs' className={styles.date}>
						{zonedDate ? zonedDate.fromNow() : t('overview.fallbacks.na')}
					</Text>
				</div>
			</div>

			<div className={styles.itemActions}>
				{canExecute && onActionClick && (
					<Tooltip label={action.hint} withArrow>
						<ActionIcon
							variant='subtle'
							color={action.color}
							size='lg'
							aria-label={action.label}
							disabled={isActionLoading}
							onClick={(event) => onActionClick(event, conversation)}
						>
							{isActionLoading ? (
								<Loader size={15} />
							) : (
								<ActionIconComponent size={17} />
							)}
						</ActionIcon>
					</Tooltip>
				)}
				<IconChevronRight
					size={18}
					className={styles.chevron}
					aria-hidden='true'
				/>
			</div>
		</div>
	);
}
