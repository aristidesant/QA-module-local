import {
	Badge,
	Button,
	Divider,
	Group,
	Input,
	Radio,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import {
	IconDeviceFloppy,
	IconHelpCircle,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import {
	AUTO_FAIL_SCOPES,
	COPC_CAMPAIGN_TYPES,
	COPC_ERROR_CODES,
	STANDARD_ANSWER_TYPES,
} from '~/modules/qa/forms/constants';
import {
	errorTargetId,
	getQuestionWeight,
	type DraftError,
} from '~/modules/qa/forms/helpers';
import type {
	AutoFailScope,
	BuilderQuestion,
	CopcCampaignType,
	CopcErrorCode,
	CopcQuestion,
	StandardAnswerType,
	StandardQuestion,
	YesNo,
} from '~/modules/qa/forms/types';
import OptionsEditor from '../OptionsEditor';

export interface QuestionEditorProps {
	question: BuilderQuestion;
	sectionName: string;
	number: string;
	error: DraftError | null;
	onChange: (changes: Partial<BuilderQuestion>) => void;
	onDelete: () => void;
	onSave: () => void;
	/** Adds a blank question to the same section; offered once there is nothing left to save. */
	onAddQuestion: () => void;
	/** Nothing to save yet. */
	saveDisabled: boolean;
}

interface FieldsProps<Q extends BuilderQuestion> {
	question: Q;
	errorKey: DraftError['key'] | null;
	onChange: (changes: Partial<Q>) => void;
}

function StandardFields({
	question,
	errorKey,
	onChange,
}: FieldsProps<StandardQuestion>) {
	const { t } = useTranslation('qa.forms');

	return (
		<Stack gap='sm'>
			<Input.Wrapper label={t('question.answerType')}>
				<SegmentedControl
					data={STANDARD_ANSWER_TYPES.map((value) => ({
						value,
						label: t(`question.answerTypes.${value}`),
					}))}
					mt={4}
					onChange={(value) =>
						onChange({ answerType: value as StandardAnswerType })
					}
					size='sm'
					value={question.answerType}
				/>
			</Input.Wrapper>

			{question.answerType === 'MULTIPLE_CHOICE' ? (
				<Stack gap='xs' maw={480}>
					<Group justify='space-between'>
						<Text fw={700} size='sm'>
							{t('question.options')}
						</Text>
						<Badge color='blue' variant='light'>
							{t('question.derivedWeight', {
								weight: getQuestionWeight(question),
							})}
						</Badge>
					</Group>
					<OptionsEditor
						error={
							errorKey === 'optionsRequired'
								? t('builder.validation.optionsRequired')
								: undefined
						}
						onChange={(options) => onChange({ options })}
						options={question.options}
					/>
				</Stack>
			) : (
				<Text c='dimmed' size='sm'>
					{t('question.openAnswerHint')}
				</Text>
			)}
		</Stack>
	);
}

function CopcFields({
	question,
	errorKey,
	onChange,
}: FieldsProps<CopcQuestion>) {
	const { t } = useTranslation('qa.forms');

	return (
		<Stack gap='sm'>
			<Radio.Group
				description={t('question.favorableAnswerHelp')}
				label={t('question.favorableAnswer')}
				onChange={(value) => onChange({ favorableAnswer: value as YesNo })}
				value={question.favorableAnswer}
			>
				<Group mt='xs'>
					<Radio label={t('question.yes')} value='YES' />
					<Radio label={t('question.no')} value='NO' />
				</Group>
			</Radio.Group>

			<SimpleGrid cols={{ base: 1, sm: 2 }} maw={560} spacing='sm'>
				<Select
					data={COPC_ERROR_CODES.map((code) => ({
						value: code,
						label: t(`question.errorCodes.${code}`),
					}))}
					error={
						errorKey === 'errorTypeRequired'
							? t('builder.validation.errorTypeRequired')
							: undefined
					}
					label={t('question.errorType')}
					onChange={(value) =>
						onChange({ errorCode: (value as CopcErrorCode | null) ?? null })
					}
					placeholder={t('question.errorTypePlaceholder')}
					required
					size='sm'
					value={question.errorCode}
				/>
				<Select
					allowDeselect={false}
					data={COPC_CAMPAIGN_TYPES.map((value) => ({
						value,
						label: t(`question.campaignTypes.${value}`),
					}))}
					description={t('question.campaignTypeHelp')}
					label={t('question.campaignType')}
					onChange={(value) => {
						if (value) onChange({ campaignType: value as CopcCampaignType });
					}}
					size='sm'
					value={question.campaignType}
				/>
			</SimpleGrid>
		</Stack>
	);
}

export default function QuestionEditor({
	question,
	sectionName,
	number,
	error,
	onChange,
	onDelete,
	onSave,
	onAddQuestion,
	saveDisabled,
}: QuestionEditorProps) {
	const { t } = useTranslation('qa.forms');
	const errorKey = errorTargetId(error) === question.id ? error!.key : null;

	return (
		<SectionCard
			description={sectionName || t('section.namePlaceholder')}
			headerActions={
				<Button
					color='red'
					leftSection={<IconTrash size={14} />}
					onClick={onDelete}
					size='xs'
					variant='subtle'
				>
					{t('actions.deleteQuestion')}
				</Button>
			}
			icon={IconHelpCircle}
			title={`${number} · ${t('question.title')}`}
		>
			<Stack gap='md'>
				<Textarea
					autosize
					data-autofocus
					error={
						errorKey === 'questionRequired'
							? t('builder.validation.questionRequired')
							: undefined
					}
					label={t('question.text')}
					maw={560}
					minRows={2}
					onChange={(event) => onChange({ text: event.currentTarget.value })}
					placeholder={t('question.textPlaceholder')}
					required
					size='sm'
					value={question.text}
				/>
				<Textarea
					autosize
					description={t('question.guidanceHelp')}
					label={t('question.guidance')}
					maw={560}
					minRows={3}
					onChange={(event) =>
						onChange({ guidance: event.currentTarget.value })
					}
					size='sm'
					value={question.guidance}
				/>

				{question.modality === 'STANDARD' ? (
					<StandardFields
						errorKey={errorKey}
						onChange={onChange}
						question={question}
					/>
				) : (
					<CopcFields
						errorKey={errorKey}
						onChange={onChange}
						question={question}
					/>
				)}

				<Divider />

				<Select
					allowDeselect={false}
					data={AUTO_FAIL_SCOPES.map((value) => ({
						value,
						label: t(`question.autoFailOptions.${value}`),
					}))}
					description={t('question.autoFailHelp')}
					label={t('question.autoFail')}
					maw={320}
					onChange={(value) => {
						if (value) onChange({ autoFail: value as AutoFailScope });
					}}
					size='sm'
					value={question.autoFail}
				/>

				<Group>
					<Button
						disabled={saveDisabled}
						leftSection={<IconDeviceFloppy size={16} />}
						onClick={onSave}
					>
						{t('actions.saveQuestion')}
					</Button>
					{saveDisabled ? (
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={onAddQuestion}
							variant='light'
						>
							{t('actions.newQuestion')}
						</Button>
					) : null}
				</Group>
			</Stack>
		</SectionCard>
	);
}
