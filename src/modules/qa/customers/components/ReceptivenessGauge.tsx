import { Badge, Group, Stack, Tooltip } from '@mantine/core';
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

export function ReceptivenessGauge({ score, band, size = 112 }: ReceptivenessGaugeProps) {
	const { t } = useTranslation('qa.customers');
	const meta = RECEPTIVENESS_META[band];

	return (
		<Stack align='center' gap={4}>
			<ScoreRing value={score} size={size} color={meta.color} label={score} />
			<Group gap={4}>
				<Badge variant='light' color={meta.color}>{t(meta.labelKey)}</Badge>
				<Tooltip label={t('receptiveness.hint')}>
					<IconInfoCircle size={14} />
				</Tooltip>
			</Group>
		</Stack>
	);
}
