import { useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HUMAN_VS_AI_PERFORMANCE } from '../../mockData';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import { useInsightsTheme, withAlpha } from '../useInsightsTheme';

interface HumanVsAiRadarProps {
	index: number;
}

/** Human and AI agents on the same five metrics, each normalised to its own scale. */
export function HumanVsAiRadar({ index }: HumanVsAiRadarProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const option = useMemo<EChartsOption>(() => {
		const names = HUMAN_VS_AI_PERFORMANCE.map((point) =>
			t(`operationManager.humanVsAi.metric.${point.metric}`)
		);
		const normalised = (side: 'human' | 'ai') =>
			HUMAN_VS_AI_PERFORMANCE.map((point) =>
				Math.round((100 * point[side]) / point.max)
			);
		const raw = (side: 'human' | 'ai') =>
			HUMAN_VS_AI_PERFORMANCE.map((point) =>
				point.max === 5 ? `${point[side]}/5` : `${point[side]}%`
			);
		const humanLabel = t('operationManager.humanVsAi.human');
		const aiLabel = t('operationManager.humanVsAi.ai');

		return {
			...theme.base,
			legend: {
				bottom: 0,
				icon: 'roundRect',
				itemWidth: 10,
				itemHeight: 4,
				textStyle: { color: theme.dimmed, fontSize: 11 },
			},
			tooltip: {
				...theme.tooltip,
				trigger: 'item',
				formatter: (params: unknown) => {
					const p = params as { name: string };
					const values = p.name === aiLabel ? raw('ai') : raw('human');
					return `<b>${p.name}</b><br/>${names
						.map((name, i) => `${name}: ${values[i]}`)
						.join('<br/>')}`;
				},
			},
			radar: {
				indicator: names.map((name) => ({ name, max: 100 })),
				radius: '62%',
				center: ['50%', '46%'],
				shape: 'polygon',
				axisName: { color: theme.dimmed, fontSize: 11 },
				splitNumber: 4,
				splitLine: { lineStyle: { color: theme.border } },
				splitArea: { show: false },
				axisLine: { lineStyle: { color: theme.border } },
			},
			series: [
				{
					type: 'radar',
					symbol: 'circle',
					symbolSize: 4,
					data: [
						{
							name: humanLabel,
							value: normalised('human'),
							itemStyle: { color: theme.human },
							lineStyle: { width: 2, color: theme.human },
							areaStyle: { color: withAlpha(theme.human, '26') },
						},
						{
							name: aiLabel,
							value: normalised('ai'),
							itemStyle: { color: theme.ai },
							lineStyle: { width: 2, color: theme.ai, type: 'dashed' },
							areaStyle: { color: withAlpha(theme.ai, '1a') },
						},
					],
				},
			],
		};
	}, [theme, t]);

	return (
		<InsightsTile
			span={5}
			index={index}
			title={t('operationManager.insights.humanVsAi.title')}
			subtitle={t('operationManager.insights.humanVsAi.subtitle')}
		>
			<EChart
				option={option}
				height={280}
				ariaLabel={t('operationManager.insights.humanVsAi.title')}
			/>
			<Text size='xs' c='dimmed' mt={4}>
				{t('operationManager.humanVsAi.illustrative')}
			</Text>
		</InsightsTile>
	);
}

export default HumanVsAiRadar;
