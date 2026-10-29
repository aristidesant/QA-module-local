import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	Progress,
	Stack,
	Table,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { SENTIMENT_CAUSES_NS } from '~/modules/qa/sentimentCauses/constants';
import { useCauseLabel } from '~/modules/qa/sentimentCauses/useCauseSettings';
import {
	callsWithCause,
	causeRanking,
	causeTrend,
	familyShare,
} from '~/modules/qa/sentimentCauses/helpers';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import { ChartCard, Pair, SERIES, ShareBar, TrendChart } from '../charts';
import styles from '../TeamAnalyticsPage.module.css';

/** Root causes of sentiment drops: ranking, business-vs-agent share and the top causes over time. */
export default function CausesSection() {
	const { t } = useTranslation(SENTIMENT_CAUSES_NS);
	const { t: tA } = useTranslation('qa.teamAnalytics');
	const causeLabel = useCauseLabel();
	const { calls, previousCalls, filters, compare } = useTeamAnalyticsData();

	const ranking = useMemo(
		() => causeRanking(calls, previousCalls),
		[calls, previousCalls]
	);
	const families = useMemo(() => familyShare(calls), [calls]);
	const trend = useMemo(
		() => causeTrend(calls, filters.granularity),
		[calls, filters.granularity]
	);
	const withDrop = useMemo(() => callsWithCause(calls).length, [calls]);
	const na = tA('common.na');

	const rows = ranking.map((row) => {
		// Colour means exception: a cause that grew its share is the only one with a hue.
		const worsened = row.delta !== null && row.delta > 0;
		const TrendIcon =
			row.delta === null || row.delta === 0
				? IconMinus
				: row.delta > 0
					? IconTrendingUp
					: IconTrendingDown;
		return (
			<Table.Tr key={row.key}>
				<Table.Td>
					<Group gap='xs' wrap='nowrap'>
						<Text fw={500} size='sm'>
							{causeLabel(row.key)}
						</Text>
						<Badge size='xs' variant='outline' color='gray' tt='none'>
							{t(`families.${row.family}`)}
						</Badge>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text fw={700} size='sm'>
						{row.calls}
					</Text>
				</Table.Td>
				<Table.Td>
					<Group gap='xs' wrap='nowrap'>
						<Progress value={row.share} size='xs' color='gray' w={72} />
						<Text size='sm' c='dimmed'>
							{Math.round(row.share)}%
						</Text>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text size='sm'>
						{row.meanDrop === null ? na : `−${row.meanDrop.toFixed(1)}`}
					</Text>
				</Table.Td>
				{compare && (
					<>
						<Table.Td align='right'>
							<Text c='dimmed' size='sm'>
								{row.previousCalls}
							</Text>
						</Table.Td>
						<Table.Td align='right' className={styles.trendColumn}>
							{row.delta === null ? (
								<Text c='dimmed' size='sm'>
									{na}
								</Text>
							) : (
								<Group gap={4} justify='flex-end' wrap='nowrap'>
									<Text fw={500} size='sm'>
										{row.delta > 0 ? '+' : ''}
										{row.delta.toFixed(1)} pp
									</Text>
									<ThemeIcon
										size='sm'
										variant='light'
										color={worsened ? 'danger' : 'gray'}
									>
										<TrendIcon size={14} />
									</ThemeIcon>
								</Group>
							)}
						</Table.Td>
					</>
				)}
			</Table.Tr>
		);
	});

	return (
		<>
			<Pair>
				<ChartCard
					title={t('analytics.rankingTitle')}
					description={t('analytics.rankingDescription')}
					empty={withDrop === 0}
				>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={560}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('analytics.columns.cause')}</Table.Th>
									<Table.Th align='right'>
										{t('analytics.columns.calls')}
									</Table.Th>
									<Table.Th>{t('analytics.columns.share')}</Table.Th>
									<Table.Th align='right'>
										{t('analytics.columns.meanDrop')}
									</Table.Th>
									{compare && (
										<>
											<Table.Th align='right'>
												{t('analytics.columns.previous')}
											</Table.Th>
											<Table.Th align='right'>
												{t('analytics.columns.delta')}
											</Table.Th>
										</>
									)}
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
					</div>
				</ChartCard>
				<ChartCard
					title={t('analytics.familyTitle')}
					description={t('analytics.familyDescription')}
					empty={withDrop === 0}
				>
					<Stack gap='md'>
						<ShareBar
							segments={families.map((row, i) => ({
								key: row.family,
								label: t(`families.${row.family}`),
								value: row.count,
								color: SERIES[i],
							}))}
						/>
						<Text size='sm' c='dimmed'>
							{t('analytics.dropSummary', {
								count: withDrop,
								total: calls.length,
							})}
						</Text>
					</Stack>
				</ChartCard>
			</Pair>
			<ChartCard
				title={t('analytics.trendTitle')}
				description={t('analytics.trendDescription')}
				empty={trend.topKeys.length === 0}
			>
				<TrendChart
					data={trend.points}
					metricId='SENTIMENT_DROP_CALL_COUNT'
					series={trend.topKeys.map((key, i) => ({
						name: key,
						label: causeLabel(key),
						color: SERIES[i],
					}))}
				/>
			</ChartCard>
		</>
	);
}
