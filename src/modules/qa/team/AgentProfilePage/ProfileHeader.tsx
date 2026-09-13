import { Avatar, Badge, Button, Group, SegmentedControl, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconBook, IconCalendarEvent, IconInfoCircle, IconSend } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { AgentProfile, ProfilePeriod, TeamRole } from '../types';
import { PROFILE_PERIODS } from '../constants';
import { TEAM_CAMPAIGNS } from '../mockData';
import { formatDate, formatTenure, getScoreColor } from '../helpers';
import { ScoreRing } from '../components/ScoreRing';
import { TrendDelta } from '../components/TrendDelta';

const STATUS_COLOR = { active: 'green', 'on-leave': 'gray', training: 'blue' } as const;
const BURNOUT_COLOR = { low: 'green', medium: 'yellow', high: 'red' } as const;

interface ProfileHeaderProps {
	profile: AgentProfile;
	role: TeamRole;
	period: ProfilePeriod;
	onPeriodChange: (period: ProfilePeriod) => void;
	onScheduleCoaching: () => void;
	onAssignLms: () => void;
	onSendMessage: () => void;
}

export function ProfileHeader({ profile, period, onPeriodChange, onScheduleCoaching, onAssignLms, onSendMessage }: ProfileHeaderProps) {
	const { t } = useTranslation('qa.team');
	const { agent, overall, risk } = profile;
	const campaignNames = agent.campaignIds.map((id) => TEAM_CAMPAIGNS.find((c) => c.id === id)?.name).filter(Boolean);

	return (
		<SectionCard padding='lg'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<Group gap='md' align='flex-start'>
					<Avatar size={72} radius='md' color={agent.avatarColor} name={agent.name} />
					<Stack gap={4}>
						<Group gap='xs'>
							<Title order={2}>{agent.name}</Title>
							<Badge variant='light' color={STATUS_COLOR[agent.status]}>{t(`status.${agent.status}`)}</Badge>
							<Badge variant='dot' color={BURNOUT_COLOR[risk.burnout.level]}>{t(`burnout.${risk.burnout.level}`)}</Badge>
						</Group>
						<Text size='sm' c='dimmed'>
							{agent.id} · {agent.team} · {agent.supervisorName} · {t(`header.shift.${agent.shift}`)}
						</Text>
						<Group gap={6}>
							{campaignNames.map((name) => (
								<Badge key={name} variant='outline' size='xs'>{name}</Badge>
							))}
							{agent.skills.map((skill) => (
								<Badge key={skill} variant='light' color='gray' size='xs'>{skill}</Badge>
							))}
						</Group>
						<Text size='xs' c='dimmed'>
							{t('header.trackedSince', { date: formatDate(agent.trackedSince) })} · {t('header.tenure', { tenure: formatTenure(agent.hireDate) })} · {t('header.evaluations', { count: profile.qa.evaluations })}
						</Text>
					</Stack>
				</Group>

				<Group gap='xl' align='center'>
					<ScoreRing value={overall.score} size={112} />
					<Stack gap={2}>
						<Text size='xs' c='dimmed' tt='uppercase'>{t('header.overall')}</Text>
						<Group gap='xs'>
							<Badge size='lg' variant='filled' color={getScoreColor(overall.score)}>
								{t('header.rank', { rank: overall.rankInTeam, size: overall.teamSize })}
							</Badge>
							<Badge variant='light'>{t('header.percentile', { value: overall.percentile })}</Badge>
							<Tooltip
								label={t('header.weights', {
									qa: overall.weights.qa, sentiment: overall.weights.sentiment, compliance: overall.weights.compliance, business: overall.weights.business,
								})}
							>
								<IconInfoCircle size={14} />
							</Tooltip>
						</Group>
						<TrendDelta delta={overall.delta} trend={overall.trend} unit='' suffix={t('header.vsPrevious')} />
					</Stack>
				</Group>
			</Group>

			<Group justify='space-between' mt='md' wrap='wrap'>
				<SegmentedControl
					value={period}
					onChange={(v) => onPeriodChange(v as ProfilePeriod)}
					data={PROFILE_PERIODS.map((p) => ({ value: p.value, label: t(p.labelKey) }))}
				/>
				<Group gap='xs'>
					<Button variant='light' leftSection={<IconCalendarEvent size={16} />} onClick={onScheduleCoaching}>
						{t('header.actions.scheduleCoaching')}
					</Button>
					<Button variant='light' leftSection={<IconBook size={16} />} onClick={onAssignLms}>
						{t('header.actions.assignLms')}
					</Button>
					<Button variant='default' leftSection={<IconSend size={16} />} onClick={onSendMessage}>
						{t('header.actions.sendMessage')}
					</Button>
				</Group>
			</Group>
		</SectionCard>
	);
}
