import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Select,
	Textarea,
	Button,
	Group,
	Stack,
	Box,
	Text,
	Loader,
	Center,
	Modal,
	Badge,
	Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconSettings,
	IconMessageCircle,
	IconBrain,
	IconEdit,
	IconMicrophoneOff,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import KnowledgeBaseSection from './KnowledgeBaseSection';
import useCampaignsPredefinedParams from '../../CampaignsForm/useCampaignsPredefinedParams';
import styles from './StepTwoAgent.module.css';
import sharedStyles from '../CampaignWizard.module.css';
import type { Campaign } from '~/models/CampaignsModel';
import { useUpdateCampaign, useGetCampaign } from '~/queries/campaignsQueries';

interface StepTwoAgentProps {
	onNext: () => void;
}

const LANGUAGE_OPTIONS_KEYS = ['es', 'en', 'fr', 'de', 'it', 'pt'];

const areIdsEqual = (
	idsA?: number[] | null,
	idsB?: number[] | null
): boolean => {
	if (!idsA && !idsB) return true;
	if (!idsA || !idsB) return false;
	if (idsA.length !== idsB.length) return false;
	return idsA.every((id, index) => id === idsB[index]);
};

const extractKnowledgeBaseIds = (
	rawKnowledgeBase: unknown
): { ids: number[]; isPresent: boolean } => {
	if (!Array.isArray(rawKnowledgeBase)) return { ids: [], isPresent: false };
	const ids = rawKnowledgeBase
		.map((item) => {
			if (typeof item === 'number') return item;
			if (typeof item === 'object' && item && 'id' in item) {
				const idValue = (item as { id?: unknown }).id;
				return typeof idValue === 'number' ? idValue : null;
			}
			return null;
		})
		.filter((id): id is number => typeof id === 'number');
	// Only consider KB data "present" if there are actual IDs.
	// An empty array means no KB was saved, so we should preserve local selections.
	return { ids, isPresent: ids.length > 0 };
};

export const StepTwoAgent: React.FC<StepTwoAgentProps> = ({ onNext }) => {
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
	const {
		agentBehaviorId,
		language,
		firstMessage,
		agentPrompt,
		noiseCancellation,
		createdCampaign,
		setAgentBehaviorId,
		setLanguage,
		setFirstMessage,
		setAgentPrompt,
		setKnowledgeBaseIds,
		setNoiseCancellation,
		setIsSubmitting,
		setCreatedCampaign,
	} = useCampaignWizardStore();

	// Modal state for prompt editor
	const [promptEditorOpened, setPromptEditorOpened] = useState(false);
	const [promptDraft, setPromptDraft] = useState(agentPrompt || '');

	const predefinedParams = useCampaignsPredefinedParams();
	const updateCampaign = useUpdateCampaign();
	const queryClient = useQueryClient();

	// Get campaign ID for fetching (only if campaign exists)
	const campaignId = createdCampaign?.id ? String(createdCampaign.id) : '';

	const { data: freshCampaign, isLoading: isFetchingCampaign } =
		useGetCampaign(campaignId);

	React.useEffect(() => {
		if (freshCampaign) {
			setCreatedCampaign(freshCampaign);
		}
	}, [freshCampaign, setCreatedCampaign]);

	const languageOptions = useMemo(
		() =>
			LANGUAGE_OPTIONS_KEYS.map((key) => ({
				value: key,
				label: t(`wizard.steps.agent.languages.${key}`),
			})),
		[t]
	);

	const form = useForm({
		initialValues: {
			agentBehaviorId,
			language,
			firstMessage,
			agentPrompt,
			noiseCancellation,
		},
		validate: {
			language: (value: string) =>
				!value ? t('wizard.steps.agent.validation.languageRequired') : null,
			agentPrompt: (value: string) =>
				value.trim().length < 10
					? t('wizard.steps.agent.validation.promptRequired')
					: null,
		},
		validateInputOnChange: true,
	});

	useEffect(() => {
		if (!promptEditorOpened) return;
		setPromptDraft(form.values.agentPrompt || '');
	}, [promptEditorOpened, form.values.agentPrompt]);

	const lastSyncedCampaignRef = useRef<{
		campaignId: number;
		updatedAt?: string;
		values: typeof form.values;
		knowledgeBaseIds?: number[];
	} | null>(null);

	// Store form ref to avoid dependency on form object in useEffect
	const formRef = useRef(form);
	formRef.current = form;

	useEffect(() => {
		if (!createdCampaign) return;

		const conversationAgent =
			createdCampaign.agentConfig?.conversationConfig?.agent;
		const promptFromCampaign = conversationAgent?.prompt?.prompt;
		const { ids: knowledgeBaseIdsFromCampaign, isPresent: hasKbIds } =
			extractKnowledgeBaseIds(conversationAgent?.prompt?.knowledgeBase);

		// Use formRef to get current values without form in deps
		const currentFormValues = formRef.current.values;

		// Determine if server has actual values vs empty/undefined
		// Only use server values if they exist and are non-empty, otherwise preserve user input
		const serverFirstMessage = conversationAgent?.firstMessage;
		const hasServerFirstMessage =
			typeof serverFirstMessage === 'string' && serverFirstMessage.length > 0;

		const nextValues = {
			agentBehaviorId:
				createdCampaign.configId ?? currentFormValues.agentBehaviorId ?? null,
			language:
				conversationAgent?.language ??
				currentFormValues.language ??
				languageOptions[0].value,
			// Preserve user's first message if server doesn't have one saved yet
			firstMessage: hasServerFirstMessage
				? serverFirstMessage
				: (currentFormValues.firstMessage ?? ''),
			agentPrompt:
				typeof promptFromCampaign === 'string'
					? promptFromCampaign
					: currentFormValues.agentPrompt,
			noiseCancellation:
				createdCampaign.noiseCancellation ??
				currentFormValues.noiseCancellation ??
				false,
		};

		const lastSynced = lastSyncedCampaignRef.current;
		// Get current KB IDs from store to preserve local selections.
		// When hasKbIds is false (server doesn't have KB data yet), ALWAYS use the current store value
		// to preserve any user selections that haven't been saved to the server yet.
		const currentStoreKbIds =
			useCampaignWizardStore.getState().knowledgeBaseIds;
		const nextKnowledgeBaseIds = hasKbIds
			? knowledgeBaseIdsFromCampaign
			: currentStoreKbIds;
		const hasValueChanges =
			!lastSynced ||
			lastSynced.campaignId !== createdCampaign.id ||
			lastSynced.updatedAt !== createdCampaign.updatedAt ||
			lastSynced.values.agentBehaviorId !== nextValues.agentBehaviorId ||
			lastSynced.values.language !== nextValues.language ||
			// Only consider firstMessage changed if server has a value and it differs
			(hasServerFirstMessage &&
				lastSynced.values.firstMessage !== nextValues.firstMessage) ||
			lastSynced.values.agentPrompt !== nextValues.agentPrompt ||
			(hasKbIds &&
				!areIdsEqual(
					lastSynced?.knowledgeBaseIds,
					knowledgeBaseIdsFromCampaign
				));

		if (!hasValueChanges) return;

		formRef.current.setValues(nextValues);
		formRef.current.resetDirty(nextValues);
		setAgentBehaviorId(nextValues.agentBehaviorId);
		setLanguage(nextValues.language);
		setFirstMessage(nextValues.firstMessage);
		setAgentPrompt(nextValues.agentPrompt);
		setNoiseCancellation(nextValues.noiseCancellation);

		if (hasKbIds) {
			setKnowledgeBaseIds(knowledgeBaseIdsFromCampaign);
		}

		lastSyncedCampaignRef.current = {
			campaignId: createdCampaign.id,
			updatedAt: createdCampaign.updatedAt,
			values: nextValues,
			knowledgeBaseIds: nextKnowledgeBaseIds,
		};
		// Note: knowledgeBaseIds intentionally excluded from deps to prevent
		// re-sync when user locally selects KB before saving.
		// form is accessed via formRef to prevent re-runs when form values change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		createdCampaign,
		setAgentBehaviorId,
		setAgentPrompt,
		setFirstMessage,
		setKnowledgeBaseIds,
		setLanguage,
		setNoiseCancellation,
	]);

	const handleBehaviorChange = (value: string | null) => {
		if (!value) {
			form.setFieldValue('agentBehaviorId', null);
			return;
		}

		const param = predefinedParams.find((p) => p.id && String(p.id) === value);
		if (param && param.id) {
			form.setFieldValue('agentBehaviorId', param.id);
		}
	};

	const handleSubmit = async (values: typeof form.values) => {
		// Get fresh campaign and knowledge base IDs from store
		const currentCampaign = useCampaignWizardStore.getState().createdCampaign;
		const currentKnowledgeBaseIds =
			useCampaignWizardStore.getState().knowledgeBaseIds;

		if (
			!currentCampaign ||
			typeof currentCampaign.id === 'undefined' ||
			currentCampaign.id === null
		) {
			notifications.show({
				title: t('common:status.error'),
				message: t('wizard.steps.agent.errorCampaignNotFound'),
				color: 'red',
			});
			return;
		}

		setIsSubmitting(true);
		try {
			// Prepare updated prompt structure
			const currentPrompt =
				currentCampaign.agentConfig?.conversationConfig?.agent?.prompt || {};

			const payload = {
				...currentCampaign,
				configId: values.agentBehaviorId,
				noiseCancellation: values.noiseCancellation,
				agentConfig: {
					...currentCampaign.agentConfig,
					knowledgeBaseIds: currentKnowledgeBaseIds,
					conversationConfig: {
						...currentCampaign.agentConfig?.conversationConfig,
						agent: {
							...currentCampaign.agentConfig?.conversationConfig?.agent,
							language: values.language,
							firstMessage: values.firstMessage,
							prompt: {
								...currentPrompt,
								prompt: values.agentPrompt,
								knowledgeBase: currentKnowledgeBaseIds,
							},
						},
					},
				},
			};

			// Remove toolIds from prompt if present, as it can interfere with knowledge base functionality
			if (payload.agentConfig?.conversationConfig?.agent?.prompt) {
				delete (payload.agentConfig.conversationConfig.agent.prompt as any)
					.toolIds;
			}

			// Ensure configId is a string and convert id to string for API
			const updatePayload = {
				...payload,
				configId: values.agentBehaviorId
					? String(values.agentBehaviorId)
					: currentCampaign.configId,
			};

			await updateCampaign.mutateAsync({
				id: String(currentCampaign.id),
				data: updatePayload as unknown as Partial<Campaign>,
			});

			const updatedCampaign = {
				...currentCampaign,
				...updatePayload,
				configId: updatePayload.configId || currentCampaign.configId,
			} as unknown as Campaign;
			setCreatedCampaign(updatedCampaign);

			notifications.show({
				title: t('wizard.steps.agent.successTitle'),
				message: t('wizard.steps.agent.successMessage'),
				color: 'green',
			});

			queryClient.invalidateQueries({
				queryKey: ['campaign', currentCampaign.id],
			});
			onNext();
		} catch (error) {
			notifications.show({
				title: t('common:status.error'),
				message:
					error instanceof Error ? error.message : t('common:errors.unknown'),
				color: 'red',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditPrompt = () => {
		setPromptEditorOpened(true);
	};

	const handleSavePrompt = () => {
		form.setFieldValue('agentPrompt', promptDraft);
		setAgentPrompt(promptDraft);
		setPromptEditorOpened(false);
	};

	// If we're still loading campaign data, show loading state
	if (isFetchingCampaign && !createdCampaign) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='md'>
					<Loader size='lg' />
					<Text c='dimmed'>{t('wizard.steps.agent.loading')}</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='xl' className={sharedStyles.stepSurface}>
					<Box className={sharedStyles.stepHeaderCard}>
						<Text className={sharedStyles.stepEyebrow}>
							{t('wizard.steps.agent.eyebrow')}
						</Text>
						<Text className={sharedStyles.stepTitle}>
							{t('wizard.steps.agent.title')}
						</Text>
						<Text className={sharedStyles.stepDescriptionText}>
							{t('wizard.steps.agent.intro')}
						</Text>
					</Box>

					<div className={styles.layoutGrid}>
						<div className={styles.primaryColumn}>
							<Box className={styles.sectionCard}>
								<div className={styles.sectionHeader}>
									<IconSettings size={20} className={styles.sectionIcon} />
									<h3 className={styles.sectionTitle}>
										{t('wizard.steps.agent.setupTitle')}
									</h3>
								</div>
								<Text className={styles.sectionDescription}>
									{t('wizard.steps.agent.setupDesc')}
								</Text>

								<div className={styles.fieldGrid}>
									<Select
										label={t('wizard.steps.agent.behaviorLabel')}
										description={t('wizard.steps.agent.behaviorDesc')}
										placeholder={t('wizard.steps.agent.behaviorPlaceholder')}
										size='sm'
										data={predefinedParams
											.filter((param) => param.id)
											.map((param) => ({
												value: String(param.id),
												label: param.name || 'Unnamed',
											}))}
										value={
											form.values.agentBehaviorId
												? String(form.values.agentBehaviorId)
												: null
										}
										onChange={handleBehaviorChange}
										clearable
										className={sharedStyles.field}
									/>

									<Select
										label={t('wizard.steps.agent.languageLabel')}
										description={t('wizard.steps.agent.languageDesc')}
										placeholder={t('wizard.steps.agent.languagePlaceholder')}
										data={languageOptions}
										{...form.getInputProps('language')}
										withAsterisk
										size='sm'
										searchable
										leftSection={<IconMessageCircle size={16} />}
										className={sharedStyles.field}
									/>
								</div>

								<Textarea
									label={t('wizard.steps.agent.firstMessageLabel')}
									description={t('wizard.steps.agent.firstMessageDesc')}
									placeholder={t('wizard.steps.agent.firstMessagePlaceholder')}
									{...form.getInputProps('firstMessage')}
									size='sm'
									minRows={2}
									className={sharedStyles.field}
								/>
							</Box>

							<Box className={styles.sectionCard}>
								<div className={styles.sectionHeader}>
									<IconMicrophoneOff size={20} className={styles.sectionIcon} />
									<h3 className={styles.sectionTitle}>
										{t('wizard.steps.agent.audioTitle')}
									</h3>
								</div>
								<Text className={styles.sectionDescription}>
									{t('wizard.steps.agent.audioDesc')}
								</Text>
								<Switch
									label={t('wizard.steps.agent.noiseCancellationLabel')}
									description={t('wizard.steps.agent.noiseCancellationDesc')}
									size='sm'
									checked={form.values.noiseCancellation}
									onChange={(event) => {
										form.setFieldValue(
											'noiseCancellation',
											event.currentTarget.checked
										);
										setNoiseCancellation(event.currentTarget.checked);
									}}
								/>
							</Box>

							<KnowledgeBaseSection />
						</div>

						<div className={styles.secondaryColumn}>
							<Box className={styles.sectionCard}>
								<div className={styles.sectionHeader}>
									<IconBrain size={20} className={styles.sectionIcon} />
									<h3 className={styles.sectionTitle}>
										{t('wizard.steps.agent.promptTitle')}
									</h3>
								</div>
								<Text className={styles.sectionDescription}>
									{t('wizard.steps.agent.promptDesc')}
								</Text>

								<div className={styles.promptLayout}>
									<div>
										<Text className={styles.promptTitle}>
											{t('wizard.steps.agent.promptContent')}
										</Text>
										<Text className={styles.promptHint}>
											{t('wizard.steps.agent.promptHint')}
										</Text>
									</div>

									<Button
										size='xs'
										variant='light'
										leftSection={<IconEdit size={14} />}
										onClick={handleEditPrompt}
									>
										{t('wizard.steps.agent.editPrompt')}
									</Button>
								</div>

								<Textarea
									aria-label={t('wizard.steps.agent.promptTitle')}
									placeholder={t('wizard.steps.agent.promptPlaceholder')}
									value={form.values.agentPrompt}
									readOnly
									disabled
									withAsterisk
									rows={16}
									size='sm'
									className={sharedStyles.field}
									classNames={{ input: styles.promptTextarea }}
								/>
							</Box>
						</div>
					</div>
				</Stack>

				<Group className={sharedStyles.actions} justify='flex-end'>
					<Button
						type='submit'
						loading={updateCampaign.isPending}
						disabled={!form.isValid()}
						size='sm'
					>
						{t('wizard.steps.agent.submit')}
					</Button>
				</Group>
			</form>

			{/* Prompt Editor Modal */}
			<Modal
				opened={promptEditorOpened}
				onClose={() => setPromptEditorOpened(false)}
				size='xl'
				centered
				classNames={{ body: styles.promptModalBody }}
			>
				<Stack gap='sm' className={styles.promptModalContent}>
					<Group justify='space-between' align='center'>
						<div>
							<Text size='sm' fw={600}>
								{t('form.agent.prompt.simpleModal.title')}
							</Text>
							<Text size='xs' c='dimmed'>
								{t('form.agent.prompt.simpleModal.description')}
							</Text>
						</div>
						<Badge size='sm' variant='light' color='gray'>
							{t('form.agent.prompt.simpleModal.chars', {
								count: promptDraft.length,
							})}
						</Badge>
					</Group>
					<Textarea
						value={promptDraft}
						onChange={(event) => setPromptDraft(event.currentTarget.value)}
						placeholder={t('form.agent.prompt.simpleModal.placeholder')}
						minRows={12}
						autosize
						size='sm'
						className={styles.promptModalTextarea}
					/>
					<Group justify='space-between' align='center'>
						<Text size='xs' c='dimmed'>
							{t('form.agent.prompt.simpleModal.helper')}
						</Text>
						<Group gap='xs'>
							<Button
								variant='subtle'
								size='xs'
								onClick={() => setPromptEditorOpened(false)}
							>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button size='xs' onClick={handleSavePrompt}>
								{t('actions.save', { ns: 'common' })}
							</Button>
						</Group>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};
