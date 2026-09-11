import {
	ActionIcon, Badge, Button, Divider, Group, Menu, SimpleGrid, Stack, Tabs, Text,
} from '@mantine/core';
import {
	IconCopy, IconDotsVertical, IconEdit, IconPlayerPause, IconPlayerPlay, IconSend, IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { TriggerRule, TriggerActivityEntry } from '~/models/qa';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import EmptyState from '~/components/EmptyState';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { AREA_COLORS, RULE_TYPE_META, SEVERITY_COLORS, STATUS_COLORS } from '~/modules/qa/triggers/constants';
import { getRuleArea, interpolateTemplate } from '~/modules/qa/triggers/helpers';
import ConditionSummaryList from '../ConditionSummaryList';
import ActivityTable from '../ActivityTable';
import classes from './RuleDetailDrawer.module.css';

interface RuleDetailDrawerProps {
	rule: TriggerRule | null;
	opened: boolean;
	onClose: () => void;
	onEdit: (rule: TriggerRule) => void;
	onDuplicate: (rule: TriggerRule) => void;
	onToggle: (rule: TriggerRule) => void;
	onDelete: (rule: TriggerRule) => void;
	onSendTest: (rule: TriggerRule) => void;
	onOpenActivity: (entry: TriggerActivityEntry) => void;
	onAcknowledgeActivity: (entryId: string) => void;
}

export default function RuleDetailDrawer({
	rule,
	opened,
	onClose,
	onEdit,
	onDuplicate,
	onToggle,
	onDelete,
	onSendTest,
	onOpenActivity,
	onAcknowledgeActivity,
}: RuleDetailDrawerProps) {
	const { t } = useTranslation('qa.triggers');
	const dateFormatter = useDateFormatter();
	const activity = useTriggerRulesStore((s) => s.activity);

	const ruleActivity = useMemo(() => {
		if (!rule) return [];
		return activity
			.filter((a) => a.ruleId === rule.id)
			.sort((a, b) => new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime())
			.slice(0, 10);
	}, [rule, activity]);

	if (!rule) return null;

	const meta = RULE_TYPE_META[rule.type];
	const area = getRuleArea(rule);

	const renderRecipientsList = () => {
		const { agentIds, supervisorIds, campaignIds, linesOfBusiness, campaignTypes } = rule.scope;
		if (!agentIds.length && !supervisorIds.length && !campaignIds.length && !linesOfBusiness.length && !campaignTypes.length) {
			return <Text size="sm">{t('detail.everyone')}</Text>;
		}
		return (
			<Stack gap="xs">
				{agentIds.length > 0 && (
					<Group gap="xs">
						<Text size="xs" fw={600} w={120}>{t('detail.agents')}:</Text>
						<Group gap="xs">
							{agentIds.map((id) => (
								<Badge key={id} size="sm" variant="outline">{id}</Badge>
							))}
						</Group>
					</Group>
				)}
				{supervisorIds.length > 0 && (
					<Group gap="xs">
						<Text size="xs" fw={600} w={120}>{t('detail.supervisors')}:</Text>
						<Group gap="xs">
							{supervisorIds.map((id) => (
								<Badge key={id} size="sm" variant="outline">{id}</Badge>
							))}
						</Group>
					</Group>
				)}
				{campaignIds.length > 0 && (
					<Group gap="xs">
						<Text size="xs" fw={600} w={120}>{t('detail.campaigns')}:</Text>
						<Group gap="xs">
							{campaignIds.map((id) => (
								<Badge key={id} size="sm" variant="outline">{id}</Badge>
							))}
						</Group>
					</Group>
				)}
				{linesOfBusiness.length > 0 && (
					<Group gap="xs">
						<Text size="xs" fw={600} w={120}>{t('detail.linesOfBusiness')}:</Text>
						<Group gap="xs">
							{linesOfBusiness.map((lob) => (
								<Badge key={lob} size="sm" variant="outline">{lob}</Badge>
							))}
						</Group>
					</Group>
				)}
				{campaignTypes.length > 0 && (
					<Group gap="xs">
						<Text size="xs" fw={600} w={120}>{t('detail.campaignTypes')}:</Text>
						<Group gap="xs">
							{campaignTypes.map((type) => (
								<Badge key={type} size="sm" variant="outline">{t(`campaignTypes.${type}`)}</Badge>
							))}
						</Group>
					</Group>
				)}
			</Stack>
		);
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={rule.name}
			description={rule.description || undefined}
			icon={<meta.icon size={18} />}
			iconColor={meta.color}
			size="lg"
			headerActions={
				<Group gap="xs">
					<Button
						size="xs"
						leftSection={<IconEdit size={14} />}
						onClick={() => onEdit(rule)}
					>
						{t('rules.actions.edit')}
					</Button>
					<Menu withinPortal position="bottom-end">
						<Menu.Target>
							<ActionIcon variant="subtle" color="gray" size="sm">
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onDuplicate(rule)}>
								{t('rules.actions.duplicate')}
							</Menu.Item>
							<Menu.Item leftSection={<IconSend size={14} />} onClick={() => onSendTest(rule)}>
								{t('rules.actions.sendTest')}
							</Menu.Item>
							<Menu.Divider />
							{rule.status !== 'DRAFT' && (
								<Menu.Item
									leftSection={rule.status === 'ACTIVE' ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
									onClick={() => onToggle(rule)}
								>
									{rule.status === 'ACTIVE' ? t('rules.actions.pause') : t('rules.actions.activate')}
								</Menu.Item>
							)}
							<Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(rule)}>
								{t('rules.actions.delete')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			}
			classNames={{ body: classes.body }}
		>
			<Stack gap="md">
				<Group gap="xs" wrap="nowrap">
					<Badge variant="light" color={meta.color}>
						{t(`types.${rule.type}.label`)}
					</Badge>
					{rule.kind === 'ALERT' && (
						<Badge variant="filled" color={SEVERITY_COLORS[rule.severity]}>
							{t(`severity.${rule.severity}`)}
						</Badge>
					)}
					{rule.kind === 'RECOGNITION' && rule.recognition?.badgeId && (
						<Badge variant="filled" color="grape">
							{rule.recognition.badgeId}
						</Badge>
					)}
					<Badge variant="outline" color={STATUS_COLORS[rule.status]}>
						{t(`status.${rule.status}`)}
					</Badge>
					<Badge variant="outline" color={AREA_COLORS[area as keyof typeof AREA_COLORS] || 'gray'}>
						{t(`areas.${area}`)}
					</Badge>
				</Group>

				<Tabs defaultValue="overview">
					<Tabs.List>
						<Tabs.Tab value="overview">{t('detail.tabs.overview')}</Tabs.Tab>
						<Tabs.Tab value="activity">{t('detail.tabs.activity')}</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="overview" pt="md">
						<Stack gap="md">
							{/* Condition section */}
							{rule.type !== 'WEEKLY_SUMMARY' && (
								<SectionCard padding="md" title={t('detail.condition')}>
									<ConditionSummaryList conditions={rule.conditions} logic={rule.conditionLogic} />
								</SectionCard>
							)}

							{/* Schedule section (WEEKLY_SUMMARY only) */}
							{rule.type === 'WEEKLY_SUMMARY' && rule.schedule && (
								<SectionCard padding="md" title={t('detail.schedule')}>
									<Stack gap="xs">
										<Text size="sm">
											{t('conditions.scheduled', {
												day: t(`days.${rule.schedule.dayOfWeek}`),
												time: rule.schedule.time,
											})}
										</Text>
										<Text size="xs" c="dimmed">
											{t('detail.timezone')}: {rule.schedule.timezone}
										</Text>
									</Stack>
								</SectionCard>
							)}

							{/* Scope section */}
							<SectionCard padding="md" title={t('detail.scope')}>
								{renderRecipientsList()}
							</SectionCard>

							{/* Delivery section */}
							<SectionCard padding="md" title={t('detail.delivery')}>
								<Stack gap="xs">
									<Group gap="xs">
										{rule.delivery.recipients.map((r) => (
											<Badge key={r} size="sm" variant="default">
												{t(`recipients.${r}`)}
											</Badge>
										))}
									</Group>
									<Group gap="xs">
										{rule.delivery.channels.map((c) => (
											<Badge key={c} size="sm" variant="outline">
												{t(`channels.${c}`)}
											</Badge>
										))}
									</Group>
									{rule.delivery.escalationEnabled && (
										<Text size="sm">
											{t('detail.escalation', { hours: rule.delivery.escalationAfterHours })}
										</Text>
									)}
									{!rule.delivery.escalationEnabled && (
										<Text size="sm" c="dimmed">{t('detail.noEscalation')}</Text>
									)}
								</Stack>
							</SectionCard>

							{/* Message section */}
							<SectionCard padding="md" title={t('detail.message')}>
								<Stack gap="sm">
									<Text size="sm" fw={600}>
										{interpolateTemplate(rule.message.subject)}
									</Text>
									<Text component="div" size="sm" className={classes.messageBody}>
										{interpolateTemplate(rule.message.body)}
									</Text>
									<Text size="xs" c="dimmed" fs="italic">
										{t('detail.previewSample')}
									</Text>
								</Stack>
							</SectionCard>

							{/* Frequency guard section */}
							<SectionCard padding="md" title={t('detail.frequency')}>
								<Stack gap="xs">
									<Text size="sm">
										{rule.frequency.cooldownDays === 0
											? t('detail.noCooldown')
											: t('detail.cooldown', { days: rule.frequency.cooldownDays })}
									</Text>
									<Text size="sm">
										{rule.frequency.maxPerWeek === null
											? t('detail.unlimited')
											: t('detail.maxPerWeek', { count: rule.frequency.maxPerWeek })}
									</Text>
									<Text size="sm">
										{rule.frequency.quietHoursEnabled
											? t('detail.quietHours', { from: rule.frequency.quietHoursFrom, to: rule.frequency.quietHoursTo })
											: t('detail.noQuietHours')}
									</Text>
								</Stack>
							</SectionCard>

							{/* Recognition section */}
							{rule.kind === 'RECOGNITION' && rule.recognition && (
								<SectionCard padding="md" title={t('detail.recognition')}>
									<Stack gap="xs">
										<Text size="sm">
											{t('detail.visibility')}: {t(`visibility.${rule.recognition.visibility}`)}
										</Text>
										<Text size="sm">
											{t('detail.celebrationEmoji')}: {rule.recognition.celebrationEmoji}
										</Text>
									</Stack>
								</SectionCard>
							)}

							{/* Burnout section */}
							{rule.type === 'BURNOUT_RISK' && rule.burnoutLevel && (
								<SectionCard padding="md" title={t('detail.burnout')}>
									{/* Import InlineNotice placeholder */}
									<Text size="sm">
										{t('burnoutLevels.' + rule.burnoutLevel)}
									</Text>
								</SectionCard>
							)}
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value="activity" pt="md">
						{ruleActivity.length === 0 ? (
							<EmptyState message={t('detail.noActivity')} />
						) : (
							<ActivityTable
								entries={ruleActivity}
								compact
								onOpen={onOpenActivity}
								onAcknowledge={(entry) => onAcknowledgeActivity(entry.id)}
							/>
						)}
					</Tabs.Panel>
				</Tabs>

				{/* Footer stats */}
				<Divider />
				<SimpleGrid cols={4} spacing="sm">
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('detail.stats.fired7d')}
						</Text>
						<Text fw={600}>
							{rule.stats.firedLast7Days}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('detail.stats.fired30d')}
						</Text>
						<Text fw={600}>
							{rule.stats.firedLast30Days}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('detail.stats.lastFired')}
						</Text>
						<Text fw={600}>
							{rule.stats.lastFiredAt ? dateFormatter.format(new Date(rule.stats.lastFiredAt)) : t('rules.never')}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('detail.stats.createdBy')}
						</Text>
						<Text fw={600}>
							{rule.createdBy}
						</Text>
					</Stack>
				</SimpleGrid>
			</Stack>
		</AppDrawer>
	);
}
