import {
	ActionIcon,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
	Tooltip,
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
	IconMicrophone,
	IconEdit,
	IconRotateClockwise,
	IconArrowsMaximize,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	LLM_MODELS,
	getGroupedLlmOptions,
} from '~/modules/configurations/AgentBehaviorsPage/AgentBehaviorsForm/formConfig';
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
import { WORKFLOW_DRAWER_COMBOBOX_PROPS } from '../../../workflowDrawerComboboxProps';
import PromptEditModal from '~/modules/campaigns/CampaignsForm/components/PromptEditModal';
import mainStyles from '../../AgentForm.module.css';

const GeneralTab = () => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const { campaignId: routeCampaignId } = useParams();
	const { workflow, nodeId, onWorkflowChange, campaignAgentConfig } =
		useAgentForm();

	const campaignId = Number(routeCampaignId) || 0;
	const [promptModalOpen, setPromptModalOpen] = useState(false);

	const currentNode = workflow?.nodes[nodeId];
	const subagent =
		currentNode && 'subagent' in currentNode ? currentNode.subagent : undefined;

	// Current conversation_config (personalized)
	const conversation_config =
		(currentNode as { conversation_config?: unknown })?.conversation_config ??
		{};
	const ttsConfig = (conversation_config as Record<string, unknown>).tts ?? {};
	const turnConfig =
		(conversation_config as Record<string, unknown>).turn ?? {};
	const agentConfig =
		(conversation_config as Record<string, unknown>).agent ?? {};
	const promptConfig = (agentConfig as Record<string, unknown>).prompt ?? {};
	const additional_prompt = (
		currentNode as { additional_prompt?: string | null }
	)?.additional_prompt;
	const subagentLlmModel = subagent?.llm_model;
	const overridePromptValue =
		((promptConfig as Record<string, unknown>).prompt as string | null) ?? '';
	const hasAdditionalPrompt = (additional_prompt ?? '').trim().length > 0;
	const hasOverridePrompt = (overridePromptValue ?? '').trim().length > 0;
	const hasDefinedOverridePrompt =
		typeof subagent?.override_prompt === 'boolean';
	const effectiveOverridePrompt = hasDefinedOverridePrompt
		? (subagent?.override_prompt as boolean)
		: hasAdditionalPrompt
			? false
			: hasOverridePrompt
				? true
				: false;

	// Inherited conversation_config (from campaign agent)
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
	const voice_id = (ttsConfig as Record<string, unknown>).voice_id as
		| string
		| undefined;
	const llm_model =
		((promptConfig as Record<string, unknown>).llm as string | undefined) ||
		subagentLlmModel;
	const eagerness = (turnConfig as Record<string, unknown>).turnEagerness as
		| string
		| undefined;
	const spelling_patience = (turnConfig as Record<string, unknown>)
		.spelling_patience as string | undefined;
	const speculativeTurn = (turnConfig as Record<string, unknown>)
		.speculative_turn as boolean | undefined;

	// Inherited values
	const inheritedVoiceId = (inheritedTtsConfig as Record<string, unknown>)
		.voice_id as string | undefined;
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
		voice: !!voice_id,
		llm: !!llm_model,
		eagerness: !!eagerness,
		spelling_patience: !!spelling_patience,
		speculativeTurn: speculativeTurn !== undefined,
	});

	// Sync editing fields when values change
	useEffect(() => {
		setEditingFields({
			voice: !!voice_id,
			llm: !!llm_model,
			eagerness: !!eagerness,
			spelling_patience: !!spelling_patience,
			speculativeTurn: speculativeTurn !== undefined,
		});
	}, [voice_id, llm_model, eagerness, spelling_patience, speculativeTurn]);

	useEffect(() => {
		if (!currentNode || hasDefinedOverridePrompt) return;
		const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, {
			override_prompt: effectiveOverridePrompt,
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
			conversation_config: {
				...conversation_config,
				...updates,
			},
		} as Record<string, unknown>);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const currentPromptValue = effectiveOverridePrompt
		? overridePromptValue
		: ((currentNode as any)?.additional_prompt ?? '');

	const handlePromptChange = useCallback(
		(value: string) => {
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
					additional_prompt: value,
				} as any);
				if (nextWorkflow) {
					onWorkflowChange(nextWorkflow);
				}
			}
		},
		[
			effectiveOverridePrompt,
			agentConfig,
			promptConfig,
			workflow,
			nodeId,
			onWorkflowChange,
		]
	);

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
				<div className={mainStyles.inheritedField}>
					<div className={mainStyles.inheritedFieldValue}>
						<Text size='xs' className={mainStyles.inheritedFieldLabel}>
							{fieldLabel}
						</Text>
						<Text size='sm' fw={500}>
							{hasValue
								? t('form.workflow.forms.agent.general.usingDefaultValue', {
										value: inheritedValue,
									})
								: t('form.workflow.forms.agent.general.usingDefault')}
						</Text>
					</div>
					<ActionIcon
						size='sm'
						variant='subtle'
						onClick={onEdit}
						title={t('form.workflow.forms.agent.general.editOverride')}
						className={mainStyles.inheritedFieldAction}
					>
						<IconEdit size={14} />
					</ActionIcon>
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
			updates.tts = { ...ttsConfig, voice_id: undefined };
		} else if (field === 'llm') {
			updates.agent = {
				...agentConfig,
				prompt: { ...promptConfig, llm: undefined },
			};
			updates.subagent = {
				...subagent,
				llm_model: undefined,
			};
		} else if (field === 'eagerness') {
			updates.turn = { ...turnConfig, turnEagerness: undefined };
		} else if (field === 'spelling_patience') {
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
				<div className={mainStyles.conversationHeader}>
					<div>
						<Text size='sm' component='div' className={mainStyles.sectionLabel}>
							{t('form.workflow.forms.agent.general.prompt.label')}
						</Text>
						<Text
							size='xs'
							c='dimmed'
							className={mainStyles.overrideDescription}
						>
							{t(
								'form.workflow.forms.agent.general.override_prompt.description'
							)}
						</Text>
					</div>
					<Group gap='xs' align='center' className={mainStyles.overrideToggle}>
						<Switch
							checked={effectiveOverridePrompt}
							onChange={(event) => {
								const isChecked = event.currentTarget.checked;
								const currentAdditionalPrompt =
									(currentNode as any)?.additional_prompt ?? '';
								const currentOverridePrompt = overridePromptValue ?? '';

								const nodeUpdates: any = {
									subagent: {
										...subagent,
										override_prompt: isChecked,
									},
								};

								if (isChecked) {
									// Turning Override ON: Move additional_prompt to conversation_config
									nodeUpdates.additional_prompt = null;
									nodeUpdates.conversation_config = {
										...(conversation_config as Record<string, unknown>),
										agent: {
											...(agentConfig as Record<string, unknown>),
											prompt: {
												...(promptConfig as Record<string, unknown>),
												prompt: currentAdditionalPrompt,
											},
										},
									};
								} else {
									// Turning Override OFF: Move conversation_config prompt to additional_prompt
									nodeUpdates.additional_prompt = currentOverridePrompt;
									nodeUpdates.conversation_config = {
										...(conversation_config as Record<string, unknown>),
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
								'form.workflow.forms.agent.general.override_prompt.label'
							)}
							className={mainStyles.inlineSwitch}
							size='sm'
						/>
					</Group>
				</div>
				<div className={mainStyles.promptSurface}>
					<Textarea
						placeholder={t(
							'form.workflow.forms.agent.general.prompt.placeholder'
						)}
						value={currentPromptValue}
						minRows={7}
						onChange={(event) => {
							handlePromptChange(event.currentTarget.value);
						}}
						classNames={{
							root: mainStyles.promptRoot,
							wrapper: mainStyles.promptWrapper,
							input: mainStyles.promptInput,
						}}
					/>
					<div className={mainStyles.promptActions}>
						<Tooltip
							label={t('form.workflow.forms.agent.general.prompt.expand')}
							position='left'
							withArrow
						>
							<ActionIcon
								size='sm'
								variant='subtle'
								onClick={() => setPromptModalOpen(true)}
								aria-label={t(
									'form.workflow.forms.agent.general.prompt.expand'
								)}
							>
								<IconArrowsMaximize size={14} />
							</ActionIcon>
						</Tooltip>
					</div>
				</div>
			</div>

			<PromptEditModal
				opened={promptModalOpen}
				onClose={() => setPromptModalOpen(false)}
				value={currentPromptValue}
				onSave={handlePromptChange}
				campaignId={campaignId}
				title={t('form.workflow.forms.agent.general.prompt.modalTitle')}
				description={t(
					'form.workflow.forms.agent.general.prompt.modalDescription'
				)}
				placeholder={t('form.workflow.forms.agent.general.prompt.placeholder')}
				helperText={t('form.workflow.forms.agent.general.prompt.modalHelper')}
			/>

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
							<IconRotateClockwise size={14} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t(
							'form.workflow.forms.agent.general.voice.placeholder'
						)}
						data={voiceOptions}
						comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
						value={voice_id || null}
						onChange={(value) =>
							handleConversationConfigChange({
								tts: {
									...(ttsConfig as Record<string, unknown>),
									voice_id: value || undefined,
								},
							})
						}
						searchable
						size='sm'
						leftSection={
							voice_id ? (
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
							<IconRotateClockwise size={14} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t('form.workflow.forms.agent.general.llm.placeholder')}
						data={llmOptions}
						comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
						value={llm_model || null}
						onChange={(value) => {
							const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
								conversation_config: {
									...(conversation_config as Record<string, unknown>),
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
									llm_model: value || undefined,
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
							<IconRotateClockwise size={14} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t(
							'form.workflow.forms.agent.general.eagerness.placeholder'
						)}
						data={eagernessOptions}
						comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
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
			{editingFields.spelling_patience ? (
				<div className={mainStyles.fieldRow}>
					<Group justify='space-between' align='center'>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.forms.agent.general.spelling_patience.label')}
						</Text>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => handleResetField('spelling_patience')}
							title={t('form.workflow.forms.agent.general.resetToDefault')}
						>
							<IconRotateClockwise size={14} />
						</ActionIcon>
					</Group>
					<Select
						placeholder={t(
							'form.workflow.forms.agent.general.spelling_patience.placeholder'
						)}
						data={spellingPatienceOptions}
						comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
						value={spelling_patience || null}
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
					t('form.workflow.forms.agent.general.spelling_patience.label'),
					inheritedSpellingPatience &&
						getValueLabel(inheritedSpellingPatience, spellingPatienceOptions),
					() => toggleEditMode('spelling_patience')
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
							<IconRotateClockwise size={14} />
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
					<div className={mainStyles.inheritedField}>
						<div className={mainStyles.inheritedFieldValue}>
							<Text size='xs' className={mainStyles.inheritedFieldLabel}>
								{t('form.workflow.forms.agent.general.speculativeTurn.label')}
							</Text>
							<Text size='sm' fw={500}>
								{inheritedSpeculativeTurn !== undefined
									? `${inheritedSpeculativeTurn ? t('form.workflow.forms.agent.general.speculativeTurn.enabled') : t('form.workflow.forms.agent.general.speculativeTurn.disabled')}`
									: t('form.workflow.forms.agent.general.usingDefault')}
							</Text>
						</div>
						<ActionIcon
							size='sm'
							variant='subtle'
							onClick={() => toggleEditMode('speculativeTurn')}
							title={t('form.workflow.forms.agent.general.editOverride')}
							className={mainStyles.inheritedFieldAction}
						>
							<IconEdit size={14} />
						</ActionIcon>
					</div>
				</div>
			)}
		</Stack>
	);
};

export default GeneralTab;
