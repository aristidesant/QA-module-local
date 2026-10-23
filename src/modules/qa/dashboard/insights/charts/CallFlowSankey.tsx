import { useMemo } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EChart } from '../EChart';
import type { EChartsOption } from '../echarts';
import { InsightsTile } from '../InsightsTile';
import type { CallFlow } from '../insightsMetrics';
import { useInsightsTheme } from '../useInsightsTheme';

interface CallFlowSankeyProps {
	index: number;
	flow: CallFlow;
	teams: string[];
	selectedTeam: string | null;
	onTeamClick: (team: string) => void;
}

/** Team, then whether the customer was reached, then what happened with the offer. */
export function CallFlowSankey({
	index,
	flow,
	teams,
	selectedTeam,
	onTeamClick,
}: CallFlowSankeyProps) {
	const { t } = useTranslation('qa.dashboard');
	const theme = useInsightsTheme();

	const option = useMemo<EChartsOption>(() => {
		const colors: Record<string, string> = {
			...theme.team,
			EFFECTIVE: theme.indigo,
			NOT_EFFECTIVE: theme.neutral,
			SALE: theme.accent,
			NO_SALE: theme.neutral,
			NO_OFFER: theme.border,
		};
		const labelOf = (name: string) =>
			teams.includes(name)
				? name
				: t(`operationManager.insights.flow.node.${name}`);
		return {
			...theme.base,
			tooltip: { ...theme.tooltip, trigger: 'item' },
			series: [
				{
					type: 'sankey',
					left: 8,
					right: 90,
					top: 8,
					bottom: 8,
					nodeAlign: 'justify',
					nodeGap: 14,
					nodeWidth: 10,
					emphasis: { focus: 'adjacency' },
					label: {
						color: theme.text,
						fontSize: 11,
						formatter: (params: unknown) =>
							labelOf((params as unknown as { name: string }).name),
					},
					lineStyle: { color: 'gradient', opacity: 0.3, curveness: 0.5 },
					data: flow.nodes.map((name) => ({
						name,
						itemStyle: {
							color: colors[name] ?? theme.accent,
							opacity:
								selectedTeam !== null &&
								teams.includes(name) &&
								name !== selectedTeam
									? 0.35
									: 1,
						},
					})),
					links: flow.links.map((link) => ({
						...link,
						lineStyle: {
							opacity:
								selectedTeam !== null &&
								teams.includes(link.source) &&
								link.source !== selectedTeam
									? 0.06
									: 0.3,
						},
					})),
				},
			],
		};
	}, [flow, teams, selectedTeam, theme, t]);

	return (
		<InsightsTile
			span={6}
			index={index}
			title={t('operationManager.insights.flow.title')}
			subtitle={t('operationManager.insights.flow.subtitle')}
		>
			{flow.links.length === 0 ? (
				<Text size='sm' c='dimmed' py='xl' ta='center'>
					{t('operationManager.insights.empty')}
				</Text>
			) : (
				<EChart
					option={option}
					height={300}
					ariaLabel={t('operationManager.insights.flow.title')}
					onItemClick={({ name }) => {
						if (teams.includes(name)) onTeamClick(name);
					}}
				/>
			)}
		</InsightsTile>
	);
}

export default CallFlowSankey;
