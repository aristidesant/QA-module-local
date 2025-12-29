import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Modal, Tooltip, Group, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
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
	isRefetching?: boolean;
}

export const ContactListView = ({
	contactGroups,
	campaignId,
	onUpdateComplete,
	objectiveId,
	isActive,
	isLoading = false,
}: ContactListViewProps) => {
	const { t } = useTranslation('campaigns');
	const navigate = useNavigate();
	const [opened, { open, close }] = useDisclosure(false);
	const [inactiveExpanded, { toggle: toggleInactiveExpanded }] =
		useDisclosure(true);
	const { setRightComponent } = useCampaignsStore();
	const { canPerformAction } = usePermissions();
	const [selectedContactListId, setSelectedContactListId] = useState<
		number | null
	>(null);

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
		setSelectedContactListId(contactList.id);
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

	const title = (
		<>
			{isActive
				? t('form.contacts.list.activeTitle')
				: t('form.contacts.list.inactiveTitle')}{' '}
			({activeCount}){' '}
		</>
	);
	const description = isActive
		? t('form.contacts.list.activeDescription')
		: t('form.contacts.list.inactiveDescription');
	const tooltipLabel = isActive
		? t('form.contacts.list.addNewContactList')
		: t('form.contacts.list.addInactiveContactList');
	const modalTitle = isActive
		? t('form.contacts.list.configuration')
		: t('form.contacts.list.selectActive');
	const modalDescription = isActive
		? t('form.contacts.list.configurationDescription')
		: t('form.contacts.list.selectActiveDescription');
	const emptyMessage = isActive
		? t('form.contacts.list.emptyMessage')
		: t('form.contacts.list.emptyInactiveMessage');

	const isCollapsed = !isActive && !inactiveExpanded;

	return (
		<Stack>
			{isActive && <CapacityProgress campaignId={campaignId} />}
			<SectionCard
				title={title}
				description={description}
				headerActions={
					<Group gap='xs'>
						<Tooltip label={t('form.contacts.list.reload')}>
							<ActionIcon
								color='gray'
								size='sm'
								variant='light'
								onClick={onUpdateComplete}
								aria-label={t('form.contacts.list.reload')}
								disabled={isCollapsed}
								title={
									isCollapsed
										? t('form.contacts.list.reloadUnavailable')
										: t('form.contacts.list.reload')
								}
							>
								<IconRefresh size={18} />
							</ActionIcon>
						</Tooltip>
						{isActive &&
							canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE) && (
								<Tooltip label={tooltipLabel}>
									<ActionIcon
										color='blue'
										size='sm'
										variant='light'
										onClick={() =>
											isCollapsed ? toggleInactiveExpanded() : open()
										}
										aria-label={tooltipLabel}
										data-testid='header-add-contact-list-btn'
									>
										<IconPlus size={18} />
									</ActionIcon>
								</Tooltip>
							)}
					</Group>
				}
			>
				{!isCollapsed && (
					<>
						<BaseTable
							data={contactListsArray}
							columns={columns}
							emptyMessage={emptyMessage}
							onRowClick={handleRowClick}
							isLoading={isLoading}
							selectedRowId={selectedContactListId}
							getRowId={(row) => row.id}
						/>
						<Modal
							opened={opened}
							onClose={handleClose}
							title={
								<>
									<SectionTitle
										title={modalTitle}
										description={modalDescription}
									/>
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
					</>
				)}
			</SectionCard>
		</Stack>
	);
};
