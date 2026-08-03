import { Badge, Button, Group, Radio, Stack, Text } from '@mantine/core';
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
	readOnly?: boolean;
}

export default function DisputedItemCard({
	question,
	draftValue,
	onDraftChange,
	onSave,
	saving,
	readOnly = false,
}: DisputedItemCardProps) {
	const { t } = useTranslation('qa.evaluations');
	const hasChanges = draftValue !== (question.answer?.selectedLabel ?? '');

	const qaOptions = ['Yes', 'No', 'N/A'];

	const renderInput = () => {
		if (readOnly) {
			return (
				<Stack gap='xs'>
					{qaOptions.map((option) => (
						<Radio
							key={option}
							value={option}
							label={option}
							disabled
							checked={draftValue === option}
						/>
					))}
				</Stack>
			);
		}

		return (
			<Radio.Group value={draftValue} onChange={onDraftChange}>
				<Stack gap='xs'>
					{qaOptions.map((option) => (
						<Radio
							key={option}
							value={option}
							label={option}
							disabled={saving}
						/>
					))}
				</Stack>
			</Radio.Group>
		);
	};

	return (
		<Stack
			className={`${classes.itemCard} ${
				question.answer ? classes.itemCardAnswered : ''
			}`}
			gap='sm'
		>
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

			<Stack gap={4}>
				<Text size='xs' fw={600} c='dimmed'>
					Options
				</Text>
				{renderInput()}
			</Stack>

			{hasChanges && !readOnly && (
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
