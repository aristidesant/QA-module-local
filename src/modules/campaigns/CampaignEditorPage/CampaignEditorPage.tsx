import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { CampaignsForm } from '../CampaignsForm/CampaignsForm';
import { useCampaignsStore } from '~/stores/campaignsStore';
import type { Campaign } from '~/models/CampaignsModel';

const CampaignEditorPage = () => {
	const navigate = useNavigate();
	const campaign = useOutletContext<Campaign>();

	const setEditCampaign = useCampaignsStore((state) => state.setEditCampaign);
	const setSelectedTab = useCampaignsStore((state) => state.setSelectedTab);

	useEffect(() => {
		setEditCampaign(true);
		setSelectedTab('agents');

		return () => {
			setEditCampaign(false);
		};
	}, [setEditCampaign, setSelectedTab]);

	return (
		<CampaignsForm
			campaign={campaign}
			onBack={() => {
				navigate('/campaigns');
			}}
		/>
	);
};

export default CampaignEditorPage;
