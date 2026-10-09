import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Anchor,
	Badge,
	Breadcrumbs,
	Button,
	Grid,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconArchive, IconMailOpened } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import {
	selectNotifications,
	useNotificationStore,
} from '~/stores/qa/notificationStore';
import {
	CATEGORY_META,
	INBOX_IDENTITY,
	PRIORITY_COLOR,
	analyticsPath,
	customersPath,
	disputesBasePath,
	inboxRoleFromPath,
	lmsPath,
	personNameOf,
	rankingsBasePath,
} from '../constants';
import { agentContentPath } from '~/modules/qa/lms/constants';
import { buildNotification, inboxFor } from '../helpers';
import { CoachingSessionContext } from '../components/CoachingSessionContext';
import PayloadDetail from '../components/details';
import styles from '../components/Inbox.module.css';
import MessageThread from '../components/MessageThread';

/**
 * One inbox message on its own page (route `inbox/:notificationId`): the
 * message and what it covers on the left, its details, actions and the reply
 * thread beside it. Opening it marks it as read.
 */
export default function NotificationDetailPage() {
	const { t } = useTranslation('qa.inbox');
	const location = useLocation();
	const navigate = useNavigate();
	const { notificationId } = useParams<{ notificationId: string }>();

	const viewer = inboxRoleFromPath(location.pathname);
	const me = INBOX_IDENTITY[viewer];
	const notifications = useNotificationStore(selectNotifications);
	const markAsRead = useNotificationStore((s) => s.markAsRead);
	const markAsUnread = useNotificationStore((s) => s.markAsUnread);
	const archiveNotification = useNotificationStore(
		(s) => s.archiveNotification
	);
	const addReply = useNotificationStore((s) => s.addReply);
	const addNotification = useNotificationStore((s) => s.addNotification);

	// Back to the list this page hangs from, whichever role's inbox it is.
	const inboxListPath = location.pathname.replace(/\/[^/]+$/, '');
	const live =
		inboxFor(notifications, me.role, me.id).find(
			(n) => n.id === notificationId
		) ?? null;

	useEffect(() => {
		if (live && !live.read) markAsRead(live.id);
		// Mark once per opened message, including deep links.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [live?.id]);

	if (!live) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('detail.notFound')} />
			</ContentContainer>
		);
	}

	const meta = CATEGORY_META[live.category];
	const CategoryIcon = meta.icon;
	const payload = live.payload ?? { kind: 'MESSAGE' as const };
	const sender = personNameOf(live.sourceId) ?? t(`sources.${live.sourceRole}`);

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
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={() => navigate(inboxListPath)}>
						{t('detail.back')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{live.title}
					</Text>
				</Breadcrumbs>

				<Stack gap={6}>
					<Title order={1}>{live.title}</Title>
					<Text size='sm' c='dimmed'>
						{t('drawer.from', {
							name: sender,
							role: t(`sources.${live.sourceRole}`),
						})}{' '}
						· {dayjs(live.createdAt).format('DD MMM YYYY · HH:mm')}
					</Text>
					<Group gap='xs' mt={4}>
						<Badge
							color={meta.color}
							variant='light'
							leftSection={<CategoryIcon size={12} />}
						>
							{t(`categories.${live.category}`)}
						</Badge>
						<Badge color={PRIORITY_COLOR[live.priority]} variant='outline'>
							{t(`priorities.${live.priority}`)}
						</Badge>
					</Group>
				</Stack>

				<Grid gap='md'>
					<Grid.Col span={{ base: 12, md: 8 }}>
						<Stack gap='md'>
							<SectionCard padding='md'>
								<Text size='sm' className={styles.message}>
									{live.message}
								</Text>
							</SectionCard>

							{payload.kind === 'COACHING_SESSION' && (
								<CoachingSessionContext
									sessionId={payload.sessionId}
									agentId={live.agentId}
									onOpenMaterial={
										viewer === 'agent'
											? (contentId) => navigate(agentContentPath(contentId))
											: undefined
									}
								/>
							)}

							{showThread && (
								<SectionCard padding='md'>
									<MessageThread
										replies={replies}
										viewerRole={me.role}
										onSend={handleSend}
									/>
								</SectionCard>
							)}
						</Stack>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 4 }}>
						<Stack gap='md'>
							{payload.kind !== 'MESSAGE' && (
								<SectionCard padding='md'>
									<PayloadDetail payload={payload} />
								</SectionCard>
							)}

							<SectionCard padding='md'>
								<Stack gap='xs'>
									{cta && (
										<Button
											fullWidth
											variant='light'
											onClick={() => navigate(cta.to)}
										>
											{cta.label}
										</Button>
									)}
									{live.actions?.map((action) => (
										<Button
											key={action.label}
											fullWidth
											variant='default'
											onClick={() => navigate(action.url)}
										>
											{action.label}
										</Button>
									))}
									<Button
										fullWidth
										variant='subtle'
										color='gray'
										leftSection={<IconMailOpened size={16} />}
										onClick={() => {
											markAsUnread(live.id);
											navigate(inboxListPath);
										}}
									>
										{t('drawer.markUnread')}
									</Button>
									<Button
										fullWidth
										variant='subtle'
										color='red'
										leftSection={<IconArchive size={16} />}
										onClick={() => {
											archiveNotification(live.id);
											navigate(inboxListPath);
										}}
									>
										{t('drawer.archive')}
									</Button>
								</Stack>
							</SectionCard>
						</Stack>
					</Grid.Col>
				</Grid>
			</Stack>
		</ContentContainer>
	);
}
