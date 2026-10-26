import { Stack, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import {
	HEAT,
	SERIES_OTHER,
	ShareBar,
} from '~/modules/qa/analytics/TeamAnalyticsPage/charts';
import type { TeamOutcomes } from '../insightsMetrics';
import styles from '../Insights.module.css';

interface CallOutcomesCardProps {
	rows: TeamOutcomes[];
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** Per team: how many calls reached the customer, and what the offer led to. */
export function CallOutcomesCard({
	rows,
	selectedTeam,
	onTeamClick,
}: CallOutcomesCardProps) {
	const { t } = useTranslation('qa.dashboard');
	const node = (key: string) => t(`operationManager.insights.flow.node.${key}`);

	return (
		<SectionCard
			padding='md'
			fullHeight
			title={t('operationManager.insights.flow.title')}
			description={t('operationManager.insights.flow.subtitle')}
		>
			{rows.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<div>
					{rows.map((row) => (
						<div key={row.team} className={styles.outcomeRow}>
							<Stack gap='xs'>
								<UnstyledButton
									className={styles.teamButton}
									data-active={selectedTeam === row.team || undefined}
									aria-pressed={selectedTeam === row.team}
									onClick={() => onTeamClick(row.team)}
								>
									{row.team}
									<Text span size='xs' c='dimmed' ml={6}>
										{t('drill.calls', { count: row.calls })}
									</Text>
								</UnstyledButton>
								<ShareBar
									segments={[
										{
											key: 'EFFECTIVE',
											label: node('EFFECTIVE'),
											value: row.reached.EFFECTIVE,
											color: HEAT[3],
										},
										{
											key: 'NOT_EFFECTIVE',
											label: node('NOT_EFFECTIVE'),
											value: row.reached.NOT_EFFECTIVE,
											color: SERIES_OTHER,
										},
									]}
								/>
								<ShareBar
									title={t('operationManager.insights.flow.ofReached')}
									segments={[
										{
											key: 'SALE',
											label: node('SALE'),
											value: row.offer.SALE,
											color: HEAT[4],
										},
										{
											key: 'NO_SALE',
											label: node('NO_SALE'),
											value: row.offer.NO_SALE,
											color: HEAT[2],
										},
										{
											key: 'NO_OFFER',
											label: node('NO_OFFER'),
											value: row.offer.NO_OFFER,
											color: SERIES_OTHER,
										},
									]}
								/>
							</Stack>
						</div>
					))}
				</div>
			)}
		</SectionCard>
	);
}

export default CallOutcomesCard;
