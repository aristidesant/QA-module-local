import {
	Badge,
	Button,
	Group,
	Radio,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { EvaluationQuestion } from '~/models/qa';
import classes from './QuestionAnswerCard.module.css';

export interface QuestionAnswerCardProps {
	question: EvaluationQuestion;
	draftValue: string;
	onDraftChange: (value: string) => void;
	onSave: () => void;
	saving: boolean;
	isReadOnly: boolean;
	showSaveButton: boolean;
}

export default function QuestionAnswerCard({
	question,
	draftValue,
	onDraftChange,
	onSave,
	saving,
	isReadOnly,
	showSaveButton,
}: QuestionAnswerCardProps) {
	const { t } = useTranslation('qa.evaluations');

	return (
		<Stack
			className={
				question.answer
					? `${classes.questionCard} ${classes.questionCardAnswered}`
					: classes.questionCard
			}
			gap='sm'
		>
			<Group justify='space-between'>
				<Stack gap={4}>
					<Group gap='xs'>
						<Badge color='blue' variant='light'>
							{t(`answerTypes.${question.answerType.toLowerCase()}`)}
						</Badge>
						<Badge variant='outline'>
							{t('detail.weight', {
								weight: Number(question.weight),
							})}
						</Badge>
					</Group>
					<Text fw={700} size='sm'>
						{question.text}
					</Text>
					{question.description ? (
						<Text c='dimmed' size='xs'>
							{question.description}
						</Text>
					) : null}
				</Stack>
				{question.answer ? (
					<Group gap='xs'>
						<Badge color='green' variant='light'>
							{t('answer.answered')}
						</Badge>
						{question.answerType === 'CHOICE' ? (
							<Badge variant='outline'>
								{t('answer.awardedScore', {
									score: Number(question.answer.awardedScore),
								})}
							</Badge>
						) : null}
					</Group>
				) : null}
			</Group>

			{question.answerType === 'CHOICE' ? (
				<Radio.Group onChange={onDraftChange} value={draftValue}>
					<Stack gap='xs'>
						{(question.options ?? []).map((option) => (
							<Radio
								disabled={isReadOnly}
								key={option.label}
								label={t('answer.optionLabel', {
									label: option.label,
									score: option.score,
								})}
								size='sm'
								value={option.label}
							/>
						))}
					</Stack>
				</Radio.Group>
			) : (
				<Textarea
					autosize
					disabled={isReadOnly}
					minRows={3}
					onChange={(event) => onDraftChange(event.currentTarget.value)}
					placeholder={t('answer.textPlaceholder')}
					size='sm'
					value={draftValue}
				/>
			)}

			{showSaveButton ? (
				<Group justify='flex-end'>
					<Button
						disabled={isReadOnly}
						leftSection={<IconDeviceFloppy size={16} />}
						loading={saving}
						onClick={onSave}
						size='xs'
						variant='light'
					>
						{t('answer.save')}
					</Button>
				</Group>
			) : null}
		</Stack>
	);
}
