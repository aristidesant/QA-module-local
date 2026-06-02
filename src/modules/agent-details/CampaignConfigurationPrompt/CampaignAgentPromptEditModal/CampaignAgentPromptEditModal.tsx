import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { useAgentConfigFormContext } from '../../../campaigns/campaignFormFunctions';
import PromptEditModal from '../../../campaigns/CampaignsForm/components/PromptEditModal';

interface CampaignAgentPromptEditModalProps {
	opened: boolean;
	onClose: () => void;
}

const CampaignAgentPromptEditModal: React.FC<
	CampaignAgentPromptEditModalProps
> = ({ opened, onClose }) => {
	const { campaignId: routeCampaignId } = useParams();
	const form = useAgentConfigFormContext();
	const campaignId = Number(routeCampaignId) || 0;
	const currentPrompt =
		form.values.conversationConfig?.agent?.prompt?.prompt || '';

	const handleSave = useCallback(
		(value: string) => {
			form.setFieldValue('conversationConfig.agent.prompt.prompt', value);
		},
		[form]
	);

	return (
		<PromptEditModal
			opened={opened}
			onClose={onClose}
			value={currentPrompt}
			onSave={handleSave}
			campaignId={campaignId}
		/>
	);
};

export default CampaignAgentPromptEditModal;
