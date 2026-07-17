import {
	Button,
	Group,
	Progress,
	RingProgress,
	Stack,
	Text,
} from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import type { EvaluationDetail } from '~/models/qa';
import type { EvaluationScore } from '../../ManualEvaluationPage.types';

export interface ScoreSummaryCardProps {
	detail: EvaluationDetail;
	score: EvaluationScore;
	canComplete: boolean;
	isCompleted: boolean;
	isAiEvaluation: boolean;
	onComplete: () => void;
	completing: boolean;
}

export default function ScoreSummaryCard({
	detail,
	score,
	canComplete,
	isCompleted,
	isAiEvaluation,
	onComplete,
	completing,
}: ScoreSummaryCardProps) {
	const { t } = useTranslation('qa.evaluations');

	return (
		<SectionCard title={t('score.title')}>
			<Group align='center' gap='lg' wrap='nowrap'>
				<RingProgress
					label={
						<Text fw={700} size='lg' ta='center'>
							{t('score.percent', {
								percent: detail.overallScorePct ?? score.overallScorePct,
							})}
						</Text>
					}
					roundCaps
					sections={[
						{
							value: Number(detail.overallScorePct ?? score.overallScorePct),
							color: 'green',
						},
					]}
					size={124}
					thickness={12}
				/>
				<Stack flex={1} gap='xs'>
					<div>
						<Text c='dimmed' size='xs'>
							{t('score.answered', {
								answered: score.answered,
								total: score.total,
							})}
						</Text>
						<Progress
							color='green'
							mt={4}
							radius='xl'
							value={score.total > 0 ? (score.answered / score.total) * 100 : 0}
						/>
					</div>
					<Group gap='lg'>
						<Stack gap={0}>
							<Text c='dimmed' size='xs'>
								{t('score.current')}
							</Text>
							<Text fw={700}>{detail.overallScore ?? score.overallScore}</Text>
						</Stack>
						<Stack gap={0}>
							<Text c='dimmed' size='xs'>
								{t('score.max')}
							</Text>
							<Text fw={700}>{detail.maxScore ?? score.maxScore}</Text>
						</Stack>
					</Group>
				</Stack>
			</Group>
			{isAiEvaluation ? null : (
				<Button
					disabled={!canComplete || isCompleted}
					fullWidth
					leftSection={<IconCircleCheck size={16} />}
					loading={completing}
					onClick={onComplete}
					size='sm'
				>
					{t('complete.submit')}
				</Button>
			)}
		</SectionCard>
	);
}
