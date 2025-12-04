import React, { useEffect, useRef, useState } from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
	IconSettings,
	IconMessageCircle,
	IconBrain,
	IconEdit,
} from '@tabler/icons-react';
import CampaignConfigurationPromptEditModal from '~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptEditModal';
import { useQueryClient } from '@tanstack/react-query';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import KnowledgeBaseSection from './KnowledgeBaseSection';
import useCampaignsPredefinedParams from '../../CampaignsForm/useCampaignsPredefinedParams';
import styles from './StepTwoAgent.module.css';
import sharedStyles from '../CampaignWizard.module.css';
import { useUpdateCampaign, useGetCampaign } from '~/queries/campaignsQueries';
import '@uiw/react-md-editor/markdown-editor.css';

interface StepTwoAgentProps {
	onNext: () => void;
	onBack: () => void;
}

const LANGUAGE_OPTIONS = [
	{ value: 'es', label: 'Spanish' },
	{ value: 'en', label: 'English' },
	{ value: 'fr', label: 'French' },
	{ value: 'de', label: 'German' },
	{ value: 'it', label: 'Italian' },
	{ value: 'pt', label: 'Portuguese' },
];

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
	return { ids, isPresent: true };
};

export const StepTwoAgent: React.FC<StepTwoAgentProps> = ({
	onNext,
	onBack,
}) => {
	const {
		agentBehaviorId,
		language,
		firstMessage,
		agentPrompt,
		createdCampaign,
		knowledgeBaseIds,
		setAgentBehaviorId,
		setLanguage,
		setFirstMessage,
		setAgentPrompt,
		setKnowledgeBaseIds,
		setIsSubmitting,
		setCreatedCampaign,
	} = useCampaignWizardStore();

	// Modal state for prompt editor
	const [promptEditorOpened, setPromptEditorOpened] = useState(false);

	const predefinedParams = useCampaignsPredefinedParams();
	const updateCampaign = useUpdateCampaign();
	const queryClient = useQueryClient();

	// Get campaign ID for fetching (only if campaign exists)
	const campaignId = createdCampaign?.id ? String(createdCampaign.id) : '';

	const {
		data: freshCampaign,
		isLoading: isFetchingCampaign,
		refetch: reloadFreshCampaign,
	} = useGetCampaign(campaignId);

	// Update store with fresh campaign data when it loads
	useEffect(() => {
		if (freshCampaign) {
			setCreatedCampaign(freshCampaign);
		}
	}, [freshCampaign, setCreatedCampaign]);

	const form = useForm({
		initialValues: {
			agentBehaviorId,
			language,
			firstMessage,
			agentPrompt,
		},
		validate: {
			language: (value: string) => (!value ? 'Language is required' : null),
			agentPrompt: (value: string) =>
				value.trim().length < 10 ? 'Agent prompt is required' : null,
		},
		validateInputOnChange: true,
	});

	const lastSyncedCampaignRef = useRef<{
		campaignId: number;
		updatedAt?: string;
		values: typeof form.values;
		knowledgeBaseIds?: number[];
	} | null>(null);

	useEffect(() => {
		if (!createdCampaign) return;

		const conversationAgent =
			createdCampaign.agentConfig?.conversationConfig?.agent;
		const promptFromCampaign = conversationAgent?.prompt?.prompt;
		const { ids: knowledgeBaseIdsFromCampaign, isPresent: hasKbIds } =
			extractKnowledgeBaseIds(conversationAgent?.prompt?.knowledgeBase);

		const nextValues: typeof form.values = {
			agentBehaviorId:
				createdCampaign.configId ?? form.values.agentBehaviorId ?? null,
			language:
				conversationAgent?.language ??
				form.values.language ??
				LANGUAGE_OPTIONS[0].value,
			firstMessage:
				conversationAgent?.firstMessage ?? form.values.firstMessage ?? '',
			agentPrompt:
				typeof promptFromCampaign === 'string'
					? promptFromCampaign
					: form.values.agentPrompt,
		};

		const lastSynced = lastSyncedCampaignRef.current;
		const nextKnowledgeBaseIds = hasKbIds
			? knowledgeBaseIdsFromCampaign
			: (lastSynced?.knowledgeBaseIds ?? knowledgeBaseIds);
		const hasValueChanges =
			!lastSynced ||
			lastSynced.campaignId !== createdCampaign.id ||
			lastSynced.updatedAt !== createdCampaign.updatedAt ||
			lastSynced.values.agentBehaviorId !== nextValues.agentBehaviorId ||
			lastSynced.values.language !== nextValues.language ||
			lastSynced.values.firstMessage !== nextValues.firstMessage ||
			lastSynced.values.agentPrompt !== nextValues.agentPrompt ||
			(hasKbIds &&
				!areIdsEqual(
					lastSynced?.knowledgeBaseIds,
					knowledgeBaseIdsFromCampaign
				));

		if (!hasValueChanges) return;

		form.setValues(nextValues);
		form.resetDirty(nextValues);
		setAgentBehaviorId(nextValues.agentBehaviorId);
		setLanguage(nextValues.language);
		setFirstMessage(nextValues.firstMessage);
		setAgentPrompt(nextValues.agentPrompt);

		if (hasKbIds) {
			setKnowledgeBaseIds(knowledgeBaseIdsFromCampaign);
		}

		lastSyncedCampaignRef.current = {
			campaignId: createdCampaign.id,
			updatedAt: createdCampaign.updatedAt,
			values: nextValues,
			knowledgeBaseIds: nextKnowledgeBaseIds,
		};
	}, [
		createdCampaign,
		form,
		knowledgeBaseIds,
		setAgentBehaviorId,
		setAgentPrompt,
		setFirstMessage,
		setKnowledgeBaseIds,
		setLanguage,
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
				title: 'Error',
				message: 'Campaign not found. Please start from step 1.',
				color: 'red',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Build the agent configuration update
			const updatePayload: any = {
				// Update campaign config if behavior is selected
				...(values.agentBehaviorId && {
					configId: String(values.agentBehaviorId),
				}),
			};

			// Update agent configuration if it exists
			if (currentCampaign.agentConfig) {
				updatePayload.agentConfig = {
					...currentCampaign.agentConfig,
					conversationConfig: {
						...(currentCampaign.agentConfig.conversationConfig || {}),
						agent: {
							...(currentCampaign.agentConfig.conversationConfig?.agent || {}),
							language: values.language,
							firstMessage: values.firstMessage,
							prompt: {
								...(currentCampaign.agentConfig.conversationConfig?.agent
									?.prompt || {}),
								prompt: values.agentPrompt,
								knowledgeBase: currentKnowledgeBaseIds,
							},
						},
					},
				};
			}

			// Update campaign with agent configuration
			const updatedCampaign = await updateCampaign.mutateAsync({
				id: String(currentCampaign.id),
				data: updatePayload,
			});

			// Update store with fresh campaign data
			setCreatedCampaign(updatedCampaign);
			setAgentBehaviorId(values.agentBehaviorId);
			setLanguage(values.language);
			setFirstMessage(values.firstMessage);
			setAgentPrompt(values.agentPrompt);
			setKnowledgeBaseIds(currentKnowledgeBaseIds);
			setIsSubmitting(false);

			// Invalidate campaign cache to ensure fresh data in edit form
			queryClient.invalidateQueries({
				queryKey: ['campaign', String(currentCampaign.id)],
			});
			queryClient.invalidateQueries({
				queryKey: ['campaigns'],
			});

			notifications.show({
				title: 'Agent Configured',
				message: 'Agent configuration saved successfully.',
				color: 'green',
			});

			onNext();
		} catch (error) {
			setIsSubmitting(false);
			notifications.show({
				title: 'Error',
				message:
					error instanceof Error
						? error.message
						: 'Failed to update campaign configuration',
				color: 'red',
			});
		}
	};

	const handleEditPrompt = () => {
		setPromptEditorOpened(true);
	};

	// If we're still loading campaign data, show loading state
	if (isFetchingCampaign && !createdCampaign) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='md'>
					<Loader size='lg' />
					<Text c='dimmed'>Loading campaign data...</Text>
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
							Agent configuration
						</Text>
						<Text className={sharedStyles.stepTitle}>
							Shape the conversation
						</Text>
						<Text className={sharedStyles.stepDescriptionText}>
							Configure behavior, language, and prompt for the agent.
						</Text>
					</Box>

					<div className={styles.layoutGrid}>
						<div className={styles.primaryColumn}>
							<Box className={styles.sectionCard}>
								<div className={styles.sectionHeader}>
									<IconSettings size={20} className={styles.sectionIcon} />
									<h3 className={styles.sectionTitle}>Conversation Setup</h3>
								</div>
								<Text className={styles.sectionDescription}>
									Select behavior, language, and greeting for conversation
									start.
								</Text>

								<div className={styles.fieldGrid}>
									<Select
										label='Agent Behavior'
										description='Baseline configuration'
										placeholder='Choose behavior'
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
										label='Language'
										description='Response language'
										placeholder='Select language'
										data={LANGUAGE_OPTIONS}
										{...form.getInputProps('language')}
										withAsterisk
										size='sm'
										searchable
										leftSection={<IconMessageCircle size={16} />}
										className={sharedStyles.field}
									/>
								</div>

								<Textarea
									label='Agent First Message'
									description='Initial greeting'
									placeholder='Enter the first message your agent will send...'
									{...form.getInputProps('firstMessage')}
									size='sm'
									minRows={2}
									className={sharedStyles.field}
								/>
							</Box>
							<Box className={styles.sectionCard}>
								<div className={styles.sectionHeader}>
									<IconBrain size={20} className={styles.sectionIcon} />
									<h3 className={styles.sectionTitle}>Agent Prompt</h3>
								</div>
								<Text className={styles.sectionDescription}>
									Review the locked prompt. Use Edit to refine instructions.
								</Text>

								<div className={styles.promptLayout}>
									<div>
										<Text className={styles.promptTitle}>Prompt content</Text>
										<Text className={styles.promptHint}>
											This prompt is managed centrally. Edits will open the full
											editor.
										</Text>
									</div>

									<Button
										size='xs'
										variant='light'
										leftSection={<IconEdit size={14} />}
										onClick={handleEditPrompt}
									>
										Edit prompt
									</Button>
								</div>

								<Textarea
									aria-label='Agent prompt'
									placeholder='AI agent prompt'
									value={form.values.agentPrompt}
									readOnly
									disabled
									withAsterisk
									minRows={6}
									autosize
									size='sm'
									className={sharedStyles.field}
									classNames={{ input: styles.promptTextarea }}
								/>
							</Box>
						</div>

						<div className={styles.secondaryColumn}>
							<KnowledgeBaseSection />
						</div>
					</div>
				</Stack>

				<Group className={sharedStyles.actions}>
					<Button variant='default' onClick={onBack} size='sm'>
						Back
					</Button>
					<Button
						type='submit'
						loading={updateCampaign.isPending}
						disabled={!form.isValid()}
						size='sm'
					>
						Save & Continue
					</Button>
				</Group>
			</form>

			{/* Prompt Editor Modal */}
			<Modal
				opened={promptEditorOpened}
				onClose={() => setPromptEditorOpened(false)}
				size='100%'
				centered
				styles={{
					body: {
						height: '90%',
					},
				}}
				fullScreen
				withCloseButton={false}
				padding={0}
			>
				<CampaignConfigurationPromptEditModal
					campaignId={Number(campaignId)}
					onClose={() => setPromptEditorOpened(false)}
					onSave={() => {
						setPromptEditorOpened(false);
						reloadFreshCampaign();
						notifications.show({
							title: 'Prompt Updated',
							message: 'Agent prompt has been updated',
							color: 'green',
						});
					}}
				/>
			</Modal>
		</>
	);
};
