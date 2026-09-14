import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	ActionIcon,
	Badge,
	Button,
	Divider,
	Group,
	Paper,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconArchive, IconMailOpened } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { AppDrawer } from '~/components/AppDrawer';
import type { AgentNotification } from '~/models/qa/notifications';
import {
	useNotificationStore,
	selectNotifications,
} from '~/stores/qa/notificationStore';
import { buildNotification } from '../helpers';
import {
	CATEGORY_META,
	INBOX_IDENTITY,
	PRIORITY_COLOR,
	analyticsPath,
	coachingPath,
	customersPath,
	disputesBasePath,
	lmsPath,
	personNameOf,
	rankingsBasePath,
	type InboxRole,
} from '../constants';
import PayloadDetail from './details';
import MessageThread from './MessageThread';
import styles from './Inbox.module.css';

interface NotificationDetailDrawerProps {
	notification: AgentNotification | null;
	opened: boolean;
	onClose: () => void;
	viewer: InboxRole;
}

/**
 * One drawer for every notification kind: metadata, the message, a body that
 * fits the payload, the actions it carries and the reply thread.
 */
export const NotificationDetailDrawer: React.FC<
	NotificationDetailDrawerProps
> = ({ notification, opened, onClose, viewer }) => {
	const { t } = useTranslation('qa.inbox');
	const navigate = useNavigate();
	const addReply = useNotificationStore((s) => s.addReply);
	const addNotification = useNotificationStore((s) => s.addNotification);
	const markAsUnread = useNotificationStore((s) => s.markAsUnread);
	const archiveNotification = useNotificationStore(
		(s) => s.archiveNotification
	);
	// Subscribing keeps the open drawer in sync after a reply is appended.
	const notifications = useNotificationStore(selectNotifications);

	if (!notification) return null;

	const live =
		notifications.find((n) => n.id === notification.id) ?? notification;
	const me = INBOX_IDENTITY[viewer];
	const meta = CATEGORY_META[live.category];
	const CategoryIcon = meta.icon;
	const payload = live.payload ?? { kind: 'MESSAGE' as const };

	/** Where the kind's primary call to action leads. */
	const primaryAction = (): { label: string; to: string } | null => {
		switch (payload.kind) {
			case 'METRIC_ALERT':
				return {
					label: t('details.metricAlert.cta'),
					to: analyticsPath(viewer),
				};
			case 'TREND_WARNING':
				return {
					label: t('details.trendWarning.cta'),
					to: analyticsPath(viewer),
				};
			case 'BURNOUT_RISK':
				return viewer === 'agent'
					? null
					: {
							label: t('details.burnout.ctaManager'),
							to: `${analyticsPath(viewer)}?view=burnout`,
						};
			case 'BADGE_EARNED':
				return { label: t('details.badge.cta'), to: rankingsBasePath(viewer) };
			case 'WEEKLY_SUMMARY':
				return { label: t('details.weekly.cta'), to: analyticsPath(viewer) };
			case 'COACHING_SESSION':
				return { label: t('details.coaching.cta'), to: coachingPath(viewer) };
			case 'LMS_ASSIGNMENT':
				return { label: t('details.lms.cta'), to: lmsPath(viewer) };
			case 'FOLLOW_UP':
				return viewer === 'agent'
					? null
					: {
							label: t('details.followUp.cta'),
							to: `${customersPath(viewer)}/${payload.customerId}`,
						};
			case 'DISPUTE_UPDATE':
				return {
					label: t('details.dispute.cta'),
					to: `${disputesBasePath(viewer)}/${payload.disputeId}`,
				};
			case 'RANKING_UPDATE':
				return {
					label: t('details.ranking.cta'),
					to: rankingsBasePath(viewer),
				};
			default:
				return null;
		}
	};

	const cta = primaryAction();
	const replies = live.replies ?? [];
	const showThread = live.sourceRole !== 'SYSTEM' || replies.length > 0;

	const handleSend = (message: string) => {
		addReply(live.id, {
			fromRole: me.role,
			fromId: me.id,
			message,
		});

		// Mirror the reply into the other party's inbox so the conversation is two-sided.
		// An agent answers whoever wrote; a manager always answers the agent.
		const manager =
			live.sourceRole === 'SUPERVISOR' || live.sourceRole === 'QA_MANAGER'
				? live.sourceRole
				: null;
		const replyToManager = viewer === 'agent' && manager !== null;
		addNotification(
			buildNotification({
				agentId: live.agentId,
				recipientRole: replyToManager ? manager : 'AGENT',
				recipientId: replyToManager ? live.sourceId : live.agentId,
				category: 'DIRECT_MESSAGE',
				title: t('reply.title', { name: me.name }),
				message,
				icon: 'message',
				sourceRole: me.role,
				sourceId: me.id,
				threadId: live.id,
				payload: { kind: 'MESSAGE' },
			})
		);
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={live.title}
			description={t('drawer.from', {
				name: personNameOf(live.sourceId) ?? t(`sources.${live.sourceRole}`),
				role: t(`sources.${live.sourceRole}`),
			})}
			icon={<CategoryIcon size={20} />}
			iconColor={meta.color}
			headerActions={
				<Group gap={4}>
					<Tooltip label={t('drawer.markUnread')} withArrow>
						<ActionIcon
							variant='subtle'
							onClick={() => {
								markAsUnread(live.id);
								onClose();
							}}
						>
							<IconMailOpened size={18} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('drawer.archive')} withArrow>
						<ActionIcon
							variant='subtle'
							color='red'
							onClick={() => {
								archiveNotification(live.id);
								onClose();
							}}
						>
							<IconArchive size={18} />
						</ActionIcon>
					</Tooltip>
				</Group>
			}
		>
			<Stack gap='lg'>
				<Group gap='xs' wrap='wrap'>
					<Badge color={meta.color} variant='light'>
						{t(`categories.${live.category}`)}
					</Badge>
					<Badge color={PRIORITY_COLOR[live.priority]} variant='outline'>
						{t(`priorities.${live.priority}`)}
					</Badge>
					<Text size='xs' c='dimmed'>
						{dayjs(live.createdAt).format('DD MMM YYYY · HH:mm')}
					</Text>
				</Group>

				<Text size='sm' className={styles.message}>
					{live.message}
				</Text>

				{payload.kind !== 'MESSAGE' && (
					<Paper withBorder p='md' radius='md'>
						<PayloadDetail payload={payload} />
					</Paper>
				)}

				{(cta || (live.actions?.length ?? 0) > 0) && (
					<Group gap='xs' wrap='wrap'>
						{cta && (
							<Button
								variant='light'
								size='sm'
								onClick={() => {
									onClose();
									navigate(cta.to);
								}}
							>
								{cta.label}
							</Button>
						)}
						{live.actions?.map((action) => (
							<Button
								key={action.label}
								variant='subtle'
								size='sm'
								onClick={() => {
									onClose();
									navigate(action.url);
								}}
							>
								{action.label}
							</Button>
						))}
					</Group>
				)}

				{showThread && (
					<>
						<Divider />
						<MessageThread
							replies={replies}
							viewerRole={me.role}
							onSend={handleSend}
						/>
					</>
				)}
			</Stack>
		</AppDrawer>
	);
};

export default NotificationDetailDrawer;
