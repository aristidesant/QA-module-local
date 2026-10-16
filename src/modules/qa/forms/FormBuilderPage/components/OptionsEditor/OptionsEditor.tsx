import {
	ActionIcon,
	Button,
	Group,
	NumberInput,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { createEmptyOption } from '~/modules/qa/forms/helpers';
import type { BuilderOption } from '~/modules/qa/forms/types';
import classes from './OptionsEditor.module.css';

export interface OptionsEditorProps {
	options: BuilderOption[];
	error?: string;
	onChange: (options: BuilderOption[]) => void;
}

export default function OptionsEditor({
	options,
	error,
	onChange,
}: OptionsEditorProps) {
	const { t } = useTranslation('qa.forms');

	const update = (id: string, changes: Partial<BuilderOption>) =>
		onChange(options.map((o) => (o.id === id ? { ...o, ...changes } : o)));

	return (
		<Stack gap='xs'>
			{options.map((option) => (
				<Group align='flex-end' gap='xs' key={option.id} wrap='nowrap'>
					<TextInput
						className={classes.grow}
						label={t('question.optionLabel')}
						onChange={(event) =>
							update(option.id, { label: event.currentTarget.value })
						}
						size='sm'
						value={option.label}
					/>
					<NumberInput
						label={t('question.optionScore')}
						min={0}
						onChange={(value) =>
							update(option.id, {
								score: typeof value === 'number' ? value : 0,
							})
						}
						size='sm'
						value={option.score}
						w={96}
					/>
					<ActionIcon
						aria-label={t('actions.delete')}
						color='red'
						disabled={options.length === 1}
						mb={4}
						onClick={() => onChange(options.filter((o) => o.id !== option.id))}
						radius='md'
						variant='subtle'
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			))}
			<Group>
				<Button
					leftSection={<IconPlus size={14} />}
					onClick={() => onChange([...options, createEmptyOption()])}
					size='xs'
					variant='light'
				>
					{t('question.addOption')}
				</Button>
			</Group>
			{error ? (
				<Text c='red' size='xs'>
					{error}
				</Text>
			) : null}
		</Stack>
	);
}
