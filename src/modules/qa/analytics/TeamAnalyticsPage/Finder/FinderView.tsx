import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Group,
	NumberInput,
	Select,
	Stack,
	Table,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconTrendingUp,
	IconTrendingDown,
	IconMinus,
} from '@tabler/icons-react';
import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
import {
	useTeamAnalyticsStore,
	selectFinderQuery,
	selectFinderPresets,
} from '~/stores/qa/teamAnalyticsStore';
import { VIEW_METRICS } from '../../constants';
import {
	comparison,
	describeFinderQuery,
	formatMetric,
	isImprovement,
	runFinderQuery,
	burnoutLevelsByAgent,
} from '../../helpers';
import type { FinderOperator, MetricView, SegmentMetricId } from '../../types';
import {
	useTriggerRulesStore,
	selectTriggerRules,
} from '~/stores/qa/triggerRulesStore';
import { useTeamAnalyticsData } from '../TeamAnalyticsContext';
import styles from '../TeamAnalyticsPage.module.css';

const OPERATORS: FinderOperator[] = ['BELOW', 'ABOVE', 'BETWEEN'];

/** Metric picker groups mirror the evaluation areas. */
const AREA_OF_VIEW: Record<MetricView, string> = {
	qa: 'QUALITY_ASSURANCE',
	sentiment: 'SENTIMENT_EMOTION',
	compliance: 'COMPLIANCE',
	business: 'BUSINESS_INSIGHTS',
};

const BURNOUT_COLOR: Record<BurnoutRiskLevel, string> = {
	[BurnoutRiskLevel.HIGH]: 'red',
	[BurnoutRiskLevel.MEDIUM]: 'orange',
	[BurnoutRiskLevel.LOW]: 'gray',
};

const FinderView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const { role, calls, previousCalls, scopedAgents } = useTeamAnalyticsData();
	const query = useTeamAnalyticsStore(selectFinderQuery);
	const presets = useTeamAnalyticsStore(selectFinderPresets);
	const { setFinderQuery } = useTeamAnalyticsStore();

	const triggerRules = useTriggerRulesStore(selectTriggerRules);
	const burnoutByAgent = useMemo(
		() => burnoutLevelsByAgent(triggerRules),
		[triggerRules]
	);
	const rows = useMemo(
		() =>
			runFinderQuery(calls, previousCalls, scopedAgents, query, burnoutByAgent),
		[calls, previousCalls, scopedAgents, query, burnoutByAgent]
	);

	const metricOptions = (Object.keys(VIEW_METRICS) as MetricView[]).map(
		(view) => ({
			group: t(`areas.${AREA_OF_VIEW[view]}`),
			items: VIEW_METRICS[view].map((id) => ({
				value: id,
				label: t(`metrics.${id}`),
			})),
		})
	);

	const metricLabel = t(`metrics.${query.metricId}`);
	const higherIsBetter = METRIC_BY_ID[query.metricId].higherIsBetter;
	const isManager = role === 'qa-manager';
	const na = t('common.na');

	return (
		<Stack gap='md'>
			<div>
				<Text fw={600} size='sm'>
					{t('finder.title')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t('finder.description')}
				</Text>
			</div>

			<Group align='flex-end' gap='sm' wrap='wrap'>
				<Select
					label={t('finder.fields.metric')}
					data={metricOptions}
					value={query.metricId}
					onChange={(value) =>
						value && setFinderQuery({ metricId: value as SegmentMetricId })
					}
					allowDeselect={false}
					comboboxProps={{ withinPortal: true }}
					className={styles.finderMetricField}
				/>
				<Select
					label={t('finder.fields.operator')}
					data={OPERATORS.map((op) => ({
						value: op,
						label: t(`finder.operators.${op}`),
					}))}
					value={query.operator}
					onChange={(value) =>
						value && setFinderQuery({ operator: value as FinderOperator })
					}
					allowDeselect={false}
					comboboxProps={{ withinPortal: true }}
					className={styles.finderField}
				/>
				<NumberInput
					label={
						query.operator === 'BETWEEN'
							? t('finder.fields.from')
							: t('finder.fields.value')
					}
					value={query.value}
					onChange={(value) => setFinderQuery({ value: Number(value) || 0 })}
					decimalScale={1}
					className={styles.finderField}
				/>
				{query.operator === 'BETWEEN' && (
					<NumberInput
						label={t('finder.fields.to')}
						value={query.value2 ?? query.value}
						onChange={(value) => setFinderQuery({ value2: Number(value) || 0 })}
						decimalScale={1}
						error={
							(query.value2 ?? 0) <= query.value
								? t('finder.validation.rangeInvalid')
								: undefined
						}
						className={styles.finderField}
					/>
				)}
				<NumberInput
					label={t('finder.fields.minCalls')}
					value={query.minCalls}
					onChange={(value) => setFinderQuery({ minCalls: Number(value) || 0 })}
					min={0}
					className={styles.finderField}
				/>
				<Select
					label={t('finder.presets')}
					placeholder={t('finder.presets')}
					data={presets.map((p) => ({ value: p.id, label: p.name }))}
					value={null}
					onChange={(id) => {
						const preset = presets.find((p) => p.id === id);
						if (preset) setFinderQuery(preset.query);
					}}
					comboboxProps={{ withinPortal: true }}
					className={styles.finderMetricField}
				/>
			</Group>

			<Text size='xs' c='dimmed'>
				{t('finder.liveHint')}
			</Text>

			{rows.length === 0 ? (
				<Stack gap={4} py='xl' align='center'>
					<Text fw={500} size='sm'>
						{t('finder.empty')}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('finder.emptyDescription')}
					</Text>
				</Stack>
			) : (
				<>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={720}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('finder.columns.agent')}</Table.Th>
									{isManager && (
										<Table.Th>{t('finder.columns.supervisor')}</Table.Th>
									)}
									<Table.Th align='right'>{t('finder.columns.value')}</Table.Th>
									<Table.Th align='right'>
										{t('finder.columns.previous')}
									</Table.Th>
									<Table.Th align='right'>{t('finder.columns.trend')}</Table.Th>
									<Table.Th align='right'>{t('finder.columns.calls')}</Table.Th>
									<Table.Th>{t('finder.columns.burnout')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((row) => {
									const cmp = comparison(row.value, row.previousValue);
									const improved = isImprovement(cmp, higherIsBetter);
									const TrendIcon =
										cmp.trend === 'UP'
											? IconTrendingUp
											: cmp.trend === 'DOWN'
												? IconTrendingDown
												: IconMinus;
									return (
										<Table.Tr key={row.agentId}>
											<Table.Td>
												<Text size='sm' fw={500}>
													{row.agentName}
												</Text>
												<Text size='xs' c='dimmed'>
													{row.team}
												</Text>
											</Table.Td>
											{isManager && (
												<Table.Td>
													<Text size='sm' c='dimmed'>
														{row.supervisorName}
													</Text>
												</Table.Td>
											)}
											<Table.Td align='right'>
												<Text size='sm' fw={700}>
													{formatMetric(query.metricId, row.value)}
												</Text>
											</Table.Td>
											<Table.Td align='right'>
												<Text size='sm' c='dimmed'>
													{formatMetric(query.metricId, row.previousValue)}
												</Text>
											</Table.Td>
											<Table.Td align='right' className={styles.trendColumn}>
												{cmp.trend === 'UNAVAILABLE' ? (
													<Text size='sm' c='dimmed'>
														{na}
													</Text>
												) : (
													<ThemeIcon
														size='sm'
														variant='light'
														color={
															improved === null
																? 'gray'
																: improved
																	? 'green'
																	: 'red'
														}
													>
														<TrendIcon size={14} />
													</ThemeIcon>
												)}
											</Table.Td>
											<Table.Td align='right'>
												<Text size='sm' c='dimmed'>
													{row.callsEvaluated}
												</Text>
											</Table.Td>
											<Table.Td className={styles.levelColumn}>
												<Badge
													size='sm'
													variant='light'
													color={BURNOUT_COLOR[row.burnoutLevel]}
												>
													{row.burnoutLevel}
												</Badge>
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</div>

					<Group gap='xs'>
						<Text size='sm' fw={500}>
							{t('finder.summary', { count: rows.length })}
						</Text>
						<Text size='sm' c='dimmed'>
							·{' '}
							{describeFinderQuery(
								query,
								metricLabel,
								t(`finder.operators.${query.operator}`).toLowerCase()
							)}
						</Text>
					</Group>
				</>
			)}
		</Stack>
	);
};

export default FinderView;
