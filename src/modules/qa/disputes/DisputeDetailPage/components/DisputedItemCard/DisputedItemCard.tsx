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

	const qaOptions = ['Yes', 'No', 'N/A'];

	const renderInput = () => {
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
				<Group grow align='flex-start'>
					{/* inline-style-allow: flex layout needed for responsive column sizing */}
					<Stack gap={4} style={{ flex: 1 }}>
						<Text size='xs' fw={600} c='dimmed'>
							System Selected
						</Text>
						<Group gap='xs'>
							<Badge color='blue' variant='light' size='sm'>
								{question.answer?.selectedLabel ?? 'Not Selected'}
							</Badge>
						</Group>
					</Stack>

					{/* inline-style-allow: flex layout needed for responsive column sizing */}
					<Stack gap={4} style={{ flex: 1 }}>
						<Text size='xs' fw={600} c='dimmed'>
							Your Selection
						</Text>
						<Group gap='xs'>
							<Badge
								color={
									draftValue !== (question.answer?.selectedLabel ?? '')
										? 'orange'
										: 'gray'
								}
								variant='light'
								size='sm'
							>
								{draftValue || 'Not Selected'}
							</Badge>
						</Group>
					</Stack>
				</Group>

				<Stack gap={4}>
					<Text size='xs' fw={600} c='dimmed'>
						Select Correct Option
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
