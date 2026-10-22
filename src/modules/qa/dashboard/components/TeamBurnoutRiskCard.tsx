import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	Card,
	Stack,
	Group,
	Text,
	Badge,
	ThemeIcon,
	Progress,
	Tooltip,
} from '@mantine/core';
import {
	IconMinus,
	IconMoodSad2,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { agentProfilePath } from '~/modules/qa/team/helpers';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import type { TeamRole } from '~/modules/qa/team/types';
import { BurnoutRiskLevel } from '../types/burnoutRisk';
import type { TeamBurnoutRiskEntry } from '~/modules/qa/analytics/helpers';
import styles from '../Dashboard.module.css';

interface TeamBurnoutRiskCardProps {
	entries: TeamBurnoutRiskEntry[];
	/** Scopes the evidence link to the right profile section. */
	role: TeamRole;
	subtitle?: string;
	/** Rendered in the header before the icon, e.g. the data window the card reflects. */
	headerLabel?: React.ReactNode;
}

/** Exceptions only: LOW reads as neutral, MEDIUM / HIGH keep the design-system status hues. */
const LEVEL_COLOR: Record<BurnoutRiskLevel, string> = {
	[BurnoutRiskLevel.LOW]: 'gray',
	[BurnoutRiskLevel.MEDIUM]: 'amber',
	[BurnoutRiskLevel.HIGH]: 'danger',
};

/** Trend arrow color: dimmed unless the agent is getting worse. */
const TREND_META: Record<
	TeamBurnoutRiskEntry['trend'],
	{
		icon: React.ComponentType<{ size?: number; color?: string }>;
		color: string;
	}
> = {
	improving: { icon: IconTrendingDown, color: 'var(--mantine-color-dimmed)' },
	stable: { icon: IconMinus, color: 'var(--mantine-color-dimmed)' },
	declining: {
		icon: IconTrendingUp,
		color: 'var(--mantine-color-danger-7)',
	},
};

/** Card listing team members currently at burnout risk (MEDIUM/HIGH). The agent name opens the Burnout tab of their profile, where the evidence is. */
export const TeamBurnoutRiskCard: React.FC<TeamBurnoutRiskCardProps> = ({
	entries,
	role,
	subtitle,
	headerLabel,
}) => {
	const { t } = useTranslation(['qa.dashboard', 'qa.burnout']);
	const navigate = useNavigate();

	const openEvidence = (agentId: string) => {
		const agent = TEAM_AGENTS.find((a) => a.id === agentId);
		if (agent) navigate(`${agentProfilePath(role, agent)}?tab=burnout`);
	};

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='none'
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
					<Group gap='sm' wrap='nowrap'>
						{headerLabel}
						<ThemeIcon size='lg' variant='light' color='gray' radius='md'>
							<IconMoodSad2 size={20} />
						</ThemeIcon>
					</Group>
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
									<Tooltip label={t('burnout.viewEvidence')} withArrow>
										<div
											className={styles.burnoutRow}
											role='button'
											tabIndex={0}
											onClick={() => openEvidence(entry.agentId)}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													openEvidence(entry.agentId);
												}
											}}
										>
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
													<TrendIcon size={12} color={trend.color} />
												</Group>
											</Group>
											{entry.mainSignal && (
												<Text size='xs' c='dimmed' mb={4}>
													{t('burnout.signalLine', {
														signal: t(`signals.${entry.mainSignal.key}.label`, {
															ns: 'qa.burnout',
														}),
														change: Math.round(entry.mainSignal.deviationPct),
														count: entry.days,
													})}
												</Text>
											)}
											<Progress
												value={entry.percentage}
												size='xs'
												color={LEVEL_COLOR[entry.level]}
												aria-label={`${entry.agentName} ${entry.percentage}%`}
											/>
										</div>
									</Tooltip>
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
