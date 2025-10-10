// CampaignConfigurationPrompt.tsx
import React, { useCallback, useState } from 'react';
import { Textarea, ActionIcon, rem, Box, Flex, Modal } from '@mantine/core';
import {
	IconBrain,
	IconHistory,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import styles from './CampaignConfigurationPrompt.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import CampaignConfigurationPromptHistoryModal from './CampaignConfigurationPromptHistoryModal';
import CampaignConfigurationPromptEditModal from './CampaignConfigurationPromptEditModal';

const CampaignConfigurationPrompt: React.FC = () => {
	const form = useCampaignFormContext();
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [restoreModalOpen, setRestoreModalOpen] = useState(false);

	const prompt =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.prompt || '';
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
	const campaignId = selectedCampaign?.id || 0;

	const onSelect = useCallback(
		(selectedPrompt: string) => {
			form.setFieldValue(
				'agentConfig.conversationConfig.agent.prompt.prompt',
				selectedPrompt
			);
			setRestoreModalOpen(false);
		},
		[form]
	);
	const handleEdit = useCallback(() => {
		setEditModalOpen(true);
	}, []);
	const handleRemove = useCallback(() => {
		form.setFieldValue(
			'agentConfig.conversationConfig.agent.prompt.prompt',
			''
		);
	}, [form]);
	const handleRestorePrompt = useCallback(() => {
		if (!campaignId) return;
		setRestoreModalOpen(true);
	}, [campaignId]);

	return (
		<>
			<SectionCard
				icon={IconBrain}
				title='Agent Prompt'
				description='Define the core behavior and tone of your AI agent. This prompt will guide how the agent speaks, responds, and handles conversations within the campaign.'
				className={styles.sectionCard}
				contentSpacing='lg'
			>
				<Flex gap='xs'>
					<Box className={styles.promptCol}>
						<Textarea
							value={prompt}
							readOnly
							disabled
							rows={7}
							className={styles.promptTextarea}
						/>
					</Box>
					<Flex gap={'xs'} direction={'column'} component='div'>
						<ActionIcon
							variant='light'
							aria-label='Restore from History'
							color='dark'
							flex={1}
							w={rem(60)}
							className={styles.editButton}
							onClick={handleRestorePrompt}
							disabled={!selectedCampaign?.id}
						>
							<IconHistory size={20} />
						</ActionIcon>
						<ActionIcon
							variant='light'
							aria-label='Edit'
							color='dark'
							onClick={handleEdit}
							flex={1}
							className={styles.editButton}
							w={rem(60)}
						>
							<IconPencil size={20} />
						</ActionIcon>
						<ActionIcon
							variant='light'
							color='red'
							flex={1}
							w={rem(60)}
							className={styles.removeButton}
							aria-label='Remove'
							onClick={handleRemove}
						>
							<IconTrash size={20} />
						</ActionIcon>
					</Flex>
				</Flex>
			</SectionCard>
			<Modal
				opened={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				withCloseButton={false}
				centered
				fullScreen
				padding={0}
				radius={0}
			>
				<CampaignConfigurationPromptEditModal
					initialPrompt={prompt}
					onClose={() => setEditModalOpen(false)}
					onSave={(newPrompt: string) => {
						form.setFieldValue(
							'agentConfig.conversationConfig.agent.prompt.prompt',
							newPrompt
						);
						setEditModalOpen(false);
					}}
				/>
			</Modal>
			<CampaignConfigurationPromptHistoryModal
				opened={restoreModalOpen}
				onClose={() => setRestoreModalOpen(false)}
				campaignId={campaignId}
				onSelect={onSelect}
			/>
		</>
	);
};

export default CampaignConfigurationPrompt;
