import { Group, Stack, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { useTranslation } from 'react-i18next';
import type { LmsImpact } from '~/models/qa';
import { VERDICT_COLOR } from '../constants';

interface ImpactSparklineProps {
	impact: LmsImpact;
	height?: number;
	withCheckpoints?: boolean;
}

export function ImpactSparkline({ impact, height = 90, withCheckpoints = true }: ImpactSparklineProps) {
	const { t } = useTranslation('qa.lms');
	const color = VERDICT_COLOR[impact.verdict];
	const data = impact.series.map((p) => ({ label: p.label, value: p.value }));

	return (
		<Stack gap='xs'>
			<AreaChart
				h={height}
				data={data}
				dataKey='label'
				series={[{ name: 'value', color }]}
				curveType='monotone'
				withDots={false}
				withYAxis={false}
				gridAxis='none'
				referenceLines={[{ x: 'W0', color: 'gray', label: t('impact.title') }]}
			/>
			{withCheckpoints && (
				<Group gap='lg'>
					<Stack gap={0}>
						<Text size='xs' c='dimmed'>
							{t('impact.baseline')}
						</Text>
						<Text size='sm' fw={600}>
							{impact.baseline}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size='xs' c='dimmed'>
							{t('impact.checkpoint15')}
						</Text>
						<Text size='sm' fw={600}>
							{impact.checkpoint15 ?? '—'}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size='xs' c='dimmed'>
							{t('impact.checkpoint30')}
						</Text>
						<Text size='sm' fw={600} c={color}>
							{impact.checkpoint30 ?? '—'}
						</Text>
					</Stack>
				</Group>
			)}
		</Stack>
	);
}
