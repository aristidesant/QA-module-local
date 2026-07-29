import React from 'react';
import { Badge, Text } from '@mantine/core';
import type { DemoPassFail } from '../../mockData';
import { DEMO_PASS_FAIL_COLORS, DEMO_PASS_FAIL_LABELS } from '../../demoBadgeColors';
import styles from './FinalScoreHero.module.css';

interface FinalScoreHeroProps {
	score: number;
	pass: DemoPassFail;
}

const FinalScoreHero: React.FC<FinalScoreHeroProps> = ({ score, pass }) => {
	return (
		<div className={styles.hero}>
			<Text className={styles.label}>Final Score</Text>
			<Text
				className={[styles.score, pass === 'fail' ? styles.scoreFail : '']
					.filter(Boolean)
					.join(' ')}
			>
				{score}
			</Text>
			<Badge color={DEMO_PASS_FAIL_COLORS[pass]} variant='light' size='lg'>
				{DEMO_PASS_FAIL_LABELS[pass]}
			</Badge>
		</div>
	);
};

export default FinalScoreHero;
