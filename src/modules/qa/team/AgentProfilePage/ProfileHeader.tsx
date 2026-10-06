import { useMemo } from 'react';
import {
	Avatar,
	Badge,
	Button,
	Group,
	SegmentedControl,
	Stack,
	Text,
	Title,
	Tooltip,
} from '@mantine/core';
import {
	IconBook,
	IconCalendarEvent,
	IconInfoCircle,
	IconSend,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { assessBurnout } from '~/modules/qa/analytics/helpers';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import type { AgentProfile, ProfilePeriod, TeamRole } from '../types';
import { PROFILE_PERIODS } from '../constants';
import { TEAM_CAMPAIGNS } from '../mockData';
import { alertScoreColor, formatDate, formatTenure } from '../helpers';
import { ScoreRing } from '../components/ScoreRing';
import { TrendDelta } from '../components/TrendDelta';

/** Burnout is the only status that earns colour, and only when it is a concern. */
const BURNOUT_COLOR = { low: 'gray', medium: 'yellow', high: 'red' } as const;

interface ProfileHeaderProps {
	profile: AgentProfile;
	role: TeamRole;
	period: ProfilePeriod;
	onPeriodChange: (period: ProfilePeriod) => void;
	onScheduleCoaching: () => void;
	onAssignLms: () => void;
	onSendMessage: () => void;
}

export function ProfileHeader({
	profile,
	period,
	onPeriodChange,
	onScheduleCoaching,
	onAssignLms,
	onSendMessage,
}: ProfileHeaderProps) {
	const { t } = useTranslation('qa.team');
	const { agent, overall } = profile;
	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	// The level follows the burnout rules in Triggers.
	const burnoutLevel = useMemo(
		() => assessBurnout(agent.id, triggerRules).level,
		[agent.id, triggerRules]
	);
	const campaignNames = agent.campaignIds
		.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name)
		.filter(Boolean);

	return (
		<SectionCard padding='lg'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<Group gap='md' align='flex-start'>
					<Avatar size={72} radius='md' color='gray' name={agent.name} />
					<Stack gap={4}>
						<Group gap='xs'>
							<Title order={2}>{agent.name}</Title>
							<Badge variant='light' color='gray'>
								{t(`status.${agent.status}`)}
							</Badge>
							<Badge variant='dot' color={BURNOUT_COLOR[burnoutLevel]}>
								{t(`burnout.${burnoutLevel}`)}
							</Badge>
						</Group>
						<Text size='sm' c='dimmed'>
							{agent.id} · {agent.team} · {agent.supervisorName} ·{' '}
							{t(`header.shift.${agent.shift}`)}
						</Text>
						<Group gap={6}>
							{campaignNames.map((name) => (
								<Badge key={name} variant='outline' color='gray' size='xs'>
									{name}
								</Badge>
							))}
							{agent.skills.map((skill) => (
								<Badge key={skill} variant='light' color='gray' size='xs'>
									{skill}
								</Badge>
							))}
						</Group>
						<Text size='xs' c='dimmed'>
							{t('header.trackedSince', {
								date: formatDate(agent.trackedSince),
							})}{' '}
							· {t('header.tenure', { tenure: formatTenure(agent.hireDate) })} ·{' '}
							{t('header.evaluations', { count: profile.qa.evaluations })}
						</Text>
					</Stack>
				</Group>

				<Group gap='xl' align='center'>
					<ScoreRing
						value={overall.score}
						size={112}
						color={alertScoreColor(overall.score) ?? 'gray.6'}
					/>
					<Stack gap={2}>
						<Text size='xs' c='dimmed' tt='uppercase'>
							{t('header.overall')}
						</Text>
						<Group gap='xs'>
							<Badge
								size='lg'
								variant='light'
								color={alertScoreColor(overall.score) ?? 'gray'}
							>
								{t('header.rank', {
									rank: overall.rankInTeam,
									size: overall.teamSize,
								})}
							</Badge>
							<Badge variant='light' color='gray'>
								{t('header.percentile', { value: overall.percentile })}
							</Badge>
							<Tooltip
								label={t('header.weights', {
									qa: overall.weights.qa,
									sentiment: overall.weights.sentiment,
									compliance: overall.weights.compliance,
									business: overall.weights.business,
								})}
							>
								<IconInfoCircle size={14} />
							</Tooltip>
						</Group>
						<TrendDelta
							delta={overall.delta}
							trend={overall.trend}
							unit=''
							suffix={t('header.vsPrevious')}
						/>
					</Stack>
				</Group>
			</Group>

			<Group justify='space-between' mt='md' wrap='wrap'>
				<SegmentedControl
					value={period}
					onChange={(v) => onPeriodChange(v as ProfilePeriod)}
					data={PROFILE_PERIODS.map((p) => ({
						value: p.value,
						label: t(p.labelKey),
					}))}
				/>
				<Group gap='xs'>
					<Button
						variant='default'
						leftSection={<IconCalendarEvent size={16} />}
						onClick={onScheduleCoaching}
					>
						{t('header.actions.scheduleCoaching')}
					</Button>
					<Button
						variant='default'
						leftSection={<IconBook size={16} />}
						onClick={onAssignLms}
					>
						{t('header.actions.assignLms')}
					</Button>
					<Button
						variant='default'
						leftSection={<IconSend size={16} />}
						onClick={onSendMessage}
					>
						{t('header.actions.sendMessage')}
					</Button>
				</Group>
			</Group>
		</SectionCard>
	);
}
