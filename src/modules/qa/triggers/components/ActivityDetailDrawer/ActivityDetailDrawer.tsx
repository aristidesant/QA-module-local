import {
	Badge, Button, Divider, Group, Paper, SimpleGrid, Stack, Text,
} from '@mantine/core';
import {
	IconChartLine, IconInbox,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { TriggerActivityEntry } from '~/models/qa';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { ACTIVITY_STATUS_COLORS, METRIC_BY_ID, RULE_TYPE_META } from '~/modules/qa/triggers/constants';
import { formatMetricValue } from '~/modules/qa/triggers/helpers';

interface ActivityDetailDrawerProps {
	entry: TriggerActivityEntry | null;
	opened: boolean;
	onClose: () => void;
	onAcknowledge: (entry: TriggerActivityEntry) => void;
	onOpenRule: (ruleId: string) => void;
	inboxPath: string;
}

export default function ActivityDetailDrawer({
	entry, opened, onClose, onAcknowledge, onOpenRule, inboxPath,
}: ActivityDetailDrawerProps) {
	const { t } = useTranslation('qa.triggers');
	const dateFormatter = useDateFormatter();
	const navigate = useNavigate();
	const badges = useTriggerRulesStore((s) => s.badges);

	if (!entry) return null;

	const meta = RULE_TYPE_META[entry.ruleType];
	const badge = entry.badgeId ? badges.find((b) => b.id === entry.badgeId) : null;
	const metric = entry.metricId ? METRIC_BY_ID[entry.metricId] : null;

	const handleAcknowledge = () => {
		onAcknowledge(entry);
		onClose();
	};

	const handleOpenAnalytics = () => {
		navigate(`/qa/agent/analytics?agent=${entry.agentId}`);
	};

	const handleOpenInbox = () => {
		navigate(`${inboxPath}?agent=${entry.agentId}`);
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={entry.ruleName}
			description={dateFormatter.format(new Date(entry.firedAt))}
			icon={<meta.icon size={18} />}
			iconColor={meta.color}
			size="lg"
		>
			<Stack gap="md">
				{/* Status row */}
				<Group gap="xs">
					<Badge
						variant="light"
						color={ACTIVITY_STATUS_COLORS[entry.status]}
						size="sm"
					>
						{t(`status.${entry.status}`)}
					</Badge>
					{entry.acknowledgedAt && (
						<Text size="sm" c="dimmed">
							{t('activity.detail.acknowledgedAt', { date: dateFormatter.format(new Date(entry.acknowledgedAt)) })}
						</Text>
					)}
				</Group>

				{/* Message sent */}
				<SectionCard padding="md" title={t('activity.detail.message')}>
					<Paper withBorder p="sm" radius="md">
						<Text size="sm" className="ws-pre-wrap">
							{entry.renderedMessage}
						</Text>
					</Paper>
				</SectionCard>

				{/* Observed vs condition */}
				<SectionCard padding="md" title={t('activity.detail.metric')}>
					<SimpleGrid cols={2} spacing="md">
						<Stack gap="xs">
							<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
								{t('activity.detail.observed')}
							</Text>
							{entry.observedValue !== null && metric ? (
								<Text size="xl" fw={700} c={metric.higherIsBetter ? 'green' : 'red'}>
									{formatMetricValue(entry.metricId!, entry.observedValue)}
								</Text>
							) : (
								<Text size="sm" c="dimmed">
									—
								</Text>
							)}
						</Stack>
						<Stack gap="xs">
							<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
								{t('activity.detail.condition')}
							</Text>
							<Text size="sm">
								{entry.conditionSummary}
							</Text>
						</Stack>
					</SimpleGrid>
				</SectionCard>

				{/* Rule */}
				<SectionCard padding="md" title={t('activity.detail.rule')}>
					<Group justify="space-between">
						<Text size="sm" fw={500}>
							{entry.ruleName}
						</Text>
						<Button
							variant="light"
							size="xs"
							onClick={() => onOpenRule(entry.ruleId)}
						>
							{t('activity.detail.openRule')}
						</Button>
					</Group>
				</SectionCard>

				{/* Agent */}
				<SectionCard padding="md" title={t('activity.detail.agent')}>
					<Stack gap="sm">
						<Stack gap={0}>
							<Text size="sm" fw={500}>
								{entry.agentName}
							</Text>
							<Text size="xs" c="dimmed">
								{t('activity.detail.supervisor')}: {entry.supervisorName}
							</Text>
							<Text size="xs" c="dimmed">
								{t('activity.detail.campaign')}: {entry.campaignName}
							</Text>
						</Stack>
						<Group>
							<Button
								size="xs"
								leftSection={<IconChartLine size={14} />}
								onClick={handleOpenAnalytics}
							>
								{t('activity.detail.openAnalytics')}
							</Button>
							<Button
								size="xs"
								variant="light"
								leftSection={<IconInbox size={14} />}
								onClick={handleOpenInbox}
							>
								{t('activity.detail.openInbox')}
							</Button>
						</Group>
					</Stack>
				</SectionCard>

				{/* Recipients and channels */}
				<SectionCard padding="md" title={t('activity.detail.recipients')}>
					<Stack gap="xs">
						<Group gap="xs">
							{entry.recipients.map((r) => (
								<Badge key={r} size="sm" variant="default">
									{t(`recipients.${r}`)}
								</Badge>
							))}
						</Group>
						<Group gap="xs">
							{entry.channels.map((c) => (
								<Badge key={c} size="sm" variant="outline">
									{t(`channels.${c}`)}
								</Badge>
							))}
						</Group>
					</Stack>
				</SectionCard>

				{/* Badge awarded */}
				{badge && (
					<SectionCard padding="md" title={t('activity.detail.badge')}>
						<Group gap="sm">
							<Text fz={24}>
								{badge.icon}
							</Text>
							<Stack gap={0}>
								<Text size="sm" fw={500}>
									{badge.name}
								</Text>
								<Badge size="xs" color={badge.color} variant="light">
									{badge.tier}
								</Badge>
							</Stack>
						</Group>
					</SectionCard>
				)}

				{/* Footer actions */}
				<Divider />
				{(entry.status === 'SENT' || entry.status === 'ESCALATED') && (
					<Button
						fullWidth
						onClick={handleAcknowledge}
					>
						{t('activity.detail.acknowledge')}
					</Button>
				)}
			</Stack>
		</AppDrawer>
	);
}
