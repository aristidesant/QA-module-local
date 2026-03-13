import React from 'react';
import { Group, Loader } from '@mantine/core';
import { IconEdit, IconWaveSquare } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useGetAgent } from '~/queries/agentQueries';
import { VoicePlayer } from '~/components/VoicePlayer';
import AgentVoiceEditModal from './AgentVoiceEditModal';
import RightSectionCard from '~/components/RightSectionCard';
import { useTranslation } from 'react-i18next';

interface AgentCampaignPreviewProps {
	agentId: string;
	campaignAgentId: number;
	campaignId: number;
}

export const AgentCampaignPreview: React.FC<AgentCampaignPreviewProps> = ({
	agentId,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const { data: agent, isLoading, refetch } = useGetAgent(agentId);

	const openVoiceChangeModal = () => {
		const currentVoiceId =
			agent?.config?.conversationConfig?.tts?.voiceId || agent?.voice?.id || '';

		modals.open({
			modalId: 'agent-voice-edit-modal',
			title: t('form.agent.preview.changeVoiceTitle'),
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

	if (isLoading || !agent) {
		return (
			<Group justify='center' align='center' style={{ minHeight: 80 }}>
				<Loader size='xs' />
			</Group>
		);
	}

	return (
		<RightSectionCard
			title={t('form.agent.preview.voiceTitle')}
			description={t('form.agent.preview.voiceDescription')}
			icon={IconWaveSquare}
			iconColor='var(--mantine-color-blue-6)'
			actions={{
				primary: {
					kind: 'edit',
					label: t('form.agent.preview.editVoice'),
					icon: IconEdit,
					onClick: openVoiceChangeModal,
				},
			}}
		>
			<VoicePlayer
				voiceName={agent?.voice?.name || t('form.agent.preview.unknownVoice')}
				previewUrl={agent?.voice?.previewUrl}
			/>
		</RightSectionCard>
	);
};

export default AgentCampaignPreview;
