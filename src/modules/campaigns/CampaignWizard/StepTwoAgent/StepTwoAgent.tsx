import React, { useEffect, useState } from 'react';
import {
	Select,
	Textarea,
	Button,
	Group,
	Stack,
	Box,
	Text,
	ActionIcon,
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
	IconDatabase,
	IconPlus,
	IconCopy,
	IconEdit,
	IconTrash,
} from '@tabler/icons-react';
import MDEditor from '@uiw/react-md-editor';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
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

export const StepTwoAgent: React.FC<StepTwoAgentProps> = ({
	onNext,
	onBack,
}) => {
	const {
		agentBehaviorId,
		language,
		firstMessage,
		agentPrompt,
		knowledgeBaseIds,
		createdCampaign,
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
	const [promptDraft, setPromptDraft] = useState('');

	const predefinedParams = useCampaignsPredefinedParams();
	const updateCampaign = useUpdateCampaign();

	// Get campaign ID for fetching (only if campaign exists)
	const campaignId = createdCampaign?.id ? String(createdCampaign.id) : '';

	const { data: freshCampaign, isLoading: isFetchingCampaign } =
		useGetCampaign(campaignId);

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
			knowledgeBaseIds,
		},
		validate: {
			language: (value) => (!value ? 'Language is required' : null),
			firstMessage: (value) =>
				value.trim().length < 2 ? 'First message is required' : null,
			agentPrompt: (value) =>
				value.trim().length < 10 ? 'Agent prompt is required' : null,
		},
		validateInputOnChange: true,
	});

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
		// Get fresh campaign from store
		const currentCampaign = useCampaignWizardStore.getState().createdCampaign;

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
								knowledgeBase: values.knowledgeBaseIds || [],
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
			setKnowledgeBaseIds(values.knowledgeBaseIds);
			setIsSubmitting(false);

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

	const handleCopyPrompt = () => {
		if (form.values.agentPrompt) {
			navigator.clipboard.writeText(form.values.agentPrompt);
			notifications.show({
				title: 'Copied',
				message: 'Prompt copied to clipboard',
				color: 'blue',
			});
		}
	};

	const handleEditPrompt = () => {
		setPromptDraft(form.values.agentPrompt);
		setPromptEditorOpened(true);
	};

	const handleSavePrompt = () => {
		form.setFieldValue('agentPrompt', promptDraft);
		setPromptEditorOpened(false);
		notifications.show({
			title: 'Prompt Updated',
			message: 'Agent prompt has been updated',
			color: 'green',
		});
	};

	const handleClearPrompt = () => {
		form.setFieldValue('agentPrompt', '');
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
				<Stack gap='md'>
					{/* Agent Behavior Section */}
					<Box className={styles.sectionCard}>
						{' '}
						<Select
							label='Agent Behavior'
							description='Select a predefined agent behavior configuration'
							placeholder='Choose an agent behavior'
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
					</Box>

					{/* Basic Configuration Section */}
					<Box className={styles.sectionCard}>
						<div className={styles.sectionHeader}>
							<IconSettings size={20} className={styles.sectionIcon} />
							<h3 className={styles.sectionTitle}>Basic Configuration</h3>
						</div>
						<Text className={styles.sectionDescription}>
							Configure the fundamental settings for your campaign agent
						</Text>

						<Select
							label='Language'
							description="Choose the language for the agent's responses"
							placeholder='Select language'
							data={LANGUAGE_OPTIONS}
							{...form.getInputProps('language')}
							withAsterisk
							searchable
							leftSection={<IconMessageCircle size={16} />}
							className={sharedStyles.field}
						/>

						<Textarea
							label='Agent First Message'
							description='This greeting message will be the first thing users see when they interact with your agent'
							placeholder='Enter the first message your agent will send...'
							{...form.getInputProps('firstMessage')}
							withAsterisk
							minRows={3}
							className={sharedStyles.field}
						/>
					</Box>

					{/* Agent Prompt Section */}
					<Box className={styles.sectionCard}>
						<div className={styles.sectionHeader}>
							<IconBrain size={20} className={styles.sectionIcon} />
							<h3 className={styles.sectionTitle}>Agent Prompt</h3>
						</div>
						<Text className={styles.sectionDescription}>
							Define the core behavior and tone of your AI agent. This prompt
							will guide how the agent speaks, responds, and handles
							conversations within the campaign.
						</Text>

						<Box style={{ position: 'relative' }}>
							<Textarea
								placeholder='**Prompt para el Agente de IA:**'
								{...form.getInputProps('agentPrompt')}
								withAsterisk
								minRows={8}
								className={sharedStyles.field}
							/>
							<div className={styles.promptActions}>
								<ActionIcon
									variant='subtle'
									onClick={handleCopyPrompt}
									title='Copy prompt'
									className={styles.promptActionButton}
								>
									<IconCopy size={16} />
								</ActionIcon>
								<ActionIcon
									variant='subtle'
									onClick={handleEditPrompt}
									title='Edit prompt'
									className={styles.promptActionButton}
								>
									<IconEdit size={16} />
								</ActionIcon>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={handleClearPrompt}
									title='Clear prompt'
									className={styles.promptActionButton}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</div>
						</Box>
					</Box>

					{/* Knowledge Base Section */}
					<Box className={styles.sectionCard}>
						<div className={styles.sectionHeader}>
							<IconDatabase size={20} className={styles.sectionIcon} />
							<h3 className={styles.sectionTitle}>Knowledge Base</h3>
						</div>
						<Text className={styles.sectionDescription}>
							Provide your agent with essential information to handle questions
							accurately and confidently during calls.
						</Text>

						<Box className={styles.knowledgeBaseEmpty}>
							<Text size='sm'>No knowledge bases selected</Text>
						</Box>

						<Button
							leftSection={<IconPlus size={16} />}
							variant='light'
							fullWidth
							className={styles.addKnowledgeBaseButton}
						>
							Add Knowledge Base
						</Button>
					</Box>
				</Stack>

				<Group className={sharedStyles.actions}>
					<Button variant='default' onClick={onBack}>
						Back
					</Button>
					<Button
						type='submit'
						loading={updateCampaign.isPending}
						disabled={!form.isValid()}
					>
						Save & Continue
					</Button>
				</Group>
			</form>

			{/* Prompt Editor Modal */}
			<Modal
				opened={promptEditorOpened}
				onClose={() => setPromptEditorOpened(false)}
				title='Edit Agent Prompt'
				size='xl'
				centered
			>
				<Stack gap='md'>
					<Text size='sm' c='dimmed'>
						Define the core behavior and tone of your AI agent. This prompt will
						guide how the agent speaks, responds, and handles conversations.
					</Text>
					<MDEditor
						value={promptDraft}
						onChange={(value) => setPromptDraft(value || '')}
						preview='edit'
						height={400}
					/>
					<Group justify='flex-end' mt='md'>
						<Button
							variant='default'
							onClick={() => setPromptEditorOpened(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleSavePrompt}>Save Prompt</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};
