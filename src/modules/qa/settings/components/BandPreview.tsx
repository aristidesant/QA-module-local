import React from 'react';
import { Box, Group, Text } from '@mantine/core';

export interface BandPreviewSegment {
	key: string;
	label: string;
	/** Size of the segment on the scale, in the scale's own units. */
	size: number;
	/** Mantine color token for the fill, e.g. 'green.8'. */
	bg: string;
	/** Text color that stays readable on `bg` in both color schemes. */
	c: string;
}

interface BandPreviewProps {
	segments: BandPreviewSegment[];
}

/** Fill/text pairs for the 3-band score scale and the 5-band sentiment scale. */
export const SCORE_SEGMENT_COLORS = {
	critical: { bg: 'red.8', c: 'white' },
	warning: { bg: 'yellow.5', c: 'dark.9' },
	good: { bg: 'green.8', c: 'white' },
} as const;

export const SENTIMENT_SEGMENT_COLORS = [
	{ bg: 'red.8', c: 'white' },
	{ bg: 'red.4', c: 'dark.9' },
	{ bg: 'gray.4', c: 'dark.9' },
	{ bg: 'green.4', c: 'dark.9' },
	{ bg: 'green.8', c: 'white' },
] as const;

/** Minimum share of the bar a segment keeps so its label stays readable. */
const MIN_FLEX = 8;

/** One horizontal bar split into the bands a threshold configuration produces. */
export const BandPreview: React.FC<BandPreviewProps> = ({ segments }) => (
	<Group
		gap={2}
		wrap='nowrap'
		role='img'
		aria-label={segments.map((s) => s.label).join(', ')}
	>
		{segments.map((segment) => (
			<Box
				key={segment.key}
				flex={Math.max(segment.size, MIN_FLEX)}
				bg={segment.bg}
				px='xs'
				py={6}
				ta='center'
			>
				<Text size='xs' fw={600} c={segment.c} lineClamp={1}>
					{segment.label}
				</Text>
			</Box>
		))}
	</Group>
);

export default BandPreview;
