import { useMemo, useState } from 'react';
import { Grid, Group, Paper, Progress, Select, SimpleGrid, Stack, Text, ThemeIcon, Timeline } from '@mantine/core';
import { IconBolt, IconHeartRateMonitor } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import type {
	CoachingActivityEntry,
	CoachingActivityType,
	CoachingPriority,
	CoachingQueueItem,
	CoachingSuggestedAction,
	LmsContent,
} from '~/models/qa';
import { LMS_AREA_META } from '~/modules/qa/lms/constants';
import { getScoreColor } from '~/modules/qa/team/helpers';
import { TEAM_SUPERVISORS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { SUGGESTED_ACTION_ORDER } from '../../constants';
import { QueueCard } from '../../components/QueueCard';
import classes from '../../components/Queue.module.css';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';

const ACTIVITY_COLOR: Partial<Record<CoachingActivityType, string>> = {
	RULE_FIRED: 'orange',
	ASSIGNED: 'blue',
	ACCEPTED: 'green',
	RESCHEDULE_REQUESTED: 'orange',
	RESCHEDULE_DECIDED: 'blue',
	COMPLETED: 'green',
	SESSION_SCHEDULED: 'blue',
	SESSION_COMPLETED: 'green',
	SESSION_MISSED: 'red',
	IMPACT_MEASURED: 'teal',
	COHORT_CREATED: 'grape',
	REMINDER_SENT: 'red',
};

interface AreaHealth {
	area: string;
	average: number;
	below: number;
	total: number;
}

interface QueueTabProps {
	queue: CoachingQueueItem[];
	health: AreaHealth[];
	activity: CoachingActivityEntry[];
	contentById: Record<string, LmsContent>;
	role: TeamRole;
	onAction: (item: CoachingQueueItem) => void;
	onDetails: (agentId: string) => void;
	onProfile: (agentId: string) => void;
	onSnooze: (agentId: string) => void;
	onActivityLink: (link: string) => void;
}

export function QueueTab({
	queue,
	health,
	activity,
	contentById,
	role,
	onAction,
	onDetails,
	onProfile,
	onSnooze,
	onActivityLink,
}: QueueTabProps) {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const [priority, setPriority] = useState<string | null>(null);
	const [team, setTeam] = useState<string | null>(null);
	const [area, setArea] = useState<string | null>(null);
	const [action, setAction] = useState<string | null>(null);

	const filtered = useMemo(
		() =>
			queue.filter((item) => {
				if (priority && item.priority !== priority) return false;
				if (team && item.supervisorId !== team) return false;
				if (area && item.weakestArea !== area) return false;
				if (action && item.suggestedAction !== action) return false;
				return true;
			}),
		[queue, priority, team, area, action]
	);

	return (
		<Grid gap='md'>
			<Grid.Col span={{ base: 12, lg: 8 }}>
				<SectionCard
					title={t('queue.title')}
					description={t('queue.description')}
					headerActions={
						<Text size='sm' c='dimmed'>
							{t('queue.count', { count: filtered.length })}
						</Text>
					}
				>
					<Stack gap='md'>
						<Group gap='sm' wrap='wrap'>
							<Select
								size='sm'
								placeholder={t('queue.filters.priority')}
								data={(['HIGH', 'MEDIUM', 'LOW'] as CoachingPriority[]).map((p) => ({
									value: p,
									label: t(`priority.${p}`),
								}))}
								value={priority}
								onChange={setPriority}
								clearable
								w={140}
							/>
							{role === 'qa-manager' && (
								<Select
									size='sm'
									placeholder={t('queue.filters.team')}
									data={TEAM_SUPERVISORS.map((s) => ({ value: s.id, label: s.team }))}
									value={team}
									onChange={setTeam}
									clearable
									w={140}
								/>
							)}
							<Select
								size='sm'
								placeholder={t('queue.filters.area')}
								data={(['QUALITY_ASSURANCE', 'COMPLIANCE', 'SENTIMENT_EMOTION', 'BUSINESS_INSIGHTS'] as const).map(
									(a) => ({ value: a, label: t(LMS_AREA_META[a].labelKey, { ns: 'qa.lms' }) })
								)}
								value={area}
								onChange={setArea}
								clearable
								w={190}
							/>
							<Select
								size='sm'
								placeholder={t('queue.filters.action')}
								data={SUGGESTED_ACTION_ORDER.map((a: CoachingSuggestedAction) => ({
									value: a,
									label: t(`queue.suggested.${a}`),
								}))}
								value={action}
								onChange={setAction}
								clearable
								w={180}
							/>
						</Group>

						{filtered.length === 0 ? (
							<EmptyState message={t('queue.empty')} />
						) : (
							<Stack gap='sm'>
								{filtered.map((item) => (
									<QueueCard
										key={item.agentId}
										item={item}
										contentById={contentById}
										onAction={onAction}
										onDetails={onDetails}
										onProfile={onProfile}
										onSnooze={onSnooze}
									/>
								))}
							</Stack>
						)}
					</Stack>
				</SectionCard>
			</Grid.Col>

			<Grid.Col span={{ base: 12, lg: 4 }}>
				<Stack gap='md'>
					<SectionCard title={t('queue.health')} description={t('queue.healthDescription')} icon={IconHeartRateMonitor}>
						<SimpleGrid cols={2} spacing='sm'>
							{health.map((h) => {
								const meta = LMS_AREA_META[h.area as keyof typeof LMS_AREA_META];
								const Icon = meta.icon;
								const active = area === h.area;
								return (
									<Paper
										key={h.area}
										withBorder
										p='sm'
										radius='md'
										className={classes.healthCard}
										data-active={active}
										onClick={() => setArea(active ? null : h.area)}
									>
										<Stack gap={6}>
											<Group gap={6} wrap='nowrap'>
												<ThemeIcon size='sm' variant='light' color={meta.color} radius='xl'>
													<Icon size={12} />
												</ThemeIcon>
												<Text size='xs' c='dimmed' lineClamp={1}>
													{t(meta.labelKey, { ns: 'qa.lms' })}
												</Text>
											</Group>
											<Group gap={6} align='baseline'>
												<Text size='xl' fw={700}>
													{h.average}
												</Text>
												<Text size='xs' c='dimmed'>
													{t('queue.average')}
												</Text>
											</Group>
											<Progress value={h.average} size='sm' radius='xl' color={getScoreColor(h.average)} />
											<Text size='xs' c={h.below > 0 ? 'red' : 'dimmed'}>
												{t('queue.below', { count: h.below })}
											</Text>
										</Stack>
									</Paper>
								);
							})}
						</SimpleGrid>
					</SectionCard>

					<SectionCard title={t('queue.activity')} description={t('queue.activityDescription')} icon={IconBolt}>
						<Timeline bulletSize={18} lineWidth={2} active={activity.length}>
							{activity.slice(0, 8).map((entry) => (
								<Timeline.Item
									key={entry.id}
									color={ACTIVITY_COLOR[entry.type] ?? 'blue'}
									title={
										<Text
											size='sm'
											fw={500}
											className={entry.link ? pointerStyles.pointer : undefined}
											onClick={entry.link ? () => onActivityLink(entry.link as string) : undefined}
										>
											{entry.title}
										</Text>
									}
								>
									<Text size='xs' c='dimmed'>
										{entry.description}
									</Text>
									<Text size='xs' c='dimmed' mt={2}>
										{t(`activity.types.${entry.type}`)} · {dayjs(entry.date).format('D MMM')}
									</Text>
								</Timeline.Item>
							))}
						</Timeline>
					</SectionCard>
				</Stack>
			</Grid.Col>
		</Grid>
	);
}
