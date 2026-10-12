import { SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { StatCard } from '~/components/StatCard';
import type {
	RankingProgram,
	RankingStanding,
} from '~/models/qa/rankingPrograms';
import { leader } from '../helpers';

interface RankingStatsProps {
	program: RankingProgram;
	standings: RankingStanding[];
}

/** Participants, qualified, reached target and who leads (or won). */
export function RankingStats({ program, standings }: RankingStatsProps) {
	const { t } = useTranslation('qa.rankings');
	const qualified = standings.filter((s) => s.rank !== null);
	const top = leader(standings);
	const completed = program.status === 'completed';

	return (
		<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
			<StatCard title={t('drawer.participants')} value={standings.length} />
			<StatCard title={t('drawer.qualified')} value={qualified.length} />
			<StatCard
				title={t('drawer.reachedTarget')}
				value={standings.filter((s) => s.reachedTarget).length}
				color='green'
			/>
			<StatCard
				title={completed ? t('drawer.winner') : t('drawer.leader')}
				value={
					completed ? (program.winnerName ?? '—') : (top?.agentName ?? '—')
				}
			/>
		</SimpleGrid>
	);
}

export default RankingStats;
