import { ActionIcon, Badge, Group, Paper, Text, Tooltip } from '@mantine/core';
import { IconClock, IconPlayerPlay } from '@tabler/icons-react';
import type { Evidence } from '../../types';
import styles from './EvidenceQuote.module.css';

interface EvidenceQuoteProps {
	evidence: Evidence;
	/** Plays the recording from this quote. Omit it where there is no player. */
	onPlay?: () => void;
	/** The quote the player is on. */
	active?: boolean;
}

export function EvidenceQuote({
	evidence,
	onPlay,
	active,
}: EvidenceQuoteProps) {
	return (
		<Paper
			withBorder
			radius='sm'
			p='xs'
			bg='var(--mantine-color-gray-light)'
			data-active={active || undefined}
			className={styles.quote}
		>
			<Group gap='xs' mb='xs'>
				<Badge size='xs' variant='light' color='gray'>
					{evidence.speaker === 'agent' ? 'Agent' : 'Customer'}
				</Badge>
				<Group gap={4}>
					<IconClock size={12} />
					<Text size='xs' c='dimmed'>
						{evidence.timestamp}
					</Text>
				</Group>
				{onPlay && (
					<Tooltip label='Play from here' withArrow>
						<ActionIcon
							size='xs'
							variant='subtle'
							aria-label='Play from here'
							onClick={onPlay}
						>
							<IconPlayerPlay size={12} />
						</ActionIcon>
					</Tooltip>
				)}
			</Group>
			<Text size='sm' fs='italic'>
				"{evidence.quote}"
			</Text>
		</Paper>
	);
}
