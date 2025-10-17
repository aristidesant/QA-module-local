import React from 'react';
import { Text, Group, Loader, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useCampaignsStore } from '~/stores/campaignsStore';
import AgentCampaignList from '../AgentCampaignList';
import { useGetAgent } from '~/queries/agentQueries';
import styles from './AgentCampaignPreview.module.css';
import { openConfirmModal } from '@mantine/modals';
import AgentProfile from '~/modules/agents/AgentSimpleDetails/AgentProfile';
import { useDeleteCampaignAgent } from '~/queries/campaignAgentsQueries';
import { VoicePlayer } from '~/components/VoicePlayer';

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
	const { data: agent, isLoading } = useGetAgent(agentId);
	const deleteMutation = useDeleteCampaignAgent();

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
						<AgentProfile
							agent={agent}
							traits={['Warm', 'Playful']}
							size='md'
						/>
						<VoicePlayer
							voiceName={agent.voice?.name || 'Unknown'}
							previewUrl={agent.voice?.previewUrl}
						/>
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
