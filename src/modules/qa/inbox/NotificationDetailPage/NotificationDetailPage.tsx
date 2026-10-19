import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Avatar,
	Badge,
	Button,
	Divider,
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import {
	IconArchive,
	IconArrowLeft,
	IconArrowRight,
	IconMail,
	IconMailOpened,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { selectSessions, useCoachingStore } from '~/stores/qa/coachingStore';
import {
	selectNotifications,
	useNotificationStore,
} from '~/stores/qa/notificationStore';
import { useTeamStore } from '~/stores/qa/teamStore';
import {
	INBOX_KIND_META,
	INBOX_VIEWER_IDENTITY,
	PRIORITY_TONE,
	analyticsPath,
	coachingPath,
	customersPath,
	disputesBasePath,
	inboxRouteRole,
	inboxViewerFromPath,
	kindOf,
	lmsPath,
	personNameOf,
	rankingsBasePath,
} from '../constants';
import { agentContentPath } from '~/modules/qa/lms/constants';
import {
	buildNotification,
	findCoachingSessionFor,
	inboxFor,
} from '../helpers';
import { AutomatedCoachingMessage } from '../components/AutomatedCoachingMessage';
import { CoachingSessionContext } from '../components/CoachingSessionContext';
import PayloadDetail from '../components/details';
import styles from '../components/Inbox.module.css';
import MessageThread from '../components/MessageThread';
import { notifyWithUndo } from '../inboxToasts';
import { notifySuccess } from '~/modules/qa/utils/notifications';

/**
 * One inbox message on its own page (route `inbox/:notificationId`): who sent
 * it and its facts across the top, the message and what it covers on the left,
 * the actions beside it. Opening it marks it as read.
 */
export default function NotificationDetailPage() {
	const { t } = useTranslation('qa.inbox');
	const location = useLocation();
	const navigate = useNavigate();
	const { notificationId } = useParams<{ notificationId: string }>();

	const viewer = inboxViewerFromPath(location.pathname);
	const me = INBOX_VIEWER_IDENTITY[viewer];
	// The Operation Manager reuses the QA Manager's routes.
	const routeRole = inboxRouteRole(viewer);
	const notifications = useNotificationStore(selectNotifications);
	const markAsRead = useNotificationStore((s) => s.markAsRead);
	const markAsUnread = useNotificationStore((s) => s.markAsUnread);
	const archiveNotification = useNotificationStore(
		(s) => s.archiveNotification
	);
	const unarchiveNotification = useNotificationStore(
		(s) => s.unarchiveNotification
	);
	const addReply = useNotificationStore((s) => s.addReply);
	const addNotification = useNotificationStore((s) => s.addNotification);
	const coachingSessions = useCoachingStore(selectSessions);
	const profiles = useTeamStore((s) => s.profiles);

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
				<EmptyState
					message={t('detail.notFound')}
					action={
						<Button variant='default' onClick={() => navigate(inboxListPath)}>
							{t('detail.notFoundAction')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const kind = kindOf(live);
	const KindIcon = INBOX_KIND_META[kind].icon;
	const payload = live.payload ?? { kind: 'MESSAGE' as const };
	const sender = personNameOf(live.sourceId) ?? t(`sources.${live.sourceRole}`);

	// Only a weekly automated message gets the structured body; a 1:1 notice keeps the plain text.
	const coachSession =
		payload.kind === 'COACHING_SESSION'
			? findCoachingSessionFor(
					coachingSessions,
					payload.sessionId,
					live.agentId
				)
			: null;
	const agentProfile = profiles[live.agentId];
	const automated =
		coachSession?.type === 'AI_MESSAGE' && agentProfile
			? { session: coachSession, profile: agentProfile }
			: null;

	/** Where the kind's primary call to action leads. */
	const primaryAction = (): { label: string; to: string } | null => {
		switch (payload.kind) {
			case 'METRIC_ALERT':
				return {
					label: t('details.metricAlert.cta'),
					to: analyticsPath(routeRole),
				};
			case 'TREND_WARNING':
				return {
					label: t('details.trendWarning.cta'),
					to: analyticsPath(routeRole),
				};
			case 'BURNOUT_RISK':
				return viewer === 'agent'
					? null
					: {
							label: t('details.burnout.ctaManager'),
							to: `${analyticsPath(routeRole)}?view=burnout`,
						};
			case 'BADGE_EARNED':
				return {
					label: t('details.badge.cta'),
					to: rankingsBasePath(routeRole),
				};
			case 'WEEKLY_SUMMARY':
				return { label: t('details.weekly.cta'), to: analyticsPath(routeRole) };
			case 'COACHING_SESSION':
				return {
					label: t('details.coaching.cta'),
					to: coachingPath(routeRole),
				};
			case 'LMS_ASSIGNMENT':
				return { label: t('details.lms.cta'), to: lmsPath(routeRole) };
			case 'FOLLOW_UP':
				return viewer === 'agent'
					? null
					: {
							label: t('details.followUp.cta'),
							to: `${customersPath(routeRole)}/${payload.customerId}`,
						};
			case 'DISPUTE_UPDATE':
				return {
					label: t('details.dispute.cta'),
					to: `${disputesBasePath(routeRole)}/${payload.disputeId}`,
				};
			case 'RANKING_UPDATE':
				return {
					label: t('details.ranking.cta'),
					to: rankingsBasePath(routeRole),
				};
			default:
				return null;
		}
	};

	const cta = primaryAction();
	const replies = live.replies ?? [];
	const showThread =
		viewer !== 'operation-manager' &&
		(live.sourceRole !== 'SYSTEM' || replies.length > 0);

	const handleSend = (message: string) => {
		// The Operation Manager has no reply thread.
		if (me.role === 'OPERATION_MANAGER') return;

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
		notifySuccess(t('toast.replySent'));
	};

	const handleToggleRead = () => {
		if (live.read) {
			markAsUnread(live.id);
			notifySuccess(t('toast.markedUnread'));
		} else {
			markAsRead(live.id);
			notifySuccess(t('toast.markedRead'));
		}
	};

	const handleArchive = () => {
		archiveNotification(live.id);
		notifyWithUndo(t('toast.archived'), t('toast.undo'), () =>
			unarchiveNotification(live.id)
		);
		navigate(inboxListPath);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='md' maw={960} mx='auto'>
				<Paper withBorder radius='md' className={styles.reader}>
					<Group gap='xs' wrap='wrap' className={styles.toolbar}>
						<Button
							variant='subtle'
							color='gray'
							size='sm'
							leftSection={<IconArrowLeft size={16} />}
							onClick={() => navigate(inboxListPath)}
						>
							{t('detail.back')}
						</Button>
						<Divider orientation='vertical' />
						<Button
							variant='subtle'
							color='gray'
							size='sm'
							leftSection={
								live.read ? (
									<IconMail size={16} />
								) : (
									<IconMailOpened size={16} />
								)
							}
							onClick={handleToggleRead}
						>
							{t(
								live.read
									? 'table.actions.markUnread'
									: 'table.actions.markRead'
							)}
						</Button>
						<Button
							variant='subtle'
							color='gray'
							size='sm'
							leftSection={<IconArchive size={16} />}
							onClick={handleArchive}
						>
							{t('drawer.archive')}
						</Button>
						<Group gap='xs' wrap='wrap' ml='auto'>
							{live.actions?.map((action) => (
								<Button
									key={action.label}
									variant='default'
									size='sm'
									onClick={() => navigate(action.url)}
								>
									{action.label}
								</Button>
							))}
							{cta && (
								<Button
									variant='light'
									size='sm'
									rightSection={<IconArrowRight size={16} />}
									onClick={() => navigate(cta.to)}
								>
									{cta.label}
								</Button>
							)}
						</Group>
					</Group>

					<div className={styles.readerHeader}>
						<Stack gap='sm'>
							<Group gap='xs'>
								<Badge
									size='sm'
									color='gray'
									variant='light'
									leftSection={<KindIcon size={12} />}
								>
									{t(`kinds.${kind}`)}
								</Badge>
								<Badge
									size='sm'
									color={PRIORITY_TONE[live.priority] ?? 'gray'}
									variant='light'
								>
									{t(`priorities.${live.priority}`)}
								</Badge>
							</Group>
							<Title order={1} size='h2'>
								{live.title}
							</Title>
							<Group gap='sm' wrap='nowrap' align='center'>
								<Avatar name={sender} color='gray' radius='xl' size='md' />
								<div>
									<Text size='sm' fw={600}>
										{sender}
									</Text>
									<Text size='xs' c='dimmed'>
										{t(`sources.${live.sourceRole}`)}
									</Text>
								</div>
								<Text size='xs' c='dimmed' ml='auto'>
									{dayjs(live.createdAt).format('DD MMM YYYY · HH:mm')}
								</Text>
							</Group>
						</Stack>
					</div>

					{!automated && (
						<div className={styles.readerBody}>
							<Text size='md' lh={1.6} maw='72ch' className={styles.message}>
								{live.message}
							</Text>
						</div>
					)}

					{payload.kind !== 'MESSAGE' && (
						<div className={styles.readerFacts}>
							<PayloadDetail payload={payload} />
						</div>
					)}
				</Paper>

				{automated && (
					<AutomatedCoachingMessage
						session={automated.session}
						profile={automated.profile}
					/>
				)}

				{payload.kind === 'COACHING_SESSION' && (
					<CoachingSessionContext
						sessionId={payload.sessionId}
						agentId={live.agentId}
						materialsOnly={Boolean(automated)}
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
		</ContentContainer>
	);
}
