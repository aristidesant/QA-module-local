import React from 'react';
import { Text, Card } from '@mantine/core';
import type { DemoPassFail } from '../../mockData';
import styles from './ScoreInline.module.css';

interface ScoreInlineProps {
	score: number;
	pass: DemoPassFail;
	evaluationType?: string;
}

const ScoreInline: React.FC<ScoreInlineProps> = ({ score, pass }) => {
	return (
		<Card withBorder radius='md' p='md' className={styles.card}>
			<div className={styles.container}>
				<Text size='xs' fw={500} c='dimmed' className={styles.label}>
					Final Score
				</Text>
				<Text
					className={[styles.score, pass === 'fail' ? styles.scoreFail : '']
						.filter(Boolean)
						.join(' ')}
				>
					{score}
				</Text>
			</div>
		</Card>
	);
};

export default ScoreInline;
