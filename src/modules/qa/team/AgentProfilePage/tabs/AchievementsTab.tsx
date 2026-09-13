import { Badge, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { IconAward, IconCheck, IconFlag, IconTrophy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import type { AgentProfile } from '../../types';
import { formatDate } from '../../helpers';
import { BadgeGrid } from '../../components/BadgeGrid';

interface AchievementsTabProps {
	profile: AgentProfile;
}

export function AchievementsTab({ profile }: AchievementsTabProps) {
	const { t } = useTranslation('qa.team');
	const { badges, milestones, rankingHistory, agent } = profile;
	const positions = rankingHistory.map((r) => r.position);
	const bestRank = positions.length ? Math.min(...positions) : profile.overall.rankInTeam;
	const currentRank = rankingHistory[rankingHistory.length - 1]?.position ?? profile.overall.rankInTeam;
	const teamSize = profile.overall.teamSize;

	return (
		<Stack gap='md'>
			<SectionCard title={t('achievements.badges')} description={t('achievements.badgesDescription', { count: badges.length })} icon={IconAward}>
				<BadgeGrid badges={badges} />
			</SectionCard>

			<SectionCard title={t('achievements.milestones')} icon={IconFlag}>
				<Stack gap='sm'>
					{milestones.map((m) => (
						<Paper key={m.id} withBorder p='sm'>
							<Group justify='space-between'>
								<Stack gap={2}>
									<Text fw={600} size='sm'>{m.name}</Text>
									<Text size='xs' c='dimmed'>{m.description}</Text>
								</Stack>
								{m.achievedAt ? (
									<Badge color='green' leftSection={<IconCheck size={12} />}>{t('achievements.achievedOn', { date: formatDate(m.achievedAt) })}</Badge>
								) : (
									<Text size='xs' c='dimmed'>{t('achievements.inProgress', { progress: m.progress })}</Text>
								)}
							</Group>
							<Progress value={m.progress} color={m.achievedAt ? 'green' : 'blue'} size='sm' mt='xs' />
						</Paper>
					))}
				</Stack>
			</SectionCard>

			<SectionCard title={t('achievements.ranking')} description={t('achievements.rankingDescription', { team: agent.team })} icon={IconTrophy}>
				<Group gap='md' mb='md'>
					<StatCard title={t('achievements.bestRank')} value={`#${bestRank}`} variant='compact' />
					<StatCard title={t('achievements.currentRank')} value={t('header.rank', { rank: currentRank, size: teamSize })} variant='compact' />
				</Group>
				<LineChart
					h={220}
					data={rankingHistory}
					dataKey='label'
					series={[{ name: 'position', color: 'grape.6' }]}
					yAxisProps={{ domain: [1, teamSize], reversed: true, allowDecimals: false }}
					withDots
				/>
			</SectionCard>
		</Stack>
	);
}
