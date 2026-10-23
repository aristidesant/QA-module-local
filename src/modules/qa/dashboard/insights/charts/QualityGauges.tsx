import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import { useInsightsTheme } from '../useInsightsTheme';

interface QualityGaugesProps {
	index: number;
	qa: number;
	compliance: number;
	/** Customer sentiment on its 1-5 scale. */
	sentiment: number;
}

/** Three ring gauges: QA, compliance and customer sentiment (shown as a share of its scale). */
export function QualityGauges({
	index,
	qa,
	compliance,
	sentiment,
}: QualityGaugesProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const option = useMemo<EChartsOption>(() => {
		const gauge = (
			name: string,
			x: string,
			value: number,
			text: string,
			color: string
		) => ({
			type: 'gauge' as const,
			name,
			center: [x, '52%'],
			radius: '38%',
			startAngle: 220,
			endAngle: -40,
			min: 0,
			max: 100,
			pointer: { show: false },
			progress: {
				show: true,
				width: 9,
				roundCap: true,
				itemStyle: { color },
			},
			axisLine: {
				roundCap: true,
				lineStyle: { width: 9, color: [[1, theme.border]] },
			},
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: { show: false },
			title: {
				offsetCenter: [0, '92%'],
				fontSize: 11,
				color: theme.dimmed,
			},
			detail: {
				offsetCenter: [0, '4%'],
				fontSize: 20,
				fontWeight: 600,
				color: theme.text,
				formatter: () => text,
			},
			data: [{ value, name }],
		});

		return {
			...theme.base,
			tooltip: { ...theme.tooltip, formatter: '{a}' },
			series: [
				gauge(
					t('operationManager.insights.kpis.qa'),
					'17%',
					qa,
					String(qa),
					theme.team['Team 1']
				),
				gauge(
					t('operationManager.insights.kpis.compliance'),
					'50%',
					compliance,
					`${compliance}%`,
					theme.team['Team 2']
				),
				gauge(
					t('operationManager.insights.kpis.sentiment'),
					'83%',
					Math.round(((sentiment - 1) / 4) * 100),
					`${sentiment.toFixed(1)}/5`,
					theme.team['Team 3']
				),
			],
		};
	}, [qa, compliance, sentiment, theme, t]);

	return (
		<InsightsTile
			span={4}
			index={index}
			title={t('operationManager.insights.gauges.title')}
			subtitle={t('operationManager.insights.gauges.subtitle')}
		>
			<EChart
				option={option}
				height={280}
				ariaLabel={`${t('operationManager.insights.gauges.title')}: QA ${qa}, ${compliance}%, ${sentiment.toFixed(1)}/5`}
			/>
		</InsightsTile>
	);
}

export default QualityGauges;
