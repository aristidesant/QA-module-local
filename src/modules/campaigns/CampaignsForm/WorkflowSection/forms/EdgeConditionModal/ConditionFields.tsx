import { Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	ConditionDirection,
	ConditionType,
	useEdgeConditionModal,
} from './EdgeConditionModalContext';

interface ConditionFieldsProps {
	direction: ConditionDirection;
}

const ConditionFields = ({ direction }: ConditionFieldsProps) => {
	const { t } = useTranslation('campaigns');
	const {
		isToolEdge,
		forwardState,
		backwardState,
		setForwardState,
		setBackwardState,
	} = useEdgeConditionModal();

	const isToolBackward = isToolEdge && direction === 'backward';
	const state = direction === 'forward' ? forwardState : backwardState;
	const setState = direction === 'forward' ? setForwardState : setBackwardState;

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
						setState((prev) => {
							const nextType = (value as ConditionType) || 'none';
							if (import.meta.env.DEV) {
								console.debug('[EdgeConditionModal] type change', {
									direction,
									from: prev.type,
									to: nextType,
								});
							}
							return {
								...prev,
								type: nextType,
							};
						})
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
								if (import.meta.env.DEV) {
									console.debug('[EdgeConditionModal] label change', {
										direction,
										value: nextValue,
									});
								}
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
						<Textarea
							placeholder={t('form.workflow.edge.llmConditionPlaceholder', {
								defaultValue:
									'Describe the condition for the LLM to evaluate (e.g., "user confirmed their identity")',
							})}
							value={state.llmCondition || ''}
							onChange={(e) => {
								const nextValue =
									typeof e === 'string' ? e : (e?.currentTarget?.value ?? '');
								if (import.meta.env.DEV) {
									console.debug('[EdgeConditionModal] llm condition change', {
										direction,
										value: nextValue,
									});
								}
								setState((prev) => ({
									...prev,
									llmCondition: nextValue,
								}));
							}}
							minRows={10}
							size='sm'
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
							setState((prev) => {
								const nextValue = value === 'true';
								if (import.meta.env.DEV) {
									console.debug('[EdgeConditionModal] result change', {
										direction,
										value: nextValue,
									});
								}
								return {
									...prev,
									resultSuccessful: nextValue,
								};
							})
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
							if (import.meta.env.DEV) {
								console.debug('[EdgeConditionModal] expression label change', {
									direction,
									value: nextValue,
								});
							}
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
