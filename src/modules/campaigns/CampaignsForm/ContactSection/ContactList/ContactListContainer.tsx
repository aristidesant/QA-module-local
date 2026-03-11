import { useEffect } from 'react';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactListView } from './ContactListView';
import { useGetContactGroups } from '~/queries/contactGroupQueries';

interface ContactListContainerProps {
	isActive: boolean;
}

export const ContactListContainer = ({
	isActive,
}: ContactListContainerProps) => {
	const {
		selectedCampaign,
		selectedContactList,
		setSelectedContactList,
		closeContactListDrawer,
	} = useCampaignsStore((state) => state);

	const {
		data: contactList,
		refetch: reloadCampaignSchedules,
		isLoading,
		isRefetching,
	} = useGetContactGroups({
		campaignId: selectedCampaign?.id,
		isActive,
	});

	useEffect(() => {
		if (!selectedContactList || selectedContactList.isActive !== isActive) {
			return;
		}

		const contactListsArray = contactList?.data || [];
		const refreshedContactList = contactListsArray.find(
			(contactGroup) => contactGroup.id === selectedContactList.id
		);

		if (!refreshedContactList) {
			closeContactListDrawer();
			return;
		}

		if (refreshedContactList !== selectedContactList) {
			setSelectedContactList(refreshedContactList);
		}
	}, [
		closeContactListDrawer,
		contactList?.data,
		isActive,
		selectedContactList,
		setSelectedContactList,
	]);

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
