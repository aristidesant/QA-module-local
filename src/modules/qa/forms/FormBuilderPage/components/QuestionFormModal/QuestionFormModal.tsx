import {
	ActionIcon,
	Badge,
	Button,
	Group,
	NumberInput,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
	Tooltip,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorTypeSelect from '~/modules/qa/components/ErrorTypeSelect';
import { Modal as FormModal } from '@mantine/core';
import type { FormGroup } from '~/models/qa';
import { getQuestionWeight } from '../../FormBuilderPage.helpers';
import type { QuestionFormValues } from '../../FormBuilderPage.types';
import classes from './QuestionFormModal.module.css';

export interface QuestionFormModalProps {
	opened: boolean;
	onClose: () => void;
	editing: boolean;
	form: UseFormReturnType<QuestionFormValues>;
	groups: FormGroup[];
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onAddOption: () => void;
	saving: boolean;
}

export default function QuestionFormModal({
	opened,
	onClose,
	editing,
	form,
	groups,
	onSubmit,
	onAddOption,
	saving,
}: QuestionFormModalProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<FormModal
			onClose={onClose}
			opened={opened}
			size='lg'
			title={editing ? t('questions.editTitle') : t('questions.createTitle')}
		>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<Select
						data={groups.map((group) => ({
							label: group.name,
							value: String(group.id),
						}))}
						label={t('fields.group')}
						size='sm'
						{...form.getInputProps('groupId')}
					/>
					<Textarea
						autosize
						label={t('fields.questionText')}
						minRows={3}
						size='sm'
						{...form.getInputProps('text')}
					/>
					<Textarea
						autosize
						label={t('fields.questionDescription')}
						minRows={2}
						size='sm'
						{...form.getInputProps('description')}
					/>
					<Select
						allowDeselect={false}
						data={[
							{ label: t('answerTypes.choice'), value: 'CHOICE' },
							{ label: t('answerTypes.text'), value: 'TEXT' },
						]}
						label={t('fields.answerType')}
						size='sm'
						{...form.getInputProps('answerType')}
					/>
					<NumberInput
						label={t('fields.sortOrder')}
						min={0}
						size='sm'
						{...form.getInputProps('sortOrder')}
					/>

					{form.values.answerType === 'CHOICE' ? (
						<Stack gap='xs'>
							<Group justify='space-between'>
								<Text fw={700} size='sm'>
									{t('questions.options')}
								</Text>
								<Button
									leftSection={<IconPlus size={14} />}
									onClick={onAddOption}
									size='xs'
									variant='light'
								>
									{t('questions.addOption')}
								</Button>
							</Group>
							{form.values.options.map((option, index) => (
								<Group
									className={classes.optionRow}
									gap='xs'
									key={`${option.label}-${index}`}
									wrap='nowrap'
								>
									<TextInput
										label={t('fields.optionLabel')}
										size='sm'
										{...form.getInputProps(`options.${index}.label`)}
									/>
									<NumberInput
										label={t('fields.optionScore')}
										min={0}
										size='sm'
										{...form.getInputProps(`options.${index}.score`)}
									/>
									<Tooltip label={t('actions.delete')}>
										<ActionIcon
											aria-label={t('actions.delete')}
											color='red'
											onClick={() => form.removeListItem('options', index)}
											radius='md'
											variant='subtle'
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>
							))}
						</Stack>
					) : null}

					<ErrorTypeSelect
						description={t('errorTypes.selector.description')}
						error={form.errors.errorTypeId}
						label={t('errorTypes.selector.label')}
						onChange={(value) => form.setFieldValue('errorTypeId', value)}
						value={form.values.errorTypeId}
					/>

					<Badge color='blue' variant='light'>
						{t('questions.derivedWeight', {
							weight: getQuestionWeight(form.values),
						})}
					</Badge>

					<Group className={classes.drawerFooter} justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('actions.cancel')}
						</Button>
						<Button loading={saving} size='sm' type='submit'>
							{t('actions.save')}
						</Button>
					</Group>
				</Stack>
			</form>
		</FormModal>
	);
}
