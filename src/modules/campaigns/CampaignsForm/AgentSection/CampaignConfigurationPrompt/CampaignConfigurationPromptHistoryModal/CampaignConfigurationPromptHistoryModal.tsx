// CampaignConfigurationPromptHistoryModal.tsx
import React from 'react';
import { Modal } from '@mantine/core';
import CampaignPromptHistory from '~/modules/campaigns/CampaignPromptHistory';

interface CampaignConfigurationPromptHistoryModalProps {
	opened: boolean;
	onClose: () => void;
	campaignId: number;
	campaignPromptTypeId?: number;
	currentPromptText?: string;
	onSelect: (selectedPrompt: string) => void;
}

const CampaignConfigurationPromptHistoryModal: React.FC<
	CampaignConfigurationPromptHistoryModalProps
> = ({
	opened,
	onClose,
	campaignId,
	campaignPromptTypeId,
	currentPromptText,
	onSelect,
}) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Restore Prompt from History'
			size='90%'
			centered
		>
			<CampaignPromptHistory
				campaignId={campaignId}
				campaignPromptTypeId={campaignPromptTypeId}
				currentPromptText={currentPromptText}
				onSelect={onSelect}
			/>
		</Modal>
	);
};

export default CampaignConfigurationPromptHistoryModal;
