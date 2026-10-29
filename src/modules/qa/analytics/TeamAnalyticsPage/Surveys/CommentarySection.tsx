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
import type { SurveyCommentary } from '~/modules/qa/surveys/types';
import {
	BreakdownBars,
	ChartCard,
	Pair,
	SERIES,
	ShareBar,
	TrendChart,
} from '../charts';
import styles from '../TeamAnalyticsPage.module.css';

interface CommentarySectionProps {
	commentary: SurveyCommentary;
	/** Render period-over-period columns and arrows. */
	compare: boolean;
}

/** What customers say, read as structure: the causes behind detractor comments, how they move, and what promoters praise. */
export default function CommentarySection({
	commentary,
	compare,
}: CommentarySectionProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { t: tCauses } = useTranslation(SENTIMENT_CAUSES_NS);
	const causeLabel = useCauseLabel();
	const na = t('common.na');
	const empty = commentary.detractorComments === 0;
	const noStrengths = commentary.strengths.every((s) => s.comments === 0);

	const rows = commentary.causes.map((row) => {
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
							{tCauses(`families.${row.family}`)}
						</Badge>
					</Group>
				</Table.Td>
				<Table.Td align='right'>
					<Text fw={700} size='sm'>
						{row.comments}
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
				{compare && (
					<>
						<Table.Td align='right'>
							<Text c='dimmed' size='sm'>
								{row.previousComments}
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
					title={t('surveysView.commentary.rankingTitle')}
					description={t('surveysView.commentary.rankingDescription')}
					empty={empty}
				>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={460}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>
										{t('surveysView.commentary.columns.cause')}
									</Table.Th>
									<Table.Th align='right'>
										{t('surveysView.commentary.columns.comments')}
									</Table.Th>
									<Table.Th>
										{t('surveysView.commentary.columns.share')}
									</Table.Th>
									{compare && (
										<>
											<Table.Th align='right'>
												{t('surveysView.commentary.columns.previous')}
											</Table.Th>
											<Table.Th align='right'>
												{t('surveysView.commentary.columns.delta')}
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
					title={t('surveysView.commentary.familyTitle')}
					description={t('surveysView.commentary.familyDescription')}
					empty={empty}
				>
					<Stack gap='md'>
						<ShareBar
							segments={commentary.families.map((row, i) => ({
								key: row.family,
								label: tCauses(`families.${row.family}`),
								value: row.count,
								color: SERIES[i],
							}))}
						/>
						<Text size='sm' c='dimmed'>
							{t('surveysView.commentary.classified', {
								count: commentary.detractorComments,
								total: commentary.detractorResponses,
							})}
						</Text>
					</Stack>
				</ChartCard>
			</Pair>
			<Pair>
				<ChartCard
					title={t('surveysView.commentary.strengthsTitle')}
					description={t('surveysView.commentary.strengthsDescription')}
					empty={noStrengths}
				>
					<BreakdownBars
						unit='COUNT'
						valueLabel={t('surveysView.commentary.columns.comments')}
						rows={commentary.strengths.map((row) => ({
							key: row.key,
							label: t(`surveysView.strengths.${row.key}`),
							value: row.comments,
						}))}
					/>
				</ChartCard>
				<ChartCard
					title={t('surveysView.commentary.trendTitle')}
					description={t('surveysView.commentary.trendDescription')}
					empty={commentary.trend.topKeys.length === 0}
				>
					<TrendChart
						data={commentary.trend.points}
						metricId='SURVEY_RESPONSE_COUNT'
						series={commentary.trend.topKeys.map((key, i) => ({
							name: key,
							label: causeLabel(key),
							color: SERIES[i],
						}))}
					/>
				</ChartCard>
			</Pair>
		</>
	);
}
