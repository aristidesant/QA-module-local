import { ActionIcon, Modal, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import AddNewContactList from '../AddNewContactList';
import SelectActiveContactList from './SelectActiveContactList';
import SectionTitle from '~/components/SectionTitle';
import { SectionCard } from '~/components/SectionCard';
import type ContactGroup from '~/models/ContactGroup';
import BaseTable from '~/components/BaseTable';
import useContactListColumns from './useContactListColumns';
import { useCampaignsStore } from '~/stores/campaignsStore';
import ContactListDetails from '../ContactListDetails';
import { PaginatedResponse } from '~/models/CampaignsModel';
import CapacityProgress from './CapacityProgress';

export interface ContactListViewProps {
	contactGroups?: ContactGroup[] | PaginatedResponse<ContactGroup>;
	campaignId?: string | number;
	onUpdateComplete: () => void;
	objectiveId?: number;
	isActive: boolean;
	isLoading?: boolean;
}

export const ContactListView = ({
	contactGroups,
	campaignId,
	onUpdateComplete,
	objectiveId,
	isActive,
	isLoading = false,
}: ContactListViewProps) => {
	const navigate = useNavigate();
	const [opened, { open, close }] = useDisclosure(false);
	const [inactiveExpanded, { toggle: toggleInactiveExpanded }] =
		useDisclosure(true);
	const { setRightComponent } = useCampaignsStore();

	const columns = useContactListColumns({
		onUpdateComplete,
		objectiveId,
		isActive,
		campaignId,
		onNavigateToContactList: (contactGroup) => {
			const targetCampaignId = campaignId;
			navigate(`/campaign/${targetCampaignId}/contact-list/${contactGroup.id}`);
		},
	});

	const handleClose = () => {
		close();
	};

	const handleRowClick = (contactList: ContactGroup) => {
		setRightComponent(
			<ContactListDetails
				contactGroup={contactList}
				onUpdateComplete={onUpdateComplete}
				objectiveId={objectiveId}
				campaignId={campaignId}
			/>
		);
	};

	const contactListsArray = Array.isArray(contactGroups)
		? contactGroups
		: contactGroups?.data || [];

	const activeCount = contactListsArray.length;

	const title = isActive
		? `Contact lists (${activeCount})`
		: `Inactive Contact Lists (${activeCount})`;
	const description = isActive
		? 'Displaying all active contact lists associated with this campaign.'
		: 'Displaying all inactive contact lists associated with this campaign.';
	const tooltipLabel = isActive
		? 'Add new contact list'
		: 'Add inactive contact list';
	const modalTitle = isActive
		? 'Contact List Configuration'
		: 'Select Active Contact List';
	const modalDescription = isActive
		? 'Browse your existing contact lists or upload a new one to start reaching out.'
		: 'Select an active contact list to add as inactive for this campaign.';
	const emptyMessage = isActive
		? 'No contact lists available'
		: 'No inactive contact lists available';

	if (!isActive && !inactiveExpanded) {
		return (
			<SectionCard
				title={title}
				description={description}
				headerActions={
					<Tooltip label={tooltipLabel}>
						<ActionIcon
							color='blue'
							size='sm'
							variant='light'
							onClick={toggleInactiveExpanded}
							aria-label='Expand inactive contact lists'
						>
							<IconPlus size={18} />
						</ActionIcon>
					</Tooltip>
				}
			/>
		);
	}

	return (
		<SectionCard
			title={title}
			description={description}
			headerActions={
				<Tooltip label={tooltipLabel}>
					<ActionIcon
						color='blue'
						size='sm'
						variant='light'
						onClick={open}
						aria-label={tooltipLabel}
					>
						<IconPlus size={18} />
					</ActionIcon>
				</Tooltip>
			}
		>
			{isActive && <CapacityProgress campaignId={campaignId} />}
			<BaseTable
				data={contactListsArray}
				columns={columns}
				emptyMessage={emptyMessage}
				onRowClick={handleRowClick}
				isLoading={isLoading}
			/>
			<Modal
				opened={opened}
				onClose={handleClose}
				title={
					<>
						<SectionTitle title={modalTitle} description={modalDescription} />
					</>
				}
				size='xl'
				centered
				withCloseButton
				closeOnClickOutside={false}
			>
				{isActive ? (
					<AddNewContactList
						campaignId={campaignId}
						onClose={handleClose}
						onRefresh={onUpdateComplete}
						objectiveId={objectiveId}
					/>
				) : (
					<SelectActiveContactList
						campaignId={campaignId}
						onClose={handleClose}
						onRefresh={onUpdateComplete}
						objectiveId={objectiveId}
					/>
				)}
			</Modal>
		</SectionCard>
	);
};
