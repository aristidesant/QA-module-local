import { Button, Group, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { IconListCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import { errorTargetId, type DraftError } from '~/modules/qa/forms/helpers';
import type { BuilderSection } from '~/modules/qa/forms/types';

export interface SectionEditorProps {
	section: BuilderSection;
	index: number;
	error: DraftError | null;
	onChange: (
		changes: Partial<Pick<BuilderSection, 'name' | 'guidance'>>
	) => void;
	onAddQuestion: () => void;
	onDelete: () => void;
}

export default function SectionEditor({
	section,
	index,
	error,
	onChange,
	onAddQuestion,
	onDelete,
}: SectionEditorProps) {
	const { t } = useTranslation('qa.forms');
	const nameError =
		error?.key === 'sectionNameRequired' && errorTargetId(error) === section.id
			? t('builder.validation.sectionNameRequired')
			: undefined;

	return (
		<SectionCard
			headerActions={
				<Button
					color='red'
					leftSection={<IconTrash size={14} />}
					onClick={onDelete}
					size='xs'
					variant='subtle'
				>
					{t('actions.deleteSection')}
				</Button>
			}
			icon={IconListCheck}
			title={`${index + 1}. ${t('section.title')}`}
		>
			<Stack gap='sm'>
				<TextInput
					data-autofocus
					error={nameError}
					label={t('section.name')}
					maw={480}
					onChange={(event) => onChange({ name: event.currentTarget.value })}
					placeholder={t('section.namePlaceholder')}
					required
					size='sm'
					value={section.name}
				/>
				<Textarea
					autosize
					description={t('section.guidanceHelp')}
					label={t('section.guidance')}
					minRows={3}
					onChange={(event) =>
						onChange({ guidance: event.currentTarget.value })
					}
					size='sm'
					value={section.guidance}
				/>
				<Group justify='space-between'>
					<Text c='dimmed' size='sm'>
						{t('section.questionCount', { count: section.questions.length })}
					</Text>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={onAddQuestion}
						size='sm'
						variant='light'
					>
						{t('actions.addQuestion')}
					</Button>
				</Group>
			</Stack>
		</SectionCard>
	);
}
