import { Stack, Text } from '@mantine/core';
import type { TranscriptTurnWithEmotion } from '../types';
import styles from './TranscriptWithEmotions.module.css';

interface TranscriptWithEmotionsProps {
	turns: TranscriptTurnWithEmotion[];
}

export default function TranscriptWithEmotions({
	turns,
}: TranscriptWithEmotionsProps) {
	return (
		<Stack gap='sm' className={styles.transcript}>
			{turns.map((turn) => (
				<div key={turn.id} className={`${styles.turn} ${styles[turn.role]}`}>
					<div className={styles.header}>
						<Text component='span' fw={600} size='xs' tt='uppercase'>
							{turn.role === 'agent' ? 'Agent' : 'Customer'}
						</Text>
						<Text component='span' size='xs' c='dimmed'>
							{turn.timestamp}
						</Text>
					</div>

					<Text size='sm' className={styles.text}>
						{turn.text}
					</Text>
				</div>
			))}
		</Stack>
	);
}
