import { Box, Flex, Text, Overlay, Loader, ActionIcon } from '@mantine/core';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import styles from './ContactListItem.module.css';
import { useDeleteContactGroup } from '~/queries/contactGroupQueries';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import SectionTitle from '~/components/SectionTitle';
import ContactLimits from '../ContactLimits';

interface ContactListItemProps {
	contactGroup: ContactGroup;
	onUpdateComplete: () => void;
	withOpenModal?: boolean;
	objectiveId?: number;
	campaignId?: string | number;
}

export function ContactListItem({
	contactGroup,
	onUpdateComplete,
	withOpenModal = true,
	objectiveId,
	campaignId,
}: ContactListItemProps) {
	const deleteSchedulerContactGroup = useDeleteContactGroup();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleDelete = () => {
		modals.openConfirmModal({
			title: 'Delete Contact List',
			children: (
				<Text size='sm'>
					Are you sure you want to delete the contact list "{contactGroup?.name}
					"? This action cannot be undone.
				</Text>
			),
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					setIsUpdating(true);
					await deleteSchedulerContactGroup.mutateAsync(contactGroup.id);
					onUpdateComplete();
				} catch (error) {
					console.error('Failed to delete contact group:', error);
				} finally {
					setIsUpdating(false);
				}
			},
		});
	};

	const handleOpenModal = () => {
		modals.open({
			modalId: 'contact-list-modal',
			title: (
				<SectionTitle
					title='Contact List Configuration'
					description='Browse your existing contact lists or upload a new one to start reaching out.'
				/>
			),
			children: (
				<ContactLimits
					contactGroup={contactGroup}
					onComplete={() => {
						onUpdateComplete();
						modals.close('contact-list-modal');
					}}
					objectiveId={objectiveId}
					campaignId={campaignId}
				/>
			),
			size: 'xl',
			centered: true,
			withCloseButton: true,
			closeOnClickOutside: false,
		});
	};

	return (
		<Box className={styles.contactItem} pos='relative'>
			{isUpdating && (
				<Overlay
					color='#fff'
					backgroundOpacity={0.7}
					blur={1}
					radius='md'
					center
				>
					<Loader size='sm' />
				</Overlay>
			)}
			<Flex
				align='center'
				justify='space-between'
				w='100%'
				opacity={isUpdating ? 0.6 : 1}
			>
				<Flex gap={'xs'} align={'center'}>
					<Flex direction={'column'}>
						<Text fz='xs' c='dimmed'>
							Contact list
						</Text>
						<Text fw={500} mb={4}>
							{contactGroup?.name}
						</Text>
					</Flex>
				</Flex>
				<Flex align='center' gap={'xs'} c='dimmed'>
					{withOpenModal && (
						<ActionIcon
							title='Edit contact list'
							variant='subtle'
							size='xs'
							c='blue'
							onClick={(e) => {
								e.stopPropagation();
								handleOpenModal();
							}}
						>
							<IconEdit size={16} />
						</ActionIcon>
					)}
					<ActionIcon
						title='Delete this contact list'
						variant='subtle'
						size='xs'
						c='red'
						onClick={(e) => {
							e.stopPropagation();
							handleDelete();
						}}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Flex>
			</Flex>
		</Box>
	);
}

export default ContactListItem;
