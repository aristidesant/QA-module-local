import { useMemo } from 'react';
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
	IconListNumbers,
	IconMessage,
	IconRefresh,
	IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { useGetContactGroup } from '~/queries/contactGroupQueries';
import { useGetCampaign } from '~/queries/campaignsQueries';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { getErrorMessage } from '~/utils/httpClient';
import ContactGroupContactsTable from './ContactGroupContactsTable';
import ContactListInformation from './ContactListInformation';
import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
import ConversationsList from '~/modules/conversations/ConversationsList';
import ConversationDetailDrawer from '~/modules/conversations/ConversationDetailDrawer';
import { useConversationDrawer } from '~/modules/conversations/ConversationDetailDrawer/useConversationDrawer';
import FaultyPhonesAlert from './ContactGroupContactsTable/FaultyPhonesAlert';
import { getTranslatedQueueStatus } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactList/queueStatusConfig';
import { timeAgo } from '~/utils/dateUtils';
import QueueTab from './QueueTab';

const ConversationsTab = ({
	contactGroupId,
	onRowClick,
}: {
	contactGroupId?: string;
	onRowClick?: (conversation: { id: number }) => void;
}) => {
	return (
		<ConversationsList
			contactGroupId={contactGroupId}
			onRowClick={onRowClick}
		/>
	);
};

const ContactsTab = ({
	contactGroupId,
	campaignId,
	title,
	description,
}: {
	contactGroupId: number;
	campaignId?: number;
	title: string;
	description: string;
}) => {
	return (
		<SectionCard title={title} description={description}>
			<FaultyPhonesAlert contactGroupId={contactGroupId} />
			<ContactGroupContactsTable
				contactGroupId={contactGroupId}
				campaignId={campaignId}
			/>
		</SectionCard>
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

	const {
		selectedConversationId,
		drawerOpened,
		openConversation,
		closeDrawer,
	} = useConversationDrawer();

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
			<Tabs defaultValue='overview' keepMounted={false}>
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
					<Tabs.Tab value='queue' leftSection={<IconListNumbers size={16} />}>
						{t('tabs.queue')}
					</Tabs.Tab>
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
						<CampaignDashboardViewer
							campaignId={campaignId ? Number(campaignId) : null}
							contactGroupId={contactGroupIdNumber}
							allowLayoutEditing={false}
						/>
					</Stack>
				</Tabs.Panel>

				{canViewConversations && (
					<Tabs.Panel value='conversations' mb='md'>
						<ConversationsTab
							contactGroupId={contactGroupId}
							onRowClick={openConversation}
						/>
					</Tabs.Panel>
				)}

				{canViewContacts && (
					<Tabs.Panel value='contacts' mb='md'>
						<ContactsTab
							contactGroupId={contactGroupIdNumber}
							campaignId={campaignId ? Number(campaignId) : undefined}
							title={t('tabs.contacts')}
							description={t('tabs.contactsDesc')}
						/>
					</Tabs.Panel>
				)}

				<Tabs.Panel value='queue' mb='md'>
					<QueueTab
						contactGroupId={contactGroupIdNumber}
						campaignId={campaignId ? Number(campaignId) : 0}
					/>
				</Tabs.Panel>
			</Tabs>

			<ConversationDetailDrawer
				conversationId={selectedConversationId}
				opened={drawerOpened}
				onClose={closeDrawer}
			/>
		</ContentContainer>
	);
};

export default CampaignContactListPage;
