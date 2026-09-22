import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	Card,
	Stack,
	Group,
	Text,
	Badge,
	Button,
	ThemeIcon,
	Progress,
} from '@mantine/core';
import {
	IconCalendarEvent,
	IconMinus,
	IconMoodSad2,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { coachingBasePath } from '~/modules/qa/coaching/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import { BurnoutRiskLevel } from '../types/burnoutRisk';
import type { TeamBurnoutRiskEntry } from '~/modules/qa/analytics/helpers';
import styles from '../Dashboard.module.css';

interface TeamBurnoutRiskCardProps {
	entries: TeamBurnoutRiskEntry[];
	/** Scopes the "Schedule Coaching" links to the right coaching section. */
	role: TeamRole;
	subtitle?: string;
}

const LEVEL_COLOR: Record<BurnoutRiskLevel, string> = {
	[BurnoutRiskLevel.LOW]: 'green',
	[BurnoutRiskLevel.MEDIUM]: 'yellow',
	[BurnoutRiskLevel.HIGH]: 'red',
};

const TREND_META: Record<
	TeamBurnoutRiskEntry['trend'],
	{ icon: React.ComponentType<{ size?: number }>; color: string }
> = {
	improving: { icon: IconTrendingDown, color: 'green' },
	stable: { icon: IconMinus, color: 'gray' },
	declining: { icon: IconTrendingUp, color: 'red' },
};

/** Card listing team members currently at burnout risk (MEDIUM/HIGH), read-only. */
export const TeamBurnoutRiskCard: React.FC<TeamBurnoutRiskCardProps> = ({
	entries,
	role,
	subtitle,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const navigate = useNavigate();

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='sm'
			h='100%'
		>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<div>
						<Text fw={600} size='md'>
							{t('burnout.title', 'Burnout Risk')}
						</Text>
						<Text size='xs' c='dimmed'>
							{subtitle ?? 'Team members showing signs of burnout'}
						</Text>
					</div>
					<ThemeIcon size='lg' color='gray' radius='md'>
						<IconMoodSad2 size={20} />
					</ThemeIcon>
				</Group>

				{entries.length === 0 ? (
					<Text size='sm' c='dimmed'>
						No one on the team is currently at burnout risk.
					</Text>
				) : (
					<Stack gap='sm'>
						{entries.map((entry) => {
							const trend = TREND_META[entry.trend];
							const TrendIcon = trend.icon;
							return (
								<div key={entry.agentId}>
									<Group justify='space-between' align='center' mb={4}>
										<Group gap='xs' wrap='nowrap'>
											<Text size='sm' fw={500}>
												{entry.agentName}
											</Text>
											<Badge
												size='xs'
												color={LEVEL_COLOR[entry.level]}
												variant='light'
											>
												{t(`burnout.level.${entry.level}`, entry.level)}
											</Badge>
										</Group>
										<Group gap={4} wrap='nowrap'>
											<Text size='sm' fw={600}>
												{entry.percentage}%
											</Text>
											<ThemeIcon size='sm' variant='light' color={trend.color}>
												<TrendIcon size={12} />
											</ThemeIcon>
										</Group>
									</Group>
									<Progress
										value={entry.percentage}
										size='sm'
										color={LEVEL_COLOR[entry.level]}
									/>
									<Group justify='flex-end' mt={6}>
										<Button
											variant='subtle'
											size='xs'
											leftSection={<IconCalendarEvent size={14} />}
											onClick={() =>
												navigate(
													`${coachingBasePath(role)}?schedule=${entry.agentId}`
												)
											}
										>
											{t('burnout.scheduleCoaching', 'Schedule Coaching')}
										</Button>
									</Group>
								</div>
							);
						})}
					</Stack>
				)}
			</Stack>
		</Card>
	);
};

export default TeamBurnoutRiskCard;
