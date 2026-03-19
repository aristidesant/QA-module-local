import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Breadcrumbs,
	Anchor,
	Button,
	Flex,
	Loader,
	Stack,
	Tabs,
	Text,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconArrowLeft,
	IconInfoCircle,
	IconMessage,
	IconRefresh,
	IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import AppDrawer from '~/components/AppDrawer';
import EmptyState from '~/components/EmptyState';
import { useGetContactGroup } from '~/queries/contactGroupQueries';
import { useGetCampaign } from '~/queries/campaignsQueries';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { getErrorMessage } from '~/utils/httpClient';
import ContactGroupContactsTable from './ContactGroupContactsTable';
import ContactListInformation from './ContactListInformation';
import ContactListMetrics from './ContactListMetrics';
import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import FaultyPhonesAlert from './ContactGroupContactsTable/FaultyPhonesAlert';
import { getTranslatedQueueStatus } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactList/queueStatusConfig';
import { timeAgo } from '~/utils/dateUtils';
import { ContactDetails } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactDetails';
import type { Contact } from '~/models/ContactsModel';

type ContactDetailsData = ComponentProps<typeof ContactDetails>['contact'];

const getContactInitials = (firstName: string, lastName: string) => {
	const firstInitial = firstName?.charAt(0) || '';
	const lastInitial = lastName?.charAt(0) || '';
	return `${firstInitial}${lastInitial}`.toUpperCase() || '??';
};

const mapContactToDetails = (
	contact: Contact,
	t: (key: string) => string
): ContactDetailsData => {
	const primaryPhone = contact.phoneNumbers?.[0]?.phoneNumber || '';
	const primaryEmail = contact.emails?.[0] || '';

	return {
		id: contact.id.toString(),
		name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
		phone: primaryPhone,
		email: primaryEmail,
		location: t('contactDetails.mockData.location'),
		language: t('contactDetails.mockData.language'),
		initials: getContactInitials(
			contact.firstName || '',
			contact.lastName || ''
		),
		phones: contact.phoneNumbers || [],
		engagementLevel: 87,
		qualificationScore: 75,
		sentiment: { positive: 2113, neutral: 45, negative: 16 },
	};
};

const ConversationsTab = ({ contactGroupId }: { contactGroupId?: string }) => {
	return <ConversationsList contactGroupId={contactGroupId} />;
};

const ContactsTab = ({
	contactGroupId,
	campaignId,
	title,
	description,
	t,
}: {
	contactGroupId: number;
	campaignId?: number;
	title: string;
	description: string;
	t: (key: string) => string;
}) => {
	const [selectedContact, setSelectedContact] =
		useState<ContactDetailsData | null>(null);
	const [drawerOpened, setDrawerOpened] = useState(false);

	const handleContactClick = (contact: Contact) => {
		setSelectedContact(mapContactToDetails(contact, t));
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedContact(null);
	};

	return (
		<>
			<SectionCard title={title} description={description}>
				<FaultyPhonesAlert contactGroupId={contactGroupId} />
				<ContactGroupContactsTable
					contactGroupId={contactGroupId}
					campaignId={campaignId}
					onContactClick={handleContactClick}
				/>
			</SectionCard>
			<AppDrawer
				opened={drawerOpened && selectedContact !== null}
				onClose={handleCloseDrawer}
				title={title}
				description={description}
				size='lg'
			>
				{selectedContact ? <ContactDetails contact={selectedContact} /> : null}
			</AppDrawer>
		</>
	);
};

const CampaignContactListPage = () => {
	const { t } = useTranslation('campaign.contact-list');
	const navigate = useNavigate();
	const { contactGroupId, campaignId } = useParams<{
		contactGroupId: string;
		campaignId: string;
	}>();
	const { data: campaign } = useGetCampaign(`${campaignId}`);
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

	const { canAccessModule } = usePermissions();

	const canViewConversations = canAccessModule(ModuleEnum.CONVERSATIONS);
	const canViewContacts = canAccessModule(ModuleEnum.CONTACTS);

	const queueStatusConfig = contactGroupQuery.data
		? getTranslatedQueueStatus(t, contactGroupQuery.data.queueStatus)
		: null;

	const isLoading = contactGroupQuery.isLoading;
	const hasInvalidId = Number.isNaN(contactGroupIdNumber);

	const commonContainerProps = {
		showBackButton: true,
		onBackClick: () => navigate(`/campaign/view/${campaignId}`),
	};

	if (hasInvalidId) {
		return (
			<ContentContainer
				{...commonContainerProps}
				title={t('status.invalidId')}
				description={t('status.invalidIdDesc')}
			>
				<EmptyState
					icon={<IconAlertCircle size={48} />}
					message={t('status.invalidId')}
					description={
						<Text size='sm' c='dimmed' ta='center'>
							{t('status.invalidIdDesc')}
						</Text>
					}
					action={
						<Button
							variant='light'
							leftSection={<IconArrowLeft size={16} />}
							onClick={() => navigate(`/campaign/view/${campaignId}`)}
						>
							{t('status.returnToCampaign')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	if (isLoading) {
		return (
			<ContentContainer
				{...commonContainerProps}
				title={t('status.loading')}
				description={t('status.loadingDesc')}
			>
				<Flex justify='center' align='center' style={{ minHeight: '320px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	if (contactGroupQuery.isError || !contactGroupQuery.data) {
		const errorMessage = getErrorMessage(contactGroupQuery.error);

		return (
			<ContentContainer
				{...commonContainerProps}
				title={t('status.unavailable')}
				description={t('status.unavailableDesc')}
			>
				<EmptyState
					icon={<IconAlertCircle size={48} />}
					message={t('status.unableToLoad')}
					description={
						<Text size='sm' c='dimmed' ta='center'>
							{t('status.unableToLoadDesc', {
								error: errorMessage,
							})}
						</Text>
					}
					action={
						<Button
							variant='light'
							leftSection={<IconRefresh size={16} />}
							onClick={async () => {
								try {
									await contactGroupQuery.refetch();
									notifications.show({
										title: t('actions.success'),
										message: t('status.reloadSuccess'),
										color: 'green',
									});
								} catch (error) {
									notifications.show({
										title: t('actions.error'),
										message: getErrorMessage(error),
										color: 'red',
									});
								}
							}}
							loading={contactGroupQuery.isRefetching}
						>
							{t('status.tryAgain')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const breadcrumbTitle = (
		<Breadcrumbs>
			<Anchor
				size='sm'
				fw={500}
				onClick={() => navigate(`/campaign/view/${campaignId}`)}
				style={{ cursor: 'pointer' }}
			>
				{campaign ? campaign.name : t('status.unknownCampaign')}
			</Anchor>
			<Text size='sm' fw={500}>
				{contactGroupQuery.data.name}
			</Text>
		</Breadcrumbs>
	);

	return (
		<ContentContainer
			{...commonContainerProps}
			title={breadcrumbTitle}
			description={t('status.created', {
				time: timeAgo(contactGroupQuery.data.createdAt),
			})}
			titleRight={
				queueStatusConfig ? (
					<Badge color={queueStatusConfig.color} variant='light' size='sm'>
						{queueStatusConfig.label}
					</Badge>
				) : null
			}
		>
			<Tabs variant='outline' defaultValue='overview' keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='overview' leftSection={<IconInfoCircle size={16} />}>
						{t('tabs.overview')}
					</Tabs.Tab>
					{canViewConversations && (
						<Tabs.Tab
							value='conversations'
							leftSection={<IconMessage size={16} />}
						>
							{t('tabs.conversations')}
						</Tabs.Tab>
					)}
					{canViewContacts && (
						<Tabs.Tab value='contacts' leftSection={<IconUsers size={16} />}>
							{t('tabs.contacts')}
						</Tabs.Tab>
					)}
				</Tabs.List>

				<Tabs.Panel value='overview' mb='md'>
					<Stack gap='md'>
						<SectionCard
							title={t('overview.title')}
							description={t('overview.description')}
						>
							<ContactListInformation
								contactGroup={contactGroupQuery.data}
								campaignId={campaignId ? Number(campaignId) : 0}
								onReload={() => contactGroupQuery.refetch()}
							/>
						</SectionCard>
						<ContactListMetrics contactGroupId={contactGroupId} />
						<CampaignDashboardViewer
							campaignId={campaignId ? Number(campaignId) : null}
							contactGroupId={contactGroupIdNumber}
							allowLayoutEditing={false}
						/>
					</Stack>
				</Tabs.Panel>

				{canViewConversations && (
					<Tabs.Panel value='conversations' mb='md'>
						<ConversationsTab contactGroupId={contactGroupId} />
					</Tabs.Panel>
				)}

				{canViewContacts && (
					<Tabs.Panel value='contacts' mb='md'>
						<ContactsTab
							contactGroupId={contactGroupIdNumber}
							campaignId={campaignId ? Number(campaignId) : undefined}
							title={t('tabs.contacts')}
							description={t('tabs.contactsDesc')}
							t={t}
						/>
					</Tabs.Panel>
				)}
			</Tabs>
		</ContentContainer>
	);
};

export default CampaignContactListPage;
