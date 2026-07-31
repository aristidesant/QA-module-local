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
import classes from './DisputedItemCard.module.css';

export interface DisputedItemCardProps {
	question: EvaluationQuestion;
	draftValue: string;
	onDraftChange: (value: string) => void;
	onSave: () => void;
	saving: boolean;
}

export default function DisputedItemCard({
	question,
	draftValue,
	onDraftChange,
	onSave,
	saving,
}: DisputedItemCardProps) {
	const { t } = useTranslation('qa.evaluations');
	const hasChanges = draftValue !== (question.answer?.selectedLabel ?? '');

	const renderInput = () => {
		if (question.answerType === 'CHOICE' && question.options) {
			return (
				<Radio.Group value={draftValue} onChange={onDraftChange}>
					<Stack gap='xs'>
						{question.options.map((option) => (
							<Radio
								key={option.label}
								value={option.label}
								label={option.label}
								disabled={saving}
							/>
						))}
					</Stack>
				</Radio.Group>
			);
		}

		return (
			<Textarea
				value={draftValue}
				onChange={(e) => onDraftChange(e.currentTarget.value)}
				placeholder='Enter your response'
				disabled={saving}
				minRows={3}
			/>
		);
	};

	return (
		<Stack
			className={`${classes.itemCard} ${
				question.answer ? classes.itemCardAnswered : ''
			}`}
			gap='sm'
		>
			<Group justify='space-between'>
				<Stack gap={4} className={classes.itemHeader}>
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
					<Badge color='green' variant='light'>
						{t('answer.answered')}
					</Badge>
				) : null}
			</Group>

			<Stack gap='sm'>
				<Stack gap={4}>
					<Text size='xs' fw={600} c='dimmed'>
						Current Response
					</Text>
					{question.answer?.selectedLabel ? (
						<Text size='sm'>{question.answer.selectedLabel}</Text>
					) : (
						<Text size='sm' c='dimmed'>
							No response provided
						</Text>
					)}
				</Stack>

				<Stack gap={4}>
					<Text size='xs' fw={600} c='dimmed'>
						Update Response
					</Text>
					{renderInput()}
				</Stack>
			</Stack>

			{hasChanges && (
				<Group justify='flex-end'>
					<Button
						leftSection={<IconDeviceFloppy size={14} />}
						onClick={onSave}
						loading={saving}
						size='sm'
					>
						{t('answer.save')}
					</Button>
				</Group>
			)}
		</Stack>
	);
}
