import { useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { OperationManagerEsg } from '../../mockData';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import { useInsightsTheme, withAlpha } from '../useInsightsTheme';
import styles from '../Insights.module.css';

interface EsgPolarProps {
	index: number;
	esg: OperationManagerEsg;
}

/** The three ESG pillars as rounded polar bars, with the overall score in the middle. */
export function EsgPolar({ index, esg }: EsgPolarProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const option = useMemo<EChartsOption>(() => {
		const colors = [theme.team['Team 3'], theme.accent, theme.indigo];
		const labels = esg.pillars.map((pillar) =>
			t(`operationManager.esg.pillar.${pillar.key}`)
		);
		return {
			...theme.base,
			tooltip: { ...theme.tooltip, trigger: 'item' },
			polar: { radius: ['26%', '88%'], center: ['50%', '50%'] },
			angleAxis: {
				max: 100,
				startAngle: 90,
				show: false,
			},
			radiusAxis: {
				type: 'category',
				data: labels,
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: { color: theme.dimmed, fontSize: 11 },
				z: 10,
			},
			series: [
				{
					type: 'bar',
					coordinateSystem: 'polar',
					roundCap: true,
					barWidth: 12,
					showBackground: true,
					backgroundStyle: { color: withAlpha(theme.border, '99') },
					data: esg.pillars.map((pillar, i) => ({
						name: labels[i],
						value: pillar.score,
						itemStyle: { color: colors[i % colors.length] },
					})),
				},
			],
		};
	}, [esg, theme, t]);

	return (
		<InsightsTile
			span={6}
			index={index}
			title={t('operationManager.insights.esg.title')}
			subtitle={t('operationManager.insights.esg.subtitle')}
		>
			<div className={styles.donutHost}>
				<EChart
					option={option}
					height={260}
					ariaLabel={`${t('operationManager.esg.score')}: ${esg.overall}`}
				/>
				<div className={styles.centerOverlay}>
					<div className={styles.kpiValue}>{esg.overall}</div>
					<Text size='xs' c='dimmed'>
						{t(`operationManager.esg.status.${esg.status}`)}
					</Text>
				</div>
			</div>
		</InsightsTile>
	);
}

export default EsgPolar;
