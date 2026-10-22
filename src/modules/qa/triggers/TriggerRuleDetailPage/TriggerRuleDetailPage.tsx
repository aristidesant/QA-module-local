import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { modals } from '@mantine/modals';
import {
	ActionIcon,
	Anchor,
	Badge,
	Breadcrumbs,
	Button,
	Divider,
	Group,
	Menu,
	SimpleGrid,
	Stack,
	Tabs,
	Text,
	Title,
} from '@mantine/core';
import {
	IconCopy,
	IconDotsVertical,
	IconEdit,
	IconPlayerPause,
	IconPlayerPlay,
	IconSend,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TriggerActivityEntry } from '~/models/qa';
import { ContentContainer } from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import {
	AREA_COLORS,
	RULE_TYPE_META,
	SEVERITY_COLORS,
	STATUS_COLORS,
	triggerRulePath,
	triggersBasePath,
	triggersRoleFromPath,
} from '~/modules/qa/triggers/constants';
import {
	getRuleArea,
	interpolateTemplate,
} from '~/modules/qa/triggers/helpers';
import ConditionSummaryList from '../components/ConditionSummaryList';
import ActivityTable from '../components/ActivityTable';
import ActivityDetailDrawer from '../components/ActivityDetailDrawer';
import { RuleEditorDrawer } from '../components/RuleEditorDrawer';
import classes from './TriggerRuleDetailPage.module.css';

/** One trigger rule on its own page (route `triggers/rules/:ruleId`): condition, scope, delivery, message, frequency and activity. */
export default function TriggerRuleDetailPage() {
	const { t } = useTranslation('qa.triggers');
	const location = useLocation();
	const navigate = useNavigate();
	const { ruleId } = useParams<{ ruleId: string }>();
	const dateFormatter = useDateFormatter();

	const role = triggersRoleFromPath(location.pathname);
	const rule = useTriggerRulesStore((s) =>
		s.rules.find((r) => r.id === ruleId)
	);
	const activity = useTriggerRulesStore((s) => s.activity);
	const deleteRule = useTriggerRulesStore((s) => s.deleteRule);
	const setRuleStatus = useTriggerRulesStore((s) => s.setRuleStatus);
	const duplicateRule = useTriggerRulesStore((s) => s.duplicateRule);

	const [editing, setEditing] = useState(false);
	const [activityEntry, setActivityEntry] =
		useState<TriggerActivityEntry | null>(null);

	const ruleActivity = useMemo(() => {
		if (!rule) return [];
		return activity
			.filter((a) => a.ruleId === rule.id)
			.sort(
				(a, b) => new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime()
			)
			.slice(0, 10);
	}, [rule, activity]);

	const editorRole = role === 'supervisor' ? 'supervisor' : 'qaManager';
	const inboxPath =
		role === 'supervisor' ? '/qa/supervisor/inbox' : '/qa/qa-manager/inbox';

	if (!rule) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('detail.notFound')} />
			</ContentContainer>
		);
	}

	const meta = RULE_TYPE_META[rule.type];
	const area = getRuleArea(rule);
	const backToTriggers = () =>
		navigate(
			`${triggersBasePath(role)}?tab=${rule.kind === 'ALERT' ? 'alerts' : 'recognition'}`
		);

	const handleToggle = () => {
		const next = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
		setRuleStatus(rule.id, next);
		notifySuccess(
			t(`rules.notifications.${next === 'ACTIVE' ? 'activated' : 'paused'}`)
		);
	};

	const handleDuplicate = () => {
		const copy = duplicateRule(rule.id);
		if (copy) {
			notifySuccess(t('rules.notifications.duplicated'));
			navigate(triggerRulePath(role, copy.id));
		}
	};

	const handleSendTest = () => {
		notifySuccess(
			t('rules.notifications.testSent', { agent: 'Sarah Johnson' })
		);
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: t('rules.confirmDelete.title'),
			children: (
				<Text size='sm'>
					{t('rules.confirmDelete.message', { name: rule.name })}
				</Text>
			),
			labels: {
				confirm: t('rules.confirmDelete.confirm'),
				cancel: t('rules.confirmDelete.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				deleteRule(rule.id);
				notifySuccess(t('rules.notifications.deleted'));
				backToTriggers();
			},
		});
	};

	const renderRecipientsList = () => {
		const {
			agentIds,
			supervisorIds,
			campaignIds,
			linesOfBusiness,
			campaignTypes,
		} = rule.scope;
		if (
			!agentIds.length &&
			!supervisorIds.length &&
			!campaignIds.length &&
			!linesOfBusiness.length &&
			!campaignTypes.length
		) {
			return <Text size='sm'>{t('detail.everyone')}</Text>;
		}
		const rows: { label: string; values: string[] }[] = [
			{ label: t('detail.agents'), values: agentIds },
			{ label: t('detail.supervisors'), values: supervisorIds },
			{ label: t('detail.campaigns'), values: campaignIds },
			{ label: t('detail.linesOfBusiness'), values: linesOfBusiness },
			{
				label: t('detail.campaignTypes'),
				values: campaignTypes.map((type) => t(`campaignTypes.${type}`)),
			},
		];
		return (
			<Stack gap='xs'>
				{rows
					.filter((row) => row.values.length > 0)
					.map((row) => (
						<Group key={row.label} gap='xs'>
							<Text size='xs' fw={600} w={120}>
								{row.label}:
							</Text>
							<Group gap='xs'>
								{row.values.map((value) => (
									<Badge key={value} size='sm' variant='outline'>
										{value}
									</Badge>
								))}
							</Group>
						</Group>
					))}
			</Stack>
		);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg' maw={960} mx='auto' px='md'>
				<Breadcrumbs>
					<Anchor size='sm' onClick={backToTriggers}>
						{t('page.title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{rule.name}
					</Text>
				</Breadcrumbs>

				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Stack gap={4} flex={1}>
						<Group gap='sm' wrap='nowrap'>
							<meta.icon size={22} />
							<Title order={1}>{rule.name}</Title>
						</Group>
						{rule.description && (
							<Text c='dimmed' size='sm'>
								{rule.description}
							</Text>
						)}
					</Stack>
					<Group gap='xs' wrap='nowrap'>
						<Button
							size='sm'
							variant='default'
							leftSection={<IconEdit size={14} />}
							onClick={() => setEditing(true)}
						>
							{t('rules.actions.edit')}
						</Button>
						<Menu withinPortal position='bottom-end'>
							<Menu.Target>
								<ActionIcon variant='subtle' color='gray' size='lg'>
									<IconDotsVertical size={16} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconCopy size={14} />}
									onClick={handleDuplicate}
								>
									{t('rules.actions.duplicate')}
								</Menu.Item>
								<Menu.Item
									leftSection={<IconSend size={14} />}
									onClick={handleSendTest}
								>
									{t('rules.actions.sendTest')}
								</Menu.Item>
								<Menu.Divider />
								{rule.status !== 'DRAFT' && (
									<Menu.Item
										leftSection={
											rule.status === 'ACTIVE' ? (
												<IconPlayerPause size={14} />
											) : (
												<IconPlayerPlay size={14} />
											)
										}
										onClick={handleToggle}
									>
										{rule.status === 'ACTIVE'
											? t('rules.actions.pause')
											: t('rules.actions.activate')}
									</Menu.Item>
								)}
								<Menu.Item
									leftSection={<IconTrash size={14} />}
									color='red'
									onClick={handleDelete}
								>
									{t('rules.actions.delete')}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Badge variant='light' color={meta.color}>
						{t(`types.${rule.type}.label`)}
					</Badge>
					{rule.kind === 'ALERT' && (
						<Badge variant='filled' color={SEVERITY_COLORS[rule.severity]}>
							{t(`severity.${rule.severity}`)}
						</Badge>
					)}
					{rule.kind === 'RECOGNITION' && rule.recognition?.badgeId && (
						<Badge variant='filled' color='grape'>
							{rule.recognition.badgeId}
						</Badge>
					)}
					<Badge variant='outline' color={STATUS_COLORS[rule.status]}>
						{t(`status.${rule.status}`)}
					</Badge>
					<Badge
						variant='outline'
						color={AREA_COLORS[area as keyof typeof AREA_COLORS] || 'gray'}
					>
						{t(`areas.${area}`)}
					</Badge>
				</Group>

				<Tabs defaultValue='overview'>
					<Tabs.List>
						<Tabs.Tab value='overview'>{t('detail.tabs.overview')}</Tabs.Tab>
						<Tabs.Tab value='activity'>{t('detail.tabs.activity')}</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='overview' pt='md'>
						<Stack gap='md'>
							{rule.type !== 'WEEKLY_SUMMARY' && (
								<SectionCard padding='md' title={t('detail.condition')}>
									<ConditionSummaryList
										conditions={rule.conditions}
										logic={rule.conditionLogic}
									/>
								</SectionCard>
							)}

							{rule.type === 'WEEKLY_SUMMARY' && rule.schedule && (
								<SectionCard padding='md' title={t('detail.schedule')}>
									<Stack gap='xs'>
										<Text size='sm'>
											{t('conditions.scheduled', {
												day: t(`days.${rule.schedule.dayOfWeek}`),
												time: rule.schedule.time,
											})}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('detail.timezone')}: {rule.schedule.timezone}
										</Text>
									</Stack>
								</SectionCard>
							)}

							<SectionCard padding='md' title={t('detail.scope')}>
								{renderRecipientsList()}
							</SectionCard>

							<SectionCard padding='md' title={t('detail.delivery')}>
								<Stack gap='xs'>
									<Group gap='xs'>
										{rule.delivery.recipients.map((r) => (
											<Badge key={r} size='sm' variant='default'>
												{t(`recipients.${r}`)}
											</Badge>
										))}
									</Group>
									<Group gap='xs'>
										{rule.delivery.channels.map((c) => (
											<Badge key={c} size='sm' variant='outline'>
												{t(`channels.${c}`)}
											</Badge>
										))}
									</Group>
									{rule.delivery.escalationEnabled ? (
										<Text size='sm'>
											{t('detail.escalation', {
												hours: rule.delivery.escalationAfterHours,
											})}
										</Text>
									) : (
										<Text size='sm' c='dimmed'>
											{t('detail.noEscalation')}
										</Text>
									)}
								</Stack>
							</SectionCard>

							<SectionCard padding='md' title={t('detail.message')}>
								<Stack gap='sm'>
									<Text size='sm' fw={600}>
										{interpolateTemplate(rule.message.subject)}
									</Text>
									<Text
										component='div'
										size='sm'
										className={classes.messageBody}
									>
										{interpolateTemplate(rule.message.body)}
									</Text>
									<Text size='xs' c='dimmed' fs='italic'>
										{t('detail.previewSample')}
									</Text>
								</Stack>
							</SectionCard>

							<SectionCard padding='md' title={t('detail.frequency')}>
								<Stack gap='xs'>
									<Text size='sm'>
										{rule.frequency.cooldownDays === 0
											? t('detail.noCooldown')
											: t('detail.cooldown', {
													days: rule.frequency.cooldownDays,
												})}
									</Text>
									<Text size='sm'>
										{rule.frequency.maxPerWeek === null
											? t('detail.unlimited')
											: t('detail.maxPerWeek', {
													count: rule.frequency.maxPerWeek,
												})}
									</Text>
									<Text size='sm'>
										{rule.frequency.quietHoursEnabled
											? t('detail.quietHours', {
													from: rule.frequency.quietHoursFrom,
													to: rule.frequency.quietHoursTo,
												})
											: t('detail.noQuietHours')}
									</Text>
								</Stack>
							</SectionCard>

							{rule.kind === 'RECOGNITION' && rule.recognition && (
								<SectionCard padding='md' title={t('detail.recognition')}>
									<Stack gap='xs'>
										<Text size='sm'>
											{t('detail.visibility')}:{' '}
											{t(`visibility.${rule.recognition.visibility}`)}
										</Text>
										<Text size='sm'>
											{t('detail.celebrationEmoji')}:{' '}
											{rule.recognition.celebrationEmoji}
										</Text>
									</Stack>
								</SectionCard>
							)}

							{rule.type === 'BURNOUT_RISK' && rule.burnoutLevel && (
								<SectionCard padding='md' title={t('detail.burnout')}>
									<Text size='sm'>
										{t(`burnoutLevels.${rule.burnoutLevel}`)}
									</Text>
								</SectionCard>
							)}
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value='activity' pt='md'>
						{ruleActivity.length === 0 ? (
							<EmptyState message={t('detail.noActivity')} />
						) : (
							<ActivityTable
								entries={ruleActivity}
								compact
								onOpen={setActivityEntry}
								onAcknowledge={(entry) => {
									useTriggerRulesStore.getState().acknowledgeActivity(entry.id);
									notifySuccess(t('activity.notifications.acknowledged'));
								}}
							/>
						)}
					</Tabs.Panel>
				</Tabs>

				<Divider />
				<SimpleGrid cols={{ base: 2, md: 4 }} spacing='sm'>
					<Stack gap={0}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t('detail.stats.fired7d')}
						</Text>
						<Text fw={600}>{rule.stats.firedLast7Days}</Text>
					</Stack>
					<Stack gap={0}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t('detail.stats.fired30d')}
						</Text>
						<Text fw={600}>{rule.stats.firedLast30Days}</Text>
					</Stack>
					<Stack gap={0}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t('detail.stats.lastFired')}
						</Text>
						<Text fw={600}>
							{rule.stats.lastFiredAt
								? dateFormatter.format(new Date(rule.stats.lastFiredAt))
								: t('rules.never')}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t('detail.stats.createdBy')}
						</Text>
						<Text fw={600}>{rule.createdBy}</Text>
					</Stack>
				</SimpleGrid>
			</Stack>

			<RuleEditorDrawer
				opened={editing}
				mode='edit'
				type={rule.type}
				rule={rule}
				onClose={() => setEditing(false)}
				onSaved={() => setEditing(false)}
				role={editorRole}
			/>

			<ActivityDetailDrawer
				entry={activityEntry}
				opened={activityEntry !== null}
				onClose={() => setActivityEntry(null)}
				onAcknowledge={(entry) => {
					useTriggerRulesStore.getState().acknowledgeActivity(entry.id);
					notifySuccess(t('activity.notifications.acknowledged'));
					setActivityEntry(null);
				}}
				onOpenRule={() => setActivityEntry(null)}
				inboxPath={inboxPath}
				role={editorRole}
			/>
		</ContentContainer>
	);
}
