import {
	Button,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import PromptEditModal from '~/modules/campaigns/CampaignsForm/components/PromptEditModal';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import {
	ConditionDirection,
	ConditionType,
	useEdgeConditionModal,
} from './EdgeConditionModalContext';

interface ConditionFieldsProps {
	direction: ConditionDirection;
}

const ConditionFields = ({ direction }: ConditionFieldsProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const {
		isToolEdge,
		forwardState,
		backwardState,
		setForwardState,
		setBackwardState,
	} = useEdgeConditionModal();
	const campaignId = useCampaignId();
	const [promptOpened, promptHandlers] = useDisclosure(false);

	const isToolBackward = isToolEdge && direction === 'backward';
	const state = direction === 'forward' ? forwardState : backwardState;
	const setState = direction === 'forward' ? setForwardState : setBackwardState;
	const llmConditionValue = state.llmCondition || '';
	const llmConditionEditorTitle = t(
		'form.workflow.edge.llmConditionEditor.title',
		{ defaultValue: 'Edit prompt' }
	);
	const llmConditionEditorDescription = t(
		'form.workflow.edge.llmConditionEditor.description',
		{
			defaultValue:
				'Write the full condition the LLM should evaluate for this transition.',
		}
	);
	const llmConditionEditorPlaceholder = t(
		'form.workflow.edge.llmConditionEditor.placeholder',
		{
			defaultValue: 'Describe what the model should evaluate...',
		}
	);
	const llmConditionEditorHelper = t(
		'form.workflow.edge.llmConditionEditor.helper',
		{ defaultValue: 'Changes are applied when you save.' }
	);

	const selectData = isToolBackward
		? [
				{
					value: 'none',
					label: t('form.workflow.edge.types.none', {
						defaultValue: 'None',
					}),
				},
				{
					value: 'unconditional',
					label: t('form.workflow.edge.types.unconditional', {
						defaultValue: 'Unconditional',
					}),
				},
				{
					value: 'llm',
					label: t('form.workflow.edge.types.llm', {
						defaultValue: 'LLM Condition',
					}),
				},
				{
					value: 'result',
					label: t('form.workflow.edge.types.result', {
						defaultValue: 'Result condition',
					}),
				},
				{
					value: 'expression',
					label: t('form.workflow.edge.types.expression', {
						defaultValue: 'Expression',
					}),
				},
			]
		: [
				{
					value: 'none',
					label: t('form.workflow.edge.types.none', {
						defaultValue: 'None',
					}),
				},
				{
					value: 'llm',
					label: t('form.workflow.edge.types.llm', {
						defaultValue: 'LLM Condition',
					}),
				},
				{
					value: 'expression',
					label: t('form.workflow.edge.types.expression', {
						defaultValue: 'Expression',
					}),
				},
			];

	return (
		<Stack gap='md'>
			<div>
				<Text size='sm' fw={600} mb='xs'>
					{t('form.workflow.edge.transitionType', {
						defaultValue: 'Transition type',
					})}
				</Text>
				<Select
					placeholder={t('form.workflow.edge.selectConditionType', {
						defaultValue: 'Select condition type',
					})}
					data={selectData}
					value={state.type}
					onChange={(value) =>
						setState((prev) => ({
							...prev,
							type: (value as ConditionType) || 'none',
						}))
					}
					searchable
					clearable={false}
				/>
			</div>

			{state.type === 'llm' && (
				<>
					<div>
						<Text size='sm' fw={600} mb='xs'>
							{t('form.workflow.edge.label', { defaultValue: 'Label' })}
						</Text>
						<TextInput
							placeholder={t('form.workflow.edge.labelPlaceholder', {
								defaultValue: 'Optional label for this condition',
							})}
							value={state.label || ''}
							onChange={(e) => {
								const nextValue =
									typeof e === 'string' ? e : (e?.currentTarget?.value ?? '');
								setState((prev) => ({
									...prev,
									label: nextValue,
								}));
							}}
							size='sm'
						/>
					</div>

					<div>
						<Text size='sm' fw={600} mb='xs'>
							{t('form.workflow.edge.llmCondition', {
								defaultValue: 'LLM condition',
							})}
						</Text>
						<Stack gap='xs'>
							<Textarea
								placeholder={t('form.workflow.edge.llmConditionPlaceholder', {
									defaultValue:
										'Describe the condition for the LLM to evaluate (e.g., "user confirmed their identity")',
								})}
								value={llmConditionValue}
								onChange={(e) => {
									const nextValue =
										typeof e === 'string' ? e : (e?.currentTarget?.value ?? '');
									setState((prev) => ({
										...prev,
										llmCondition: nextValue,
									}));
								}}
								minRows={10}
								rows={10}
								size='sm'
							/>
							<Group justify='space-between' gap='sm' align='center'>
								<Text size='xs' c='dimmed'>
									{t('form.workflow.edge.llmConditionHelper', {
										defaultValue: 'Use the editor for longer prompts.',
									})}
								</Text>
								<Button size='xs' variant='light' onClick={promptHandlers.open}>
									{t('form.workflow.edge.llmConditionEditor.open', {
										defaultValue: 'Edit prompt',
									})}
								</Button>
							</Group>
						</Stack>
						<PromptEditModal
							opened={promptOpened}
							onClose={promptHandlers.close}
							value={llmConditionValue}
							onSave={(value) =>
								setState((prev) => ({
									...prev,
									llmCondition: value,
								}))
							}
							campaignId={campaignId || 0}
							title={llmConditionEditorTitle}
							description={llmConditionEditorDescription}
							placeholder={llmConditionEditorPlaceholder}
							helperText={llmConditionEditorHelper}
						/>
					</div>
				</>
			)}

			{state.type === 'result' && (
				<div>
					<Text size='sm' fw={600} mb='xs'>
						{t('form.workflow.edge.resultType', {
							defaultValue: 'Tool execution result',
						})}
					</Text>
					<Select
						placeholder={t('form.workflow.edge.selectResult', {
							defaultValue: 'Select result type',
						})}
						data={[
							{
								value: 'true',
								label: t('form.workflow.edge.results.success', {
									defaultValue: 'Success',
								}),
							},
							{
								value: 'false',
								label: t('form.workflow.edge.results.failure', {
									defaultValue: 'Failure',
								}),
							},
						]}
						value={state.resultSuccessful ? 'true' : 'false'}
						onChange={(value) =>
							setState((prev) => ({
								...prev,
								resultSuccessful: value === 'true',
							}))
						}
						clearable={false}
					/>
				</div>
			)}

			{state.type === 'expression' && (
				<div>
					<Text size='sm' fw={600} mb='xs'>
						{t('form.workflow.edge.label', { defaultValue: 'Label' })}
					</Text>
					<TextInput
						placeholder={t('form.workflow.edge.labelPlaceholder', {
							defaultValue: 'Optional label for this expression',
						})}
						value={state.label || ''}
						onChange={(e) => {
							const nextValue =
								typeof e === 'string' ? e : (e?.currentTarget?.value ?? '');
							setState((prev) => ({ ...prev, label: nextValue }));
						}}
						size='sm'
					/>
					<Text size='xs' c='dimmed' mt='xs'>
						{t('form.workflow.edge.expressionNote', {
							defaultValue: 'Expression builder coming soon',
						})}
					</Text>
				</div>
			)}
		</Stack>
	);
};

export default ConditionFields;
