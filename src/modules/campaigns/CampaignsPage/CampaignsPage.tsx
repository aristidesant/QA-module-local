import CampaignsList from '../CampaignsList';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { Campaign } from '~/models/CampaignsModel';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CampaignsPage() {
	useTranslation(['campaigns', 'campaign.detail']);

	const { selectedCampaign, editCampaign, resetView, selectCampaign } =
		useCampaignsStore((state) => state);

	const { data: campaign } = useGetCampaign(
		selectedCampaign?.id ? `${selectedCampaign.id}` : ''
	);

	// Sync fetched campaign into the store when it changes.
	// Only apply if there is no selection yet or it matches the current selected id
	useEffect(() => {
		if (!campaign) return;
		if (!selectedCampaign || selectedCampaign.id === campaign.id) {
			selectCampaign(campaign as Campaign);
		}
	}, [campaign, selectedCampaign?.id, selectCampaign]);

	useEffect(() => {
		return () => {
			resetView();
		};
	}, []);

	// Show campaign form if editing, otherwise show campaign list
	if (editCampaign && campaign) {
		return <CampaignsForm campaign={campaign as Campaign} />;
	}

	return <CampaignsList />;
}
