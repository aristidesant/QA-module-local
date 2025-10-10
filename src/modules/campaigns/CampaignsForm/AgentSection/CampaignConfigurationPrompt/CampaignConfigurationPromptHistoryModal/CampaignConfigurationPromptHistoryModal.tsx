// CampaignConfigurationPromptHistoryModal.tsx
import React from 'react';
import { Modal } from '@mantine/core';
import CampaignPromptHistory from '~/modules/campaigns/CampaignPromptHistory';

interface CampaignConfigurationPromptHistoryModalProps {
	opened: boolean;
	onClose: () => void;
	campaignId: number;
	onSelect: (selectedPrompt: string) => void;
}

const CampaignConfigurationPromptHistoryModal: React.FC<
	CampaignConfigurationPromptHistoryModalProps
> = ({ opened, onClose, campaignId, onSelect }) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Restore Prompt from History'
			size='80%'
			centered
		>
			<CampaignPromptHistory campaignId={campaignId} onSelect={onSelect} />
		</Modal>
	);
};

export default CampaignConfigurationPromptHistoryModal;
