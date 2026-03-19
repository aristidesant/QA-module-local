import { useTranslation } from 'react-i18next';
import { Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
	const { t } = useTranslation(['campaign.form.contacts', 'common']);
	const navigate = useNavigate();
	const [opened, { open, close }] = useDisclosure(false);
	const [inactiveExpanded, { toggle: toggleInactiveExpanded }] =
		useDisclosure(true);
	const { openContactListDrawer, selectedContactList } = useCampaignsStore(
		(state) => state
	);
	const { canPerformAction } = usePermissions();

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
		openContactListDrawer(contactList);
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
				padding='md'
				contentSpacing='sm'
				actions={{
					primary:
						isActive &&
						canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE)
							? {
									kind: 'add',
									label: tooltipLabel,
									onClick: () =>
										isCollapsed ? toggleInactiveExpanded() : open(),
									ariaLabel: tooltipLabel,
								}
							: undefined,
					secondary: [
						{
							kind: 'refresh',
							label: t('form.contacts.list.reload'),
							onClick: onUpdateComplete,
							ariaLabel: t('form.contacts.list.reload'),
							disabled: isCollapsed,
						},
					],
				}}
			>
				{!isCollapsed && (
					<>
						<BaseTable
							data={contactListsArray}
							columns={columns}
							emptyMessage={emptyMessage}
							onRowClick={handleRowClick}
							isLoading={isLoading}
							selectedRowId={
								selectedContactList?.isActive === isActive
									? selectedContactList.id
									: undefined
							}
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
