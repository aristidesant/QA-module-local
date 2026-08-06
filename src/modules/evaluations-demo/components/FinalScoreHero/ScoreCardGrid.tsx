import React from 'react';
import { Badge, Text, Card, Group } from '@mantine/core';
import type { DemoPassFail } from '../../mockData';
import {
	DEMO_PASS_FAIL_COLORS,
	DEMO_PASS_FAIL_LABELS,
} from '../../demoBadgeColors';
import styles from './ScoreCardGrid.module.css';

interface ScoreCardGridProps {
	score: number;
	pass: DemoPassFail;
	evaluationType?: string;
}

const ScoreCardGrid: React.FC<ScoreCardGridProps> = ({
	score,
	pass,
	evaluationType,
}) => {
	return (
		<Card withBorder radius='md' p='md' className={styles.card}>
			<Group justify='space-between' align='flex-start' mb='xs'>
				<div className={styles.scoreSection}>
					<Text className={styles.label}>Final Score</Text>
					<Text
						className={[styles.score, pass === 'fail' ? styles.scoreFail : '']
							.filter(Boolean)
							.join(' ')}
					>
						{score}
					</Text>
				</div>
				<Badge color={DEMO_PASS_FAIL_COLORS[pass]} variant='light' size='sm'>
					{DEMO_PASS_FAIL_LABELS[pass]}
				</Badge>
			</Group>
			{evaluationType && (
				<Text className={styles.evaluationType}>{evaluationType}</Text>
			)}
		</Card>
	);
};

export default ScoreCardGrid;
