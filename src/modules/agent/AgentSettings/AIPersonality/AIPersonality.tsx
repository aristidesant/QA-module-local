// Refactored per requirements
import React, { useCallback, useState } from 'react';
import { Textarea, ActionIcon, rem, Box, Flex, Modal } from '@mantine/core';
import {
	IconBrain,
	IconHistory,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react';
import type { AgentConfigModel } from '~/models/AgentListObject';
import SectionCard from '../../../../components/SectionCard';
import styles from './AIPersonality.module.css';
import { AIPersonalityEditModal } from './index';
import { useCampaignsStore } from '~/stores/campaignsStore';
import CampaignPromptHistory from '~/modules/campaigns/CampaignPromptHistory';

interface AIPersonalityProps {
	agentData: Partial<AgentConfigModel>;
	campaignId?: number;
	onUpdateAgentData: (updatedFields: any) => void;
}

const AIPersonality: React.FC<AIPersonalityProps> = ({
	agentData,
	campaignId,
	onUpdateAgentData,
}) => {
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [restoreModalOpen, setRestoreModalOpen] = useState(false);

	const prompt = agentData?.conversationConfig?.agent?.prompt?.prompt || '';
	const contactSchemaId = (agentData as any)?.contactSchemaId;
	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	const onSelect = useCallback(
		(selectedPrompt: string) => {
			onUpdateAgentData({
				conversationConfig: {
					...(agentData?.conversationConfig || {}),
					agent: {
						...(agentData?.conversationConfig?.agent || {}),
						prompt: {
							...(agentData?.conversationConfig?.agent?.prompt || {}),
							prompt: selectedPrompt,
						},
					},
				},
			});
			setRestoreModalOpen(false);
		},
		[agentData, onUpdateAgentData]
	);
	const handleEdit = useCallback(() => {
		setEditModalOpen(true);
	}, []);
	const handleRemove = useCallback(() => {
		onUpdateAgentData({
			conversationConfig: {
				...(agentData?.conversationConfig || {}),
				agent: {
					...(agentData?.conversationConfig?.agent || {}),
					prompt: {
						...(agentData?.conversationConfig?.agent?.prompt || {}),
						prompt: '',
					},
				},
			},
		});
	}, [agentData, onUpdateAgentData]);
	const handleRestorePrompt = useCallback(() => {
		if (!selectedCampaign?.id) return;

		setRestoreModalOpen(true);
	}, [selectedCampaign]);
	return (
		<>
			<SectionCard
				icon={IconBrain}
				title='AgentPrompt'
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
							aria-label='Edit'
							color='dark'
							flex={1}
							w={rem(60)}
							className={styles.editButton}
							onClick={handleRestorePrompt}
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
				<AIPersonalityEditModal
					initialPrompt={prompt}
					campaignId={campaignId || selectedCampaign?.id}
					initialSchemaId={contactSchemaId}
					onClose={() => setEditModalOpen(false)}
					onSave={(newPrompt, schemaId) => {
						onUpdateAgentData({
							conversationConfig: {
								...(agentData?.conversationConfig || {}),
								agent: {
									...(agentData?.conversationConfig?.agent || {}),
									prompt: {
										...(agentData?.conversationConfig?.agent?.prompt || {}),
										prompt: newPrompt,
									},
								},
							},
							contactSchemaId: schemaId,
						});
						setEditModalOpen(false);
					}}
				/>
			</Modal>
			<Modal
				opened={restoreModalOpen}
				onClose={() => setRestoreModalOpen(false)}
				title='Restore Prompt from History'
				size='80%'
				centered
			>
				<CampaignPromptHistory
					campaignId={selectedCampaign?.id || 0}
					onSelect={onSelect}
				/>
			</Modal>
		</>
	);
};

export default AIPersonality;
