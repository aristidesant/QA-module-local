import { useTranslation } from 'react-i18next';
import { Modal, Stack, Group, Text, ThemeIcon } from '@mantine/core';
import { IconList, IconUsers } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import AddNewContactList from '../AddNewContactList';
import SelectActiveContactList from './SelectActiveContactList';
import { SectionCard } from '~/components/SectionCard';
import type ContactGroup from '~/models/ContactGroup';
import BaseTable from '~/components/BaseTable';
import useContactListColumns from './useContactListColumns';
import { PaginatedResponse } from '~/models/CampaignsModel';
import CapacityProgress from './CapacityProgress';
import styles from './ContactListView.module.css';

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
	const { t } = useTranslation(['campaign.form.contacts', 'common']);
	const navigate = useNavigate();
	const [opened, { open, close }] = useDisclosure(false);
	const { canPerformAction } = usePermissions();

	const columns = useContactListColumns({
		onUpdateComplete,
		objectiveId,
		isActive,
		campaignId,
	});

	const data = Array.isArray(contactGroups)
		? contactGroups
		: (contactGroups?.data ?? []);
	const count = data.length;

	const labels = isActive
		? {
				title: t('form.contacts.list.activeTitle'),
				description: t('form.contacts.list.activeDescription'),
				addLabel: t('form.contacts.list.addNewContactList'),
				modalTitle: t('form.contacts.list.configuration'),
				modalIcon: IconList,
				emptyMessage: t('form.contacts.list.emptyMessage'),
			}
		: {
				title: t('form.contacts.list.inactiveTitle'),
				description: t('form.contacts.list.inactiveDescription'),
				addLabel: t('form.contacts.list.addInactiveContactList'),
				modalTitle: t('form.contacts.list.selectActive'),
				modalIcon: IconUsers,
				emptyMessage: t('form.contacts.list.emptyInactiveMessage'),
			};

	return (
		<Stack>
			{isActive && <CapacityProgress campaignId={campaignId} />}
			<SectionCard
				title={
					<>
						{labels.title} ({count}){' '}
					</>
				}
				description={labels.description}
				padding='md'
				contentSpacing='sm'
				actions={{
					primary:
						isActive &&
						canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.CREATE)
							? {
									kind: 'add',
									label: labels.addLabel,
									onClick: open,
									ariaLabel: labels.addLabel,
								}
							: undefined,
					secondary: [
						{
							kind: 'refresh',
							label: t('form.contacts.list.reload'),
							onClick: onUpdateComplete,
							ariaLabel: t('form.contacts.list.reload'),
						},
					],
				}}
			>
				<BaseTable
					data={data}
					columns={columns}
					emptyMessage={labels.emptyMessage}
					onRowClick={(contactGroup) => {
						if (!campaignId) {
							return;
						}
						navigate(`/campaign/${campaignId}/contact-list/${contactGroup.id}`);
					}}
					isLoading={isLoading}
					getRowId={(row) => row.id}
					getRowClassName={(row) =>
						row.original.isTest ? styles.testRow : undefined
					}
				/>
				<Modal
					opened={opened}
					onClose={close}
					title={
						<Group gap='xs' align='center'>
							<ThemeIcon variant='light' color='blue' size={28} radius='md'>
								<labels.modalIcon size={15} />
							</ThemeIcon>
							<Text fw={600} size='sm'>
								{labels.modalTitle}
							</Text>
						</Group>
					}
					size='xl'
					centered
					withCloseButton
					closeOnClickOutside={false}
				>
					{isActive ? (
						<AddNewContactList
							campaignId={campaignId}
							onClose={close}
							onRefresh={onUpdateComplete}
							objectiveId={objectiveId}
						/>
					) : (
						<SelectActiveContactList
							campaignId={campaignId}
							onClose={close}
							onRefresh={onUpdateComplete}
							objectiveId={objectiveId}
						/>
					)}
				</Modal>
			</SectionCard>
		</Stack>
	);
};
