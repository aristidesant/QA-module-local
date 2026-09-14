import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconMinus,
} from '@tabler/icons-react';
import type { TeamKpis } from '~/modules/qa/analytics/types';
import {
	comparison,
	formatMetric,
	isImprovement,
} from '~/modules/qa/analytics/helpers';

interface KpiTilesProps {
	kpis: TeamKpis;
	previous: TeamKpis;
	compare: boolean;
}

interface Tile {
	label: string;
	value: string;
	current: number | null;
	previous: number | null;
	/** Whether a rise is good news. */
	higherIsBetter: boolean;
}

/** The four headline numbers with their period-over-period change. */
export const KpiTiles: React.FC<KpiTilesProps> = ({
	kpis,
	previous,
	compare,
}) => {
	const { t } = useTranslation('qa.reports');

	const tiles: Tile[] = [
		{
			label: t('preview.tiles.qa'),
			value: formatMetric('QA_OVERALL_SCORE', kpis.qaScore),
			current: kpis.qaScore,
			previous: previous.qaScore,
			higherIsBetter: true,
		},
		{
			label: t('preview.tiles.compliance'),
			value: formatMetric('COMPLIANCE_OVERALL_SCORE', kpis.compliance),
			current: kpis.compliance,
			previous: previous.compliance,
			higherIsBetter: true,
		},
		{
			label: t('preview.tiles.sentiment'),
			value: formatMetric('CUSTOMER_SENTIMENT_SCORE', kpis.customerSentiment),
			current: kpis.customerSentiment,
			previous: previous.customerSentiment,
			higherIsBetter: true,
		},
		{
			label: t('preview.tiles.conversion'),
			value: kpis.conversionRate === null ? '—' : `${kpis.conversionRate}%`,
			current: kpis.conversionRate,
			previous: previous.conversionRate,
			higherIsBetter: true,
		},
	];

	return (
		<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='sm'>
			{tiles.map((tile) => {
				const cmp = comparison(tile.current, tile.previous);
				const delta = cmp.absoluteChange;
				const Icon =
					cmp.trend === 'UP'
						? IconArrowUpRight
						: cmp.trend === 'DOWN'
							? IconArrowDownRight
							: IconMinus;
				const good = isImprovement(cmp, tile.higherIsBetter);

				return (
					<Paper key={tile.label} withBorder radius='md' p='sm'>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600} lineClamp={1}>
							{tile.label}
						</Text>
						<Text size='xl' fw={700} mt={4}>
							{tile.value}
						</Text>
						{compare && delta !== null && (
							<Group gap={4} mt={4} wrap='nowrap'>
								<ThemeIcon
									size='xs'
									variant='light'
									color={good === null ? 'gray' : good ? 'green' : 'red'}
								>
									<Icon size={12} />
								</ThemeIcon>
								<Text size='xs' c='dimmed'>
									{Math.abs(delta)}
								</Text>
							</Group>
						)}
					</Paper>
				);
			})}
		</SimpleGrid>
	);
};

export default KpiTiles;
