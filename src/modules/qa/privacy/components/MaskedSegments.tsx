import { Badge, Tooltip } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { KIND_LABEL } from '../constants';
import type { MaskSegment } from '../types';
import styles from './MaskedSegments.module.css';

interface MaskedSegmentsProps {
	segments: MaskSegment[];
	/** Show the real data, underlined, instead of the chip. */
	revealed?: boolean;
}

/** Plain text with each sensitive span drawn as a grey chip (or underlined when revealed). */
export function MaskedSegments({
	segments,
	revealed = false,
}: MaskedSegmentsProps) {
	return (
		<>
			{segments.map((segment, i) =>
				segment.hit ? (
					revealed ? (
						<Tooltip
							key={i}
							label={`${KIND_LABEL[segment.hit.kind]} · revealed`}
							withArrow
						>
							<mark className={styles.revealed}>{segment.text}</mark>
						</Tooltip>
					) : (
						<Tooltip
							key={i}
							label={`${KIND_LABEL[segment.hit.kind]} masked`}
							withArrow
						>
							<Badge
								component='span'
								size='xs'
								variant='light'
								color='gray'
								tt='none'
								leftSection={<IconLock size={10} />}
								className={styles.chip}
							>
								{KIND_LABEL[segment.hit.kind]} {segment.hit.preview}
							</Badge>
						</Tooltip>
					)
				) : (
					<span key={i}>{segment.text}</span>
				)
			)}
		</>
	);
}
