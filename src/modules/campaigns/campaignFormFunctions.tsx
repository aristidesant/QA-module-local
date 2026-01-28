import { createFormContext } from '@mantine/form';
import { createContext, useContext } from 'react';
import type { Campaign } from '~/models/CampaignsModel';

export const [CampaignFormProvider, useCampaignFormContext, useCampaignForm] =
	createFormContext<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>();

// Context for campaign ID (needed for components that need to fetch related data)
export const CampaignIdContext = createContext<number | undefined>(undefined);

export const useCampaignId = () => {
	const campaignId = useContext(CampaignIdContext);
	return campaignId;
};
