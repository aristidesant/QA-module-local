import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Badge, Button, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { IconChecks, IconFilterOff, IconInbox } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import {
	useNotificationStore,
	selectNotifications,
} from '~/stores/qa/notificationStore';
import AgentInboxTable from '~/modules/qa/agent/inbox/AgentInboxTable';
import InboxFilters from '~/modules/qa/agent/inbox/InboxFilters';
import {
	INBOX_KIND_META,
	INBOX_VIEWER_IDENTITY,
	agentNameOf,
	inboxViewerFromPath,
	kindOf,
	personNameOf,
	type InboxKind,
} from '~/modules/qa/inbox/constants';
import { archivedFor, inboxFor, needsAction } from '~/modules/qa/inbox/helpers';
import { notifyWithUndo } from '~/modules/qa/inbox/inboxToasts';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { AgentNotification } from '~/models/qa/notifications';

type InboxTab = 'needs' | 'all' | 'archived';
type Priority = AgentNotification['priority'];

const TABS: { value: InboxTab; labelKey: string }[] = [
	{ value: 'needs', labelKey: 'tabs.needsAction' },
	{ value: 'all', labelKey: 'tabs.all' },
	{ value: 'archived', labelKey: 'tabs.archived' },
];

const EMPTY_KEY: Record<InboxTab, string> = {
	needs: 'needsAction',
	all: 'all',
	archived: 'archived',
};

/**
 * Role-aware inbox for `/qa/{agent,supervisor,qa-manager,operation-manager}/inbox`.
 * Each role sees only what is addressed to it, split into what needs action, everything
 * and what was archived; opening a row shows a detail that fits the notification kind.
 */
export const InboxPage: React.FC = () => {
	const { t } = useTranslation('qa.inbox');
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const viewer = inboxViewerFromPath(location.pathname);
	const me = INBOX_VIEWER_IDENTITY[viewer];
	const isManager = viewer !== 'agent';

	const notifications = useNotificationStore(selectNotifications);
	const markAsRead = useNotificationStore((s) => s.markAsRead);
	const markAsUnread = useNotificationStore((s) => s.markAsUnread);
	const archiveNotification = useNotificationStore(
		(s) => s.archiveNotification
	);
	const unarchiveNotification = useNotificationStore(
		(s) => s.unarchiveNotification
	);

	/** Everything addressed to this role that is not archived, and what was archived. */
	const mine = useMemo(
		() => inboxFor(notifications, me.role, me.id),
		[notifications, me.role, me.id]
	);
	const archived = useMemo(
		() => archivedFor(notifications, me.role, me.id),
		[notifications, me.role, me.id]
	);

	// A link such as `?agent=AGT-006` (from Triggers) opens the manager's inbox on that agent.
	const initialAgent = isManager ? searchParams.get('agent') : null;

	const [tab, setTab] = useState<InboxTab>(() =>
		initialAgent ? 'all' : mine.some(needsAction) ? 'needs' : 'all'
	);
	const [search, setSearch] = useState('');
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [kinds, setKinds] = useState<InboxKind[]>([]);
	const [priorities, setPriorities] = useState<Priority[]>([]);
	const [agent, setAgent] = useState<string | null>(initialAgent);
	const [range, setRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);

	const counts = useMemo(
		() => ({
			needs: mine.filter(needsAction).length,
			all: mine.length,
			archived: archived.length,
		}),
		[mine, archived]
	);
	const unreadCount = useMemo(() => mine.filter((n) => !n.read).length, [mine]);

	const hasActiveFilters =
		unreadOnly ||
		kinds.length > 0 ||
		priorities.length > 0 ||
		agent !== null ||
		range[0] !== null ||
		range[1] !== null ||
		search.trim() !== '';

	const visible = useMemo(() => {
		const pool =
			tab === 'archived'
				? archived
				: tab === 'needs'
					? mine.filter(needsAction)
					: mine;
		const query = search.trim().toLowerCase();
		const [from, to] = range;
		return pool
			.filter((n) => {
				if (unreadOnly && n.read) return false;
				if (kinds.length > 0 && !kinds.includes(kindOf(n))) return false;
				if (priorities.length > 0 && !priorities.includes(n.priority))
					return false;
				if (agent && n.agentId !== agent) return false;
				const day = n.createdAt.slice(0, 10);
				if (from && day < from) return false;
				if (to && day > to) return false;
				if (query) {
					const haystack = [
						n.title,
						n.message,
						personNameOf(n.sourceId),
						agentNameOf(n.agentId),
					]
						.filter(Boolean)
						.join(' ')
						.toLowerCase();
					if (!haystack.includes(query)) return false;
				}
				return true;
			})
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}, [
		tab,
		mine,
		archived,
		search,
		unreadOnly,
		kinds,
		priorities,
		agent,
		range,
	]);

	/** Kinds present in this inbox, in display order. */
	const kindOptions = useMemo(() => {
		const present = new Set([...mine, ...archived].map(kindOf));
		return (Object.keys(INBOX_KIND_META) as InboxKind[]).filter((kind) =>
			present.has(kind)
		);
	}, [mine, archived]);

	/** Managers can narrow to one agent; empty when no item is about an agent. */
	const agentOptions = useMemo(() => {
		if (!isManager) return undefined;
		const ids = new Set(
			[...mine, ...archived]
				.map((n) => n.agentId)
				.filter((id) => agentNameOf(id) !== null)
		);
		return [...ids]
			.map((id) => ({ value: id, label: agentNameOf(id) as string }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [isManager, mine, archived]);

	const clearFilters = () => {
		setSearch('');
		setUnreadOnly(false);
		setKinds([]);
		setPriorities([]);
		setAgent(null);
		setRange([null, null]);
	};

	const handleView = (id: string) => {
		const notification = mine.find((n) => n.id === id);
		if (notification && !notification.read) markAsRead(id);
		navigate(`${location.pathname}/${id}`);
	};

	const handleToggleRead = (notification: AgentNotification) =>
		notification.read
			? markAsUnread(notification.id)
			: markAsRead(notification.id);

	const handleArchive = (id: string) => {
		archiveNotification(id);
		notifyWithUndo(t('toast.archived'), t('toast.undo'), () =>
			unarchiveNotification(id)
		);
	};

	const handleRestore = (id: string) => {
		unarchiveNotification(id);
		notifySuccess(t('toast.restored'));
	};

	const unreadVisible = visible.filter((n) => !n.read);
	const handleMarkAllRead = () => {
		unreadVisible.forEach((n) => markAsRead(n.id));
		notifySuccess(t('page.markedRead', { count: unreadVisible.length }));
	};

	const emptyState = hasActiveFilters ? (
		<EmptyState
			icon={<IconFilterOff size={40} />}
			message={t('empty.filtered.title')}
			description={t('empty.filtered.description')}
			action={
				<Button variant='default' size='xs' onClick={clearFilters}>
					{t('filters.clear')}
				</Button>
			}
		/>
	) : (
		<EmptyState
			icon={<IconInbox size={40} />}
			message={t(`empty.${EMPTY_KEY[tab]}.title`)}
			description={t(`empty.${EMPTY_KEY[tab]}.description`)}
		/>
	);

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start'>
					<div>
						<Text size='xs' fw={500} c='dimmed' tt='uppercase'>
							{t(`page.eyebrow.${viewer}`)}
						</Text>
						<Group gap='md' align='center'>
							<Title order={1}>{t('page.title')}</Title>
							{unreadCount > 0 && (
								<Badge color='gray' variant='light' size='lg'>
									{t('page.unread', { count: unreadCount })}
								</Badge>
							)}
						</Group>
						<Text c='dimmed' mt='xs'>
							{t('page.description')}
						</Text>
					</div>
					<Button
						variant='light'
						leftSection={<IconChecks size={16} />}
						disabled={tab === 'archived' || unreadVisible.length === 0}
						onClick={handleMarkAllRead}
					>
						{t('page.markAllRead')}
					</Button>
				</Group>

				<SectionCard
					title={t('page.sectionTitle')}
					description={t('page.sectionDescription')}
				>
					<Stack gap='md'>
						<Tabs
							value={tab}
							onChange={(value) => value && setTab(value as InboxTab)}
						>
							<Tabs.List>
								{TABS.map(({ value, labelKey }) => (
									<Tabs.Tab
										key={value}
										value={value}
										rightSection={
											<Badge size='xs' variant='light' color='gray'>
												{counts[value]}
											</Badge>
										}
									>
										{t(labelKey)}
									</Tabs.Tab>
								))}
							</Tabs.List>
						</Tabs>

						<InboxFilters
							search={search}
							onSearchChange={setSearch}
							unreadOnly={unreadOnly}
							onUnreadOnlyChange={setUnreadOnly}
							kindOptions={kindOptions}
							kinds={kinds}
							onKindsChange={setKinds}
							priorities={priorities}
							onPrioritiesChange={setPriorities}
							agentOptions={agentOptions}
							agent={agent}
							onAgentChange={setAgent}
							range={range}
							onRangeChange={setRange}
							hasActiveFilters={hasActiveFilters}
							onClear={clearFilters}
						/>

						{visible.length === 0 ? (
							emptyState
						) : (
							<AgentInboxTable
								notifications={visible}
								onView={handleView}
								onToggleRead={handleToggleRead}
								onArchive={handleArchive}
								onRestore={handleRestore}
								archivedView={tab === 'archived'}
								showAbout={(agentOptions?.length ?? 0) > 0}
							/>
						)}
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default InboxPage;
