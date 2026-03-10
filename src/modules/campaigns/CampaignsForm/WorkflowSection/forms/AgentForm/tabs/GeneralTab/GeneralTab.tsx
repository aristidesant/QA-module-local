import {
	ActionIcon,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
	IconMicrophone,
	IconEdit,
	IconRotateClockwise,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	LLM_MODELS,
	getGroupedLlmOptions,
} from '~/modules/configurations/CampaignPredefinedParamsPage/CampaignPredefinedParamsForm/formConfig';
import type { SelectOption } from '../../types';
import {
	updateWorkflowNodeSubagent,
	updateWorkflowNode,
} from '../../../nodeFormUtils';
import { useAgentForm } from '../../context';
import {
	useVoiceOptions,
	eagernessOptions,
	spellingPatienceOptions,
} from '../../hooks';
import mainStyles from '../../AgentForm.module.css';

const GeneralTab = () => {
	const { t } = useTranslation('campaigns');
	const { workflow, nodeId, onWorkflowChange, campaignAgentConfig } =
		useAgentForm();

	const currentNode = workflow?.nodes[nodeId];
	const subagent =
		currentNode && 'subagent' in currentNode ? currentNode.subagent : undefined;

	// Current conversationConfig (personalized)
	const conversationConfig =
		(currentNode as { conversationConfig?: unknown })?.conversationConfig ?? {};
	const ttsConfig = (conversationConfig as Record<string, unknown>).tts ?? {};
	const turnConfig = (conversationConfig as Record<string, unknown>).turn ?? {};
	const agentConfig =
		(conversationConfig as Record<string, unknown>).agent ?? {};
	const promptConfig = (agentConfig as Record<string, unknown>).prompt ?? {};
	const additionalPrompt = (currentNode as { additionalPrompt?: string | null })
		?.additionalPrompt;
	const subagentLlmModel = subagent?.llmModel;
	const overridePromptValue =
		((promptConfig as Record<string, unknown>).prompt as string | null) ?? '';
	const hasAdditionalPrompt = (additionalPrompt ?? '').trim().length > 0;
	const hasOverridePrompt = (overridePromptValue ?? '').trim().length > 0;
	const hasDefinedOverridePrompt =
		typeof subagent?.overridePrompt === 'boolean';
	const effectiveOverridePrompt = hasDefinedOverridePrompt
		? (subagent?.overridePrompt as boolean)
		: hasAdditionalPrompt
			? false
			: hasOverridePrompt
				? true
				: false;

	// Inherited conversationConfig (from campaign agent)
	const inheritedConversationConfig =
		(campaignAgentConfig?.conversationConfig as unknown) ?? {};
	const inheritedTtsConfig =
		(inheritedConversationConfig as Record<string, unknown>).tts ?? {};
	const inheritedTurnConfig =
		(inheritedConversationConfig as Record<string, unknown>).turn ?? {};
	const inheritedAgentConfig =
		(inheritedConversationConfig as Record<string, unknown>).agent ?? {};
	const inheritedPromptConfig =
		(inheritedAgentConfig as Record<string, unknown>).prompt ?? {};

	// Current values
	const voiceId = (ttsConfig as Record<string, unknown>).voiceId as
		| string
		| undefined;
	const llmModel =
		((promptConfig as Record<string, unknown>).llm as string | undefined) ||
		subagentLlmModel;
	const eagerness = (turnConfig as Record<string, unknown>).turnEagerness as
		| string
		| undefined;
	const spellingPatience = (turnConfig as Record<string, unknown>)
		.spelling_patience as string | undefined;
	const speculativeTurn = (turnConfig as Record<string, unknown>)
		.speculative_turn as boolean | undefined;

	// Inherited values
	const inheritedVoiceId = (inheritedTtsConfig as Record<string, unknown>)
		.voiceId as string | undefined;
	const inheritedLlmModel = (inheritedPromptConfig as Record<string, unknown>)
		.llm as string | undefined;
	const inheritedEagerness = (inheritedTurnConfig as Record<string, unknown>)
		.turnEagerness as string | undefined;
	const inheritedSpellingPatience = (
		inheritedTurnConfig as Record<string, unknown>
	).spelling_patience as string | undefined;
	const inheritedSpeculativeTurn = (
		inheritedTurnConfig as Record<string, unknown>
	).speculative_turn as boolean | undefined;

	const voiceOptions = useVoiceOptions();

	// State for which fields are in edit mode
	const [editingFields, setEditingFields] = useState<Record<string, boolean>>({
		voice: !!voiceId,
		llm: !!llmModel,
		eagerness: !!eagerness,
		spellingPatience: !!spellingPatience,
		speculativeTurn: speculativeTurn !== undefined,
	});

	// Sync editing fields when values change
	useEffect(() => {
		setEditingFields({
			voice: !!voiceId,
			llm: !!llmModel,
			eagerness: !!eagerness,
			spellingPatience: !!spellingPatience,
			speculativeTurn: speculativeTurn !== undefined,
		});
	}, [voiceId, llmModel, eagerness, spellingPatience, speculativeTurn]);

	useEffect(() => {
		if (!currentNode || hasDefinedOverridePrompt) return;
		const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, {
			overridePrompt: effectiveOverridePrompt,
		});
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	}, [
		currentNode,
		effectiveOverridePrompt,
		hasDefinedOverridePrompt,
		nodeId,
		onWorkflowChange,
		workflow,
	]);

	const handleConversationConfigChange = (
		updates: Partial<Record<string, unknown>>
	) => {
		const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
			conversationConfig: {
				...conversationConfig,
				...updates,
			},
		} as Record<string, unknown>);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const llmOptions = getGroupedLlmOptions().flatMap((group) => group.items);

	// Helper to get label for a value
	const getValueLabel = (value: string, options: SelectOption[]) =>
		options.find((opt) => opt.value === value)?.label || value;

	const getLlmLabel = (value: string) =>
		LLM_MODELS.find((model) => model.modelCode === value)?.modelName || value;

	// Helper to render inherited field
	const renderInheritedField = (
		fieldLabel: string,
		inheritedValue: string | undefined,
		onEdit: () => void
	) => {
		const hasValue =
			inheritedValue !== undefined &&
			inheritedValue !== null &&
			inheritedValue !== '';

		return (
			<div className={mainStyles.fieldRow}>
				<Group justify='space-between' align='center'>
					<Text size='sm' className={mainStyles.fieldLabel}>
						{fieldLabel}
					</Text>
					<ActionIcon
						size='sm'
						variant='subtle'
						onClick={onEdit}
						title={t('form.workflow.forms.agent.general.editOverride')}
					>
						<IconEdit size={16} />
					</ActionIcon>
				</Group>
				<div className={mainStyles.inheritedFieldBox}>
					<Text size='sm' c='dimmed'>
						{hasValue
							? t('form.workflow.forms.agent.general.usingDefaultValue', {
									value: inheritedValue,
								})
							: t('form.workflow.forms.agent.general.usingDefault')}
					</Text>
				</div>
			</div>
		);
	};

	const toggleEditMode = (field: string) => {
		setEditingFields((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const handleResetField = (field: string) => {
		const updates: Record<string, unknown> = {};

		if (field === 'voice') {
			updates.tts = { ...ttsConfig, voiceId: undefined };
		} else if (field === 'llm') {
			updates.agent = {
				...agentConfig,
				prompt: { ...promptConfig, llm: undefined },
			};
			updates.subagent = {
				...subagent,
				llmModel: undefined,
			};
		} else if (field === 'eagerness') {
			updates.turn = { ...turnConfig, turnEagerness: undefined };
		} else if (field === 'spellingPatience') {
			updates.turn = { ...turnConfig, spelling_patience: undefined };
		} else if (field === 'speculativeTurn') {
			updates.turn = { ...turnConfig, speculative_turn: undefined };
		}

		handleConversationConfigChange(updates);
		toggleEditMode(field);
	};

	return (
		<Stack gap='xs'>
			<div className={mainStyles.conversationSection}>
				<Group
					justify='space-between'
					align='center'
					className={mainStyles.conversationHeader}
				>
					<Text size='sm' className={mainStyles.sectionLabel}>
						{t('form.workflow.forms.agent.general.prompt.label')}
					</Text>
					<Group gap='xs' align='center'>
						<Text size='xs' c='dimmed'>
							{t('form.workflow.forms.agent.general.overridePrompt.label')}
						</Text>
						<Switch
							checked={effectiveOverridePrompt}
							onChange={(event) => {
								const isChecked = event.currentTarget.checked;
								const currentAdditionalPrompt =
									(currentNode as any)?.additionalPrompt ?? '';
								const currentOverridePrompt = overridePromptValue ?? '';

								const nodeUpdates: any = {
									subagent: {
										...subagent,
										overridePrompt: isChecked,
									},
								};

								if (isChecked) {
									// Turning Override ON: Move additionalPrompt to conversationConfig
									nodeUpdates.additionalPrompt = null;
									nodeUpdates.conversationConfig = {
										...(conversationConfig as Record<string, unknown>),
										agent: {
											...(agentConfig as Record<string, unknown>),
											prompt: {
												...(promptConfig as Record<string, unknown>),
												prompt: currentAdditionalPrompt,
											},
										},
									};
								} else {
									// Turning Override OFF: Move conversationConfig prompt to additionalPrompt
									nodeUpdates.additionalPrompt = currentOverridePrompt;
									nodeUpdates.conversationConfig = {
										...(conversationConfig as Record<string, unknown>),
										agent: {
											...(agentConfig as Record<string, unknown>),
											prompt: {
												...(promptConfig as Record<string, unknown>),
												prompt: null,
											},
										},
									};
								}

								const nextWorkflow = updateWorkflowNode(
									workflow,
									nodeId,
									nodeUpdates
								);
								if (nextWorkflow) {
									onWorkflowChange(nextWorkflow);
								}
							}}
							aria-label={t(
								'form.workflow.forms.agent.general.overridePrompt.label'
							)}
							className={mainStyles.inlineSwitch}
							size='sm'
						/>
					</Group>
				</Group>
				<Textarea
					placeholder={t(
						'form.workflow.forms.agent.general.prompt.placeholder'
					)}
					value={
						effectiveOverridePrompt
							? overridePromptValue
							: ((currentNode as any)?.additionalPrompt ?? '')
					}
					minRows={7}
					onChange={(event) => {
						const value = event.currentTarget.value;
						if (effectiveOverridePrompt) {
							handleConversationConfigChange({
								agent: {
									...(agentConfig as Record<string, unknown>),
									prompt: {
										...(promptConfig as Record<string, unknown>),
										prompt: value,
									},
								},
							});
						} else {
							const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
								additionalPrompt: value,
							} as any);
							if (nextWorkflow) {
								onWorkflowChange(nextWorkflow);
							}
						}
					}}
					classNames={{
						input: mainStyles.promptInput,
					}}
				/>
			</div>

			{/* Voice Field */}
			{editingFields.voice ? (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.voice.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => handleResetField('voice')}
							title={t('form.workflow.forms.agent.general.resetToDefault')}
						>
							<IconRotateClockwise size={16} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t(
							'form.workflow.forms.agent.general.voice.placeholder'
						)}
						data={voiceOptions}
						value={voiceId || null}
						onChange={(value) =>
							handleConversationConfigChange({
								tts: {
									...(ttsConfig as Record<string, unknown>),
									voiceId: value || undefined,
								},
							})
						}
						searchable
						size='sm'
						leftSection={
							voiceId ? (
								<div className={mainStyles.voiceIcon}>
									<IconMicrophone size={12} />
								</div>
							) : null
						}
						classNames={{
							input: mainStyles.selectInput,
						}}
					/>
				</div>
			) : (
				renderInheritedField(
					t('form.workflow.forms.agent.general.voice.label'),
					inheritedVoiceId,
					() => toggleEditMode('voice')
				)
			)}

			{/* LLM Field */}
			{editingFields.llm ? (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.llm.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => handleResetField('llm')}
							title={t('form.workflow.forms.agent.general.resetToDefault')}
						>
							<IconRotateClockwise size={16} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t('form.workflow.forms.agent.general.llm.placeholder')}
						data={llmOptions}
						value={llmModel || null}
						onChange={(value) => {
							const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
								conversationConfig: {
									...(conversationConfig as Record<string, unknown>),
									agent: {
										...(agentConfig as Record<string, unknown>),
										prompt: {
											...(promptConfig as Record<string, unknown>),
											llm: value || undefined,
										},
									},
								},
								subagent: {
									...subagent,
									llmModel: value || undefined,
								},
							} as any);
							if (nextWorkflow) {
								onWorkflowChange(nextWorkflow);
							}
						}}
						searchable
						size='sm'
						classNames={{
							input: mainStyles.selectInput,
						}}
					/>
				</div>
			) : (
				renderInheritedField(
					t('form.workflow.forms.agent.general.llm.label'),
					inheritedLlmModel && getLlmLabel(inheritedLlmModel),
					() => toggleEditMode('llm')
				)
			)}

			{/* Eagerness Field */}
			{editingFields.eagerness ? (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.eagerness.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => handleResetField('eagerness')}
							title={t('form.workflow.forms.agent.general.resetToDefault')}
						>
							<IconRotateClockwise size={16} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t(
							'form.workflow.forms.agent.general.eagerness.placeholder'
						)}
						data={eagernessOptions}
						value={eagerness || null}
						onChange={(value) =>
							handleConversationConfigChange({
								turn: {
									...(turnConfig as Record<string, unknown>),
									turnEagerness: value || undefined,
								},
							})
						}
						size='sm'
						classNames={{
							input: mainStyles.selectInput,
						}}
					/>
				</div>
			) : (
				renderInheritedField(
					t('form.workflow.forms.agent.general.eagerness.label'),
					inheritedEagerness &&
						getValueLabel(inheritedEagerness, eagernessOptions),
					() => toggleEditMode('eagerness')
				)
			)}

			{/* Spelling Patience Field */}
			{editingFields.spellingPatience ? (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.spellingPatience.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => handleResetField('spellingPatience')}
							title={t('form.workflow.forms.agent.general.resetToDefault')}
						>
							<IconRotateClockwise size={16} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t(
							'form.workflow.forms.agent.general.spellingPatience.placeholder'
						)}
						data={spellingPatienceOptions}
						value={spellingPatience || null}
						onChange={(value) =>
							handleConversationConfigChange({
								turn: {
									...(turnConfig as Record<string, unknown>),
									spelling_patience: value || undefined,
								},
							})
						}
						size='sm'
						classNames={{
							input: mainStyles.selectInput,
						}}
					/>
				</div>
			) : (
				renderInheritedField(
					t('form.workflow.forms.agent.general.spellingPatience.label'),
					inheritedSpellingPatience &&
						getValueLabel(inheritedSpellingPatience, spellingPatienceOptions),
					() => toggleEditMode('spellingPatience')
				)
			)}

			{/* Speculative Turn Field */}
			{editingFields.speculativeTurn ? (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.speculativeTurn.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => handleResetField('speculativeTurn')}
							title={t('form.workflow.forms.agent.general.resetToDefault')}
						>
							<IconRotateClockwise size={16} />
						</ActionIcon>
					</Group>
					<Switch
						checked={speculativeTurn ?? false}
						onChange={(event) =>
							handleConversationConfigChange({
								turn: {
									...(turnConfig as Record<string, unknown>),
									speculative_turn: event.currentTarget.checked,
								},
							})
						}
						size='sm'
					/>
				</div>
			) : (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.speculativeTurn.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => toggleEditMode('speculativeTurn')}
							title={t('form.workflow.forms.agent.general.editOverride')}
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Group>
					<div className={mainStyles.inheritedFieldBox}>
						<Text size='sm' c='dimmed'>
							{inheritedSpeculativeTurn !== undefined
								? `${inheritedSpeculativeTurn ? t('form.workflow.forms.agent.general.speculativeTurn.enabled') : t('form.workflow.forms.agent.general.speculativeTurn.disabled')}`
								: t('form.workflow.forms.agent.general.usingDefault')}
						</Text>
					</div>
				</div>
			)}
		</Stack>
	);
};

export default GeneralTab;
