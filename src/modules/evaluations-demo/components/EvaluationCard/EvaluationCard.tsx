import React from 'react';
import { Badge, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import type { DemoEvaluation } from '../../mockData';
import { DEMO_HEALTH_COLORS, DEMO_HEALTH_LABELS } from '../../demoBadgeColors';
import {
	DEMO_CATEGORY_COLORS,
	DEMO_CATEGORY_ICONS,
	DEMO_CATEGORY_LABELS,
} from '../../demoCategoryMeta';
import styles from './EvaluationCard.module.css';

interface EvaluationCardProps {
	evaluation: DemoEvaluation;
}

const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation }) => {
	const categoryColor = DEMO_CATEGORY_COLORS[evaluation.category];

	return (
		<div className={styles.card}>
			<Group gap='sm' align='flex-start' wrap='nowrap'>
				<ThemeIcon variant='light' color={categoryColor} radius='xl' size={40}>
					{DEMO_CATEGORY_ICONS[evaluation.category]}
				</ThemeIcon>
				<Stack gap={2}>
					<Text className={styles.title} lineClamp={2}>
						{evaluation.title}
					</Text>
					<Text size='xs' fw={500} c={`${categoryColor}.6`}>
						{DEMO_CATEGORY_LABELS[evaluation.category]}
					</Text>
				</Stack>
			</Group>

			<hr className={styles.divider} />

			<Stack gap={4}>
				<Text size='sm' c='dimmed'>
					Pass Rate
				</Text>
				<Group justify='space-between' align='center'>
					<Text className={styles.passRateValue}>
						{evaluation.stats.passRate}%
					</Text>
					<Badge
						color={DEMO_HEALTH_COLORS[evaluation.health]}
						variant='light'
						size='sm'
					>
						{DEMO_HEALTH_LABELS[evaluation.health]}
					</Badge>
				</Group>
				<Text size='xs' c='dimmed'>
					{evaluation.lastEvaluationAt}
				</Text>
			</Stack>
		</div>
	);
};

export default EvaluationCard;
