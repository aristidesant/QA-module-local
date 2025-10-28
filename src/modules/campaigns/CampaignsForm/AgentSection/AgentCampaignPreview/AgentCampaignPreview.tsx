import React from 'react';
import {
	Text,
	Group,
	Loader,
	Button,
	Tooltip,
	ActionIcon,
} from '@mantine/core';
import {
	IconTrash,
	IconEdit,
	IconWaveSquare,
	IconUser,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useCampaignsStore } from '~/stores/campaignsStore';
import AgentCampaignList from '../AgentCampaignList';
import { useGetAgent } from '~/queries/agentQueries';
import styles from './AgentCampaignPreview.module.css';
import { openConfirmModal } from '@mantine/modals';
import AgentProfile from '~/modules/agents/AgentSimpleDetails/AgentProfile';
import { useDeleteCampaignAgent } from '~/queries/campaignAgentsQueries';
import { VoicePlayer } from '~/components/VoicePlayer';
import AgentVoiceEditModal from './AgentVoiceEditModal';
import RightSectionCard from '~/components/RightSectionCard';
import ActionButton from '~/components/ActionButton';

interface AgentCampaignPreviewProps {
	agentId: string;
	campaignAgentId: number;
	campaignId: number;
}

export const AgentCampaignPreview: React.FC<AgentCampaignPreviewProps> = ({
	agentId,
	campaignAgentId,
	campaignId,
}) => {
	const { setRightComponent } = useCampaignsStore();
	const { data: agent, isLoading, refetch } = useGetAgent(agentId);
	const deleteMutation = useDeleteCampaignAgent();

	const openVoiceChangeModal = () => {
		const currentVoiceId =
			agent?.config?.conversationConfig?.tts?.voiceId || agent?.voice?.id || '';

		modals.open({
			modalId: 'agent-voice-edit-modal',
			title: 'Change Agent Voice',
			size: 'xl',
			centered: true,
			children: (
				<AgentVoiceEditModal
					agentId={agentId}
					currentVoiceId={currentVoiceId}
					onClose={() => modals.close('agent-voice-edit-modal')}
					onSuccess={() => {
						refetch();
					}}
				/>
			),
		});
	};

	const handleDelete = () => {
		openConfirmModal({
			title: 'Remove Agent from campaign',
			centered: true,
			children: (
				<Text size='sm'>
					Are you sure you want to remove this agent from the campaign? This
					action cannot be undone.
				</Text>
			),
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: () => {
				deleteMutation.mutate(
					{ campaignId, id: campaignAgentId },
					{
						onSuccess: () => {
							setRightComponent?.(<AgentCampaignList />);
						},
					}
				);
			},
		});
	};

	return (
		<div>
			{isLoading || !agent ? (
				<Group justify='center' align='center' style={{ minHeight: 200 }}>
					<Loader />
				</Group>
			) : (
				<>
					<div className={styles.agentDetails}>
						<RightSectionCard
							icon={IconUser}
							title='Agent Profile'
							description='Agent avatar, name, and language details'
						>
							<AgentProfile agent={agent} size='md' />
						</RightSectionCard>

						{/* Voice Section */}
						<div className={styles.voiceSection}>
							<RightSectionCard
								title='Voice settings'
								description='Preview and update the agent voice for this campaign.'
								icon={IconWaveSquare}
								iconColor='var(--mantine-color-blue-6)'
								rightSection={
									<Tooltip
										label='Edit agent voice'
										position='right'
										withArrow
										openDelay={150}
									>
										<ActionIcon
											aria-label='Edit agent voice'
											onClick={openVoiceChangeModal}
											variant='subtle'
											size='lg'
										>
											<IconEdit size={16} />
										</ActionIcon>
									</Tooltip>
								}
							>
								<VoicePlayer
									voiceName={agent?.voice?.name || 'Unknown'}
									previewUrl={agent?.voice?.previewUrl}
								/>
							</RightSectionCard>
						</div>
					</div>
					{/* Quick Actions */}
					<div className={styles.quickActions}>
						<Text fw={600} size='sm' mb={4}>
							Quick actions
						</Text>
						<Button
							onClick={handleDelete}
							color='red'
							fullWidth
							variant='light'
							leftSection={<IconTrash size={18} />}
							disabled={deleteMutation.isPending}
						>
							Remove Agent from campaign
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default AgentCampaignPreview;
