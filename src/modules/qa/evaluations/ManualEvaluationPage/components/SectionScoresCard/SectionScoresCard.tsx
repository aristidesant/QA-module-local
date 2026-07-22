import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import type { EvaluationSectionScore } from '~/models/qa';
import classes from './SectionScoresCard.module.css';

export interface SectionScoresCardProps {
	sectionScores: EvaluationSectionScore[];
}

export default function SectionScoresCard({
	sectionScores,
}: SectionScoresCardProps) {
	const { t } = useTranslation('qa.evaluations');

	return (
		<SectionCard title={t('score.sections')}>
			<Stack gap='sm'>
				{sectionScores.map((section) => (
					<Stack className={classes.sectionScore} gap='xs' key={section.name}>
						<Group justify='space-between'>
							<Text fw={700} size='sm'>
								{section.name}
							</Text>
							<Badge variant='light'>
								{t('score.percent', { percent: section.scorePct })}
							</Badge>
						</Group>
						<Progress color='green' radius='xl' value={section.scorePct} />
						<Text c='dimmed' size='xs'>
							{t('score.sectionDetail', {
								score: section.score,
								max: section.maxScore,
								answered: section.answered,
								total: section.total,
							})}
						</Text>
					</Stack>
				))}
			</Stack>
		</SectionCard>
	);
}
