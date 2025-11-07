import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactListView } from './ContactListView';
import { useGetContactGroups } from '~/queries/contactGroupQueries';

interface ContactListContainerProps {
	isActive: boolean;
}

export const ContactListContainer = ({
	isActive,
}: ContactListContainerProps) => {
	const { selectedCampaign } = useCampaignsStore();

	const {
		data: contactList,
		refetch: reloadCampaignSchedules,
		isLoading,
		isRefetching,
	} = useGetContactGroups({
		campaignId: selectedCampaign?.id,
		isActive,
	});

	return (
		<ContactListView
			key={`contact-list-${isActive}-${selectedCampaign?.id}`}
			contactGroups={contactList}
			campaignId={selectedCampaign?.id}
			onUpdateComplete={reloadCampaignSchedules}
			objectiveId={selectedCampaign?.objectiveId}
			isActive={isActive}
			isLoading={isLoading || isRefetching}
		/>
	);
};
