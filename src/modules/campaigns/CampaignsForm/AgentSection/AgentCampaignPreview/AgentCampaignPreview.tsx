import React from 'react';
import { Group, Loader, Tooltip, ActionIcon } from '@mantine/core';
import { IconEdit, IconWaveSquare, IconUser } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useGetAgent } from '~/queries/agentQueries';
import styles from './AgentCampaignPreview.module.css';
import AgentProfile from '~/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignPreview/AgentProfile';
import { VoicePlayer } from '~/components/VoicePlayer';
import AgentVoiceEditModal from './AgentVoiceEditModal';
import RightSectionCard from '~/components/RightSectionCard';

interface AgentCampaignPreviewProps {
	agentId: string;
	campaignAgentId: number;
	campaignId: number;
}

export const AgentCampaignPreview: React.FC<AgentCampaignPreviewProps> = ({
	agentId,
}) => {
	const { data: agent, isLoading, refetch } = useGetAgent(agentId);

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
				</>
			)}
		</div>
	);
};

export default AgentCampaignPreview;
