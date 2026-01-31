import React, { useState, useCallback } from 'react';
import {
	Modal,
	Stack,
	Tabs,
	Select,
	TextInput,
	Textarea,
	Button,
	Group,
	Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type {
	WorkflowEdge,
	ForwardCondition,
} from '~/models/AgentWorkflowModel';

interface EdgeConditionModalProps {
	opened: boolean;
	edgeId?: string;
	edge?: WorkflowEdge;
	sourceLabel?: string;
	targetLabel?: string;
	onClose: () => void;
	onSave: (
		edgeId: string,
		forwardCondition?: ForwardCondition,
		backwardCondition?: ForwardCondition
	) => void;
}

type ConditionType = 'unconditional' | 'llm' | 'result' | 'expression';
type ConditionDirection = 'forward' | 'backward';

interface ConditionFormState {
	type: ConditionType;
	label?: string;
	llmCondition?: string;
	resultSuccessful?: boolean;
}

export const EdgeConditionModal: React.FC<EdgeConditionModalProps> = ({
	opened,
	edgeId,
	edge,
	sourceLabel,
	targetLabel,
	onClose,
	onSave,
}) => {
	const { t } = useTranslation('campaigns');
	const [activeTab, setActiveTab] = useState<ConditionDirection | null>(
		'forward'
	);
	const [forwardState, setForwardState] = useState<ConditionFormState>({
		type: 'unconditional',
	});
	const [backwardState, setBackwardState] = useState<ConditionFormState>({
		type: 'unconditional',
	});

	// Load existing conditions when modal opens
	React.useEffect(() => {
		if (!opened || !edge) return;

		// Load forward condition
		if (edge.forwardCondition) {
			const fc = edge.forwardCondition;
			if (fc.type === 'llm') {
				setForwardState({
					type: 'llm',
					label: fc.label,
					llmCondition: fc.condition,
				});
			} else if (fc.type === 'result') {
				setForwardState({
					type: 'result',
					resultSuccessful: fc.successful,
				});
			} else {
				setForwardState({ type: fc.type as ConditionType });
			}
		} else {
			setForwardState({ type: 'unconditional' });
		}

		// Load backward condition
		if (edge.backwardCondition) {
			const bc = edge.backwardCondition;
			if (bc.type === 'llm') {
				setBackwardState({
					type: 'llm',
					label: bc.label,
					llmCondition: bc.condition,
				});
			} else if (bc.type === 'result') {
				setBackwardState({
					type: 'result',
					resultSuccessful: bc.successful,
				});
			} else {
				setBackwardState({ type: bc.type as ConditionType });
			}
		} else {
			setBackwardState({ type: 'unconditional' });
		}
	}, [opened, edge]);

	const buildCondition = useCallback(
		(state: ConditionFormState): ForwardCondition | undefined => {
			switch (state.type) {
				case 'unconditional':
					return { type: 'unconditional' };
				case 'llm':
					return {
						type: 'llm',
						condition: state.llmCondition || '',
						label: state.label,
					};
				case 'result':
					return {
						type: 'result',
						successful: state.resultSuccessful ?? true,
					};
				case 'expression':
					// For now, return empty expression (can be enhanced later)
					return {
						type: 'expression',
						expression: {
							type: 'or_operator',
							children: [],
						},
						label: state.label,
					};
				default:
					return undefined;
			}
		},
		[]
	);

	const handleSave = useCallback(() => {
		if (!edgeId) return;

		const forwardCondition =
			forwardState.type !== 'unconditional'
				? buildCondition(forwardState)
				: undefined;
		const backwardCondition =
			backwardState.type !== 'unconditional'
				? buildCondition(backwardState)
				: undefined;

		onSave(edgeId, forwardCondition, backwardCondition);
		onClose();
	}, [edgeId, forwardState, backwardState, buildCondition, onSave, onClose]);

	const renderConditionFields = (
		state: ConditionFormState,
		setState: React.Dispatch<React.SetStateAction<ConditionFormState>>
	) => {
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
						data={[
							{
								value: 'unconditional',
								label: t('form.workflow.edge.types.unconditional', {
									defaultValue: 'Always (Unconditional)',
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
									defaultValue: 'Tool Result',
								}),
							},
							{
								value: 'expression',
								label: t('form.workflow.edge.types.expression', {
									defaultValue: 'Expression',
								}),
							},
						]}
						value={state.type}
						onChange={(value) =>
							setState((prev) => ({
								...prev,
								type: (value as ConditionType) || 'unconditional',
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
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										label: e.currentTarget.value,
									}))
								}
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
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										llmCondition: e.currentTarget.value,
									}))
								}
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
							onChange={(e) =>
								setState((prev) => ({ ...prev, label: e.currentTarget.value }))
							}
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

	const edgeTitle =
		sourceLabel && targetLabel
			? `${sourceLabel} → ${targetLabel}`
			: t('form.workflow.edge.title', { defaultValue: 'Edge condition' });

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={edgeTitle}
			size='lg'
			centered
		>
			<Stack gap='md'>
				<Tabs
					value={activeTab}
					onChange={(value: string | null) =>
						setActiveTab(value as ConditionDirection)
					}
				>
					<Tabs.List>
						<Tabs.Tab value='forward'>
							{t('form.workflow.edge.forward', { defaultValue: 'Forward' })}
						</Tabs.Tab>
						<Tabs.Tab value='backward'>
							{t('form.workflow.edge.backward', { defaultValue: 'Backward' })}
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='forward' pt='md'>
						{renderConditionFields(forwardState, setForwardState)}
					</Tabs.Panel>

					<Tabs.Panel value='backward' pt='md'>
						{renderConditionFields(backwardState, setBackwardState)}
					</Tabs.Panel>
				</Tabs>

				<Group justify='flex-end' gap='sm'>
					<Button variant='outline' onClick={onClose}>
						{t('common:form.actions.cancel', { defaultValue: 'Cancel' })}
					</Button>
					<Button onClick={handleSave}>
						{t('common:form.actions.save', { defaultValue: 'Save' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default EdgeConditionModal;
