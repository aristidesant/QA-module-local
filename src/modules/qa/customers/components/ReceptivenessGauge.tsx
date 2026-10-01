import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ScoreRing } from '~/modules/qa/team/components/ScoreRing';
import type { ReceptivenessBand } from '../types';
import { RECEPTIVENESS_META } from '../constants';

interface ReceptivenessGaugeProps {
	score: number;
	band: ReceptivenessBand;
	size?: number;
}

/** A neutral ring and label; only a resistant customer turns it red. */
export function ReceptivenessGauge({
	score,
	band,
	size = 112,
}: ReceptivenessGaugeProps) {
	const { t } = useTranslation('qa.customers');
	const resistant = band === 'resistant';

	return (
		<Stack align='center' gap={4}>
			<Text size='xs' c='dimmed' tt='uppercase'>
				{t('header.receptiveness')}
			</Text>
			<ScoreRing
				value={score}
				size={size}
				color={resistant ? 'red.6' : 'gray.6'}
				label={score}
			/>
			<Group gap={4}>
				<Text
					size='xs'
					c={resistant ? 'var(--mantine-color-red-text)' : 'dimmed'}
					tt='uppercase'
					fw={600}
				>
					{t(RECEPTIVENESS_META[band].labelKey)}
				</Text>
				<Tooltip label={t('receptiveness.hint')}>
					<IconInfoCircle size={14} color='var(--mantine-color-dimmed)' />
				</Tooltip>
			</Group>
		</Stack>
	);
}
