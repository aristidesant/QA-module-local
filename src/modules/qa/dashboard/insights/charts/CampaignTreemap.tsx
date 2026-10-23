import { useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import type { TreemapNode } from '../insightsMetrics';
import { useInsightsTheme } from '../useInsightsTheme';

interface CampaignTreemapProps {
	index: number;
	nodes: TreemapNode[];
	selectedCampaign: string | null;
	selectedLine: string | null;
	onCampaignClick: (campaignId: string) => void;
	onLineClick: (line: string) => void;
}

/** Line of business, then campaign: the area is the number of calls, the colour is the mean QA. */
export function CampaignTreemap({
	index,
	nodes,
	selectedCampaign,
	selectedLine,
	onCampaignClick,
	onLineClick,
}: CampaignTreemapProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const option = useMemo<EChartsOption>(() => {
		const leaf = (node: TreemapNode) => {
			const dim = selectedCampaign !== null && selectedCampaign !== node.id;
			return {
				name: node.name,
				id: node.id,
				value: [node.calls, node.qa],
				itemStyle: {
					opacity: dim ? 0.4 : 1,
					borderColor:
						selectedCampaign === node.id ? theme.text : theme.surface,
					borderWidth: 2,
				},
			};
		};
		return {
			...theme.base,
			tooltip: {
				...theme.tooltip,
				formatter: (params: unknown) => {
					const p = params as unknown as { name: string; value: number[] };
					return `${p.name}<br/>${t('operationManager.insights.treemap.tip', {
						calls: p.value[0],
						qa: p.value[1],
					})}`;
				},
			},
			visualMap: {
				type: 'continuous',
				show: false,
				dimension: 1,
				min: 60,
				max: 100,
				seriesIndex: 0,
				inRange: { color: theme.sequential },
			},
			series: [
				{
					type: 'treemap',
					roam: false,
					nodeClick: false,
					breadcrumb: { show: false },
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					label: {
						show: true,
						color: theme.text,
						fontSize: 12,
						formatter: '{b}',
					},
					upperLabel: {
						show: true,
						height: 22,
						color: theme.dimmed,
						fontSize: 11,
					},
					itemStyle: {
						borderColor: theme.surface,
						borderWidth: 2,
						gapWidth: 2,
						borderRadius: 6,
					},
					levels: [
						{ itemStyle: { borderWidth: 0, gapWidth: 4 } },
						{ itemStyle: { gapWidth: 2 } },
					],
					data: nodes.map((node) => ({
						name: node.name,
						id: node.id,
						value: [node.calls, node.qa],
						itemStyle: {
							borderColor:
								selectedLine === node.id ? theme.text : theme.surface,
						},
						children: node.children?.map(leaf),
					})),
				},
			],
		};
	}, [nodes, selectedCampaign, selectedLine, theme, t]);

	return (
		<InsightsTile
			span={6}
			index={index}
			title={t('operationManager.insights.treemap.title')}
			subtitle={t('operationManager.insights.treemap.subtitle')}
		>
			{nodes.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<EChart
					option={option}
					height={300}
					ariaLabel={t('operationManager.insights.treemap.title')}
					onItemClick={({ data }) => {
						const node = data as
							| { id?: string; children?: unknown[] }
							| undefined;
						if (!node?.id) return;
						if (node.children) onLineClick(node.id);
						else onCampaignClick(node.id);
					}}
				/>
			)}
		</InsightsTile>
	);
}

export default CampaignTreemap;
