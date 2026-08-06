import React from 'react';
import { Badge, Text, Card } from '@mantine/core';
import type { DemoPassFail } from '../../mockData';
import {
	DEMO_PASS_FAIL_COLORS,
	DEMO_PASS_FAIL_LABELS,
} from '../../demoBadgeColors';
import styles from './FinalScoreHeroCompact.module.css';

interface FinalScoreHeroCompactProps {
	score: number;
	pass: DemoPassFail;
	evaluationType?: string;
}

const FinalScoreHeroCompact: React.FC<FinalScoreHeroCompactProps> = ({
	score,
	pass,
	evaluationType,
}) => {
	return (
		<Card withBorder radius='md' p='md' className={styles.card}>
			<div className={styles.container}>
				<div className={styles.leftSection}>
					<Text className={styles.label}>
						Final Score{evaluationType ? ` — ${evaluationType}` : ''}
					</Text>
					<Text
						className={[styles.score, pass === 'fail' ? styles.scoreFail : '']
							.filter(Boolean)
							.join(' ')}
					>
						{score}
					</Text>
				</div>
				<Badge color={DEMO_PASS_FAIL_COLORS[pass]} variant='light' size='md'>
					{DEMO_PASS_FAIL_LABELS[pass]}
				</Badge>
			</div>
		</Card>
	);
};

export default FinalScoreHeroCompact;
