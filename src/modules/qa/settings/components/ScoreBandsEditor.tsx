import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, NumberInput, Stack, Text } from '@mantine/core';
import SectionCard from '~/components/SectionCard';
import { validateBands } from '../helpers';
import type { ScoreBands } from '../types';
import {
	BandPreview,
	SCORE_SEGMENT_COLORS,
	type BandPreviewSegment,
} from './BandPreview';

interface ScoreBandsEditorProps {
	title: string;
	description: string;
	value: ScoreBands;
	onChange: (value: ScoreBands) => void;
	/** Upper end of the scale; 100 for every percentage score. */
	max?: number;
}

const toNumber = (value: string | number, fallback: number) =>
	typeof value === 'number' ? value : Number(value) || fallback;

/** Two cut points (On target / Watch) with a live preview of the three bands they produce. */
export const ScoreBandsEditor: React.FC<ScoreBandsEditorProps> = ({
	title,
	description,
	value,
	onChange,
	max = 100,
}) => {
	const { t } = useTranslation('qa.settings');
	const errorKey = validateBands(value);

	const segments: BandPreviewSegment[] = [
		{
			key: 'critical',
			label: t('bands.atRiskRange', { value: value.watch }),
			size: value.watch,
			...SCORE_SEGMENT_COLORS.critical,
		},
		{
			key: 'warning',
			label: t('bands.watchRange', { from: value.watch, to: value.onTarget }),
			size: value.onTarget - value.watch,
			...SCORE_SEGMENT_COLORS.warning,
		},
		{
			key: 'good',
			label: t('bands.onTargetRange', { value: value.onTarget }),
			size: max - value.onTarget,
			...SCORE_SEGMENT_COLORS.good,
		},
	];

	return (
		<SectionCard title={title} description={description}>
			<Stack gap='md'>
				<Group align='flex-start' gap='md'>
					<NumberInput
						label={t('bands.onTarget')}
						value={value.onTarget}
						onChange={(v) =>
							onChange({ ...value, onTarget: toNumber(v, value.onTarget) })
						}
						min={0}
						max={max}
						w={180}
						error={errorKey ? t(errorKey) : undefined}
					/>
					<NumberInput
						label={t('bands.watch')}
						value={value.watch}
						onChange={(v) =>
							onChange({ ...value, watch: toNumber(v, value.watch) })
						}
						min={0}
						max={max}
						w={180}
					/>
				</Group>
				{!errorKey && <BandPreview segments={segments} />}
				<Text size='xs' c='dimmed'>
					{t('bands.atRiskHint', { value: value.watch })}
				</Text>
			</Stack>
		</SectionCard>
	);
};

export default ScoreBandsEditor;
