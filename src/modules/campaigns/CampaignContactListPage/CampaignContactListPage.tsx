import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Flex, Loader } from '@mantine/core';
import { IconAlertCircle, IconUsers } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	useGetContactGroup,
	useGetGroupContacts,
} from '~/queries/contactGroupQueries';
import ContactGroupSummary from './ContactGroupSummary';
import ContactGroupContactsTable from './ContactGroupContactsTable';

const CampaignContactListPage = () => {
	const navigate = useNavigate();
	const { contactGroupId } = useParams<{ contactGroupId: string }>();

	const contactGroupIdNumber = useMemo(() => {
		if (!contactGroupId) {
			return Number.NaN;
		}
		const parsed = Number.parseInt(contactGroupId, 10);
		return Number.isNaN(parsed) ? Number.NaN : parsed;
	}, [contactGroupId]);

	const contactGroupQuery = useGetContactGroup(
		Number.isNaN(contactGroupIdNumber) ? 0 : contactGroupIdNumber
	);

	const groupContactsQuery = useGetGroupContacts(
		Number.isNaN(contactGroupIdNumber) ? 0 : contactGroupIdNumber
	);

	const isLoading =
		contactGroupQuery.isLoading ||
		(groupContactsQuery.isLoading && !contactGroupQuery.isError);
	const hasInvalidId = Number.isNaN(contactGroupIdNumber);

	if (hasInvalidId) {
		return (
			<ContentContainer
				title='Invalid Contact List'
				description='Please verify the contact list identifier and try again.'
				showBackButton
				onBackClick={() => navigate('/campaign/47')}
			>
				<Alert
					icon={<IconAlertCircle size={18} />}
					title='Invalid identifier'
					color='red'
					variant='light'
				>
					The provided contact list identifier is not valid.
				</Alert>
			</ContentContainer>
		);
	}

	if (isLoading) {
		return (
			<ContentContainer
				title='Loading Contact List'
				description='Fetching the latest information for this contact list.'
				showBackButton
				onBackClick={() => navigate('/campaign/47')}
			>
				<Flex justify='center' align='center' style={{ minHeight: '320px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	if (contactGroupQuery.isError || !contactGroupQuery.data) {
		return (
			<ContentContainer
				title='Contact List Unavailable'
				description='We could not load this contact list at the moment.'
				showBackButton
				onBackClick={() => navigate('/campaign/47')}
			>
				<Alert
					icon={<IconAlertCircle size={18} />}
					title='Error loading contact list'
					color='red'
					variant='light'
				>
					{contactGroupQuery.error instanceof Error
						? contactGroupQuery.error.message
						: 'An unexpected error occurred while loading the contact list.'}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			title={contactGroupQuery.data.name}
			description='Review and manage the contacts associated with this list.'
			showBackButton
			onBackClick={() => navigate('/campaign/47')}
			rightSection={
				<ContactGroupSummary contactGroup={contactGroupQuery.data} />
			}
		>
			<SectionCard
				title='Contacts'
				description='All contacts associated with this list.'
				headerActions={<IconUsers size={18} aria-hidden='true' />}
			>
				<ContactGroupContactsTable
					contacts={groupContactsQuery.data ?? []}
					isLoading={groupContactsQuery.isLoading}
					error={
						groupContactsQuery.isError
							? groupContactsQuery.error instanceof Error
								? groupContactsQuery.error.message
								: 'Unable to load contacts for this list.'
							: undefined
					}
				/>
			</SectionCard>
		</ContentContainer>
	);
};

export default CampaignContactListPage;
